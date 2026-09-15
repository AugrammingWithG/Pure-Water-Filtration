import pricingGuide from '../assets/brand/pricing-guide.webp'
import { ArrowIcon, CheckIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The client gates the pricing guide behind the same questions as a quote,
 * so the button here opens the form with that intent rather than a file:
 * the guide comes back with the specialist's reply.
 */
export default function Guide() {
  const { openQuote } = useSite()
  return (
    <section className="section guide" id="guide">
      <div className="container split">
        <div className="guide-card reveal">
          <img
            src={pricingGuide}
            alt="The Pure Water Filtration Pricing Guide: a printed booklet, cover and an open spread"
            width="1000"
            height="897"
            loading="lazy"
          />
        </div>
        <div className="reveal delay2">
          <div className="eyebrow">Free resource</div>
          <h2>Know what to expect before you choose a system.</h2>
          <p>
            Our free Water Filtration Pricing Guide explains which system may suit your home, what
            Australian homeowners can expect to pay, and what's worth knowing before you decide.
          </p>
          <ul className="check-list">
            <li>
              <CheckIcon /> Which system suits your home and water type
            </li>
            <li>
              <CheckIcon /> What the lifetime warranty covers
            </li>
            <li>
              <CheckIcon /> How Filter Care keeps costs predictable
            </li>
          </ul>
          <button className="btn" onClick={() => openQuote({ intent: 'pricing-guide' })}>
            Request the free guide <ArrowIcon />
          </button>
          <p className="guide-note">A few quick questions, then it comes back with your reply.</p>
        </div>
      </div>
    </section>
  )
}
