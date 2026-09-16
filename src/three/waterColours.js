/**
 * The water's colour after each stage, raw first, per system. The route in
 * the scene bakes these into its gradient, and the two stage timelines —
 * the Lab's play bar and the page's Lab preview — paint the same journey.
 *
 * Kept apart from systems.js, which imports three: the page's own bundle
 * reads these for the preview's timeline and must stay free of three.js,
 * which only ever arrives on demand (see HeroScene, LabStage).
 */
export const WATER_COLOURS = {
  whole: [0xd98d3c, 0xb9a98a, 0x8fc4e8, 0x2e8fe0],
  undersink: [0xc9b08a, 0xb2c4cc, 0x8fd8e6, 0x17b3c6],
  rain: [0x9a9a5e, 0xb4c0a8, 0xa8dcc4, 0x2fb872],
}
