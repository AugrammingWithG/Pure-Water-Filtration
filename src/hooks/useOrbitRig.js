import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Drag-to-orbit camera rig with focus/zoom support.
 *
 * Grew out of makeOrbit() in the legacy prototype. Deliberately NOT drei's
 * <OrbitControls>: the click-vs-drag threshold and the focus tween are
 * load-bearing for the UX, and stock controls provide neither.
 *
 * Two things shape everything below.
 *
 * The rig is *smoothed*: input never writes the camera. It writes a goal, and
 * the frame loop eases the live values towards it. That is what lets a flick
 * carry on gliding after the mouse is up, and what keeps the wheel from
 * stepping in visible jerks. `tween` (flyTo/reset) is the exception — it owns
 * both at once, because it is already eased and damping a damped thing twice
 * arrives late and soft.
 *
 * And it is driven by a *whole mouse*, not just the left button. Before this
 * only the left drag and the wheel did anything; panning existed on two
 * fingers alone, so a desktop reader who wanted to look at the corner of the
 * diorama had no way to put it in the middle of the frame. See the input map
 * on the pointer effect.
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
 * Without a leash it is very easy to push the diorama off screen with no idea
 * how to get it back. Reset view still returns to the opening framing.
 */
const PAN_LIMIT = 6

const TWO_PI = Math.PI * 2

/**
 * Seconds for the live view to close most of the gap to the goal. Small
 * enough that a drag still feels nailed to the pointer; large enough to take
 * the stair-steps off a wheel notch and to let a flick glide.
 */
const SETTLE_TAU = 0.075
/** Below this, the remaining gap is not worth another frame of camera work. */
const SETTLE_EPSILON = 1e-4

/** How long a released flick keeps orbiting, and the speeds it is kept between. */
const FLING_TAU = 0.34
/** Radians/second under which the glide is finished. */
const FLING_MIN = 0.05
/** Radians/second a single flick may not exceed, however hard it is thrown. */
const FLING_MAX = 5
/** A pointer that sat still for this long before lifting is a place, not a throw. */
const FLING_STALE_MS = 90

/** Radians of orbit per pixel of drag. */
const DRAG_SPEED = 0.006
/** Radius multiplier per pixel of a dolly drag (alt/ctrl + drag). */
const DOLLY_SPEED = 0.006

/**
 * Radius multiplier per normalised wheel pixel. Exponential rather than
 * linear, so one notch covers the same *proportion* of the distance whether
 * the reader is across the garden or inside the cabinet — a fixed step in
 * scene units is imperceptible at the far end and slams into the near clamp
 * at the close one.
 */
const WHEEL_ZOOM = 0.0016
/** A trackpad pinch arrives as ctrl+wheel with much smaller deltas. */
const PINCH_WHEEL_ZOOM = 0.012

/** Keyboard rates, per second, while a key is held. */
const KEY_ORBIT = 1.15
const KEY_PAN = 420
const KEY_ZOOM = 1.1

/** Firefox reports wheel deltas in lines, and occasionally in pages. */
const LINE_HEIGHT = 16
const PAGE_HEIGHT = 400

