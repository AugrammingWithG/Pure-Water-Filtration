import { useMemo } from 'react'
import * as THREE from 'three'
import { KITCHEN, UNDERSINK_UNIT as U } from '../layout'
import Canister from '../parts/Canister'
import FadeGroup from '../parts/FadeGroup'
import Pipe from '../parts/Pipe'
import { COPPER, PVC, TUBING } from '../parts/materials'
import Valve from '../parts/Valve'

const BRACKET = { color: 0x1c1e21, roughness: 0.6, metalness: 0.3 }
const TANK = { color: 0xf4f4f1, roughness: 0.45, metalness: 0.05 }
const TEAL = 0x2aa2b8
const TEAL_CAP = 0x1e7c8e

const STAGE_KEYS = ['sediment', 'carbon', 'ro']
const bracketX = (U.canisterXs[0] + U.canisterXs[2]) / 2
const bracketW = U.canisterXs[0] - U.canisterXs[2] + 0.28
const TANK_LEN = U.tankLen
/** The tubing is opaque and the route runs inside it; both thin out together. */
const PIPE_XRAY = 0.3
/** Filtered water is held in the tank, so the dwell there should be visible. */
const TANK_XRAY = 0.4
const tankTopY = U.floorY + U.tankR * 2 + TANK_LEN
const tubeY = U.bracketY + 0.045
const tubeZ = U.z + 0.09

/**
 * Reverse-osmosis drinking-water unit inside the sink cabinet: three teal
 * cartridges on a black wall bracket, a white pressure tank, the sink's
 * P-trap above, and white tubing running up to the dedicated tap.
 */
