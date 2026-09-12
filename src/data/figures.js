/**
 * The headline numbers, and how they are written.
 *
 * Stored as values rather than as finished strings so they can be counted up:
 * there is nothing to interpolate in '3,650'. Prefix and unit travel with the
 * number so the formatting lives in one place and a partly-counted figure
 * reads the same as a finished one.
 */

/** en-AU rather than the host locale: the copy is Australian throughout. */
const NUMBER = new Intl.NumberFormat('en-AU')

export function formatFigure(n, { prefix = '', unit = '' } = {}) {
  const body = NUMBER.format(Math.round(n))
  return prefix + body + (unit ? ' ' + unit : '')
}
