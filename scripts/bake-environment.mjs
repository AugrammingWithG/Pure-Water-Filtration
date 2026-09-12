/**
 * Bake the scene's environment map from a full-size HDRI.
 *
 *   node scripts/bake-environment.mjs <source.hdr> [out.hdr] [width]
 *
 * Does offline what <SceneEnvironment> used to do on the GPU at every page
 * load: clamp the sun disc to SUN_CLAMP (so the directional light stays the
 * only thing casting the sun) and resample the map down to `width` × width/2.
 * PMREM builds a cube of (width / 4) px per face, so 1024 gives the usual
 * 256 — the 4k source only bought a 1024-px cube nobody could see at the
 * roughnesses in use, and cost 28 MB per visit to download and decode.
 *
 * The clamp happens at source resolution, then a box filter resamples, so the
 * disc keeps its energy (~6 000 px·lum at 1k) instead of the aliased blob a
 * point-sampled downscale gives. The script prints where the brightest pixel
 * landed so it can be checked against HDR_SUN in SceneEnvironment.jsx.
 *
 * The shipped map, src/assets/textures/env/je_gray_02_1k.jpg, is the output
 * of this script for Poly Haven's je_gray_02 (4k, CC0,
 * https://polyhaven.com/a/je_gray_02) converted to an UltraHDR JPEG — a JPEG
 * plus a gain map, which three's UltraHDRLoader turns back into half floats —
 * with MONOGRID's Gain Map Creator, https://gainmap-creator.monogrid.com/:
 * JPEG, quality 0.95, linear tone mapping, gamma 1, min content boost 1,
 * max content boost = the texture's max. 270 KB against 1.8 MB as RGBE, and
 * every band of the map within 0.5 % of the RGBE energy. The RGBE this
 * script writes is the intermediate; don't commit it.
 *
 * Re-run both steps if the source or SUN_CLAMP changes.
 *
 * Only Radiance RGBE (.hdr) in, flat or new-style RLE; RLE out. No deps.
 */
import fs from 'node:fs'
import path from 'node:path'

/** In the file's own units; the reasoning is in SceneEnvironment.jsx. */
const SUN_CLAMP = 2000

// ---------------------------------------------------------------------------
// RGBE in
// ---------------------------------------------------------------------------

function readHdr(buffer) {
  let pos = 0
  const readLine = () => {
    let end = pos
    while (end < buffer.length && buffer[end] !== 0x0a) end++
    const line = buffer.toString('latin1', pos, end)
    pos = end + 1
    return line
  }

  const magic = readLine()
  if (!magic.startsWith('#?')) throw new Error('not a Radiance HDR file')
  let format = null
  for (;;) {
    const line = readLine()
    if (line === '') break
    if (line.startsWith('FORMAT=')) format = line.slice(7)
  }
  if (format !== '32-bit_rle_rgbe') throw new Error(`unsupported FORMAT ${format}`)
  const res = /^-Y (\d+) \+X (\d+)$/.exec(readLine())
  if (!res) throw new Error('only -Y +X orientation is supported')
  const height = Number(res[1])
  const width = Number(res[2])

  const rgbe = new Uint8Array(width * height * 4)
  const rle = width >= 8 && width < 0x8000 && buffer[pos] === 2 && buffer[pos + 1] === 2 && !(buffer[pos + 2] & 0x80)

  if (!rle) {
    rgbe.set(buffer.subarray(pos, pos + rgbe.length))
    return { width, height, rgbe }
  }

  const scan = new Uint8Array(width * 4)
  for (let y = 0; y < height; y++) {
    if (buffer[pos] !== 2 || buffer[pos + 1] !== 2 || ((buffer[pos + 2] << 8) | buffer[pos + 3]) !== width) {
      throw new Error(`bad scanline header at row ${y}`)
    }
    pos += 4
    for (let c = 0; c < 4; c++) {
      let x = 0
      while (x < width) {
        let count = buffer[pos++]
        if (count > 128) {
          count -= 128
          const value = buffer[pos++]
          scan.fill(value, c * width + x, c * width + x + count)
        } else {
          scan.set(buffer.subarray(pos, pos + count), c * width + x)
          pos += count
        }
        x += count
      }
    }
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      rgbe[row + x * 4] = scan[x]
      rgbe[row + x * 4 + 1] = scan[width + x]
      rgbe[row + x * 4 + 2] = scan[width * 2 + x]
      rgbe[row + x * 4 + 3] = scan[width * 3 + x]
    }
  }
  return { width, height, rgbe }
}

/** Radiance's colr_color: (v + 0.5) · 2^(e − 136). */
function rgbeToFloat({ width, height, rgbe }) {
  const out = new Float32Array(width * height * 3)
  for (let i = 0, j = 0; i < rgbe.length; i += 4, j += 3) {
    const e = rgbe[i + 3]
    if (e === 0) continue
    const f = 2 ** (e - 136)
    out[j] = (rgbe[i] + 0.5) * f
    out[j + 1] = (rgbe[i + 1] + 0.5) * f
    out[j + 2] = (rgbe[i + 2] + 0.5) * f
  }
  return out
}

// ---------------------------------------------------------------------------
// Conditioning
// ---------------------------------------------------------------------------

const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

/** Scale any pixel brighter than maxLum down to it, keeping its hue. */
function clampLuminance(rgb, maxLum) {
  let clamped = 0
  let peak = 0
  for (let i = 0; i < rgb.length; i += 3) {
    const l = luminance(rgb[i], rgb[i + 1], rgb[i + 2])
    if (l > peak) peak = l
    if (l > maxLum) {
      const k = maxLum / l
      rgb[i] *= k
      rgb[i + 1] *= k
      rgb[i + 2] *= k
      clamped++
    }
  }
  return { clamped, peak }
}

