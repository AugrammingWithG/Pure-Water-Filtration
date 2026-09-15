import { createContext, useContext } from 'react'

/**
 * The two things any section might need to reach out and do: open the Water
 * Lab, and raise the prototype toast. Both live at the top of <Site>, and the
 * buttons that call them are scattered through the page — hero, water lab,
 * experience section, the phone action bar — so they travel by context rather
 * than through a dozen sections that have no other use for them.
 */
export const SiteContext = createContext({ openViewer: () => {}, showToast: () => {} })

export const useSite = () => useContext(SiteContext)
