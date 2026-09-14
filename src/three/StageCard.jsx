import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createCardTexture } from './parts/cardTexture'
import { cardFadeAt, fitAt, settle } from './parts/billboard'
import { useAnchorVisible } from './parts/useAnchorVisible'
import { markerPoint } from './systems'

/**
 * The stage card, drawn as scene geometry rather than as DOM over the canvas.
 *
 * Being a real plane is what satisfies the awkward half of the brief: the
 * house occludes it exactly as it occludes anything else, with no raycasting
 * or faked fading, and it can never drift out of step with the render the way
 * a DOM element positioned per frame can.
 *
 * It sits to one side of its anchor rather than on it, so the cartridge it
 * describes stays visible behind the numbered badge that still marks it: the
 * badge is the pin, the card is the explanation beside it. The offset is taken
 * along the camera's own right vector, so "beside" means beside on screen and
 * holds however far the camera is orbited round.
 *
 * Which side is decided per stage rather than fixed, by asking where the other
 * stages of this system are: the card goes toward whichever side has fewer of
 * them. A fixed side works for the stage at one end of a unit and steadily
 * worsens along the row, because the card ends up thrown back across the
 * cartridges it has already passed.
 *
 * It also ignores the depth buffer. That is a deliberate reading of "does not
 * collide with the house": rather than letting the building hide the card when
 * the camera swings behind it, the card is always the topmost thing drawn.
 */

/** Card width in world units at nominal distance; height follows the copy. */
const CARD_WIDTH = 0.62
/** How far the card floats above its anchor, before the system scaling. */
const LIFT = 0.34
/**
 * How far the card is pulled toward the camera off its anchor. Enough to lift
 * it clear of the unit it labels so it does not bury itself in the cabinet or
 * z-fight with the cartridge, while staying visually in the same place.
 */
const PULL = 0.3
/** Distance over which the card fades in after the stage changes. */
const SWAP_SPEED = 5
/**
 * How far to the side the card sits, in multiples of its own width. Scaled off
 * the card rather than the world so the gap stays the same on screen at every
 * zoom, and so the smaller units get a proportionally smaller offset.
 */
const SIDE_GAP = 0.82
/** Rate the card slides across when it changes sides, rather than snapping. */
const SIDE_SPEED = 3.5

export default function StageCard({
  system,
  currentStage,
  content,
  viewScale = 1,
  houseOpen = false,
}) {
  const mesh = useRef()
  const material = useRef()
  const camera = useThree((s) => s.camera)
  const shown = useRef(0)
  const lastKey = useRef(null)

  /**
   * Webfonts may not have arrived when the first card is drawn, and canvas
   * silently falls back to a system face. Redraw once they land.
   */
  const [fontsReady, setFontsReady] = useState(() => !document.fonts)
  useEffect(() => {
    let live = true
    document.fonts?.ready.then(() => {
      if (live) setFontsReady(true)
    })
    return () => {
      live = false
    }
  }, [])

  const card = useMemo(
    () => createCardTexture({ ...content, accent: system.accent }),
    // fontsReady is not read here: it is a signal to redraw, nothing more
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.eyebrow, content.title, content.desc, content.placement, system.accent, fontsReady],
  )

  useEffect(() => () => card.texture.dispose(), [card])

  /**
   * Every stage anchor on this system, so the card can see where its
   * neighbours are and lean away from them.
   */
  const anchors = useMemo(
    () =>
      system.path.stageOrder.map((key) => {
        const point = markerPoint(system, key)
        point.y += LIFT * system.markerScale
        return { key, point }
      }),
    [system],
  )

  /** The point on the unit this card belongs to. */
  const anchor = useMemo(
    () => (anchors.find((a) => a.key === currentStage) ?? anchors[0]).point,
    [anchors, currentStage],
  )

  /**
   * The unit as a whole, which is what both this card and the stat row are
   * measured against — the same point for the visibility test and the same
   * point for the distance fade. Testing each card against its own anchor let
   * the two answer differently within a few centimetres of each other, so the
   * stage card and the figures about the same product came and went at
   * different moments.
   */
  const unit = useMemo(() => system.view.target.clone(), [system])

  /**
   * A card about a unit that has gone behind the house, or off the side of
   * the frame, is describing nothing. Depth testing is off so the scene
   * cannot hide the card itself, which is what makes this necessary.
   */
  const inSight = useAnchorVisible(unit, true, houseOpen)

  /** Smoothed -1..1, so a change of side slides across instead of jumping. */
  const side = useRef(system.cardSide)

  const aspect = card.height / card.width
  const scratch = useMemo(
    () => ({
      toCamera: new THREE.Vector3(),
      right: new THREE.Vector3(),
      other: new THREE.Vector3(),
    }),
    [],
  )

  useFrame((_, delta) => {
    const m = mesh.current
    const mat = material.current
    if (!m || !mat) return
    const { toCamera, right } = scratch

    // Measured from the anchor, not from the card: the card has to know how
    // wide it will be drawn before it can offset itself by a share of that.
    const distance = camera.position.distanceTo(anchor)
    const fit = fitAt(distance)
    const width = CARD_WIDTH * system.markerScale * fit

    toCamera.copy(camera.position).sub(anchor).normalize()
    // the camera's right vector, so the card stays beside the stage on screen
    // however far round the camera has been orbited
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)

    // Lean away from the other stages: count how many sit to each side of this
    // one on screen and take the emptier side. A tie keeps the system default,
    // which is what the middle of an even row gets.
    let toRight = 0
    let toLeft = 0
    for (const a of anchors) {
      if (a.point === anchor) continue
      const d = scratch.other.copy(a.point).sub(anchor).dot(right)
      if (d > 0) toRight++
      else toLeft++
    }
    const wantSide = toRight === toLeft ? system.cardSide : toRight > toLeft ? -1 : 1
    side.current += (wantSide - side.current) * settle(delta, SIDE_SPEED)

    m.position
      .copy(anchor)
      .addScaledVector(toCamera, PULL * system.markerScale)
      .addScaledVector(right, side.current * width * SIDE_GAP)

    m.quaternion.copy(camera.quaternion)
    m.scale.set(width, width * aspect, 1)

    // A fresh card fades in rather than snapping, and the whole thing steps
    // back at the wide framing where it would be unreadable clutter anyway.
    const key = system.key + ':' + currentStage
    if (lastKey.current !== key) {
      lastKey.current = key
      shown.current = 0
    }
    /*
      Faded back as the reader pulls away, and out altogether when the unit
      cannot be seen from here. Measured to the unit rather than to this
      card's own anchor so the figures beneath fade on exactly the same curve:
      the two are about one product and should behave as one thing.
    */
    const target = inSight
      ? cardFadeAt(camera.position.distanceTo(unit) / viewScale)
      : 0
    shown.current += (target - shown.current) * settle(delta, SWAP_SPEED)

    mat.opacity = shown.current
    m.visible = shown.current > 0.02
  })

  return (
    // renderOrder above the badges, and depth testing off, so the card is the
    // last thing drawn and nothing in the scene can cover it
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
