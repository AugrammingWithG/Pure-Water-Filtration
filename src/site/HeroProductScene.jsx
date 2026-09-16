import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Precompile from '../three/Precompile'
import QualityGovernor from '../three/QualityGovernor'
import SceneEnvironment from '../three/SceneEnvironment'
import WholeHouseUnit from '../three/products/WholeHouseUnit'
import { useQuality } from '../three/quality'
import { WHOLE_UNIT } from '../three/layout'
import { SYSTEMS } from '../three/systems'
import stuccoDiffUrl from '../assets/textures/stucco/white-stucco-diff.webp'
import stuccoNorUrl from '../assets/textures/stucco/white-stucco-nor.webp'
import stuccoArmUrl from '../assets/textures/stucco/white-stucco-arm.webp'
import floorDiffUrl from '../assets/textures/floor/brown-floor-tiles-diff.webp'
import floorNorUrl from '../assets/textures/floor/brown-floor-tiles-nor.webp'
import floorArmUrl from '../assets/textures/floor/brown-floor-tiles-arm.webp'

/**
 * Product-focused hero scene: the whole-house unit alone on a clean interior
 * wall, framed cinematically. No orbit, no diorama — the surrounding room is
 * just an opaque wall and floor, so the page's own gradient reads as light
 * spilling in from off-camera.
 *
 * The unit lives in world coordinates set by three/layout.js (its center is
 * at WHOLE_UNIT.center); we wrap it in a group that moves that centre to the
 * origin so the camera and the room can be authored around (0, 1, 0) instead.
 */

/** Offset that moves WHOLE_UNIT.center → origin. */
const CENTER_OFFSET = [-WHOLE_UNIT.center.x, 0, -WHOLE_UNIT.center.z]

/** The unit's front face after the offset — used to place the wall behind it. */
const FRONT_Z = WHOLE_UNIT.depth / 2
const BACK_Z = -WHOLE_UNIT.depth / 2

/** Where the copper riser lands relative to the moved unit. */
const RISER_LOCAL_X = WHOLE_UNIT.riserX - WHOLE_UNIT.center.x

/** Interior wall a little behind the cabinet back face. */
const WALL_Z = BACK_Z - 0.02

/**
 * Room colours. Both multiply a diffuse map. The stucco's is a near-flat
 * off-white (sRGB ~237), so a warm grey here lands the rendered wall on the
 * warm, slightly shaded render stucco of the brand imagery rather than
 * gallery white. The floor's is a sandy terracotta (sRGB ~190,175,155), a
 * good deal darker than the wall already, so its tint only pulls it a
 * little cooler and greyer — the tiles should read as shaded, and sit under
 * the cabinet rather than compete with it (see Floor).
 */
const WALL_COLOR = 0xe3e1de
const FLOOR_COLOR = 0xd8d9dc

/**
 * The wall plane, and the stucco tile laid across it. The maps are baked
 * from Poly Haven's white_stucco by scripts/bake-pbr-set.mjs; the source
 * set covers 2 m × 2 m, so the repeat is simply the wall size over the tile.
 *
 * The diffuse map is almost uniform — the material is read entirely through
 * its normal map, so NORMAL_SCALE is the knob for how coarse the trowelling
 * looks under the raking key. 1 is the scan as measured; the 4k → 1k box
 * filter softened it a little and the brand renders want it a little
 * stronger than life, hence the push.
 */
const WALL_SIZE = [14, 6]
const STUCCO_TILE = 2
const STUCCO_NORMAL_SCALE = 1.6

/**
 * The floor plane and its tile, the same way: Poly Haven's brown_floor_tiles
 * through the same bake, a 1.7 m × 1.7 m scan of seven-by-seven ~24 cm
 * ceramic tiles with grout lines. The normal map is mostly the grout
 * channels and a little glaze wear; 1 keeps the grout as a real step under
 * the raking key without turning the tile faces into orange peel, and the
 * reflector uses the same map to break the reflection slightly along the
 * grout (see Floor).
 */
