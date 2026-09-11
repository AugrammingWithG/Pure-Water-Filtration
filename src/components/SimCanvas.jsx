import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from '../three/Scene'

/**
 * The WebGL viewport. Transparent clear colour so the page background shows
 * through behind the diorama; neutral tone mapping keeps the white cabinet
 * and pale plinth reading as white rather than grey.
 */
export default function SimCanvas({ currentSystem, currentStage, focused, onPick, rigRef }) {
  return (
    <div className="sim-canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
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
