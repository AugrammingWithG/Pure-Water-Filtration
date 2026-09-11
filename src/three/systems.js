import * as THREE from 'three'
import {
  HOUSE,
  KITCHEN,
  RAIN_TANK,
  RAIN_UNIT,
  STREET_METER,
  UNDERSINK_UNIT,
  WHOLE_UNIT,
} from './layout'

/**
 * Per-system 3D configuration: accent colour, the camera view the sidebar
 * flies to, a focus point per stage, and the path water takes (with the
 * colour it turns along the way). The copy for each stage lives in
 * data/constants.js; this file is only geometry and colour.
 */

const v = (x, y, z) => new THREE.Vector3(x, y, z)

/** The opening framing: the whole diorama from the front-right, elevated. */
export const HOME_VIEW = {
  target: v(0.3, 0.9, 0.3),
  radius: 13.5,
  theta: 0.62,
  phi: 1.08,
}

/** Fraction of the path travelled per second by the water pulses. */
export const FLOW_SPEED = 0.1

// ---------------------------------------------------------------------------
// Whole house
// ---------------------------------------------------------------------------

const wu = WHOLE_UNIT
const wc = wu.center
const wCanisterX = wu.canisterOffsets.map((o) => wc.x + o)
const wTop = wc.y + 0.3
const wBottom = wc.y - 0.28
const wOutletX = wCanisterX[2]

const wholePath = [
  STREET_METER,
  v(-3.5, 0.06, 3.1),
  v(wu.riserX, 0.06, wc.z + 0.02),
  v(wu.riserX, 0.9, wc.z),
  v(wu.riserX, 1.62, wc.z),
  v(wCanisterX[0], 1.62, wc.z),
  v(wCanisterX[0], wTop, wc.z),
  v(wCanisterX[0], wBottom, wc.z),
  v(wCanisterX[1], wBottom, wc.z),
  v(wCanisterX[1], wTop, wc.z),
  v(wCanisterX[2], wTop, wc.z),
  v(wCanisterX[2], wBottom, wc.z),
  v(wOutletX, wc.y - wu.h / 2, wc.z),
  v(wOutletX, 0.05, wc.z),
  // underground, then beneath the floor slab to the kitchen
  v(wOutletX, 0.05, 1.0),
  v(KITCHEN.mixerTapX, 0.05, -0.9),
  v(KITCHEN.mixerTapX, HOUSE.floorY + 0.5, KITCHEN.zBack + 0.16),
  v(KITCHEN.mixerTapX, KITCHEN.counterY + 0.32, KITCHEN.zBack + 0.1),
  v(KITCHEN.mixerTapX, KITCHEN.counterY + 0.34, KITCHEN.zBack + 0.3),
  v(KITCHEN.mixerTapX, KITCHEN.counterY + 0.02, KITCHEN.zBack + 0.3),
]

// ---------------------------------------------------------------------------
// Under sink
// ---------------------------------------------------------------------------

const us = UNDERSINK_UNIT
const usTop = us.bracketY - 0.06
const usBottom = us.bracketY - us.canisterH - 0.02
const [usC1, usC2, usC3] = us.canisterXs

const undersinkPath = [
  us.supplyValve,
  v(usC1, us.bracketY + 0.02, us.z),
  v(usC1, usTop, us.z),
  v(usC1, usBottom, us.z),
  v(usC2, usBottom, us.z),
  v(usC2, usTop, us.z),
  v(usC3, usTop, us.z),
  v(usC3, usBottom, us.z),
  v(us.tankX, usBottom, us.z),
  v(us.tankX, us.floorY + 0.5, us.z),
  v(KITCHEN.filterTapX, HOUSE.floorY + 0.75, KITCHEN.zBack + 0.16),
  v(KITCHEN.filterTapX, KITCHEN.counterY + 0.3, KITCHEN.zBack + 0.1),
  v(KITCHEN.filterTapX, KITCHEN.counterY + 0.32, KITCHEN.zBack + 0.3),
  v(KITCHEN.filterTapX, KITCHEN.counterY + 0.02, KITCHEN.zBack + 0.3),
]

// ---------------------------------------------------------------------------
// Rainwater
// ---------------------------------------------------------------------------

const ru = RAIN_UNIT
const rc = ru.center
const rZ = ru.canisterOffsets.map((o) => rc.z + o)
const rUvZ = rc.z + ru.uvOffset
const rTop = rc.y + 0.3
const rBottom = rc.y - 0.28
const rx = ru.pipeX
const tank = RAIN_TANK.center
/** Where the tank's outlet pipe leaves the tank wall, heading for the unit. */
export const TANK_OUTLET = v(tank.x - 0.64, 0.15, tank.z - 0.33)

const rainPath = [
  v(tank.x - 0.2, 1.3, tank.z + 0.1),
  v(tank.x - 0.45, 0.3, tank.z - 0.2),
  TANK_OUTLET,
  v(rx, 0.15, ru.inletZ),
  v(rx, 0.95, ru.inletZ),
  v(rx, 1.62, ru.inletZ),
  v(rx, 1.62, rZ[0]),
  v(rx, rTop, rZ[0]),
  v(rx, rBottom, rZ[0]),
  v(rx, rBottom, rZ[1]),
  v(rx, rTop, rZ[1]),
  v(rx, rTop, rZ[2]),
  v(rx, rBottom, rZ[2]),
  v(rx, rBottom, rUvZ),
  v(rx, rTop, rUvZ),
  v(rx, 1.62, rUvZ),
  v(rx, 1.62, ru.outletZ),
  v(rx, 0.9, ru.outletZ),
  v(rx, -0.05, ru.outletZ),
]

// ---------------------------------------------------------------------------

