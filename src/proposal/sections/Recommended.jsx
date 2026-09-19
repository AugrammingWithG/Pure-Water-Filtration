/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Recommended() {
  return (
    <section id="recommended" className="pr-section band-off" aria-labelledby="recommended-h">
      <div className="pr-wrap">
        <h2 id="recommended-h">Your recommended setup</h2>
      </div>
    </section>
  )
}
