import { Canvas } from '@react-three/fiber'
import Scene from '../three/Scene'

/**
 * The WebGL viewport.
 *
 * `legacy`, `linear` and `flat` put the renderer back into the colour pipeline
 * the prototype was authored against (r128: no colour management, linear
 * output, no tone mapping). Without them modern three re-grades every colour
 * and the palette drifts away from the original.
 */
export default function SimCanvas({ currentStage, onSelectStage, rigRef }) {
  return (
    <div className="sim-canvas-wrap">
      <Canvas
        legacy
        linear
        flat
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 42, near: 0.1, far: 100 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Scene
          currentStage={currentStage}
          onSelectStage={onSelectStage}
          rigRef={rigRef}
        />
      </Canvas>
    </div>
  )
}
