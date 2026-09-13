import { CTA } from '../data/constants'
import { toneColour } from '../data/tones'
import { PinIcon } from './icons'

/** Same chips the scene card draws, so the two versions do not diverge. */
function Removed({ action, tone, removes, accent }) {
  if (!removes || !removes.length) return null
  const colour = '#' + toneColour(tone, accent).toString(16).padStart(6, '0')
  return (
    <div className="fc-removed">
      <div className="fc-removed-label">{action}</div>
      <div className="fc-chips">
        {removes.map((item) => (
          <span
            key={item}
            className="fc-chip"
            style={{ '--chip': colour }}
          >
            <i />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * The stage being looked at, what it does something about, and where the
 * product goes. Its two actions are the site's: ask for a quote, or read the
 * page the stage copy came from.
 */
export default function DetailCard({
  eyebrow,
  title,
  desc,
  placement,
  action,
  tone,
  removes,
  accent,
  learnMore,
}) {
  return (
    <div className="float-card card-detail">
      <div className="fc-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <Removed action={action} tone={tone} removes={removes} accent={accent} />
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
