/**
 * Social proof and problem framing, told with the client's own collection of
 * news screenshots. Navy band, directly under the hero.
 *
 * The eight items are section-local, not part of the Proposal contract: they
 * are the same eight for every customer, so putting them in the fixture would
 * mean copying them into every future proposal JSON. Nothing here reads
 * context, which is also why this is the one section that renders without a
 * proposal loaded.
 *
 * The screenshots themselves live in `public/images/news/` rather than being
 * imported: sourcing and clearing them is a separate job, and a URL reference
 * means the section ships and lays out correctly before the files land, then
 * picks them up with no code change. `img()` applies the deploy's base path —
 * see src/proposal/assets.js.
 */
import { img } from '../assets'

/**
 * Every field below is the outlet's own, read off each story's Open Graph tags
 * by scripts/fetch-news-thumbnails.mjs rather than transcribed from a
 * screenshot: `caption` is the published headline, `sourceLabel` is who ran it,
 * and `image` is the thumbnail they serve. `url` is here so any claim on this
 * page can be checked against the source in one click. Changing a headline or
 * an outlet means changing it in that script too — it is the list that decides
 * which eight thumbnails exist on disk.
 *
 * The images are NOT rights-cleared: they belong to the ABC, Nine and Seven,
 * and Pure Water Filtration has no licence to republish them. See the rights
 * note in that script before this section goes in front of a customer.
 */

/**
 * @typedef {Object} NewsItem
 * @property {string} id
 * @property {string} image - filename inside public/images/news/
 * @property {string} alt - describes the thumbnail, for anyone who cannot see it
 * @property {string} caption - the outlet's published headline, verbatim
 * @property {string} sourceLabel - the outlet that ran it
 * @property {string} url - the story itself
 */

/** @type {NewsItem[]} */
const NEWS = [
  {
    id: 'cancer-causing-chemicals',
    image: 'news-01-cancer-causing-chemicals.webp',
    alt: 'A 9News segment on cancer-causing chemicals found in Australian tap water',
    caption: "Potential cancer-causing chemicals found in Australia's tap water",
    sourceLabel: '9News',
    url: 'https://www.youtube.com/watch?v=B3DUacSu3l0',
  },
  {
    id: 'sydney-forever-chemicals',
    image: 'news-02-sydney-forever-chemicals.webp',
    alt: "A 9News segment on new 'forever chemicals' discovered in Sydney tap water",
    caption: "New 'forever chemicals' discovered in Sydney tap water",
    sourceLabel: '9News',
    url: 'https://www.youtube.com/watch?v=PbRgMbI97Fw',
  },
  {
    id: 'melbourne-contamination-warning',
    image: 'news-03-melbourne-contamination-warning.webp',
    alt: 'A 7NEWS segment on an urgent water contamination warning for Melbourne homes',
    caption: 'Urgent water contamination warning for Melbourne homes',
    sourceLabel: '7NEWS',
    url: 'https://www.youtube.com/watch?v=VYVPAQRt2vs',
  },
  {
    id: 'water-drained-forever-chemicals',
    image: 'news-04-water-drained-forever-chemicals.webp',
    alt: "A 7NEWS segment on drinking water being drained over fears of 'forever chemical' contamination",
    caption: "Drinking water drained over fears it may be contaminated with 'forever chemicals'",
    sourceLabel: '7NEWS',
    url: 'https://www.youtube.com/watch?v=3FV7e7u7se0',
  },
  {
    id: 'fertility-link',
    image: 'news-05-fertility-link.webp',
    alt: 'A 7NEWS segment on tap water chemicals linked to fertility issues',
    caption: 'Tap water chemicals linked to fertility issues',
    sourceLabel: '7NEWS',
    url: 'https://www.youtube.com/watch?v=jvE-saIkUi4',
  },
  {
    id: 'sydney-pfas-detected',
    image: 'news-06-sydney-pfas-detected.webp',
    alt: "An ABC News report on cancer-linked PFAS 'forever chemicals' detected in Sydney drinking water samples",
    caption: "Cancer-linked 'forever chemicals' PFAS detected in Sydney drinking water samples",
    sourceLabel: 'ABC News',
    url: 'https://www.abc.net.au/news/2024-08-20/australia-forever-chemicals-pfas-drinking-water-platypus/104244072',
  },
  {
    id: 'undrinkable-town',
    image: 'news-07-undrinkable-town.webp',
    alt: 'An ABC News report on an Australian town with undrinkable, salty and corrosive tap water',
    caption: 'The Australian town with undrinkable, salty and corrosive tap water',
    sourceLabel: 'ABC News',
    url: 'https://www.abc.net.au/news/2024-03-12/quorn-tap-water-breaches-taste-guidelines-south-australia/103524088',
  },
  {
    id: 'bullsbrook-bottled-water',
    image: 'news-08-bullsbrook-bottled-water.webp',
    alt: 'An ABC News report on residents living off bottled water because of PFAS contamination',
    caption: 'Residents living off bottled water due to PFAS contamination',
    sourceLabel: 'ABC News',
    url: 'https://www.abc.net.au/news/2024-10-12/bullsbrook-pfas-contaminated-water-solution-promised-by-defence/104463670',
  },
]

/**
 * Until a screenshot exists the browser would draw its broken-image glyph
 * across the card. Marking the figure instead leaves a plain navy tile with
 * its caption, which is what the layout is built on anyway.
 */
function hideMissingImage(event) {
  event.currentTarget.closest('.pr-news-card')?.classList.add('is-missing')
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 11v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7.75" r="1.05" fill="currentColor" />
    </svg>
  )
}

export default function News() {
  return (
    <section id="news" className="pr-section band-navy" aria-labelledby="news-h">
      <div className="pr-wrap">
        <div className="pr-news-head">
          <span className="pr-eyebrow">Why families are filtering at home</span>
          <h2 id="news-h">Have you heard the news?</h2>
          <p className="pr-news-lead">
            Australian tap water meets national guidelines, and the story making headlines is what
            those guidelines do not yet cover. Here is what has been reported over the past year.
          </p>
        </div>

        <ul className="pr-news-grid">
          {NEWS.map(({ id, image, alt, caption, sourceLabel, url }) => (
            <li key={id}>
              {/* The card is a link to the story it is quoting. Republishing a
                  newsroom's headline and frame without a route back to the
                  source is how a proposal ends up asking to be taken on trust;
                  this way the reader can check any card in one click.

                  The outlet is read out rather than drawn: every thumbnail
                  already carries its own chyron or watermark, so a visible
                  label would sit on top of branding that is in the picture —
                  and the reference has none. Screen readers get it here. */}
              <a className="pr-news-card" href={url} target="_blank" rel="noreferrer">
                <figure>
                  <img
                    src={img(`news/${image}`)}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={hideMissingImage}
                  />
                  <figcaption>
                    <span className="pr-sr-only">{sourceLabel}: </span>
                    {caption}
                  </figcaption>
                </figure>
              </a>
            </li>
          ))}
        </ul>

        <aside className="pr-news-callout">
          <span className="pr-news-callout-icon">
            <InfoIcon />
          </span>
          <p>
            You do not need a headline to justify filtering your own water. Most of our customers
            simply did not like the taste, the smell, or what the water was doing to their skin,
            hair and appliances. Filtering at the point of entry fixes all of that at once.
          </p>
        </aside>
      </div>
    </section>
  )
}
