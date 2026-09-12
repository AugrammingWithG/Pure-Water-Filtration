// ============================================================
// Stage / system copy. Nothing here is derived from the 3D scene;
// components read all of their strings from this file. The matching
// geometry (camera views, focus points, water paths) is in three/systems.js.
// ============================================================

export const STAGE_ORDER = ['sediment', 'carbon', 'ro', 'tap']

/**
 * Each stage carries `action`, `tone` and `removes` alongside its copy: the
 * verb, which colour the chips take, and what this stage does something about.
 *
 * The verb is per stage rather than a fixed "Removes" because two stages
 * visibly do not remove anything — the whole-house third stage balances
 * minerals and leaves them in the water, and the rainwater one kills bacteria
 * where they are rather than taking them out. A card claiming removal would
 * contradict what the scene is showing at that moment.
 *
 * Tones resolve through data/tones.js to the particle colours in the scene, so
 * a chip matches the thing being taken out of the water beside it.
 */

export const STAGE_DATA_BY_SYSTEM = {
  whole: {
    sediment: {
      title: 'Sediment Pre-Filter',
      desc: 'Reduces sediment before it reaches the rest of the system, so every stage downstream lasts longer.',
      action: 'Removes',
      tone: 'grit',
      removes: ['Sand', 'Silt', 'Rust'],
    },
    carbon: {
      title: 'Carbon Block',
      desc: 'Reduces chlorine — the taste and smell most people notice first from Australian tap water.',
      action: 'Reduces',
      tone: 'chlorine',
      removes: ['Chlorine', 'Taste', 'Odour'],
    },
    ro: {
      title: 'Mineral Balance',
      desc: 'Balances excess minerals so water stays gentle on skin, hair and appliances at every outlet.',
      action: 'Balances',
      tone: 'mineral',
      removes: ['Calcium', 'Magnesium', 'Scale'],
    },
    tap: {
      title: 'Filtered Output',
      desc: 'Every tap, shower and appliance in the house now delivers filtered water.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Every tap', 'Showers', 'Appliances'],
    },
  },
  undersink: {
    sediment: {
      title: 'Sediment Pre-Filter',
      desc: 'Pre-filters incoming water before it reaches the drinking-water cartridges.',
      action: 'Removes',
      tone: 'grit',
      removes: ['Sand', 'Silt', 'Sediment'],
    },
    carbon: {
      title: 'Carbon Block',
      desc: 'Removes the chlorine taste and odour that puts most people off Australian tap water.',
      action: 'Reduces',
      tone: 'chlorine',
      removes: ['Chlorine', 'Taste', 'Odour'],
    },
    ro: {
      title: 'Reverse Osmosis',
      desc: 'A final membrane clears what the earlier cartridges miss, for great-tasting water on demand.',
      action: 'Removes',
      tone: 'solids',
      removes: ['Dissolved solids', 'Lead', 'Nitrates'],
    },
    tap: {
      title: 'Drinking Tap',
      desc: 'Clean, filtered drinking water straight from the kitchen tap — no bottled water required.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Drinking', 'Cooking', 'Ice'],
    },
  },
  rain: {
    sediment: {
      title: 'Three-Stage Canisters',
      desc: 'Filter out leaf litter, dirt and sediment collected in the tank.',
      action: 'Removes',
      tone: 'grit',
      removes: ['Leaf litter', 'Dirt', 'Grit'],
    },
    carbon: {
      title: 'Carbon Stage',
      desc: 'Clears any taste or odour the tank water has picked up.',
      action: 'Reduces',
      tone: 'chlorine',
      removes: ['Taste', 'Odour', 'Colour'],
    },
    ro: {
      title: 'UV Sterilisation',
      desc: 'Eliminates the bacteria and pathogens untreated tank water can carry.',
      action: 'Neutralises',
      tone: 'microbe',
      removes: ['Bacteria', 'Protozoa', 'Viruses'],
    },
    tap: {
      title: 'Safe Output',
      desc: 'Safe to drink, cook with and bathe in, every day, straight from the tank.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Drinking', 'Cooking', 'Bathing'],
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
    before: '$1,240',
    after: '$610',
    savings: '$630',
    bottles: '3,650',
    waste: '61 kg',
  },
  undersink: {
    title: 'Under-Sink Filter (Reverse Osmosis)',
    subtitle:
      'A drinking-water unit that tucks under the kitchen bench and feeds its own dedicated tap.',
    placement: 'Inside the under-sink cabinet in the kitchen.',
    before: '$480',
    after: '$260',
    savings: '$220',
    bottles: '1,900',
    waste: '24 kg',
  },
  rain: {
    title: 'Rainwater Filtration (UV)',
    subtitle:
      'Three filter canisters plus a UV unit that makes tank water safe to drink.',
    placement: 'Outside by the rainwater tank, or where the tank line enters the house.',
    before: '$380',
    after: '$340',
    savings: '$40',
    bottles: '900',
    waste: '11 kg',
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
