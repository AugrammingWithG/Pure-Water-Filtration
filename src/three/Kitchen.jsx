import { HOUSE, KITCHEN } from './layout'

const CABINET = { color: 0xf4f3ef, roughness: 0.6, metalness: 0 }
const CABINET_INNER = { color: 0xe6e4de, roughness: 0.8, metalness: 0 }
const COUNTER = { color: 0xe9e6df, roughness: 0.35, metalness: 0.05 }
const STEEL = { color: 0xc9ccd0, roughness: 0.2, metalness: 0.9, envMapIntensity: 1.1 }
const OAK = { color: 0xd6b48a, roughness: 0.7, metalness: 0 }

const { floorY } = HOUSE
const { x0, x1, benchH, depth, zBack, zFront, counterY, sinkCabinet, sinkX, taps, tapNozzle, tapZ } =
  KITCHEN
const zMid = (zBack + zFront) / 2
const PANEL_T = 0.02

/**
 * A simple mixer tap: riser, swan neck, spout — all chrome cylinders. The
 * proportions come from layout.js because the water route in systems.js runs
 * up the inside of the riser and out of the nozzle; both must agree on where
 * that is. A ball at each bend covers the route's corners, as Pipe does.
 */
function Tap({ x, height, reach, radius, accent }) {
  return (
    <group position={[x, counterY, tapZ]}>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[radius * 2.2, radius * 2.2, 0.024, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[radius * 1.1, 12, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, height, reach / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, reach, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, height, reach]}>
        <sphereGeometry args={[radius * 1.1, 12, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, height - tapNozzle / 2, reach]}>
        <cylinderGeometry args={[radius, radius * 1.2, tapNozzle, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {accent !== undefined && (
        // little coloured collar so the filtered tap reads as "the special one"
        <mesh position={[0, height - 0.07, 0]}>
          <cylinderGeometry args={[radius * 1.4, radius * 1.4, 0.03, 12]} />
          <meshStandardMaterial color={accent} roughness={0.4} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Bench run along the back wall. The sink cabinet is open (doors swung out)
 * so the RO unit inside is on show; <UnderSinkUnit> is placed in there by the
 * scene.
 */
export default function Kitchen({ accent }) {
  const leftW = sinkCabinet.x0 - x0
  const rightW = x1 - sinkCabinet.x1
  const sinkW = sinkCabinet.x1 - sinkCabinet.x0
  const cabH = benchH - 0.04

  return (
    <group>
      {/* solid cabinets either side of the sink */}
      <mesh position={[x0 + leftW / 2, floorY + cabH / 2, zMid]} castShadow receiveShadow>
        <boxGeometry args={[leftW, cabH, depth]} />
        <meshStandardMaterial {...CABINET} />
      </mesh>
      <mesh position={[x1 - rightW / 2, floorY + cabH / 2, zMid]} castShadow receiveShadow>
        <boxGeometry args={[rightW, cabH, depth]} />
        <meshStandardMaterial {...CABINET} />
      </mesh>

      {/* open sink cabinet: base, back, sides */}
      <group>
        <mesh position={[sinkX, floorY + PANEL_T / 2, zMid]} receiveShadow>
          <boxGeometry args={[sinkW, PANEL_T, depth]} />
          <meshStandardMaterial {...CABINET_INNER} />
        </mesh>
        <mesh position={[sinkX, floorY + cabH / 2, zBack + PANEL_T / 2]} receiveShadow>
          <boxGeometry args={[sinkW, cabH, PANEL_T]} />
          <meshStandardMaterial {...CABINET_INNER} />
        </mesh>
        {/* doors swung open */}
        {[
          { hingeX: sinkCabinet.x0, dir: -1 },
          { hingeX: sinkCabinet.x1, dir: 1 },
        ].map(({ hingeX, dir }) => (
          <group key={dir} position={[hingeX, floorY + cabH / 2, zFront]} rotation={[0, dir * 1.65, 0]}>
            {/* panel reaches toward the cabinet centre when closed; the hinge swings it into the room */}
            <mesh position={[(-dir * sinkW) / 4, 0, 0]} castShadow>
              <boxGeometry args={[sinkW / 2 - 0.01, cabH - 0.02, PANEL_T]} />
              <meshStandardMaterial {...CABINET} />
            </mesh>
          </group>
        ))}
      </group>

      {/* countertop */}
      <mesh position={[(x0 + x1) / 2, counterY - 0.02, zMid + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[x1 - x0, 0.04, depth + 0.02]} />
        <meshStandardMaterial {...COUNTER} />
      </mesh>

      {/* sink: a dark bowl flush with the counter, framed by a steel rim */}
      <mesh position={[sinkX, counterY - 0.06, zMid + 0.04]}>
        <boxGeometry args={[0.48, 0.124, 0.34]} />
        <meshStandardMaterial color={0x7d8388} roughness={0.35} metalness={0.7} />
      </mesh>
      {[
        [0, 0.19, 0.54, 0.04],
        [0, -0.19, 0.54, 0.04],
        [0.25, 0, 0.04, 0.34],
        [-0.25, 0, 0.04, 0.34],
      ].map(([dx, dz, w, d], i) => (
        <mesh key={i} position={[sinkX + dx, counterY + 0.004, zMid + 0.04 + dz]}>
          <boxGeometry args={[w, 0.008, d]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      <Tap {...taps.mixer} />
      <Tap {...taps.filter} accent={accent} />

      {/* shelves on the wall above the bench */}
      {[1.55, 1.95].map((y) => (
        <mesh key={y} position={[(x0 + x1) / 2 - 0.4, floorY + y, zBack + 0.11]} castShadow>
          <boxGeometry args={[x1 - x0 - 1.2, 0.03, 0.22]} />
          <meshStandardMaterial {...OAK} />
        </mesh>
      ))}
      {/* a few things on the shelves */}
      {[
        [-0.2, 1.585, 0.09, 0.16, 0xd9d6cf],
        [0.15, 1.585, 0.07, 0.12, 0x2e8fe0],
        [0.55, 1.585, 0.08, 0.2, 0xc9a97a],
        [0.0, 1.985, 0.1, 0.14, 0xe8e5de],
        [0.75, 1.985, 0.06, 0.1, 0x8fa6b3],
      ].map(([x, y, r, h, c], i) => (
        <mesh key={i} position={[x, floorY + y + h / 2, zBack + 0.11]} castShadow>
          <cylinderGeometry args={[r, r, h, 12]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
