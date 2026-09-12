import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FadeGroup from './FadeGroup'

const BLACK = new THREE.Color(0x000000)

/**
 * Opacity the housing drops to once the camera is inside the unit. The head
 * stays solid, so the cartridge still reads as a cartridge while the water
 * column working its way through it becomes visible — which is the whole point
 * of walking the stages.
 */
const XRAY_OPACITY = 0.3

/**
 * One filter cartridge: a cylinder body hanging from a cap. When `selected`
 * the body glows in the system accent and breathes gently so it is obvious
 * which stage the walkthrough is on.
 *
 * The oversized invisible sphere is the pick target — far easier to hit than
 * the thin body, especially at the wide framing.
 */
export default function Canister({
  position,
  radius = 0.085,
  height = 0.4,
  color = 0x2aa2b8,
  capColor = 0x1f3540,
  accent,
  selected = false,
  revealed = false,
  onClick,
}) {
  const bodyMat = useRef()
  const glow = useRef(0)

  useFrame((state, delta) => {
    const m = bodyMat.current
    if (!m) return
    const target = selected ? 1 : 0
    glow.current += (target - glow.current) * Math.min(1, delta * 6)
    if (glow.current < 0.01 && !selected) {
      if (m.emissiveIntensity !== 0) m.emissiveIntensity = 0
      return
    }
    const breathe = 0.85 + 0.35 * Math.sin(state.clock.elapsedTime * 3)
    m.emissive.copy(accent ?? BLACK)
    m.emissiveIntensity = glow.current * breathe
  })

  return (
    <group position={position} onClick={onClick}>
      <FadeGroup opacity={revealed ? XRAY_OPACITY : 1} speed={4}>
        {/* body */}
        <mesh castShadow position={[0, -height / 2, 0]}>
          <cylinderGeometry args={[radius, radius, height, 24]} />
          <meshStandardMaterial ref={bodyMat} color={color} roughness={0.45} metalness={0.05} />
        </mesh>
        {/* rounded base */}
        <mesh position={[0, -height, 0]}>
          <sphereGeometry args={[radius, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
        </mesh>
      </FadeGroup>

      {/* cap — the housing head, solid at every zoom */}
      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.08, 0.07, 24]} />
        <meshStandardMaterial color={capColor} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* hit target */}
      <mesh position={[0, -height / 2, 0]} userData={{ noFade: true }}>
        <sphereGeometry args={[Math.max(radius * 2.2, height * 0.62), 10, 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
