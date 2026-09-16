// ============================================================
// The Whole Home Filtration System technical datasheet, as data.
//
// Source: "Whole Home Filtration System — Technical Datasheet",
// Pure Water Filtration, version reference DATASHEET V1.0 – 2025.
// Every value here is copied from that document; nothing is rounded,
// inferred or filled in. If the sheet is revised, revise this file.
// ============================================================

export const DATASHEET_VERSION = 'Datasheet V1.0 – 2025'

export const MODEL = 'FHWR-3S1-20'

/** "How Your System Protects Every Tap" — the three cartridges. */
export const STAGES = [
  {
    n: '01',
    title: 'Sediment & pre-filtration',
    removes: 'Sediment, rust, silt, sand, pipe flakes, microplastics',
    filter: '3-layer polypropylene sediment cartridge (1-micron)',
    note: 'Protects plumbing and appliances; food-grade materials',
    specs: [
      ['Micron rating', '1 µm nominal'],
      ['Flow rate', 'Up to 60 L/min'],
      ['Service life', '12 – 18 months'],
      ['Compliance', 'AS/NZS 4020'],
    ],
  },
  {
    n: '02',
    title: 'Advanced chemical & metal filtration',
    removes: 'Chlorine, chloramines, PFAS, THMs, VOCs, heavy metals, pesticides, odours',
    filter: 'KDF-55 + coconut carbon block',
    note: 'Improves taste and smell, reduces skin irritation',
    specs: [
      ['Micron rating', '1 – 5 µm nominal'],
      ['Flow rate', 'Up to 55 L/min'],
      ['Service life', '12 – 18 months'],
      ['Certification', 'NSF/ANSI 42'],
    ],
  },
  {
    n: '03',
    title: 'Scale reduction & carbon polishing',
    removes: 'Calcium, magnesium, limescale buildup',
    filter: 'Limescale reduction media + coconut carbon',
    note: 'Extends appliance life, keeps tapware cleaner',
    specs: [
      ['Micron rating', '1 – 5 µm nominal'],
      ['Flow rate', 'Up to 55 L/min'],
      ['Service life', '12 – 18 months'],
      ['Certification', 'NSF/ANSI 42'],
    ],
  },
]

/** "Technical Specifications" table. */
export const SPECS = [
  ['Model', MODEL],
  ['Dimensions', '74 cm (H) × 59 cm (W) × 21 cm (D)'],
  ['Water pressure', '0.1 – 0.6 MPa'],
  ['Flow rate', '50 – 60 L/min'],
  ['Operating temperature', '5 °C – 35 °C'],
  ['Max water volume', '300,000 L'],
  ['Filtration accuracy', 'Up to 1 micron'],
  ['Material', 'Food-grade plastics and stainless steel'],
  ['Filter lifespan', 'Up to 18 months (recommended 12 months)'],
]

/** "System Components" table. */
export const COMPONENTS = [
  ['Housings', 'Full-sized 20″ × 4.5″ food-grade housings with double O-ring seal'],
  ['Frame & cover', '304 stainless-steel frame and UV-protected cover; anti-corrosion design'],
  ['Connectors', 'Brass fittings for durability and pressure resistance'],
  ['Pressure gauges', 'Stainless-steel and glass gauges with UV protection'],
  ['Mounting', 'Ground-mounted with optional back cover'],
]

/** "Filter Replacement Schedule" — the same for all three stages. */
export const REPLACEMENT = { recommended: 'Every 12 months', max: '18 months' }

/** "Certifications & Warranty" and "Installation & Support". */
export const ASSURANCES = [
  { title: 'Lifetime workmanship warranty', note: 'With the Filter Care Plan' },
  { title: '72-hour fix or replace', note: 'Guarantee' },
  { title: 'AS/NZS standards', note: 'Materials comply for potable water components' },
  { title: 'Qualified local technicians', note: 'Install every system' },
]
