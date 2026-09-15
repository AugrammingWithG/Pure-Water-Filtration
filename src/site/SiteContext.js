import { createContext, useContext } from 'react'

/**
 * What any section might need to reach out and do: open the Water Lab, raise
 * the prototype toast, or flip one of the two reading aids. All of it lives at
 * the top of <Site>, and the buttons that call it are scattered through the
 * page — hero, water lab, the nav drawer, the phone action bar — so it travels
 * by context rather than through a dozen sections that have no other use for
 * it.
 *
 * `viewerOpen` rides along for the hero's own scene, which stops drawing
 * while the Water Lab is up over it. The reading aids are here because they
 * are offered in two places (the desktop utility pill and the phone menu) and
 * both have to show the same state.
 */
export const SiteContext = createContext({
  openViewer: () => {},
  showToast: () => {},
  viewerOpen: false,
  prefs: { easyRead: false, reducedMotion: false },
  setPref: () => {},
})

export const useSite = () => useContext(SiteContext)
