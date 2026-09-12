import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * The guided walkthrough as a timeline rather than a timer.
 *
 * `stages` stops of `dwell` seconds each, laid end to end and looped, with one
 * playhead that everything else reads: the stage the tour is on is whichever
 * dwell the playhead is inside, and the progress bar is how far along it is.
 * Because position is a number rather than a pending interval, pausing simply
 * stops advancing it and resuming carries on from the same instant — the
 * remainder of the current stage is honoured instead of restarted — and the
 * bar can be scrubbed to any point, which lands the tour on that stage.
 *
 * Three states: `idle` (no tour), `playing`, `paused`. Seeking never changes
 * the state, so a paused tour stays paused wherever it is taken to.
 *
 * `onStage(index)` fires when the playhead crosses into a different stage on
 * its own — advancing, looping, or being scrubbed — never when `seekStage`
 * puts it there, because then the caller already knows.
 *
 * Progress is published to subscribers rather than held in React state: it
 * changes every frame, and a re-render at that rate would reach the canvas.
 * Each notification also carries how far the playhead was just *moved* — by a
 * seek or a scrub, never by playing — so the water can be moved by the same
 * amount and the timeline stays the water's own clock: scrubbing scrubs the
 * stream, and jumping to a stage lands the water where it would have been.
 */

/**
 * Longest step the playhead takes in one frame. A tab left in the background
 * gets no frames, so without this it would come back having skipped stages.
 * Generous enough that a machine merely struggling to draw the scene still
 * gets a tour that runs to time; only a stall is treated as time that did not
 * happen.
 */
const MAX_STEP = 0.25

export function useWalkthrough({ stages, dwell, onStage }) {
  const [status, setStatus] = useState('idle')
  /** Seconds into the timeline. */
  const time = useRef(0)
  /** While the bar is being dragged the loop leaves the playhead alone. */
  const scrubbing = useRef(false)
  const listeners = useRef(new Set())

  const onStageRef = useRef(onStage)
  useEffect(() => {
    onStageRef.current = onStage
  }, [onStage])

  const total = stages * dwell

  const stageAt = useCallback(
    (t) => Math.min(stages - 1, Math.max(0, Math.floor(t / dwell))),
    [stages, dwell],
  )

  const publish = useCallback(
    (jump) => {
      const fraction = time.current / total
      listeners.current.forEach((fn) => fn(fraction, jump))
    },
    [total],
  )

  /**
   * Puts the playhead at `t`. A seek reports the signed distance it moved;
   * playing reports none, so the loop wrapping round does not read as a jump
   * back to the start.
   */
  const place = useCallback(
    (t, seek) => {
      const next = Math.min(total - 1e-6, Math.max(0, t))
      const jump = seek ? next - time.current : 0
      time.current = next
      publish(jump)
    },
    [total, publish],
  )

  /** Moves the playhead, and reports the stage if that changed it. */
  const moveTo = useCallback(
    (t, seek) => {
      const before = stageAt(time.current)
      place(t, seek)
      const after = stageAt(time.current)
      if (after !== before) onStageRef.current(after)
    },
    [stageAt, place],
  )

  useEffect(() => {
    if (status !== 'playing') return
    let id
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(MAX_STEP, (now - last) / 1000)
      last = now
      if (!scrubbing.current) {
        let t = time.current + dt
        if (t >= total) t -= total
        moveTo(t, false)
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [status, total, moveTo])

  const controls = useMemo(
    () => ({
      play: () => setStatus('playing'),
      pause: () => setStatus('paused'),
      /** Ends the tour. The playhead stays put, so play picks up from here. */
      stop: () => setStatus('idle'),
      /** Puts the playhead at the start of a stage the caller has selected. */
      seekStage: (index) => place(index * dwell, true),
      /** Scrubbing: a fraction of the whole timeline. */
      seekFraction: (fraction) => moveTo(fraction * total, true),
      beginScrub() {
        scrubbing.current = true
      },
      endScrub() {
        scrubbing.current = false
      },
      /**
       * Called with the current fraction at once, then on every change — each
       * time also with the seconds the playhead was just seeked by (0 while
       * simply playing).
       */
      subscribe(fn) {
        listeners.current.add(fn)
        fn(time.current / total, 0)
        return () => listeners.current.delete(fn)
      },
    }),
    [dwell, total, moveTo, place],
  )

  return { status, ...controls }
}
