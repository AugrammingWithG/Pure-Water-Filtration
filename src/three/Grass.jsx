import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  DECK,
  GROUND,
  HOUSE,
  PATH,
  RAIN_TANK,
  RAIN_UNIT,
  STEPPING_STONES,
  TREES,
  WIND,
} from './layout'
import { makeBladeGeometry, WIND_FIELD } from './parts/blade'
import { mulberry32 } from './parts/random'
import { TANK_OUTLET } from './systems'

/** Blades stop just short of the rim so the plinth edge stays crisp. */
const LAWN_RADIUS = GROUND.radius - 0.08
const BLADE_WIDTH = 0.025
const ROOT_COLOR = new THREE.Color(0x1c4a16)
const TIP_COLOR = new THREE.Color(0x45873d)
const HOTSPOT_LAYERS = [
  {
    seed: 211,
    share: 0.11,
    clusters: 8,
    radius: [0.59, 0.62],
    falloff: 1.45,
    threshold: 0.2,
    root: new THREE.Color(0x173b16),
    tip: new THREE.Color(0x407b32),
    accentMix: 0.03,
    height: [0.11, 0.24],
    tint: [0.36, 0.72],
    widthJitter: 0.5,
  },
  {
    seed: 431,
    share: 0.07,
    clusters: 30,
    radius: [1.89, 0.89],
    falloff: 1.65,
    threshold: 0.26,
    root: new THREE.Color(0x4d581d),
    tip: new THREE.Color(0x96a94d),
    accentMix: 0.018,
    height: [0.13, 0.28],
    tint: [0.58, 0.92],
    widthJitter: 0.62,
  },
  {
    seed: 617,
    share: 0.05,
    clusters: 5,
    radius: [0.24, 0.42],
    falloff: 1.9,
    threshold: 0.32,
    root: new THREE.Color(0x2d5f1e),
    tip: new THREE.Color(0x77b24d),
    accentMix: 0.022,
    height: [0.1, 0.22],
    tint: [0.5, 0.86],
    widthJitter: 0.7,
  },
]

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

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
/** Bare ring of needle litter round each trunk. */
const TRUNK_R2 = 0.3 ** 2

