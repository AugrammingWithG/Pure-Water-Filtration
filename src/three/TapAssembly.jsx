import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SPOUT_POSITION, TAP_GLASS_POSITION } from './waterline'

const MAX_DELTA = 0.05

/** Rim of the glass, and the little falling column of water above it. */
const GLASS_TOP_Y = TAP_GLASS_POSITION.y + 0.25
const STREAM_HEIGHT = Math.max(0.05, SPOUT_POSITION.y - GLASS_TOP_Y)
const STREAM_POSITION = [
  SPOUT_POSITION.x,
  (SPOUT_POSITION.y + GLASS_TOP_Y) / 2,
  SPOUT_POSITION.z,
]

/** The water column is scaled from its base, so it grows upward from here. */
const FILL_BASE_Y = TAP_GLASS_POSITION.y - 0.23
/** Fills and empties on a 7s loop, topping out at 0.36 units tall. */
const FILL_PERIOD = 7
const FILL_MAX_HEIGHT = 0.36

/**
 * The kitchen tap: glass, the stream landing in it, and the water level
 * rising inside. The glass doubles as the "tap" stage's pick target.
 */
export default function TapAssembly({ selected, onClick }) {
  const streamMaterial = useRef()
  const waterFill = useRef()
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, MAX_DELTA)
    const t = elapsed.current

    // Flicker the stream so it reads as moving water rather than a rod.
    if (streamMaterial.current) {
      streamMaterial.current.opacity = 0.4 + 0.25 * Math.abs(Math.sin(t * 6))
    }

    if (waterFill.current) {
      const h = Math.max(0.02, ((t % FILL_PERIOD) / FILL_PERIOD) * FILL_MAX_HEIGHT)
      waterFill.current.scale.y = h
      waterFill.current.position.y = FILL_BASE_Y + h / 2
    }
  })

  return (
    <>
      {/* glass */}
      <mesh position={TAP_GLASS_POSITION} onClick={onClick}>
        <cylinderGeometry args={[0.22, 0.16, 0.5, 20]} />
        <meshPhysicalMaterial
          color={0x9fe9ff}
          transparent
          opacity={0.5}
          transmission={0.6}
          roughness={0.05}
          emissiveIntensity={selected ? 0.9 : 0.28}
        />
      </mesh>

      {/* stream from the spout */}
      <mesh position={STREAM_POSITION}>
        <cylinderGeometry args={[0.015, 0.015, STREAM_HEIGHT, 8, 1, true]} />
        <meshBasicMaterial
          ref={streamMaterial}
          color={0xcdf5ff}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* water level inside the glass — unit-height cylinder driven by scale.y */}
      <mesh
        ref={waterFill}
        position={[TAP_GLASS_POSITION.x, FILL_BASE_Y, TAP_GLASS_POSITION.z]}
        scale={[1, 0.001, 1]}
      >
        <cylinderGeometry args={[0.17, 0.12, 1, 20]} />
        <meshStandardMaterial
          color={0x9ff7e0}
          emissive={0x9ff7e0}
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </>
  )
}
