import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TREES, WIND } from './layout'
import { makeBladeGeometry, WIND_FIELD } from './parts/blade'
import { mulberry32 } from './parts/random'
import { useQuality } from './quality'

/** Base colours only, like the rest of the diorama. Needles lighten toward the tip. */
const NEEDLE_ROOT = new THREE.Color(0x0f2e0b)
const NEEDLE_TIP = new THREE.Color(0x6da366)
const TRUNK = { color: 0x6b5140, roughness: 0.9, metalness: 0 }

/** Bare trunk below the lowest skirt. */
const CLEAR_TRUNK = 1
/** Each tier is this many tier-spacings tall, so it hangs well over the one below. */
const OVERLAP = 5

/** Needles per square unit of exposed skirt, about the lawn's blade density. */
const NEEDLE_DENSITY = 1000
/**
 * Needles packed in behind the surface, per square unit of skirt, so what
 * shows between the outer needles is more foliage rather than a bare cone.
 * They sit within this fraction of the radius inward, most just under the
 * surface — anything deeper is never seen — and darken with depth like the
 * shaded inside of a real tree.
 */
const FILL_DENSITY = 700
const FILL_DEPTH = 0.7
const FILL_SHADE = 0.6
const NEEDLE_WIDTH = 0.028
const NEEDLE_LEN = [0.14, 0.26]
/** Needles grow out from the tier and hang a little: mean pitch below level, and spread. */
const NEEDLE_PITCH = -0.26
const NEEDLE_SPREAD = 0.45
/** Inner needles point every which way. */
const FILL_SPREAD = 0.9

/**
 * A pine as a stack of cones — not drawn, only used to lay the needles out.
 * Tier i sits one spacing above tier i-1 and is narrower; the tip of the top
 * one lands exactly at `h`. Each tier is nudged off-axis a little so the
 * skirts don't line up down the tree.
 */
function makeTiers({ h, r, seed }) {
  const rand = mulberry32(seed)
  const n = Math.max(4, Math.round(h * 3))
  const spacing = (h - CLEAR_TRUNK) / (n - 1 + OVERLAP)
  const coneH = spacing * OVERLAP
  const tiers = []
  for (let i = 0; i < n; i++) {
    tiers.push({
      radius: r * (1 - i / (n + 0.4)),
      height: coneH,
      y: CLEAR_TRUNK + i * spacing + coneH / 2,
      dx: (rand() - 0.5) * 0.08,
      dz: (rand() - 0.5) * 0.08,
      // the tier above swallows everything past this fraction of the cone
      exposed: i === n - 1 ? 1 : 1 / OVERLAP,
    })
  }
  // the trunk runs on up inside the foliage, where it shows through the gaps
  return { tiers, trunkH: CLEAR_TRUNK + 0.6 * (h - CLEAR_TRUNK) }
}

// ---------------------------------------------------------------------------
// Needles
// ---------------------------------------------------------------------------

const VERTEX_HEAD = /* glsl */ `
  attribute vec4 aNeedle; // length, phase, tint, height up the tree
  attribute vec4 aFacing; // shading normal in the needle's frame, reach along the bough
  uniform float uTime;
  uniform vec2 uWindDir;
  uniform float uWind;
  varying float vHeight;
  varying float vBend;
  varying float vTint;
  varying float vCrown;
`

/**
 * Shade each needle like the cone it grows on, not like a card, so the tree
 * reads as a lit volume. The normal is stored in the needle's own frame and
 * three's instancing chunk rotates it out again.
 */
const VERTEX_NORMAL = /* glsl */ `
  vec3 objectNormal = aFacing.xyz;
`

/**
 * Size the unit blade, then bend it in the wind. The instance matrix is a
 * pure rotation + translation (the needle's frame on the tier), so the wind
 * is sampled at the root in world space — the same field the lawn uses, so
 * a gust front rolling over the grass carries on up through the tree — and
 * brought into the needle's frame to bend it. The bough heaves too, outer
 * tips of the upper tiers most, on a slower beat.
 */
const VERTEX_BEGIN = /* glsl */ `
  float needleL = aNeedle.x;
  float hf = position.y;
  float needleW = ${NEEDLE_WIDTH.toFixed(3)} * (0.8 + 0.4 * fract(aNeedle.y * 7.31));
  vec3 transformed = vec3(position.x * needleW, position.y * needleL, position.z * needleL);

  mat3 R = mat3(instanceMatrix);
  vec2 root = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xz;
  float wt = uTime;
  ${WIND_FIELD}
  // each needle's own flutter, quicker than a grass blade's
  float flutter = sin(wt * 5.0 + aNeedle.y * 6.2832 + along * 2.0);
  float bend = uWind * (0.15 + 0.5 * gust + 0.25 * swell) + 0.05 * flutter;

  // world wind into the needle's frame: R is orthonormal, so R^-1 = R^T
  vec3 windW = vec3(uWindDir.x, 0.0, uWindDir.y);
  vec3 windL = vec3(dot(R[0], windW), dot(R[1], windW), dot(R[2], windW));
  // bends from the base, tip most
  transformed += windL * bend * hf * hf * needleL;

  float reach = aFacing.w;
  float crown = aNeedle.w;
  float heave = uWind * (0.2 + 0.8 * gust) * (0.03 + 0.08 * reach) * (0.3 + 0.7 * crown);
  // the bough loads up and springs back
  float bob = -0.4 * heave * (0.5 + 0.5 * sin(wt * 1.3 + crown * 3.0 + swell * 2.0));
  vec3 swayW = windW * heave + vec3(0.0, bob, 0.0);
  transformed += vec3(dot(R[0], swayW), dot(R[1], swayW), dot(R[2], swayW));

  vHeight = hf;
  vBend = bend * hf;
  vTint = aNeedle.z;
  vCrown = crown;
`

