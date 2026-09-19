/**
 * Every in-page proposal link — the logo, the header/bottom-bar ACCEPT,
 * the dot nav — scrolls to a section rather than navigating to `#<id>`.
 *
 * That matters here in a way it wouldn't on an ordinary page: the proposal
 * is only mounted while `location.hash` starts with `#proposal`
 * (src/AppRouter.jsx). A plain `<a href="#accept">` would overwrite that
 * hash with `#accept`; reload, or share that reloaded URL, and the router
 * no longer matches — the visitor lands on the marketing site instead of
 * the proposal they were just looking at. Scrolling in place, with the
 * hash left untouched, is what keeps `#proposal` the address for the
 * whole document.
 */
export function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
