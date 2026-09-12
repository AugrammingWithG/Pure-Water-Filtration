import { useRef } from 'react'
import { formatMoney } from '../data/constants'
import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

/**
 * What a household spends on water a year now, against what it spends
 * filtered, and the saving between them.
 *
 * The figures count up when the card appears, and again whenever it is handed
 * a new product's figures to show — switching system re-presents the card
 * rather than swapping the numbers out underneath it.
 *
 * All three run off one ramp, which lets the saving be the difference between
 * the two figures actually on screen instead of a third count of its own. The
 * card's arithmetic then holds at every frame of the count rather than only
 * once it has settled.
 *
 * `show` is the app's say on when the card may arrive — it waits for the
 * scene to be drawn, so the figures make their entrance counting rather than
 * sitting at zero over an empty canvas while the page is held starting up.
 * On top of that the card watches for itself whether it is on screen at all:
 * the responsive CSS drops it below a certain height, and it should count
 * again when a resize brings it back.
 *
 * The count lives here rather than in <App> so that the frame-by-frame
 * re-render stops at this card and never reaches the canvas.
 */
export default function CostCard({ before, after, show }) {
  const card = useRef(null)
  const onScreen = useInView(card)
  const shown = show && onScreen
  const progress = useCountUp(shown, `${before}/${after}`)

  const now = Math.round(before * progress)
  const filtered = Math.round(after * progress)

  return (
    <div ref={card} className={`float-card card-cost${shown ? ' is-shown' : ''}`}>
      <div className="fc-label">Annual water cost</div>
      {/*
        A figure caught mid-count is the wrong figure to read out, and one that
        re-announces itself every frame is worse. The counting numbers are for
        the eye; a screen reader is given the settled comparison as a sentence.
      */}
      <p className="sr-only">
        {formatMoney(before)} a year now, {formatMoney(after)} filtered — a
        saving of {formatMoney(before - after)} a year.
      </p>
      <div className="cost-row" aria-hidden="true">
        <div className="cost-col cost-before">
          <span>Now</span>
          <b>{formatMoney(now)}</b>
        </div>
        <div className="cost-col cost-after">
          <span>Filtered</span>
          <b>{formatMoney(filtered)}</b>
        </div>
      </div>
      <div className="savings-pill" aria-hidden="true">
        Saves <span>{formatMoney(now - filtered)}</span>/yr
      </div>
    </div>
  )
}