/** Box-filter to an integer fraction of the size. */
function downsample(rgb, width, height, factor) {
  const w = width / factor
  const h = height / factor
  if (!Number.isInteger(w) || !Number.isInteger(h)) throw new Error('size must divide evenly')
  const out = new Float32Array(w * h * 3)
  const inv = 1 / (factor * factor)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0
      let g = 0
      let b = 0
      for (let dy = 0; dy < factor; dy++) {
        let i = ((y * factor + dy) * width + x * factor) * 3
        for (let dx = 0; dx < factor; dx++, i += 3) {
          r += rgb[i]
          g += rgb[i + 1]
          b += rgb[i + 2]
        }
      }
      const o = (y * w + x) * 3
      out[o] = r * inv
      out[o + 1] = g * inv
      out[o + 2] = b * inv
    }
  }
  return { rgb: out, width: w, height: h }
}

// ---------------------------------------------------------------------------
// RGBE out
// ---------------------------------------------------------------------------

/** Radiance's setcolr: shared exponent from the largest channel. */
function floatToRgbe(r, g, b, out, o) {
  const v = Math.max(r, g, b)
  if (v < 1e-32) {
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0
    return
  }
  let e = Math.floor(Math.log2(v)) + 1
  let m = v / 2 ** e
  if (m >= 1) {
    m /= 2
    e += 1
  } else if (m < 0.5) {
    m *= 2
    e -= 1
  }
  const scale = (m * 256) / v
  out[o] = Math.min(255, Math.floor(r * scale))
  out[o + 1] = Math.min(255, Math.floor(g * scale))
  out[o + 2] = Math.min(255, Math.floor(b * scale))
  out[o + 3] = e + 128
}

/** Radiance's fwritecolrs: runs of 4+ as (128 + n) · byte, the rest literal. */
function encodeChannel(bytes, chunks) {
  const MINRUN = 4
  const n = bytes.length
  let i = 0
  while (i < n) {
    // find the next run of at least MINRUN
    let runStart = i
    let runLen = 0
    while (runStart < n) {
      runLen = 1
      while (runLen < 127 && runStart + runLen < n && bytes[runStart + runLen] === bytes[runStart]) runLen++
      if (runLen >= MINRUN) break
      runStart += runLen
    }
    if (runStart >= n) runLen = 0
    // literals up to the run, in chunks of at most 128
    let lit = i
    while (lit < runStart) {
      const len = Math.min(128, runStart - lit)
      chunks.push(Buffer.from([len]), Buffer.from(bytes.subarray(lit, lit + len)))
      lit += len
    }
    i = runStart
    if (runLen >= MINRUN) {
      chunks.push(Buffer.from([128 + runLen, bytes[runStart]]))
      i += runLen
    }
  }
}

function writeHdr(rgb, width, height) {
  const chunks = [Buffer.from(`#?RADIANCE\n# baked by scripts/bake-environment.mjs\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`, 'latin1')]
  const pixel = new Uint8Array(4)
  const planes = [0, 1, 2, 3].map(() => new Uint8Array(width))
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      floatToRgbe(rgb[i], rgb[i + 1], rgb[i + 2], pixel, 0)
      for (let c = 0; c < 4; c++) planes[c][x] = pixel[c]
    }
    chunks.push(Buffer.from([2, 2, width >> 8, width & 0xff]))
    for (const plane of planes) encodeChannel(plane, chunks)
  }
  return Buffer.concat(chunks)
}

// ---------------------------------------------------------------------------

const [srcPath, outPath = 'je_gray_02_1k_clamped.hdr', outWidth = '1024'] = process.argv.slice(2)
if (!srcPath) {
  console.error('usage: node scripts/bake-environment.mjs <source.hdr> [out.hdr] [width]')
  process.exit(1)
}

const src = readHdr(fs.readFileSync(srcPath))
const factor = src.width / Number(outWidth)
if (!Number.isInteger(factor) || factor < 1) throw new Error(`${outWidth} must divide ${src.width}`)

const rgb = rgbeToFloat(src)
const { clamped, peak } = clampLuminance(rgb, SUN_CLAMP)
const small = downsample(rgb, src.width, src.height, factor)

// where the sun ended up, for checking against HDR_SUN
let best = 0
let bestI = 0
for (let i = 0; i < small.rgb.length; i += 3) {
  const l = luminance(small.rgb[i], small.rgb[i + 1], small.rgb[i + 2])
  if (l > best) {
    best = l
    bestI = i / 3
  }
}
const u = ((bestI % small.width) + 0.5) / small.width
const v = 1 - (Math.floor(bestI / small.width) + 0.5) / small.height
const elevation = (v - 0.5) * 180
const azimuth = (u - 0.5) * 360

const out = writeHdr(small.rgb, small.width, small.height)
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, out)

console.log(`${srcPath}: ${src.width}×${src.height}, peak luminance ${peak.toFixed(0)}, ${clamped} px clamped to ${SUN_CLAMP}`)
console.log(`${outPath}: ${small.width}×${small.height}, ${(out.length / 1024).toFixed(0)} KB (raw would be ${((small.width * small.height * 4) / 1024).toFixed(0)} KB)`)
console.log(`brightest pixel after bake: ${best.toFixed(0)} at elevation ${elevation.toFixed(1)}°, azimuth ${azimuth.toFixed(1)}° (u ${u.toFixed(3)}, v ${v.toFixed(3)})`)
