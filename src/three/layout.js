import * as THREE from 'three'

/**
 * Where everything sits in the world. All dimensions in scene units
 * (roughly metres). The house is centred on the origin, front face toward +z,
 * long axis along x, ridge along x. Products, camera views and water paths
 * (systems.js) are all derived from the numbers here.
 */

/** The circular plinth the whole diorama sits on. */
export const GROUND = { radius: 7.4 }

export const HOUSE = {
  w: 6.4, // along x
  d: 3.4, // along z
  wallH: 2.25,
  ridgeH: 3.55,
  overhang: 0.28, // roof past the walls, all sides
  wallT: 0.12, // wall thickness
  floorY: 0.18, // interior floor level
}

/** Timber deck along the front, with a step at the right-hand end. */
export const DECK = {
  x0: -1.85,
  x1: 3.5,
  z0: HOUSE.d / 2,
  z1: HOUSE.d / 2 + 1.25,
  h: 0.18,
}

/** The solid section of the front wall; glazing runs from here to the corner. */
export const FRONT_SOLID_X1 = -1.7

/** Whole-house cabinet: on the front wall, left of the deck, at the point of entry. */
export const WHOLE_UNIT = {
  center: new THREE.Vector3(-2.5, 1.02, HOUSE.d / 2 + 0.16),
  w: 0.84,
  h: 1.0,
  depth: 0.3,
  /** Inlet riser runs up just clear of the cabinet's right edge. */
  riserX: -1.95,
  /** Three canisters inside, laid out left to right. Flow enters at the right. */
  canisterOffsets: [0.25, 0, -0.25],
  /** Cartridge radius — the stage effects size themselves off this too. */
  canisterRadius: 0.09,
}

/** Street water meter the mains arrives from. */
export const STREET_METER = new THREE.Vector3(-5.0, 0.06, 3.9)

/**
 * Gravel path from the edge of the plinth past the meter to the point of
 * entry beside the deck. The buried mains runs under it, so the water pulses
 * stay visible instead of disappearing into the grass. Points are [x, z]; the
 * first one is deliberately past the rim and gets clamped to it.
 */
export const PATH = {
  points: [
    [-6.2, 4.45],
    [-5.0, 3.9],
    [-3.5, 3.25],
    [-2.3, 2.45],
    [-1.95, 1.75],
  ],
  halfWidth: 0.6,
}

/** Stepping stones set into the path, [x, z]. */
export const STEPPING_STONES = [
  [-2.35, 2.85],
  [-2.9, 3.15],
  [-3.45, 3.45],
]

/** Kitchen run along the inside of the back wall. */
export const KITCHEN = {
  x0: -0.6,
  x1: 2.6,
  benchH: 0.9,
  depth: 0.6,
  /** back face of the cabinets sits on the interior wall lining */
  zBack: -HOUSE.d / 2 + HOUSE.wallT + 0.02,
  sinkCabinet: { x0: 0.85, x1: 1.75 },
  sinkX: 1.3,
  /** dedicated filtered-water tap sits left of the mixer */
  filterTapX: 1.12,
  mixerTapX: 1.42,
}
KITCHEN.zFront = KITCHEN.zBack + KITCHEN.depth
KITCHEN.counterY = HOUSE.floorY + KITCHEN.benchH

/** Under-sink RO unit lives in the sink cabinet. */
export const UNDERSINK_UNIT = {
  floorY: HOUSE.floorY + 0.02,
  z: KITCHEN.zBack + 0.22,
  /** flow enters from the wall valve at the right, so the first stage is the right-most canister */
  canisterXs: [1.62, 1.42, 1.22],
  canisterR: 0.085,
  canisterH: 0.4,
  bracketY: HOUSE.floorY + 0.02 + 0.56,
  tankX: 0.98,
  tankR: 0.14,
  supplyValve: new THREE.Vector3(1.7, HOUSE.floorY + 0.42, KITCHEN.zBack + 0.05),
}

/** Rainwater tank, front-right of the house beside the deck step. */
export const RAIN_TANK = {
  center: new THREE.Vector3(4.7, 0, 1.05),
  r: 0.72,
  h: 1.65,
}

/** Stainless rainwater unit on the right gable wall (+x face). */
export const RAIN_UNIT = {
  center: new THREE.Vector3(HOUSE.w / 2 + 0.16, 1.0, -0.6),
  w: 0.84, // along z
  h: 1.0,
  depth: 0.3, // along x
  /** pipes and internals sit at this x, a little proud of the wall */
  pipeX: HOUSE.w / 2 + 0.14,
  /** three canisters then the UV tube, +z to -z, in flow order */
  canisterOffsets: [0.27, 0.09, -0.09],
  uvOffset: -0.27,
  inletZ: -0.6 + 0.57,
  outletZ: -0.6 - 0.57,
}

/** Where the flue pokes through the back roof slab. */
export const CHIMNEY = { x: 2.3, z: -0.55, r: 0.07, top: 4.15 }

/**
 * Directions the two main lights come from, shared by the direct rig
 * (Lighting.jsx) and the studio bake it reflects (SceneEnvironment.jsx) so
 * highlights on metal and glass line up with the shadows. Set for the home
 * view, which looks in from the front-right: key sun from the front-left,
 * rim from behind-right.
 */
export const LIGHTS = {
  key: new THREE.Vector3(-7, 8, 9),
  rim: new THREE.Vector3(5, 5, -9),
}
