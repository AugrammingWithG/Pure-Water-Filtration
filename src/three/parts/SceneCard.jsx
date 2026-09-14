import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { cardFadeAt, fitAt, settle } from './billboard'

/**
 * A canvas card hung in the scene: turns to face the camera, holds a steady
 * size on screen, and fades in and out.
 *
 * Where it goes is the caller's business — a stage card leans away from its
 * neighbours, a stat card takes its slot in a fan around the unit — so
 * `offset` is handed the frame's measurements and writes the displacement it
 * wants from the anchor.
 *
 * Depth testing is off and the render order is high, so nothing in the scene
 * can cover a card. That is the reading of "does not collide with the house"
 * settled on in CS-0019: rather than letting the building hide a card when the
 * camera swings behind it, a card is always the topmost thing drawn.
 */

/** Card width in world units at nominal distance; height follows the content. */
const BASE_WIDTH = 0.52
/** Rate a card fades in and out at. */
const FADE_SPEED = 5

export default function SceneCard({
  card,
  anchor,
  scale = 1,
  visible = true,
  offset,
  width = BASE_WIDTH,
  frameShare,
  /** Step the card back as the camera pulls away. See cardFadeAt. */
  declutter = false,
  /** The rig's narrow-viewport pullback, so the fade is viewport-independent. */
  viewScale = 1,
}) {
  const mesh = useRef()
  const material = useRef()
  const shown = useRef(0)
  const camera = useThree((s) => s.camera)
  const displacement = useMemo(() => new THREE.Vector3(), [])

  const aspect = card.height / card.width

  useFrame((_, delta) => {
    const m = mesh.current
    const mat = material.current
    if (!m || !mat) return

    // Measured from the anchor rather than the card: a card that offsets
    // itself by a share of its own width has to know that width first.
    const distance = camera.position.distanceTo(anchor)
    const fit = fitAt(distance)
    /*
      `frameShare` sizes the card as a fraction of the frame instead of by the
      distance compensation, for callers that need a size they can rely on
      rather than one that is merely steady-ish.

      fitAt only holds a card's screen size between MIN_FIT and MAX_FIT, and
      outside that band the card is at the mercy of the view: the whole-house
      output stage pulls the camera back to 7.5, past the ceiling, where a
      phone card would draw about 35px wide. A share of the frame is the same
      size on screen at every view of every system, which is what a row of
      three that has to fit across a phone actually needs.
    */
    const drawn = frameShare
      ? frameShare * 2 * distance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect
      : width * scale * fit

    displacement.set(0, 0, 0)
    offset?.(displacement, { fit, width: drawn, height: drawn * aspect, camera, anchor, delta })
    m.position.copy(anchor).add(displacement)

    m.quaternion.copy(camera.quaternion)
    m.scale.set(drawn, drawn * aspect, 1)

    const target = (visible ? 1 : 0) * (declutter ? cardFadeAt(distance / viewScale) : 1)
    shown.current += (target - shown.current) * settle(delta, FADE_SPEED)
    mat.opacity = shown.current
    m.visible = shown.current > 0.02
  })

  return (
    <mesh ref={mesh} renderOrder={10}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={material}
        map={card.texture}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
