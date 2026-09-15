import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSite } from './SiteContext'

/**
 * Loaded on its own, after the page: three.js and the diorama are the
 * heaviest thing on the site, and the hero copy and the quote button should
 * be on screen before any of it arrives. The scene fades in once its shaders
 * are built (see three/Precompile.jsx) rather than popping in.
 */
const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

/**
 * The 3D diorama, live in the hero. Drag orbits it; clicking anything in it
 * opens the Water Lab. It only draws while it is on screen and the Water Lab
 * is closed — see HeroCanvas.
 */
export default function HeroScene() {
  const { openViewer, viewerOpen } = useSite()
  const hostRef = useRef(null)
  const [inView, setInView] = useState(true)
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])
  const handlePick = useCallback(() => openViewer(), [openViewer])

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
      aria-label="Interactive 3D model of a home with a Pure Water whole-house filtration system. Drag to look around; click to open the Water Lab."
      role="img"
    >
      <Suspense fallback={null}>
        <HeroCanvas running={inView && !viewerOpen} onReady={handleReady} onPick={handlePick} />
      </Suspense>
    </div>
  )
}
