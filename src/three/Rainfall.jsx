import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DECK, GROUND, HOUSE, RAIN_TANK, WIND } from './layout'
import { mulberry32 } from './parts/random'
import { useQuality } from './quality'

/**
 * The weather the rainwater system runs on: a shower over the whole plinth,
 * shown while that system is the one being read about.
 *
 * It is the one product whose supply you can see arriving — the roof, the
 * downpipe and the tank are all already in the scene, and without the rain
 * they are three objects doing nothing. So this is mounted on the rainwater
 * system alone, not as permanent weather: the other two run off the mains,
 * and a wet diorama behind them would be telling the wrong story.
 *
 * Everything moves in the vertex shader off a single clock uniform. A drop's
 * whole life is a function of its index — where it starts, how fast it falls,
 * where it stops — so there is no per-frame work in JavaScript for a thousand
 * drops, and nothing to update on the geometry but one float.
 */

/** Drops at the full quality tier; the tiers thin this the way they thin the lawn. */
const DROP_COUNT = 1100
/** Splash rings at full quality. Far fewer: they are big and land near the eye. */
const SPLASH_COUNT = 90

/** Rain starts above the tallest pine (7) so nothing pops in inside the frame. */
const TOP_Y = 7.8
/** Drops fall over the plinth and a little past its rim, which the camera sees past. */
const FIELD_RADIUS = GROUND.radius + 0.6

/** Metres a drop falls per second. */
const FALL_SPEED = [4.2, 6.4]
/** Streak length and width, in metres. */
const STREAK_LENGTH = [0.26, 0.46]
const STREAK_WIDTH = [0.007, 0.013]
/** How far the wind carries a drop sideways over a full fall, in metres. */
const DRIFT = 1.1

const RAIN_COLOR = new THREE.Color(0xcfe2f2)
const RAIN_OPACITY = 0.5
const SPLASH_COLOR = new THREE.Color(0xdcecf8)
const SPLASH_OPACITY = 0.3
/** Ring radius a splash opens out to. */
const SPLASH_RADIUS = 0.075
/** Splashes per second on a given patch of ground. */
const SPLASH_RATE = [1.1, 2.0]

/** Seconds the shower takes to build to full strength when the system is picked. */
const ONSET = 1.6

const ROOF_SLOPE = Math.tan(Math.atan2(HOUSE.ridgeH - HOUSE.wallH, HOUSE.d / 2))
const ROOF_HALF_W = HOUSE.w / 2 + HOUSE.overhang
const ROOF_HALF_D = HOUSE.d / 2 + HOUSE.overhang
const TANK_TOP = RAIN_TANK.h + 0.16

/**
 * How high the rain is stopped at (x, z): the roof, the tank lid, the deck,
 * or the lawn. Worked out once per drop on the CPU rather than per frame in
 * the shader, because a drop never moves off its own column — the wind carries
 * it less than a tenth of the roof's width over a fall, which is far less than
 * the eye can tell against a gable this size.
 */
function surfaceY(x, z) {
  if (Math.abs(x) < ROOF_HALF_W && Math.abs(z) < ROOF_HALF_D) {
    return HOUSE.ridgeH - Math.abs(z) * ROOF_SLOPE
  }
  const t = RAIN_TANK.center
  if ((x - t.x) ** 2 + (z - t.z) ** 2 < (RAIN_TANK.r + 0.02) ** 2) return TANK_TOP
  if (x > DECK.x0 && x < DECK.x1 && z > DECK.z0 && z < DECK.z1) return DECK.h
  return 0
}

const lerp = (a, b, t) => a + (b - a) * t

/**
 * A unit quad to instance, with only the corners kept — both shaders place
 * every vertex themselves, so the plane's normals and uvs would be attributes
 * uploaded and never read. The source geometry is left undisposed on purpose:
 * its position attribute is the one being drawn.
 */
