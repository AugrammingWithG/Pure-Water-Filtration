/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Investment() {
  return (
    <section id="investment" className="pr-section band-navy" aria-labelledby="investment-h">
      <div className="pr-wrap">
        <h2 id="investment-h">What it costs, in full</h2>
      </div>
    </section>
  )
}
