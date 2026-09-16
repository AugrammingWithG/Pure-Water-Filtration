// ============================================================
// Stage / system copy. Nothing here is derived from the 3D scene;
// components read all of their strings from this file. The matching
// geometry (camera views, focus points, water paths) is in three/systems.js.
//
// The wording is the client's own. The whole-house stages come from their
// Whole Home Filtration System Technical Datasheet (V1.0, 2025) — see
// data/datasheet.js for the full sheet. The under-sink and rainwater stages
// come from purewaterfiltration.com.au: the product tiles on the home page,
// each product page, and the two blog posts that walk through a unit stage
// by stage ("How Whole-House Water Filtration Systems Work" and "Reverse
// Osmosis Water Filters Explained"). Where a card needed a sentence trimmed
// to fit, the words are still theirs.
// ============================================================

export const STAGE_ORDER = ['sediment', 'carbon', 'ro', 'tap']

/**
 * Each stage carries `action`, `tone` and `removes` alongside its copy: the
 * verb, which colour the chips take, and what this stage does something about.
 * The chips come from the same pages as the copy — what the client says the
 * stage catches, reduces, removes or destroys, in their words.
 *
 * The verb is per stage rather than a fixed "Removes" because not every stage
 * removes anything — the rainwater UV stage kills bacteria where they are
 * rather than taking them out, and the output stage delivers. A card claiming
 * removal would contradict what the scene is showing at that moment.
 *
 * Tones resolve through data/tones.js to the particle colours in the scene, so
 * a chip matches the thing being taken out of the water beside it.
 */

export const STAGE_DATA_BY_SYSTEM = {
  // datasheet: "How Your System Protects Every Tap", stages 1–3
  whole: {
    sediment: {
      title: 'Sediment & Pre-Filtration',
      desc: 'A 3-layer polypropylene cartridge rated to 1 micron: coarse particles are trapped on the outer layer and finer sediment toward the core, protecting plumbing, appliances and the filters behind it.',
      action: 'Catches',
      tone: 'grit',
      removes: ['Rust', 'Silt & sand', 'Pipe flakes', 'Microplastics'],
    },
    carbon: {
      title: 'Chemical & Metal Filtration',
      desc: 'KDF-55 copper–zinc alloy converts free chlorine into chloride and binds dissolved metals like lead and copper; the coconut carbon block behind it adsorbs chloramines, PFAS, VOCs and pesticides.',
      action: 'Reduces',
      tone: 'chlorine',
      removes: ['Chlorine', 'Chloramines', 'Heavy metals', 'PFAS'],
    },
    // the scene's third stage reshapes a mineral blob rather than removing
    // one — which is what salt-free anti-scale media actually does
    ro: {
      title: 'Scale Reduction & Carbon Polish',
      desc: 'Salt-free anti-scale media turns calcium and magnesium into microscopic crystals that stay suspended instead of sticking to surfaces, and a final coconut carbon layer polishes taste and odour.',
      action: 'Reduces',
      tone: 'mineral',
      removes: ['Limescale', 'Calcium', 'Magnesium'],
    },
    tap: {
      title: 'Every Tap and Shower',
      desc: 'The water you drink, cook with, shower in and wash your clothes in all passes through the same filtration stack first.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Every tap', 'Showers', 'Appliances'],
    },
  },
  // blog: "In a typical under-sink RO unit the water passes through…"
  undersink: {
    sediment: {
      title: 'Sediment Pre-Filter',
      desc: 'A sediment pre-filter catches particulates before the water reaches the carbon filters and the membrane.',
      action: 'Catches',
      tone: 'grit',
      removes: ['Particulates', 'Sediment'],
    },
    carbon: {
      title: 'Carbon Pre-Filter',
      desc: 'Removes chlorine before the water reaches the membrane — chlorine damages the membrane, which is why every RO system needs carbon pre-filters in front of it.',
      action: 'Removes',
      tone: 'chlorine',
      removes: ['Chlorine', 'Chloramines', 'Chemical tastes'],
    },
    ro: {
      title: 'RO Membrane',
      desc: 'Where the heavy lifting happens: water is pushed under pressure through a membrane with pores so small that water molecules pass through but almost nothing else can.',
      action: 'Removes',
      tone: 'solids',
      removes: ['Dissolved solids', 'Lead', 'Nitrates'],
    },
    tap: {
      title: 'Storage Tank and Tap',
      desc: 'A storage tank holds the filtered water ready to use, and a polishing carbon post-filter finishes it on the way to the tap.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Drinking', 'Cooking', 'Coffee and tea'],
    },
  },
  // rainwater page: "UV Filtration That Eliminates What You Can't See" + FAQ
  rain: {
    sediment: {
      title: 'Sediment Filtration',
      desc: 'Leaves, dust, bird droppings and bacteria can all find their way into your tank without you knowing. The sediment filters remove that debris first.',
      action: 'Removes',
      tone: 'grit',
      removes: ['Leaves', 'Dust', 'Debris'],
    },
    carbon: {
      title: 'Multi-Stage Filtration',
      desc: 'Further filter stages treat your tank water thoroughly from top to bottom — every system is tailored to your tank setup, water usage and your family’s needs.',
      action: 'Reduces',
      tone: 'chlorine',
      removes: ['Taste', 'Odour', 'Impurities'],
    },
    ro: {
      title: 'UV Filtration',
      desc: 'UV technology destroys bacteria, pathogens and harmful microorganisms before they reach your taps.',
      action: 'Destroys',
      tone: 'microbe',
      removes: ['Bacteria', 'Pathogens', 'Microorganisms'],
    },
    tap: {
      title: 'Tank-to-Tap Protection',
      desc: 'Every drop from your tank is safe to drink, cook with and bathe in — clean, reliable water you can trust.',
      action: 'Delivers',
      tone: 'clean',
      removes: ['Drinking', 'Cooking', 'Bathing'],
    },
  },
}

