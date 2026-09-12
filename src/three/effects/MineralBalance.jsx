import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp01, getDotTexture, lerp, MAX_DELTA, smoothstep } from './common'

/**
 * Stage 3 — balancing, not removal.
 *
 * The copy says this stage *balances* minerals rather than stripping them, so
 * nothing may disappear: whatever goes in has to come out the far side, only
 * changed. One deforming blob carries that. It arrives jagged, chalky and
 * opaque, and leaves smooth, cool and glassy — the same object throughout.
 *
 * Deliberately not a particle system. Two blobs is the whole budget here, run
 * half a cycle apart so one is nearly always on screen, each with a few
 * billboard flecks for density and a halo that blooms at the moment the
 * change happens. That is three draw calls against the several hundred
 * bubbles it has to hold its own beside.
 *
 * The blob is a sphere whose vertices are pushed out along their own radius by
 * a fixed per-vertex amount; scaling that amount from 1 to 0 melts the jagged
 * form back into a clean one. The amount is derived from vertex position
 * rather than index, so the duplicated seam and pole vertices agree and the
 * surface never tears open as it deforms.
 */

/**
 * A grain carried in the water, not a boulder filling the tube. At 0.02 the
 * jagged form is about a third of the cartridge bore and three or four times
 * a bubble, which is enough to watch it change shape without it reading as a
 * foreign object wedged in the cartridge.
 */
const RADIUS = 0.02
const JAGGEDNESS = 0.38
const FLECK_COUNT = 5

/**
 * Lead-in before the element, as a ceiling. The real lead is clamped to the
 * gap between the carbon element and this one, because on the whole-house and
 * rainwater units that gap is under 0.02 of the route — a fixed 0.045 spawned
 * the grain *inside the carbon cartridge* and walked it through.
 */
const LEAD_MAX = 0.045
/** Run-out past the element, over which the smoothed grain dissolves. */
const TRAIL = 0.03
/**
 * Seconds for one pass. Longer than the water takes over the same stretch, so
 * the morph is legible — but the blob rides the path's pace profile rather
 * than a constant rate, so it slows through the element exactly as the stream
 * does instead of overtaking it there.
 */
const TRAVEL_SECONDS = 2.2
const GAP_SECONDS = 0.4

const ROUGH_COLOR = new THREE.Color(0xd6cbb2)
const SMOOTH_COLOR = new THREE.Color(0xc6e6f6)
/**
 * Kept near zero. Metalness on a small pale object reads as chrome, which is
 * what made this look like a silver blob rather than mineral scale; the
 * rough-to-glassy change is carried by roughness alone.
 */
const METALNESS_SMOOTH = 0.06

const rand = (a, b) => a + Math.random() * (b - a)

