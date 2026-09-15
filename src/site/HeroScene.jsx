import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSite } from './SiteContext'

/**
 * Loaded on its own, after the page: three.js and the render are the
 * heaviest thing on the site, and the hero copy and the quote button should
 * be on screen before any of it arrives. The scene fades in once its shaders
 * are built (see three/Precompile.jsx) rather than popping in.
 */
const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

/**
 * The hero's cinematic product render. Fixed camera, no interaction — the
 * page's own quote button and Water Lab launcher live in the copy overlay.
 * It only draws while it is on screen and the Water Lab is closed (see
 * HeroCanvas).
 */
export default function HeroScene() {
  const { viewerOpen } = useSite()
  const hostRef = useRef(null)
  const [inView, setInView] = useState(true)
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={`hero-scene${ready ? ' is-ready' : ''}`}
      ref={hostRef}
      aria-label="High-quality 3D render of a Pure Water whole-house filtration unit mounted on an interior wall."
      role="img"
    >
      <Suspense fallback={null}>
        <HeroCanvas running={inView && !viewerOpen} onReady={handleReady} />
      </Suspense>
    </div>
  )
}
