import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colorAt } from './path'
import { FLOW_SPEED } from './systems'

/**
 * The water running the active system's route: a faint line tracing the whole
 * path, a stream of bubbles travelling it, and the grit the first stage takes
 * out — plus the kitchen taps the route does not reach, pouring whatever they
 * carry under this system, as the same line and bubbles on a path of their own.
 *
 * Remount (key by system) when the system changes so particle state starts
 * fresh on the new path.
 *
 * The water keeps its own clock rather than reading the renderer's, so that
 * `paused` can hold it: a paused walkthrough is a freeze-frame the camera can
 * still orbit around, bubbles held mid-cartridge and grit held on the face of
 * the element, and resuming picks the stream up from exactly that frame. Only
 * the water stops — the route highlight and every other transition in the
 * scene are UI motion and carry on settling.
 *
 * The clock also follows the walkthrough's seeks (`subscribe`): every second
 * the playhead is dragged or jumped, the water moves by too. So the timeline
 * is the water's time as well as the tour's — scrubbing it back runs the
 * stream backwards under the finger, a held frame moves when the bar is
 * scrubbed, and jumping to a stage lands the water where it would have been.
 */

const MAX_DELTA = 0.05
/**
 * Longest step the water's clock takes in one frame. A background tab or a
 * shader compile hands the next frame whole seconds; those are dropped. It is
 * much looser than MAX_DELTA, which paces transitions, because the water has
 * to keep to real time on a machine that is only managing a dozen frames a
 * second — slow water reads as a fault where a slow fade reads as a fade.
 */
const MAX_STALL = 0.25
const WHITE = new THREE.Color(0xffffff)

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smoothstep = (x) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

// --- route line ------------------------------------------------------------

const ROUTE_SEGMENTS = 400
const ROUTE_RADIAL = 6
/** How present the line is where it is open plumbing, and where it is buried. */
const ROUTE_ALPHA = 0.34
const ROUTE_ALPHA_BURIED = 0.12
const ROUTE_ALPHA_ACTIVE = 0.9
/** How fast the highlight slides onto a newly selected stage. */
const HIGHLIGHT_SPEED = 5

// --- the ride --------------------------------------------------------------

/**
 * Stations at which the route is sampled for the frame loop to read. Hundreds
 * of bubbles asking the curve where it is every frame is the one place this
 * scene could get expensive, so the answer is worked out once per system: the
 * table is a tenth of the cost of the curve and, unlike it, allocates nothing.
 *
 * High enough that reading between two stations barely cuts the corner — under
 * two millimetres at the tightest elbow any of the three routes turns, which
 * is a fraction of a bubble and a twentieth of the pipe it is inside. That
 * costs 75KB per system to hold and a millisecond to build.
 */
const RIDE_SAMPLES = 1600

// --- bubbles ---------------------------------------------------------------

/**
 * Bubble radius, and how far off the centreline a bubble may ride, both as
 * fractions of the system's stream radius. Together with the size range below
 * they keep the stream the width it has always been — the largest bubble at
 * the edge of the bore reaches exactly as far out as the old single drop did —
 * while everything inside it is a third the size.
 */
const BUBBLE_SCALE = 0.32
const BUBBLE_SPREAD = 0.85
const SIZE_MIN = 0.6
const SIZE_MAX = 1.35

/**
 * One bubble per this much route — measured in stream radii, not in metres.
 *
 * The three systems carry water of different gauges: the under-sink unit's is
 * half the width of the mains, and the camera comes in as close as the unit is
 * small. So what has to hold steady between them is the gap between bubbles
 * relative to a bubble, which a fixed distance does not give — it leaves the
 * under-sink run reading as scattered specks while the mains reads as a stream.
 *
 * Tuned against the open pipe, where bubbles are furthest apart: this leaves
 * about two bubbles' worth of clear water between them there, closing to
 * nearly nothing where they bunch through media.
 */
const BUBBLE_GAP = 0.8
const BUBBLE_MIN = 120
const BUBBLE_MAX = 900
/**
 * How much of the gap to the next bubble one may be nudged along the route.
 * Under one, so the queue keeps its order and bubbles still cannot collide,
 * but enough that they do not arrive in ranks.
 */
