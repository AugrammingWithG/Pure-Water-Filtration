import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { HOUSE_POSITION } from './waterline'

/** Lit windows on the front (z +1.61) and back (z -1.61) walls. */
const WINDOW_POSITIONS = [
  [-1.4, 1.2, 1.61],
  [-0.5, 1.2, 1.61],
  [0.9, 1.2, 1.61],
  [1.7, 1.2, 1.61],
  [-1.4, 1.2, -1.61],
  [1.4, 1.2, -1.61],
]

/** Footprint drawn on the ground, just above the grid to avoid z-fighting. */
const OUTLINE_POINTS = [
  [-2.5, 0.02, -1.9],
  [2.5, 0.02, -1.9],
  [2.5, 0.02, 1.9],
  [-2.5, 0.02, 1.9],
  [-2.5, 0.02, -1.9],
]

export default function House() {
  // Triangular prism roof, extruded from a 2D profile.
  const roofGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-2.3, 0)
    shape.lineTo(2.3, 0)
    shape.lineTo(0, 1.25)
    shape.lineTo(-2.3, 0)
    return new THREE.ExtrudeGeometry(shape, { depth: 3.4, bevelEnabled: false })
  }, [])

  return (
    <group position={HOUSE_POSITION}>
      {/* walls */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[4.4, 1.9, 3.2]} />
        <meshStandardMaterial color={0x0e2136} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* roof */}
      <mesh geometry={roofGeometry} position={[0, 1.9, -1.7]}>
        <meshStandardMaterial color={0x152a42} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* windows */}
      {WINDOW_POSITIONS.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.44, 0.5, 0.03]} />
          <meshStandardMaterial
            color={0xffcf8a}
            emissive={0xffcf8a}
            emissiveIntensity={1.1}
          />
        </mesh>
      ))}

      {/* front door */}
      <mesh position={[0.2, 0.55, 1.61]}>
        <boxGeometry args={[0.62, 1.1, 0.03]} />
        <meshStandardMaterial color={0x081019} roughness={0.9} />
      </mesh>

      {/* footprint outline */}
      <Line
        points={OUTLINE_POINTS}
        color={0x3fd8ff}
        transparent
        opacity={0.35}
        lineWidth={1}
      />

      {/* wall-mounted rack plate the filter canisters hang off */}
      <mesh position={[-2.18, 1.45, 0]}>
        <boxGeometry args={[0.06, 2.0, 0.55]} />
        <meshStandardMaterial color={0x0a1826} roughness={0.9} />
      </mesh>

      {/* driveway slab */}
      <mesh position={[-3.2, 0.01, 0.3]}>
        <boxGeometry args={[4.2, 0.02, 1.1]} />
        <meshStandardMaterial color={0x1a2c3f} roughness={1} />
      </mesh>
    </group>
  )
}
