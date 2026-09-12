import { useEffect, useState } from 'react'

/**
 * Whether the element behind `ref` is actually on screen.
 *
 * False to begin with and true once it is showing, which is what makes an
 * entrance — a fade, a figure counting up — an entrance rather than something
 * that has already happened by the time it is looked at.
 *
 * The cards here never scroll; what moves them on and off screen is the
 * responsive CSS dropping the ones that no longer fit. `display:none` leaves
 * an element with no box, so the observer reports it as gone and reports it
 * back the moment a resize lands on a breakpoint that keeps it — and it makes
 * its entrance then.
 */
export function useInView(ref) {
  /**
   * Without an observer to ask, take it as showing: better an entrance that
   * is missed than a card that never arrives.
   */
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
