import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { fitAt, settle } from './billboard'

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
    const drawn = width * scale * fit

    displacement.set(0, 0, 0)
    offset?.(displacement, { fit, width: drawn, camera, anchor, delta })
    m.position.copy(anchor).add(displacement)

    m.quaternion.copy(camera.quaternion)
    m.scale.set(drawn, drawn * aspect, 1)

    shown.current += ((visible ? 1 : 0) - shown.current) * settle(delta, FADE_SPEED)
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
