/**
 * Deterministic PRNG (mulberry32) so scattered things — the lawn, the tree
 * tiers — land in the same place on every load. Returns a function that
 * yields floats in [0, 1).
 */
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
