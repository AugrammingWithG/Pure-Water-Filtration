/**
 * The product in three figures — the ones the client's own site puts on it
 * (micron rating, stage count, filter interval, install time), so the card
 * makes no claim the site does not.
 *
 * Floating card only. On a phone these same rows are folded into the detail
 * sheet instead, so the two never compete for the canvas.
 */
export default function FactsCard({ facts }) {
  return (
    <div className="float-card card-facts">
      <div className="fc-label">At a glance</div>
      {facts.map(({ value, text }) => (
        <div key={value} className="fact-row">
          <b>{value}</b>
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}
