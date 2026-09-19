/**
 * The proposal's sections, in the order they scroll — the single list the
 * dot nav, the scroll-spy observer and each section stub's `id` all agree
 * with, the way src/site/navLinks.js is the one list the marketing nav and
 * its scroll rail both read. Renaming or reordering a section is a
 * one-line change here; nothing else needs to know.
 *
 * Frozen against the reference screenshots (PWF-001 revision): 11 scrolling
 * sections plus the footer, which gets a dot like everything else — a
 * proposal doesn't have a "below the fold, nobody scrolls there" footer,
 * it has a last page.
 */
export const SECTIONS = [
  ['hero', 'Overview'],
  ['news', 'Why filter'],
  ['benefits', 'What changes'],
  ['how-it-works', 'Three stages'],
  ['recommended', 'Your setup'],
  ['investment', 'What it costs'],
  ['savings', 'Your numbers'],
  ['reviews', 'Reviews'],
  ['areas', 'Service areas'],
  ['bonus', 'Your bonus'],
  ['accept', 'Accept'],
  ['footer', 'Contact'],
]
