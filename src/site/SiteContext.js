import { createContext, useContext } from 'react'

/**
 * What any section might need to reach out and do: open the Water Lab, send
 * the visitor to the quote form with a question already answered, or flip
 * one of the two reading aids. All of it lives at the top of <Site>, and the
 * buttons that call it are scattered through the page — hero, water lab,
 * the nav drawer, the phone action bar — so it travels by context rather
 * than through a dozen sections that have no other use for it.
 *
 * `openQuote({ service, intent })` scrolls to #contact and hands the form a
 * prefill; `quotePrefill` is what the form reads. `viewerOpen` rides along
 * for the hero's own scene, which stops drawing while the Water Lab is up
 * over it. The reading aids are here because they are offered in two places
 * (the desktop utility pill and the phone menu) and both have to show the
 * same state.
 */
export const SiteContext = createContext({
  openViewer: () => {},
  openQuote: () => {},
  quotePrefill: null,
  viewerOpen: false,
  prefs: { easyRead: false, reducedMotion: false },
  setPref: () => {},
})

export const useSite = () => useContext(SiteContext)
