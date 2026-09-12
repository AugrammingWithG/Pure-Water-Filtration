import * as THREE from 'three'

/**
 * Shared behaviour for anything anchored in the scene that has to stay
 * readable: the numbered stage badges and the stage card.
 *
 * Both turn to face the camera and both hold a roughly steady size on screen
 * rather than shrinking with distance. Keeping the numbers here rather than in
 * each component is what stops a badge and the card it sits beside scaling and
 * fading at different rates, which reads as two unrelated systems.
 */

/** Distance at which an anchored label is drawn at its nominal size. */
export const ARMS_LENGTH = 4
/**
 * Bounds on the distance compensation. Without a ceiling a label at the wide
 * framing would swell to cover the house; without a floor it would shrink to
 * nothing as the camera walks into a cartridge.
 */
export const MIN_FIT = 0.8
export const MAX_FIT = 1.7

/** Rate tints and fades settle at, in the same units the cartridges use. */
export const SETTLE_SPEED = 6

/**
 * Distances between which anchored labels that are not the live stage fade
 * away, so the wide view carries one marker rather than four overlapping ones.
 */
export const DECLUTTER_NEAR = 5
export const DECLUTTER_FAR = 8.5

/**
 * How much to scale an anchored label at this distance so it holds a steady
 * size on screen. Exposed on its own for callers that need the size *before*
 * they can decide where to put the object — the card offsets itself sideways
 * by a fraction of its own width, so it has to know that width first.
 */
export function fitAt(distance) {
  return THREE.MathUtils.clamp(distance / ARMS_LENGTH, MIN_FIT, MAX_FIT)
}

/**
 * Turn `object` to face the camera, and report both its distance and the
 * factor to scale it by. The caller applies the scale, because a badge is
 * square and a card is not.
 */
export function faceCamera(object, camera) {
  object.quaternion.copy(camera.quaternion)
  const distance = camera.position.distanceTo(object.position)
  return { distance, fit: fitAt(distance) }
}

/** 1 while the camera is close, easing to 0 as it pulls back. */
export function declutterAt(distance) {
  return 1 - THREE.MathUtils.smoothstep(distance, DECLUTTER_NEAR, DECLUTTER_FAR)
}

/**
 * Per-second damping factor. Rate per second, not per frame, so a transition
 * takes as long on a 144Hz monitor as on a machine that is struggling.
 */
export function settle(delta, speed = SETTLE_SPEED) {
  return Math.min(1, delta * speed)
}