const FLOOR_SIZE = [14, 10]
const FLOOR_TILE = 1.7
const FLOOR_NORMAL_SCALE = 1
/**
 * The light is late-afternoon sun through a glass wall off-camera left: a
 * warm, fairly low key raking across the stucco from front-left, a cool sky
 * fill from the same side (the glass), and a faint cool rim from behind so
 * the cabinet's right edge separates from the wall. Warm key, cool shade is
 * the whole look — everything in shadow leans blue, everything in sun leans
 * gold.
 */
const KEY_COLOR = 0xfff3e2
const SKY_COLOR = 0xc9dbf2
const RIM_COLOR = 0xbcd7ff
const FILL_COLOR = 0xd2e0f4
const GROUND_BOUNCE = 0xb3aa9c

/**
 * Where the camera sits and looks, for wide and stacked layouts. Both point
 * a little left of the unit so the unit itself falls on the right of frame
 * and the copy overlay has clean wall to sit on. Stacked (phone) recentres
 * and pulls back, and drops the fov a touch — the aspect narrows and the
 * off-centre framing no longer buys anything.
 */
const CAMERA = {
  wide: {
    position: [0.85, 1.55, 2.35],
    target: [-0.35, 1.15, 0],
    fov: 30,
  },
  stacked: {
    position: [0.50, 2.7, 2.75],
    target: [0, 1.15, 0],
    fov: 56,
  },
}

/**
 * How far the pointer can pull the camera off its base pose, in world units,
 * at the edge of the hero. Kept smaller than the breathing so it reads as
 * the render leaning with you, not as orbit. The target shifts with it by a
 * fraction so the unit stays anchored while the wall slides — that's what
 * sells the parallax.
 */
const POINTER_PARALLAX = { x: 0.12, y: 0.06, targetFollow: 0.35 }

/**
 * Places the camera each frame and applies a slow cinematic breathing —
 * ±0.06 units of parallax across roughly twelve seconds — so the render
 * feels alive without inviting interaction. The pose comes from `stacked`,
 * which changes on breakpoint.
 *
 * On hover-capable devices the pointer adds a gentle lean on top: the
 * listener sits on the whole hero section rather than the canvas, because
 * the copy overlay covers most of it and would otherwise swallow the move
 * events. The offset eases toward the pointer and back to centre on leave.
 */
function CinematicCamera({ stacked }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const config = stacked ? CAMERA.stacked : CAMERA.wide
  const baseRef = useRef(new THREE.Vector3())
  const targetRef = useRef(new THREE.Vector3())
  /** Pointer position in the hero, -1..1 on each axis; 0,0 when away. */
  const pointerRef = useRef({ x: 0, y: 0 })
  /** The eased offset actually applied, so the lean never snaps. */
  const leanRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
      return undefined
    }
    const host = gl.domElement.closest('.hero') ?? gl.domElement
    const onMove = (event) => {
      const rect = host.getBoundingClientRect()
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerRef.current.y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    }
    const onLeave = () => {
      pointerRef.current.x = 0
      pointerRef.current.y = 0
    }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [gl])

  useFrame(({ clock }, delta) => {
    baseRef.current.set(...config.position)
    targetRef.current.set(...config.target)
    const t = clock.getElapsedTime()
    const drift = Math.sin(t * 0.5) * 0.06
    const lift = Math.sin(t * 0.35 + 1.2) * 0.03

    const lean = leanRef.current
    const ease = 1 - Math.exp(-delta * 4)
    lean.x += (pointerRef.current.x * POINTER_PARALLAX.x - lean.x) * ease
    lean.y += (-pointerRef.current.y * POINTER_PARALLAX.y - lean.y) * ease

    camera.position.set(
      baseRef.current.x + drift + lean.x,
      baseRef.current.y + lift + lean.y,
      baseRef.current.z,
    )
    if (camera.fov !== config.fov) {
      camera.fov = config.fov
      camera.updateProjectionMatrix()
    }
    targetRef.current.x += lean.x * POINTER_PARALLAX.targetFollow
    targetRef.current.y += lean.y * POINTER_PARALLAX.targetFollow
    camera.lookAt(targetRef.current)
  })

  return null
}

