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

  const publish = useCallback(() => {
    const fraction = time.current / total
    listeners.current.forEach((fn) => fn(fraction))
  }, [total])

  /** Moves the playhead, and reports the stage if that changed it. */
  const moveTo = useCallback(
    (t) => {
      const before = stageAt(time.current)
      time.current = Math.min(total - 1e-6, Math.max(0, t))
      publish()
      const after = stageAt(time.current)
      if (after !== before) onStageRef.current(after)
    },
    [stageAt, total, publish],
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
        moveTo(t)
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
      seekStage(index) {
        time.current = index * dwell
        publish()
      },
      /** Scrubbing: a fraction of the whole timeline. */
      seekFraction: (fraction) => moveTo(fraction * total),
      beginScrub() {
        scrubbing.current = true
      },
      endScrub() {
        scrubbing.current = false
      },
      /** Called with the current fraction at once, then on every change. */
      subscribe(fn) {
        listeners.current.add(fn)
        fn(time.current / total)
        return () => listeners.current.delete(fn)
      },
    }),
    [dwell, total, moveTo, publish],
  )

  return { status, ...controls }
}
