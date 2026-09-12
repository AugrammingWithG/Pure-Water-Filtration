import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, getDotTexture, MAX_DELTA, smoothstep } from './common'

/**
 * Stage 4 — the payoff. Nothing is removed at the outlet, so instead the
 * finished water glints: a scatter of small billboard highlights riding the
 * run from the cabinet out to the taps, twinkling in and out. Subtle by
 * design — it should read as clarity, not as a special effect.
 */

const SPARKLE_COUNT = 8
const SIZE = 0.05
const PEAK_OPACITY = 0.85

const rand = (a, b) => a + Math.random() * (b - a)

export default function OutputSparkle({ path, from }) {
  const sprites = useRef([])
  const materials = useRef([])
  const progress = useRef(0)
  const elapsed = useRef(0)
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const dot = useMemo(() => getDotTexture(), [])

  const span = Math.max(0.001, 1 - from)

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        offset: i / SPARKLE_COUNT,
        phase: rand(0, Math.PI * 2),
        freq: rand(2.2, 4.2),
        size: SIZE * rand(0.7, 1.25),
      })),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    elapsed.current += dt
    progress.current = (progress.current + (dt * FLOW_SPEED) / span) % 1

    sparkles.forEach((s, i) => {
      const sprite = sprites.current[i]
      const mat = materials.current[i]
      if (!sprite || !mat) return

      const u = (s.offset + progress.current) % 1
      path.curve.getPointAt(clamp01(from + u * span), scratch)
      sprite.position.copy(scratch)

      // sharp twinkle, eased off at both ends of the run so none of them pop
      const beat = Math.max(0, Math.sin(elapsed.current * s.freq + s.phase))
      const twinkle = beat * beat * beat
      const ends = smoothstep(0, 0.08, u) * (1 - smoothstep(0.93, 1, u))
      mat.opacity = PEAK_OPACITY * twinkle * ends
      const scale = s.size * (0.55 + 0.45 * twinkle)
      sprite.scale.set(scale, scale, scale)
    })
  })

  return (
    <group>
      {sparkles.map((_, i) => (
        <sprite
          key={`sparkle-${i}`}
          ref={(el) => {
            sprites.current[i] = el
          }}
        >
          <spriteMaterial
            ref={(el) => {
              materials.current[i] = el
            }}
            map={dot}
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