function StudioLighting() {
  const { shadowMap } = useQuality()
  return (
    <>
      <hemisphereLight args={[SKY_COLOR, GROUND_BOUNCE, 0.5]} />
      {/*
        Warm key from front-left, lower than a studio key so shadows fall
        right and a little down — the copper riser's shadow lands beside it
        on the wall, the cabinet's on the wall and the floor. Frustum
        tightened around the visible product so shadow resolution isn't wasted
        on empty room; radius softens the edge the way a big window would.
      */}
      <directionalLight
        color={KEY_COLOR}
        intensity={4.4}
        position={[-3.2, 3.4, 2.6]}
        castShadow
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-intensity={0.92}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-2}
        shadow-camera-near={1}
        shadow-camera-far={10}
      />
      {/* Skylight through the glass wall at left, lifting the shaded faces cool. */}
      <directionalLight color={FILL_COLOR} intensity={0.85} position={[-3, 1.6, 2.4]} />
      {/* Cool rim from behind-right to separate the cabinet from the wall. */}
      <directionalLight color={RIM_COLOR} intensity={0.45} position={[2.2, 2.4, -1.6]} />
    </>
  )
}

/**
 * A baked diff / nor / arm set, tiled across a plane of `size` metres at
 * `tile` metres per repeat. Poly Haven's ARM packing is three's channel
 * layout — aoMap reads R, roughnessMap reads G, metalnessMap reads B — so
 * the one texture is handed to both ao and roughness slots. Clones, as in
 * Ground and House: useTexture caches by url and the wrap and repeat
 * settings shouldn't leak to any other user of the same file. Anisotropy
 * because both surfaces are seen at a glancing angle — the wall from the
 * camera's offset, the floor from its height — and without it the grain
 * smears into streaks toward the far edge.
 */
function usePbrMaps(urls, size, tile) {
  const gl = useThree((s) => s.gl)
  const [diff, nor, arm] = useTexture(urls)
  return useMemo(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    const configure = (base, colorSpace) => {
      const map = base.clone()
      map.wrapS = THREE.RepeatWrapping
      map.wrapT = THREE.RepeatWrapping
      map.repeat.set(size[0] / tile, size[1] / tile)
      map.colorSpace = colorSpace
      map.anisotropy = anisotropy
      map.needsUpdate = true
      return map
    }
    return {
      map: configure(diff, THREE.SRGBColorSpace),
      normalMap: configure(nor, THREE.NoColorSpace),
      armMap: configure(arm, THREE.NoColorSpace),
    }
  }, [gl, diff, nor, arm, size, tile])
}

const STUCCO_URLS = [stuccoDiffUrl, stuccoNorUrl, stuccoArmUrl]
const FLOOR_URLS = [floorDiffUrl, floorNorUrl, floorArmUrl]

function useStuccoMaps() {
  return usePbrMaps(STUCCO_URLS, WALL_SIZE, STUCCO_TILE)
}

function useFloorMaps() {
  return usePbrMaps(FLOOR_URLS, FLOOR_SIZE, FLOOR_TILE)
}

/**
 * Maps a world (x, y) on the wall plane to the shade canvas. The plane is
 * WALL_SIZE centred at (0, WALL_Y), so its uv origin sits at the bottom-left
 * corner; canvas rows run the other way.
 */
const WALL_Y = 1.6
const SHADE_PX = [1024, 512]
const PX_PER_M = SHADE_PX[0] / WALL_SIZE[0]
function toCanvas(x, y) {
  return [
    ((x + WALL_SIZE[0] / 2) / WALL_SIZE[0]) * SHADE_PX[0],
    (1 - (y - WALL_Y + WALL_SIZE[1] / 2) / WALL_SIZE[1]) * SHADE_PX[1],
  ]
}

