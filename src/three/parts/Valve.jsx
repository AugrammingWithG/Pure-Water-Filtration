const BRASS = { color: 0xc9a227, metalness: 0.85, roughness: 0.35 }
const HANDLE = { color: 0x2e9e4f, metalness: 0.1, roughness: 0.6 }

/**
 * A brass ball valve on a vertical pipe run, with the green lever handle the
 * photos show. `handleDir` is which way the lever sticks out: +x/-x/+z/-z.
 */
export default function Valve({ position, rotation, pipeRadius = 0.04, handleDir = '+x' }) {
  const r = pipeRadius
  const bodyR = r * 1.9
  const handleLen = r * 5
  const off = bodyR + handleLen / 2 - r * 0.3

  const handle = {
    '+x': { pos: [off, 0, 0], rot: [0, 0, 0], size: [handleLen, r * 1.1, r * 0.9] },
    '-x': { pos: [-off, 0, 0], rot: [0, 0, 0], size: [handleLen, r * 1.1, r * 0.9] },
    '+z': { pos: [0, 0, off], rot: [0, 0, 0], size: [r * 0.9, r * 1.1, handleLen] },
    '-z': { pos: [0, 0, -off], rot: [0, 0, 0], size: [r * 0.9, r * 1.1, handleLen] },
  }[handleDir]

  return (
    <group position={position} rotation={rotation}>
      {/* body */}
      <mesh castShadow>
        <cylinderGeometry args={[bodyR, bodyR, r * 4.2, 16]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {/* hex nuts either end */}
      <mesh position={[0, r * 2.6, 0]}>
        <cylinderGeometry args={[bodyR * 0.8, bodyR * 0.8, r * 1.2, 6]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, -r * 2.6, 0]}>
        <cylinderGeometry args={[bodyR * 0.8, bodyR * 0.8, r * 1.2, 6]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      {/* stem + lever */}
      <mesh position={handle.pos} rotation={handle.rot} castShadow>
        <boxGeometry args={handle.size} />
        <meshStandardMaterial {...HANDLE} />
      </mesh>
    </group>
  )
}
