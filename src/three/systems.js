import * as THREE from 'three'
import { buildPath } from './path'
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
 * flies to, a focus point per stage, and the route water takes through the
 * four stages. The copy for each stage lives in data/constants.js; this file
 * is only geometry and colour.
 *
 * Routes are authored as legs — see three/path.js for what a leg is and why
 * the route is cut up that way rather than written as one list of points.
 */

const v = (x, y, z) => new THREE.Vector3(x, y, z)

/** The opening framing: the whole diorama from the front-right, elevated. */
export const HOME_VIEW = {
  target: v(0.3, 0.9, 0.3),
  radius: 13.5,
  theta: 0.62,
  phi: 1.08,
}

/** Trips per second taken by the water. Every system takes the same time. */
export const FLOW_SPEED = 0.1

/**
 * Plain water, as it comes out of a kitchen tap that is not the one being
 * shown: water-blue, and not the route's raw colour. That colour tells the
 * story inside the unit; out of a tap it just reads as dirty water.
 */
const TAP_WATER = 0x6fb4e6

/**
 * Pace inside a filter element, relative to an open pipe run. Low enough that
 * the three cartridges — a couple of metres out of a route that can be twenty —
 * hold the eye for as long as they hold the water.
 */
const MEDIA_PACE = 0.26
/** Water dwells in the RO pressure tank rather than passing straight through. */
const TANK_PACE = 0.45
/** The UV lamp needs contact time, same as media does. */
const UV_PACE = 0.3

/**
 * A short straight either side of a bend in a thin pipe. The spline's tangent
 * at a control point runs parallel to the chord between its neighbours, so a
 * bare corner gets a diagonal tangent and rounds off by bulging out of the
 * pipe. Bracketing the corner keeps the tangents there along the pipe, and
 * the rounding happens inside the fitting.
 */
const ELBOW = 0.02

/** Where water leaves a kitchen tap's nozzle, and where it lands in the sink. */
function tapFall(tap) {
  const { counterY, tapZ, tapNozzle } = KITCHEN
  const mouthZ = tapZ + tap.reach
  return {
    mouth: v(tap.x, counterY + tap.height - tapNozzle, mouthZ),
    land: v(tap.x, counterY + 0.02, mouthZ),
  }
}

/**
 * Chrome is drawn as a solid cylinder; treat this much of its radius as the
 * bore, leaving wall enough that a bubble pressed against it, on a spline
 * that rounds each bend by up to a millimetre, still never shows through.
 */
const TAP_BORE = 0.7

/**
 * The legs through one of the kitchen taps, built from the proportions
 * Kitchen.jsx builds the tap from. A leg's span begins where the previous one
 * ended, so the approach to the foot of the riser is a leg of its own: that
 * way the bore on the run through the chrome starts at the chrome and not
 * back wherever the caller's plumbing left off.
 *
 *   1. up to the foot of the riser, through the counter
 *   2. up the riser, round the swan neck, out along the spout and down the
 *      nozzle to its mouth — chrome only 11 mm across, so a bore keeps the
 *      bubbles in and elbow points keep the line in
 *   3. the free fall from the mouth into the sink, out in the open
 */
function tapLegs(tap) {
  const { counterY, tapZ } = KITCHEN
  const { x } = tap
  const neckY = counterY + tap.height
  const { mouth, land } = tapFall(tap)
  return [
    { stage: 'tap', points: [v(x, counterY - 0.01, tapZ)] },
    {
      stage: 'tap',
      bore: tap.radius * TAP_BORE,
      points: [
        v(x, neckY - ELBOW, tapZ),
        v(x, neckY, tapZ),
        v(x, neckY, tapZ + ELBOW),
        v(x, neckY, mouth.z - ELBOW),
        v(x, neckY, mouth.z),
        v(x, neckY - ELBOW, mouth.z),
        mouth,
      ],
    },
    { stage: 'tap', points: [land] },
  ]
}

/**
 * How far up inside the nozzle a plain tap stream begins, so its bubbles come
 * out of the chrome at full size instead of appearing just below it.
 */
const STREAM_LEAD = 0.02

