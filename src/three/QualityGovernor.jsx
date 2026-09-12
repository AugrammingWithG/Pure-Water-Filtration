import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { lowerQuality } from './quality'

/** A frame longer than this is a stall (a shader compile, a hidden tab), not the running rate. */
const STALL = 0.25
/** Time to leave the scene alone after mounting or a tier change, before judging it. */
const WARMUP = 2.5
/** Frame times are averaged over windows this long. */
const WINDOW = 1
/**
 * A window that averages below this is a strike. Well above the 30 that
 * reads as "moving": at 36 fps on a 60 Hz phone every other frame is
 * dropped and the camera judders, and a thinner lawn is the better trade.
 */
const SLOW_FPS = 45
/** Strikes in a row before the tier drops: one slow second can be a fly-to. */
const STRIKES = 2

/**
 * Watches the frame rate and steps the quality tier down when the device
 * cannot hold it. It only ever steps down: a scene that has been fast for a
 * while gives no hint how much headroom it has (v-sync caps it), so stepping
 * back up would be a guess, and a wrong one flickers the lawn.
 *
 * The first seconds are ignored — the shader compile on the first render
 * stalls the main thread for a second or more and would count as a slow
 * window — and so is any single frame long enough to be a stall rather than
 * the running rate.
 */
export default function QualityGovernor() {
  const state = useRef({ settle: WARMUP, time: 0, frames: 0, strikes: 0 })

  useFrame((_, delta) => {
    const s = state.current
    if (delta > STALL) {
      s.time = 0
      s.frames = 0
      return
    }
    if (s.settle > 0) {
      s.settle -= delta
      return
    }
    s.time += delta
    s.frames++
    if (s.time < WINDOW) return

    const fps = s.frames / s.time
    s.time = 0
    s.frames = 0
    s.strikes = fps < SLOW_FPS ? s.strikes + 1 : 0
    if (s.strikes < STRIKES) return

    s.strikes = 0
    if (lowerQuality()) s.settle = WARMUP
  })

  return null
}