export default function UnderSinkUnit({ active, revealed, selectedStage, accent, onPick }) {
  const drain = useMemo(() => {
    const zMid = (KITCHEN.zBack + KITCHEN.zFront) / 2 + 0.04
    const y0 = KITCHEN.counterY - 0.13
    return [
      [KITCHEN.sinkX, y0, zMid],
      [KITCHEN.sinkX, y0 - 0.16, zMid],
      [KITCHEN.sinkX + 0.12, y0 - 0.16, zMid],
      [KITCHEN.sinkX + 0.12, y0 - 0.08, zMid],
      [KITCHEN.sinkX + 0.12, y0 - 0.08, KITCHEN.zBack + 0.03],
    ]
  }, [])

  const supplyStub = useMemo(
    () => [
      [U.supplyValve.x, U.supplyValve.y, KITCHEN.zBack],
      [U.supplyValve.x, U.supplyValve.y, U.supplyValve.z + 0.1],
    ],
    [],
  )

  const tubes = useMemo(() => {
    const [c1, c2, c3] = U.canisterXs
    return [
      // valve -> first cartridge head
      [
        [U.supplyValve.x, U.supplyValve.y, U.supplyValve.z + 0.1],
        [U.supplyValve.x, tubeY, U.supplyValve.z + 0.1],
        [c1 + 0.04, tubeY, tubeZ],
      ],
      // head to head
      [
        [c1, tubeY, tubeZ],
        [c2, tubeY, tubeZ],
      ],
      [
        [c2, tubeY, tubeZ],
        [c3, tubeY, tubeZ],
      ],
      // last cartridge -> tank
      [
        [c3, tubeY, tubeZ],
        [U.tankX, tubeY, tubeZ],
        [U.tankX, tankTopY + 0.02, U.z + 0.02],
      ],
      // tank -> up to the filtered tap. The route in systems.js runs inside
      // this tube, so the two are written from the same points.
      [
        [U.tankX + 0.04, tankTopY + 0.02, U.z - 0.02],
        [U.tankX + 0.04, KITCHEN.counterY - 0.08, U.z - 0.02],
        [KITCHEN.taps.filter.x, KITCHEN.counterY - 0.08, KITCHEN.tapZ],
        [KITCHEN.taps.filter.x, KITCHEN.counterY - 0.01, KITCHEN.tapZ],
      ],
    ]
  }, [])

  return (
    <group>
      {/* wall bracket: vertical plate on the cabinet back, horizontal plate the heads hang from */}
      <mesh position={[bracketX, U.bracketY + 0.07, KITCHEN.zBack + 0.03]} castShadow>
        <boxGeometry args={[bracketW, 0.16, 0.02]} />
        <meshStandardMaterial {...BRACKET} />
      </mesh>
      <mesh position={[bracketX, U.bracketY + 0.01, (KITCHEN.zBack + 0.03 + U.z + 0.1) / 2]} castShadow>
        <boxGeometry args={[bracketW, 0.02, U.z + 0.1 - KITCHEN.zBack - 0.03]} />
        <meshStandardMaterial {...BRACKET} />
      </mesh>

      {/*
        Picking the unit as a whole. Unlike the other two products this one has
        no cabinet shell to click — it is an open bracket — so without this
        every click landed on a cartridge and the unit could only ever be
        selected from the sidebar.

        Back faces only: the cartridges sit inside this box, so its near face
        would otherwise swallow their clicks. Rendering only the far side puts
        it behind everything it encloses, and a raycast reaches it just when it
        has missed all of them.
      */}
      <mesh
        position={[
          (U.tankX - U.tankR + U.canisterXs[0] + 0.14) / 2,
          (U.floorY + U.bracketY + 0.08) / 2,
          U.z,
        ]}
        onClick={(e) => {
          e.stopPropagation()
          onPick(null)
        }}
      >
        <boxGeometry
          args={[
            U.canisterXs[0] + 0.14 - (U.tankX - U.tankR),
            U.bracketY + 0.08 - U.floorY,
            0.42,
          ]}
        />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      {U.canisterXs.map((x, i) => (
        <Canister
          key={STAGE_KEYS[i]}
          position={[x, U.bracketY - 0.02, U.z]}
          radius={U.canisterR}
          height={U.canisterH}
          color={TEAL}
          capColor={TEAL_CAP}
          accent={accent}
          selected={active && selectedStage === STAGE_KEYS[i]}
          revealed={revealed}
          onClick={(e) => {
            e.stopPropagation()
            onPick(STAGE_KEYS[i])
          }}
        />
      ))}

      {/* pressure tank */}
      <group position={[U.tankX, U.floorY, U.z]}>
        <FadeGroup opacity={revealed ? TANK_XRAY : 1} speed={4}>
          <mesh position={[0, U.tankR + TANK_LEN / 2, 0]} castShadow>
            <capsuleGeometry args={[U.tankR, TANK_LEN, 6, 20]} />
            <meshStandardMaterial {...TANK} />
          </mesh>
        </FadeGroup>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[U.tankR * 0.75, U.tankR * 0.75, 0.02, 20]} />
          <meshStandardMaterial {...BRACKET} />
        </mesh>
        <mesh
          position={[0, U.tankR * 2 + TANK_LEN + 0.01, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onPick('ro')
          }}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.03, 12]} />
          <meshStandardMaterial {...BRACKET} />
        </mesh>
      </group>

      {/* the drain is not on the route, so it stays solid */}
      <Pipe points={drain} radius={0.022} material={PVC} castShadow={false} />

      {/* supply and tubing go see-through once the camera is in the cabinet */}
      <FadeGroup opacity={revealed ? PIPE_XRAY : 1} speed={4}>
        <Pipe points={supplyStub} radius={0.018} material={COPPER} castShadow={false} />
        <Valve
          position={[U.supplyValve.x, U.supplyValve.y, U.supplyValve.z + 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
          pipeRadius={0.018}
          handleDir="+x"
        />
        {tubes.map((pts, i) => (
          <Pipe key={i} points={pts} radius={0.011} material={TUBING} castShadow={false} />
        ))}
      </FadeGroup>
    </group>
  )
}
