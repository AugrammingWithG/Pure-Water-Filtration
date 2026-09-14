import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Whether the point a card is about can actually be seen from here.
 *
 * Cards are drawn with depth testing off so the scene can never hide one —
 * settled in CS-0019, and still right, because a card half behind a downpipe
 * is worse than a card in front of it. But it means a card outlives its
 * subject: orbit round to the back of the house and the unit is gone while
 * three panels of figures about it are still hanging in the air over a blank
 * wall. This is the test that retires them.
 *
 * Two ways to lose sight of something, and both count: it can be behind
 * geometry, or it can be off the side of the screen. "Behind geometry" is
 * asked of five points across the subject rather than one, so that something
 * narrow in the way does not count as hiding it.
 */

/** Scenery that can hide an anchor. */
export const OCCLUDERS = 'card-occluders'
/**
 * The house, kept apart from the rest so it can be set aside.
 *
 * When a view cuts the building open — the under-sink one — the roof and the
 * front wall are hidden and the reader is plainly looking into the kitchen.
 * The side and back walls are still there, though, and a ray to a unit under
 * the bench clips one of them from most angles, so the cards would come and
 * go as the camera went round a room the reader could see into the whole
 * time. A building that has been opened up for this view is not what is
 * hiding the thing inside it.
 */
export const HOUSE_OCCLUDER = 'card-occluder-house'

/** Seconds between checks. A card fading a tenth of a second late is fine. */
const INTERVAL = 0.12
/**
 * Checks that have to agree before the answer changes. A ray grazing the edge
 * of a post flickers; a wall does not.
 */
const AGREE = 2
/** Stop the ray short of the anchor, so the unit does not occlude itself. */
const SHORT = 0.06
/**
 * The anchor is a point, but the thing it stands for is not, and one ray to
 * one point answers the wrong question: a pine trunk between the camera and
 * the exact centre of a unit retires a row of cards about hardware the reader
 * can see perfectly well on either side of it. One of the pines sits 1.75
 * from the under-sink unit, inside the camera's own orbit, so this is not a
 * hypothetical.
 *
 * So five rays instead — the anchor and four points around it in the camera's
 * own plane — and the subject counts as visible if any of them gets through.
 * A trunk or the edge of a wall blocks some; a wall blocks all five.
 *
 * The spread is roughly the half-width of a unit, in world units. Wider and a
 * card would outlive a unit that really is behind something; narrower and the
 * trunk wins again.
 */
const SPREAD = 0.3
const SAMPLES = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]
/**
 * How far outside the frame the anchor may drift before its card goes. Well
 * past the edge, because the card is meant to keep its distance from the
 * anchor and this should only catch a subject that is genuinely gone.
 */
const OFF_SCREEN = 1.3

/** Visible in its own right and not inside something that has been faded out. */
function isShown(object) {
  for (let o = object; o; o = o.parent) if (!o.visible) return false
  return true
}

export function useAnchorVisible(anchor, active = true, houseOpen = false) {
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const [seen, setSeen] = useState(true)

  const kit = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      dir: new THREE.Vector3(),
      ndc: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      point: new THREE.Vector3(),
    }),
    [],
  )
  const since = useRef(0)
  const agreed = useRef(0)

  useFrame((_, delta) => {
    if (!active) {
      // Nothing is asking, so the answer resets rather than going stale: a
      // card coming back should not inherit a verdict from another camera.
      if (!seen) setSeen(true)
      return
    }
    since.current += delta
    if (since.current < INTERVAL) return
    since.current = 0

    const { ray, dir, ndc, right, up, point } = kit

    ndc.copy(anchor).project(camera)
    const onScreen =
      ndc.z < 1 && Math.abs(ndc.x) < OFF_SCREEN && Math.abs(ndc.y) < OFF_SCREEN

    let clear = onScreen
    if (clear) {
      const groups = [scene.getObjectByName(OCCLUDERS)]
      if (!houseOpen) groups.push(scene.getObjectByName(HOUSE_OCCLUDER))

      right.set(1, 0, 0).applyQuaternion(camera.quaternion)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion)

      clear = SAMPLES.some(([dx, dy]) => {
        point
          .copy(anchor)
          .addScaledVector(right, dx * SPREAD)
          .addScaledVector(up, dy * SPREAD)
        dir.copy(point).sub(camera.position)
        const distance = dir.length()
        ray.set(camera.position, dir.divideScalar(distance))
        ray.far = distance - SHORT
        // Visibility is checked here rather than left to the raycaster, which
        // does not care: a mesh the cutaway has faded out must not go on
        // blocking anything.
        return !groups.some(
          (group) => group && ray.intersectObject(group, true).some((hit) => isShown(hit.object)),
        )
      })
    }

    if (clear === seen) {
      agreed.current = 0
      return
    }
    agreed.current += 1
    if (agreed.current >= AGREE) {
      agreed.current = 0
      setSeen(clear)
    }
  })

  return seen
}
