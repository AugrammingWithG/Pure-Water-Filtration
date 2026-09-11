import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colorAt, FLOW_SPEED } from './systems'

const MAX_DELTA = 0.05

/** Water pulses running the length of the path. */
const PULSE_COUNT = 34
/** Grit riding in with the raw water, caught partway along by the filters. */
const CONTAM_COUNT = 14
/** Specks fade out over the last 0.05 of their run, then respawn at the start. */
const CONTAM_FADE_SPAN = 0.05
const CONTAM_BASE_OPACITY = 0.9

const randomJitter = () =>
  new THREE.Vector3(
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
  )

/**
 * Animated water travelling along the active system's path, changing colour
 * as it passes each stage. Remount (key by system) when the system changes so
 * particle state starts fresh on the new path.
 */
export default function WaterFlow({ system }) {
  const { curve, stops, contaminantSpan, pulseRadius } = system
  const pulseMeshes = useRef([])
  const contamMeshes = useRef([])

  const pulseGeometry = useMemo(() => new THREE.SphereGeometry(pulseRadius, 8, 8), [pulseRadius])
  const contamGeometry = useMemo(
    () => new THREE.SphereGeometry(pulseRadius * 0.6, 6, 6),
    [pulseRadius],
  )

  const randomVanishAt = useMemo(() => {
    const [a, b] = contaminantSpan
    return () => a + Math.random() * (b - a)
  }, [contaminantSpan])

  // Mutable per-particle state, kept out of React so nothing re-renders.
  const pulses = useMemo(
    () => Array.from({ length: PULSE_COUNT }, (_, i) => ({ phase: i / PULSE_COUNT })),
    [],
  )
  const contaminants = useMemo(
    () =>
      Array.from({ length: CONTAM_COUNT }, () => ({
        phase: Math.random() * contaminantSpan[0],
        vanishAt: randomVanishAt(),
        jitter: randomJitter(),
      })),
    [contaminantSpan, randomVanishAt],
  )

  const scratch = useMemo(
    () => ({ point: new THREE.Vector3(), color: new THREE.Color() }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    const { point, color } = scratch

    pulses.forEach((p, i) => {
      p.phase = (p.phase + dt * FLOW_SPEED) % 1
      const mesh = pulseMeshes.current[i]
      if (!mesh) return
      curve.getPointAt(p.phase, point)
      colorAt(stops, p.phase, color)
      mesh.position.copy(point)
      mesh.material.color.copy(color)
    })

    contaminants.forEach((c, i) => {
      c.phase += dt * FLOW_SPEED * 0.9
      if (c.phase >= c.vanishAt) {
        // Caught by a filter — respawn at the start with a fresh run length.
        c.phase = 0
        c.vanishAt = randomVanishAt()
        c.jitter.copy(randomJitter())
      }
      const mesh = contamMeshes.current[i]
      if (!mesh) return
      curve.getPointAt(Math.min(c.phase, 0.999), point)
      mesh.position.set(point.x + c.jitter.x, point.y + c.jitter.y, point.z + c.jitter.z)

      const fadeStart = c.vanishAt - CONTAM_FADE_SPAN
      const fade =
        c.phase < fadeStart ? 1 : Math.max(0, 1 - (c.phase - fadeStart) / CONTAM_FADE_SPAN)
      mesh.material.opacity = CONTAM_BASE_OPACITY * fade
    })
  })

  return (
    <group>
      {pulses.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el) => {
            pulseMeshes.current[i] = el
          }}
          geometry={pulseGeometry}
        >
          <meshBasicMaterial color={0xffffff} toneMapped={false} />
        </mesh>
      ))}

      {contaminants.map((_, i) => (
        <mesh
          key={`contam-${i}`}
          ref={(el) => {
            contamMeshes.current[i] = el
          }}
          geometry={contamGeometry}
        >
          <meshBasicMaterial color={0x6b5433} transparent opacity={CONTAM_BASE_OPACITY} />
        </mesh>
      ))}
    </group>
  )
}
