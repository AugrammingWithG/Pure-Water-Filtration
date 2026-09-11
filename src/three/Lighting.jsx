import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GROUND, LIGHTS } from './layout'

/**
 * Three-point rig for the diorama, set up for the home framing (camera
 * front-right, elevated). Everything is fixed in world space, so the light
 * moves across the model as the camera orbits, the way it would on a set.
 *
 *  - key: warm, late-afternoon sun from the front-left, low enough to rake
 *    long shadows across the lawn and throw the roof overhang onto the front
 *    wall. Comes in through the front glazing, so the kitchen gets sun patches
 *    in the cutaway view.
 *  - rim: cool backlight from behind-right, tinted with the active system's
 *    accent. Catches the ridge, the back roof slab, the tank and the stainless
 *    rain unit, so the silhouette separates from the white page.
 *  - fill: hemisphere sky/ground bounce plus a faint cool wash from the
 *    camera's right so the shaded faces keep their shape without going grey.
 *
 * <SceneEnvironment> places its light panels along the same LIGHTS directions
 * so the reflections on metal and glass agree with the direct light.
 */

const KEY_COLOR = 0xffdfbe
const SKY_COLOR = 0xdfe9f6
const GROUND_BOUNCE = 0xb9a98c
const FILL_COLOR = 0xd3e2f4
/** Cool white the rim starts from before the accent is mixed in. */
const RIM_BASE = new THREE.Color(0xcfe0ff)
const RIM_ACCENT_MIX = 0.45

/** Page ink colour, same as the CSS --ink the UI's drop shadows use. */
const INK = 'rgba(15,28,51,'

/**
 * Radial falloff for the drop shadow. Only the part outside the plinth is
 * ever seen (the slab covers the middle), so the ramp is shaped for the
 * outer third: still solid where the rim is, gone by the edge.
 */
function makeShadowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, `${INK}1)`)
  g.addColorStop(0.7, `${INK}0.6)`)
  g.addColorStop(0.85, `${INK}0.22)`)
  g.addColorStop(1, `${INK}0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Soft ink shadow under the plinth so the slab sits on the page instead of
 * floating over it. Pushed a little away from the key, like a real drop
 * shadow would be.
 */
function PlinthShadow() {
  const tex = useMemo(() => makeShadowTexture(), [])
  const size = GROUND.radius * 2 * 1.3
  return (
    <mesh position={[0.4, -0.2, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={0.32} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

export default function Lighting({ accent }) {
  const rim = useRef()
  const rimTarget = useRef(new THREE.Color())

  useFrame((_, delta) => {
    if (!rim.current) return
    rimTarget.current.copy(RIM_BASE).lerp(accent, RIM_ACCENT_MIX)
    rim.current.color.lerp(rimTarget.current, Math.min(1, delta * 3))
  })

  return (
    <>
      <hemisphereLight args={[SKY_COLOR, GROUND_BOUNCE, 0.5]} />

      <directionalLight
        color={KEY_COLOR}
        intensity={3.1}
        position={LIGHTS.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        /* let a little key through so the shadows read as shade, not holes */
        shadow-intensity={1.5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={4}
        shadow-camera-far={26}
      />

      <directionalLight
        ref={rim}
        color={RIM_BASE}
        intensity={0.2}
        position={LIGHTS.rim}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={0.05}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={2}
        shadow-camera-far={24}
      />

      <directionalLight color={FILL_COLOR} intensity={0.35} position={[10, 3, 2]} />

      <PlinthShadow />
    </>
  )
}
