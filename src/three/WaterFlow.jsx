import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colorAt, FLOW_SPEED, SERVICE_CURVE } from './waterline'
import { LEGACY_LIGHT_SCALE } from './lighting'

const MAX_DELTA = 0.05

/** Water pulses running the length of the service line. */
const PULSE_COUNT = 28
/** Grit riding in with the raw water, caught partway along by the filters. */
const CONTAM_COUNT = 16
/** Specks fade out over the last 0.06 of their run, then respawn at the meter. */
const CONTAM_FADE_SPAN = 0.06
const CONTAM_BASE_OPACITY = 0.85

/** Two pulses drag a point light along with them for a travelling glow. */
const GLOW_PULSE_A = 0
const GLOW_PULSE_B = 4

const randomJitter = () =>
  new THREE.Vector3(
    (Math.random() - 0.5) * 0.07,
    (Math.random() - 0.5) * 0.07,
    (Math.random() - 0.5) * 0.07,
  )

const randomVanishAt = () => 0.12 + Math.random() * 0.46

export default function WaterFlow() {
  const pulseMeshes = useRef([])
  const contamMeshes = useRef([])
  const glowA = useRef()
  const glowB = useRef()

  // Shared geometry, one material per mesh (each carries its own colour).
  const pulseGeometry = useMemo(() => new THREE.SphereGeometry(0.045, 8, 8), [])
  const contamGeometry = useMemo(() => new THREE.SphereGeometry(0.028, 6, 6), [])

  // Mutable per-particle state, kept out of React so nothing re-renders.
  const pulses = useMemo(
    () => Array.from({ length: PULSE_COUNT }, (_, i) => ({ phase: i / PULSE_COUNT })),
    [],
  )

  const contaminants = useMemo(
    () =>
      Array.from({ length: CONTAM_COUNT }, () => ({
        phase: Math.random() * 0.28,
        vanishAt: randomVanishAt(),
        jitter: randomJitter(),
      })),
    [],
  )

  // Scratch objects reused every frame.
  const scratch = useMemo(
    () => ({ point: new THREE.Vector3(), color: new THREE.Color() }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    const { point, color } = scratch

    pulses.forEach((p, i) => {
      p.phase = (p.phase + dt * FLOW_SPEED) % 1
      SERVICE_CURVE.getPointAt(p.phase, point)
      colorAt(p.phase, color)

      const mesh = pulseMeshes.current[i]
      if (mesh) {
        mesh.position.copy(point)
        mesh.material.color.copy(color)
      }

      if (i === GLOW_PULSE_A && glowA.current) {
        glowA.current.position.copy(point)
        glowA.current.color.copy(color)
      }
      if (i === GLOW_PULSE_B && glowB.current) {
        glowB.current.position.copy(point)
        glowB.current.color.copy(color)
      }
    })

    contaminants.forEach((c, i) => {
      c.phase += dt * FLOW_SPEED * 0.9
      if (c.phase >= c.vanishAt) {
        // Caught by a filter — respawn at the street with a fresh run length.
        c.phase = 0
        c.vanishAt = randomVanishAt()
        c.jitter.copy(randomJitter())
      }

      SERVICE_CURVE.getPointAt(Math.min(c.phase, 0.999), point)

      const mesh = contamMeshes.current[i]
      if (!mesh) return
      mesh.position.set(
        point.x + c.jitter.x,
        point.y + c.jitter.y,
        point.z + c.jitter.z,
      )

      const fadeStart = c.vanishAt - CONTAM_FADE_SPAN
      const fade =
        c.phase < fadeStart
          ? 1
          : Math.max(0, 1 - (c.phase - fadeStart) / CONTAM_FADE_SPAN)
      mesh.material.opacity = CONTAM_BASE_OPACITY * fade
    })
  })

  return (
    <>
      {pulses.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el) => {
            pulseMeshes.current[i] = el
          }}
          geometry={pulseGeometry}
        >
          <meshBasicMaterial color={0xffb37a} transparent opacity={0.9} />
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
          <meshBasicMaterial
            color={0x9a7a4a}
            transparent
            opacity={CONTAM_BASE_OPACITY}
          />
        </mesh>
      ))}

      {/* decay={1} matches r128's default falloff (modern three defaults to 2) */}
      <pointLight
        ref={glowA}
        color={0x3fd8ff}
        intensity={1.3 * LEGACY_LIGHT_SCALE}
        distance={3.5}
        decay={1}
      />
      <pointLight
        ref={glowB}
        color={0xffb37a}
        intensity={1.0 * LEGACY_LIGHT_SCALE}
        distance={3}
        decay={1}
      />
    </>
  )
}
