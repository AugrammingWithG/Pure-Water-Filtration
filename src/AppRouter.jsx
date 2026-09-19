import { lazy, Suspense } from 'react'

/**
 * Two pages, one entry. The proposal document (`Proposal`) is now the site:
 * it is what the root URL serves, and it is what every new section ticket
 * builds into. The old marketing site (`Site`) is being replaced section by
 * section and stays reachable at `#/site` until the last thing worth keeping
 * has moved across — the 3D Water Lab, most of all, which PWF-015 still has
 * to find a home for in the proposal. Retiring it is that ticket's call to
 * make, not this router's.
 *
 * Both pages stay lazy-loaded: they share no chrome and no stylesheet, so a
 * proposal visitor — usually opening a link on their phone, from an email —
 * never downloads the marketing chunk.
 *
 * The hash is checked once at boot, not watched: neither page navigates into
 * the other, so there is nothing to react to after mount. `#lab` routes to
 * the site too, because that is the Lab's own deep link and Site opens the
 * viewer straight away when it sees it. Kept out of main.jsx because a
 * component file with only lazy() bindings and no export trips eslint's
 * react-refresh/only-export-components.
 */
const Proposal = lazy(() => import('./proposal/Proposal.jsx'))
const Site = lazy(() => import('./site/Site.jsx'))

export default function AppRouter() {
  const { hash } = window.location
  const isSite = hash.startsWith('#/site') || hash === '#lab'
  return <Suspense fallback={null}>{isSite ? <Site /> : <Proposal />}</Suspense>
}
