import { useCallback, useSyncExternalStore } from 'react'

/**
 * Whether a CSS media query currently matches, kept in sync as the viewport
 * changes. Used where a breakpoint has to be known to React and not only to
 * the stylesheet — the stage card is drawn in the scene on a large viewport
 * and as a DOM card on a small one, and only one of the two may exist.
 *
 * Written against useSyncExternalStore rather than an effect: matchMedia is
 * exactly the external store that API is for, and reading it this way avoids
 * the render-then-correct pass an effect would cause on every mount.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  // Server snapshot: no viewport to measure, so assume the small-screen path.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