/** The angle equivalent to `to` (mod 2π) that is closest to `from`. */
function nearestAngle(from, to) {
  let d = (to - from) % TWO_PI
  if (d > Math.PI) d -= TWO_PI
  if (d < -Math.PI) d += TWO_PI
  return from + d
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/**
 * Scratch vectors for the camera basis. Panning and zooming both run on
 * pointermove, which is every frame of a drag; allocating there is how a
 * smooth rig ends up with a sawtooth of garbage collections through it.
 */
const RIGHT = new THREE.Vector3()
const UP = new THREE.Vector3()

/** Wheel delta in CSS pixels, whatever unit the browser chose to send. */
function wheelPixels(e) {
  if (e.deltaMode === 1) return e.deltaY * LINE_HEIGHT
  if (e.deltaMode === 2) return e.deltaY * PAGE_HEIGHT
  return e.deltaY
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
   * Whether the canvas can be tabbed to and driven from the keyboard. The
   * keys only ever act on a *keyboard* focus (:focus-visible), never on the
   * focus a click leaves behind — the viewer binds the arrows to its stage
   * transport, and clicking a product must not quietly rebind them to orbit.
   */
  keyboard = true,
  /**
   * Called when the reader asks for the opening framing from the keyboard.
   * The rig cannot do this itself: reset is also a piece of app state (the
   * cards close, the tour stops), and only the caller owns that.
   */
  onResetView = null,
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
      // where the camera is this frame
      target: from.target.clone(),
      theta: from.theta,
      phi: from.phi,
      radius: from.radius,
      // where input has asked it to be; the live values chase these
      goalTarget: from.target.clone(),
      goalTheta: from.theta,
      goalPhi: from.phi,
      goalRadius: from.radius,
      // leftover orbit speed from a released flick, in radians/second
      flingTheta: 0,
      flingPhi: 0,
      dragging: false,
      /** 'orbit' | 'pan' | 'dolly' while one pointer is down. */
      mode: 'orbit',
      lastX: 0,
      lastY: 0,
      lastMoveAt: 0,
      idleTime: 0,
      moved: 0,
      tween: null,
      keys: new Set(),
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
      keyboard,
    }
  }

  // Read through a ref: updateCamera runs per-frame and must not be rebuilt
  // (and its listeners re-bound) every time the viewport changes shape.
  const scaleRef = useRef(distanceScale)
  // Likewise the reset callback: it is an app-level handler and changes
  // identity freely, and re-binding the key listener for that would be silly.
  const resetRef = useRef(onResetView)
  useEffect(() => {
    resetRef.current = onResetView
  }, [onResetView])

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

  // ---------------- goal-space moves, shared by pointer, wheel and keys ----------------

  /** Keep the look-at point within PAN_LIMIT of where it started. */
  const leash = useCallback((v) => {
    const origin = defaultsRef.current.initialTarget
    v.sub(origin)
    if (v.length() > PAN_LIMIT) v.setLength(PAN_LIMIT)
    v.add(origin)
  }, [])

  /**
   * Slide the goal target across the view plane. Pixels are converted to
   * world units at the target distance, which is what makes the diorama keep
   * pace with the pointer instead of sliding at some unrelated rate.
   */
  const panBy = useCallback(
    (dx, dy) => {
      const s = stateRef.current
      const height = domElement?.clientHeight || 1
      const halfFov = (camera.fov * Math.PI) / 360
      const perPixel = (2 * s.goalRadius * scaleRef.current * Math.tan(halfFov)) / height
      RIGHT.set(1, 0, 0).applyQuaternion(camera.quaternion)
      UP.set(0, 1, 0).applyQuaternion(camera.quaternion)
      s.goalTarget.addScaledVector(RIGHT, -dx * perPixel)
      s.goalTarget.addScaledVector(UP, dy * perPixel)
      leash(s.goalTarget)
    },
    [camera, domElement, leash],
  )

  const zoomTo = useCallback((r) => {
    const d = defaultsRef.current
    stateRef.current.goalRadius = clamp(r, d.minRadius, d.maxRadius)
  }, [])

  /**
   * Zoom while holding whatever is under (cx, cy) still — the difference
   * between a wheel that magnifies the middle of the frame and one that
   * magnifies the thing the reader is pointing at.
   *
   * The fixed point is taken on the plane through the target rather than off
   * the geometry: a raycast per wheel event would be the honest version, but
   * at these distances the plane is within a few pixels of it and costs
   * nothing. Moving the target is also what makes repeated notches walk the
   * camera across the scene, so the pan leash applies here too.
   */
  const zoomAt = useCallback(
    (r, cx, cy) => {
      const s = stateRef.current
      const before = s.goalRadius
      zoomTo(r)
      const after = s.goalRadius
      if (after === before || !domElement) return

      const rect = domElement.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const nx = ((cx - rect.left) / rect.width) * 2 - 1
      const ny = -(((cy - rect.top) / rect.height) * 2 - 1)

      const halfFov = (camera.fov * Math.PI) / 360
      const halfHeight = before * scaleRef.current * Math.tan(halfFov)
      const halfWidth = halfHeight * camera.aspect
      const f = 1 - after / before

      RIGHT.set(1, 0, 0).applyQuaternion(camera.quaternion)
      UP.set(0, 1, 0).applyQuaternion(camera.quaternion)
      s.goalTarget.addScaledVector(RIGHT, nx * halfWidth * f)
      s.goalTarget.addScaledVector(UP, ny * halfHeight * f)
      leash(s.goalTarget)
    },
    [camera, domElement, leash, zoomTo],
  )

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
      s.flingTheta = 0
      s.flingPhi = 0
      s.keys.clear()
    },
    [],
  )

  /** Fly home. The app-level half of reset (cards, tour) is the caller's. */
  const resetView = useCallback(
    (duration = 900) => {
      const d = defaultsRef.current
      stateRef.current.autoRotate = true
      tweenTo(d.initialTarget, d.radius, d.theta, d.phi, duration)
    },
    [tweenTo],
  )

  /** Any deliberate input: wakes the rig and drops whatever it was doing. */
  const interrupt = useCallback(() => {
    const s = stateRef.current
    s.idleTime = 0
    s.tween = null
    s.flingTheta = 0
    s.flingPhi = 0
  }, [])

  // ---------------- pointer + wheel input ----------------
  /**
   * The input map.
   *
   *   left drag                orbit (a flick keeps gliding)
   *   right / middle drag      pan
   *   shift + left drag        pan
   *   alt (or ctrl) + drag     dolly — drag down to pull back
   *   wheel                    zoom towards the pointer
   *   ctrl + wheel             the same, at trackpad-pinch scale
   *   one finger               orbit
   *   two fingers              pinch to zoom and pan together
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

    const sample = () => {
      const [a, b] = [...pointers.values()]
      return {
        spread: Math.hypot(b.x - a.x, b.y - a.y),
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      }
    }

    /** What the cursor should look like for the drag now in progress. */
    const setCursor = () => {
      domElement.classList.toggle('dragging', s.dragging && s.mode === 'orbit')
      domElement.classList.toggle('panning', s.dragging && s.mode !== 'orbit')
    }

    /**
     * Which of the three drags a mouse button and its modifiers mean. Touch
     * and pen have no buttons and no keyboard, so they always orbit; two of
     * them is a gesture, handled separately.
     */
    const modeFor = (e) => {
      if (e.pointerType !== 'mouse') return 'orbit'
      if (e.button === 1 || e.button === 2 || e.shiftKey) return 'pan'
      // ctrl+click is a secondary click on macOS, so it mostly arrives as
      // button 2 above and lands on pan; alt is the one that always works.
      if (e.altKey || e.ctrlKey || e.metaKey) return 'dolly'
      return 'orbit'
    }

    const onPointerDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      // Deliberately not interrupt(): pressing is not yet moving, and a click
      // on empty space part-way through a fly-to should not leave the camera
      // stranded between two views. Movement cancels the tween, below.
      s.idleTime = 0
      s.flingTheta = 0
      s.flingPhi = 0
      try {
        domElement.setPointerCapture(e.pointerId)
      } catch {
        // pointer capture is best-effort; dragging still works without it
      }

      if (pointers.size === 1) {
        s.dragging = true
        s.mode = modeFor(e)
        s.lastX = e.clientX
        s.lastY = e.clientY
        s.lastMoveAt = e.timeStamp
        s.moved = 0
        setCursor()
        return
      }

      // A second finger ends the orbit and begins a gesture. It also pushes
      // `moved` past the click threshold: a pinch must never be read as a tap
      // on whatever happened to be under the fingers.
      s.dragging = false
      s.moved = CLICK_MOVE_THRESHOLD
      gesture = sample()
      setCursor()
    }

    // NOTE: `moved` is intentionally left alone here. It is reset on
    // pointerdown and read back by wasClick() from the click handlers that
    // run after this, which is how a drag is told apart from a click.
    const onPointerUp = (e) => {
      if (!pointers.delete(e.pointerId)) return
      if (pointers.size < 2) gesture = null

      if (pointers.size === 1) {
        // Back to one finger. Re-anchor on the finger still down, or the
        // camera jumps by however far apart the two of them were.
        const [remaining] = [...pointers.values()]
        s.lastX = remaining.x
        s.lastY = remaining.y
        s.lastMoveAt = e.timeStamp
        s.dragging = true
        s.mode = 'orbit'
        setCursor()
        return
      }

      if (pointers.size === 0) {
        // A pointer that came to rest before lifting is placing the view, not
        // throwing it; only a live flick is allowed to carry on.
        if (s.mode !== 'orbit' || e.timeStamp - s.lastMoveAt > FLING_STALE_MS) {
          s.flingTheta = 0
          s.flingPhi = 0
        }
        s.dragging = false
        setCursor()
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
            zoomTo(s.goalRadius * (gesture.spread / now.spread))
          }
          panBy(now.x - gesture.x, now.y - gesture.y)
        }
        gesture = now
        interrupt()
        return
      }

      if (!s.dragging) return
      const dx = e.clientX - s.lastX
      const dy = e.clientY - s.lastY
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.moved += Math.abs(dx) + Math.abs(dy)

      if (s.mode === 'pan') {
        panBy(dx, dy)
      } else if (s.mode === 'dolly') {
        // down pulls back, the same direction the wheel goes
        zoomTo(s.goalRadius * Math.exp(dy * DOLLY_SPEED))
      } else {
        const dTheta = -dx * DRAG_SPEED
        const dPhi = -dy * DRAG_SPEED
        s.goalTheta += dTheta
        s.goalPhi = clampPhi(s.goalPhi + dPhi)
        // Speed for the glide after release, smoothed across samples so one
        // stuttered frame near the end cannot decide the whole throw.
        const dt = Math.max(8, e.timeStamp - s.lastMoveAt) / 1000
        s.flingTheta = clamp(s.flingTheta * 0.5 + (dTheta / dt) * 0.5, -FLING_MAX, FLING_MAX)
        s.flingPhi = clamp(s.flingPhi * 0.5 + (dPhi / dt) * 0.5, -FLING_MAX, FLING_MAX)
      }

      s.lastMoveAt = e.timeStamp
      s.idleTime = 0
      s.tween = null // a manual drag cancels any in-flight camera fly-to
    }

    const onWheel = (e) => {
      e.preventDefault()
      // A trackpad pinch is delivered as ctrl+wheel, with deltas an order of
      // magnitude smaller than a mouse notch; scaled apart, both land on the
      // same felt amount of zoom.
      const k = e.ctrlKey ? PINCH_WHEEL_ZOOM : WHEEL_ZOOM
      zoomAt(s.goalRadius * Math.exp(wheelPixels(e) * k), e.clientX, e.clientY)
      interrupt()
    }

    /** Right-drag pans, so the menu it would otherwise open has to go. */
    const onContextMenu = (e) => e.preventDefault()

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointerup', onPointerUp)
    // a cancelled touch never sends pointerup, and would otherwise sit in the
    // map forever, wedging the rig in gesture mode
    domElement.addEventListener('pointercancel', onPointerUp)
    domElement.addEventListener('pointerleave', onPointerUp)
    domElement.addEventListener('pointermove', onPointerMove)
    domElement.addEventListener('contextmenu', onContextMenu)
    if (d.wheelZoom) domElement.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointercancel', onPointerUp)
      domElement.removeEventListener('pointerleave', onPointerUp)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('contextmenu', onContextMenu)
      domElement.removeEventListener('wheel', onWheel)
      domElement.classList.remove('dragging', 'panning')
    }
  }, [domElement, camera, interrupt, panBy, zoomAt, zoomTo])

  // ---------------- keyboard ----------------
  /**
   * The same three moves, for a reader who is not holding a mouse: arrows
   * orbit, shift+arrows pan, +/- zoom, and 0 asks for the opening framing.
   *
   * Held keys are collected here and spent in the frame loop, so the camera
   * moves at a rate per second rather than at whatever the OS key-repeat
   * happens to be.
   *
   * Everything is gated on :focus-visible and swallowed with
   * stopPropagation, which is what keeps this from stealing the viewer's
   * arrow-key stage transport: clicking the canvas leaves an ordinary focus
   * that :focus-visible does not match, so the keys reach the window handler
   * exactly as they did before, and only a reader who *tabbed* here gets the
   * camera.
   */
  useEffect(() => {
    if (!domElement || !defaultsRef.current.keyboard) return
    const s = stateRef.current

    domElement.tabIndex = 0
    domElement.classList.add('orbit-keyboard')
    // A tab stop with no name is a dead end in a screen reader, and a <canvas>
    // has nothing to read. This names the control, not the picture: what the
    // reader has landed on is the camera.
    if (!domElement.getAttribute('aria-label')) {
      domElement.setAttribute(
        'aria-label',
        'Camera for the 3D model. Arrow keys orbit, shift with the arrows pans, ' +
          'plus and minus zoom, and 0 returns to the opening view.',
      )
    }

    const HANDLED = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      '+',
      '=',
      '-',
      '_',
      '0',
    ])

    /**
     * Only a keyboard focus counts. Very old engines have no :focus-visible
     * selector at all and throw on it; there, the camera keys simply never
     * arm, and the arrows go on doing what they did before.
     */
    const keyboardFocused = () => {
      try {
        return domElement.matches(':focus-visible')
      } catch {
        return false
      }
    }

    const onKeyDown = (e) => {
      if (!HANDLED.has(e.key) || e.metaKey || e.ctrlKey || e.altKey) return
      if (!keyboardFocused()) return
      e.preventDefault()
      e.stopPropagation()
      if (e.key === '0') {
        // Reset is app state as much as camera state; if nobody claimed it,
        // do the camera half rather than nothing.
        if (resetRef.current) resetRef.current()
        else resetView()
        return
      }
      s.keys.add(e.shiftKey ? `shift+${e.key}` : e.key)
      interrupt()
    }

    /**
     * Shift is read at keydown, so a key pressed shifted and released
     * unshifted (or the reverse) would otherwise stay held forever. Clear
     * both spellings.
     */
    const onKeyUp = (e) => {
      s.keys.delete(e.key)
      s.keys.delete(`shift+${e.key}`)
    }
    const onBlur = () => s.keys.clear()

    domElement.addEventListener('keydown', onKeyDown)
    domElement.addEventListener('keyup', onKeyUp)
    domElement.addEventListener('blur', onBlur)
    window.addEventListener('blur', onBlur)

    return () => {
      domElement.removeEventListener('keydown', onKeyDown)
      domElement.removeEventListener('keyup', onKeyUp)
      domElement.removeEventListener('blur', onBlur)
      window.removeEventListener('blur', onBlur)
      domElement.classList.remove('orbit-keyboard')
      domElement.removeAttribute('tabindex')
      domElement.removeAttribute('aria-label')
      s.keys.clear()
    }
  }, [domElement, interrupt, resetView])

  /** Spend the held keys for this frame. Returns true if anything moved. */
  const applyKeys = useCallback(
    (dt) => {
      const s = stateRef.current
      if (s.keys.size === 0) return false
      /** True if any of these spellings of the key is down. */
      const held = (...keys) => keys.some((k) => s.keys.has(k))

      // A shifted arrow slides the view the way the same drag would: left
      // looks left, which walks the scene to the right.
      const px = KEY_PAN * dt
      const panX = (held('shift+ArrowLeft') ? 1 : 0) - (held('shift+ArrowRight') ? 1 : 0)
      const panY = (held('shift+ArrowUp') ? 1 : 0) - (held('shift+ArrowDown') ? 1 : 0)
      if (panX || panY) panBy(panX * px, panY * px)

      const rad = KEY_ORBIT * dt
      const spin = (held('ArrowLeft') ? 1 : 0) - (held('ArrowRight') ? 1 : 0)
      const tilt = (held('ArrowDown') ? 1 : 0) - (held('ArrowUp') ? 1 : 0)
      if (spin) s.goalTheta += spin * rad
      if (tilt) s.goalPhi = clampPhi(s.goalPhi + tilt * rad)

      // '+' is a shifted '=' on most layouts, and an unshifted key on some
      const zoom = (held('+', '=', 'shift+=', 'shift++') ? 1 : 0) - (held('-', '_', 'shift+-', 'shift+_') ? 1 : 0)
      if (zoom) zoomTo(s.goalRadius * Math.exp(-zoom * KEY_ZOOM * dt))

      const moved = Boolean(panX || panY || spin || tilt || zoom)
      if (moved) s.idleTime = 0
      return moved
    },
    [panBy, zoomTo],
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
      // The tween owns both ends at once: it is already eased, and letting
      // the damping chase it as well would arrive late and undershoot. The
      // goal follows it so a drag that interrupts picks up from here.
      s.goalTarget.copy(s.target)
      s.goalTheta = s.theta
      s.goalPhi = s.phi
      s.goalRadius = s.radius
      updateCamera()
      if (t >= 1) s.tween = null
      s.idleTime = 0
      return
    }

    let active = applyKeys(dt)

    // The glide after a released flick, decaying to nothing.
    if (Math.abs(s.flingTheta) > FLING_MIN || Math.abs(s.flingPhi) > FLING_MIN) {
      s.goalTheta += s.flingTheta * dt
      s.goalPhi = clampPhi(s.goalPhi + s.flingPhi * dt)
      const decay = Math.exp(-dt / FLING_TAU)
      s.flingTheta *= decay
      s.flingPhi *= decay
      s.idleTime = 0
      active = true
    } else {
      s.flingTheta = 0
      s.flingPhi = 0
    }

    s.idleTime += dt
    if (s.autoRotate && !s.dragging && s.idleTime > IDLE_BEFORE_AUTOROTATE) {
      s.goalTheta += d.autoRotateSpeed * dt
      active = true
    }

    // Ease the live view towards the goal. Exponential, so the rate is the
    // same whatever the frame rate — a fixed per-frame fraction would drift
    // faster on a 120Hz screen than on a 60Hz one.
    const k = 1 - Math.exp(-dt / SETTLE_TAU)
    const dTheta = s.goalTheta - s.theta
    const dPhi = s.goalPhi - s.phi
    const dRadius = s.goalRadius - s.radius
    const dTarget = s.goalTarget.distanceToSquared(s.target)
    const settling =
      Math.abs(dTheta) > SETTLE_EPSILON ||
      Math.abs(dPhi) > SETTLE_EPSILON ||
      Math.abs(dRadius) > SETTLE_EPSILON ||
      dTarget > SETTLE_EPSILON * SETTLE_EPSILON

    if (settling) {
      s.theta += dTheta * k
      s.phi += dPhi * k
      s.radius += dRadius * k
      s.target.lerp(s.goalTarget, k)
    } else if (active) {
      // close enough that another lerp would be noise; land exactly
      s.theta = s.goalTheta
      s.phi = s.goalPhi
      s.radius = s.goalRadius
      s.target.copy(s.goalTarget)
    } else {
      return
    }

    updateCamera()
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
      reset: resetView,
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
       * What the camera is pointed at. Moves on a pan, on a zoom towards the
       * pointer, and on every fly-to. Sampled per frame like `radius`, and
       * for the same reason.
       *
       * This is the rig's own vector, mutated in place: read from it, never
       * keep a reference to it.
       */
      get target() {
        return stateRef.current.target
      },
      /**
       * True when the gesture that just ended was a click rather than a drag.
       * Read from onClick handlers to suppress selection while orbiting — and
       * it covers pans and dollies too, since every drag mode accumulates the
       * same `moved` total.
       */
      wasClick() {
        return stateRef.current.moved < CLICK_MOVE_THRESHOLD
      },
    }),
    [tweenTo, resetView],
  )
}
