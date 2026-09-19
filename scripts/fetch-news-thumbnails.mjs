/**
 * Pull the published thumbnail for each story in the proposal's "Have you heard
 * the news?" section into public/images/news/.
 *
 *   node scripts/fetch-news-thumbnails.mjs      (or: npm run news:fetch)
 *
 * Deliberately separate from fetch-site-assets.mjs. That script pulls the
 * CLIENT'S OWN photography off their site, which they own and can use freely.
 * These are third-party press images belonging to the ABC, Nine and Seven, and
 * the rights position is completely different — see the note at the bottom.
 *
 * Each entry below was verified by fetching the story and reading its Open
 * Graph tags: `headline` is the outlet's own og:title, `outlet` is who
 * published it, and `image` is the og:image they serve. Nothing here is
 * transcribed by eye or inferred from a thumbnail, which is what the first pass
 * at this section did. `url` is in the data so any claim on the page can be
 * checked against the source in one click.
 *
 * The ABC's og:image carries `impolicy=wcms_watermark_news`, which is the ABC
 * News watermark burnt into the frame by their CDN. That parameter is left on
 * the URL on purpose: stripping a publisher's own attribution mark off their
 * image while republishing it is not something this script should do quietly.
 *
 * ---------------------------------------------------------------------------
 * RIGHTS — NOT CLEARED. These images are not licensed to Pure Water
 * Filtration. Fetching them makes the section accurate rather than invented,
 * which is the bar for showing it internally; it does not make it publishable.
 * Before this goes to a customer, either the client clears each image with the
 * outlet, or the cards drop the image and run as headline-plus-link, which
 * needs no licence. That call is the client's, not this repo's.
 * ---------------------------------------------------------------------------
 *
 * Needs Node 18+ for fetch() and the `sharp` devDependency.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve('public/images/news')

/** {out, outlet, headline, url, image} — headline/image read from the story's og: tags */
const STORIES = [
  {
    out: 'news-01-cancer-causing-chemicals.webp',
    outlet: '9News',
    headline: "Potential cancer-causing chemicals found in Australia's tap water",
    url: 'https://www.youtube.com/watch?v=B3DUacSu3l0',
    image: 'https://i.ytimg.com/vi/B3DUacSu3l0/maxresdefault.jpg',
  },
  {
    out: 'news-02-sydney-forever-chemicals.webp',
    outlet: '9News',
    headline: "New 'forever chemicals' discovered in Sydney tap water",
    url: 'https://www.youtube.com/watch?v=PbRgMbI97Fw',
    image: 'https://i.ytimg.com/vi/PbRgMbI97Fw/maxresdefault.jpg',
  },
  {
    out: 'news-03-melbourne-contamination-warning.webp',
    outlet: '7NEWS',
    headline: 'Urgent water contamination warning for Melbourne homes',
    url: 'https://www.youtube.com/watch?v=VYVPAQRt2vs',
    image: 'https://i.ytimg.com/vi/VYVPAQRt2vs/maxresdefault.jpg',
  },
  {
    out: 'news-04-water-drained-forever-chemicals.webp',
    outlet: '7NEWS',
    headline: "Drinking water drained over fears it may be contaminated with 'forever chemicals'",
    url: 'https://www.youtube.com/watch?v=3FV7e7u7se0',
    image: 'https://i.ytimg.com/vi/3FV7e7u7se0/hqdefault.jpg',
  },
  {
    out: 'news-05-fertility-link.webp',
    outlet: '7NEWS',
    headline: 'Tap water chemicals linked to fertility issues',
    url: 'https://www.youtube.com/watch?v=jvE-saIkUi4',
    image: 'https://i.ytimg.com/vi/jvE-saIkUi4/maxresdefault.jpg',
  },
  {
    out: 'news-06-sydney-pfas-detected.webp',
    outlet: 'ABC News',
    headline: "Cancer-linked 'forever chemicals' PFAS detected in Sydney drinking water samples",
    url: 'https://www.abc.net.au/news/2024-08-20/australia-forever-chemicals-pfas-drinking-water-platypus/104244072',
    image:
      'https://live-production.wcms.abc-cdn.net.au/261f8c53e916d4568048fc3c248b0404?impolicy=wcms_watermark_news&cropH=1152&cropW=2048&xPos=0&yPos=192&width=862&height=485&imformat=generic',
  },
  {
    out: 'news-07-undrinkable-town.webp',
    outlet: 'ABC News',
    headline: 'The Australian town with undrinkable, salty and corrosive tap water',
    url: 'https://www.abc.net.au/news/2024-03-12/quorn-tap-water-breaches-taste-guidelines-south-australia/103524088',
    image:
      'https://live-production.wcms.abc-cdn.net.au/f5aa5da96ba31570cab4fefa74d42ccf?impolicy=wcms_watermark_news&cropH=3375&cropW=6000&xPos=0&yPos=313&width=862&height=485&imformat=generic',
  },
  {
    out: 'news-08-bullsbrook-bottled-water.webp',
    outlet: 'ABC News',
    headline: 'Residents living off bottled water due to PFAS contamination',
    url: 'https://www.abc.net.au/news/2024-10-12/bullsbrook-pfas-contaminated-water-solution-promised-by-defence/104463670',
    image:
      'https://live-production.wcms.abc-cdn.net.au/f83d839412f18924af3ba2d0be2392a5?impolicy=wcms_watermark_news&cropH=832&cropW=1479&xPos=0&yPos=38&width=862&height=485&imformat=generic',
  },
]

let failed = 0
await fs.mkdir(OUT, { recursive: true })

for (const story of STORIES) {
  try {
    const res = await fetch(story.image, { headers: { 'user-agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const input = Buffer.from(await res.arrayBuffer())

    // Cards render ~300px wide in a 16:9 slot; 900 leaves room for a 2x screen.
    const out = await sharp(input)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const outPath = path.join(OUT, story.out)
    await fs.writeFile(outPath, out)
    console.log(`${(out.length / 1024).toFixed(0).padStart(5)} KB  ${story.outlet.padEnd(9)} ${story.out}`)
  } catch (err) {
    failed += 1
    console.error(`FAILED ${story.out}: ${err.message}`)
  }
}

if (failed) process.exit(1)
