import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, MAX_DELTA } from './common'

/**
 * Stage 3, rainwater — UV, which kills rather than removes.
 *
 * This is the third distinct mechanic in the three systems and the one most
 * easily got wrong. Sediment captures what it takes out and holds it. RO
 * rejects what it takes out and sends it to drain. UV takes nothing out at
 * all: the lamp sterilises what passes it, and the bacteria stay in the water
 * as inert bodies. Exactly as many microbes leave the lamp as arrive at it.
 *
 * So they are not removed here — they wriggle in, flash as they take their
 * dose, and drift on dead: still, grey and slightly shrunken. Making them
 * vanish would match the other two stages and teach the wrong thing about the
 * product, which is the whole reason this stage got its own component.
 *
 * Set REMOVE_AFTER_KILL if the tidier reading is wanted instead.
 */

/** Dead bacteria stay in the water. Flip only for the tidier, less true read. */
const REMOVE_AFTER_KILL = false

const MICROBE_COUNT = 22
/** As a fraction of the stream radius. Bacteria are small but must be seen. */
const MICROBE_SCALE = 0.42
const ALIVE_COLOR = new THREE.Color(0x7f9c4a)
const DEAD_COLOR = new THREE.Color(0xa9b3ba)
const FLASH_COLOR = new THREE.Color(0xf1e8ff)
const LAMP_COLOR = 0x8b6cff

/** How hard a live microbe swims across the flow, as a fraction of the stream. */
const WRIGGLE = 0.55
const WRIGGLE_MIN = 4
const WRIGGLE_MAX = 9
/** Where through the dose the flash peaks, and how wide the peak is. */
const FLASH_AT = 0.5
const FLASH_WIDTH = 0.28

const rand = (a, b) => a + Math.random() * (b - a)

export default function UvSterilise({ path, radius = 0.042, streamRadius = 0.02 }) {
  const mesh = useRef()
  const lampMat = useRef()
  const load = useRef(0)

  const lamp = useMemo(() => {
    const stage = path.stageOrder[2]
    const span = path.mediaSpans[stage] ?? path.spans[stage]
    const face = path.curve.getPointAt(span[0])
    const back = path.curve.getPointAt(span[1])
    return {
      enter: span[0],
      exit: span[1],
      axis: face,
      midY: (face.y + back.y) / 2,
      height: Math.abs(back.y - face.y),
    }
  }, [path])

  const geometry = useMemo(
    // a lumpy little body rather than a clean sphere
    () => new THREE.IcosahedronGeometry(streamRadius * MICROBE_SCALE, 0),
    [streamRadius],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  const microbes = useMemo(
    () =>
      Array.from({ length: MICROBE_COUNT }, (_, i) => ({
        phase: i / MICROBE_COUNT,
        alive: true,
        swim: rand(0, Math.PI * 2),
        rate: rand(WRIGGLE_MIN, WRIGGLE_MAX),
        lean: rand(0, Math.PI * 2),
        tilt: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
        spin: rand(1.5, 4),
        size: rand(0.7, 1.4),
      })),
    [],
  )

  const scratch = useMemo(
    () => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3(), colour: new THREE.Color() }),
    [],
  )

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    m.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(MICROBE_COUNT * 3).fill(1),
      3,
    )
    m.instanceColor.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((state, delta) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(delta, MAX_DELTA)
    const { dummy, point, colour } = scratch
    const time = state.clock.elapsedTime
    load.current = Math.max(0, load.current - dt * 1.6)

    microbes.forEach((b, i) => {
      b.phase += dt * FLOW_SPEED
      if (b.phase >= 1) {
        // round again, and the water arriving is live once more
        b.phase -= 1
        b.alive = true
      }

      const u = path.distanceAt(b.phase)
      path.curve.getPointAt(clamp01(u), point)

      // dose builds across the lamp; nothing is taken out, only killed
      const dose = clamp01((u - lamp.enter) / (lamp.exit - lamp.enter))
      if (b.alive && dose > 0) {
        load.current = Math.min(1, load.current + dt * 1.2)
        if (dose >= 1) b.alive = false
      }

      // a live one swims across the flow; a dead one is carried by it
      const alive = b.alive ? 1 - dose : 0
      const swim = Math.sin(time * b.rate + b.swim) * streamRadius * WRIGGLE * alive
      dummy.position.set(
        point.x + Math.cos(b.lean) * swim,
        point.y,
        point.z + Math.sin(b.lean) * swim,
      )

      // the moment the dose lands
      const flash = clamp01(1 - Math.abs(dose - FLASH_AT) / FLASH_WIDTH) * (b.alive ? 1 : 0)

      let size = b.size * (1 - 0.25 * (1 - alive)) * (1 + 0.9 * flash)
      if (REMOVE_AFTER_KILL && !b.alive) size = 0

      b.tilt.x += b.spin * dt * (0.2 + 0.8 * alive)
      b.tilt.y += b.spin * dt * 0.6 * (0.2 + 0.8 * alive)
      dummy.rotation.copy(b.tilt)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)

      colour.copy(DEAD_COLOR).lerp(ALIVE_COLOR, alive).lerp(FLASH_COLOR, flash)
      m.setColorAt(i, colour)
    })

    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    if (lampMat.current) lampMat.current.opacity = 0.1 + 0.28 * load.current
  })

  return (
    <group>
      {/* the sterilising field inside the sleeve, brightening as it works */}
      <mesh position={[lamp.axis.x, lamp.midY, lamp.axis.z]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.88, lamp.height * 0.98, 20, 1, true]} />
        <meshBasicMaterial
          ref={lampMat}
          color={LAMP_COLOR}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <instancedMesh
        ref={mesh}
        args={[geometry, undefined, MICROBE_COUNT]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.7} metalness={0} flatShading />
      </instancedMesh>
    </group>
  )
}
