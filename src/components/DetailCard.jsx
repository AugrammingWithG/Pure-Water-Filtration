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

export default function DetailCard({
  eyebrow,
  title,
  desc,
  placement,
  action,
  tone,
  removes,
  accent,
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
        <button className="primary">Overview</button>
        <button>How it works</button>
        <button>Specs</button>
      </div>
    </div>
  )
}
