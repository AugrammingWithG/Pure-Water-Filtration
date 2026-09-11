import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DECK, GROUND, HOUSE, PATH, RAIN_TANK, RAIN_UNIT, STEPPING_STONES } from './layout'
import { TANK_OUTLET } from './systems'

/** Blades stop just short of the rim so the plinth edge stays crisp. */
const LAWN_RADIUS = GROUND.radius - 0.08
const BLADE_WIDTH = 0.03
const ROOT_COLOR = new THREE.Color(0x3b6836)
const TIP_COLOR = new THREE.Color(0x93bd5e)
/** Blows from front-left toward the back-right, across the home view. */
const WIND_DIR = new THREE.Vector2(0.8, -0.6).normalize()

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

/** Deterministic PRNG so the lawn is the same on every load. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const len2 = dx * dx + dz * dz
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (pz - az) * dz) / len2
  t = Math.max(0, Math.min(1, t))
  const ex = ax + t * dx - px
  const ez = az + t * dz - pz
  return Math.sqrt(ex * ex + ez * ez)
}

function distToPolyline(px, pz, points) {
  let best = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i]
    const [bx, bz] = points[i + 1]
    best = Math.min(best, distToSegment(px, pz, ax, az, bx, bz))
  }
  return best
}

const HOUSE_X = HOUSE.w / 2 + 0.05
const HOUSE_Z = HOUSE.d / 2 + 0.05
const DECK_X1 = DECK.x1 + 0.5 // includes the step
const TANK_R2 = (RAIN_TANK.r + 0.05) ** 2
const STONE_R2 = 0.3 ** 2

/** Anything that sits on the ground gets a clear patch around it. */
function blocked(x, z) {
  if (Math.abs(x) < HOUSE_X && Math.abs(z) < HOUSE_Z) return true
  if (x > DECK.x0 - 0.05 && x < DECK_X1 && z > DECK.z0 - 0.05 && z < DECK.z1 + 0.05) return true
  const t = RAIN_TANK.center
  if ((x - t.x) ** 2 + (z - t.z) ** 2 < TANK_R2) return true
  for (const [sx, sz] of STEPPING_STONES) {
    if ((x - sx) ** 2 + (z - sz) ** 2 < STONE_R2) return true
  }
  // a few blades lean over the gravel edge, which softens it
  if (distToPolyline(x, z, PATH.points) < PATH.halfWidth - 0.03) return true
  // the tank's feed pipe lies on the lawn — keep blades from poking through it
  if (distToSegment(x, z, TANK_OUTLET.x, TANK_OUTLET.z, RAIN_UNIT.pipeX, RAIN_UNIT.inletZ) < 0.07) {
    return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Geometry + material
// ---------------------------------------------------------------------------

/**
 * One blade: three tapered segments and a tip, 7 vertices. Unit-sized —
 * x spans -0.5..0.5, y 0..1 — the shader scales it per instance. It curls
 * forward a little along +z so blades don't all stand ramrod straight.
 * Normals point mostly up so the lawn shades as a surface rather than as
 * thousands of individually lit cards.
 */
function makeBladeGeometry() {
  const rows = [
    [0, 1],
    [0.35, 0.92],
    [0.7, 0.62],
  ]
  const n = new THREE.Vector3(0, 0.75, 0.66).normalize()
  const positions = []
  const normals = []
  for (const [y, w] of rows) {
    const z = 0.25 * y * y
    positions.push(-0.5 * w, y, z, 0.5 * w, y, z)
    normals.push(n.x, n.y, n.z, n.x, n.y, n.z)
  }
  positions.push(0, 1, 0.25)
  normals.push(n.x, n.y, n.z)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setIndex([0, 1, 3, 0, 3, 2, 2, 3, 5, 2, 5, 4, 4, 5, 6])
  return geo
}

const VERTEX_HEAD = /* glsl */ `
  attribute vec4 aBlade; // yaw, height, phase, tint
  uniform float uTime;
  uniform vec2 uWindDir;
  uniform float uWind;
  varying float vHeight;
  varying float vBend;
  varying float vTint;
`

/** Yaw the blade's normal with the blade; the cos/sin are reused below. */
const VERTEX_NORMAL = /* glsl */ `
  float bladeCos = cos(aBlade.x);
  float bladeSin = sin(aBlade.x);
  vec3 objectNormal = vec3(
    normal.x * bladeCos - normal.z * bladeSin,
    normal.y,
    normal.x * bladeSin + normal.z * bladeCos
  );
`

/**
 * Size and yaw the unit blade, then bend it in the wind. The wind is sampled
 * at the blade's root in world space (the instance matrix is a pure
 * translation), so neighbouring blades move together and gust fronts travel
 * across the lawn. Bend grows with the square of height so roots stay put.
 */
const VERTEX_BEGIN = /* glsl */ `
  float bladeH = aBlade.y;
  float hf = position.y;
  float bladeW = ${BLADE_WIDTH.toFixed(3)} * (0.8 + 0.4 * fract(aBlade.z * 7.31));
  vec3 local = vec3(position.x * bladeW, position.y * bladeH, position.z * bladeH);
  vec3 transformed = vec3(
    local.x * bladeCos - local.z * bladeSin,
    local.y,
    local.x * bladeSin + local.z * bladeCos
  );

  vec2 root = instanceMatrix[3].xz;
  float along = dot(root, uWindDir);
  float across = dot(root, vec2(-uWindDir.y, uWindDir.x));
  float wt = uTime;
  // gust fronts rolling downwind, wavering sideways as they go
  float gust = 0.5 + 0.5 * sin(along * 0.9 - wt * 1.8 + 1.4 * sin(across * 0.5 + wt * 0.4));
  gust *= gust;
  // a broader, slower swell underneath
  float swell = 0.5 + 0.5 * sin(along * 0.35 - wt * 0.7 + across * 0.25);
  // each blade's own flutter
  float flutter = sin(wt * 4.5 + aBlade.z * 6.2832 + along * 2.0);
  float bend = uWind * (0.2 + 0.6 * gust + 0.3 * swell) + 0.04 * flutter;

  vec2 dir = normalize(uWindDir + vec2(-uWindDir.y, uWindDir.x) * (aBlade.w - 0.5) * 0.5);
  vec2 off = dir * bend * hf * hf * bladeH;
  transformed.xz += off;
  // a leaning blade doesn't get longer
  transformed.y -= length(off) * 0.45 * hf;

  vHeight = hf;
  vBend = bend * hf;
  vTint = aBlade.w;
`

const FRAGMENT_HEAD = /* glsl */ `
  uniform vec3 uRoot;
  uniform vec3 uTip;
  uniform vec3 uAccent;
  uniform float uAccentMix;
  varying float vHeight;
  varying float vBend;
  varying float vTint;
`

/**
 * Stock chunk flips the normal on back faces for double-sided materials;
 * the blade normal already points up, so both faces should light the same.
 */
const FRAGMENT_NORMAL = /* glsl */ `
  float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
  vec3 normal = normalize( vNormal );
  vec3 nonPerturbedNormal = normal;
`

/** Dark at the root, bright at the tip, lighter still where the wind bends it. */
const FRAGMENT_COLOR = /* glsl */ `
  #include <color_fragment>
  vec3 grass = mix(uRoot, uTip, smoothstep(0.0, 1.0, vHeight));
  grass *= 0.85 + 0.3 * vTint;
  grass += vec3(0.05, 0.06, 0.02) * vBend;
  grass = mix(grass, uAccent, uAccentMix * vHeight);
  diffuseColor.rgb *= grass;
`

function makeMaterial(uniforms) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
    envMapIntensity: 0.35,
  })
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `${VERTEX_HEAD}\n#include <common>`)
      .replace('#include <beginnormal_vertex>', VERTEX_NORMAL)
      .replace('#include <begin_vertex>', VERTEX_BEGIN)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `${FRAGMENT_HEAD}\n#include <common>`)
      .replace('#include <normal_fragment_begin>', FRAGMENT_NORMAL)
      .replace('#include <color_fragment>', FRAGMENT_COLOR)
  }
  mat.customProgramCacheKey = () => 'grass'
  return mat
}

