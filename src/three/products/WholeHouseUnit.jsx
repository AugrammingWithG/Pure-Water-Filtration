import { useMemo } from 'react'
import * as THREE from 'three'
import { STREET_METER, WHOLE_UNIT } from '../layout'
import Canister from '../parts/Canister'
import FadeGroup from '../parts/FadeGroup'
import Outline from '../parts/Outline'
import Pipe from '../parts/Pipe'
import { COPPER } from '../parts/materials'
import Valve from '../parts/Valve'
import { useBrandLabel } from '../parts/brandLabel'

const SHELL = { color: 0xf5f5f3, roughness: 0.28, metalness: 0.1 }
const MANIFOLD = { color: 0x3a3f45, roughness: 0.6, metalness: 0.3 }
const PIT = { color: 0x8e949a, roughness: 0.9, metalness: 0 }

/** Cartridge colours, in flow order: pleated sediment, carbon block, mineral media. */
const STAGE_LOOK = [
  { key: 'sediment', color: 0xe9dfcc, cap: 0x2b3138 },
  { key: 'carbon', color: 0x3a3f45, cap: 0x2b3138 },
  { key: 'ro', color: 0xd7e4ec, cap: 0x2b3138 },
]

const { center, w, h, depth, riserX, canisterOffsets, canisterRadius } = WHOLE_UNIT
const CHAMFER = 0.1
/** Opacity the cover drops to when this system is active — enough to see inside. */
const XRAY_OPACITY = 0.18
/**
 * Copper is opaque, and the route runs down the middle of it, so the water
 * would be invisible for most of its journey. The pipework thins out with the
 * cover instead, leaving the runs readable as pipe while the flow shows
 * through.
 */
const PIPE_XRAY = 0.3

/**
 * The white cabinet's shell: a rectangle with its top-front edge chamfered,
 * extruded across the width.
 */
function useShellGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(depth, 0)
    s.lineTo(depth, h - CHAMFER)
    s.lineTo(depth - CHAMFER, h)
    s.lineTo(0, h)
    s.closePath()
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false })
    // profile x is depth (wall -> front): swing it onto world z, width onto x
    geo.rotateY(-Math.PI / 2)
    geo.center()
    return geo
  }, [])
}

/**
 * Whole-house point-of-entry filter on the front wall. Mains arrives from the
 * street meter, rises up the copper riser through the ball valve into the
 * top of the cabinet, and leaves out the bottom into the house.
 */
export default function WholeHouseUnit({ active, revealed, selectedStage, accent, onPick }) {
  const shell = useShellGeometry()
  const label = useBrandLabel({ plate: true })
  const topY = center.y + 0.3

  const riser = useMemo(
    () => [
      [riserX, -0.05, center.z],
      [riserX, 1.62, center.z],
      [center.x + canisterOffsets[0] + 0.03, 1.62, center.z],
      [center.x + canisterOffsets[0] + 0.03, center.y + h / 2 - 0.02, center.z],
    ],
    [],
  )
  const outlets = useMemo(
    () =>
      [center.x + canisterOffsets[2], center.x + canisterOffsets[1]].map((x) => [
        [x, center.y - h / 2 + 0.02, center.z],
        [x, -0.05, center.z],
      ]),
    [],
  )

  const onCover = (e) => {
    // Once revealed the cover is see-through; let clicks fall through to the
    // cartridges behind it.
    if (revealed) return
    e.stopPropagation()
    onPick(null)
  }

  return (
    <group>
      {/*
        Selection outline, marking this as the unit the walkthrough is on. Sits
        outside the FadeGroup so the x-ray does not drive its opacity — it stays
        drawn while the cover is see-through, which is when it is doing the most
        work: it is the only thing still holding the cabinet's shape.
      */}
      <group position={center}>
        <Outline geometry={shell} color={accent} shown={active} />
      </group>

      {/* cabinet */}
      <FadeGroup opacity={revealed ? XRAY_OPACITY : 1} speed={4}>
        <group position={center}>
          <mesh geometry={shell} castShadow receiveShadow onClick={onCover}>
            <meshStandardMaterial {...SHELL} />
          </mesh>
          {/* navy label plate, upper-left of the front face */}
          <mesh position={[-w / 2 + 0.28, h / 2 - CHAMFER - 0.16, depth / 2 + 0.004]}>
            <planeGeometry args={[0.46, 0.23]} />
            <meshStandardMaterial map={label} roughness={0.5} metalness={0.05} />
          </mesh>
        </group>
      </FadeGroup>

      {/*
        Picking the unit as a whole, including once it is revealed. The cover
        stops taking clicks then so they can reach the cartridges behind it,
        which left no way to re-select the unit itself from the scene.

        Back faces only: the cartridges sit inside this box, so its near face
        would otherwise swallow their clicks. Rendering only the far side puts
        it behind everything it encloses, and a raycast reaches it just when it
        has missed all of them.
      */}
      <mesh
        position={center}
        onClick={(e) => {
          e.stopPropagation()
          onPick(null)
        }}
      >
        <boxGeometry args={[w + 0.08, h + 0.08, depth + 0.08]} />
        <meshBasicMaterial visible={false} side={THREE.BackSide} />
      </mesh>

      {/* internals: manifold across the top, three cartridges below it */}
      <mesh position={[center.x, topY + 0.05, center.z]}>
        <boxGeometry args={[w - 0.14, 0.06, 0.12]} />
        <meshStandardMaterial {...MANIFOLD} />
      </mesh>
      {STAGE_LOOK.map((s, i) => (
        <Canister
          key={s.key}
          position={[center.x + canisterOffsets[i], topY, center.z]}
          radius={canisterRadius}
          height={0.6}
          color={s.color}
          capColor={s.cap}
          accent={accent}
          selected={active && selectedStage === s.key}
          revealed={revealed}
          onClick={(e) => {
            e.stopPropagation()
            onPick(s.key)
          }}
        />
      ))}

      {/* plumbing — goes see-through with the cover so the water inside shows */}
      <FadeGroup opacity={revealed ? PIPE_XRAY : 1} speed={4}>
        <Pipe points={riser} radius={0.038} material={COPPER} />
        <Valve position={[riserX, 0.9, center.z]} pipeRadius={0.038} handleDir="+x" />
        {outlets.map((pts, i) => (
          <Pipe key={i} points={pts} radius={0.034} material={COPPER} />
        ))}
      </FadeGroup>

      {/* street meter pit, where the mains comes in from */}
      <group position={STREET_METER}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.5, 0.06, 0.34]} />
          <meshStandardMaterial {...PIT} />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.42, 0.02, 0.26]} />
          <meshStandardMaterial color={0x6f767d} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.06, 14, 14]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={active ? 0.8 : 0.25}
          />
        </mesh>
      </group>
    </group>
  )
}
