import { useCountUp, useStage } from '../hooks'
import { QuoteIcon, StarIcon, VerifiedIcon } from '../icons'
import Stage from '../Stage'

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

/* the bubbles' lanes: where each starts, how big, how long, how much it sways */
const BUBBLES = [
  [6, 10, 11, -30],
  [18, 6, 9, 20],
  [31, 14, 13, -20],
  [47, 8, 10, 35],
  [58, 18, 15, -40],
  [72, 7, 9, 25],
  [84, 12, 12, -25],
  [93, 9, 10, 30],
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

/** The rating counts up from nought as the section arrives, as the trust strip's does. */
function Rating() {
  const { present } = useStage()
  const count = useCountUp(5, 1, present, 0.45, 1200)
  return (
    <div className="rating">
      <div className="rating-num">{count}</div>
      <Stars />
      <small>Google rating</small>
    </div>
  )
}

/**
 * Three quotes that surface like bubbles — each rises at its own pace and
 * settles — over a slow rise of real bubbles behind them (stages.css). The
 * section's colour steps off the brand navy into a deeper kelp-teal: this
 * is the one place on the page where the water is looked into rather than
 * through.
 */
export default function Reviews() {
  return (
    <Stage id="reviews" className="dark reviews" curtain="veil">
      <span className="bubbles" aria-hidden="true">
        {BUBBLES.map(([x, size, duration, sway], i) => (
          <i
            key={i}
            style={{ '--x': `${x}%`, '--size': `${size}px`, '--d': `${duration}s`, '--sway': `${sway}px`, '--i': i }}
          />
        ))}
      </span>
      <div className="container">
        <div className="section-head split-head stage-copy">
          <div className="stage-copy">
            <div className="eyebrow">Reviews</div>
            <h2>Real people. Real results.</h2>
          </div>
          <Rating />
        </div>
        <div className="card-grid three">
          {REVIEWS.map((review, i) => (
            <blockquote className="card glass review" style={{ '--i': i }} key={review.name}>
              <span className="review-mark" aria-hidden="true">
                <QuoteIcon size={44} />
              </span>
              <Stars />
              <p>“{review.quote}”</p>
              <footer>
                <strong>{review.name}</strong>
                <span>
                  <VerifiedIcon size={13} /> Google review
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </Stage>
  )
}