function makeLawn(count, uniforms) {
  const geo = makeBladeGeometry()
  const rand = mulberry32(1337)
  const blade = new Float32Array(count * 4)
  const mesh = new THREE.InstancedMesh(geo, makeMaterial(uniforms), count)
  const m = new THREE.Matrix4()

  let placed = 0
  let tries = 0
  while (placed < count && tries < count * 8) {
    tries++
    const r = LAWN_RADIUS * Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (blocked(x, z)) continue

    // slow spatial variation so the lawn has patches, not just noise
    const patch = 0.5 + 0.5 * Math.sin(x * 0.9 + 1.7) * Math.cos(z * 1.1 - 0.4)
    const i = placed * 4
    blade[i] = rand() * Math.PI * 2
    blade[i + 1] = (0.12 + 0.12 * rand()) * (0.9 + 0.2 * patch)
    blade[i + 2] = rand()
    blade[i + 3] = 0.35 * patch + 0.65 * rand()
    mesh.setMatrixAt(placed, m.makeTranslation(x, 0, z))
    placed++
  }

  mesh.count = placed
  mesh.instanceMatrix.needsUpdate = true
  geo.setAttribute('aBlade', new THREE.InstancedBufferAttribute(blade, 4))
  mesh.receiveShadow = true
  mesh.castShadow = false
  // bounding sphere is the unit blade at the origin — useless for culling
  mesh.frustumCulled = false
  return mesh
}

/**
 * The lawn: one instanced mesh of tapered blades scattered over the plinth,
 * skipping the house, deck, tank and path. Wind is done in the vertex
 * shader; the rest of the shading is three's standard PBR so the blades
 * receive the house's shadow and pick up the same light as everything else.
 */
export default function Grass({ accent, count = 60000, wind = 0.55 }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindDir: { value: WIND_DIR },
      uWind: { value: wind },
      uRoot: { value: ROOT_COLOR },
      uTip: { value: TIP_COLOR },
      uAccent: { value: new THREE.Color(accent) },
      uAccentMix: { value: 0.08 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded once; live values are set in useFrame
    [],
  )
  const mesh = useMemo(() => makeLawn(count, uniforms), [count, uniforms])

  useEffect(
    () => () => {
      mesh.geometry.dispose()
      mesh.material.dispose()
    },
    [mesh],
  )

  useFrame(({ clock }, delta) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uWind.value = wind
    uniforms.uAccent.value.lerp(accent, Math.min(1, delta * 3))
  })

  return <primitive object={mesh} />
}
