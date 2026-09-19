/**
 * Stub — content lands in a later ticket. Keeps its own id, band and
 * heading so the dot nav, scroll-spy and sticky chrome all have a real
 * section to point at from day one, and so the ticket that fills this in
 * only ever touches this one file.
 */
export default function News() {
  return (
    <section id="news" className="pr-section band-navy" aria-labelledby="news-h">
      <div className="pr-wrap">
        <h2 id="news-h">Have you heard the news?</h2>
      </div>
    </section>
  )
}
