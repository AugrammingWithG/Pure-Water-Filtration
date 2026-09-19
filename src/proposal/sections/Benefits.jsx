/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Benefits() {
  return (
    <section id="benefits" className="pr-section band-off" aria-labelledby="benefits-h">
      <div className="pr-wrap">
        <h2 id="benefits-h">What changes the day it is installed</h2>
      </div>
    </section>
  )
}