const PHASE_JITTER = 0.8
/** Radians per second a bubble turns around the axis of the pipe. */
const SWIRL_MIN = 0.5
const SWIRL_MAX = 1.6
/** How long a bubble is drawn: at rest, and the extra it earns at full pace. */
const STRETCH_STILL = 0.85
const STRETCH_RUNNING = 0.95
/** Bubbles grow in at the source and shrink out at the outlet, rather than popping. */
const EDGE_FADE = 0.02
/** How far bubbles lift toward white: a little always, more on the selected stage. */
const SHEEN = 0.14
const SHEEN_ACTIVE = 0.34
/**
 * How much of the bore the stream gives up once a calming stage has worked on
 * it, and the extra lift toward white that comes with it. Upstream the bubbles
 * fill the pipe and swirl; downstream they run as a tight, bright core.
 */
const CALM_TIGHTEN = 0.72
const CALM_SHEEN = 0.1

// --- grit ------------------------------------------------------------------

const GRIT_COUNT = 20
/** Seconds a caught speck sits on the element before it fades from view. */
const GRIT_DWELL = 1.2
/** Speck radius, again as a fraction of the stream radius: a coarse bubble. */
const GRIT_SCALE = 0.34

/**
 * A thin tube along the whole route, coloured with the same gradient the water
 * takes so the path reads as a progression even while nothing is moving. The
 * stretch belonging to the selected stage brightens and comes forward.
 *
 * It is deliberately thinner than the narrowest pipe it runs inside: where
 * real plumbing is modelled the line hides within it, and it only shows in the
 * gaps — the buried mains, the run under the floor, and inside the cartridges.
 *
 * Colour AND opacity both come from the vertex colours, which is why the
 * attribute is RGBA: three switches the shader to per-vertex alpha when the
 * colour attribute has four components, so the whole line stays one draw call
 * however it is lit up.
 */
