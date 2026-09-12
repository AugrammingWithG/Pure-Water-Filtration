// ============================================================
// Stage / system copy. Nothing here is derived from the 3D scene;
// components read all of their strings from this file. The matching
// geometry (camera views, focus points, water paths) is in three/systems.js.
// ============================================================

export const STAGE_ORDER = ['sediment', 'carbon', 'ro', 'tap']

export const STAGE_DATA_BY_SYSTEM = {
  whole: {
    sediment: {
      title: 'Sediment Pre-Filter',
      desc: 'Reduces sediment before it reaches the rest of the system, so every stage downstream lasts longer.',
    },
    carbon: {
      title: 'Carbon Block',
      desc: 'Reduces chlorine — the taste and smell most people notice first from Australian tap water.',
    },
    ro: {
      title: 'Mineral Balance',
      desc: 'Balances excess minerals so water stays gentle on skin, hair and appliances at every outlet.',
    },
    tap: {
      title: 'Filtered Output',
      desc: 'Every tap, shower and appliance in the house now delivers filtered water.',
    },
  },
  undersink: {
    sediment: {
      title: 'Sediment Pre-Filter',
      desc: 'Pre-filters incoming water before it reaches the drinking-water cartridges.',
    },
    carbon: {
      title: 'Carbon Block',
      desc: 'Removes the chlorine taste and odour that puts most people off Australian tap water.',
    },
    ro: {
      title: 'Reverse Osmosis',
      desc: 'A final membrane clears what the earlier cartridges miss, for great-tasting water on demand.',
    },
    tap: {
      title: 'Drinking Tap',
      desc: 'Clean, filtered drinking water straight from the kitchen tap — no bottled water required.',
    },
  },
  rain: {
    sediment: {
      title: 'Three-Stage Canisters',
      desc: 'Filter out leaf litter, dirt and sediment collected in the tank.',
    },
    carbon: {
      title: 'Carbon Stage',
      desc: 'Clears any taste or odour the tank water has picked up.',
    },
    ro: {
      title: 'UV Sterilisation',
      desc: 'Eliminates the bacteria and pathogens untreated tank water can carry.',
    },
    tap: {
      title: 'Safe Output',
      desc: 'Safe to drink, cook with and bathe in, every day, straight from the tank.',
    },
  },
}

export const SYSTEM_DATA = {
  whole: {
    title: 'Whole-House Water Filter',
    subtitle:
      'A multi-stage unit that treats water where the mains enters the home — reduces sediment, chlorine and excess minerals for every tap.',
    placement:
      'At the point of entry — outside wall, garage or utility cupboard where the main line comes in.',
    before: { value: 1240, prefix: '$' },
    after: { value: 610, prefix: '$' },
    savings: { value: 630, prefix: '$' },
    bottles: { value: 3650 },
    waste: { value: 61, unit: 'kg' },
    litres: { value: 185000, unit: 'L' },
  },
  undersink: {
    title: 'Under-Sink Filter (Reverse Osmosis)',
    subtitle:
      'A drinking-water unit that tucks under the kitchen bench and feeds its own dedicated tap.',
    placement: 'Inside the under-sink cabinet in the kitchen.',
    before: { value: 480, prefix: '$' },
    after: { value: 260, prefix: '$' },
    savings: { value: 220, prefix: '$' },
    bottles: { value: 1900 },
    waste: { value: 24, unit: 'kg' },
    // drinking and cooking only, so a fraction of the whole-house figure
    litres: { value: 2800, unit: 'L' },
  },
  rain: {
    title: 'Rainwater Filtration (UV)',
    subtitle:
      'Three filter canisters plus a UV unit that makes tank water safe to drink.',
    placement: 'Outside by the rainwater tank, or where the tank line enters the house.',
    before: { value: 380, prefix: '$' },
    after: { value: 340, prefix: '$' },
    savings: { value: 40, prefix: '$' },
    bottles: { value: 900 },
    waste: { value: 11, unit: 'kg' },
    litres: { value: 96000, unit: 'L' },
  },
}

/** The "RO" dot is relabelled per system; the other three dots are fixed. */
export const RO_DOT_LABEL = { whole: 'Minerals', undersink: 'RO', rain: 'UV' }

export const STAGE_DOT_LABELS = {
  sediment: 'Sediment',
  carbon: 'Carbon',
  ro: 'RO / UV',
  tap: 'Output',
}

export const SYSTEM_ORDER = ['whole', 'undersink', 'rain']

export const SIDEBAR_LABELS = {
  whole: 'Whole House',
  undersink: 'Under Sink',
  rain: 'Rainwater',
}

export const DEFAULT_SYSTEM = 'whole'
export const DEFAULT_STAGE = 'sediment'

/**
 * How long the walkthrough dwells on each stage. 3.2s is what the legacy
 * prototype's setInterval gave, and it reads well: long enough to take in the
 * detail card, short enough that the tour keeps moving.
 */
export const STAGE_DWELL_MS = 3200

/**
 * Returns the bottom-bar dot label for a stage, swapping in the
 * system-specific wording for the third ("ro") stage.
 */
export function dotLabelFor(stageKey, systemKey) {
  return stageKey === 'ro' ? RO_DOT_LABEL[systemKey] : STAGE_DOT_LABELS[stageKey]
}
