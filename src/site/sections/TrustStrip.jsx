import { useEffect, useRef, useState } from 'react'
import { StarIcon } from '../icons'

/**
 * The proof band between the hero and the Water Lab: four figures, each
 * leading with the number the way the Reviews rating does, so the strip
 * reads as evidence rather than a row of feature icons.
 *
 * Unlike the rest of the page's once-only reveals, the strip watches its
 * own presence so it can leave as well as arrive: `is-in` plays the
 * entrance (hairlines draw, figures count up out of a blur, stars pop) and
 * starts the idle loops; losing it plays the exit, drifting the pieces out
 * the way the reader is scrolling (`--from` is the side they went, and so
 * the side they will come back from). See site.css, TRUST STRIP.
 */
const TRUST = [
  {
    figure: '5.0',
    stars: true,
    title: 'Google rating',
    note: 'From verified customer reviews',
  },
  { figure: '50+', title: 'Service areas', note: 'Across Australia' },
  { figure: 'Lifetime', title: 'Warranty', note: 'With the Filter Care Plan' },
  { figure: 'AU', title: 'Locally owned', note: 'Australian owned and operated' },
]

/* how long the figure's own entrance waits, so the count starts as it lands */
const ENTER_DELAY = 0.1
const ENTER_STEP = 0.09

const prefersStill = () =>
  document.body.classList.contains('reduced-motion') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** True while the strip is on screen; `from` is the edge it last left by. */
function usePresence(ref) {
  const [state, setState] = useState({ present: false, from: 1 })
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((s) => ({ ...s, present: true }))
        } else {
          setState({ present: false, from: entry.boundingClientRect.top < 0 ? -1 : 1 })
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  return state
}

/** Counts from 0 to `target` over `duration`ms once `active`, easing out. */
function useCountUp(target, decimals, active, delay, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    /* under reduced motion the count is instant: a zero-length run, no wait */
    const still = prefersStill()
    let frame
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = still ? 1 : Math.min(1, (now - start) / duration)
        setValue(target * (1 - (1 - p) ** 4))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, still ? 0 : delay * 1000)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [active, target, duration, delay])
  return value.toFixed(decimals)
}

/* "5.0" and "50+" count up; a word ("Lifetime", "AU") simply lands */
function Figure({ text, active, delay }) {
  const match = /^(\d+(?:\.(\d+))?)(\D*)$/.exec(text)
  const target = match ? Number(match[1]) : 0
  const decimals = match?.[2]?.length ?? 0
  const count = useCountUp(target, decimals, active, delay)
  if (!match) return <span className="trust-num">{text}</span>
  return (
    <span className="trust-num">
      {count}
      {match[3]}
    </span>
  )
}

export default function TrustStrip() {
  const ref = useRef(null)
  const { present, from } = usePresence(ref)
  return (
    <section
      ref={ref}
      className={`trust-strip${present ? ' is-in' : ''}`}
      style={{ '--from': from }}
      aria-label="Why customers trust Pure Water"
    >
      <span className="trust-sheen" aria-hidden="true" />
      <div className="container">
        <ul className="trust-grid">
          {TRUST.map(({ figure, stars, title, note }, i) => (
            <li className="trust" style={{ '--i': i }} key={title}>
              <div className="trust-figure">
                <Figure text={figure} active={present} delay={ENTER_DELAY + i * ENTER_STEP} />
                {stars && (
                  <span className="stars" aria-label="Five stars">
                    {Array.from({ length: 5 }, (_, s) => (
                      <StarIcon key={s} size={13} />
                    ))}
                  </span>
                )}
              </div>
              <strong>{title}</strong>
              <span className="trust-note">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
