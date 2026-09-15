import { useEffect, useState } from 'react'

/**
 * The system in figures: this year's water bill with and without the
 * system, the same over five years, and what a year of it adds up to beyond
 * money. One card, three rows, in the same panel as the facts and reasons.
 *
 * These are MVP_FIGURES — invented for the prototype, not published by the
 * client — and the card says so at the foot. See data/constants.js.
 *
 * The figures count up from zero on reveal and on a change of system, the
 * way the old scene cards did; here it costs a re-render every frame for
 * under a second rather than three texture uploads.
 */

/** Seconds the figures take to reach their value. */
const COUNT_SECONDS = 0.95
/** Years the savings row looks ahead. */
export const YEARS = 5

const money = (n) => '$' + Math.round(n).toLocaleString('en-AU')
const count = (n) => Math.round(n).toLocaleString('en-AU')

/**
 * 0..1, restarting from 0 whenever `key` changes. Eases out. The state
 * carries the key it was counted for, so a new key reads as 0 on the very
 * render it arrives rather than one frame later.
 */
function useCountUp(key) {
  const [state, setState] = useState({ key, progress: 0 })
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    const tick = (now) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / (COUNT_SECONDS * 1000))
      setState({ key, progress: 1 - (1 - t) ** 3 })
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    let frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [key])
  return state.key === key ? state.progress : 0
}

/** The rows, as a body: shared by the floating card and the phone sheet. */
export function StatsBody({ figures }) {
  const p = useCountUp(figures)
  const at = (n) => n * p
  const { before, after, litres, bottles, waste } = figures
  const saved = before - after
  return (
    <>
      <div className="stat-row">
        <div className="stat-label">Annual water cost</div>
        <div className="stat-pair">
          <span>
            <b className="stat-before">{money(at(before))}</b>
            <small>now</small>
          </span>
          <span>
            <b className="stat-after">{money(at(after))}</b>
            <small>filtered</small>
          </span>
          <span className="stat-saving">Saves {money(at(saved))}/yr</span>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-label">Over {YEARS} years</div>
        <div className="stat-pair">
          <span>
            <b className="stat-before">{money(at(before * YEARS))}</b>
            <small>unfiltered</small>
          </span>
          <span>
            <b className="stat-after">{money(at(after * YEARS))}</b>
            <small>filtered</small>
          </span>
          <span className="stat-saving">Saves {money(at(saved * YEARS))}</span>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-label">This year, at home</div>
        <div className="stat-triplet">
          <span>
            <b>{count(at(litres))} L</b>
            <small>filtered</small>
          </span>
          <span>
            <b>{count(at(bottles))}</b>
            <small>bottles avoided</small>
          </span>
          <span>
            <b>{count(at(waste))} kg</b>
            <small>plastic diverted</small>
          </span>
        </div>
      </div>
      <div className="stat-note">Estimates for illustration, not a quote.</div>
    </>
  )
}

/**
 * The floating card, under the stage card. Folded by default to one line —
 * the saving and the bottles — so the stage card keeps the column; the
 * reader opens the rest. Stays open once opened, across systems.
 */
export default function StatsCard({ figures }) {
  const [open, setOpen] = useState(false)
  const { before, after, bottles } = figures
  return (
    <div className={`float-card card-stats${open ? ' open' : ''}`}>
      <button
        type="button"
        className="stats-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fc-label">In figures</span>
        {!open && (
          <span className="stats-summary">
            Saves {money(before - after)} a year · {count(bottles)} bottles avoided
          </span>
        )}
        <svg
          className="stats-chevron"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <StatsBody figures={figures} />}
    </div>
  )
}
