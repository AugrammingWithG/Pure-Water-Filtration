import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_SPEED } from '../systems'
import { clamp01, MAX_DELTA, smoothstep } from './common'

/**
 * Stage 2 — absorption, deliberately not exclusion.
 *
 * Chlorine is dissolved. Nothing drops out, nothing is strained, and a stream
 * of specks would be the wrong story — so this stage is carried mostly by a
 * thing that is not a particle at all:
 *
 *   tint   the raw water is visibly tinted, and the tint dies across the
 *          block. One static tube, no per-frame cost, and it does more for
 *          legibility than any number of particles: you can see the chlorine
 *          in the water before you see any of it being taken out.
 *   wisps  what the tint is made of, drawn out of the flow and into the
 *          porous wall, curling as they go
 *   soak   the block itself flushing as it takes them up
 *
 * Read against stage 1 the contrast is the point: there the grit is stopped
 * dead at the face and piles up, here the water carries straight on through
 * and only what is dissolved in it goes sideways into the media.
 *
 * A carbon stage is not always one cartridge — the rainwater unit runs two in
 * series — so the elements are read off the path media legs rather than
 * assumed. Each takes an equal share of the chlorine, so with two the tint
 * drops to half across the first and to nothing across the second.
 */

const WISP_COUNT = 26
const WISP_COLOR = 0xc2d84e
/** As a fraction of the stream radius — a wisp is a fat, soft thing. */
const WISP_SCALE = 0.8
/** Radians per second a wisp turns around the axis of the pipe. */
const SWIRL_MIN = 0.6
const SWIRL_MAX = 1.8

/** The tinted sleeve: how wide it runs, and how strong it is in raw water. */
const TINT_RADIUS = 1.15
const TINT_ALPHA = 0.3
const TINT_SEGMENTS = 240
const TINT_RADIAL = 8

/** A block flushes as it takes wisps up, then settles again. */
const SOAK_PER_WISP = 0.3
const SOAK_DECAY = 1.1

const rand = (a, b) => a + Math.random() * (b - a)

