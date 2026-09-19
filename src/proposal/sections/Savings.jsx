/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Savings() {
  return (
    <section id="savings" className="pr-section band-off" aria-labelledby="savings-h">
      <div className="pr-wrap">
        <h2 id="savings-h">What you are already spending</h2>
      </div>
    </section>
  )
}