function RouteLine({ path, radius, activeSpan, segments = ROUTE_SEGMENTS }) {
  const mesh = useRef()
  const pending = useRef(true)

  const { geometry, rings, level } = useMemo(() => {
    const geometry = new THREE.TubeGeometry(path.curve, segments, radius, ROUTE_RADIAL, false)
    const ringCount = segments + 1
    const perRing = ROUTE_RADIAL + 1
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(ringCount * perRing * 4), 4),
    )

    // TubeGeometry samples the curve by arc length, so ring i sits at u =
    // i/segments — the same measure the stage spans are in.
    const colour = new THREE.Color()
    const rings = new Float32Array(ringCount * 4)
    let leg = 0
    for (let i = 0; i < ringCount; i++) {
      const u = i / segments
      while (leg < path.legs.length - 1 && u > path.legs[leg].u1) leg++
      colorAt(path.stops, u, colour)
      rings[i * 4] = colour.r
      rings[i * 4 + 1] = colour.g
      rings[i * 4 + 2] = colour.b
      rings[i * 4 + 3] = path.legs[leg].buried ? ROUTE_ALPHA_BURIED : ROUTE_ALPHA
    }

    return { geometry, rings, level: new Float32Array(ringCount) }
  }, [path, radius, segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    const attr = mesh.current?.geometry.getAttribute('color')
    if (!attr) return
    const array = attr.array
    const perRing = ROUTE_RADIAL + 1
    const step = Math.min(1, Math.min(delta, MAX_DELTA) * HIGHLIGHT_SPEED)
    const force = pending.current
    let changed = force

    for (let i = 0; i < level.length; i++) {
      const u = i / segments
      const target = activeSpan && u >= activeSpan[0] && u <= activeSpan[1] ? 1 : 0
      const prev = level[i]
      const next = Math.abs(target - prev) < 0.004 ? target : prev + (target - prev) * step
      if (next === prev && !force) continue
      level[i] = next
      changed = true

      const boost = 1 + 0.5 * next
      const base = rings[i * 4 + 3]
      const alpha = base + (ROUTE_ALPHA_ACTIVE - base) * next
      for (let j = 0; j < perRing; j++) {
        const k = (i * perRing + j) * 4
        array[k] = rings[i * 4] * boost
        array[k + 1] = rings[i * 4 + 1] * boost
        array[k + 2] = rings[i * 4 + 2] * boost
        array[k + 3] = alpha
      }
    }

    pending.current = false
    if (changed) attr.needsUpdate = true
  })

  return (
    <mesh ref={mesh} geometry={geometry} renderOrder={2}>
      <meshBasicMaterial vertexColors transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/**
 * The route sampled by arc length: a point and a frame — across, along, and
 * the third axis — at each of RIDE_SAMPLES stations.
 *
 * The frame is carried forward from one station to the next rather than worked
 * out afresh at each, which is what keeps it from spinning: a Frenet frame
 * flips over on a straight run and again at every inflection, and bubbles hung
 * off one would jump across the pipe as they passed. Transporting the previous
 * across-axis onto each new station instead gives the frame that turns as
 * little as the route allows, so a bubble riding the top of the bore stays at
 * the top of it the whole way down.
 */
function buildRide(curve, count = RIDE_SAMPLES) {
  const size = (count + 1) * 3
  const ride = {
    count,
    point: new Float32Array(size),
    along: new Float32Array(size),
    across: new Float32Array(size),
    third: new Float32Array(size),
  }

  const point = new THREE.Vector3()
  const along = new THREE.Vector3()
  const across = new THREE.Vector3()
  const third = new THREE.Vector3()
  const helper = new THREE.Vector3()

  const seed = () => {
    helper.set(0, 1, 0)
    if (Math.abs(along.y) > 0.9) helper.set(1, 0, 0)
    across.crossVectors(along, helper)
  }

  for (let i = 0; i <= count; i++) {
    const u = i / count
    curve.getPointAt(u, point)
    curve.getTangentAt(u, along)

    if (i === 0) seed()
    else {
      // drop the previous across-axis onto the plane square to the new tangent
      across.addScaledVector(along, -across.dot(along))
      if (across.lengthSq() < 1e-8) seed()
    }
    across.normalize()
    third.crossVectors(along, across)

    const k = i * 3
    point.toArray(ride.point, k)
    along.toArray(ride.along, k)
    across.toArray(ride.across, k)
    third.toArray(ride.third, k)
  }

  return ride
}

const lerp3 = (values, i, f, target) => {
  const a = i * 3
  const b = a + 3
  return target.set(
    values[a] + (values[b] - values[a]) * f,
    values[a + 1] + (values[b + 1] - values[a + 1]) * f,
    values[a + 2] + (values[b + 2] - values[a + 2]) * f,
  )
}

/**
 * Reads the route at distance `u` into `at`, without touching the curve.
 *
 * The axes are normalised after interpolating because they go on to be the
 * columns of an instance matrix: a pair of unit vectors lerped across a turn
 * comes out short, and a bubble rounding a tight elbow would pinch.
 */
function readRide(ride, u, at) {
  const x = clamp01(u) * ride.count
  const i = Math.min(ride.count - 1, x | 0)
  const f = x - i
  lerp3(ride.point, i, f, at.point)
  lerp3(ride.along, i, f, at.along).normalize()
  lerp3(ride.across, i, f, at.across).normalize()
  lerp3(ride.third, i, f, at.third).normalize()
  return at
}

const rideScratch = () => ({
  point: new THREE.Vector3(),
  along: new THREE.Vector3(),
  across: new THREE.Vector3(),
  third: new THREE.Vector3(),
})

/**
 * The water itself: a column of fine bubbles rather than a line of drops.
 *
 * Along the route they are spaced evenly in phase, which the path turns into
 * distance — so they crowd together where the water slows through a cartridge
 * and draw apart again in the open pipe, and can never overtake one another.
 * Across it each bubble rides at its own distance from the centreline and
 * turns slowly around it, so the stream churns as it travels instead of
 * sliding past as a rigid column. Each one also stretches along its direction
 * of travel in proportion to how fast it is going, so a slow bubble balls up
 * and a fast one streaks.
 *
 * Where the path declares a bore — the run up inside a kitchen tap, chrome
 * thinner than the stream — the whole cross-section is pulled in to fit, so
 * no bubble surfaces through the wall; past the mouth the path lets it open
 * up again over a few centimetres.
 *
 * `rate` is trips per second; the route runs at FLOW_SPEED, a tap stream at
 * whatever keeps its bubbles moving as the route's do leaving the nozzle.
 * `fadeOut` is the fraction of the path over which bubbles shrink away at the
 * end, again so a short stream can match the route it is standing in for.
 */
function Bubbles({
  path,
  ride,
  stream,
  count,
  activeSpan,
  clock,
  calmSpan,
  rate = FLOW_SPEED,
  fadeOut = EDGE_FADE,
}) {
  const mesh = useRef()

  const geometry = useMemo(
    () => new THREE.SphereGeometry(stream * BUBBLE_SCALE, 7, 5),
    [stream],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  /**
   * What makes one bubble itself: its place in the queue, where in the bore it
   * rides, which way and how fast it turns, and how big it is. All fixed for
   * the life of the stream, so its spacing in time holds however the water
   * speeds up or slows down.
   */
  const bubbles = useMemo(() => {
    const phase = new Float32Array(count)
    const reach = new Float32Array(count)
    const angle = new Float32Array(count)
    const swirl = new Float32Array(count)
    const size = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      phase[i] = (i + (Math.random() - 0.5) * PHASE_JITTER) / count
      // square-rooted, so bubbles land evenly across the bore rather than
      // bunching along the centreline
      reach[i] = Math.sqrt(Math.random())
      angle[i] = Math.random() * Math.PI * 2
      swirl[i] =
        (Math.random() < 0.5 ? -1 : 1) * (SWIRL_MIN + Math.random() * (SWIRL_MAX - SWIRL_MIN))
      size[i] = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN)
    }
    return { phase, reach, angle, swirl, size }
  }, [count])

  const scratch = useMemo(
    () => ({ at: rideScratch(), matrix: new THREE.Matrix4(), colour: new THREE.Color() }),
    [],
  )

  // Give the instances their colour buffer before the first render, so the
  // material compiles with per-instance colour rather than recompiling later.
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3).fill(1), 3)
    m.instanceColor.setUsage(THREE.DynamicDrawUsage)
  }, [count])

  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const { at, matrix, colour } = scratch
    const { point, along, across, third } = at
    const time = clock.time
    // Scrubbing back past the start takes the clock negative; `%` keeps the sign.
    let base = (time * rate) % 1
    if (base < 0) base += 1
    const spread = stream * BUBBLE_SPREAD
    const bubble = stream * BUBBLE_SCALE

    for (let i = 0; i < count; i++) {
      let phase = base + bubbles.phase[i]
      if (phase >= 1) phase -= 1
      else if (phase < 0) phase += 1

      const u = path.distanceAt(phase)
      readRide(ride, u, at)

      // where across the bore this bubble has turned to by now
      const turn = bubbles.angle[i] + time * bubbles.swirl[i]
      // 0 approaching the calming element, 1 once through it. Only the reach
      // is damped, not the rate of turn: slowing the rate as a function of
      // position would make the angle jump as the bubble moves.
      const calm = calmSpan
        ? smoothstep((u - calmSpan[0]) / (calmSpan[1] - calmSpan[0]))
        : 0
      let reach = bubbles.reach[i] * spread * (1 - CALM_TIGHTEN * calm)

      const size = bubbles.size[i] * smoothstep(u / EDGE_FADE) * smoothstep((1 - u) / fadeOut)
      // Fast water streaks. It reads as speed, and it is also what keeps the
      // open runs — where the bubbles are furthest apart — from breaking up
      // into a dotted line: a streaked bubble spans most of the gap it opens.
      const stretch = STRETCH_STILL + path.paceAt(u) * STRETCH_RUNNING
      // squash the other two axes to keep the bubble's volume roughly constant
      let wide = (1 / Math.sqrt(stretch)) * size
      const long = stretch * size

      // Inside a bore, pull the bubble in and shrink it in the same
      // proportion, so its far edge just reaches the wall and no further.
      const fit = path.boreAt(u) / (reach + wide * bubble)
      if (fit < 1) {
        reach *= fit
        wide *= fit
      }
      const offA = Math.cos(turn) * reach
      const offB = Math.sin(turn) * reach

      // The sphere's poles point along the route, so the frame drops straight
      // into the instance matrix as its three axes.
      matrix.set(
        across.x * wide, along.x * long, third.x * wide,
        point.x + across.x * offA + third.x * offB,
        across.y * wide, along.y * long, third.y * wide,
        point.y + across.y * offA + third.y * offB,
        across.z * wide, along.z * long, third.z * wide,
        point.z + across.z * offA + third.z * offB,
        0, 0, 0, 1,
      )
      m.setMatrixAt(i, matrix)

      colorAt(path.stops, u, colour)
      const sheen = activeSpan && u >= activeSpan[0] && u <= activeSpan[1] ? SHEEN_ACTIVE : SHEEN
      m.setColorAt(i, colour.lerp(WHITE, Math.min(1, sheen + CALM_SHEEN * calm)))
    }

    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

