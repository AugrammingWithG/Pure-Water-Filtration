import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, MAX_DELTA } from './common'

/**
 * Stage 1 — the coarse half of graduated filtering, and the bed it builds.
 *
 * WaterFlow's Grit carries the fine sediment: specks that work into the
 * element and are caught at their own depth. This adds everything around it —
 * the grains too big to get in at all, the pleated element they pile onto, and
 * the load that builds up through the media.
 *
 * Four things, and the reason there are four is that one thin particle stream
 * reads as noise against the 850 bubbles sharing the same bore:
 *
 *   element  the pleated cartridge, so there is something to be stopped *by*
 *   grains   tumbling rock stopped dead at its face, then settling
 *   cake     a bed on the face that grows in height as grains land on it
 *   held     specks caught through the depth, surfacing as the bed loads up
 *
 * Grains and held specks are instanced, and fade by shrinking rather than by
 * opacity: an InstancedMesh has no per-instance alpha without a custom shader,
 * and scale costs nothing extra because the matrix is written every frame
 * anyway.
 */

/** Rock stopped at the face. Coarse enough to read against the bubble stream. */
const GRAIN_COUNT = 20
const GRAIN_SCALE = 0.95
/** Specks held in the depth of the media, revealed as the bed loads up. */
const HELD_COUNT = 28
const HELD_SCALE = 0.34

const GRAIN_COLOR = 0x4f3d21
const BED_COLOR = 0x6b5433
const ELEMENT_COLOR = 0xe9dfcc
/** Target the element tints toward as it clogs. */
const BED = new THREE.Color(BED_COLOR)

/** Settle onto the cake, sit there, then shrink away into it. */
const SETTLE = 0.4
const HOLD = 0.7
const FADE = 0.55

/** Load builds with every capture and bleeds off, so the bed breathes. */
const LOAD_PER_CAPTURE = 0.16
const LOAD_DECAY = 0.11
/** How much of the cake is already there before anything lands. */
const CAKE_BASE = 0.25

const rand = (a, b) => a + Math.random() * (b - a)

/**
 * The pleated cartridge: a cylinder pushed in and out around its
 * circumference. Real sediment elements are folded like this to fit more area
 * into the same bore, and the folds give the grains something to land against.
 */
function pleatedGeometry(radius, height) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const ripple = 1 + 0.14 * Math.sin(Math.atan2(z, x) * 14)
    pos.setX(i, x * ripple)
    pos.setZ(i, z * ripple)
  }
  geo.computeVertexNormals()
  return geo
}

