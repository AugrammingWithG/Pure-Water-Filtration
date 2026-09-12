import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, getStarTexture, MAX_DELTA, smoothstep } from './common'

/**
 * Stage 4 — the payoff. Nothing is removed at the outlet, so instead the
 * finished water sparkles on its way to the taps.
 *
 * Four-point stars rather than soft dots: at glint size a round dot just reads
 * as a pale smudge, and the arms are what make the eye call it a sparkle. They
 * pop rather than pulse — opacity runs off a steep power of the beat, so each
 * one is dark most of the time and briefly very bright, which is how a glint
 * on moving water actually behaves. Each turns slowly as well, so the arms
 * catch differently through the flash.
 */

const SPARKLE_COUNT = 14
/**
 * Glint width as a multiple of the stream radius, NOT an absolute size. The
 * three systems run water of very different gauges and the camera comes in as
 * close as each unit is small, so a fixed world size cannot read the same on
 * all of them. A star can be drawn wider than a dot at the same apparent size
 * because its arms are thin and most of the sprite stays transparent.
 */
const SIZE_RATIO = 1.45
const PEAK_OPACITY = 0.95
/** Higher powers make a sharper, less pulsing flash. */
const FLASH_SHARPNESS = 4

const rand = (a, b) => a + Math.random() * (b - a)

export default function OutputSparkle({ path, from, streamRadius = 0.024 }) {
  const sprites = useRef([])
  const materials = useRef([])
  const progress = useRef(0)
  const elapsed = useRef(0)
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const star = useMemo(() => getStarTexture(), [])

  const span = Math.max(0.001, 1 - from)

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        offset: i / SPARKLE_COUNT,
        phase: rand(0, Math.PI * 2),
        freq: rand(2.4, 5),
        spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.2, 0.8),
        lean: rand(0, Math.PI * 2),
        size: streamRadius * SIZE_RATIO * rand(0.7, 1.3),
      })),
    [streamRadius],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    elapsed.current += dt
    progress.current = (progress.current + (dt * FLOW_SPEED) / span) % 1
    const time = elapsed.current

    sparkles.forEach((s, i) => {
      const sprite = sprites.current[i]
      const mat = materials.current[i]
      if (!sprite || !mat) return

      const u = (s.offset + progress.current) % 1
      path.curve.getPointAt(clamp01(from + u * span), scratch)
      sprite.position.copy(scratch)

      // a sharp pop, eased off at both ends of the run so none of them appear
      // or vanish mid-pipe
      const beat = Math.max(0, Math.sin(time * s.freq + s.phase))
      const twinkle = Math.pow(beat, FLASH_SHARPNESS)
      const ends = smoothstep(0, 0.08, u) * (1 - smoothstep(0.93, 1, u))
      mat.opacity = PEAK_OPACITY * twinkle * ends
      mat.rotation = s.lean + time * s.spin

      const scale = s.size * (0.45 + 0.55 * twinkle)
      sprite.scale.set(scale, scale, scale)
    })
  })

  return (
    <group>
      {sparkles.map((s, i) => (
        <sprite
          key={`sparkle-${i}`}
          ref={(el) => {
            sprites.current[i] = el
          }}
          // a bare sprite defaults to one world unit; without this it renders
          // as a metre-wide blob on the first frame, before useFrame sizes it
          scale={[s.size, s.size, s.size]}
        >
          <spriteMaterial
            ref={(el) => {
              materials.current[i] = el
            }}
            map={star}
            color={0xeaf6ff}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  )
}