/**
 * The legs of a plain stream from a kitchen tap that is pouring but is not on
 * the route: the last of the nozzle, with the same bore the route's leg has
 * through it, then the free fall into the sink. A path of its own, so
 * WaterFlow can run the same bubbles down it that run the route.
 */
function tapStreamLegs(tap) {
  const { mouth, land } = tapFall(tap)
  return [
    {
      stage: 'tap',
      bore: tap.radius * TAP_BORE,
      points: [v(mouth.x, mouth.y + STREAM_LEAD, mouth.z), mouth],
    },
    { stage: 'tap', points: [land] },
  ]
}

// ---------------------------------------------------------------------------
// Whole house
// ---------------------------------------------------------------------------

const wu = WHOLE_UNIT
const wc = wu.center
const wCanisterX = wu.canisterOffsets.map((o) => wc.x + o)
const wTop = wc.y + 0.3
const wBottom = wc.y - 0.28
const wOutletX = wCanisterX[2]

/**
 * Mains from the street meter, up the riser, down through cartridge one,
 * across and up through two, across and down through three, then out the
 * bottom of the cabinet and under the slab to the kitchen.
 */
const wholeLegs = [
  {
    stage: 'sediment',
    buried: true,
    points: [STREET_METER, v(-3.5, 0.06, 3.1), v(wu.riserX, 0.06, wc.z + 0.02)],
  },
  {
    stage: 'sediment',
    points: [
      v(wu.riserX, 0.9, wc.z),
      v(wu.riserX, 1.62, wc.z),
      v(wCanisterX[0], 1.62, wc.z),
      v(wCanisterX[0], wTop, wc.z),
    ],
  },
  { stage: 'sediment', media: true, pace: MEDIA_PACE, points: [v(wCanisterX[0], wBottom, wc.z)] },

  { stage: 'carbon', points: [v(wCanisterX[1], wBottom, wc.z)] },
  { stage: 'carbon', media: true, pace: MEDIA_PACE, points: [v(wCanisterX[1], wTop, wc.z)] },

  { stage: 'ro', points: [v(wCanisterX[2], wTop, wc.z)] },
  { stage: 'ro', media: true, pace: MEDIA_PACE, points: [v(wCanisterX[2], wBottom, wc.z)] },

  { stage: 'tap', points: [v(wOutletX, wc.y - wu.h / 2, wc.z), v(wOutletX, 0.05, wc.z)] },
  {
    stage: 'tap',
    buried: true,
    points: [
      v(wOutletX, 0.05, 1.0),
      v(KITCHEN.taps.mixer.x, 0.05, -0.9),
      v(KITCHEN.taps.mixer.x, HOUSE.floorY + 0.5, KITCHEN.zBack + 0.16),
    ],
  },
  ...tapLegs(KITCHEN.taps.mixer),
]

// ---------------------------------------------------------------------------
// Under sink
// ---------------------------------------------------------------------------

const us = UNDERSINK_UNIT
const usTop = us.bracketY - 0.06
const usBottom = us.bracketY - us.canisterH - 0.02
const usTankTop = us.floorY + us.tankR * 2 + us.tankLen
const [usC1, usC2, usC3] = us.canisterXs