/**
 * The sun on the wall, as a window throws it: the wall sits in cool shade
 * and the light arrives as a shape — one big pane of sun behind the cabinet
 * and a sliver of the next pane at the top left — with the dappled shadow
 * of foliage outside the glass inside the patch on the right. A shadow map
 * can't draw any of this (nothing in the scene is the window), so it is
 * painted once into a canvas and multiplied over the wall: white leaves the
 * lit wall alone, the shade pulls it down and towards the sky's blue.
 * Multiplying rather than blending keeps the stucco grain and the cast
 * shadows underneath it.
 *
 * Coordinates are world metres on the wall. The panes are drawn as slightly
 * skewed quads — a rectangle of glass projected by a low sun off to the
 * left — and feathered with a canvas blur so the edge has the width of the
 * sun disc's penumbra, not a razor. Browsers without canvas filters (none
 * current) simply draw them sharp.
 */
const SHADE_TOP = 'rgba(130,140,160,1)'
const SHADE_BOTTOM = 'rgba(150,158,174,1)'
const PANE_EDGE_M = 0.12
const PANES = [
  /* Main pane: behind the cabinet, past the riser, down to the floor. */
  { quad: [[-0.76, 1.72], [1.26, 1.57], [1.36, 0.15], [-0.68, 0.28]], brightness: 1 },
  /* Next pane over, cut by the top of frame, behind the copy. */
  { quad: [[-2.9, 2.2], [-1.05, 2.1], [-0.98, 1.55], [-2.85, 1.62]], brightness: 0.82 },
]

function useShadeTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = SHADE_PX[0]
    canvas.height = SHADE_PX[1]
    const ctx = canvas.getContext('2d')

    /* Base shade: cool grey, a touch darker toward the ceiling. */
    {
      const shade = ctx.createLinearGradient(0, 0, 0, canvas.height)
      shade.addColorStop(0, SHADE_TOP)
      shade.addColorStop(1, SHADE_BOTTOM)
      ctx.fillStyle = shade
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    /* The panes of sun, feathered. */
    ctx.save()
    if ('filter' in ctx) ctx.filter = `blur(${Math.round(PANE_EDGE_M * PX_PER_M)}px)`
    for (const { quad, brightness } of PANES) {
      ctx.beginPath()
      quad.forEach(([x, y], i) => {
        const [cx, cy] = toCanvas(x, y)
        if (i === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
      })
      ctx.closePath()
      ctx.fillStyle = `rgba(255,255,255,${brightness})`
      ctx.fill()
    }
    ctx.restore()

    /*
      Foliage dapple inside the main pane, on the right: soft leaf-sized
      blobs, each a radial gradient so the edges are already the penumbra a
      metre or two of sun-to-wall travel would give them. Seeded so the wall
      is the same on every visit.
    */
    {
      let seed = 7
      const rand = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
      }
      ctx.save()
      ctx.globalCompositeOperation = 'multiply'
      for (let i = 0; i < 70; i++) {
        const x = 0.7 + rand() * 0.9 + rand() * 0.6
        const y = 0.6 + rand() * 1.0 + rand() * 0.5
        const r = (0.12 + rand() * 0.22) * PX_PER_M
        const [cx, cy] = toCanvas(x, y)
        const depth = 0.3 + rand() * 0.25
        const leaf = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        leaf.addColorStop(0, `rgba(158,170,190,${depth})`)
        leaf.addColorStop(0.55, `rgba(158,170,190,${depth * 0.7})`)
        leaf.addColorStop(1, 'rgba(158,170,190,0)')
        ctx.fillStyle = leaf
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(rand() * Math.PI)
        ctx.scale(1, 0.45 + rand() * 0.5)
        ctx.translate(-cx, -cy)
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
        ctx.restore()
      }
      ctx.restore()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

function Wall() {
  const { map, normalMap, armMap } = useStuccoMaps()
  const shade = useShadeTexture()
  return (
    <>
      <mesh position={[0, WALL_Y, WALL_Z]} receiveShadow>
        <planeGeometry args={WALL_SIZE} />
        <meshStandardMaterial
          color={WALL_COLOR}
          map={map}
          normalMap={normalMap}
          normalScale={[STUCCO_NORMAL_SCALE, STUCCO_NORMAL_SCALE]}
          aoMap={armMap}
          roughnessMap={armMap}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/*
        The shade decal, a hair in front of the wall. Transparent so it draws
        after the opaque pass (a multiply over nothing is nothing), no depth
        write so the cabinet and pipes in front of it are untouched.
      */}
      <mesh position={[0, WALL_Y, WALL_Z + 0.004]}>
        <planeGeometry args={WALL_SIZE} />
        <meshBasicMaterial
          map={shade}
          blending={THREE.MultiplyBlending}
          premultipliedAlpha
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}

/**
 * Glazed ceramic tile. On the full tier the floor is a blurred planar
 * reflection — the cabinet and the sunlit wall mirrored softly beneath it,
 * which is most of what makes the brand renders read as a real room. That
 * costs a second render of the scene each frame, so the lower tiers (phones,
 * and anything the governor has stepped down) get a plain glossy material
 * that only reflects the environment map.
 *
 * Both take the same tile maps as the wall takes its stucco. The reflector
 * extends MeshStandardMaterial, so map / normalMap / aoMap go through
 * three's own lighting; it also reads roughnessMap's G itself to decide how
 * much of the blurred reflection to mix in, and offsets the reflection
 * lookup by the normal map, so the mirror image breaks a little along the
 * grout. The scan's roughness averages ~0.83 (unglazed terracotta), so
 * `roughness` here is the multiplier that turns it into a glaze: 0.55 lands
 * the effective value near the 0.45 the untextured floor used.
 */
function Floor() {
  const { name } = useQuality()
  const { map, normalMap, armMap } = useFloorMaps()
  const normalScale = [FLOOR_NORMAL_SCALE, FLOOR_NORMAL_SCALE]
  return (
    <mesh position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={FLOOR_SIZE} />
      {name === 'full' ? (
        <MeshReflectorMaterial
          color={FLOOR_COLOR}
          map={map}
          normalMap={normalMap}
          normalScale={normalScale}
          aoMap={armMap}
          roughnessMap={armMap}
          roughness={0.55}
          metalness={0.05}
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={0.45}
          mixContrast={1}
          mirror={0}
          depthScale={1.1}
          minDepthThreshold={0.45}
          maxDepthThreshold={1.5}
        />
      ) : (
        <meshStandardMaterial
          color={FLOOR_COLOR}
          map={map}
          normalMap={normalMap}
          normalScale={normalScale}
          aoMap={armMap}
          roughnessMap={armMap}
          roughness={0.5}
          metalness={0.05}
        />
      )}
    </mesh>
  )
}

/**
 * The hero product scene. Renders the whole-house unit, without its street
 * meter, on a clean interior wall. Everything is fixed: no orbit rig, no
 * picking, no walkthrough — just the object, lit.
 */
export default function HeroProductScene({ stacked, onReady }) {
  const accent = SYSTEMS.whole.accentColor
  return (
    <>
      <QualityGovernor />
      <SceneEnvironment intensity={0.4} />
      <StudioLighting />
      <Wall />
      <Floor />

      <group position={CENTER_OFFSET}>
        <WholeHouseUnit
          active={false}
          revealed={false}
          selectedStage={null}
          accent={accent}
          onPick={() => {}}
          showMeter={false}
        />
        {/*
          The riser is drawn by WholeHouseUnit down to y=-0.05, below where the
          street pit would have covered it. A skinny plinth at the riser foot
          hides the cut end and reads as a floor bracket where the pipe enters
          the slab.
        */}
        <mesh position={[RISER_LOCAL_X, 0.02, WHOLE_UNIT.center.z]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.04, 0.16]} />
          <meshStandardMaterial color={0x8e949a} roughness={0.85} metalness={0.05} />
        </mesh>
      </group>

      <CinematicCamera stacked={stacked} />
      <Precompile onReady={onReady} />
    </>
  )
}
