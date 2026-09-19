import { lazy, Suspense, useEffect, useState } from 'react'

/**
 * Two pages, one entry. The marketing site (`Site`) and the personalised
 * proposal document (`Proposal`) share no chrome and no stylesheet, so each
 * is lazy-loaded: a marketing visitor never downloads the proposal chunk
 * and a proposal visitor — usually opening a link straight to `#proposal`,
 * on their phone, from an email — never downloads the marketing one.
 *
 * The hash is watched, not just read at boot: setting only the hash on an
 * already-loaded page (typing it into the address bar, or a raw `<a
 * href="#proposal">` elsewhere) is a same-document navigation — no reload,
 * no new request — so a one-time read at mount never sees it change, and
 * the page silently doesn't switch until the visitor manually reloads.
 * `hashchange` is what fires for exactly that case.
 *
 * In-page proposal links (the logo, ACCEPT, the dot nav) scroll rather
 * than navigate — see src/proposal/scroll.js — specifically so the hash
 * never drifts away from `#proposal` in the first place.
 */
const Proposal = lazy(() => import('./proposal/Proposal.jsx'))
const Site = lazy(() => import('./site/Site.jsx'))

const isProposalHash = () => window.location.hash.startsWith('#proposal')

export default function AppRouter() {
  const [isProposal, setIsProposal] = useState(isProposalHash)

  useEffect(() => {
    const onHashChange = () => setIsProposal(isProposalHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return <Suspense fallback={null}>{isProposal ? <Proposal /> : <Site />}</Suspense>
}
