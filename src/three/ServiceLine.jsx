import { METER_POSITION, SERVICE_CURVE } from './waterline'

/** The pipe itself, plus the glowing marker at the street meter. */
export default function ServiceLine() {
  return (
    <>
      <mesh>
        <tubeGeometry args={[SERVICE_CURVE, 220, 0.075, 12, false]} />
        <meshStandardMaterial color={0x18314c} metalness={0.6} roughness={0.35} />
      </mesh>

      <mesh position={METER_POSITION}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={0x3fd8ff}
          emissive={0x3fd8ff}
          emissiveIntensity={0.6}
        />
      </mesh>
    </>
  )
}
