import { CTA } from '../data/constants'
import { PinIcon } from './icons'

/**
 * The stage being looked at, and where the product goes. Its two actions are
 * the site's: ask for a quote, or read the page the stage copy came from.
 */
export default function DetailCard({ eyebrow, title, desc, placement, learnMore }) {
  return (
    <div className="float-card card-detail">
      <div className="fc-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {placement && (
        <div className="fc-placement">
          <PinIcon />
          <span>{placement}</span>
        </div>
      )}
      <div className="detail-actions">
        <a className="primary" href={CTA.quote.href} target="_blank" rel="noopener">
          {CTA.quote.label}
        </a>
        <a href={learnMore} target="_blank" rel="noopener">
          {CTA.learnMore}
        </a>
      </div>
    </div>
  )
}
