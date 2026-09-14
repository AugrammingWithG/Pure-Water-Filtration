import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCard from './parts/SceneCard'
import { clampIntoFrame, frameMetrics } from './parts/billboard'
import { COMPACT_WIDTH, createStatTexture, statRowHeight } from './parts/statCardTexture'
import { useAnchorVisible } from './parts/useAnchorVisible'

/**
 * The three system cards — annual cost, five-year cost, yearly impact — hung
 * in the scene around the unit they describe, and shown only once that unit
 * has been picked, from the sidebar or by clicking the product itself.
 *
 * Laid out in screen space rather than world space: two stacked on one side of
 * the unit and one on the other, along the camera's own right and up vectors,
 * so the arrangement holds however far the camera is orbited round.
 *
 * The figures count up on reveal. A canvas cannot be updated a character at a
 * time, so a tick means redrawing the card and re-uploading its texture — and
 * this scene is fill-rate bound (see the README). That is affordable here only
 * because the count is a burst of under a second on reveal, never a steady
 * per-frame cost, and because the redraw is capped well below the frame rate:
 * a number climbing at 15 a second reads as counting just as well as one
 * climbing at 60, for a quarter of the uploads.
 */

/** Seconds the figures take to reach their value. */
const COUNT_SECONDS = 0.95
/** Redraws per second during that count. */
const REDRAW_HZ = 15

/**
 * Slots around the unit, in multiples of the drawn card width: x along the
 * camera's right, y along its up.
 *
 * A row underneath, rather than a fan around the unit. The three never
 * clashed with each other — measured, they had a comfortable gap — but a fan
 * put whichever card sat beside the unit straight through the stage card,
 * on all three systems. The stage card is lifted above its anchor and leans
 * to whichever side has fewer stages, so the space beside and above the unit
 * is the one place it can be; below is the direction it never occupies.
 *
 * Left to right in the order the story runs: this year's bill, five years of
 * it, then what that adds up to beyond money. Tuned as a group against the
 * stage card, so move them together.
 */
const SLOTS = [
  { kind: 'cost', x: -1.25, y: -1.2 },
  { kind: 'savings', x: 0, y: -1.2 },
  { kind: 'impact', x: 1.25, y: -1.2 },
]

/**
 * The phone arrangement: the same three, moved above the unit.
 *
 * Below is right on a desktop, for the reasons above. On a phone it is the
 * one direction that is taken — the bottom of the screen is the detail sheet
 * — and the stage card is not in the scene at all to want the space above.
 *
 * The card drawn there is the narrow cut of the same design (see
 * statCardTexture), hung at a fixed share of the frame so it is the same size
 * on screen at every view. The share is as large as the row can bear: three at
 * 1.14 apart span 320 of a 375px screen, which leaves 28px of margin and about
 * 16px of room to slide before the clamp takes over. Smaller cards would slide
 * more freely and be harder to read, and reading them is the point.
 */
const COMPACT_FRAME_SHARE = 0.26
const ROW_GAP = 1.14
/** How far above the unit the row floats, as a share of the frame height. */
const ROW_LIFT = 0.2
/** Breathing room left between the row and the edge of the frame. */
const EDGE = 0.03
/**
 * What the outer two do that the middle one does not: sit further back by a
 * share of their width, and lower by a share of their height. The depth is a
 * real cue rather than a drawn one — the quads are sized in world units, so
 * the renderer's own perspective draws the further pair a few percent smaller
 * — and the drop is the shape of the thing: an arc reads as three cards
 * arranged in space, a flat line reads as a toolbar.
 */
const SIDE_BACK = 0.28
const SIDE_DROP = 0.3
const COMPACT_SLOTS = SLOTS.map((slot, i) => ({
  kind: slot.kind,
  x: (i - 1) * ROW_GAP,
  back: Math.abs(i - 1) * SIDE_BACK,
  drop: Math.abs(i - 1) * SIDE_DROP,
}))
/**
 * Half a row's width, in card widths: the outer card's centre plus its half.
 * One per arrangement, since the desktop row is spaced wider than the phone's.
 */
const REACH = { compact: ROW_GAP + 0.5, wide: 1.25 + 0.5 }

/** How far the fan is pulled toward the camera, clear of the unit itself. */
const PULL = 0.35

/**
 * Note that these are NOT scaled by the system's markerScale, unlike the stage
 * badges and the stage card. That factor exists to make a label hug small
 * hardware, and it is right for a badge pinned to a cartridge — but a stat
 * card is a panel of text, and shrinking it to match the under-sink unit puts
 * a 200px design on screen at barely half that. Text needs a legible size
 * whatever the size of the thing it is about; the distance clamp in
 * billboard.js is what keeps it steady across the three views.
 */

