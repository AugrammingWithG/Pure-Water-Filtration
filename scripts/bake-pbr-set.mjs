/**
 * Bake a Poly Haven 4k EXR PBR set down to the three WebP maps the hero
 * room's surfaces use.
 *
 *   node scripts/bake-pbr-set.mjs <set> [size]
 *
 * where <set> is a key of SETS below (`stucco` for the wall, `floor` for the
 * tiles) and size defaults to 1024.
 *
 * Both sources are CC0 from Poly Haven — white_stucco
 * (https://polyhaven.com/a/white_stucco) and brown_floor_tiles
 * (https://polyhaven.com/a/brown_floor_tiles) — seven 4096² EXRs each,
 * ~90 MB a set. A surface wants three of them, and none at anything like
 * that size: the stucco tile covers 2 m of wall and the hero shows about
 * 4.5 m of it across ~1400 px, so a 1k tile is already at texel density on
 * a 1.5-dpr screen; the floor tile covers 1.7 m and is seen foreshortened,
 * so the same holds. Each map is box-filtered down (4×4 texels per output
 * texel at 1k — an exact average, no ringing) and written as an 8-bit WebP:
 *
 *  - diff → *-diff.webp, sRGB-encoded so it can be read back as a colour
 *    map (`colorSpace = SRGBColorSpace`).
 *  - nor_gl → *-nor.webp, kept linear and renormalised after the filter
 *    (averaging unit vectors shortens them). OpenGL convention, which is
 *    what three expects; the _dx file is the same map with Y flipped.
 *  - arm → *-arm.webp, kept linear. Three reads aoMap from R, roughnessMap
 *    from G and metalnessMap from B, which is exactly Poly Haven's ARM
 *    packing, so one texture serves all three slots.
 *
 * disp is left out: displacement on a flat plane buys nothing the normal
 * map doesn't, and would need the plane tessellated. ao and rough are the
 * R and G channels of arm and aren't needed on their own.
 *
 * WebP is lossy at the qualities used; on stucco (already noise) and worn
 * terracotta the artefacts are invisible, and the normal map gets the
 * higher quality because it is the one place blocking would show as a
 * lighting seam — on the floor, along the grout lines.
 *
 * Decoding is three's own EXRLoader (pure JS, handles the DWAA
 * compression these files use); encoding is sharp, already a devDependency.
 * ~40 s for the three maps, all of it in the EXR decode.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { FloatType } from 'three'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'

const SETS = {
  stucco: {
    sourceDir: 'textures-src/white-stucco',
    outDir: 'src/assets/textures/stucco',
    prefix: 'white_stucco',
    out: 'white-stucco',
  },
  floor: {
    sourceDir: 'textures-src/floor',
    outDir: 'src/assets/textures/floor',
    prefix: 'brown_floor_tiles',
    out: 'brown-floor-tiles',
  },
}

const [setName, sizeArg = '1024'] = process.argv.slice(2)
const set = SETS[setName]
if (!set) {
  console.error(`usage: node scripts/bake-pbr-set.mjs <${Object.keys(SETS).join('|')}> [size]`)
  process.exit(1)
}
const { sourceDir, outDir, prefix, out } = set
const SIZE = Number(sizeArg)

const MAPS = [
  { file: `${prefix}_diff_4k.exr`, out: `${out}-diff.webp`, srgb: true, normal: false, quality: 86 },
  { file: `${prefix}_nor_gl_4k.exr`, out: `${out}-nor.webp`, srgb: false, normal: true, quality: 92 },
  { file: `${prefix}_arm_4k.exr`, out: `${out}-arm.webp`, srgb: false, normal: false, quality: 86 },
]

function decode(file) {
  const loader = new EXRLoader()
  loader.type = FloatType
  const buf = fs.readFileSync(file)
  const tex = loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  /* three returns RGBA for 4-channel files and RGB otherwise */
  const channels = tex.data.length / (tex.width * tex.height)
  return { width: tex.width, height: tex.height, channels, data: tex.data }
}

/** Box filter to size × size, dropping alpha. Returns Float32 RGB. */
function downsample({ width, height, channels, data }, size) {
  if (width !== height || width % size !== 0) throw new Error(`${width}×${height} does not divide into ${size}`)
  const f = width / size
  const inv = 1 / (f * f)
  const out = new Float32Array(size * size * 3)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0
      for (let dy = 0; dy < f; dy++) {
        let i = ((y * f + dy) * width + x * f) * channels
        for (let dx = 0; dx < f; dx++, i += channels) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
      }
      const o = (y * size + x) * 3
      out[o] = r * inv
      out[o + 1] = g * inv
      out[o + 2] = b * inv
    }
  }
  return out
}

/** Averaged normals come out short; put them back on the unit sphere. */
function renormalise(rgb) {
  for (let i = 0; i < rgb.length; i += 3) {
    const x = rgb[i] * 2 - 1
    const y = rgb[i + 1] * 2 - 1
    const z = rgb[i + 2] * 2 - 1
    const len = Math.hypot(x, y, z) || 1
    rgb[i] = (x / len) * 0.5 + 0.5
    rgb[i + 1] = (y / len) * 0.5 + 0.5
    rgb[i + 2] = (z / len) * 0.5 + 0.5
  }
  return rgb
}

/** The sRGB transfer function (the piecewise one, not a plain gamma). */
function linearToSrgb(v) {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

function quantise(rgb, srgb) {
  const out = new Uint8Array(rgb.length)
  for (let i = 0; i < rgb.length; i++) {
    let v = rgb[i]
    if (srgb) v = linearToSrgb(v)
    out[i] = Math.max(0, Math.min(255, Math.round(v * 255)))
  }
  return out
}

fs.mkdirSync(outDir, { recursive: true })
let total = 0
for (const map of MAPS) {
  const t0 = Date.now()
  const src = path.join(sourceDir, map.file)
  const exr = decode(src)
  let rgb = downsample(exr, SIZE)
  if (map.normal) rgb = renormalise(rgb)
  const pixels = quantise(rgb, map.srgb)
  const dest = path.join(outDir, map.out)
  await sharp(Buffer.from(pixels.buffer), { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .webp({ quality: map.quality, effort: 6, smartSubsample: false })
    .toFile(dest)
  const bytes = fs.statSync(dest).size
  total += bytes
  console.log(`${map.file} → ${dest}  ${(bytes / 1024).toFixed(0)} KB  (${((Date.now() - t0) / 1000).toFixed(1)} s)`)
}
console.log(`total ${(total / 1024).toFixed(0)} KB`)
