import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LIGHTS } from './layout'

/**
 * Image-based lighting from a hand-built studio, baked once through PMREM
 * (nothing is fetched). The room is a grey gradient — pale overhead, dark
 * underfoot — with light panels placed to agree with <Lighting>: a warm
 * softbox on the key side, a tall cool strip on the rim side. That is what
 * puts a warm-to-cool gradient into the stainless cabinet, the copper and the
 * glass instead of a flat white bounce. Direct light and shadows come from
 * <Lighting>.
 */

const ROOM_RADIUS = 30
/** Panels sit inside the room, all at this distance from the model. */
const PANEL_DIST = 24

const FLOOR = new THREE.Color(0x24272b)
const HORIZON = new THREE.Color(0x959da6)
const ZENITH = new THREE.Color(0xe6ebf1)

/** Sphere with a vertical colour gradient, seen from the inside. */
function makeRoom() {
  const geo = new THREE.SphereGeometry(ROOM_RADIUS, 32, 24)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / ROOM_RADIUS // -1 floor .. 1 ceiling
    if (t < 0) c.copy(HORIZON).lerp(FLOOR, Math.pow(-t, 0.6))
    else c.copy(HORIZON).lerp(ZENITH, Math.pow(t, 0.8))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }),
  )
}

/**
 * An emissive panel facing the model. `intensity` pushes the colour past 1
 * so the panel reads as a light source in the HDR bake, not a bright wall.
 */
function makePanel({ dir, size, color, intensity }) {
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  mat.color.set(color).multiplyScalar(intensity)
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat)
  mesh.position.copy(dir).setLength(PANEL_DIST)
  mesh.lookAt(0, 0, 0)
  return mesh
}

function makeStudio() {
  const studio = new THREE.Scene()
  studio.add(makeRoom())
  // big soft overhead light, a touch forward so the roof and cabinet tops glow
  studio.add(makePanel({ dir: new THREE.Vector3(0, 1, 0.2), size: [22, 14], color: 0xfff3e4, intensity: 3 }))
  // warm key panel where the sun is
  studio.add(makePanel({ dir: LIGHTS.key, size: [10, 8], color: 0xffd7ad, intensity: 4 }))
  // tall cool strip on the rim side: the long specular streak on the tank and pipes
  studio.add(makePanel({ dir: LIGHTS.rim, size: [3, 16], color: 0xb8d3ff, intensity: 5 }))
  // faint cool fill from the camera's right
  studio.add(makePanel({ dir: new THREE.Vector3(1, 0.25, 0.2), size: [8, 10], color: 0xd9e6f7, intensity: 1.5 }))
  return studio
}

function disposeStudio(studio) {
  studio.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) o.material.dispose()
  })
}

export default function SceneEnvironment({ intensity = 0.55 }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const studio = makeStudio()
    const target = pmrem.fromScene(studio, 0.04)
    disposeStudio(studio)
    pmrem.dispose()
    scene.environment = target.texture
    scene.environmentIntensity = intensity
    return () => {
      if (scene.environment === target.texture) scene.environment = null
      target.dispose()
    }
  }, [gl, scene, intensity])

  return null
}