export const SITE = 'https://purewaterfiltration.com.au'

/**
 * The site's two calls to action, paired the way it pairs them everywhere:
 * ask for a quote, or ring. The quote form lives on this page at #contact.
 */
export const CTA = {
  quote: { label: 'Instant quote', href: '#contact' },
  phone: { label: '1300 720 031', href: 'tel:1300720031' },
  email: { label: 'admin@purewaterfiltration.com.au', href: 'mailto:admin@purewaterfiltration.com.au' },
  learnMore: 'Learn more',
}

/** The business's contact details, as published on its site. */
export const CONTACT = {
  address: ['34 Welshpool Road', 'Welshpool, WA'],
  mapsUrl: 'https://maps.app.goo.gl/vi7qyCHqfiCL5Ckj9',
  hours: { weekdays: 'Mon – Fri: 8am – 4pm', weekends: 'Closed weekends' },
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61566833481984' },
    { label: 'Instagram', href: 'https://www.instagram.com/purewaterfiltration' },
  ],
}

export const SYSTEM_DATA = {
  whole: {
    title: 'Whole House Water Filter',
    // home page product tile
    subtitle:
      'Treat your water at the point of entry so every tap, shower and appliance in your home delivers filtered water.',
    // blog: "Where the system sits in your plumbing"
    placement:
      'Plumbed into the mains line where the water enters your home — typically near the water meter or against an external wall.',
    /**
     * The figures the client publishes on this product, for the facts card —
     * here from the technical datasheet. Nothing here is a claim they do not
     * make: they publish no spend, savings or bottle counts, so the cards
     * carry none.
     */
    facts: [
      { value: '1 micron', text: 'Sediment cartridge catches rust, silt, sand and pipe flakes' },
      { value: '3 stages', text: 'Sediment, KDF-55 + carbon, scale reduction' },
      { value: '12 months', text: 'Recommended filter change (18 months max)' },
    ],
    learnMore: `${SITE}/blog/how-whole-house-water-filtration-works`,
  },
  undersink: {
    title: 'Under Sink Water Filter',
    // home page product tile
    subtitle:
      'Clean, great tasting drinking water straight from your kitchen tap. No bottled water required.',
    // under-sink page: "Compact Filtration That Fits Right Under Your Bench"
    placement:
      'Sits neatly out of sight under the bench, so you get clean drinking water without losing any bench space.',
    // RO blog + under-sink FAQ
    facts: [
      { value: '95%+', text: 'Lower in dissolved solids than mains water' },
      { value: 'Under 1 hour', text: 'Typical installation' },
      { value: 'Yearly', text: 'Sediment and carbon filter changes' },
    ],
    learnMore: `${SITE}/blog/reverse-osmosis-water-filter-explained`,
  },
  rain: {
    title: 'Rainwater Filtration System',
    // home page product tile
    subtitle:
      'UV filtration that makes your tank water safe to drink, cook with and bathe in every day.',
    // rainwater page hero features + "Every system is tailored to your tank setup…"
    placement:
      'Tank-to-tap protection — every system is tailored to your tank setup, water usage and your family’s needs.',
    // rainwater page + its FAQ
    facts: [
      { value: 'UV', text: 'Destroys bacteria, pathogens and microorganisms' },
      { value: 'Same day', text: 'Clean, filtered rainwater flowing' },
      { value: '6–12 months', text: 'Between filter changes' },
    ],
    learnMore: `${SITE}/services/rainwater`,
  },
}