function instancedQuad() {
  const quad = new THREE.PlaneGeometry(1, 1)
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = quad.index
  geo.setAttribute('position', quad.getAttribute('position'))
  return geo
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

/**
 * A drop is a quad turned to face the camera, but turned about its own line of
 * travel rather than about world up: the fall direction is taken into view
 * space and the quad is laid out along it, so a streak always points the way
 * the drop is going however the reader orbits, and leans with the wind instead
 * of standing vertical on screen.
 */
const DROP_VERTEX = /* glsl */ `
  attribute vec3 aColumn;  // x, z, the y it stops at
  attribute vec4 aMotion;  // falls per second, phase, length, width
  uniform float uTime;
  uniform float uTop;
  uniform vec2 uDrift;
  varying float vAlong;
  varying float vAcross;
  varying float vFade;

  void main() {
    float cycle = fract(uTime * aMotion.x + aMotion.y);
    float floorY = aColumn.z;
    vec3 center = vec3(
      aColumn.x + uDrift.x * cycle,
      mix(uTop, floorY, cycle),
      aColumn.y + uDrift.y * cycle
    );

    // the drop's own travel, as a direction on screen
    vec3 travel = vec3(uDrift.x, floorY - uTop, uDrift.y);
    vec2 fall = (modelViewMatrix * vec4(travel, 0.0)).xy;
    // straight down the barrel: any orientation reads the same
    vec2 dir = length(fall) > 1e-5 ? normalize(fall) : vec2(0.0, -1.0);
    vec2 side = vec2(-dir.y, dir.x);

    vec4 mv = modelViewMatrix * vec4(center, 1.0);
    mv.xy += dir * position.y * aMotion.z + side * position.x * aMotion.w;
    gl_Position = projectionMatrix * mv;

    vAlong = position.y + 0.5;
    vAcross = position.x * 2.0;
    // eased off at the very end of the fall so drops arrive rather than stop
    vFade = 1.0 - smoothstep(0.94, 1.0, cycle);
  }
`

/**
 * Bright at the head, tapering back along the streak and softened across it —
 * a hard-edged rectangle at this width aliases into a dotted line as it moves.
 */
const DROP_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlong;
  varying float vAcross;
  varying float vFade;

  void main() {
    float across = 1.0 - vAcross * vAcross;
    float along = mix(0.15, 1.0, vAlong * vAlong);
    float alpha = uOpacity * vFade * across * along;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function makeStreaks(uniforms) {
  const geo = instancedQuad()
  const rand = mulberry32(90210)
  const column = new Float32Array(DROP_COUNT * 3)
  const motion = new Float32Array(DROP_COUNT * 4)

  for (let i = 0; i < DROP_COUNT; i++) {
    const r = FIELD_RADIUS * Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const floorY = surfaceY(x, z)
    column[i * 3] = x
    column[i * 3 + 1] = z
    column[i * 3 + 2] = floorY

    // cycles per second, not metres per second: the shader walks a drop from
    // the top of the field to its own floor over one cycle, and a drop stopped
    // by the roof has less far to go, so it must get there sooner to be
    // falling at the same speed as its neighbour on the lawn.
    const speed = lerp(FALL_SPEED[0], FALL_SPEED[1], rand())
    motion[i * 4] = speed / (TOP_Y - floorY)
    motion[i * 4 + 1] = rand()
    motion[i * 4 + 2] = lerp(STREAK_LENGTH[0], STREAK_LENGTH[1], rand())
    motion[i * 4 + 3] = lerp(STREAK_WIDTH[0], STREAK_WIDTH[1], rand())
  }

  geo.setAttribute('aColumn', new THREE.InstancedBufferAttribute(column, 3))
  geo.setAttribute('aMotion', new THREE.InstancedBufferAttribute(motion, 4))

  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: DROP_VERTEX,
      fragmentShader: DROP_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  // the geometry is a unit quad at the origin until the shader places it
  mesh.frustumCulled = false
  return mesh
}

// ---------------------------------------------------------------------------
// Splashes
// ---------------------------------------------------------------------------

/**
 * Where the rain lands. Rings rather than droplets: a ring opening out and
 * fading is what the eye reads as a surface taking a hit, and it costs one
 * quad. They are not tied to particular drops — at this rate the eye cannot
 * pair a splash with the streak that caused it, and independent rings let the
 * two run at whatever density each needs.
 */
const SPLASH_VERTEX = /* glsl */ `
  attribute vec3 aSpot;   // where on the ground this one lands
  attribute vec2 aBeat;   // splashes per second, phase
  uniform float uTime;
  uniform float uRadius;
  varying vec2 vLocal;
  varying float vAge;

  void main() {
    float age = fract(uTime * aBeat.x + aBeat.y);
    // the ring opens out fast and the ground rests between hits
    float grow = sqrt(min(age * 2.4, 1.0));
    vec3 offset = vec3(position.x, 0.0, -position.y) * uRadius * 2.0 * grow;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aSpot + offset, 1.0);
    vLocal = position * 2.0;
    vAge = age;
  }
`

const SPLASH_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vLocal;
  varying float vAge;

  void main() {
    float r = length(vLocal);
    // a thinning ring at the rim of the quad, gone well before the next hit
    float ring = smoothstep(0.55, 0.95, r) * (1.0 - smoothstep(0.95, 1.0, r));
    float life = (1.0 - smoothstep(0.0, 0.42, vAge)) * smoothstep(0.0, 0.05, vAge);
    float alpha = uOpacity * ring * life;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

function makeSplashes(uniforms) {
  const geo = instancedQuad()
  const rand = mulberry32(5150)
  const spot = new Float32Array(SPLASH_COUNT * 3)
  const beat = new Float32Array(SPLASH_COUNT * 2)

  let placed = 0
  let tries = 0
  while (placed < SPLASH_COUNT && tries < SPLASH_COUNT * 20) {
    tries++
    const r = GROUND.radius * Math.sqrt(rand())
    const a = rand() * Math.PI * 2
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    // flat ground only: a ring lying in the xz plane would cut through the
    // roof's slope, and on the deck or the tank it would float off the edge
    if (surfaceY(x, z) !== 0) continue
    spot[placed * 3] = x
    // clear of the lawn so the ring is not half buried in the blades
    spot[placed * 3 + 1] = 0.012
    spot[placed * 3 + 2] = z
    beat[placed * 2] = lerp(SPLASH_RATE[0], SPLASH_RATE[1], rand())
    beat[placed * 2 + 1] = rand()
    placed++
  }

  geo.setAttribute('aSpot', new THREE.InstancedBufferAttribute(spot, 3))
  geo.setAttribute('aBeat', new THREE.InstancedBufferAttribute(beat, 2))
  geo.instanceCount = placed

  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: SPLASH_VERTEX,
      fragmentShader: SPLASH_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  mesh.frustumCulled = false
  return { mesh, placed }
}

// ---------------------------------------------------------------------------

/**
 * Rain over the diorama, for as long as it is mounted. It fades up rather than
 * arriving all at once, so picking the rainwater system reads as weather
 * closing in over the house instead of a layer being switched on.
 */
export default function Rainfall() {
  const { foliage } = useQuality()

  const rain = useMemo(() => {
    const drift = WIND.clone().multiplyScalar(DRIFT)
    const uTime = { value: 0 }
    const streakUniforms = {
      uTime,
      uTop: { value: TOP_Y },
      uDrift: { value: drift },
      uColor: { value: RAIN_COLOR },
      uOpacity: { value: 0 },
    }
    const splashUniforms = {
      uTime,
      uRadius: { value: SPLASH_RADIUS },
      uColor: { value: SPLASH_COLOR },
      uOpacity: { value: 0 },
    }
    const streaks = makeStreaks(streakUniforms)
    const splashes = makeSplashes(splashUniforms)
    return { uTime, streaks, splashes, streakUniforms, splashUniforms }
  }, [])

  useEffect(
    () => () => {
      for (const mesh of [rain.streaks, rain.splashes.mesh]) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
    },
    [rain],
  )

  // Same thinning as the lawn: the drops are scattered in random order, so
  // drawing the first fraction of them is an even thinning of the shower.
  useEffect(() => {
    rain.streaks.geometry.instanceCount = Math.round(DROP_COUNT * foliage)
    rain.splashes.mesh.geometry.instanceCount = Math.round(rain.splashes.placed * foliage)
  }, [rain, foliage])

  useFrame((_, delta) => {
    rain.uTime.value += delta
    const onset = Math.min(1, rain.uTime.value / ONSET)
    rain.streakUniforms.uOpacity.value = RAIN_OPACITY * onset
    rain.splashUniforms.uOpacity.value = SPLASH_OPACITY * onset
  })

  return (
    <group>
      <primitive object={rain.streaks} />
      <primitive object={rain.splashes.mesh} />
    </group>
  )
}
