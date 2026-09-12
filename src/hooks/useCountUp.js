import { useEffect, useState } from 'react'

/**
 * The ramp behind figures that count up on screen: 0 -> 1, eased, run once
 * each time the card it belongs to appears or is given something new to show.
 *
 * It returns a fraction rather than a number so that a card counting several
 * figures at once drives all of them from this one ramp. They then stay in
 * step — and stay consistent with each other — for every frame of the count,
 * not only at the end of it.
 *
 * The fraction is held with the run it belongs to rather than on its own, so
 * a count that has not started yet reads as 0 from the very first render:
 * without that, the frame between being asked for a new count and the first
 * animation frame of it would still be showing the last one's final figure.
 */

/** Long enough to read as counting, short enough not to hold up the card. */
const COUNT_MS = 1100

/**
 * Longest step the count takes in one frame. A stall — a tab in the
 * background, a shader compile — gives no frames, and without this the count
 * would come back from one already over. Same rule as the walkthrough's
 * clock: a stall is time that did not happen.
 */
const MAX_STEP_MS = 100

/** Quick off the mark, settling gently onto the final figure. */
const ease = (t) => 1 - (1 - t) ** 3

/**
 * Someone who has asked for less motion still wants the figures — they just
 * want them still, so for them every run is over before it starts.
 */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * @param run     Whether the figures are on screen and should be counting.
 * @param restart Changes to this start the count again from the beginning.
 * @returns the eased 0..1 fraction of the way through the count.
 */
export function useCountUp(run, restart, duration = COUNT_MS) {
  /**
   * Settled once, when the hook first runs: the preference does not change
   * mid-visit, and reading it here keeps it out of the animation effect.
   */
  const [animate] = useState(() => !prefersReducedMotion())
  /** The last frame drawn: which run it belonged to, and how far along. */
  const [count, setCount] = useState({ run: null, fraction: 0 })

  /** Identifies this run of the count; null while there is nothing to count. */
  const runKey = run ? `${restart}` : null
  /** Where a figure sits before its count — or instead of it. */
  const rest = animate ? 0 : 1

  useEffect(() => {
    if (runKey === null || !animate) return

    let id
    let last
    let elapsed = 0
    const tick = (now) => {
      // Stepped by the frame's delta rather than read off a start time, so
      // that the step can be capped. The first frame is the origin: `now` is
      // its timestamp, so the count begins when it is drawn, not when the
      // effect ran.
      if (last !== undefined) elapsed += Math.min(MAX_STEP_MS, now - last)
      last = now
      const t = Math.min(1, elapsed / duration)
      setCount({ run: runKey, fraction: ease(t) })
      if (t < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [runKey, animate, duration])

  return count.run === runKey && runKey !== null ? count.fraction : rest
}
