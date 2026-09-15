import { StarIcon } from '../icons'

/** Confirmed real by the team; see PRODUCT.md. */
const REVIEWS = [
  {
    quote:
      'The team was professional, knowledgeable and made the whole process so easy. Our water tastes amazing now.',
    name: 'Jaxon Jarvis',
  },
  {
    quote:
      'Great service and installation. You can really tell the difference in our water quality. Highly recommend.',
    name: 'Adam CJ',
  },
  {
    quote:
      'From the first call to installation everything was seamless. The system has made a huge difference.',
    name: 'Bianca Camuglia',
  },
]

function Stars() {
  return (
    <div className="stars" aria-label="Five stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} size={13} />
      ))}
    </div>
  )
}

export default function Reviews() {
  return (
    <section className="section dark reviews" id="reviews">
      <div className="container">
        <div className="section-head split-head reveal-stagger">
          <div>
            <div className="eyebrow">Reviews</div>
            <h2>Real people. Real results.</h2>
          </div>
          <div className="rating">
            <div className="rating-num">5.0</div>
            <Stars />
            <small>Google rating</small>
          </div>
        </div>
        <div className="card-grid three">
          {REVIEWS.map((review, i) => (
            <blockquote className={`card glass reveal${i ? ` delay${i}` : ''}`} key={review.name}>
              <Stars />
              <p>“{review.quote}”</p>
              <footer>
                <strong>{review.name}</strong>
                <span>Google review</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
