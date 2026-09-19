/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="pr-section band-off" aria-labelledby="how-it-works-h">
      <div className="pr-wrap">
        <h2 id="how-it-works-h">Three stages, one point of entry</h2>
      </div>
    </section>
  )
}
