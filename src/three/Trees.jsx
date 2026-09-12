import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TREES, WIND } from './layout'
import { mulberry32 } from './parts/random'

/** Base colours only, like the rest of the diorama. Needles lighten toward the tip. */
const NEEDLE_LOW = new THREE.Color(0x35634a)
const NEEDLE_HIGH = new THREE.Color(0x5b9060)
const NEEDLES = { roughness: 0.9, metalness: 0, flatShading: true }
const TRUNK = { color: 0x6b5140, roughness: 0.9, metalness: 0 }

/** Few enough sides that the facets show, matching the isometric-render look. */
const SEGMENTS = 8
/** Bare trunk below the lowest skirt. */
const CLEAR_TRUNK = 0.5
/** Each tier is this many tier-spacings tall, so it hangs well over the one below. */
const OVERLAP = 1.9

/**
 * A pine as a stack of cones. Tier i sits one spacing above tier i-1 and is
 * narrower; the tip of the top one lands exactly at `h`. Each tier is yawed
 * and nudged off-axis a little so the facets and skirts don't line up down
 * the tree.
 */
function makeTiers({ h, r, seed }) {
  const rand = mulberry32(seed)
  const n = Math.max(4, Math.round(h * 1.3))
  const spacing = (h - CLEAR_TRUNK) / (n - 1 + OVERLAP)
  const coneH = spacing * OVERLAP
  const tiers = []
  for (let i = 0; i < n; i++) {
    tiers.push({
      radius: r * (1 - i / (n + 0.4)),
      height: coneH,
      y: CLEAR_TRUNK + i * spacing + coneH / 2,
      dx: (rand() - 0.5) * 0.08,
      dz: (rand() - 0.5) * 0.08,
      yaw: rand() * Math.PI * 2,
      color: NEEDLE_LOW.clone().lerp(NEEDLE_HIGH, i / (n - 1)),
    })
  }
  return { tiers, trunkH: CLEAR_TRUNK + spacing }
}

function PineTree({ x, z, h, r, seed }) {
  const group = useRef()
  const { tiers, trunkH } = useMemo(() => makeTiers({ h, r, seed }), [h, r, seed])

  /**
   * A stiff tree, so the whole thing leans downwind by a few millimetres at
   * the tip and eases back, on a slower beat than the grass gusts. The pivot
   * is the base of the trunk.
   */
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime + seed
    const bend = 0.006 + 0.005 * Math.sin(t * 0.8) + 0.002 * Math.sin(t * 2.7)
    group.current.rotation.set(bend * WIND.y, 0, -bend * WIND.x)
  })

  return (
    <group ref={group} position={[x, 0, z]}>
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.1, trunkH, 7]} />
        <meshStandardMaterial {...TRUNK} />
      </mesh>
      {tiers.map((tier, i) => (
        <mesh
          key={i}
          position={[tier.dx, tier.y, tier.dz]}
          rotation={[0, tier.yaw, 0]}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[tier.radius, tier.height, SEGMENTS]} />
          <meshStandardMaterial {...NEEDLES} color={tier.color} />
        </mesh>
      ))}
    </group>
  )
}

/** The pines behind the house, placed by TREES in layout.js. */
export default function Trees() {
  return TREES.map((tree) => <PineTree key={`${tree.x},${tree.z}`} {...tree} />)
}
