import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuality } from '../three/quality'
import Scene from '../three/Scene'

/**
 * The WebGL viewport. Transparent clear colour so the page background shows
 * through behind the diorama; neutral tone mapping keeps the white cabinet
 * and pale plinth reading as white rather than grey.
 *
 * The canvas fades in once the scene's shaders are built (see
 * three/Precompile.jsx) rather than popping in after a frozen second.
 *
 * Shadow type is set explicitly: r3f's `shadows` shorthand picks
 * PCFSoftShadowMap, which three r186 removed (it warns and falls back). r186's
 * PCF is a jittered 5-tap disc that honours each light's `shadow.radius`.
 */
export default function SimCanvas({
  currentSystem,
  currentStage,
  focused,
  paused,
  subscribe,
  onPick,
  rigRef,
}) {
  const { dpr } = useQuality()
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])
  return (
    <div className={`sim-canvas-wrap${ready ? ' is-ready' : ''}`}>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        /**
         * The scene is fill-rate bound — grass, needles and a lot of soft
         * gradient — so cost scales with pixels, not geometry. Capping at 1.5
         * rather than 2 roughly doubles the frame rate on a high-DPI screen
         * with integrated graphics, which is the difference between water that
         * flows and water that stutters. At this art style the extra half-step
         * of resolution is not visible; the stutter very much is. The quality
         * tier (three/quality.js) lowers the cap further on devices that
         * still can't keep up.
         */
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
          /*
           * Three reads every program's info logs the first time it is used:
           * three synchronous driver round trips per program, each of which
           * waits for that program to finish compiling. Precompile.jsx keeps
           * the compile off the main thread; the logs are only worth reading
           * in development, and three's own docs say to turn this off in
           * production.
           */
          gl.debug.checkShaderErrors = import.meta.env.DEV
        }}
      >
        <Scene
          currentSystem={currentSystem}
          currentStage={currentStage}
          focused={focused}
          paused={paused}
          subscribe={subscribe}
          onPick={onPick}
          onReady={handleReady}
          rigRef={rigRef}
        />
      </Canvas>
    </div>
  )
}
