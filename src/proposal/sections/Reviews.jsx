/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function Reviews() {
  return (
    <section id="reviews" className="pr-section band-off" aria-labelledby="reviews-h">
      <div className="pr-wrap">
        <h2 id="reviews-h">Over 50 five star reviews</h2>
      </div>
    </section>
  )
}
