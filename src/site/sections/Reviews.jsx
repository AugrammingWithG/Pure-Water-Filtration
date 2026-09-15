const REVIEWS = [
  {
    quote:
      '“The team was professional, knowledgeable and made the whole process so easy. Our water tastes amazing now.”',
    name: 'Jaxon Jarvis',
  },
  {
    quote:
      '“Great service and installation. You can really tell the difference in our water quality. Highly recommend.”',
    name: 'Adam CJ',
  },
  {
    quote:
      '“From the first call to installation everything was seamless. The system has made a huge difference.”',
    name: 'Bianca Camuglia',
  },
]

export default function Reviews() {
  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className="review-head reveal">
          <div>
            <div className="eyebrow">Our Customers Say</div>
            <h2>Real people. Real results.</h2>
          </div>
          <div>
            <div className="rating">5.0</div>
            <div className="stars">★★★★★</div>
            <small>5.0 Google rating</small>
          </div>
        </div>
        <div className="review-grid">
          {REVIEWS.map((review, i) => (
            <article className={`review reveal${i ? ` delay${i}` : ''}`} key={review.name}>
              <div className="stars">★★★★★</div>
              <p>{review.quote}</p>
              <strong>{review.name}</strong>
              <small> · Australia</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
