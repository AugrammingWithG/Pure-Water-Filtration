import { useRef } from 'react'
import { WHY_US } from '../data/constants'
import { SheetActions, StageBody } from './DetailCard'
import { StatsBody } from './StatsCard'

/**
 * The phone panel: one sheet, four tabs.
 *
 * A phone has room for one card, and the things it has to say belong to four
 * different scopes — this stage, this product, its figures, and this company.
 * Tabs are what let all of them exist without any floating over the diorama,
 * and splitting them keeps each one short: the sheet sits on top of the
 * model, so its height is the whole cost.
 *
 * Each tab is its own heading, so the panels carry no title of their own.
 *
 * The actions belong to the stage tab. The header already has a quote button
 * and the phone number, so repeating them under the other two only cost
 * height on the tabs that had least to spare.
 */

/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE = 45
/**
 * How much more horizontal than vertical a drag has to be. Without it, a
 * flick while scrolling the sheet changes tab as well.
 */
const SWIPE_BIAS = 1.5

const TABS = [
  { key: 'stage', label: 'Stage', full: 'Stage details' },
  { key: 'facts', label: 'At a glance', full: 'At a glance' },
  { key: 'figures', label: 'Figures', full: 'In figures' },
  { key: 'why', label: 'Why us', full: 'Why Pure Water Filtration' },
]

const clamp = (n) => Math.max(0, Math.min(TABS.length - 1, n))

function Rows({ items }) {
  return items.map(({ value, text }) => (
    <div key={value} className="fact-row">
      <b>{value}</b>
      <span>{text}</span>
    </div>
  ))
}

export default function MobileSheet({ page, onPage, content, facts, figures, learnMore }) {
  const from = useRef(null)

  const onPointerDown = (e) => {
    from.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e) => {
    const start = from.current
    from.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * SWIPE_BIAS) return
    onPage(clamp(page + (dx < 0 ? 1 : -1)))
  }

  return (
    <div
      className="float-card card-detail"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        from.current = null
      }}
    >
      <div className="sheet-tabs" role="tablist">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            className="sheet-tab"
            onClick={() => onPage(i)}
            aria-selected={page === i}
            aria-label={tab.full}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={TABS[page].full}>
        {page === 0 && <StageBody {...content} />}
        {page === 1 && <Rows items={facts} />}
        {page === 2 && <StatsBody figures={figures} />}
        {page === 3 && <Rows items={WHY_US} />}
      </div>

      {page === 0 && <SheetActions learnMore={learnMore} />}
    </div>
  )
}
