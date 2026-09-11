// ============================================================
// Stage / system copy — ported verbatim from the legacy prototype
// (legacy/filtration-simulation.html). Nothing here is derived from
// the 3D scene; components read all of their strings from this file.
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
    title: 'Whole-house filtration',
    subtitle:
      'Sits on the main line where water enters — every tap in the house runs through it.',
    before: '$1,240',
    after: '$610',
    savings: '$630',
    bottles: '3,650',
    waste: '61 kg',
  },
  undersink: {
    title: 'Under-sink filtration',
    subtitle:
      'Fits beneath the kitchen sink and treats water right before it reaches the tap.',
    before: '$480',
    after: '$260',
    savings: '$220',
    bottles: '1,900',
    waste: '24 kg',
  },
  rain: {
    title: 'Rainwater filtration',
    subtitle:
      'UV treatment for tank water, making every drop safe to drink, cook and bathe with.',
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
  rain: 'Rain Water',
}

export const DEFAULT_SYSTEM = 'whole'
export const DEFAULT_STAGE = 'carbon'

/** Autoplay advances one stage every 3.2s, matching the legacy setInterval. */
export const AUTOPLAY_INTERVAL_MS = 3200

/**
 * Returns the bottom-bar dot label for a stage, swapping in the
 * system-specific wording for the third ("ro") stage.
 */
export function dotLabelFor(stageKey, systemKey) {
  return stageKey === 'ro' ? RO_DOT_LABEL[systemKey] : STAGE_DOT_LABELS[stageKey]
}