/**
 * Grit riding in with the raw water. Each speck is given a point on the face
 * of the first stage's element to be caught at — biased toward the leading
 * edge, the way sediment actually builds up — then it sits there for a moment
 * before fading, so the first cartridge is visibly doing something.
 */
function Grit({ path, ride, radius, clock }) {
  const mesh = useRef()

  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 6, 5), [radius])
  useEffect(() => () => geometry.dispose(), [geometry])

  const specks = useMemo(() => {
    const firstStage = path.stageOrder[0]
    const element = path.mediaSpans[firstStage] ?? path.spans[firstStage]
    /** Spawn only along the raw-water run, never past the filter. */
    const spawnLimit = path.phaseAt(element[1])
    const spread = radius * 2.4

    const reset = (g) => {
      g.phase = Math.random() * spawnLimit
      g.caughtU = element[0] + (element[1] - element[0]) * Math.random() ** 2
      g.held = 0
      g.jitter.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
      )
      g.size = 0.7 + Math.random() * 0.6
    }

    const list = Array.from({ length: GRIT_COUNT }, () => {
      const g = { phase: 0, caughtU: 0, held: 0, size: 1, jitter: new THREE.Vector3() }
      reset(g)
      return g
    })
    return { list, reset }
  }, [path, radius])

  const scratch = useMemo(() => ({ dummy: new THREE.Object3D(), at: rideScratch() }), [])

  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const dt = clock.dt
    const { dummy, at } = scratch
    const { list, reset } = specks

    list.forEach((g, i) => {
      if (g.held > 0) {
        g.held += dt
        if (g.held > GRIT_DWELL) reset(g)
      } else {
        g.phase += dt * FLOW_SPEED
        if (g.phase >= 1) reset(g)
        else if (path.distanceAt(g.phase) >= g.caughtU) g.held = 1e-4
      }

      const u = g.held > 0 ? g.caughtU : path.distanceAt(g.phase)
      readRide(ride, u, at)

      const fade = g.held > 0 ? 1 - smoothstep(g.held / GRIT_DWELL) : 1
      const size = g.size * fade * smoothstep(u / EDGE_FADE)

      dummy.position.copy(at.point).add(g.jitter)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })

    m.instanceMatrix.needsUpdate = true
  })

  useLayoutEffect(() => {
    mesh.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, GRIT_COUNT]} frustumCulled={false}>
      <meshStandardMaterial color={0x6b5433} roughness={0.9} metalness={0} />
    </instancedMesh>
  )
}

