import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from '../three/Scene'

/**
 * The WebGL viewport. Transparent clear colour so the page background shows
 * through behind the diorama; neutral tone mapping keeps the white cabinet
 * and pale plinth reading as white rather than grey.
 *
 * Shadow type is set explicitly: r3f's `shadows` shorthand picks
 * PCFSoftShadowMap, which three r186 removed (it warns and falls back). r186's
 * PCF is a jittered 5-tap disc that honours each light's `shadow.radius`.
 */
export default function SimCanvas({ currentSystem, currentStage, focused, onPick, rigRef }) {
  return (
    <div className="sim-canvas-wrap">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        /**
         * The scene is fill-rate bound — grass, two shadow passes and a lot of
         * soft gradient — so cost scales with pixels, not geometry. Capping at
         * 1.5 rather than 2 roughly doubles the frame rate on a high-DPI screen
         * with integrated graphics, which is the difference between water that
         * flows and water that stutters. At this art style the extra half-step
         * of resolution is not visible; the stutter very much is.
         */
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{ fov: 40, near: 0.1, far: 120 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Scene
          currentSystem={currentSystem}
          currentStage={currentStage}
          focused={focused}
          onPick={onPick}
          rigRef={rigRef}
        />
      </Canvas>
    </div>
  )
}
