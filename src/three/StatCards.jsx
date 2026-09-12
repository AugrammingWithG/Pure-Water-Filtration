import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCard from './parts/SceneCard'
import { createStatTexture } from './parts/statCardTexture'

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

export default function StatCards({ system, figures, visible }) {
  const [progress, setProgress] = useState(0)
  const elapsed = useRef(0)
  const lastDrawn = useRef(-1)
  const lastKey = useRef(null)

  /** The unit itself: the point its own camera view looks at. */
  const anchor = useMemo(() => system.view.target.clone(), [system])

  /**
   * Rebuilt whenever the count ticks or the system changes. Three canvases and
   * three uploads per rebuild, which is why REDRAW_HZ is where it is.
   */
  const cards = useMemo(
    () => SLOTS.map((slot) => createStatTexture(slot.kind, figures, progress)),
    [figures, progress],
  )

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
    }),
    [],
  )

  const offsetFor = useCallback(
    (slot) => (out, { width, camera }) => {
      const { right, up, toCamera } = scratch
      right.set(1, 0, 0).applyQuaternion(camera.quaternion)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion)
      toCamera.copy(camera.position).sub(anchor).normalize()
      out
        .addScaledVector(right, slot.x * width)
        .addScaledVector(up, slot.y * width)
        .addScaledVector(toCamera, PULL * system.markerScale)
    },
    [anchor, system, scratch],
  )

  // Nothing to draw, and nothing to pay for, until the unit has been picked.
  if (!visible && progress === 0) return null

  return (
    <group>
      {SLOTS.map((slot, i) => (
        <SceneCard
          key={slot.kind}
          card={cards[i]}
          anchor={anchor}
          visible={visible}
          offset={offsetFor(slot)}
        />
      ))}
    </group>
  )
}
