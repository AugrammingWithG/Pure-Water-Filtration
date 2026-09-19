import { createContext, useContext } from 'react'

/**
 * The proposal's single source of truth: the fixture itself, which line
 * items are selected, the Care Plan's billing period, and the total that
 * follows from both. Every section reads this instead of importing the
 * fixture directly — see Proposal.jsx, which is the only file that does —
 * so there is exactly one place a customer's name, address or price can
 * enter the page.
 *
 * Split from the provider for the same reason src/site/SiteContext.js is
 * split from Site.jsx: eslint's react-refresh/only-export-components rule
 * wants a component file to export only components.
 */
export const ProposalContext = createContext({
  proposal: null,
  items: [],
  toggle: () => {},
  period: 'monthly',
  setPeriod: () => {},
  totals: { total: 0, savings: 0, carePlan: null, hasOnRequest: false },
})

export const useProposal = () => useContext(ProposalContext)