const undersinkLegs = [
  {
    stage: 'sediment',
    points: [us.supplyValve, v(usC1, us.bracketY + 0.02, us.z), v(usC1, usTop, us.z)],
  },
  { stage: 'sediment', media: true, pace: MEDIA_PACE, points: [v(usC1, usBottom, us.z)] },

  { stage: 'carbon', points: [v(usC2, usBottom, us.z)] },
  { stage: 'carbon', media: true, pace: MEDIA_PACE, points: [v(usC2, usTop, us.z)] },

  { stage: 'ro', points: [v(usC3, usTop, us.z)] },
  { stage: 'ro', media: true, pace: MEDIA_PACE, points: [v(usC3, usBottom, us.z)] },

  // through the pressure tank, where filtered water is held ready for the tap
  {
    stage: 'tap',
    pace: TANK_PACE,
    points: [v(us.tankX, usBottom, us.z), v(us.tankX, usTankTop, us.z)],
  },
  // up the white tubing UnderSinkUnit.jsx models — off the tank, up under the
  // counter, across to the tap. The tubing x-rays with the unit, so no bore.
  {
    stage: 'tap',
    points: [
      v(us.tankX + 0.04, usTankTop + 0.02, us.z - 0.02),
      v(us.tankX + 0.04, KITCHEN.counterY - 0.08, us.z - 0.02),
      v(KITCHEN.taps.filter.x, KITCHEN.counterY - 0.08, KITCHEN.tapZ),
    ],
  },
  ...tapLegs(KITCHEN.taps.filter),
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

/**
 * Out of the tank, up the inlet riser, then down/up/down through the three
 * cartridges before the UV lamp and away down the outlet riser. The middle
 * two cartridges are both the carbon stage, so that stage has two elements.
 */
const rainLegs = [
  {
    stage: 'sediment',
    buried: true,
    points: [v(tank.x - 0.2, 1.3, tank.z + 0.1), v(tank.x - 0.45, 0.3, tank.z - 0.2)],
  },
  {
    stage: 'sediment',
    points: [
      TANK_OUTLET,
      v(rx, 0.15, ru.inletZ),
      v(rx, 0.95, ru.inletZ),
      v(rx, 1.62, ru.inletZ),
      v(rx, 1.62, rZ[0]),
      v(rx, rTop, rZ[0]),
    ],
  },
  { stage: 'sediment', media: true, pace: MEDIA_PACE, points: [v(rx, rBottom, rZ[0])] },

  { stage: 'carbon', points: [v(rx, rBottom, rZ[1])] },
  { stage: 'carbon', media: true, pace: MEDIA_PACE, points: [v(rx, rTop, rZ[1])] },
  { stage: 'carbon', points: [v(rx, rTop, rZ[2])] },
  { stage: 'carbon', media: true, pace: MEDIA_PACE, points: [v(rx, rBottom, rZ[2])] },

  { stage: 'ro', points: [v(rx, rBottom, rUvZ)] },
  { stage: 'ro', media: true, pace: UV_PACE, points: [v(rx, rTop, rUvZ)] },

  {
    stage: 'tap',
    points: [v(rx, 1.62, rUvZ), v(rx, 1.62, ru.outletZ), v(rx, 0.9, ru.outletZ)],
  },
  { stage: 'tap', buried: true, points: [v(rx, -0.05, ru.outletZ)] },
]

// ---------------------------------------------------------------------------

function build({
  key,
  accent,
  view,
  stages,
  legs,
  colours,
  markerOffset,
  markerScale,
  pulseRadius,
  routeRadius,
  laminar,
  cardSide = 1,
  taps,
}) {
  const path = buildPath({ legs, colours })
  return {
    key,
    accent,
    accentColor: new THREE.Color(accent),
    view,
    stages,
    path,
    /**
     * The water's colour after each stage, raw first. The path bakes these
     * into its gradient; they are kept here as well so the play bar can paint
     * the same journey.
     */
    colours,
    /**
     * What each kitchen tap pours while this system is selected: 'route' —
     * the route ends there and WaterFlow draws its water arriving — or a
     * plain stream: the system's 'finished' water if the tap is downstream
     * of the unit, or untreated 'mains'. Both taps always pour; the point is
     * what comes out of each.
     */
    taps,
    /**
     * The taps pouring a plain stream. Each gets a short path of its own,
     * from inside the nozzle down into the sink, in the one colour of what it
     * carries.
     */
    pouring: Object.keys(taps)
      .filter((name) => taps[name] !== 'route')
      .map((name) => {
        const colour = taps[name] === 'mains' ? TAP_WATER : colours[colours.length - 1]
        return {
          name,
          path: buildPath({ legs: tapStreamLegs(KITCHEN.taps[name]), colours: [colour, colour] }),
        }
      }),
    /**
     * Pushes the stage markers clear of the unit they label — out of the
     * cabinet and toward whichever face the camera comes in on.
     */
    markerOffset,
    markerScale,
    /**
     * Radius of the stream of bubbles: how wide the water runs, not how big
     * one bubble is. The under-sink unit is small, so its water is too — and
     * WaterFlow sizes and counts the bubbles off this, so the stream reads the
     * same on all three however fine its gauge.
     */
    pulseRadius,
    /**
     * The guide line tracing the route. Thinner than the narrowest pipe it
     * runs inside, so where real plumbing is modelled the line hides within it
     * and only shows in the gaps: buried runs, and inside the cartridges.
     */
    routeRadius,
    /**
     * Collapse the stream to a tight core across the third stage: turbulent
     * water going in, laminar coming out. Reinforces "balancing" without
     * adding a single entity to the scene.
     */
    laminar,
    /**
     * Which side of its stage the card hangs on, as seen from the camera:
     * 1 for screen right, -1 for screen left. Per system because each unit
     * has open air on a different side of it.
     */
    cardSide,
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
      // "every tap in the house" — pull back to the front of the house, and
      // put the marker on the house itself rather than on the buried run
      // under the slab, which nobody can see.
      tap: {
        focus: v(0.6, 1.1, 1.6),
        radius: 7.5,
        theta: 0.5,
        phi: 1.1,
        // Clear of the eave, above the glazing header, so it reads as a label
        // on the building rather than on any one tap.
        marker: v(0.9, HOUSE.wallH - 0.55, HOUSE.d / 2 + 0.08),
      },
    },
    legs: wholeLegs,
    colours: [0xd98d3c, 0xb9a98a, 0x8fc4e8, 0x2e8fe0],
    markerOffset: v(0, 0, wu.depth / 2 + 0.14),
    markerScale: 1,
    pulseRadius: 0.024,
    routeRadius: 0.011,
    laminar: true,
    // every tap in the house is downstream of the point of entry
    taps: { mixer: 'route', filter: 'finished' },
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
        focus: v(KITCHEN.taps.filter.x + 0.1, KITCHEN.counterY + 0.15, KITCHEN.zBack + 0.25),
        radius: 1.8,
        marker: v(KITCHEN.taps.filter.x, KITCHEN.counterY + 0.2, KITCHEN.zBack + 0.3),
      },
    },
    legs: undersinkLegs,
    colours: [0xc9b08a, 0xb2c4cc, 0x8fd8e6, 0x17b3c6],
    markerOffset: v(0, 0, 0.22),
    markerScale: 0.6,
    pulseRadius: 0.013,
    routeRadius: 0.0055,
    laminar: true,
    // the RO unit feeds its own tap only; the mixer stays on untreated mains
    taps: { filter: 'route', mixer: 'mains' },
  }),

  rain: build({
    key: 'rain',
    accent: 0x2fb872,
    view: { target: v(3.85, 0.9, -0.05), radius: 4.8, theta: 1.72, phi: 1.2 },
    stages: {
      sediment: { focus: v(rx, rc.y, rZ[0]), radius: 2.1 },
      carbon: {
        focus: v(rx, rc.y, rZ[1] - 0.09),
        radius: 2.1,
        // This stage runs through two cartridges, so the middle of its media
        // lands on the crossover between them, up in the gauges. Pin it between
        // the two instead, at the height of the elements themselves.
        marker: v(rx + ru.depth / 2 + 0.14, rc.y, rZ[1] - 0.09),
      },
      ro: { focus: v(rx, rc.y, rUvZ), radius: 2.1 },
      tap: {
        focus: v(rx, 0.6, ru.outletZ),
        radius: 2.4,
        marker: v(rx + 0.3, 0.9, ru.outletZ),
      },
    },
    legs: rainLegs,
    colours: [0x9a9a5e, 0xb4c0a8, 0xa8dcc4, 0x2fb872],
    markerOffset: v(ru.depth / 2 + 0.14, 0, 0),
    markerScale: 0.8,
    pulseRadius: 0.02,
    routeRadius: 0.01,
    // the house runs on tank water: "straight from the tank" at every tap
    taps: { mixer: 'finished', filter: 'finished' },
  }),
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

/**
 * Where a stage's marker hangs in the world: an explicit point if the stage
 * names one, otherwise the middle of that stage's filter element pushed clear
 * of the unit.
 */
export function markerPoint(system, stageKey) {
  const stage = system.stages[stageKey]
  if (stage.marker) return stage.marker.clone()
  return system.path.anchorFor(stageKey).add(system.markerOffset)
}
