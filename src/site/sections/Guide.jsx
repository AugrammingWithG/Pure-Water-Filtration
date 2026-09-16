import pricingGuide from '../assets/brand/pricing-guide.webp'
import { ArrowIcon, CheckIcon, TagIcon } from '../icons'
import { useSite } from '../SiteContext'
import Stage from '../Stage'

const POINTS = [
  'Which system suits your home and water type',
  'What the lifetime warranty covers',
  'How Filter Care keeps costs predictable',
]

/**
 * The client gates the pricing guide behind the same questions as a quote,
 * so the button here opens the form with that intent rather than a file:
 * the guide comes back with the specialist's reply.
 *
 * The section is the warm one — paper rather than water — and the booklet
 * is handed across as it arrives: the cover turns in on its spine, its
 * "Free" tag stamps on, and the checks tick down the list (stages.css).
 */
export default function Guide() {
  const { openQuote } = useSite()
  return (
    <Stage id="guide" className="guide" curtain="page">
      <div className="container split guide-grid">
        <div className="guide-card">
          <img
            src={pricingGuide}
            alt="The Pure Water Filtration Pricing Guide: a printed booklet, cover and an open spread"
            width="1000"
            height="897"
            loading="lazy"
          />
          <span className="guide-tag" aria-hidden="true">
            <TagIcon size={14} />
            Free guide
          </span>
        </div>
        <div className="stage-copy">
          <div className="eyebrow">Free resource</div>
          <h2>Know what to expect before you choose a system.</h2>
          <p>
            Our free Water Filtration Pricing Guide explains which system may suit your home, what
            Australian homeowners can expect to pay, and what's worth knowing before you decide.
          </p>
          <ul className="check-list">
            {POINTS.map((line, i) => (
              <li key={line} style={{ '--i': i }}>
                <CheckIcon /> {line}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={() => openQuote({ intent: 'pricing-guide' })}>
            Request the free guide <ArrowIcon />
          </button>
          <p className="guide-note">A few quick questions, then it comes back with your reply.</p>
        </div>
      </div>
    </Stage>
  )
}
