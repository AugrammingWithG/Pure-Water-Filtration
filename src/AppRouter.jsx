import { lazy, Suspense } from 'react'

/**
 * Two pages, one entry. The marketing site (`Site`) and the personalised
 * proposal document (`Proposal`) share no chrome and no stylesheet, so each
 * is lazy-loaded: a marketing visitor never downloads the proposal chunk
 * and a proposal visitor — usually opening a link straight to `#/proposal`,
 * on their phone, from an email — never downloads the marketing one.
 *
 * The hash is checked once at boot, not watched: neither page navigates
 * into the other, so there is nothing to react to after mount. Kept out of
 * main.jsx because a component file with only lazy() bindings and no
 * export trips eslint's react-refresh/only-export-components.
 */
const Proposal = lazy(() => import('./proposal/Proposal.jsx'))
const Site = lazy(() => import('./site/Site.jsx'))

export default function AppRouter() {
  const isProposal = window.location.hash.startsWith('#/proposal')
  return <Suspense fallback={null}>{isProposal ? <Proposal /> : <Site />}</Suspense>
}