function Crystal({ path, enter, exit, lead, offset }) {
  const group = useRef()
  const blob = useRef()
  const blobMat = useRef()
  const halo = useRef()
  const haloMat = useRef()
  const fleckMats = useRef([])
  const clock = useRef(offset * (TRAVEL_SECONDS + GAP_SECONDS))
  const lastJag = useRef(-1)

  const geometry = useMemo(() => new THREE.SphereGeometry(RADIUS, 20, 14), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const base = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  )

  const amplitude = useMemo(() => {
    const count = base.length / 3
    const amp = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const ux = base[i * 3] / RADIUS
      const uy = base[i * 3 + 1] / RADIUS
      const uz = base[i * 3 + 2] / RADIUS
      amp[i] =
        JAGGEDNESS *
        Math.sin(ux * 6.1 + 1.3) *
        Math.cos(uy * 7.7 + 0.4) *
        Math.sin(uz * 5.3 + 2.1)
    }
    return amp
  }, [base])

  const flecks = useMemo(
    () =>
      Array.from({ length: FLECK_COUNT }, () => ({
        offset: [rand(-0.028, 0.028), rand(-0.028, 0.028), rand(-0.028, 0.028)],
        size: rand(0.009, 0.016),
      })),
    [],
  )

  const dot = useMemo(() => getDotTexture(), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])

  // Worked in phase, not distance, so the pace profile applies.
  const phaseStart = path.phaseAt(Math.max(0, enter - lead))
  const phaseEnd = path.phaseAt(Math.min(1, exit + TRAIL))

  useFrame((_, delta) => {
    const dt = Math.min(delta, MAX_DELTA)
    clock.current = (clock.current + dt) % (TRAVEL_SECONDS + GAP_SECONDS)

    const g = group.current
    if (!g) return

    if (clock.current > TRAVEL_SECONDS) {
      g.visible = false
      return
    }
    g.visible = true

    const u = clock.current / TRAVEL_SECONDS
    const t = path.distanceAt(lerp(phaseStart, phaseEnd, u))
    path.curve.getPointAt(clamp01(t), scratch)
    g.position.copy(scratch)

    // jagged on the way in, smooth once the stage has done its work
    const jag = 1 - smoothstep(enter, exit, t)
    /**
     * The grain dissolves as it finishes smoothing: solid while it is still
     * changing shape, gone shortly after it stops. Balancing is done at that
     * point, and a smooth sphere sailing on down the pipe was reading as an
     * object in the water rather than as the change itself.
     */
    const dissolve = 1 - smoothstep(exit - (exit - enter) * 0.2, exit + TRAIL * 0.8, t)
    const fade = smoothstep(0, 0.1, u) * dissolve

    if (blob.current) blob.current.rotation.y += dt * 0.7

    if (Math.abs(jag - lastJag.current) > 0.002) {
      lastJag.current = jag
      const pos = geometry.attributes.position.array
      for (let i = 0; i < amplitude.length; i++) {
        const s = 1 + jag * amplitude[i]
        pos[i * 3] = base[i * 3] * s
        pos[i * 3 + 1] = base[i * 3 + 1] * s
        pos[i * 3 + 2] = base[i * 3 + 2] * s
      }
      geometry.attributes.position.needsUpdate = true
      geometry.computeVertexNormals()
    }

    const m = blobMat.current
    if (m) {
      m.color.copy(SMOOTH_COLOR).lerp(ROUGH_COLOR, jag)
      // chalky and rough going in, calm and glassy coming out
      m.roughness = lerp(0.06, 0.95, jag)
      m.metalness = lerp(METALNESS_SMOOTH, 0, jag)
      // suspended in the water rather than sitting on top of it
      m.opacity = fade * lerp(0.5, 0.82, jag)
    }

    // a bloom at the moment the change actually happens
    const change = clamp01(1 - Math.abs(jag - 0.5) * 4)
    if (halo.current) {
      // hugs the blob rather than swallowing the cartridge it is inside: the
      // blob is 2*RADIUS across and the cartridge bore is roughly twice that
      const size = RADIUS * (1.2 + 0.9 * (1 - jag))
      halo.current.scale.set(size, size, size)
    }
    if (haloMat.current) haloMat.current.opacity = fade * change * 0.32

    for (const fm of fleckMats.current) {
      if (fm) fm.opacity = fade * lerp(0.24, 0.62, jag)
    }
  })

  return (
    <group ref={group}>
      <mesh ref={blob} geometry={geometry}>
        <meshStandardMaterial
          ref={blobMat}
          color={ROUGH_COLOR}
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* explicit scale: a bare sprite is one world unit until useFrame runs */}
      <sprite ref={halo} scale={[RADIUS, RADIUS, RADIUS]}>
        <spriteMaterial
          ref={haloMat}
          map={dot}
          color={0xdff0ff}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {flecks.map((f, i) => (
        <sprite key={`fleck-${i}`} position={f.offset} scale={[f.size, f.size, f.size]}>
          <spriteMaterial
            ref={(el) => {
              fleckMats.current[i] = el
            }}
            map={dot}
            color={0xe8f2f8}
            transparent
            opacity={0.5}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  )
}

export default function MineralBalance({ path }) {
  const { enter, exit, lead } = useMemo(() => {
    const stage = path.stageOrder[2]
    const element = path.mediaSpans[stage] ?? path.spans[stage]
    // never start inside the previous stage
    const previous = path.mediaSpans[path.stageOrder[1]]
    const gap = previous ? element[0] - previous[1] : LEAD_MAX
    return {
      enter: element[0],
      exit: element[1],
      lead: Math.min(LEAD_MAX, Math.max(0, gap * 0.75)),
    }
  }, [path])

  return (
    <>
      <Crystal path={path} enter={enter} exit={exit} lead={lead} offset={0} />
      <Crystal path={path} enter={enter} exit={exit} lead={lead} offset={0.5} />
    </>
  )
}
