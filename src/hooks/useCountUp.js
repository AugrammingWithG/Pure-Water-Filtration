import { useEffect, useRef } from 'react'
import { formatFigure } from '../data/figures'
import { useMediaQuery } from './useMediaQuery'

/**
 * Counts a figure up to its value and writes it straight to the DOM.
 *
 * Returns a ref to attach to the element that shows the number. It sets
 * textContent inside a rAF loop rather than going through React state, which
 * is the DOM version of the rule the 3D layer already follows: never re-render
 * per frame. It matters here rather than being a nicety — the scene is
 * fill-rate bound (see the README), and re-rendering the app tree sixty times
 * a second to tick a counter would be competing with it for the same budget.
 *
 * A change of system counts from wherever the figure currently is, not from
 * zero: only the first appearance rises from nothing, because resetting on
 * every sidebar click reads as a glitch rather than as the number changing.
 */

const DURATION = 950

export function useCountUp(figure) {
  const { value, prefix, unit } = figure
  const ref = useRef(null)
  /** Where the next count starts from — the last value actually shown. */
  const shown = useRef(0)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const start = shown.current
    const write = (n) => {
      shown.current = n
      node.textContent = formatFigure(n, { prefix, unit })
    }

    // Nothing to animate, or the viewer asked not to be animated at.
    if (reduced || start === value) {
      write(value)
      return undefined
    }

    let frame = 0
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / DURATION)
      const eased = 1 - Math.pow(1 - t, 3)
      write(start + (value - start) * eased)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, prefix, unit, reduced])

  return ref
}
