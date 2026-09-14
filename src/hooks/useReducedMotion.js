import { useMediaQuery } from './useMediaQuery'

/**
 * Whether the visitor has asked their OS for less motion.
 *
 * The stylesheet reads the same preference itself (the reduced-motion block
 * at the end of index.css); this is for the motion that lives in JavaScript —
 * the camera's idle drift and fly-to, and the wind in the foliage — which no
 * media query can reach. Each of those reads it where it happens rather than
 * having it passed down from Scene, so what goes still under the preference
 * is decided next to the code that moves it.
 *
 * The water is deliberately not on this list. It is the content — a page
 * about filtration with nothing flowing through the filters says nothing —
 * and Pause already holds it as a freeze-frame on demand.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
