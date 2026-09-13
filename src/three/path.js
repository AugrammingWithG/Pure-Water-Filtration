import * as THREE from 'three'

/**
 * The filter path: the route water takes through one system, authored as a
 * chain of legs instead of a flat list of points.
 *
 * A leg is one run of the route — the approach main, the descent through a
 * cartridge, the crossover to the next — tagged with the stage it belongs to
 * and how fast water moves along it. Legs join end to end and each one lists
 * only the points it adds, continuing from wherever the previous leg stopped,
 * so the boundary between two stages is always a real control point of the
 * curve.
 *
 * That is what makes everything downstream exact rather than approximate. A
 * CatmullRomCurve3 puts control point i at curve parameter i/(n-1), so
 * sampling the arc-length table at a multiple of SAMPLES_PER_SEGMENT lands
 * precisely on a control point: each stage's span along the path is measured
 * off the curve rather than found by searching for the sample nearest to a
 * hand-written point.
 *
 * Legs carry four flags the scene reads:
 *   media  — this run passes through a filter element. The water changes
 *            colour across it, and the stage's marker is anchored to it.
 *   pace   — how fast water moves here, relative to an open pipe run. Water
 *            crawls through media and dwells in a pressure tank.
 *   buried — underground or under the floor, so the route is drawn faintly.
 *   bore   — inside radius of opaque pipe this run is hidden in. The stream is
 *            kept within it, so no bubble surfaces through the wall of a tap
 *            that is thinner than the stream.
 */

/** Low tension keeps the corners close to the elbows real plumbing turns. */
const CURVE_TENSION = 0.12
/** Arc-length samples per control-point interval. */
const SAMPLES_PER_SEGMENT = 24
/** Resolution of the pace profile, and of the phase -> distance inverse. */
const PACE_LUT = 1024
const PHASE_LUT = 1024
/**
 * Box blur over the pace profile. Without it water would change speed in one
 * step at the mouth of a cartridge; with it the stream visibly gathers on the
 * way in and stretches out again on the way out.
 */
const PACE_SMOOTH_RADIUS = 3
const PACE_SMOOTH_PASSES = 2
/**
 * How quickly the stream swells back to full width after leaving a bore, in
 * metres of radius per metre of route. At this rate it is done within a few
 * centimetres of the nozzle, without popping the moment it clears the mouth.
 */
const BORE_RELEASE = 0.5

const toVec3 = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(...p))
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** In-place box blur, clamped at the ends. */
function boxBlur(values, radius, passes) {
  const n = values.length
  const scratch = new Float32Array(n)
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < n; i++) {
      let sum = 0
      let count = 0
      for (let k = -radius; k <= radius; k++) {
        const j = i + k
        if (j < 0 || j >= n) continue
        sum += values[j]
        count++
      }
      scratch[i] = sum / count
    }
    values.set(scratch)
  }
}

/**
 * Builds a path from its legs plus the colour the water holds through each
 * stage. `colours` is one entry per stage in leg order, so a four-stage system
 * reads raw -> past stage one -> past stage two -> finished.
 */
