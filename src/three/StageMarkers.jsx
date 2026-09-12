import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { markerPoint } from './systems'

/**
 * Numbered badges pinned to the four stage positions of the active system, so
 * the route reads as four stops rather than one long pipe. The selected stage
 * takes the accent colour and grows; the rest sit back in grey. Clicking one
 * walks to that stage.
 *
 * Badges are drawn white-on-dark and tinted by the material, so one texture
 * per number serves every system.
 */

/** World size of a badge at ARMS_LENGTH from the camera. */
const BADGE_SIZE = 0.17
/** Badges hold a readable size across the zoom range by scaling with distance. */
const ARMS_LENGTH = 4
const MIN_SCALE = 0.8
const MAX_SCALE = 1.7
/** Extra size for the stage the walkthrough is on. */
const SELECTED_SCALE = 1.3
/** How far above its anchor a badge floats, before the system's own scaling. */
const LIFT = 0.3
/** Rate the tint and fade settle at, in the same units the cartridges use. */
const SETTLE_SPEED = 6

/**
 * Distances between which the unselected badges fade away. Four numbered discs
 * on one 0.8m cabinet is a pile rather than a label once the camera is far
 * enough back to see the whole house, so past DECLUTTER_FAR only the live
 * stage is marked — which is also what lets the badges grow past the cartridge
 * spacing without ever colliding.
 */
const DECLUTTER_NEAR = 5
const DECLUTTER_FAR = 8.5

const MUTED = new THREE.Color(0xaeb8c4)
const IDLE_OPACITY = 0.72
const INK = '#0f1c33'

const textures = new Map()

/** One badge face: dark rim, pale disc, big numeral. */
function badgeTexture(n) {
  const cached = textures.get(n)
  if (cached) return cached

  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(c, c, 112, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(c, c, 100, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 132px "Space Grotesk", "Arial Black", Arial, sans-serif'
  ctx.fillText(String(n), c, c + 6)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  textures.set(n, tex)
  return tex
}

function Badge({ index, stageKey, position, selected, accent, scale, onPick }) {
  const mesh = useRef()
  const material = useRef()
  const camera = useThree((s) => s.camera)
  const canvas = useThree((s) => s.gl.domElement)
  const map = useMemo(() => badgeTexture(index + 1), [index])

  // Tint and fade are animated per frame, so they are seeded here rather than
  // declared as JSX props: a re-render re-applying a prop would snap a badge
  // back to grey part-way through its transition.
  useLayoutEffect(() => {
    const mat = material.current
    if (!mat) return
    mat.color.copy(MUTED)
    mat.opacity = IDLE_OPACITY
  }, [])

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return

    m.quaternion.copy(camera.quaternion)

    // Hold a steady size on screen, and give the live stage a little more of it.
    const distance = camera.position.distanceTo(m.position)
    const fit = THREE.MathUtils.clamp(distance / ARMS_LENGTH, MIN_SCALE, MAX_SCALE)
    m.scale.setScalar(BADGE_SIZE * scale * fit * (selected ? SELECTED_SCALE : 1))

    const mat = material.current
    if (!mat) return

    // The live stage is always marked; the others step back as the camera
    // pulls away, so the diorama keeps a "you are here" pin without wearing
    // four overlapping discs.
    const declutter = selected
      ? 1
      : 1 - THREE.MathUtils.smoothstep(distance, DECLUTTER_NEAR, DECLUTTER_FAR)

    // Rate per second, not per frame, so the transition takes as long on a
    // 144Hz monitor as on a machine that is struggling.
    const settle = Math.min(1, delta * SETTLE_SPEED)
    mat.color.lerp(selected ? accent : MUTED, settle)
    mat.opacity += ((selected ? 1 : IDLE_OPACITY) * declutter - mat.opacity) * settle

    // Hidden badges stop drawing and stop swallowing clicks.
    m.visible = mat.opacity > 0.02
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      renderOrder={3}
      onPointerOver={(e) => {
        e.stopPropagation()
        canvas.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        canvas.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onPick(stageKey)
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={material}
        map={map}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function StageMarkers({ system, currentStage, onPick }) {
  const positions = useMemo(
    () =>
      system.path.stageOrder.map((stageKey) => {
        const point = markerPoint(system, stageKey)
        point.y += LIFT * system.markerScale
        return { stageKey, point }
      }),
    [system],
  )

  return (
    <group>
      {positions.map(({ stageKey, point }, i) => (
        <Badge
          key={stageKey}
          index={i}
          stageKey={stageKey}
          position={point}
          selected={stageKey === currentStage}
          accent={system.accentColor}
          scale={system.markerScale}
          onPick={onPick}
        />
      ))}
    </group>
  )
}