/** Anything that sits on the ground gets a clear patch around it. */
function blocked(x, z) {
  if (Math.abs(x) < HOUSE_X && Math.abs(z) < HOUSE_Z) return true
  if (x > DECK.x0 - 0.05 && x < DECK_X1 && z > DECK.z0 - 0.05 && z < DECK.z1 + 0.05) return true
  const t = RAIN_TANK.center
  if ((x - t.x) ** 2 + (z - t.z) ** 2 < TANK_R2) return true
  for (const [sx, sz] of STEPPING_STONES) {
    if ((x - sx) ** 2 + (z - sz) ** 2 < STONE_R2) return true
  }
  for (const tree of TREES) {
    if ((x - tree.x) ** 2 + (z - tree.z) ** 2 < TRUNK_R2) return true
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
  float wt = uTime;
  ${WIND_FIELD}
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
  uniform float uWidthJitter;
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
  grass += vec3(0.02, 0.03, 0.01) * uWidthJitter * vTint;
  grass = mix(grass, uAccent, uAccentMix * vHeight);
  diffuseColor.rgb *= grass;
`

function makeMaterial(uniforms) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
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

function createCenters(rand, count, radiusRange) {
  const centers = []
  const sectors = Array.from({ length: count }, (_, index) => index)
  const angleOffset = rand() * Math.PI * 2

  for (let i = sectors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[sectors[i], sectors[j]] = [sectors[j], sectors[i]]
  }

  for (const sector of sectors) {
    let placed = false
    for (let tries = 0; tries < 12 && !placed; tries++) {
      const r = LAWN_RADIUS * Math.sqrt(rand())
      const a = angleOffset + ((sector + rand()) / count) * Math.PI * 2
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (blocked(x, z)) continue
      const radius = THREE.MathUtils.lerp(radiusRange[0], radiusRange[1], rand())
      centers.push({ x, z, radius, strength: 0.7 + rand() * 0.3 })
      placed = true
    }
  }

  let tries = 0
  while (centers.length < count && tries < count * 12) {
    tries++
    const r = LAWN_RADIUS * Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (blocked(x, z)) continue
    const radius = THREE.MathUtils.lerp(radiusRange[0], radiusRange[1], rand())
    centers.push({ x, z, radius, strength: 0.7 + rand() * 0.3 })
  }
  return centers
}

function hotspotWeight(x, z, centers, falloff) {
  let best = 0
  for (const center of centers) {
    const dx = x - center.x
    const dz = z - center.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    const influence = Math.max(0, 1 - dist / center.radius)
    best = Math.max(best, center.strength * influence ** falloff)
  }
  return Math.min(1, best)
}

function makeLawn(count, uniforms, options = {}) {
  const geo = makeBladeGeometry()
  const rand = mulberry32(options.seed ?? 1337)
  const blade = new Float32Array(count * 4)
  const mesh = new THREE.InstancedMesh(geo, makeMaterial(uniforms), count)
  const m = new THREE.Matrix4()
  const centers =
    options.clusters && options.radius
      ? createCenters(rand, options.clusters, options.radius)
      : []
  const minHeight = options.height?.[0] ?? 0.12
  const maxHeight = options.height?.[1] ?? 0.24
  const minTint = options.tint?.[0] ?? 0.35
  const maxTint = options.tint?.[1] ?? 1
  const threshold = options.threshold ?? 0
  const falloff = options.falloff ?? 1.25
  const hotspotBoost = options.hotspotBoost ?? 0.2

  let placed = 0
  let tries = 0
  while (placed < count && tries < count * 18) {
    tries++
    const r = LAWN_RADIUS * Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (blocked(x, z)) continue

    // slow spatial variation so the lawn has patches, not just noise
    const patch = 0.5 + 0.5 * Math.sin(x * 0.9 + 1.7) * Math.cos(z * 1.1 - 0.4)
    const hotspot = centers.length === 0 ? patch : hotspotWeight(x, z, centers, falloff)
    if (centers.length && hotspot < threshold) continue
    if (centers.length && rand() > hotspot) continue
    const i = placed * 4
    blade[i] = rand() * Math.PI * 2
    blade[i + 1] =
      THREE.MathUtils.lerp(minHeight, maxHeight, rand()) *
      (0.86 + hotspotBoost * patch + 0.35 * hotspot)
    blade[i + 2] = rand()
    blade[i + 3] = THREE.MathUtils.lerp(minTint, maxTint, 0.55 * rand() + 0.45 * hotspot)
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
 * The lawn: a dense base mesh plus a few lower-density hotspot overlays,
 * all scattered over the plinth while skipping the house, deck, tank and
 * path. Wind is done in the vertex shader; the rest of the shading is
 * three's standard PBR so the blades receive the house's shadow and pick up
 * the same light as everything else.
 */
export default function Grass({ accent, count = 60000, wind = 0.55 }) {
  const layers = useMemo(() => {
    const baseUniforms = {
      uTime: { value: 0 },
      uWindDir: { value: WIND },
      uWind: { value: wind },
      uRoot: { value: ROOT_COLOR },
      uTip: { value: TIP_COLOR },
      uAccent: { value: new THREE.Color(accent) },
      uAccentMix: { value: 0.08 },
      uWidthJitter: { value: 0 },
    }
    const baseMesh = makeLawn(count, baseUniforms)

    const hotspotMeshes = HOTSPOT_LAYERS.map((layer) => {
      const uniforms = {
        uTime: { value: 0 },
        uWindDir: { value: WIND },
        uWind: { value: wind },
        uRoot: { value: layer.root },
        uTip: { value: layer.tip },
        uAccent: { value: new THREE.Color(accent) },
        uAccentMix: { value: layer.accentMix },
        uWidthJitter: { value: layer.widthJitter },
      }
      const mesh = makeLawn(Math.round(count * layer.share), uniforms, layer)
      return { mesh, uniforms }
    })

    return [{ mesh: baseMesh, uniforms: baseUniforms }, ...hotspotMeshes]
  }, [count])

  useEffect(
    () => () => {
      for (const { mesh } of layers) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
    },
    [layers],
  )

  useFrame(({ clock }, delta) => {
    for (const { uniforms } of layers) {
      uniforms.uTime.value = clock.elapsedTime
      uniforms.uWind.value = wind
      uniforms.uAccent.value.lerp(accent, Math.min(1, delta * 3))
    }
  })

  return (
    <group>
      {layers.map(({ mesh }, index) => (
        <primitive key={index} object={mesh} />
      ))}
    </group>
  )
}
