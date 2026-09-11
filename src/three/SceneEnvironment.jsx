import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Image-based lighting from three's built-in RoomEnvironment (a procedural
 * studio box, so nothing is fetched). This is what gives the stainless
 * cabinet and copper pipes something to reflect, and softens the shading on
 * everything else. Direct light and shadows come from <Scene>'s lights.
 */
export default function SceneEnvironment({ intensity = 0.6 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new RoomEnvironment()
    const target = pmrem.fromScene(envScene, 0.04)
    scene.environment = target.texture
    scene.environmentIntensity = intensity
    pmrem.dispose()
    return () => {
      if (scene.environment === target.texture) scene.environment = null
      target.dispose()
    }
  }, [gl, scene, intensity])

  return null
}
