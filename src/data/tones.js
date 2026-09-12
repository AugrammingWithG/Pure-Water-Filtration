/**
 * What the water is carrying, and the colour it is carried in.
 *
 * These mirror the particle colours in three/effects, so a chip on the card
 * matches the thing you can watch being taken out of the water beside it: the
 * brown chip on the sediment stage is the brown of the grains piling up on the
 * media, and the yellow-green on the carbon stage is the colour of the wisps
 * going into the block.
 *
 * Kept here rather than imported from the effects because both card renderers
 * are UI: the canvas card in the scene and the DOM card on small screens draw
 * the same chips and must agree.
 */
export const TONES = {
  /** SedimentCapture BED_COLOR */
  grit: 0x6b5433,
  /** CarbonAbsorption WISP_COLOR */
  chlorine: 0xc2d84e,
  /** MineralBalance ROUGH_COLOR */
  mineral: 0xd6cbb2,
  /** MembraneSplit TDS_COLOR */
  solids: 0xb9c6d4,
  /** UvSterilise ALIVE_COLOR */
  microbe: 0x7f9c4a,
  /** The finished water takes whatever accent the active system runs in. */
  clean: null,
}

/** Resolve a tone, falling back to the system accent for finished water. */
export function toneColour(tone, accent) {
  const colour = TONES[tone]
  return colour == null ? accent : colour
}