export default function CarbonAbsorption({
  path,
  radius = 0.09,
  streamRadius = 0.024,
  bore = Infinity,
}) {
  // Wide enough to clearly envelop the bubbles, but never wider than the
  // narrowest pipe the route runs inside. The under-sink unit runs 0.011
  // tubing, which is tighter than the stream is wide on the mains.
  const sleeveRadius = Math.min(streamRadius * TINT_RADIUS, bore * 0.95)

  const wispMesh = useRef()
  const soakMats = useRef([])

  /** One entry per cartridge this stage runs the water through, in flow order. */
  const elements = useMemo(() => {
    const stage = path.stageOrder[1]
    const legs = path.legs.filter((l) => l.media && l.stage === stage)
    const spans = legs.length ? legs.map((l) => [l.u0, l.u1]) : [path.mediaSpans[stage]]
    return spans.map(([enter, exit]) => {
      const face = path.curve.getPointAt(enter)
      const back = path.curve.getPointAt(exit)
      return {
        enter,
        exit,
        spawnLimit: path.phaseAt(enter),
        axis: face,
        midY: (face.y + back.y) / 2,
        height: Math.abs(back.y - face.y),
      }
    })
  }, [path])

  const wispGeometry = useMemo(
    () => new THREE.SphereGeometry(streamRadius * WISP_SCALE, 8, 6),
    [streamRadius],
  )

  /**
   * The tint on the raw water: one tube down the whole route, its alpha held
   * at full strength and then stepped down once per element. Colour and alpha
   * both live in the vertex attribute, which three switches to per-vertex
   * alpha when the colour attribute has four components — so the whole sleeve
   * stays a single draw call and never touches the CPU again.
   */
  const tintGeometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(
      path.curve,
      TINT_SEGMENTS,
      sleeveRadius,
      TINT_RADIAL,
      false,
    )
    const ringCount = TINT_SEGMENTS + 1
    const perRing = TINT_RADIAL + 1
    const colours = new Float32Array(ringCount * perRing * 4)
    const c = new THREE.Color(WISP_COLOR)
    const share = 1 / elements.length
    for (let i = 0; i < ringCount; i++) {
      const u = i / TINT_SEGMENTS
      let removed = 0
      for (const e of elements) removed += smoothstep(e.enter, e.exit, u) * share
      const alpha = TINT_ALPHA * (1 - removed)
      for (let j = 0; j < perRing; j++) {
        const k = (i * perRing + j) * 4
        colours[k] = c.r
        colours[k + 1] = c.g
        colours[k + 2] = c.b
        colours[k + 3] = alpha
      }
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colours, 4))
    return geo
  }, [path, sleeveRadius, elements])

  useEffect(
    () => () => {
      wispGeometry.dispose()
      tintGeometry.dispose()
    },
    [wispGeometry, tintGeometry],
  )

  /**
   * How flushed each block is. Sized off the elements rather than held in a
   * ref, so nothing is written during render.
   */
  const soak = useMemo(() => new Float32Array(elements.length), [elements])

  const wisps = useMemo(
    () =>
      Array.from({ length: WISP_COUNT }, (_, i) => {
      // dealt round-robin, so every block in the series is visibly working
        const at = i % elements.length
        return {
          at,
          phase: (i / WISP_COUNT) * elements[at].spawnLimit,
          angle: rand(0, Math.PI * 2),
          swirl: (Math.random() < 0.5 ? -1 : 1) * rand(SWIRL_MIN, SWIRL_MAX),
          reach: Math.sqrt(Math.random()),
          size: rand(0.6, 1.35),
          absorbing: false,
        }
      }),
    [elements],
  )

  const scratch = useMemo(
    () => ({ dummy: new THREE.Object3D(), point: new THREE.Vector3() }),
    [],
  )

  useLayoutEffect(() => {
    wispMesh.current?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }, [])

  useFrame((state, delta) => {
    const m = wispMesh.current
    if (!m) return
    const dt = Math.min(delta, MAX_DELTA)
    const { dummy, point } = scratch
    const time = state.clock.elapsedTime

    for (let i = 0; i < soak.length; i++) {
      soak[i] = Math.max(0, soak[i] - dt * SOAK_DECAY)
    }

    wisps.forEach((w, i) => {
      const el = elements[w.at]
      w.phase += dt * FLOW_SPEED
      if (w.phase >= 1) w.phase -= 1
      // phase is a fraction of the trip; the element is a distance along it
      const u = path.distanceAt(w.phase)

      if (u >= el.exit) {
        // fully taken up by the block — back out to the source
        w.phase = 0
        w.angle = rand(0, Math.PI * 2)
        w.reach = Math.sqrt(Math.random())
        w.absorbing = false
      }

      path.curve.getPointAt(clamp01(path.distanceAt(w.phase)), point)
      const turn = w.angle + time * w.swirl

      if (u < el.enter) {
        // curling along with the water, filling the bore it is inside
        const off = w.reach * Math.min(streamRadius * 1.1, bore * 0.8)
        dummy.position.set(point.x + Math.cos(turn) * off, point.y, point.z + Math.sin(turn) * off)
        dummy.scale.setScalar(w.size)
      } else {
        // inside the block: drawn out of the flow and into the wall
        const p = clamp01((u - el.enter) / (el.exit - el.enter))
        if (!w.absorbing) {
          w.absorbing = true
          soak[w.at] = Math.min(1, soak[w.at] + SOAK_PER_WISP)
        }
        // stop short of the bore so the wisp body does not poke through it
        const pull = radius * 0.85 * (1 - (1 - p) * (1 - p))
        dummy.position.set(
          // hold the element axis, not the curve, so the pull reads as radial
          el.axis.x + Math.cos(turn) * pull,
          point.y,
          el.axis.z + Math.sin(turn) * pull,
        )
        dummy.scale.setScalar(w.size * (1 - p * p))
      }

      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })

    m.instanceMatrix.needsUpdate = true
    elements.forEach((_, i) => {
      const mat = soakMats.current[i]
      if (mat) mat.emissiveIntensity = 0.15 + 0.85 * soak[i]
    })
  })

  return (
    <group>
      {/* chlorine in the water, stepping down across each block in the series */}
      <mesh geometry={tintGeometry}>
        <meshBasicMaterial
          vertexColors
          transparent
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* each block flushing as it soaks them up */}
      {elements.map((el, i) => (
        <mesh key={`soak-${i}`} position={[el.axis.x, el.midY, el.axis.z]}>
          <cylinderGeometry args={[radius * 0.94, radius * 0.94, el.height * 0.96, 24, 1, true]} />
          <meshStandardMaterial
            ref={(node) => {
              soakMats.current[i] = node
            }}
            color={0x3a3f45}
            emissive={WISP_COLOR}
            emissiveIntensity={0.15}
            roughness={0.9}
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}

      <instancedMesh
        ref={wispMesh}
        args={[wispGeometry, undefined, WISP_COUNT]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          color={WISP_COLOR}
          transparent
          opacity={0.6}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}
