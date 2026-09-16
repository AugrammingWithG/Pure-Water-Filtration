import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { STAGE_DATA_BY_SYSTEM, STAGE_ORDER } from '../../data/constants'
import poster from '../assets/water-lab.png'
import { OpenIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The diorama and everything it needs — three.js is already on the page for
 * the hero, but the house, lawn, trees and their textures are not — arrive
 * on their own, once the reader is within `PRELOAD_MARGIN` of the section.
 */
const LabCanvas = lazy(() => import('./LabCanvas.jsx'))
const PRELOAD_MARGIN = '700px 0px'

/** The fly-in from INTRO_VIEW to the home view as the section arrives. */
const INTRO_MS = 2400

/**
 * If the canvas cannot be made (no WebGL, a lost context), the poster stays
 * and the section still reads: the cards keep their state and the full Lab
 * button still works. Nothing to show the reader — a broken frame would say
 * more than a still one.
 */
class LabSafety extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('Lab preview failed', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Reduced motion, from either switch: the reader's OS or the page's own. */
function prefersStill(prefs) {
  return (
    prefs.reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * The Lab preview's frame: the live diorama with its poster underneath, a
 * live tag, the stage readout, Reset view, and the way into the full Lab.
 *
 * Three observers' worth of lifecycle, in order: the canvas is *mounted* on
 * approach so its chunk and shaders are ready before the reader gets here;
 * it *runs* only while on screen (and not under the open Lab, which takes
 * the canvas down altogether — two dioramas in memory is one too many on a
 * phone); and the camera *flies in* the first time the section is actually
 * in view once the scene is ready, so the entrance is seen rather than spent
 * off screen.
 */
export default function LabStage({ lab }) {
  const { openViewer, viewerOpen, prefs } = useSite()
  const hostRef = useRef(null)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  const [ready, setReady] = useState(false)
  /** The reader has taken hold of the scene; the hint has done its job. */
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        approach.disconnect()
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    const visible = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    })
    approach.observe(host)
    visible.observe(host)
    return () => {
      approach.disconnect()
      visible.disconnect()
    }
  }, [])

  const mounted = near && !viewerOpen
  const handleReady = useCallback(() => setReady(true), [])
  /* taking the canvas down takes its readiness with it, in the same render */
  const [wasMounted, setWasMounted] = useState(mounted)
  if (wasMounted !== mounted) {
    setWasMounted(mounted)
    if (!mounted) setReady(false)
  }

  /**
   * The entrance, once per mount: the scene is built and the section is on
   * screen, so fly down from the intro framing to the home view. Coming
   * back from the full Lab remounts the canvas and gets the entrance again,
   * which also puts whatever was being looked at back to the wide view.
   */
  const introDone = useRef(false)
  useEffect(() => {
    if (!mounted) introDone.current = false
  }, [mounted])
  useEffect(() => {
    if (!ready || !inView || introDone.current) return
    introDone.current = true
    lab.reset(prefersStill(prefs) ? 1 : INTRO_MS)
    // lab.reset is stable; prefs only decides the duration at the moment of entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, inView])

  /**
   * A tour nobody is watching holds where it is: scrolling away pauses it,
   * so the reader comes back to the stage they left rather than to wherever
   * a loop running unseen had got to.
   */
  const { pause, status } = lab
  useEffect(() => {
    if (!inView && status === 'playing') pause()
  }, [inView, status, pause])

  const stage = STAGE_DATA_BY_SYSTEM[lab.currentSystem][lab.currentStage]
  const stageIndex = STAGE_ORDER.indexOf(lab.currentStage)

  /*
   * State rides on data attributes, not classes: the page's reveal observer
   * adds `visible` to the class list, and React rewriting `className` on the
   * next render would drop it. `reveal` rises rather than zooms, because
   * r3f measures the canvas with getBoundingClientRect, which a scaled
   * ancestor would shrink.
   */
  return (
    <div
      className="lab-visual reveal"
      ref={hostRef}
      data-ready={ready || undefined}
      data-focused={lab.focused || undefined}
      data-touched={touched || undefined}
      data-playing={lab.status === 'playing' || undefined}
    >
      {/* the crop of the Lab the section used to show; now what shows until the live scene is built */}
      <img className="lab-poster" src={poster} alt="" aria-hidden="true" />

      <div
        className="lab-scene"
        role="img"
        aria-label="Interactive 3D model of a home showing where the whole house, under sink and rainwater filtration systems are installed. Drag to look around; click a unit to fly to it."
        onPointerDownCapture={() => setTouched(true)}
      >
        {mounted && (
          <LabSafety>
            <Suspense fallback={null}>
              <LabCanvas
                running={inView && !viewerOpen}
                currentSystem={lab.currentSystem}
                currentStage={lab.currentStage}
                focused={lab.focused}
                paused={lab.status === 'paused'}
                subscribe={lab.subscribe}
                onPick={lab.scenePick}
                onReady={handleReady}
                cameraRef={lab.cameraRef}
              />
            </Suspense>
          </LabSafety>
        )}
      </div>

      {/* light sweeps the frame's edge once as the section arrives */}
      <span className="lab-sweep" aria-hidden="true" />

      <span className="lab-tag">
        <i /> {ready ? 'Live 3D' : 'Priming the Lab'}
      </span>

      <button
        type="button"
        className="lab-reset"
        onClick={() => lab.reset()}
        hidden={!lab.focused}
      >
        Reset view
      </button>

      <div className="lab-hud">
        <p className="lab-hint" aria-hidden={lab.focused || touched}>
          <span className="lab-hint-drag" /> Drag to look around <span className="lab-hint-dot">·</span>{' '}
          click any unit
        </p>
        <div className="lab-readout" aria-live="polite" key={`${lab.currentSystem}-${lab.currentStage}`}>
          <small>
            Stage {stageIndex + 1} of {STAGE_ORDER.length}
          </small>
          <strong>{stage.title}</strong>
        </div>
      </div>

      <button type="button" className="btn lab-open" onClick={openViewer}>
        Open the full Water Lab <OpenIcon />
      </button>
    </div>
  )
}
