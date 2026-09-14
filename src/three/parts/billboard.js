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

/**
 * Distances between which a card steps back as the reader pulls away, in
 * scene units before the narrow-viewport pullback.
 *
 * Its own band rather than the badges' DECLUTTER pair, and a much later one,
 * because a badge and a card are asked different questions. A badge is a pin
 * and there are four of them, so they have to thin out early or the wide view
 * is a thicket. A card is the reading matter, and every scripted view is
 * inside 7.5 — the whole-house output stage, which pulls furthest back — so
 * anything nearer than that keeps its cards at full strength. Past 9 the
 * reader has zoomed out on their own, and is looking at the diorama rather
 * than reading about it.
 */
export const CARD_FADE_NEAR = 9
export const CARD_FADE_FAR = 13

/**
 * How much of a card to draw at this distance. Feed it the distance divided
 * by the viewport pullback, so a phone and a desktop at the same framing fade
 * at the same moment rather than the phone losing its cards two thirds of the
 * way in.
 */
export function cardFadeAt(distance) {
  return 1 - THREE.MathUtils.smoothstep(distance, CARD_FADE_NEAR, CARD_FADE_FAR)
}

/** 1 while the camera is close, easing to 0 as it pulls back. */
export function declutterAt(distance) {
  return 1 - THREE.MathUtils.smoothstep(distance, DECLUTTER_NEAR, DECLUTTER_FAR)
}

const _forward = new THREE.Vector3()
const _middle = new THREE.Vector3()

/**
 * What the frame is worth in world units at `anchor`'s depth, and where the
 * anchor sits inside it.
 *
 * Anything that has to stay on screen needs these three numbers: how far the
 * anchor is along the view axis, how much world the frame covers there, and
 * how far the anchor is from the middle of it. Writing them here rather than
 * in each caller is what keeps the stage card and the stat row agreeing about
 * where the edge of the screen is.
 *
 * `offsetOut` receives the anchor's displacement from the centre of the frame,
 * in world units — dot it with the camera's right and up to get it per axis.
 */
export function frameMetrics(camera, anchor, offsetOut) {
  _forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
  const depth = _middle.copy(anchor).sub(camera.position).dot(_forward)
  _middle.copy(camera.position).addScaledVector(_forward, depth)
  offsetOut.copy(anchor).sub(_middle)
  const height = 2 * depth * Math.tan((camera.fov * Math.PI) / 360)
  return { depth, height, width: height * camera.aspect }
}

/** No interface in the way, for callers that have not been given any. */
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 }

/**
 * Slide `out` so that a card of `halfW` x `halfH`, hung at `anchor + out`,
 * stays inside the part of the frame the interface is not standing on.
 *
 * `offset` is the anchor's displacement from the middle of the frame, as
 * `frameMetrics` writes it; `right` and `up` are the camera's own axes.
 * Insets are fractions of the frame per edge — see useUiInsets.
 *
 * The limits are not symmetric, which is the whole point: the floating cards
 * live down one side, so a card has further to go before it runs out of room
 * on one hand than on the other, and a symmetric clamp would either give away
 * the good side or slide cards under the interface on the bad one.
 *
 * `pull` is how far the card has been drawn toward the camera off its anchor.
 * A card sized for the frame at the anchor's depth but hung nearer than that
 * projects larger, and further out, by the ratio of the two depths — 14% at a
 * pull of 0.3 and a depth of 2.4 — so both the position and the extents are
 * measured in the frame it is really in, not the frame it was sized for.
 */
export function clampIntoFrame(
  out,
  { frame, offset, right, up, halfW, halfH, insets = NO_INSETS, edge = 0.03, pull = 0 },
) {
  const grow = pull ? frame.depth / (frame.depth - pull) : 1
  const across = (offset.dot(right) + out.dot(right)) * grow
  const rise = (offset.dot(up) + out.dot(up)) * grow
  halfW *= grow
  halfH *= grow

  const left = -frame.width / 2 + (insets.left + edge) * frame.width + halfW
  const rightLimit = frame.width / 2 - (insets.right + edge) * frame.width - halfW
  const bottom = -frame.height / 2 + (insets.bottom + edge) * frame.height + halfH
  const top = frame.height / 2 - (insets.top + edge) * frame.height - halfH

  // A frame too small for the card leaves nothing to clamp to; centring what
  // is left over beats pinning it to an edge that has already been passed.
  const x = left > rightLimit ? (left + rightLimit) / 2 : THREE.MathUtils.clamp(across, left, rightLimit)
  const y = bottom > top ? (bottom + top) / 2 : THREE.MathUtils.clamp(rise, bottom, top)

  out.addScaledVector(right, (x - across) / grow).addScaledVector(up, (y - rise) / grow)
}

/**
 * Per-second damping factor. Rate per second, not per frame, so a transition
 * takes as long on a 144Hz monitor as on a machine that is struggling.
 */
export function settle(delta, speed = SETTLE_SPEED) {
  return Math.min(1, delta * speed)
}