export function buildPath({ legs: legDefs, colours }) {
  const points = []
  const legs = []

  for (const def of legDefs) {
    const pts = def.points.map(toVec3)
    if (pts.length === 0) continue
    // Continue from the previous leg's last point; the first leg starts at its own.
    const startIndex = points.length === 0 ? 0 : points.length - 1
    points.push(...pts)
    legs.push({
      stage: def.stage,
      pace: def.pace ?? 1,
      media: def.media === true,
      buried: def.buried === true,
      bore: def.bore ?? Infinity,
      startIndex,
      endIndex: points.length - 1,
    })
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', CURVE_TENSION)

  // Resolve arc length finely, once. getPointAt() reads back this same cached
  // table, so the sampling the scene does every frame agrees exactly with the
  // stage boundaries measured here.
  const divisions = (points.length - 1) * SAMPLES_PER_SEGMENT
  curve.arcLengthDivisions = divisions
  const lengths = curve.getLengths(divisions)
  const length = lengths[divisions]
  const uOf = (index) => lengths[index * SAMPLES_PER_SEGMENT] / length

  for (const leg of legs) {
    leg.u0 = uOf(leg.startIndex)
    leg.u1 = uOf(leg.endIndex)
  }

  // ---- stage spans, in the order the legs introduce them ----
  const stageOrder = []
  const spans = {}
  /** The stretch of path inside each stage's filter element. */
  const mediaSpans = {}
  for (const leg of legs) {
    if (spans[leg.stage]) spans[leg.stage][1] = leg.u1
    else {
      spans[leg.stage] = [leg.u0, leg.u1]
      stageOrder.push(leg.stage)
    }
    if (!leg.media) continue
    if (mediaSpans[leg.stage]) mediaSpans[leg.stage][1] = leg.u1
    else mediaSpans[leg.stage] = [leg.u0, leg.u1]
  }

  // ---- colour ----
  // The ramp sits across the media rather than after it, so a droplet visibly
  // clears while it is working its way through the cartridge instead of
  // changing colour once it is already out the other side.
  const stops = [{ t: 0, c: new THREE.Color(colours[0]) }]
  stageOrder.forEach((stage, i) => {
    const media = mediaSpans[stage]
    if (!media || i + 1 >= colours.length) return
    stops.push({ t: media[0], c: new THREE.Color(colours[i]) })
    stops.push({ t: media[1], c: new THREE.Color(colours[i + 1]) })
  })
  stops.push({ t: 1, c: new THREE.Color(colours[colours.length - 1]) })

  // ---- pace profile ----
  const pace = new Float32Array(PACE_LUT)
  let cursor = 0
  for (let i = 0; i < PACE_LUT; i++) {
    const u = (i + 0.5) / PACE_LUT
    while (cursor < legs.length - 1 && u > legs[cursor].u1) cursor++
    pace[i] = legs[cursor].pace
  }
  boxBlur(pace, PACE_SMOOTH_RADIUS, PACE_SMOOTH_PASSES)

  // ---- bore profile ----
  // The radius the stream may have at each point. Inside a bore it is the
  // bore; past the end of one it opens up gradually rather than all at once,
  // since a bubble is half out of the nozzle before its centre is. A bucket
  // that straddles either end of a bore counts as inside it, so the pipe is
  // never a bucket short at its mouth or its foot.
  const bore = new Float32Array(PACE_LUT)
  let head = 0
  let tail = 0
  for (let i = 0; i < PACE_LUT; i++) {
    while (tail < legs.length - 1 && i / PACE_LUT > legs[tail].u1) tail++
    while (head < legs.length - 1 && (i + 1) / PACE_LUT > legs[head].u1) head++
    bore[i] = Math.min(legs[tail].bore, legs[head].bore)
  }
  const release = (length / PACE_LUT) * BORE_RELEASE
  for (let i = 1; i < PACE_LUT; i++) bore[i] = Math.min(bore[i], bore[i - 1] + release)

  /**
   * Covering du takes du/pace of time, so integrating 1/pace gives the moment
   * a droplet reaches each point. Normalising that and inverting it turns a
   * droplet's phase into a distance: phase becomes a fraction of the trip
   * rather than of the route. Spacing droplets evenly in phase then keeps them
   * evenly spaced in *time* forever — they bunch up where the water slows,
   * stretch out where it runs free, and can never drift into one another.
   *
   * Normalising also means every system takes the same time end to end, however
   * much of its route is slow.
   */
  const arrival = new Float32Array(PACE_LUT + 1)
  for (let i = 0; i < PACE_LUT; i++) {
    arrival[i + 1] = arrival[i] + 1 / (PACE_LUT * pace[i])
  }
  const trip = arrival[PACE_LUT]
  for (let i = 0; i <= PACE_LUT; i++) arrival[i] /= trip

  const distanceLut = new Float32Array(PHASE_LUT + 1)
  let bucket = 0
  for (let j = 0; j <= PHASE_LUT; j++) {
    const tau = j / PHASE_LUT
    while (bucket < PACE_LUT - 1 && arrival[bucket + 1] < tau) bucket++
    const a = arrival[bucket]
    const b = arrival[bucket + 1]
    const local = b > a ? (tau - a) / (b - a) : 0
    distanceLut[j] = clamp01((bucket + local) / PACE_LUT)
  }

  const lutIndex = (u) => Math.min(PACE_LUT - 1, Math.max(0, (u * PACE_LUT) | 0))

  /** Pace at distance `u` along the path, 1 being an open pipe run. */
  const paceAt = (u) => pace[lutIndex(u)]

  /** The most the stream at distance `u` may reach from its centreline. */
  const boreAt = (u) => bore[lutIndex(u)]

  /**
   * How fast water at distance `u` covers the route, as route lengths per
   * trip: the inverse of the normalisation above, so slow routes run faster
   * in their open stretches to finish on time. Multiply by the route length
   * and the trip rate for metres per second.
   */
  const rateAt = (u) => paceAt(u) * trip

  /** How far along the path a droplet has reached at `phase` of its trip. */
  const distanceAt = (phase) => {
    const x = clamp01(phase) * PHASE_LUT
    const i = Math.min(PHASE_LUT - 1, x | 0)
    const f = x - i
    return distanceLut[i] + (distanceLut[i + 1] - distanceLut[i]) * f
  }

  /** The other way round: how far through its trip water at distance `u` is. */
  const phaseAt = (u) => {
    const x = clamp01(u) * PACE_LUT
    const i = Math.min(PACE_LUT - 1, x | 0)
    const f = x - i
    return arrival[i] + (arrival[i + 1] - arrival[i]) * f
  }

  /** Which stage the water is in at distance `u`. */
  const stageAt = (u) => {
    for (const stage of stageOrder) {
      const [a, b] = spans[stage]
      if (u >= a && u <= b) return stage
    }
    return stageOrder[stageOrder.length - 1]
  }

  /**
   * Where a stage's marker hangs: the middle of its filter element, or of the
   * whole stage for one that has no element (the run out to the tap).
   */
  const anchorFor = (stage) => {
    const span = mediaSpans[stage] ?? spans[stage]
    return curve.getPointAt((span[0] + span[1]) / 2)
  }

  return {
    curve,
    legs,
    length,
    stageOrder,
    spans,
    mediaSpans,
    stops,
    paceAt,
    rateAt,
    boreAt,
    distanceAt,
    phaseAt,
    stageAt,
    anchorFor,
  }
}

/**
 * Colour of the water at distance `u` along a path.
 * Writes into `target` to avoid allocating a Color every frame.
 */
export function colorAt(stops, u, target) {
  for (let k = 0; k < stops.length - 1; k++) {
    const a = stops[k]
    const b = stops[k + 1]
    if (u >= a.t && u <= b.t) {
      const local = b.t === a.t ? 0 : (u - a.t) / (b.t - a.t)
      return target.copy(a.c).lerp(b.c, local)
    }
  }
  return target.copy(stops[stops.length - 1].c)
}