// --- pouring taps ----------------------------------------------------------

/** Stations along a tap stream's ride: a straight fall needs few. */
const STREAM_SAMPLES = 32
const STREAM_SEGMENTS = 8
/**
 * A calm span the whole path lies beyond. Out of a tap, water falls as a tight
 * column whatever it is — turbulence is something the stream shows inside a
 * pipe — so every tap stream is calmed from the start.
 */
const CALMED = [-1, -0.5]
/** The whole of a tap stream, for lighting it up along with the route's outlet. */
const WHOLE = [0, 1]

/**
 * Water pouring from a kitchen tap the route does not reach — the mixer while
 * the under-sink unit is selected, say. The same line and bubbles as the
 * route, run down the tap's own short path from inside the nozzle into the
 * sink, on the same clock, so it pauses and scrubs with everything else.
 *
 * `spacing` and `speed` are the route's own as its water leaves the nozzle —
 * metres between bubbles, and metres per second — and `lit` says whether the
 * route's outlet is on the selected stage, so this stream brightens with it.
 * Together they keep the two taps reading as the same water; `fade` is the
 * route's shrink-out at its end, in metres.
 */
function TapStream({ path, stream, routeRadius, clock, spacing, speed, fade, lit }) {
  const ride = useMemo(() => buildRide(path.curve, STREAM_SAMPLES), [path])
  const count = Math.max(1, Math.round(path.length / spacing))
  const activeSpan = lit ? WHOLE : null
  return (
    <group>
      <RouteLine path={path} radius={routeRadius} activeSpan={activeSpan} segments={STREAM_SEGMENTS} />
      <Bubbles
        path={path}
        ride={ride}
        stream={stream}
        count={count}
        activeSpan={activeSpan}
        clock={clock}
        calmSpan={CALMED}
        rate={speed / path.length}
        fadeOut={Math.min(0.5, fade / path.length)}
      />
    </group>
  )
}

