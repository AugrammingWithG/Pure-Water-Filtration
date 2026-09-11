import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { HOUSE, RAIN_TANK, RAIN_UNIT as R } from '../layout'
import { TANK_OUTLET } from '../systems'
import Canister from '../parts/Canister'
import FadeGroup from '../parts/FadeGroup'
import Pipe from '../parts/Pipe'
import { COPPER, PVC } from '../parts/materials'
import Valve from '../parts/Valve'
import { useBrandLabel } from '../parts/brandLabel'

const STAINLESS = { color: 0xf0f2f4, roughness: 0.14, metalness: 0.9, envMapIntensity: 1.5 }
const GAUGE_RIM = { color: 0x4b5157, roughness: 0.4, metalness: 0.7 }
const GAUGE_FACE = { color: 0xf7f7f5, roughness: 0.6, metalness: 0 }
const BRASS = { color: 0xc9a227, metalness: 0.85, roughness: 0.35 }
const TANK = { color: 0x8d9a94, roughness: 0.8, metalness: 0.1 }
const TANK_LID = { color: 0x7b8781, roughness: 0.8, metalness: 0.1 }
const STAGE_LOOK = [
  { key: 'sediment', color: 0xe9dfcc, cap: 0x2b3138 },
  { key: 'carbon', color: 0x3a3f45, cap: 0x2b3138 },
  { key: 'carbon2', color: 0x3a3f45, cap: 0x2b3138 },
]

const { center, w, h, depth, pipeX, canisterOffsets, uvOffset, inletZ, outletZ } = R
const XRAY_OPACITY = 0.2
const topY = center.y + 0.3

/** Pressure gauge sitting on a brass stem through the top plate. */
function Gauge({ x, needle }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.06, 10]} />
        <meshStandardMaterial {...BRASS} />
      </mesh>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.04, 20]} />
        <meshStandardMaterial {...GAUGE_RIM} />
      </mesh>
      <mesh position={[0, 0.101, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 20]} />
        <meshStandardMaterial {...GAUGE_FACE} />
      </mesh>
      <mesh position={[0, 0.105, 0]} rotation={[0, needle, 0]}>
        <boxGeometry args={[0.05, 0.003, 0.005]} />
        <meshStandardMaterial color={0xc0392b} />
      </mesh>
    </group>
  )
}

/** The UV lamp: a stainless sleeve with a violet glow that brightens when selected. */
function UvTube({ position, selected, onClick }) {
  const mat = useRef()
  useFrame((state) => {
    if (!mat.current) return
    const base = selected ? 1.6 : 0.55
    mat.current.emissiveIntensity = base + 0.25 * Math.sin(state.clock.elapsedTime * 4)
  })
  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, -0.33, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.66, 18]} />
        <meshStandardMaterial
          ref={mat}
          color={0xb9a7ff}
          emissive={0x8b6cff}
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.07, 18]} />
        <meshStandardMaterial {...GAUGE_RIM} />
      </mesh>
      <mesh position={[0, -0.68, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 18]} />
        <meshStandardMaterial {...GAUGE_RIM} />
      </mesh>
      <mesh position={[0, -0.33, 0]} userData={{ noFade: true }}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

/**
 * Stainless rainwater treatment unit on the right gable wall, fed from the
 * tank beside it: three cartridges then the UV lamp, copper risers with ball
 * valves on both sides, gauges on top.
 */
