import { useMemo } from 'react'
import * as THREE from 'three'

import { COPPER } from './materials'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * A run of straight pipe through `points`, drawn as one cylinder per segment
 * with a sphere at each bend. Sharper and cleaner than a tube along a spline,
 * and the joints read as elbow fittings.
 */
export default function Pipe({
  points,
  radius = 0.04,
  material = COPPER,
  castShadow = true,
}) {
  const { segments, joints } = useMemo(() => {
    const pts = points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p)))
    const segs = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const dir = b.clone().sub(a)
      const len = dir.length()
      if (len < 1e-5) continue
      const mid = a.clone().add(b).multiplyScalar(0.5)
      const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize())
      segs.push({ mid, quat, len })
    }
    return { segments: segs, joints: pts.slice(1, -1) }
  }, [points])

  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={`s${i}`} position={s.mid} quaternion={s.quat} castShadow={castShadow}>
          <cylinderGeometry args={[radius, radius, s.len, 14]} />
          <meshStandardMaterial {...material} />
        </mesh>
      ))}
      {joints.map((p, i) => (
        <mesh key={`j${i}`} position={p} castShadow={castShadow}>
          <sphereGeometry args={[radius * 1.15, 12, 12]} />
          <meshStandardMaterial {...material} />
        </mesh>
      ))}
    </group>
  )
}
