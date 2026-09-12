import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, MAX_DELTA } from './common'

/**
 * Stage 3, under-sink — reverse osmosis, which is a *split*, not a capture.
 *
 * This is the one stage in the three systems where the removed material does
 * not stay behind in the cartridge. An RO membrane passes pure water and
 * rejects everything dissolved in it, and the reject goes to drain — so the
 * honest picture is two streams leaving where one arrived, and this is the
 * only place in the scene where the water visibly forks.
 *
 * Dissolved solids ride the whole route to get here: sediment does not touch
 * them and neither does carbon, which is exactly right and gives the walk its
 * progression — grit gone at one, chlorine gone at two, and the water still
 * carrying dissolved solids until the membrane takes them out at three.
 *
 * Specks are instanced and fade by shrinking; an InstancedMesh has no
 * per-instance alpha without a custom shader.
 */

const TDS_COUNT = 24
/** Dissolved solids are fine — smaller than grit, as a fraction of the stream. */
const TDS_SCALE = 0.34
const TDS_COLOR = 0xb9c6d4
/** Seconds a rejected speck takes to travel the reject line to the drain. */
const REJECT_SECONDS = 1.5
/** Fraction of the reject run over which a speck fades into the drain. */
const REJECT_FADE = 0.3

const MEMBRANE_COLOR = 0xdfe8ee
const WRAP_COLOR = 0x8fa8bb

const rand = (a, b) => a + Math.random() * (b - a)

/**
 * A spiral-wound element: the membrane is a sheet rolled around a core, and
 * the winding is the one detail that makes an RO cartridge look like an RO
 * cartridge rather than another carbon block.
 */
function windingGeometry(radius, height, ribbon) {
  const turns = 7
  const points = []
  for (let i = 0; i <= 140; i++) {
    const a = i / 140
    const angle = a * Math.PI * 2 * turns
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        -height / 2 + a * height,
        Math.sin(angle) * radius,
      ),
    )
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 180, ribbon, 5, false)
}

export default function MembraneSplit({ path, rejectPoints, radius = 0.085, streamRadius = 0.013 }) {
  const tdsMesh = useRef()
  const glowMat = useRef()
  const flush = useRef(0)

  const element = useMemo(() => {
    const stage = path.stageOrder[2]
    const span = path.mediaSpans[stage] ?? path.spans[stage]
    const face = path.curve.getPointAt(span[0])
    const back = path.curve.getPointAt(span[1])
    return {
      faceU: span[0],
      exitU: span[1],
      face,
      midY: (face.y + back.y) / 2,
      height: Math.abs(back.y - face.y),
    }
  }, [path])

  /** Where the reject goes: a thin line teeing into the sink drain. */
  const rejectCurve = useMemo(
    () => new THREE.CatmullRomCurve3(rejectPoints, false, 'catmullrom', 0.1),
    [rejectPoints],
  )

  const tdsGeometry = useMemo(
    () => new THREE.OctahedronGeometry(streamRadius * TDS_SCALE, 0),
    [streamRadius],
  )
  const wrapGeometry = useMemo(
    () => windingGeometry(radius * 0.6, element.height * 0.86, radius * 0.055),
    [radius, element],
  )
  const rejectTube = useMemo(
    () => new THREE.TubeGeometry(rejectCurve, 60, streamRadius * 0.5, 6, false),
    [rejectCurve, streamRadius],
  )

  useEffect(
    () => () => {
      tdsGeometry.dispose()
      wrapGeometry.dispose()
      rejectTube.dispose()
    },
    [tdsGeometry, wrapGeometry, rejectTube],
  )

  const solids = useMemo(
    () =>
      Array.from({ length: TDS_COUNT }, (_, i) => ({
        phase: (i / TDS_COUNT) * path.phaseAt(element.faceU),
        /** null while riding the main route, 0..1 once on the reject line. */
        reject: null,
        tilt: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
        spin: rand(1, 3),
        size: rand(0.7, 1.35),
        drift: new THREE.Vector3(rand(-0.006, 0.006), rand(-0.006, 0.006), rand(-0.006, 0.006)),
      })),
    [path, element],
  )

  const scratch = useMemo(
    () => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3() }),
    [],
  )

  useLayoutEffect(() => {
    tdsMesh.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((_, delta) => {
    const m = tdsMesh.current
    if (!m) return
    const dt = Math.min(delta, MAX_DELTA)
    const { dummy, point } = scratch
    flush.current = Math.max(0, flush.current - dt * 1.4)

    solids.forEach((s, i) => {
      let size = s.size

      if (s.reject === null) {
        s.phase += dt * FLOW_SPEED
        if (s.phase >= 1) s.phase -= 1
        // phase is a fraction of the trip; the membrane is a distance along it
        const u = path.distanceAt(s.phase)
        if (u >= element.faceU) {
          // turned away by the membrane — over to the reject line
          s.reject = 0
          flush.current = Math.min(1, flush.current + 0.25)
        } else {
          path.curve.getPointAt(u, point)
          dummy.position.copy(point).add(s.drift)
        }
      }

      if (s.reject !== null) {
        s.reject += dt / REJECT_SECONDS
        if (s.reject >= 1) {
          // gone down the drain — back to the supply valve
          s.reject = null
          s.phase = 0
          dummy.position.copy(element.face)
          size = 0
        } else {
          rejectCurve.getPointAt(clamp01(s.reject), point)
          dummy.position.copy(point).add(s.drift)
          // shrink away into the drain rather than winking out at the end
          const left = (1 - s.reject) / REJECT_FADE
          size = s.size * Math.min(1, left)
        }
      }

      s.tilt.x += s.spin * dt
      s.tilt.y += s.spin * dt * 0.7
      dummy.rotation.copy(s.tilt)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })

    m.instanceMatrix.needsUpdate = true
    if (glowMat.current) glowMat.current.emissiveIntensity = 0.1 + 0.5 * flush.current
  })

  return (
    <group>
      {/* the reject line, teeing into the sink drain */}
      <mesh geometry={rejectTube}>
        <meshStandardMaterial
          color={0x9aa7b2}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* the membrane core, flushing as it turns solids away */}
      <mesh position={[element.face.x, element.midY, element.face.z]}>
        <cylinderGeometry
          args={[radius * 0.56, radius * 0.56, element.height * 0.9, 20, 1, true]}
        />
        <meshStandardMaterial
          ref={glowMat}
          color={MEMBRANE_COLOR}
          emissive={MEMBRANE_COLOR}
          emissiveIntensity={0.1}
          roughness={0.5}
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* the sheet wound around it */}
      <mesh
        geometry={wrapGeometry}
        position={[element.face.x, element.midY, element.face.z]}
      >
        <meshStandardMaterial
          color={WRAP_COLOR}
          roughness={0.55}
          metalness={0.05}
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh
        ref={tdsMesh}
        args={[tdsGeometry, undefined, TDS_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={TDS_COLOR} roughness={0.45} metalness={0.1} flatShading />
      </instancedMesh>
    </group>
  )
}