export default function WaterFlow({ system, currentStage, paused = false, subscribe }) {
  const { path, pulseRadius, routeRadius, laminar, pouring } = system
  const activeSpan = path.spans[currentStage] ?? null
  /** The element that calms the water — the third stage, where set. */
  const calmSpan = laminar ? (path.mediaSpans[path.stageOrder[2]] ?? null) : null
  const count = Math.max(
    BUBBLE_MIN,
    Math.min(BUBBLE_MAX, Math.round(path.length / (pulseRadius * BUBBLE_GAP))),
  )
  const ride = useMemo(() => buildRide(path.curve), [path])

  /**
   * How the route's water moves as it leaves the outlet, for the plain tap
   * streams to match: metres of route it covers per trip there, hence metres
   * per second and metres between bubbles.
   */
  const outlet = path.rateAt(1) * path.length
  const streamSpeed = outlet * FLOW_SPEED
  const streamSpacing = outlet / count
  const streamFade = EDGE_FADE * path.length
  /** The selected stage reaches the end of the route, so its outlet is lit. */
  const outletLit = activeSpan !== null && activeSpan[1] >= 1

  /**
   * The water's clock: seconds it has been running, and how far it moved this
   * frame. Advanced at a negative priority so it is stepped before the bubbles
   * and grit read it — r3f runs frame callbacks in priority order, and only a
   * priority above zero takes over rendering.
   *
   * Seeks arrive between frames and are banked in `jump`, then taken in one
   * step with the next frame's time so the bubbles and grit see a single
   * consistent delta. A jump is not capped the way a stall is: it is the
   * user's own doing, and can be as large or as negative as the drag was.
   */
  const clock = useMemo(() => ({ time: 0, dt: 0, jump: 0 }), [])
  useEffect(() => {
    if (!subscribe) return undefined
    return subscribe((_, jump) => {
      clock.jump += jump
    })
  }, [subscribe, clock])
  useFrame((_, delta) => {
    const dt = (paused ? 0 : Math.min(delta, MAX_STALL)) + clock.jump
    clock.jump = 0
    clock.time += dt
    clock.dt = dt
  }, -1)

  return (
    <group>
      <RouteLine path={path} radius={routeRadius} activeSpan={activeSpan} />
      <Bubbles
        path={path}
        ride={ride}
        stream={pulseRadius}
        count={count}
        activeSpan={activeSpan}
        clock={clock}
        calmSpan={calmSpan}
      />
      <Grit path={path} ride={ride} radius={pulseRadius * GRIT_SCALE} clock={clock} />
      {pouring.map((tap) => (
        <TapStream
          key={tap.name}
          path={tap.path}
          stream={pulseRadius}
          routeRadius={routeRadius}
          clock={clock}
          spacing={streamSpacing}
          speed={streamSpeed}
          fade={streamFade}
          lit={outletLit}
        />
      ))}
    </group>
  )
}
