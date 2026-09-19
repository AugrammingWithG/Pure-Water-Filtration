/**
 * Pull the client's own brand assets and photography off purewaterfiltration.com.au
 * and write web-sized copies into the repo.
 *
 *   node scripts/fetch-site-assets.mjs        (or: npm run assets:fetch)
 *
 * The originals are 1–2 MP phone photos at 100–660 KB each. The page shows
 * them in 300–600 px slots, so every photo is capped to a longest side and
 * re-encoded as WebP; PNGs with alpha keep it. Nothing raw is committed and
 * nothing is hand-edited, so re-running this is the whole pipeline.
 *
 * Two destinations, because the site is mid-replacement (see AppRouter.jsx):
 *
 *   SITE  src/site/assets/      the original 14, exactly as they were — the
 *                               marketing page at #/site still imports these
 *                               by name, and it keeps working until deleted.
 *   LIB   public/images/        the client's full photo library, every usable
 *                               image on their site, named for what it shows
 *                               rather than for search engines. This is the
 *                               set the rebuilt page draws from.
 *
 * The overlap between the two is deliberate: the rebuilt page gets a complete,
 * self-contained set so that deleting src/site/ later takes nothing with it.
 *
 * The library sits in public/ rather than being imported through the bundler,
 * which is a real trade: these filenames are not content-hashed, so a swapped
 * photo keeping its name can sit in a browser cache, and a typo'd path fails
 * at runtime instead of at build. What it buys is that the client can hand
 * over a replacement photo and it drops in under the same name with no code
 * change and no rebuild — which is how the whole library is expected to move
 * while the rebuild is in progress. Read them through `img()` in
 * src/proposal/assets.js, never as a bare "/images/..." string: the GitHub
 * Pages build is served under a base path and a root-relative URL 404s there.
 *
 * Several installation photos carry a job-tracking stamp from the installer's
 * app in the bottom-left corner; `trimBottom` cuts that strip off before the
 * resize. It is set per photo series — where one photo in a numbered run was
 * known to be stamped, the rest of that run is trimmed too, which costs a few
 * per cent of a photo that turns out to be clean and saves shipping a stamped
 * one. THE LIBRARY PHOTOS HAVE NOT BEEN EYEBALLED: the original 14 were
 * hand-checked and anything carrying a third-party watermark was left out, but
 * the 30-odd added since were pulled wholesale off the sitemap. Look at the
 * contact sheet before any of them goes in front of the client.
 *
 * Needs Node 18+ for fetch() and the `sharp` devDependency.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGIN = 'https://purewaterfiltration.com.au'
const SITE = path.resolve('src/site/assets')
const LIB = path.resolve('public/images')
const VID = path.resolve('public/videos')
const PUB = path.resolve('public')

/** {src, out, root, max (longest side px), trimBottom (fraction), alpha} */
const ASSETS = [
  // brand
  { src: '/logo.jpg', out: 'brand/logo.webp', max: 550 },
  { src: '/logo-white.svg', out: 'brand/logo-white.svg' },
  { src: '/humm-logo.svg', out: 'brand/humm-logo.svg' },
  /* Favicons. The client's mark is a blue droplet on transparency — legible
   * at 16px and readable on a light or a dark tab strip, so the alpha is kept
   * rather than flattened onto a square that would box it in.
   *
   * Three sizes, because one never covers it: 32 is what a tab actually draws
   * and hand-tuning the downscale there beats letting the browser squeeze 512
   * into it; 512 serves bookmarks, the Android home screen and anything that
   * wants to scale up. The old single 64px file was too small for the second
   * job and not sharp enough for the first.
   *
   * The Apple icon is the exception: iOS composites a transparent touch icon
   * onto BLACK, which would put this blue droplet on a black tile nobody
   * chose. It gets flattened onto white, which is the brand's own background.
   */
  { src: '/icon.png', out: 'favicon.png', root: PUB, max: 512, alpha: true, png: true },
  { src: '/icon.png', out: 'favicon-32.png', root: PUB, max: 32, alpha: true, png: true },
  { src: '/apple-icon.png', out: 'apple-touch-icon.png', root: PUB, max: 180, png: true, flatten: '#ffffff' },
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

  /* ---------------------------------------------------------------------
   * LIB — the client's full photo library, for the rebuilt page.
   *
   * Names say what the photo shows. The source names are SEO strings
   * ("...-australia", "...-system-australian-home-02") and carry that cost
   * into every import that uses them; these do not.
   *
   * `max` is 1400 for anything that might run full-bleed or fill a hero,
   * 1000 for card and grid slots. Portrait phone photos keep their height —
   * `fit: 'inside'` caps the longest side, so a 960x1440 at max 1000 comes
   * back 667x1000.
   * ------------------------------------------------------------------- */

  // whole house
  { src: '/images/whole-house-water-filtration-system-australia.jpg', out: 'whole-house-unit.webp', root: LIB, max: 1400 },
  { src: '/images/whole-house-water-filter-unit-installed-perth.jpg', out: 'whole-house-installed-perth.webp', root: LIB, max: 1400 },
  { src: '/images/whole-house-water-filtration-system-home-perth.jpg', out: 'whole-house-home-perth.webp', root: LIB, max: 1400 },
  { src: '/images/whole-house-water-filter-installation-australia.webp', out: 'whole-house-brick-wall.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filter-installed-perth-01.jpg', out: 'whole-house-perth-01.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filter-installed-perth-02.jpg', out: 'whole-house-perth-02.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filter-installed-perth-03.jpg', out: 'whole-house-perth-03.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filter-installed-perth-04.jpg', out: 'whole-house-perth-04.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filter-installed-perth-05.jpg', out: 'whole-house-perth-05.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filtration-system-australian-home-01.jpg', out: 'whole-house-home-01.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filtration-system-australian-home-02.jpg', out: 'whole-house-home-02.webp', root: LIB, max: 1000 },
  { src: '/images/whole-house-water-filtration-system-australian-home-03.jpg', out: 'whole-house-home-03.webp', root: LIB, max: 1000 },

  // under sink
  { src: '/images/under-sink-water-filter-system-australia.jpg', out: 'under-sink-unit.webp', root: LIB, max: 1000 },
  { src: '/images/under-sink-reverse-osmosis-water-filter-australia.webp', out: 'under-sink-reverse-osmosis.webp', root: LIB, max: 1400 },
  { src: '/images/under-sink-water-filter-installation-australia-01.jpg', out: 'under-sink-install-01.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/under-sink-water-filter-installation-australia-02.jpg', out: 'under-sink-install-02.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/under-sink-water-filter-installation-australia-03.jpg', out: 'under-sink-install-03.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/under-sink-water-filter-installation-australia-04.jpg', out: 'under-sink-install-04.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/under-sink-water-filter-installation-australia-05.jpg', out: 'under-sink-install-05.webp', root: LIB, max: 1000, trimBottom: 0.05 },

  // rainwater
  { src: '/images/rainwater-uv-filtration-system-australia.jpg', out: 'rainwater-uv-unit.webp', root: LIB, max: 1000 },
  { src: '/images/rainwater-tank-filtration-system-australia.jpg', out: 'rainwater-tank.webp', root: LIB, max: 1400 },
  { src: '/images/three-stage-rainwater-filter-system-australia.webp', out: 'rainwater-three-stage.webp', root: LIB, max: 1000 },
  { src: '/images/uv-rainwater-filtration-stage-australia.jpg', out: 'rainwater-uv-stage.webp', root: LIB, max: 1000 },
  { src: '/images/rainwater-filter-installation-australia-01.webp', out: 'rainwater-install-01.webp', root: LIB, max: 1000, trimBottom: 0.06 },
  { src: '/images/rainwater-filter-installation-australia-02.webp', out: 'rainwater-install-02.webp', root: LIB, max: 1000, trimBottom: 0.06 },
  { src: '/images/rainwater-filter-installation-australia-03.webp', out: 'rainwater-install-03.webp', root: LIB, max: 1000, trimBottom: 0.06 },
  { src: '/images/rainwater-filter-installation-australia-04.webp', out: 'rainwater-install-04.webp', root: LIB, max: 1000, trimBottom: 0.06 },
  { src: '/images/rainwater-filter-installation-australia-05.webp', out: 'rainwater-install-05.webp', root: LIB, max: 1000, trimBottom: 0.06 },
  { src: '/images/rainwater-uv-filter-installed-australia-01.jpg', out: 'rainwater-uv-install-01.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/rainwater-uv-filter-installed-australia-02.jpg', out: 'rainwater-uv-install-02.webp', root: LIB, max: 1000, trimBottom: 0.05 },
  { src: '/images/rainwater-uv-filter-installed-australia-03.jpg', out: 'rainwater-uv-install-03.webp', root: LIB, max: 1000, trimBottom: 0.05 },

  // cartridges and servicing
  { src: '/images/multi-stage-water-filter-cartridges-australia.jpg', out: 'cartridges-multi-stage.webp', root: LIB, max: 1000 },
  { src: '/images/water-filter-replacement-cartridge-australia.jpg', out: 'cartridge-replacement.webp', root: LIB, max: 1000 },
  { src: '/images/water-filter-replacement-cartridges-australia-01.jpg', out: 'cartridges-replacement-01.webp', root: LIB, max: 1000 },
  { src: '/images/water-filter-replacement-cartridges-australia-02.jpg', out: 'cartridges-replacement-02.webp', root: LIB, max: 1000 },

  // water itself — the only non-product photography they have, for bands and bleeds
  { src: '/images/filtered-water-flowing-from-tap-australia.jpg', out: 'water-from-tap.webp', root: LIB, max: 1400 },
  { src: '/images/clean-filtered-water-glass-australia.jpg', out: 'water-glass-clean.webp', root: LIB, max: 1400 },
  { src: '/images/pure-drinking-water-glass-australia.jpg', out: 'water-glass-pouring.webp', root: LIB, max: 1400 },

  // The filter-change guide is a 3188x1784 poster of small type, not a photo:
  // it is only worth having if it stays readable, so it keeps its width and
  // its lossless encode. Nothing uses it yet.
  { src: '/images/filter-change-guide-poster.png', out: 'filter-change-guide.webp', root: LIB, max: 2000 },

  /* ---------------------------------------------------------------------
   * VID — the client's own films, copied byte for byte.
   *
   * These are not re-encoded. sharp does not do video, and re-encoding
   * without being able to watch the result is how a film arrives at the
   * customer softer than the client shipped it. They are already web-sized
   * (1.4–1.6 MB), so the only thing a transcode would buy here is risk.
   *
   * `why-choose-us.mp4` is the film the proposal's benefits section plays.
   * Its poster is the client's own choice of frame, already pulled above as
   * `under-sink-install-04.webp` — kept in step deliberately, so swapping the
   * film means swapping one row here and one line in Benefits.jsx.
   *
   * Two more exist on the site and are not pulled, because nothing uses them
   * yet: `/videos/hero-bg.mp4` (the homepage's muted background loop) and
   * `/videos/filter-change-guide-v2.mp4` (the servicing walkthrough).
   * ------------------------------------------------------------------- */
  { src: '/videos/why-choose-us.mp4', out: 'why-choose-us.mp4', root: VID, copy: true },
]

async function fetchBytes(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function processOne(asset) {
  const url = ORIGIN + asset.src
  const outPath = path.join(asset.root ?? SITE, asset.out)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  const input = await fetchBytes(url)

  /* Straight through, no sharp: vectors would be rasterised and video is not
     something sharp can open at all. */
  if (asset.copy || asset.out.endsWith('.svg')) {
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
  if (asset.flatten) image = image.flatten({ background: asset.flatten })
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
