/**
 * Money and date formatting, `en-AU` throughout — the same locale the
 * marketing site's StatsCard already uses for its counters
 * (src/components/StatsCard.jsx). Kept as one small module so every
 * section formats a dollar figure or a date the same way, instead of each
 * one rolling its own `toLocaleString` call.
 */

/** @param {number} n */
export const money = (n) => '$' + Math.round(n).toLocaleString('en-AU')

/** @param {string} isoDate e.g. "2026-09-19" */
export const date = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
