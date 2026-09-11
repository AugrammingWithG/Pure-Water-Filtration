import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RADIUS = 7.4
const BASE = new THREE.Color(0xe3e7eb)

/**
 * The diorama plinth: a pale disc the house sits on, with a slightly darker
 * rim below so it reads as a slab rather than a hole in the page. Takes a
 * faint wash of the active system's accent colour.
 */
export default function Ground({ accent }) {
  const mat = useRef()
  const target = useRef(new THREE.Color())

  useFrame((_, delta) => {
    if (!mat.current) return
    target.current.copy(BASE).lerp(accent, 0.06)
    mat.current.color.lerp(target.current, Math.min(1, delta * 3))
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[RADIUS, 96]} />
        <meshStandardMaterial ref={mat} color={BASE} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS, 0.18, 96, 1, true]} />
        <meshStandardMaterial color={0xcdd3d9} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[RADIUS, 96]} />
        <meshStandardMaterial color={0xc2c8ce} roughness={0.9} />
      </mesh>
    </group>
  )
}
