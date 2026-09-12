import { formatMoney } from '../data/constants'

/**
 * How far out the card looks. Long enough for the gap between the lines to
 * open up on a plot this size; short enough to still be the same household.
 */
const YEARS = 5

/** The plot, in its own units; it scales down with the card as one piece. */
const W = 154
const BASE = 46
/** Keeps the end markers inside the edge: their radius plus the ring. */
const PAD = 7
const TICK = 3
const H = BASE + TICK + 1

/**
 * Where a household's water spend goes over the next few years, unfiltered
 * against filtered. Both lines are the cost card's annual figures accumulated
 * — this is its "saves $630/yr" carried forward rather than a second set of
 * numbers — so the two cards can never disagree. The gap between the lines is
 * the saving, washed in the same green the cost card's pill uses for it.
 *
 * The lines are straight because the spend is a rate: the graph claims
 * nothing about prices rising that the data does not.
 *
 * The values sit in the rows beneath rather than at the ends of the lines.
 * The rainwater system saves little on the water bill, so its two lines all
 * but coincide, and labels at their ends would land on top of each other.
 * The rows also carry the figures for anyone who cannot see the plot, so the
 * plot itself is decoration to them.
 */
export default function SavingsCard({ before, after }) {
  const unfiltered = before * YEARS
  const filtered = after * YEARS

  const x = (year) => PAD + (year / YEARS) * (W - 2 * PAD)
  const y = (amount) => BASE - (amount / unfiltered) * (BASE - PAD)

  const x0 = x(0)
  const x1 = x(YEARS)
  const yUnfiltered = y(unfiltered)
  const yFiltered = y(filtered)

  return (
    <div className="float-card card-savings">
      <div className="fc-label">{YEARS}-year water cost</div>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {/* the saving: everything between the two lines */}
        <polygon
          points={`${x0},${BASE} ${x1},${yUnfiltered} ${x1},${yFiltered}`}
          fill="var(--mint)"
          opacity="0.12"
        />
        {/* baseline, with a tick for each year */}
        <g stroke="var(--line)" strokeWidth="1">
          <line x1={x0} y1={BASE} x2={x1} y2={BASE} />
          {Array.from({ length: YEARS + 1 }, (_, year) => (
            <line key={year} x1={x(year)} y1={BASE} x2={x(year)} y2={BASE + TICK} />
          ))}
        </g>
        {/*
          Filtered drawn last: where the two lines nearly coincide, the one
          that says "with the product" is the one to stay visible.
        */}
        <g strokeWidth="2" strokeLinecap="round">
          <line x1={x0} y1={BASE} x2={x1} y2={yUnfiltered} stroke="var(--amber)" />
          <line x1={x0} y1={BASE} x2={x1} y2={yFiltered} stroke="var(--mint)" />
        </g>
        {/* end markers, ringed in the surface so they read apart where they overlap */}
        <g stroke="#fff" strokeWidth="2">
          <circle cx={x1} cy={yUnfiltered} r="5" fill="var(--amber)" />
          <circle cx={x1} cy={yFiltered} r="5" fill="var(--mint)" />
        </g>
      </svg>
      <dl className="savings-rows">
        <div>
          <dt>
            <i className="dot" style={{ background: 'var(--amber)' }} />
            Unfiltered
          </dt>
          <dd>{formatMoney(unfiltered)}</dd>
        </div>
        <div>
          <dt>
            <i className="dot" style={{ background: 'var(--mint)' }} />
            Filtered
          </dt>
          <dd>{formatMoney(filtered)}</dd>
        </div>
        <div className="savings-saved">
          <dt>Saved</dt>
          <dd>{formatMoney(unfiltered - filtered)}</dd>
        </div>
      </dl>
    </div>
  )
}
