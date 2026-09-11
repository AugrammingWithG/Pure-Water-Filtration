import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import woodCladdingMapUrl from '../assets/textures/wood/house-cladding.jpg'
import { CHIMNEY, DECK, FRONT_SOLID_X1, HOUSE, STEPPING_STONES } from './layout'
import FadeGroup from './parts/FadeGroup'

/** Base colours only — the timber surfaces are the ones slated for textures later. */
const CLADDING = { color: 0x2c3136, roughness: 0.85, metalness: 0.05 }
const ROOF = { color: 0xbcc1c6, roughness: 0.55, metalness: 0.25 }
const SEAM = { color: 0xa7adb3, roughness: 0.5, metalness: 0.3 }
const OAK = { color: 0xd6b48a, roughness: 0.7, metalness: 0 }
const DECK_TIMBER = { color: 0xdcbf95, roughness: 0.75, metalness: 0 }
const FLOOR_TIMBER = { color: 0xd9c4a2, roughness: 0.8, metalness: 0 }
const LINING = { color: 0xf2f1ec, roughness: 0.9, metalness: 0 }
const FLUE = { color: 0xe4e4e0, roughness: 0.4, metalness: 0.3 }
const STONE = { color: 0xb6bbc0, roughness: 0.9, metalness: 0 }
const GLASS = {
  color: 0xcfe6f2,
  roughness: 0.08,
  metalness: 0,
  envMapIntensity: 0.4,
  transparent: true,
  opacity: 0.2,
}

const { w: W, d: D, wallH, ridgeH, overhang: OV, wallT, floorY } = HOUSE
const RISE = ridgeH - wallH
const SLOPE = Math.atan2(RISE, D / 2)
const SLAB_LEN = (D / 2 + OV) / Math.cos(SLOPE)
const SLAB_T = 0.08
const SEAM_PITCH = 0.42
const FRONT_Z = D / 2 - wallT / 2
const HEADER_H = 0.22
/** Posts between the glazed units, and the short wall under the window. */
const POSTS = [0.325, 2.425]
const POST_W = 0.15
const SILL = { x0: 2.5, x1: 3.08, h: 0.95 }

/**
 * Vertical board cladding, built as geometry rather than a texture. Each
 * board is a slab standing `proud` of the wall face with a 45° `chamfer`
 * round its front edge, so where two boards meet there's a V-groove that
 * catches the light. `pitch` is the board spacing — lower it for more, thinner
 * boards, keeping `groove` well under it so each board keeps a flat face.
 */
const BOARD = { pitch: 0.08, groove: 0.014, chamfer: 0.006, proud: 0.018 }
/** A board narrower than this would lose its whole face to the chamfer. */
const MIN_BOARD = BOARD.groove * 2
const BOARD_EXTRUDE = {
  depth: BOARD.proud - BOARD.chamfer,
  bevelEnabled: true,
  bevelThickness: BOARD.chamfer,
  bevelSize: BOARD.chamfer,
  // pull the front face in by half a groove; the bevel then slopes back out
  // to the board's full width, and the rear bevel sinks into the wall
  bevelOffset: -BOARD.groove / 2,
  bevelSegments: 1,
}

/** Height of the gable at `z`, measured from the wall's centre plane. */
const gableTop = (z) => wallH + RISE * (1 - Math.abs(z) / (D / 2))

/**
 * Panels for each face, in that face's own plane: x along the face, y up.
 * The gable runs `proud` past both corners so it wraps the ends of the
 * boards on the back and front walls.
 */
const BACK_PANELS = [{ x0: -W / 2, x1: W / 2, y1: wallH }]
const GABLE_PANELS = [
  { x0: -D / 2 - BOARD.proud, x1: D / 2 + BOARD.proud, top: gableTop, breaks: [0] },
]
const FRONT_PANELS = [
  { x0: -W / 2, x1: FRONT_SOLID_X1, y1: wallH },
  { x0: FRONT_SOLID_X1, x1: W / 2, y0: wallH - HEADER_H, y1: wallH },
  ...POSTS.map((x) => ({ x0: x - POST_W / 2, x1: x + POST_W / 2, y1: wallH - HEADER_H })),
  { x0: SILL.x0, x1: SILL.x1, y1: SILL.h },
]

