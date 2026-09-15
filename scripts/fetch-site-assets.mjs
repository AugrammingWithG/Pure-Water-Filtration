/**
 * Pull the client's own brand assets and photography off purewaterfiltration.com.au
 * and write web-sized copies into src/site/assets/.
 *
 *   node scripts/fetch-site-assets.mjs        (or: npm run assets:fetch)
 *
 * The originals are 1–2 MP phone photos at 100–660 KB each. The page shows
 * them in 300–600 px slots, so every photo is capped to a longest side and
 * re-encoded as WebP; PNGs with alpha keep it. Nothing raw is committed and
 * nothing is hand-edited, so re-running this is the whole pipeline.
 *
 * Several installation photos carry a job-tracking stamp from the installer's
 * app in the bottom-left corner; `trimBottom` cuts that strip off before the
 * resize. Photos with a third-party watermark anywhere else are not in the
 * list at all. The SVGs are copied as-is (the white logo is a PNG wrapped in
 * an <svg>, at 3.7 KB not worth touching).
 *
 * Needs Node 18+ for fetch() and the `sharp` devDependency.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGIN = 'https://purewaterfiltration.com.au'
const OUT = path.resolve('src/site/assets')

/** {src, out, max (longest side px), trimBottom (fraction), alpha} */
const ASSETS = [
  // brand
  { src: '/logo.jpg', out: 'brand/logo.webp', max: 550 },
  { src: '/logo-white.svg', out: 'brand/logo-white.svg' },
  { src: '/humm-logo.svg', out: 'brand/humm-logo.svg' },
  { src: '/icon.png', out: '../../../public/favicon.png', max: 64, alpha: true, png: true },
  { src: '/images/pricing-guide-mockup.png', out: 'brand/pricing-guide.webp', max: 1000, alpha: true },

  // the three systems, for the service cards and the spec sheet
  {
    src: '/images/whole-house-water-filtration-system-australia.jpg',
    out: 'photos/whole-house.webp',
    max: 1200,
  },
  { src: '/images/under-sink-water-filter-system-australia.jpg', out: 'photos/under-sink.webp', max: 1000 },
  {
    src: '/images/rainwater-filter-installation-australia-03.webp',
    out: 'photos/rainwater.webp',
    max: 1000,
    trimBottom: 0.06,
  },

  // real installs, for the gallery strip
  { src: '/images/whole-house-water-filter-installed-perth-01.jpg', out: 'photos/install-perth-01.webp', max: 900 },
  { src: '/images/whole-house-water-filter-installed-perth-02.jpg', out: 'photos/install-perth-02.webp', max: 900 },
  { src: '/images/whole-house-water-filter-installed-perth-03.jpg', out: 'photos/install-perth-03.webp', max: 900 },
  {
    src: '/images/whole-house-water-filter-installation-australia.webp',
    out: 'photos/install-whole-house-brick.webp',
    max: 900,
  },
  {
    src: '/images/rainwater-filter-installation-australia-02.webp',
    out: 'photos/install-rainwater-02.webp',
    max: 900,
    trimBottom: 0.06,
  },
  {
    src: '/images/under-sink-water-filter-installation-australia-03.jpg',
    out: 'photos/install-under-sink-03.webp',
    max: 900,
    trimBottom: 0.05,
  },
]

async function fetchBytes(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function processOne(asset) {
  const url = ORIGIN + asset.src
  const outPath = path.join(OUT, asset.out)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  const input = await fetchBytes(url)

  if (asset.out.endsWith('.svg')) {
    await fs.writeFile(outPath, input)
    return { outPath, bytes: input.length }
  }

  let image = sharp(input).rotate() // honour EXIF orientation from phone photos
  const meta = await image.metadata()
  if (asset.trimBottom) {
    const height = Math.round(meta.height * (1 - asset.trimBottom))
    image = image.extract({ left: 0, top: 0, width: meta.width, height })
  }
  image = image.resize({ width: asset.max, height: asset.max, fit: 'inside', withoutEnlargement: true })
  if (asset.png) image = image.png({ compressionLevel: 9 })
  else if (asset.alpha) image = image.webp({ quality: 82, alphaQuality: 90 })
  else image = image.flatten({ background: '#ffffff' }).webp({ quality: 80 })

  const out = await image.toBuffer()
  await fs.writeFile(outPath, out)
  return { outPath, bytes: out.length }
}

let failed = 0
for (const asset of ASSETS) {
  try {
    const { outPath, bytes } = await processOne(asset)
    console.log(`${(bytes / 1024).toFixed(0).padStart(5)} KB  ${path.relative(process.cwd(), outPath)}`)
  } catch (err) {
    failed += 1
    console.error(`FAILED ${asset.src}: ${err.message}`)
  }
}
if (failed) process.exit(1)