export default function RainwaterUnit({ active, revealed, selectedStage, accent, onPick }) {
  const label = useBrandLabel({ plate: false })
  const tank = RAIN_TANK.center

  const inlet = useMemo(
    () => [
      TANK_OUTLET,
      [pipeX, 0.15, inletZ],
      [pipeX, 1.62, inletZ],
      [pipeX, 1.62, center.z + w / 2 - 0.12],
      [pipeX, center.y + h / 2 - 0.02, center.z + w / 2 - 0.12],
    ],
    [],
  )
  const outlet = useMemo(
    () => [
      [pipeX, center.y + h / 2 - 0.02, center.z - w / 2 + 0.12],
      [pipeX, 1.62, center.z - w / 2 + 0.12],
      [pipeX, 1.62, outletZ],
      [pipeX, -0.05, outletZ],
    ],
    [],
  )
  const downpipe = useMemo(() => {
    const eaveX = HOUSE.w / 2 + 0.12
    const eaveZ = HOUSE.d / 2 + 0.16
    return [
      [eaveX, 2.02, eaveZ],
      [eaveX, 1.9, eaveZ],
      [tank.x - 0.35, 1.9, tank.z + 0.05],
      [tank.x - 0.35, RAIN_TANK.h - 0.05, tank.z + 0.05],
    ]
  }, [tank])

  const onCover = (e) => {
    if (revealed) return
    e.stopPropagation()
    onPick(null)
  }

  return (
    <group>
      {/* stainless cabinet, width along z, front facing +x */}
      <FadeGroup opacity={revealed ? XRAY_OPACITY : 1} speed={4}>
        <group position={center} rotation={[0, Math.PI / 2, 0]}>
          <mesh castShadow receiveShadow onClick={onCover}>
            <boxGeometry args={[w, h, depth]} />
            <meshStandardMaterial {...STAINLESS} />
          </mesh>
          <mesh position={[0, h / 2 + 0.01, 0]} castShadow>
            <boxGeometry args={[w + 0.04, 0.02, depth + 0.04]} />
            <meshStandardMaterial {...STAINLESS} />
          </mesh>
          <group position={[0, h / 2 + 0.02, 0]}>
            <Gauge x={-0.26} needle={0.9} />
            <Gauge x={0} needle={0.5} />
            <Gauge x={0.26} needle={1.3} />
          </group>
          {/* blue print straight onto the steel */}
          <mesh position={[0, -0.05, depth / 2 + 0.004]}>
            <planeGeometry args={[0.4, 0.2]} />
            <meshStandardMaterial map={label} transparent roughness={0.3} metalness={0.2} />
          </mesh>
        </group>
      </FadeGroup>

      {/* internals, in flow order from +z */}
      {STAGE_LOOK.map((s, i) => (
        <Canister
          key={s.key}
          position={[pipeX, topY, center.z + canisterOffsets[i]]}
          radius={0.07}
          height={0.55}
          color={s.color}
          capColor={s.cap}
          accent={accent}
          selected={active && selectedStage === (s.key === 'carbon2' ? 'carbon' : s.key)}
          onClick={(e) => {
            e.stopPropagation()
            onPick(s.key === 'carbon2' ? 'carbon' : s.key)
          }}
        />
      ))}
      <UvTube
        position={[pipeX, topY, center.z + uvOffset]}
        selected={active && selectedStage === 'ro'}
        onClick={(e) => {
          e.stopPropagation()
          onPick('ro')
        }}
      />

      {/* plumbing */}
      <Pipe points={inlet} radius={0.036} material={COPPER} />
      <Valve position={[pipeX, 0.95, inletZ]} pipeRadius={0.036} handleDir="+x" />
      <Pipe points={outlet} radius={0.036} material={COPPER} />
      <Valve position={[pipeX, 0.9, outletZ]} pipeRadius={0.036} handleDir="+x" />
      <Pipe points={downpipe} radius={0.045} material={PVC} />

      {/* rainwater tank */}
      <group position={[tank.x, 0, tank.z]}>
        <mesh position={[0, RAIN_TANK.h / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[RAIN_TANK.r, RAIN_TANK.r, RAIN_TANK.h, 36]} />
          <meshStandardMaterial {...TANK} />
        </mesh>
        <mesh position={[0, RAIN_TANK.h + 0.02, 0]} castShadow>
          <cylinderGeometry args={[RAIN_TANK.r + 0.02, RAIN_TANK.r + 0.02, 0.05, 36]} />
          <meshStandardMaterial {...TANK_LID} />
        </mesh>
        <mesh position={[0, RAIN_TANK.h + 0.1, 0]} castShadow>
          <coneGeometry args={[RAIN_TANK.r + 0.02, 0.12, 36]} />
          <meshStandardMaterial {...TANK_LID} />
        </mesh>
        {/* leaf strainer where the downpipe drops in */}
        <mesh position={[-0.35, RAIN_TANK.h + 0.03, 0.05]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 18]} />
          <meshStandardMaterial {...GAUGE_RIM} />
        </mesh>
        {/* outlet fitting on the wall of the tank */}
        <mesh
          position={[TANK_OUTLET.x - tank.x + 0.06, TANK_OUTLET.y, TANK_OUTLET.z - tank.z + 0.03]}
        >
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial {...BRASS} />
        </mesh>
      </group>
    </group>
  )
}
