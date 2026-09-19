import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuality } from '../../three/quality'
import Scene from '../../three/Scene'
import { INTRO_VIEW, stageView, SYSTEMS } from '../../three/systems'

/** Camera fly-to durations, the full Lab's own. */
const STAGE_FLY_MS = 850
const SYSTEM_FLY_MS = 1100

/**
 * The Lab preview's WebGL viewport: the full diorama, live, inside the page.
 * The same renderer settings as the Lab's own SimCanvas (see there for why
 * each is what it is), with two differences that come from sitting in a
 * scrolling page rather than owning the screen:
 *
 *  - the wheel belongs to the page, so the rig does not zoom on it
 *    (`wheelZoom={false}`); pinch still zooms on touch
 *  - the arrow keys belong to the page too, so the canvas is not a tab stop
 *    and has no keyboard camera (`keyboard={false}`). The section's own cards
 *    and Reset view are the keyboard route in here; the full Lab, which owns
 *    the screen, is where the camera itself can be flown from the keyboard
 *  - `running` drives the frame loop, so the scene draws nothing while it
 *    is off screen or under the open Lab
 *
 * Loaded on its own (see LabStage), so the diorama's geometry and textures
 * only arrive once the reader is nearly at the section.
 *
 * `cameraRef` is how the page drives the camera without knowing any
 * geometry: it is given a handle that takes system and stage *keys* and
 * looks the views up here, on this side of the chunk boundary, so the
 * page's bundle never imports three.
 */
export default function LabCanvas({
  running,
  currentSystem,
  currentStage,
  focused,
  paused,
  subscribe,
  onPick,
  onReady,
  cameraRef,
}) {
  const { dpr } = useQuality()
  const rigRef = useRef(null)
  useEffect(() => {
    cameraRef.current = {
      flyToStage: (systemKey, stageKey) =>
        rigRef.current?.flyTo(stageView(systemKey, stageKey), STAGE_FLY_MS),
      flyToSystem: (key) => rigRef.current?.flyTo(SYSTEMS[key].view, SYSTEM_FLY_MS),
      reset: (duration) => rigRef.current?.reset(duration),
    }
    return () => {
      cameraRef.current = null
    }
  }, [cameraRef])
  return (
    <Canvas
      className="lab-canvas"
      frameloop={running ? 'always' : 'never'}
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, dpr]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ fov: 40, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.debug.checkShaderErrors = import.meta.env.DEV
      }}
    >
      <Suspense fallback={null}>
        <Scene
          currentSystem={currentSystem}
          currentStage={currentStage}
          focused={focused}
          paused={paused}
          subscribe={subscribe}
          onPick={onPick}
          onReady={onReady}
          rigRef={rigRef}
          wheelZoom={false}
          keyboard={false}
          start={INTRO_VIEW}
        />
      </Suspense>
    </Canvas>
  )
}
