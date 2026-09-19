/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Areas() {
  return (
    <section id="areas" className="pr-section band-navy" aria-labelledby="areas-h">
      <div className="pr-wrap">
        <h2 id="areas-h">We service homeowners just like you, Australia wide</h2>
      </div>
    </section>
  )
}
