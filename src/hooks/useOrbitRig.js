import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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

/**
 * How far the target may be panned from where it started, in world units.
 * Panning only exists on two fingers, and without a leash it is very easy to
 * push the diorama off screen on a phone with no idea how to get it back.
 * Reset view still returns to the opening framing.
 */
const PAN_LIMIT = 6

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
  /**
   * Whether the wheel zooms. Off where the canvas sits in a scrolling page
   * (the hero): a reader scrolling past must not find the page stuck and the
   * diorama rushing at them instead.
   */
  wheelZoom = true,
  /**
   * Multiplies the working radius when the camera is placed, without touching
   * the radius itself — so zoom limits and fly-to distances stay in scene
   * units and the caller can pull back for a narrow viewport. See Scene.jsx.
   */
  distanceScale = 1,
  /**
   * Where the camera is placed on the first frame, when that is not the
   * view it rests at. The Lab preview opens from further out and higher
   * and flies down to `view` as the section arrives (see LabStage); reset()
   * still returns to `view`, never here. Read once, on mount.
   */
  start = null,
}) {
  const camera = useThree((s) => s.camera)
  const domElement = useThree((s) => s.gl.domElement)

  // Everything the rig mutates lives in a ref: this runs per-frame and must
  // never trigger a React render.
  const stateRef = useRef(null)
  if (stateRef.current === null) {
    const from = start ?? { target, theta, phi, radius }
    stateRef.current = {
      target: from.target.clone(),
      theta: from.theta,
      phi: from.phi,
      radius: from.radius,
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
      wheelZoom,
    }
  }

  // Read through a ref: updateCamera runs per-frame and must not be rebuilt
  // (and its listeners re-bound) every time the viewport changes shape.
  const scaleRef = useRef(distanceScale)

  const updateCamera = useCallback(() => {
    const s = stateRef.current
    const r = s.radius * scaleRef.current
    camera.position.x = s.target.x + r * Math.sin(s.phi) * Math.sin(s.theta)
    camera.position.y = s.target.y + r * Math.cos(s.phi)
    camera.position.z = s.target.z + r * Math.sin(s.phi) * Math.cos(s.theta)
    camera.lookAt(s.target)
  }, [camera])

  // Place the camera before the first frame so there is no one-frame pop
  // from r3f's default camera position; also re-places it when a resize
  // changes the scale.
  useLayoutEffect(() => {
    scaleRef.current = distanceScale
    updateCamera()
  }, [distanceScale, updateCamera])

  // ---------------- pointer + wheel input ----------------
  /**
   * One finger orbits, two fingers pinch to zoom and pan together, and the
   * wheel zooms as before.
   *
   * Every live pointer is tracked, not just the first. A touch device has no
   * wheel, and the canvas sets `touch-action: none` so the browser will not
   * pinch-zoom the page either — meaning that before this the scene could be
   * orbited on a phone and nothing else. Tracking a single pointer was also
   * actively wrong once two were down: the second finger wrote into the same
   * lastX/lastY as the first, and the camera lurched.
   */
  useEffect(() => {
    if (!domElement) return
    const s = stateRef.current
    const d = defaultsRef.current

    /** Live pointers by id. Two or more means a gesture rather than an orbit. */
    const pointers = new Map()
    /** Spread and midpoint of the last two-finger sample. */
    let gesture = null
    const right = new THREE.Vector3()
    const up = new THREE.Vector3()

    const sample = () => {
      const [a, b] = [...pointers.values()]
      return {
        spread: Math.hypot(b.x - a.x, b.y - a.y),
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      }
    }

    /**
     * Slide the target across the view plane. Pixels are converted to world
     * units at the target distance, which is what makes the diorama keep pace
     * with the fingers instead of sliding at some unrelated rate.
     */
    const panBy = (dx, dy) => {
      const height = domElement.clientHeight || 1
      const halfFov = (camera.fov * Math.PI) / 360
      const perPixel = (2 * s.radius * scaleRef.current * Math.tan(halfFov)) / height
      right.set(1, 0, 0).applyQuaternion(camera.quaternion)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion)
      s.target.addScaledVector(right, -dx * perPixel)
      s.target.addScaledVector(up, dy * perPixel)
      // on a leash, so the diorama cannot be pushed off screen and lost
      s.target.sub(d.initialTarget)
      if (s.target.length() > PAN_LIMIT) s.target.setLength(PAN_LIMIT)
      s.target.add(d.initialTarget)
    }

    const zoomTo = (radius) => {
      s.radius = Math.min(d.maxRadius, Math.max(d.minRadius, radius))
    }

    const onPointerDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      s.idleTime = 0
      try {
        domElement.setPointerCapture(e.pointerId)
      } catch {
        // pointer capture is best-effort; dragging still works without it
      }

      if (pointers.size === 1) {
        s.dragging = true
        s.lastX = e.clientX
        s.lastY = e.clientY
        s.moved = 0
        domElement.classList.add('dragging')
        return
      }

      // A second finger ends the orbit and begins a gesture. It also pushes
      // `moved` past the click threshold: a pinch must never be read as a tap
      // on whatever happened to be under the fingers.
      s.dragging = false
      s.moved = CLICK_MOVE_THRESHOLD
      gesture = sample()
    }

    // NOTE: `moved` is intentionally left alone here. It is reset on
    // pointerdown and read back by wasClick() from the click handlers that
    // run after this, which is how a drag is told apart from a click.
    const onPointerUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) gesture = null

      if (pointers.size === 1) {
        // Back to one finger. Re-anchor on the finger still down, or the
        // camera jumps by however far apart the two of them were.
        const [remaining] = [...pointers.values()]
        s.lastX = remaining.x
        s.lastY = remaining.y
        s.dragging = true
        return
      }

      if (pointers.size === 0) {
        s.dragging = false
        domElement.classList.remove('dragging')
      }
    }

    const onPointerMove = (e) => {
      const p = pointers.get(e.pointerId)
      if (!p) return
      p.x = e.clientX
      p.y = e.clientY

      if (pointers.size >= 2) {
        const now = sample()
        if (gesture) {
          // fingers further apart is a smaller radius, which is closer in
          if (now.spread > 0 && gesture.spread > 0) {
            zoomTo(s.radius * (gesture.spread / now.spread))
          }
          panBy(now.x - gesture.x, now.y - gesture.y)
        }
        gesture = now
        s.idleTime = 0
        s.tween = null
        updateCamera()
        return
      }

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
      zoomTo(s.radius + e.deltaY * 0.01)
      s.idleTime = 0
      updateCamera()
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointerup', onPointerUp)
    // a cancelled touch never sends pointerup, and would otherwise sit in the
    // map forever, wedging the rig in gesture mode
    domElement.addEventListener('pointercancel', onPointerUp)
    domElement.addEventListener('pointerleave', onPointerUp)
    domElement.addEventListener('pointermove', onPointerMove)
    if (d.wheelZoom) domElement.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointercancel', onPointerUp)
      domElement.removeEventListener('pointerleave', onPointerUp)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('wheel', onWheel)
      domElement.classList.remove('dragging')
    }
  }, [domElement, updateCamera, camera])

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
      /** Return to the opening framing; slower for the preview's fly-in. */
      reset(duration = 900) {
        const d = defaultsRef.current
        stateRef.current.autoRotate = true
        tweenTo(d.initialTarget, d.radius, d.theta, d.phi, duration)
      },
      /**
       * How far out the camera is, in scene units, before the narrow-viewport
       * pullback is applied — so a reader on a phone and a reader on a desktop
       * looking at the same framing get the same number.
       *
       * A getter, not a value: the API object is memoised and never rebuilt,
       * and this is meant to be sampled per frame.
       */
      get radius() {
        return stateRef.current.radius
      },
      /**
       * What the camera is pointed at. Moves on a two-finger pan, and on every
       * fly-to. Sampled per frame like `radius`, and for the same reason.
       *
       * This is the rig's own vector, mutated in place: read from it, never
       * keep a reference to it.
       */
      get target() {
        return stateRef.current.target
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
