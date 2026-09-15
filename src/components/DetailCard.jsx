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
          <span key={item} className="fc-chip" style={{ '--chip': colour }}>
            <i />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * The stage being looked at, and what it does something about.
 *
 * Exported on its own because the phone sheet pages between this and the
 * product information: both pages have to be the same markup as the floating
 * card, or the two would drift.
 */
export function StageBody({ eyebrow, title, desc, placement, action, tone, removes, accent }) {
  return (
    <>
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
    </>
  )
}

/**
 * The two actions the site offers: ask for a quote, or read the page the copy
 * came from. Shared chrome — on the phone sheet they sit under the stage tab,
 * since the header carries a quote button and the number on every tab anyway.
 */
export function SheetActions({ learnMore }) {
  return (
    <div className="detail-actions">
      <a className="primary" href={CTA.quote.href}>
        {CTA.quote.label}
      </a>
      <a href={learnMore} target="_blank" rel="noopener">
        {CTA.learnMore}
      </a>
    </div>
  )
}

/** The floating card, for the band between the phone sheet and the scene card. */
export default function DetailCard(props) {
  return (
    <div className="float-card card-detail">
      <StageBody {...props} />
      <SheetActions learnMore={props.learnMore} />
    </div>
  )
}
