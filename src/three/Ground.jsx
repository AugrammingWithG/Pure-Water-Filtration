import { useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import grassFloorMapUrl from '../assets/textures/wood/grass-floor.jpg'
import { GROUND, PATH } from './layout'

const RADIUS = GROUND.radius
/** Light olive tint so the grass texture reads clearly instead of getting crushed. */
const LAWN = new THREE.Color(0xb4c493)
const LAWN_ACCENT_MIX = 0.70
const GRAVEL = { color: 0xdad6cd, roughness: 0.95, metalness: 0 }

/**
 * Flat ribbon in the xz plane following PATH, its ends clamped inside the
 * plinth rim so the path runs right off the edge of the diorama.
 */
function usePathGeometry() {
  return useMemo(() => {
    const pts = PATH.points.map(([x, z]) => new THREE.Vector2(x, z))
    const hw = PATH.halfWidth
    const rimR = RADIUS - 0.02
    const positions = []
    const normals = []
    const index = []

    pts.forEach((p, i) => {
      const prev = pts[Math.max(0, i - 1)]
      const next = pts[Math.min(pts.length - 1, i + 1)]
      const dir = next.clone().sub(prev).normalize()
      const n = new THREE.Vector2(-dir.y, dir.x)
      for (const side of [1, -1]) {
        const v = p.clone().addScaledVector(n, side * hw)
        if (v.length() > rimR) v.setLength(rimR)
        positions.push(v.x, 0, v.y)
        normals.push(0, 1, 0)
      }
      if (i < pts.length - 1) {
        const l = i * 2
        const r = l + 1
        index.push(l, l + 2, r, r, l + 2, r + 2)
      }
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setIndex(index)
    return geo
  }, [])
}

/**
 * The diorama plinth: a lawn-green disc the house sits on, with a pale rim
 * below so it reads as a slab rather than a hole in the page, and a gravel
 * path cut across it. The lawn takes a faint wash of the active system's
 * accent colour.
 */
export default function Ground({ accent }) {
  const mat = useRef()
  const target = useRef(new THREE.Color())
  const path = usePathGeometry()
  const grassBaseMap = useTexture(grassFloorMapUrl)
  const grassMap = useMemo(() => {
    const map = grassBaseMap.clone()
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(1, 1)
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
    return map
  }, [grassBaseMap])

  useFrame((_, delta) => {
    if (!mat.current) return
    target.current.copy(LAWN).lerp(accent, LAWN_ACCENT_MIX)
    mat.current.color.lerp(target.current, Math.min(1, delta * 3))
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[RADIUS, 96]} />
        <meshStandardMaterial
          ref={mat}
          color={LAWN}
          map={grassMap}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh geometry={path} position={[0, 0.004, 0]} receiveShadow>
        <meshStandardMaterial {...GRAVEL} />
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