const FRAGMENT_HEAD = /* glsl */ `
  uniform vec3 uRoot;
  uniform vec3 uTip;
  varying float vHeight;
  varying float vBend;
  varying float vTint;
  varying float vCrown;
`

/**
 * Stock chunk flips the normal on back faces for double-sided materials;
 * the needle normal is the cone's, so both faces should light the same.
 */
const FRAGMENT_NORMAL = /* glsl */ `
  float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
  vec3 normal = normalize( vNormal );
  vec3 nonPerturbedNormal = normal;
`

/**
 * Dark at the root, bright at the tip; the crown lighter than the skirts.
 * vTint carries each needle's own variation and how deep in the tree it is.
 */
const FRAGMENT_COLOR = /* glsl */ `
  #include <color_fragment>
  vec3 needle = mix(uRoot, uTip, smoothstep(0.0, 1.0, vHeight));
  needle *= vTint;
  needle *= 0.85 + 0.25 * vCrown;
  needle += vec3(0.04, 0.05, 0.02) * vBend;
  diffuseColor.rgb *= needle;
`

/** Lambert for the same reason the lawn is (see Grass.jsx): fill rate. */
function makeNeedleMaterial(uniforms) {
  const mat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
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
  mat.customProgramCacheKey = () => 'pineNeedles'
  return mat
}

/** Exposed skirt of a tier: the part of the cone's side the tier above doesn't cover. */
function skirtArea({ radius, height, exposed }) {
  return Math.PI * radius * Math.hypot(radius, height) * (1 - (1 - exposed) ** 2)
}

/**
 * The needles: one instanced mesh of grass blades. The outer layer is rooted
 * over the exposed skirt of every tier, growing outward and hanging a
 * little, each its own way; behind it a fill of darker needles packs the
 * tier out so the tree is solid foliage all the way in. Only the wind and
 * the per-needle size live in the shader; the frame (where it is, which way
 * it grows) is the instance matrix.
 *
 * Needles are laid down tier by tier but written to shuffled slots, so the
 * quality tier can thin the tree by drawing only the first fraction of them
 * and get a uniform sample rather than the bottom of the tree.
 */
