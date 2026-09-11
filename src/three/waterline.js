import * as THREE from 'three'

/**
 * The path water takes through the scene: the curve itself, everything
 * positioned along it (canisters, tap, camera focus targets), and the colour
 * it takes on as it travels. Shared by <ServiceLine>, <Canister>,
 * <TapAssembly> and <WaterFlow>.
 *
 * The legacy prototype built all of this inline in buildScene(); the numbers
 * below are copied across unchanged.
 */

/** The house group is offset, and the raw curve points are expressed relative to it. */
export const HOUSE_POSITION = new THREE.Vector3(-0.4, 0, -0.2)

/** street meter -> along the ground -> up the wall rack -> through the roof -> kitchen tap */
const RAW_POINTS = [
  [-4.6, 0.15, 0.7],
  [-4.6, 0.15, 0.0],
  [-2.3, 0.15, 0.0],
  [-2.15, 0.85, 0.0],
  [-2.15, 1.45, 0.0],
  [-2.15, 2.05, 0.0],
  [0.6, 2.05, -1.3],
  [1.9, 0.65, 1.55],
]

/** World-space curve points (the legacy code added houseGroup.position to each). */
export const SERVICE_POINTS = RAW_POINTS.map(
  ([x, y, z]) => new THREE.Vector3(x, y, z).add(HOUSE_POSITION),
)

export const SERVICE_CURVE = new THREE.CatmullRomCurve3(
  SERVICE_POINTS,
  false,
  'catmullrom',
  0.2,
)

export const METER_POSITION = SERVICE_POINTS[0]

/** Canisters sit on curve points 3, 4 and 5 — the vertical run up the wall rack. */
export const CANISTERS = [
  { key: 'sediment', position: SERVICE_POINTS[3], color: 0xd99a55, radius: 0.3, height: 0.52 },
  { key: 'carbon', position: SERVICE_POINTS[4], color: 0x8fa6b3, radius: 0.3, height: 0.52 },
  { key: 'ro', position: SERVICE_POINTS[5], color: 0x3fd8ff, radius: 0.3, height: 0.58 },
]

/** The spout is the final curve point; the glass hangs 0.32 below it. */
export const SPOUT_POSITION = SERVICE_POINTS[7]
export const TAP_GLASS_POSITION = SPOUT_POSITION.clone().add(
  new THREE.Vector3(0, -0.32, 0),
)

/** Camera focus targets, keyed by stage. */
export const STAGE_POSITIONS = {
  sediment: CANISTERS[0].position,
  carbon: CANISTERS[1].position,
  ro: CANISTERS[2].position,
  tap: TAP_GLASS_POSITION,
}

/** The tap is a smaller object, so the camera flies in closer for it. */
export function focusRadiusFor(stageKey) {
  return stageKey === 'tap' ? 1.6 : 2.1
}

/** Fraction of the curve travelled per second by pulses. */
export const FLOW_SPEED = 0.11

/**
 * Hand-authored gradient the water travels through: amber (raw) -> grey
 * (post-sediment) -> cyan (post-carbon) -> mint (post-RO). The flat runs
 * between stops keep each colour steady along a stage, and the narrow
 * ramps make the change read as "the filter did that".
 */
const COLOR_STOPS = [
  { t: 0.0, c: new THREE.Color(0xffb37a) },
  { t: 0.32, c: new THREE.Color(0xffb37a) },
  { t: 0.34, c: new THREE.Color(0x9fb8c7) },
  { t: 0.62, c: new THREE.Color(0x9fb8c7) },
  { t: 0.65, c: new THREE.Color(0x7ce0ff) },
  { t: 0.88, c: new THREE.Color(0x7ce0ff) },
  { t: 0.92, c: new THREE.Color(0x9ff7e0) },
  { t: 1.0, c: new THREE.Color(0x9ff7e0) },
]

/**
 * Colour of the water at curve position t.
 * Writes into `target` to avoid allocating a Color every frame.
 */
export function colorAt(t, target) {
  for (let k = 0; k < COLOR_STOPS.length - 1; k++) {
    const a = COLOR_STOPS[k]
    const b = COLOR_STOPS[k + 1]
    if (t >= a.t && t <= b.t) {
      const local = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
      return target.copy(a.c).lerp(b.c, local)
    }
  }
  return target.copy(COLOR_STOPS[COLOR_STOPS.length - 1].c)
}
