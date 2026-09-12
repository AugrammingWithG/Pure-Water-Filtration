import { useSyncExternalStore } from 'react'

/**
 * Rendering quality, as a small set of tiers the scene steps down through
 * when a device cannot keep up. Every knob is one that can change while the
 * scene is running, without rebuilding anything:
 *
 *  - foliage: fraction of the lawn's blades and the pines' needles drawn.
 *    The instances are laid down in random order, so drawing the first n is
 *    a uniform thinning, and it is only `mesh.count` that changes.
 *  - dpr: cap on the device pixel ratio. The scene is fill-rate bound, so
 *    cost scales with pixels; 1.5 → 1 is a 2.25× drop in fragment work.
 *  - shadowMap: side of the sun's shadow map. Barely matters on a desktop
 *    GPU, but a 2048² depth target is 16 MB written and read every frame on
 *    a tile-based mobile one.
 *
 * Measured on an Intel UHD at 1356×704: full ≈ 32 ms a frame, reduced ≈ 23,
 * low ≈ 20, of which about 14 is everything that isn't foliage — so the
 * tiers can only ever buy back the foliage's share, and low keeps a third of
 * it rather than a quarter because the last few blades cost little and the
 * lawn reads as bare without them.
 */
export const TIERS = [
  { name: 'full', foliage: 1, dpr: 1.5, shadowMap: 2048 },
  { name: 'reduced', foliage: 0.5, dpr: 1.25, shadowMap: 2048 },
  { name: 'low', foliage: 0.35, dpr: 1, shadowMap: 1024 },
]

/**
 * Phones start one tier down. Even a fast one is a fraction of a laptop
 * GPU, and the opening seconds — the fly-in, the first look — are the ones
 * the governor has not had time to measure yet. Tablets and laptops with
 * touchscreens are wide enough to be left at full and measured.
 */
function initialTier() {
  if (typeof window === 'undefined' || !window.matchMedia) return 0
  const phone =
    window.matchMedia('(pointer: coarse)').matches &&
    window.matchMedia('(max-width: 900px)').matches
  return phone ? 1 : 0
}

let tier = initialTier()
const listeners = new Set()

export function getQuality() {
  return TIERS[tier]
}

export function subscribeQuality(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** One tier down, if there is one. Returns whether anything changed. */
export function lowerQuality() {
  if (tier >= TIERS.length - 1) return false
  tier++
  for (const listener of listeners) listener()
  return true
}

/** The current tier, for components inside and outside the canvas alike. */
export function useQuality() {
  return useSyncExternalStore(subscribeQuality, getQuality)
}
