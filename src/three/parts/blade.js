import * as THREE from 'three'

/**
 * What the lawn (Grass.jsx) and the pines' needles (Trees.jsx) share: the
 * one blade they're both built from, and the wind that moves them, so the
 * same gust fronts roll from the grass up into the trees.
 */

/**
 * One blade: three tapered segments and a tip, 7 vertices. Unit-sized —
 * x spans -0.5..0.5, y 0..1 — the shader scales it per instance. It curls
 * forward a little along +z so blades don't all stand ramrod straight.
 * Normals point mostly up so the lawn shades as a surface rather than as
 * thousands of individually lit cards.
 */
export function makeBladeGeometry() {
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

/**
 * The wind over the plinth. Expects `root` (world xz), `wt` (time) and
 * `uWindDir` in scope; leaves `along`, `gust` (0..1, squared so the fronts
 * are peaky) and `swell` (a broad, slow heave underneath) for the caller.
 * Sampled at the root so neighbours move together.
 */
export const WIND_FIELD = /* glsl */ `
  float along = dot(root, uWindDir);
  float across = dot(root, vec2(-uWindDir.y, uWindDir.x));
  // gust fronts rolling downwind, wavering sideways as they go
  float gust = 0.5 + 0.5 * sin(along * 0.9 - wt * 1.8 + 1.4 * sin(across * 0.5 + wt * 0.4));
  gust *= gust;
  // a broader, slower swell underneath
  float swell = 0.5 + 0.5 * sin(along * 0.35 - wt * 0.7 + across * 0.25);
`