/**
 * Board outlines for a run of panels that share a face. Boards sit on a
 * common grid (`origin` is a board edge) so the grooves line up across the
 * pieces of one wall — the header over the glazing continues the lines of
 * the solid section beside it. A panel is either a rectangle (`y1`) or has a
 * `top(x)` roof line, with `breaks` listing the x's where that line kinks
 * (the ridge) so a board spanning one gets a vertex there.
 */
function boardShapes(panels, origin) {
  const shapes = []
  for (const { x0, x1, y0 = 0, y1, top, breaks = [] } of panels) {
    const topAt = top ?? (() => y1)
    const edges = [x0]
    const first = Math.ceil((x0 - origin) / BOARD.pitch - 1e-6)
    for (let x = origin + first * BOARD.pitch; x < x1 - 1e-6; x += BOARD.pitch) {
      if (x > x0 + 1e-6) edges.push(x)
    }
    edges.push(x1)
    // a sliver at either end reads as a mistake; fold it into its neighbour
    if (edges.length > 2 && edges[1] - edges[0] < MIN_BOARD) edges.splice(1, 1)
    if (edges.length > 2 && edges.at(-1) - edges.at(-2) < MIN_BOARD) edges.splice(-2, 1)

    const kinks = [...breaks].sort((a, b) => b - a) // walked right to left along the top
    for (let i = 0; i < edges.length - 1; i++) {
      const bx0 = edges[i]
      const bx1 = edges[i + 1]
      const s = new THREE.Shape()
      s.moveTo(bx0, y0)
      s.lineTo(bx1, y0)
      s.lineTo(bx1, topAt(bx1))
      for (const k of kinks) if (k > bx0 && k < bx1) s.lineTo(k, topAt(k))
      s.lineTo(bx0, topAt(bx0))
      s.closePath()
      shapes.push(s)
    }
  }
  return shapes
}

/**
 * One face's worth of cladding as a single mesh. Place it on the wall's
 * outer surface with local +z pointing out of the wall.
 */
function Boards({ panels, origin = 0, ...props }) {
  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(boardShapes(panels, origin), BOARD_EXTRUDE),
    [panels, origin],
  )
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      <meshStandardMaterial {...CLADDING} />
    </mesh>
  )
}

/** Gable end: a pentagon in the y/z plane, one wall-thickness deep. */
function useGableGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-D / 2, 0)
    shape.lineTo(D / 2, 0)
    shape.lineTo(D / 2, wallH)
    shape.lineTo(0, ridgeH)
    shape.lineTo(-D / 2, wallH)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: wallT, bevelEnabled: false })
    // profile was drawn with x standing in for world z; swing it round
    geo.rotateY(Math.PI / 2)
    geo.translate(-wallT / 2, 0, 0)
    return geo
  }, [])
}

/** A glazed opening: oak frame, optional centre mullion, a pane of glass. */
function Glazing({ x0, x1, y0, y1, mullion = false, frameMap }) {
  const fw = 0.06 // frame width
  const fd = 0.1 // frame depth
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const w = x1 - x0
  const h = y1 - y0
  return (
    <group position={[cx, cy, FRONT_Z]}>
      <mesh position={[0, h / 2 - fw / 2, 0]} castShadow>
        <boxGeometry args={[w, fw, fd]} />
        <meshStandardMaterial {...OAK} color={0xffffff} map={frameMap} />
      </mesh>
      <mesh position={[0, -h / 2 + fw / 2, 0]} castShadow>
        <boxGeometry args={[w, fw, fd]} />
        <meshStandardMaterial {...OAK} color={0xffffff} map={frameMap} />
      </mesh>
      <mesh position={[-w / 2 + fw / 2, 0, 0]} castShadow>
        <boxGeometry args={[fw, h, fd]} />
        <meshStandardMaterial {...OAK} color={0xffffff} map={frameMap} />
      </mesh>
      <mesh position={[w / 2 - fw / 2, 0, 0]} castShadow>
        <boxGeometry args={[fw, h, fd]} />
        <meshStandardMaterial {...OAK} color={0xffffff} map={frameMap} />
      </mesh>
      {mullion && (
        <mesh position={[0, 0, 0.005]} castShadow>
          <boxGeometry args={[fw * 0.8, h - fw * 2, fd * 0.8]} />
          <meshStandardMaterial {...OAK} color={0xffffff} map={frameMap} />
        </mesh>
      )}
      <mesh>
        <boxGeometry args={[w - fw * 2, h - fw * 2, 0.02]} />
        <meshStandardMaterial {...GLASS} />
      </mesh>
    </group>
  )
}