export default function StatCards({
  system,
  figures,
  visible,
  compact = false,
  insets,
  viewScale = 1,
  houseOpen = false,
}) {
  const [progress, setProgress] = useState(0)
  const elapsed = useRef(0)
  const lastDrawn = useRef(-1)
  const lastKey = useRef(null)

  /** The unit itself: the point its own camera view looks at. */
  const anchor = useMemo(() => system.view.target.clone(), [system])

  /**
   * Figures about a unit nobody can see are just clutter, so the row goes with
   * it — round the back of the house, or off the side of the frame. Boolean
   * rather than a fade of its own: SceneCard eases whatever it is given.
   */
  const inSight = useAnchorVisible(anchor, visible, houseOpen)

  /**
   * Rebuilt whenever the count ticks or the system changes. Three canvases and
   * three uploads per rebuild, which is why REDRAW_HZ is where it is.
   */
  const slots = compact ? COMPACT_SLOTS : SLOTS

  /**
   * All three are drawn at the tallest one's height, so the row lines up at
   * the foot as well as the head. Left alone they come out at 118, 160 and
   * 148, which reads as three unrelated panels rather than one set of figures
   * about one product.
   */
  const cards = useMemo(() => {
    const kinds = SLOTS.map((slot) => slot.kind)
    const width = compact ? COMPACT_WIDTH : undefined
    const height = statRowHeight(kinds, figures, progress, width)
    return kinds.map((kind) => createStatTexture(kind, figures, progress, { width, height }))
  }, [figures, progress, compact])

  useEffect(() => {
    return () => cards.forEach((c) => c.texture.dispose())
  }, [cards])

  useFrame((_, delta) => {
    /**
     * Restart the count whenever the cards are asked for again, or the system
     * changes underneath them. Done here rather than in an effect: resetting
     * state from an effect body costs a second render pass every time, and
     * this already runs every frame.
     */
    const key = system.key + (visible ? ':on' : ':off')
    if (lastKey.current !== key) {
      lastKey.current = key
      elapsed.current = 0
      lastDrawn.current = -1
      if (progress !== 0) setProgress(0)
      return
    }

    if (!visible || progress >= 1) return
    elapsed.current += delta
    const next = Math.min(1, elapsed.current / COUNT_SECONDS)
    // ease out, so the figures settle rather than stopping dead
    const eased = 1 - Math.pow(1 - next, 3)
    const step = Math.floor(next * COUNT_SECONDS * REDRAW_HZ)
    if (next >= 1) {
      setProgress(1)
    } else if (step !== lastDrawn.current) {
      lastDrawn.current = step
      setProgress(eased)
    }
  })

  /** Reused every frame; three cards times sixty frames is a lot of garbage. */
  const scratch = useMemo(
    () => ({
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      toCamera: new THREE.Vector3(),
      fromMiddle: new THREE.Vector3(),
    }),
    [],
  )

  const offsetFor = useCallback(
    (slot) => (out, { width, height, camera }) => {
      const { right, up, toCamera, fromMiddle } = scratch
      right.set(1, 0, 0).applyQuaternion(camera.quaternion)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion)
      toCamera.copy(camera.position).sub(anchor).normalize()

      const frame = frameMetrics(camera, anchor, fromMiddle)

      // Above the unit on a phone, below it on a desktop. The phone's lift is
      // a share of the frame; the desktop's is a share of the card, as it has
      // always been.
      out.addScaledVector(up, compact ? frame.height * ROW_LIFT : slot.y * width)

      /*
        Then pulled back into the part of the frame the interface is not
        standing on. Both arrangements need it: the phone because the row is
        nearly as wide as the screen, and the desktop because a row hung below
        a unit that sits low in its own frame — the rainwater tank at a close
        stage view — drops off the bottom of the canvas and behind the play
        bar.

        Every card works the slide out from the same anchor and the same
        camera, so all three arrive at the same answer and the row stays a row.
        That is why it is done here rather than per card inside SceneCard.
      */
      clampIntoFrame(out, {
        frame,
        offset: fromMiddle,
        right,
        up,
        halfW: (compact ? REACH.compact : REACH.wide) * width,
        halfH: height / 2,
        insets,
        edge: EDGE,
        pull: PULL * system.markerScale,
      })

      out
        .addScaledVector(right, slot.x * width)
        .addScaledVector(up, -(slot.drop ?? 0) * height)
        .addScaledVector(toCamera, PULL * system.markerScale - (slot.back ?? 0) * width)
    },
    [anchor, system, scratch, compact, insets],
  )

  // Nothing to draw, and nothing to pay for, until the unit has been picked.
  if (!visible && progress === 0) return null

  return (
    <group>
      {slots.map((slot, i) => (
        <SceneCard
          key={slot.kind}
          card={cards[i]}
          anchor={anchor}
          visible={visible && inSight}
          declutter
          viewScale={viewScale}
          frameShare={compact ? COMPACT_FRAME_SHARE : undefined}
          offset={offsetFor(slot)}
        />
      ))}
    </group>
  )
}