export default function SedimentCapture({ path, radius = 0.09, streamRadius = 0.024 }) {
  const grainMesh = useRef()
  const heldMesh = useRef()
  const cake = useRef()
  const cakeMat = useRef()
  const elementMat = useRef()
  const load = useRef(0)

  /** The first stage's element, and the bed that forms at its mouth. */
  const bed = useMemo(() => {
    const stage = path.stageOrder[0]
    const element = path.mediaSpans[stage] ?? path.spans[stage]
    const face = path.curve.getPointAt(element[0])
    const floor = path.curve.getPointAt(element[1])
    const drop = Math.sign(floor.y - face.y) || -1
    return {
      faceU: element[0],
      /** Never spawn past the filter — this grit only exists in raw water. */
      spawnLimit: path.phaseAt(element[0]),
      face,
      drop,
      depth: Math.abs(face.y - floor.y),
      midY: (face.y + floor.y) / 2,
    }
  }, [path])

  const grainGeometry = useMemo(
    // a chip of rock, not a pebble: few faces, no smoothing
    () => new THREE.DodecahedronGeometry(streamRadius * GRAIN_SCALE, 0),
    [streamRadius],
  )
  const heldGeometry = useMemo(
    () => new THREE.TetrahedronGeometry(streamRadius * HELD_SCALE, 0),
    [streamRadius],
  )
  const elementGeometry = useMemo(
    () => pleatedGeometry(radius * 0.8, bed.depth * 0.94),
    [radius, bed],
  )

  useEffect(
    () => () => {
      grainGeometry.dispose()
      heldGeometry.dispose()
      elementGeometry.dispose()
    },
    [grainGeometry, heldGeometry, elementGeometry],
  )

  const grains = useMemo(
    () =>
      Array.from({ length: GRAIN_COUNT }, (_, i) => ({
        // spread along the raw-water run so they arrive in a steady trickle
        phase: (i / GRAIN_COUNT) * bed.spawnLimit,
        caught: false,
        age: 0,
        hold: rand(HOLD * 0.5, HOLD * 1.5),
        spin: new THREE.Vector3(rand(-2, 2), rand(-2, 2), rand(-2, 2)),
        tilt: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
        squash: rand(0.7, 1.3),
        drift: new THREE.Vector3(rand(-0.014, 0.014), rand(-0.014, 0.014), rand(-0.014, 0.014)),
        land: new THREE.Vector3(),
      })),
    [bed],
  )

  /**
   * Specks held in the media. Positions are fixed and biased toward the face,
   * the way a depth filter actually loads, so only their scale changes.
   */
  const held = useMemo(
    () =>
      Array.from({ length: HELD_COUNT }, () => {
        const angle = rand(0, Math.PI * 2)
        const reach = Math.sqrt(Math.random()) * radius * 0.72
        // squared, so specks crowd the leading edge and thin out with depth
        const into = Math.random() ** 1.9
        return {
          position: new THREE.Vector3(
            bed.face.x + Math.cos(angle) * reach,
            bed.face.y + bed.drop * (0.04 + into * bed.depth * 0.9),
            bed.face.z + Math.sin(angle) * reach,
          ),
          tilt: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
          // the deeper it sits, the more load it takes before it shows
          threshold: into * 0.55,
          size: rand(0.7, 1.4),
        }
      }),
    [bed, radius],
  )

  const scratch = useMemo(
    () => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3() }),
    [],
  )

  useLayoutEffect(() => {
    grainMesh.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    heldMesh.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    const { dummy, point } = scratch
    load.current = Math.max(0, load.current - dt * LOAD_DECAY)

    const gm = grainMesh.current
    if (gm) {
      grains.forEach((g, i) => {
        let size = 1

        if (!g.caught) {
          g.phase += dt * FLOW_SPEED
          if (g.phase >= 1) g.phase -= 1
          // phase is a fraction of the trip; the face is a distance along it
          const u = path.distanceAt(g.phase)
          if (u >= bed.faceU) {
            g.caught = true
            g.age = 0
            const angle = rand(0, Math.PI * 2)
            const reach = Math.sqrt(Math.random()) * radius * 0.6
            g.land.set(
              bed.face.x + Math.cos(angle) * reach,
              bed.face.y,
              bed.face.z + Math.sin(angle) * reach,
            )
            load.current = Math.min(1, load.current + LOAD_PER_CAPTURE)
          } else {
            path.curve.getPointAt(u, point)
            dummy.position.copy(point).add(g.drift)
            // tumbling, so a grain reads as rock rather than as a dot
            g.tilt.x += g.spin.x * dt
            g.tilt.y += g.spin.y * dt
            g.tilt.z += g.spin.z * dt
          }
        }

        if (g.caught) {
          g.age += dt
          const settle = clamp01(g.age / SETTLE)
          const eased = 1 - (1 - settle) * (1 - settle)
          const restY = bed.face.y + bed.drop * 0.05
          dummy.position.set(g.land.x, g.land.y + (restY - g.land.y) * eased, g.land.z)
          // slows to a stop as it beds in, rather than spinning on the pile
          const spin = 1 - eased
          g.tilt.x += g.spin.x * dt * spin
          g.tilt.z += g.spin.z * dt * spin

          const fade = (g.age - SETTLE - g.hold) / FADE
          size = fade <= 0 ? 1 : 1 - clamp01(fade)
          if (fade >= 1) {
            g.caught = false
            g.phase = 0
            g.hold = rand(HOLD * 0.5, HOLD * 1.5)
          }
        }

        dummy.rotation.copy(g.tilt)
        dummy.scale.set(size * g.squash, size, size / g.squash)
        dummy.updateMatrix()
        gm.setMatrixAt(i, dummy.matrix)
      })
      gm.instanceMatrix.needsUpdate = true
    }

    const hm = heldMesh.current
    if (hm) {
      held.forEach((h, i) => {
        // a speck surfaces once the bed has loaded past its own depth
        const show = clamp01((load.current - h.threshold) / 0.3)
        dummy.position.copy(h.position)
        dummy.rotation.copy(h.tilt)
        dummy.scale.setScalar(h.size * show)
        dummy.updateMatrix()
        hm.setMatrixAt(i, dummy.matrix)
      })
      hm.instanceMatrix.needsUpdate = true
    }

    // the cake grows as well as darkens, so the pile is legible in silhouette
    const grown = CAKE_BASE + (1 - CAKE_BASE) * load.current
    if (cake.current) {
      cake.current.scale.y = grown
      cake.current.position.y = bed.face.y + bed.drop * (0.05 * grown)
    }
    if (cakeMat.current) cakeMat.current.opacity = 0.35 + 0.5 * load.current
    if (elementMat.current) {
      elementMat.current.opacity = 0.5 + 0.25 * load.current
      // clean cartridge tinting toward clogged as it takes on load
      elementMat.current.color.setHex(ELEMENT_COLOR).lerp(BED, load.current * 0.75)
    }
  })

  return (
    <group>
      {/* the pleated element — what the grains are stopped by */}
      <mesh position={[bed.face.x, bed.midY, bed.face.z]} geometry={elementGeometry}>
        <meshStandardMaterial
          ref={elementMat}
          color={ELEMENT_COLOR}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* the bed of stopped grains on its face */}
      <mesh ref={cake} position={[bed.face.x, bed.face.y, bed.face.z]}>
        <cylinderGeometry args={[radius * 0.82, radius * 0.7, 0.09, 24]} />
        <meshStandardMaterial
          ref={cakeMat}
          color={BED_COLOR}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh
        ref={heldMesh}
        args={[heldGeometry, undefined, HELD_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={BED_COLOR} roughness={0.95} metalness={0} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={grainMesh}
        args={[grainGeometry, undefined, GRAIN_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={GRAIN_COLOR} roughness={0.85} metalness={0.02} flatShading />
      </instancedMesh>
    </group>
  )
}