/** One sloped roof slab with its standing seams, hinged at the ridge. */
function RoofSlab({ front }) {
  const sign = front ? 1 : -1
  const seams = useMemo(() => {
    const xs = []
    const half = W / 2 + OV
    for (let x = -half + SEAM_PITCH / 2; x < half; x += SEAM_PITCH) xs.push(x)
    return xs
  }, [])
  return (
    <group position={[0, ridgeH, 0]} rotation={[sign * SLOPE, 0, 0]}>
      <mesh position={[0, SLAB_T / 2, (sign * SLAB_LEN) / 2]} castShadow receiveShadow>
        <boxGeometry args={[W + OV * 2, SLAB_T, SLAB_LEN]} />
        <meshStandardMaterial {...ROOF} />
      </mesh>
      {seams.map((x) => (
        <mesh key={x} position={[x, SLAB_T + 0.017, (sign * SLAB_LEN) / 2]}>
          <boxGeometry args={[0.035, 0.035, SLAB_LEN - 0.03]} />
          <meshStandardMaterial {...SEAM} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The cabin. `cutaway` fades the roof and the glazed front wall away so the
 * camera can get into the kitchen for the under-sink system.
 */
export default function House({ cutaway = false }) {
  const gable = useGableGeometry()
  const chimneyBaseY = ridgeH - Math.abs(CHIMNEY.z) * Math.tan(SLOPE)
  const woodBaseMap = useTexture(woodCladdingMapUrl)
  const [floorMap, frameMap, deckMap] = useMemo(() => {
    const configureMap = (repeatX, repeatY) => {
      const map = woodBaseMap.clone()
      map.wrapS = THREE.RepeatWrapping
      map.wrapT = THREE.RepeatWrapping
      map.repeat.set(repeatX, repeatY)
      map.colorSpace = THREE.SRGBColorSpace
      map.needsUpdate = true
      return map
    }

    return [configureMap(4.5, 4.5), configureMap(1.2, 3.5), configureMap(6, 2.5)]
  }, [woodBaseMap])

  return (
    <group>
      {/* ---------- shell that always stays ---------- */}

      {/* floor slab */}
      <mesh position={[0, floorY / 2, 0]} receiveShadow>
        <boxGeometry args={[W - wallT * 2, floorY, D - wallT * 2]} />
        <meshStandardMaterial {...FLOOR_TIMBER} color={0xffffff} map={floorMap} />
      </mesh>

      {/* back wall + white lining */}
      <mesh position={[0, wallH / 2, -D / 2 + wallT / 2]} castShadow receiveShadow>
        <boxGeometry args={[W, wallH, wallT]} />
        <meshStandardMaterial {...CLADDING} />
      </mesh>
      <mesh position={[0, wallH / 2, -D / 2 + wallT + 0.01]} receiveShadow>
        <boxGeometry args={[W - wallT * 2, wallH, 0.02]} />
        <meshStandardMaterial {...LINING} />
      </mesh>
      <Boards panels={BACK_PANELS} origin={-W / 2} position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]} />

      {/* gable ends + linings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh
            geometry={gable}
            position={[s * (W / 2 - wallT / 2), 0, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial {...CLADDING} />
          </mesh>
          <mesh position={[s * (W / 2 - wallT - 0.01), wallH / 2, 0]} receiveShadow>
            <boxGeometry args={[0.02, wallH, D - wallT * 2]} />
            <meshStandardMaterial {...LINING} />
          </mesh>
          <Boards
            panels={GABLE_PANELS}
            origin={-D / 2 - BOARD.proud}
            position={[(s * W) / 2, 0, 0]}
            rotation={[0, (s * Math.PI) / 2, 0]}
          />
        </group>
      ))}

      {/* ---------- front wall (fades for the cutaway) ---------- */}
      <FadeGroup opacity={cutaway ? 0 : 1}>
        {/* solid section at the left end, where the whole-house unit mounts */}
        <mesh
          position={[(-W / 2 + FRONT_SOLID_X1) / 2, wallH / 2, FRONT_Z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[FRONT_SOLID_X1 + W / 2, wallH, wallT]} />
          <meshStandardMaterial {...CLADDING} />
        </mesh>
        {/* header beam over the openings */}
        <mesh
          position={[(FRONT_SOLID_X1 + W / 2) / 2, wallH - HEADER_H / 2, FRONT_Z]}
          castShadow
        >
          <boxGeometry args={[W / 2 - FRONT_SOLID_X1, HEADER_H, wallT]} />
          <meshStandardMaterial {...CLADDING} />
        </mesh>
        {/* posts between the units */}
        {POSTS.map((x) => (
          <mesh key={x} position={[x, (wallH - HEADER_H) / 2, FRONT_Z]} castShadow>
            <boxGeometry args={[POST_W, wallH - HEADER_H, wallT]} />
            <meshStandardMaterial {...CLADDING} />
          </mesh>
        ))}
        {/* wall under the window sill */}
        <mesh position={[(SILL.x0 + SILL.x1) / 2, SILL.h / 2, FRONT_Z]} castShadow>
          <boxGeometry args={[SILL.x1 - SILL.x0, SILL.h, wallT]} />
          <meshStandardMaterial {...CLADDING} />
        </mesh>
        {/* boards grid from the glazing edge so a joint lands there, not a sliver */}
        <Boards panels={FRONT_PANELS} origin={FRONT_SOLID_X1} position={[0, 0, D / 2]} />

        <Glazing x0={-1.7} x1={0.25} y0={floorY} y1={wallH - HEADER_H} mullion frameMap={frameMap} />
        <Glazing x0={0.4} x1={2.35} y0={floorY} y1={wallH - HEADER_H} mullion frameMap={frameMap} />
        <Glazing x0={2.5} x1={3.08} y0={0.95} y1={wallH - HEADER_H} frameMap={frameMap} />
      </FadeGroup>

      {/* ---------- roof (fades for the cutaway) ---------- */}
      <FadeGroup opacity={cutaway ? 0 : 1}>
        <RoofSlab front />
        <RoofSlab front={false} />
        {/* ridge cap */}
        <mesh position={[0, ridgeH + 0.02, 0]} castShadow>
          <boxGeometry args={[W + OV * 2 + 0.02, 0.07, 0.16]} />
          <meshStandardMaterial {...SEAM} />
        </mesh>
        {/* flue */}
        <group position={[CHIMNEY.x, 0, CHIMNEY.z]}>
          <mesh position={[0, (chimneyBaseY - 0.1 + CHIMNEY.top) / 2, 0]} castShadow>
            <cylinderGeometry
              args={[CHIMNEY.r, CHIMNEY.r, CHIMNEY.top - chimneyBaseY + 0.1, 16]}
            />
            <meshStandardMaterial {...FLUE} />
          </mesh>
          <mesh position={[0, chimneyBaseY + 0.06, 0]}>
            <cylinderGeometry args={[CHIMNEY.r * 1.8, CHIMNEY.r * 1.8, 0.08, 16]} />
            <meshStandardMaterial {...SEAM} />
          </mesh>
          <mesh position={[0, CHIMNEY.top + 0.02, 0]}>
            <cylinderGeometry args={[CHIMNEY.r * 1.5, CHIMNEY.r * 1.5, 0.05, 16]} />
            <meshStandardMaterial {...FLUE} />
          </mesh>
        </group>
      </FadeGroup>

      {/* ---------- deck ---------- */}
      <mesh
        position={[(DECK.x0 + DECK.x1) / 2, DECK.h / 2, (DECK.z0 + DECK.z1) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[DECK.x1 - DECK.x0, DECK.h, DECK.z1 - DECK.z0]} />
        <meshStandardMaterial {...DECK_TIMBER} color={0xffffff} map={deckMap} />
      </mesh>
      {/* step down at the right end */}
      <mesh
        position={[DECK.x1 + 0.225, DECK.h / 4, (DECK.z0 + DECK.z1) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.45, DECK.h / 2, DECK.z1 - DECK.z0]} />
        <meshStandardMaterial {...DECK_TIMBER} color={0xffffff} map={deckMap} />
      </mesh>

      {/* stepping stones out toward the street */}
      {STEPPING_STONES.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]} rotation={[0, i * 0.5, 0]} receiveShadow>
          <cylinderGeometry args={[0.24, 0.26, 0.04, 10]} />
          <meshStandardMaterial {...STONE} />
        </mesh>
      ))}
    </group>
  )
}
