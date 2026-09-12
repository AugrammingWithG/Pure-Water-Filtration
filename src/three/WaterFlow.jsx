import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colorAt } from './path'
import { FLOW_SPEED } from './systems'

/**
 * The water running the active system's route: a faint line tracing the whole
 * path, droplets travelling it, and the grit the first stage takes out.
 *
 * Remount (key by system) when the system changes so particle state starts
 * fresh on the new path.
 */

const MAX_DELTA = 0.05
const UP = new THREE.Vector3(0, 1, 0)
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

// --- droplets --------------------------------------------------------------

/**
 * One droplet per this much route, so the stream reads at the same density on
 * a three-metre run under a sink and a twenty-metre run in from the street.
 *
 * Tuned against the gap between droplets inside a cartridge, which is where
 * the eye spends its time: droplets bunch to roughly a quarter of this spacing
 * as they slow through media, and much above 0.2 the gaps there grow wider
 * than the droplets themselves and the flow reads as beads on a string rather
 * than as water.
 */
const DROPLET_SPACING = 0.21
const DROPLET_MIN = 24
const DROPLET_MAX = 120
/** Droplets grow in at the source and shrink out at the outlet, rather than popping. */
const EDGE_FADE = 0.02

// --- grit ------------------------------------------------------------------

const GRIT_COUNT = 20
/** Seconds a caught speck sits on the element before it fades from view. */
const GRIT_DWELL = 1.2

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
function RouteLine({ path, radius, activeSpan }) {
  const mesh = useRef()
  const pending = useRef(true)

  const { geometry, rings, level } = useMemo(() => {
    const geometry = new THREE.TubeGeometry(
      path.curve,
      ROUTE_SEGMENTS,
      radius,
      ROUTE_RADIAL,
      false,
    )
    const ringCount = ROUTE_SEGMENTS + 1
    const perRing = ROUTE_RADIAL + 1
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(ringCount * perRing * 4), 4),
    )

    // TubeGeometry samples the curve by arc length, so ring i sits at u =
    // i/ROUTE_SEGMENTS — the same measure the stage spans are in.
    const colour = new THREE.Color()
    const rings = new Float32Array(ringCount * 4)
    let leg = 0
    for (let i = 0; i < ringCount; i++) {
      const u = i / ROUTE_SEGMENTS
      while (leg < path.legs.length - 1 && u > path.legs[leg].u1) leg++
      colorAt(path.stops, u, colour)
      rings[i * 4] = colour.r
      rings[i * 4 + 1] = colour.g
      rings[i * 4 + 2] = colour.b
      rings[i * 4 + 3] = path.legs[leg].buried ? ROUTE_ALPHA_BURIED : ROUTE_ALPHA
    }

    return { geometry, rings, level: new Float32Array(ringCount) }
  }, [path, radius])

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
      const u = i / ROUTE_SEGMENTS
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
 * The water itself. Droplets are spaced evenly in phase, which the path turns
 * into distance — so they crowd together where the water slows through a
 * cartridge and draw apart again in the open pipe, without ever colliding.
 * Each one also stretches along its direction of travel in proportion to how
 * fast it is going, so a slow droplet balls up and a fast one streaks.
 */
function Droplets({ path, radius, count, activeSpan }) {
  const mesh = useRef()

  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 10, 8), [radius])
  useEffect(() => () => geometry.dispose(), [geometry])

  /** A little size variation stops the stream reading as beads on a string. */
  const sizes = useMemo(
    () => Float32Array.from({ length: count }, () => 0.78 + Math.random() * 0.5),
    [count],
  )

  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      point: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      colour: new THREE.Color(),
      quat: new THREE.Quaternion(),
    }),
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

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const { dummy, point, tangent, colour, quat } = scratch
    const base = (state.clock.elapsedTime * FLOW_SPEED) % 1

    for (let i = 0; i < count; i++) {
      let phase = base + i / count
      if (phase >= 1) phase -= 1

      const u = path.distanceAt(phase)
      path.curve.getPointAt(u, point)
      path.curve.getTangentAt(u, tangent)

      const stretch = 0.85 + path.paceAt(u) * 0.8
      // squash the other two axes to keep the droplet's volume roughly constant
      const squash = 1 / Math.sqrt(stretch)
      const size = sizes[i] * smoothstep(u / EDGE_FADE) * smoothstep((1 - u) / EDGE_FADE)

      quat.setFromUnitVectors(UP, tangent)
      dummy.position.copy(point)
      dummy.quaternion.copy(quat)
      dummy.scale.set(squash * size, stretch * size, squash * size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)

      colorAt(path.stops, u, colour)
      if (activeSpan && u >= activeSpan[0] && u <= activeSpan[1]) colour.lerp(WHITE, 0.22)
      m.setColorAt(i, colour)
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
function Grit({ path, radius }) {
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

  const scratch = useMemo(
    () => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3() }),
    [],
  )

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, MAX_DELTA)
    const { dummy, point } = scratch
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
      path.curve.getPointAt(u, point)

      const fade = g.held > 0 ? 1 - smoothstep(g.held / GRIT_DWELL) : 1
      const size = g.size * fade * smoothstep(u / EDGE_FADE)

      dummy.position.copy(point).add(g.jitter)
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

export default function WaterFlow({ system, currentStage }) {
  const { path, pulseRadius, routeRadius } = system
  const activeSpan = path.spans[currentStage] ?? null
  const count = Math.max(
    DROPLET_MIN,
    Math.min(DROPLET_MAX, Math.round(path.length / DROPLET_SPACING)),
  )

  return (
    <group>
      <RouteLine path={path} radius={routeRadius} activeSpan={activeSpan} />
      <Droplets path={path} radius={pulseRadius} count={count} activeSpan={activeSpan} />
      <Grit path={path} radius={pulseRadius * 0.55} />
    </group>
  )
}