function makeNeedles({ tiers, h, seed }, material) {
  const rand = mulberry32(seed * 7919 + 1)
  const counts = tiers.map((tier) => ({
    surface: Math.round(NEEDLE_DENSITY * skirtArea(tier)),
    fill: Math.round(FILL_DENSITY * skirtArea(tier)),
  }))
  const total = counts.reduce((a, c) => a + c.surface + c.fill, 0)

  const geo = makeBladeGeometry()
  const mesh = new THREE.InstancedMesh(geo, material, total)
  const needle = new Float32Array(total * 4)
  const facing = new Float32Array(total * 4)

  // its own generator, so the shuffle doesn't move the needles themselves
  const shuffle = mulberry32(seed * 31 + 7)
  const slot = new Uint32Array(total)
  for (let i = 0; i < total; i++) slot[i] = i
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1))
    ;[slot[i], slot[j]] = [slot[j], slot[i]]
  }

  const m = new THREE.Matrix4()
  const up = new THREE.Vector3(0, 1, 0)
  const root = new THREE.Vector3()
  const coneN = new THREE.Vector3()
  const radial = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const side = new THREE.Vector3()
  const across = new THREE.Vector3()
  const shade = new THREE.Vector3()

  let k = 0
  tiers.forEach((tier, ti) => {
    const { radius: R, height: H, exposed } = tier
    const baseY = tier.y - H / 2
    // sample the cone's side evenly: the wide bottom gets more than the tip
    const span = 1 - (1 - exposed) ** 2

    /** One needle at fraction `t` up the tier, `depth` of the way in toward the axis. */
    const place = (depth, spread) => {
      const t = 1 - Math.sqrt(1 - rand() * span)
      const a = rand() * Math.PI * 2
      const cosA = Math.cos(a)
      const sinA = Math.sin(a)
      radial.set(cosA, 0, sinA)
      tangent.set(-sinA, 0, cosA)
      coneN.set(cosA * H, R, sinA * H).normalize()
      const rr = R * (1 - t) * (1 - depth)
      root.set(tier.dx + cosA * rr, baseY + t * H, tier.dz + sinA * rr)

      // grows outward, pitched a little below level, scattered about that
      const pitch = NEEDLE_PITCH + (rand() - 0.5) * 2 * spread
      const swing = (rand() - 0.5) * 2 * spread
      dir
        .copy(radial)
        .multiplyScalar(Math.cos(pitch))
        .addScaledVector(up, Math.sin(pitch))
        .addScaledVector(tangent, swing)
        .normalize()
      // the blade curls along its local +z; point that down so the needle hangs
      side.copy(dir).multiplyScalar(dir.y).sub(up)
      if (side.lengthSq() < 0.01) side.copy(tangent)
      side.normalize()
      across.crossVectors(dir, side)
      mesh.setMatrixAt(slot[k], m.makeBasis(across, dir, side).setPosition(root))

      const i = slot[k] * 4
      needle[i] = NEEDLE_LEN[0] + (NEEDLE_LEN[1] - NEEDLE_LEN[0]) * rand()
      needle[i + 1] = rand()
      // own variation, then darker the deeper it sits
      needle[i + 2] = (0.85 + 0.3 * rand()) * (1 - FILL_SHADE * (depth / FILL_DEPTH))
      needle[i + 3] = root.y / h

      // the cone's normal, tipped up a touch and scattered with the needle,
      // stored in the needle's own frame
      shade.copy(coneN).addScaledVector(up, 0.2).addScaledVector(dir, 0.25).normalize()
      facing[i] = shade.dot(across)
      facing[i + 1] = shade.dot(dir)
      facing[i + 2] = shade.dot(side)
      // reach along the bough: skirt edge is 1, in by the trunk 0
      facing[i + 3] = (1 - t) * (1 - depth)
      k++
    }

    for (let j = 0; j < counts[ti].surface; j++) place(0, NEEDLE_SPREAD)
    // squared so the fill crowds up just under the surface and thins inward
    for (let j = 0; j < counts[ti].fill; j++) place(FILL_DEPTH * rand() ** 2, FILL_SPREAD)
  })

  mesh.instanceMatrix.needsUpdate = true
  geo.setAttribute('aNeedle', new THREE.InstancedBufferAttribute(needle, 4))
  geo.setAttribute('aFacing', new THREE.InstancedBufferAttribute(facing, 4))
  // the shadow comes from a hidden cone; the needles just sit in it
  mesh.receiveShadow = true
  mesh.castShadow = false
  // bounding sphere is the unit blade at the origin — useless for culling
  mesh.frustumCulled = false
  return mesh
}

// ---------------------------------------------------------------------------
// Trees
// ---------------------------------------------------------------------------

function PineTree({ x, z, h, r, seed, material }) {
  const group = useRef()
  const { foliage } = useQuality()
  const { tiers, trunkH } = useMemo(() => makeTiers({ h, r, seed }), [h, r, seed])
  const needles = useMemo(
    () => makeNeedles({ tiers, h, seed }, material),
    [tiers, h, seed, material],
  )
  useEffect(() => () => needles.geometry.dispose(), [needles])

  /* the attribute's count is the capacity: every needle the tree was built with */
  useEffect(() => {
    needles.count = Math.round(needles.instanceMatrix.count * foliage)
  }, [needles, foliage])

  /**
   * A stiff tree, so the whole thing leans downwind by a few millimetres at
   * the tip and eases back, on a slower beat than the grass gusts. The pivot
   * is the base of the trunk.
   */
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime + seed
    const bend = 0.006 + 0.005 * Math.sin(t * 0.8) + 0.002 * Math.sin(t * 2.7)
    group.current.rotation.set(bend * WIND.y, 0, -bend * WIND.x)
  })

  const trunkR = 0.02 * h
  return (
    <group ref={group} position={[x, 0, z]}>
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[trunkR * 0.55, trunkR, trunkH, 7]} />
        <meshStandardMaterial {...TRUNK} />
      </mesh>
      {/*
        The needles don't cast (their wind lives in a vertex shader the depth
        pass doesn't run), so a cone the shape of the foliage casts for them.
        It writes neither colour nor depth, so it's never seen.
      */}
      <mesh position={[0, (CLEAR_TRUNK + h) / 2, 0]} castShadow>
        <coneGeometry args={[r, h - CLEAR_TRUNK, 8]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <primitive object={needles} />
    </group>
  )
}

/**
 * The pines behind the house, placed by TREES in layout.js. All of them share
 * one needle material, so the wind uniforms are set once a frame. Needles
 * are stiffer than grass, so `wind` sits lower than the lawn's.
 */
export default function Trees({ wind = 0.4 }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindDir: { value: WIND },
      uWind: { value: wind },
      uRoot: { value: NEEDLE_ROOT },
      uTip: { value: NEEDLE_TIP },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded once; live values are set in useFrame
    [],
  )
  const material = useMemo(() => makeNeedleMaterial(uniforms), [uniforms])
  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uWind.value = wind
  })

  return TREES.map((tree) => (
    <PineTree key={`${tree.x},${tree.z}`} {...tree} material={material} />
  ))
}
