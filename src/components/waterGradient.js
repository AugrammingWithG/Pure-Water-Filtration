/**
 * How much of each stage's stretch of the bar holds the colour the water
 * arrived with before it starts clearing: the run of pipe into the cartridge.
 */
const APPROACH = 0.4

/**
 * The bar's colours follow the water's — one per stage, raw first, the same
 * list the route itself is painted with — so the bar is the journey in
 * miniature: it holds each colour on the way in, then clears across the
 * stage. The last stage has nothing left to clear, so its colour runs out.
 */
export function waterGradient(colours) {
  const n = colours.length
  const stops = colours.flatMap((c, i) => {
    const hex = `#${c.toString(16).padStart(6, '0')}`
    const start = (i / n) * 100
    const hold = start + (100 / n) * APPROACH
    return [`${hex} ${start}%`, `${hex} ${hold}%`]
  })
  return `linear-gradient(90deg, ${stops.join(', ')})`
}
