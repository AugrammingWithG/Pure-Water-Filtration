import * as THREE from 'three'

/** Emissive intensity of the inner core, selected vs idle. */
const CORE_EMISSIVE_ACTIVE = 0.9
const CORE_EMISSIVE_IDLE = 0.28

/**
 * One filter stage: a semi-transparent glass shell, an emissive inner core
 * that brightens when selected, and an oversized invisible sphere that makes
 * the canister far easier to hit with a raycast than the thin glass alone.
 *
 * onClick is bound to the group so a hit on any of the three children selects
 * the stage — the legacy code registered all three meshes as pickables.
 */
export default function Canister({ position, color, radius, height, selected, onClick }) {
  return (
    <group position={position} onClick={onClick}>
      {/* glass shell */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 24, 1, true]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.28}
          roughness={0.15}
          metalness={0}
          transmission={0.5}
          thickness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* filter core */}
      <mesh>
        <cylinderGeometry
          args={[radius * 0.55, radius * 0.55, height * 0.86, 16]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? CORE_EMISSIVE_ACTIVE : CORE_EMISSIVE_IDLE}
          roughness={0.5}
        />
      </mesh>

      {/* invisible hit target — generous click area */}
      <mesh>
        <sphereGeometry args={[Math.max(radius, height * 0.6), 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
