import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Precompile from '../three/Precompile'
import QualityGovernor from '../three/QualityGovernor'
import SceneEnvironment from '../three/SceneEnvironment'
import WholeHouseUnit from '../three/products/WholeHouseUnit'
import { useQuality } from '../three/quality'
import { WHOLE_UNIT } from '../three/layout'
import { SYSTEMS } from '../three/systems'

/**
 * Product-focused hero scene: the whole-house unit alone on a clean interior
 * wall, framed cinematically. No orbit, no diorama — the surrounding room is
 * just an opaque wall and floor, so the page's own gradient reads as light
 * spilling in from off-camera.
 *
 * The unit lives in world coordinates set by three/layout.js (its center is
 * at WHOLE_UNIT.center); we wrap it in a group that moves that centre to the
 * origin so the camera and the room can be authored around (0, 1, 0) instead.
 */

/** Offset that moves WHOLE_UNIT.center → origin. */
const CENTER_OFFSET = [-WHOLE_UNIT.center.x, 0, -WHOLE_UNIT.center.z]

/** The unit's front face after the offset — used to place the wall behind it. */
const FRONT_Z = WHOLE_UNIT.depth / 2
const BACK_Z = -WHOLE_UNIT.depth / 2

/** Where the copper riser lands relative to the moved unit. */
const RISER_LOCAL_X = WHOLE_UNIT.riserX - WHOLE_UNIT.center.x

/** Interior wall a little behind the cabinet back face. */
const WALL_Z = BACK_Z - 0.02

/**
 * Room colours. Cool off-white for the wall to sit with the page's blue-tinted
 * hero gradient, a shade darker for the floor so the cabinet's shadow reads.
 */
const WALL_COLOR = 0xeef2f6
const FLOOR_COLOR = 0xd9dee4
/** Warm sunlight, matching the KEY_COLOR used elsewhere in the scene. */
const KEY_COLOR = 0xfff5dd
const RIM_COLOR = 0xbcd7ff
const FILL_COLOR = 0xd7e2ee

/**
 * Where the camera sits and looks, for wide and stacked layouts. Both point
 * a little left of the unit so the unit itself falls on the right of frame
 * and the copy overlay has clean wall to sit on. Stacked (phone) recentres
 * and pulls back, and drops the fov a touch — the aspect narrows and the
 * off-centre framing no longer buys anything.
 */
const CAMERA = {
  wide: {
    position: [0.85, 1.55, 2.35],
    target: [-0.35, 1.15, 0],
    fov: 30,
  },
  stacked: {
    position: [0.35, 1.5, 2.75],
    target: [0, 1.15, 0],
    fov: 34,
  },
}

/**
 * Places the camera each frame and applies a slow cinematic breathing —
 * ±0.06 units of parallax across roughly twelve seconds — so the render
 * feels alive without inviting interaction. The pose comes from `stacked`,
 * which changes on breakpoint.
 */
function CinematicCamera({ stacked }) {
  const camera = useThree((s) => s.camera)
  const config = stacked ? CAMERA.stacked : CAMERA.wide
  const baseRef = useRef(new THREE.Vector3())
  const targetRef = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    baseRef.current.set(...config.position)
    targetRef.current.set(...config.target)
    const t = clock.getElapsedTime()
    const drift = Math.sin(t * 0.5) * 0.06
    const lift = Math.sin(t * 0.35 + 1.2) * 0.03
    camera.position.set(
      baseRef.current.x + drift,
      baseRef.current.y + lift,
      baseRef.current.z,
    )
    if (camera.fov !== config.fov) {
      camera.fov = config.fov
      camera.updateProjectionMatrix()
    }
    camera.lookAt(targetRef.current)
  })

  return null
}

function StudioLighting() {
  const { shadowMap } = useQuality()
  return (
    <>
      <hemisphereLight args={[0xdfe9f6, 0xb9a98c, 0.55]} />
      {/*
        Warm key raking in from front-left-above, throwing the cabinet's
        silhouette and the copper riser onto the wall behind it. Frustum
        tightened around the visible product so shadow resolution isn't wasted
        on empty room.
      */}
      <directionalLight
        color={KEY_COLOR}
        intensity={3.6}
        position={[-2.4, 3.6, 2.8]}
        castShadow
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-intensity={0.9}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-2}
        shadow-camera-near={1}
        shadow-camera-far={10}
      />
      {/* Cool rim from behind-right to separate the stainless from the wall. */}
      <directionalLight color={RIM_COLOR} intensity={0.55} position={[2.2, 2.2, -2]} />
      {/* Soft fill from camera right so shaded faces keep their shape. */}
      <directionalLight color={FILL_COLOR} intensity={0.35} position={[3, 1.4, 3]} />
    </>
  )
}

function Room() {
  return (
    <>
      <mesh position={[0, 1.6, WALL_Z]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.92} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.75} metalness={0.02} />
      </mesh>
    </>
  )
}

/**
 * The hero product scene. Renders the whole-house unit, without its street
 * meter, on a clean interior wall. Everything is fixed: no orbit rig, no
 * picking, no walkthrough — just the object, lit.
 */
export default function HeroProductScene({ stacked, onReady }) {
  const accent = SYSTEMS.whole.accentColor
  return (
    <>
      <QualityGovernor />
      <SceneEnvironment intensity={0.35} />
      <StudioLighting />
      <Room />

      <group position={CENTER_OFFSET}>
        <WholeHouseUnit
          active={false}
          revealed={false}
          selectedStage={null}
          accent={accent}
          onPick={() => {}}
          showMeter={false}
        />
        {/*
          The riser is drawn by WholeHouseUnit down to y=-0.05, below where the
          street pit would have covered it. A skinny plinth at the riser foot
          hides the cut end and reads as a floor bracket where the pipe enters
          the slab.
        */}
        <mesh position={[RISER_LOCAL_X, 0.02, WHOLE_UNIT.center.z]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.04, 0.16]} />
          <meshStandardMaterial color={0x8e949a} roughness={0.85} metalness={0.05} />
        </mesh>
      </group>

      <CinematicCamera stacked={stacked} />
      <Precompile onReady={onReady} />
    </>
  )
}
