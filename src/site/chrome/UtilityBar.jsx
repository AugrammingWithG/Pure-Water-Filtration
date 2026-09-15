import { useState } from 'react'
import { useBodyClass } from '../hooks'

/**
 * Two reading aids, kept deliberately blunt: larger text, and motion turned
 * down. Both are body classes, because what they change is spread across the
 * whole stylesheet rather than owned by any one section.
 */
export default function UtilityBar() {
  const [easyRead, setEasyRead] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  useBodyClass('easy-read', easyRead)
  useBodyClass('reduced-motion', reducedMotion)

  return (
    <div className="utility-bar" aria-label="Accessibility options">
      <span className="utility-label">Easier to read</span>
      <button onClick={() => setEasyRead(false)} aria-label="Smaller text" aria-pressed={!easyRead}>
        A−
      </button>
      <button onClick={() => setEasyRead(true)} aria-label="Larger text" aria-pressed={easyRead}>
        A+
      </button>
      <button
        onClick={() => setReducedMotion((on) => !on)}
        aria-label="Reduce motion"
        aria-pressed={reducedMotion}
      >
        ◌
      </button>
    </div>
  )
}
