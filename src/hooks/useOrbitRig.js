import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Drag-to-orbit camera rig with focus/zoom support.
 *
 * A direct port of makeOrbit() from the legacy prototype, wrapped as a hook.
 * Deliberately NOT drei's <OrbitControls>: the click-vs-drag threshold and the
 * focus tween are load-bearing for the UX, and stock controls provide neither.
 *
 * Must be called from inside a <Canvas> (it uses useThree/useFrame).
 */

/** Total pointer travel, in px, below which a pointerup still counts as a click. */
const CLICK_MOVE_THRESHOLD = 6
/** Seconds of inactivity before the camera starts drifting on its own. */
const IDLE_BEFORE_AUTOROTATE = 2.2
/** Matches the legacy animate() loop, which clamped dt to avoid tab-switch jumps. */
const MAX_DELTA = 0.05

const clampPhi = (p) => Math.max(0.3, Math.min(Math.PI - 0.3, p))

const TWO_PI = Math.PI * 2

/** The angle equivalent to `to` (mod 2π) that is closest to `from`. */
function nearestAngle(from, to) {
  let d = (to - from) % TWO_PI
  if (d > Math.PI) d -= TWO_PI
  if (d < -Math.PI) d += TWO_PI
  return from + d
}

export function useOrbitRig({
  target,
  radius = 7,
  theta = 0.6,
  phi = 1.1,
  minRadius = 2,
  maxRadius = 14,
  autoRotateSpeed = 0.05,
}) {
  const camera = useThree((s) => s.camera)
  const domElement = useThree((s) => s.gl.domElement)

  // Everything the rig mutates lives in a ref: this runs per-frame and must
  // never trigger a React render.
  const stateRef = useRef(null)
  if (stateRef.current === null) {
    stateRef.current = {
      target: target.clone(),
      theta,
      phi,
      radius,
      dragging: false,
      lastX: 0,
      lastY: 0,
      idleTime: 0,
      moved: 0,
      tween: null,
      // idle drift is only wanted at the wide framing; a close-up would
      // slowly orbit the camera into whatever the product is mounted on
      autoRotate: true,
    }
  }

  // Captured once so later prop churn can't change where reset() goes.
  const defaultsRef = useRef(null)
  if (defaultsRef.current === null) {
    defaultsRef.current = {
      initialTarget: target.clone(),
      radius,
      theta,
      phi,
      minRadius,
      maxRadius,
      autoRotateSpeed,
    }
  }

  const updateCamera = useCallback(() => {
    const s = stateRef.current
    camera.position.x =
      s.target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta)
    camera.position.y = s.target.y + s.radius * Math.cos(s.phi)
    camera.position.z =
      s.target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta)
    camera.lookAt(s.target)
  }, [camera])

  // Place the camera before the first frame so there is no one-frame pop
  // from r3f's default camera position.
  useLayoutEffect(() => {
    updateCamera()
  }, [updateCamera])

  // ---------------- pointer + wheel input ----------------
  useEffect(() => {
    if (!domElement) return
    const s = stateRef.current
    const d = defaultsRef.current

    const onPointerDown = (e) => {
      s.dragging = true
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.idleTime = 0
      s.moved = 0
      domElement.classList.add('dragging')
      try {
        domElement.setPointerCapture(e.pointerId)
      } catch {
        // pointer capture is best-effort; dragging still works without it
      }
    }

    // NOTE: `moved` is intentionally left alone here. It is reset on
    // pointerdown and read back by wasClick() from the click handlers that
    // run after this, which is how a drag is told apart from a click.
    const onPointerUp = () => {
      s.dragging = false
      domElement.classList.remove('dragging')
    }

    const onPointerLeave = () => {
      s.dragging = false
      domElement.classList.remove('dragging')
    }

    const onPointerMove = (e) => {
      if (!s.dragging) return
      const dx = e.clientX - s.lastX
      const dy = e.clientY - s.lastY
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.moved += Math.abs(dx) + Math.abs(dy)
      s.theta -= dx * 0.006
      s.phi = clampPhi(s.phi - dy * 0.006)
      s.idleTime = 0
      s.tween = null // a manual drag cancels any in-flight camera fly-to
      updateCamera()
    }

    const onWheel = (e) => {
      e.preventDefault()
      s.radius = Math.min(
        d.maxRadius,
        Math.max(d.minRadius, s.radius + e.deltaY * 0.01),
      )
      s.idleTime = 0
      updateCamera()
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointerup', onPointerUp)
    domElement.addEventListener('pointerleave', onPointerLeave)
    domElement.addEventListener('pointermove', onPointerMove)
    domElement.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointerleave', onPointerLeave)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('wheel', onWheel)
      domElement.classList.remove('dragging')
    }
  }, [domElement, updateCamera])

  // ---------------- tween ----------------
  const tweenTo = useCallback(
    (toTarget, toRadius, toTheta, toPhi, duration) => {
      const s = stateRef.current
      s.tween = {
        startTarget: s.target.clone(),
        startRadius: s.radius,
        startTheta: s.theta,
        startPhi: s.phi,
        toTarget: toTarget.clone(),
        toRadius,
        // theta is unbounded (auto-rotate keeps adding to it), so aim for the
        // equivalent angle nearest to where we are instead of unwinding laps.
        toTheta: toTheta === null ? null : nearestAngle(s.theta, toTheta),
        toPhi,
        t0: performance.now(),
        duration: duration || 850,
      }
      s.idleTime = 0
    },
    [],
  )

  // The legacy rig drove the tween on its own requestAnimationFrame; here it
  // advances inside the shared useFrame loop. Same clock, same easing.
  useFrame((_, delta) => {
    const s = stateRef.current
    const d = defaultsRef.current
    const dt = Math.min(delta, MAX_DELTA)

    if (s.tween) {
      const tw = s.tween
      const t = Math.min(1, (performance.now() - tw.t0) / tw.duration)
      const e = 1 - Math.pow(1 - t, 3) // ease-out cubic
      s.target.lerpVectors(tw.startTarget, tw.toTarget, e)
      s.radius = tw.startRadius + (tw.toRadius - tw.startRadius) * e
      if (tw.toTheta !== null) {
        s.theta = tw.startTheta + (tw.toTheta - tw.startTheta) * e
      }
      if (tw.toPhi !== null) {
        s.phi = tw.startPhi + (tw.toPhi - tw.startPhi) * e
      }
      updateCamera()
      if (t >= 1) s.tween = null
    }

    s.idleTime += dt
    if (s.autoRotate && !s.dragging && s.idleTime > IDLE_BEFORE_AUTOROTATE) {
      s.theta += d.autoRotateSpeed * dt
      updateCamera()
    }
  })

  return useMemo(
    () => ({
      /**
       * Fly the camera to a view. `theta`/`phi` are optional — leave them out
       * to keep whatever angle the user has orbited to.
       */
      flyTo({ target: to, radius: toRadius, theta: toTheta, phi: toPhi }, duration) {
        stateRef.current.autoRotate = false
        tweenTo(to, toRadius, toTheta ?? null, toPhi ?? null, duration)
      },
      /** Return to the opening framing. */
      reset() {
        const d = defaultsRef.current
        stateRef.current.autoRotate = true
        tweenTo(d.initialTarget, d.radius, d.theta, d.phi, 900)
      },
      /**
       * True when the gesture that just ended was a click rather than a drag.
       * Read from onClick handlers to suppress selection while orbiting.
       */
      wasClick() {
        return stateRef.current.moved < CLICK_MOVE_THRESHOLD
      },
    }),
    [tweenTo],
  )
}