/**
 * "Why Australian Families Choose Pure Water Filtration" — the site's own
 * reasons, in the site's own words, for the card under the facts.
 */
/**
 * Figures for the three scene cards: annual cost, five-year cost, yearly
 * impact.
 *
 * DELIBERATELY SEPARATE FROM SYSTEM_DATA. Everything in SYSTEM_DATA.facts is
 * a figure the client's own site publishes; none of these are. They were
 * invented for the MVP, CS-0023 removed them for that reason, and they are
 * back at the team's request for the 3D cards.
 *
 * Kept under their own name so the distinction survives: if these ever need
 * to go out in front of a customer, they need real numbers first. Do not fold
 * them back into SYSTEM_DATA.
 */
export const MVP_FIGURES = {
  whole: { before: 1240, after: 610, litres: 185000, bottles: 3650, waste: 61 },
  // drinking and cooking only, so a fraction of the whole-house draw
  undersink: { before: 480, after: 260, litres: 2800, bottles: 1900, waste: 24 },
  rain: { before: 380, after: 340, litres: 96000, bottles: 900, waste: 11 },
}

export const WHY_US = [
  { value: 'Lifetime warranty', text: 'When paired with the Filter Care Plan' },
  { value: '$0 upfront', text: '6 to 36 months interest-free through Humm' },
  { value: 'Tailored to your area', text: 'Your location, household size and water source' },
]

export const STAGE_DOT_LABELS = {
  sediment: 'Sediment',
  carbon: 'Carbon',
  ro: 'RO / UV',
  tap: 'Output',
}

/**
 * Where a system's stage is not the default one, the word the bar shows for
 * it instead: the whole-house unit's third cartridge is scale reduction, the
 * rainwater unit has no carbon stage at all, and the third stage is a
 * membrane for one and a UV lamp for another.
 */
export const STAGE_DOT_OVERRIDES = {
  whole: { ro: 'Scale' },
  undersink: { ro: 'RO' },
  rain: { carbon: 'Multi-stage', ro: 'UV' },
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

/** The bottom-bar label for a stage, with the system's own word where it has one. */
export function dotLabelFor(stageKey, systemKey) {
  return STAGE_DOT_OVERRIDES[systemKey]?.[stageKey] ?? STAGE_DOT_LABELS[stageKey]
}