function makeCurve(points) {
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.12)
}

/**
 * Arc-length fraction of the curve nearest to `point`. Used to place the
 * colour changes exactly where the water leaves each filter stage.
 */
function fractionAt(curve, point) {
  const N = 600
  const samples = curve.getSpacedPoints(N)
  let best = 0
  let bestD = Infinity
  for (let i = 0; i <= N; i++) {
    const d = samples[i].distanceToSquared(point)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best / N
}

/**
 * Builds the colour gradient for a path: the water holds one colour along a
 * stage, then ramps to the next colour over a short run right after the
 * point where that stage ends.
 */
function makeStops(curve, colours, changeAtPoints) {
  const RAMP = 0.025
  const stops = [{ t: 0, c: new THREE.Color(colours[0]) }]
  changeAtPoints.forEach((p, i) => {
    const t = Math.min(0.97, fractionAt(curve, p))
    stops.push({ t, c: new THREE.Color(colours[i]) })
    stops.push({ t: t + RAMP, c: new THREE.Color(colours[i + 1]) })
  })
  stops.push({ t: 1, c: new THREE.Color(colours[colours.length - 1]) })
  return stops
}

function build({ key, accent, view, stages, path, colours, changeAt, contaminantSpan, pulseRadius }) {
  const curve = makeCurve(path)
  return {
    key,
    accent,
    accentColor: new THREE.Color(accent),
    view,
    stages,
    curve,
    stops: makeStops(curve, colours, changeAt),
    /** Grit particles are caught somewhere in this fraction range of the path. */
    contaminantSpan,
    /** Pulse size — the under-sink unit is small, so its water is too. */
    pulseRadius,
  }
}

export const SYSTEMS = {
  whole: build({
    key: 'whole',
    accent: 0x2e8fe0,
    view: { target: v(-2.4, 1.0, 1.9), radius: 3.0, theta: 0.4, phi: 1.22 },
    stages: {
      sediment: { focus: v(wCanisterX[0], wc.y, wc.z), radius: 2.1 },
      carbon: { focus: v(wCanisterX[1], wc.y, wc.z), radius: 2.1 },
      ro: { focus: v(wCanisterX[2], wc.y, wc.z), radius: 2.1 },
      // "every tap in the house" — pull back to the front of the house
      tap: { focus: v(0.6, 1.1, 1.6), radius: 7.5, theta: 0.5, phi: 1.1 },
    },
    path: wholePath,
    colours: [0xd98d3c, 0xb9a98a, 0x8fc4e8, 0x2e8fe0],
    changeAt: [
      v(wCanisterX[0], wBottom, wc.z),
      v(wCanisterX[1], wTop, wc.z),
      v(wCanisterX[2], wBottom, wc.z),
    ],
    contaminantSpan: [0.22, 0.4],
    pulseRadius: 0.024,
  }),

  undersink: build({
    key: 'undersink',
    accent: 0x17b3c6,
    view: { target: v(1.3, 0.62, -1.3), radius: 2.7, theta: 0.18, phi: 1.12 },
    stages: {
      sediment: { focus: v(usC1, us.bracketY - 0.25, us.z), radius: 1.7 },
      carbon: { focus: v(usC2, us.bracketY - 0.25, us.z), radius: 1.7 },
      ro: { focus: v(usC3 - 0.1, us.bracketY - 0.25, us.z), radius: 1.7 },
      tap: {
        focus: v(KITCHEN.filterTapX + 0.1, KITCHEN.counterY + 0.15, KITCHEN.zBack + 0.25),
        radius: 1.8,
      },
    },
    path: undersinkPath,
    colours: [0xc9b08a, 0xb2c4cc, 0x8fd8e6, 0x17b3c6],
    changeAt: [v(usC1, usBottom, us.z), v(usC2, usTop, us.z), v(usC3, usBottom, us.z)],
    contaminantSpan: [0.08, 0.2],
    pulseRadius: 0.014,
  }),

  rain: build({
    key: 'rain',
    accent: 0x2fb872,
    view: { target: v(3.85, 0.9, -0.05), radius: 4.8, theta: 1.72, phi: 1.2 },
    stages: {
      sediment: { focus: v(rx, rc.y, rZ[0]), radius: 2.1 },
      carbon: { focus: v(rx, rc.y, rZ[1] - 0.09), radius: 2.1 },
      ro: { focus: v(rx, rc.y, rUvZ), radius: 2.1 },
      tap: { focus: v(rx, 0.6, ru.outletZ), radius: 2.4 },
    },
    path: rainPath,
    colours: [0x9a9a5e, 0xb4c0a8, 0xa8dcc4, 0x2fb872],
    changeAt: [v(rx, rBottom, rZ[0]), v(rx, rBottom, rZ[2]), v(rx, rTop, rUvZ)],
    contaminantSpan: [0.12, 0.3],
    pulseRadius: 0.02,
  }),
}

/**
 * Colour of the water at fraction t along a system's path.
 * Writes into `target` to avoid allocating a Color every frame.
 */
export function colorAt(stops, t, target) {
  for (let k = 0; k < stops.length - 1; k++) {
    const a = stops[k]
    const b = stops[k + 1]
    if (t >= a.t && t <= b.t) {
      const local = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t)
      return target.copy(a.c).lerp(b.c, local)
    }
  }
  return target.copy(stops[stops.length - 1].c)
}

/** The camera view for a stage: the system's angle, the stage's focus point. */
export function stageView(systemKey, stageKey) {
  const system = SYSTEMS[systemKey]
  const stage = system.stages[stageKey]
  return {
    target: stage.focus,
    radius: stage.radius,
    theta: stage.theta ?? system.view.theta,
    phi: stage.phi ?? system.view.phi,
  }
}
