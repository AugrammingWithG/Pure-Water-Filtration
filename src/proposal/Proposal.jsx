import { useCallback, useMemo, useReducer } from 'react'
import ProposalBottomBar from './chrome/ProposalBottomBar'
import ProposalHeader from './chrome/ProposalHeader'
import SectionDots from './chrome/SectionDots'
import fixture from './data/katie-wells.json'
import { ProposalContext } from './ProposalContext'
import { computeTotals, DEFAULT_PERIOD } from './quote'
import Accept from './sections/Accept'
import Areas from './sections/Areas'
import Benefits from './sections/Benefits'
import Bonus from './sections/Bonus'
import Footer from './sections/Footer'
import Hero from './sections/Hero'
import HowItWorks from './sections/HowItWorks'
import Investment from './sections/Investment'
import News from './sections/News'
import Recommended from './sections/Recommended'
import Reviews from './sections/Reviews'
import Savings from './sections/Savings'
import './styles/proposal.css'

/**
 * The one file that imports the fixture. Every customer string on this
 * page — name, address, phone, price — passes through here into context;
 * no section below imports data/katie-wells.json (or any other fixture)
 * directly. That is what makes "zero customer strings hardcoded" a
 * structural property of the page rather than a rule someone has to
 * remember.
 *
 * Selection state and the Care Plan's billing period live here as a
 * reducer, seeded from the fixture's own `selected` flags — the single
 * source of truth the ticket asks for. `computeTotals` (quote.js) is pure,
 * so the total is recomputed from scratch on every change rather than
 * tracked incrementally.
 */
function reducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return { ...state, selected: { ...state.selected, [action.id]: !state.selected[action.id] } }
    case 'period':
      return { ...state, period: action.period }
    default:
      return state
  }
}

function initState(proposal) {
  const selected = {}
  for (const item of proposal.lineItems) selected[item.id] = item.selected
  return { selected, period: DEFAULT_PERIOD }
}

export default function Proposal() {
  const proposal = fixture
  const [state, dispatch] = useReducer(reducer, proposal, initState)

  const toggle = useCallback((id) => dispatch({ type: 'toggle', id }), [])
  const setPeriod = useCallback((period) => dispatch({ type: 'period', period }), [])

  const items = useMemo(
    () => proposal.lineItems.map((item) => ({ ...item, selected: state.selected[item.id] })),
    [proposal, state.selected],
  )

  const totals = useMemo(() => computeTotals(items, state.period), [items, state.period])

  const value = useMemo(
    () => ({ proposal, items, toggle, period: state.period, setPeriod, totals }),
    [proposal, items, toggle, state.period, setPeriod, totals],
  )

  return (
    <ProposalContext.Provider value={value}>
      <div className="proposal">
        <ProposalHeader />
        <SectionDots />

        <main id="proposal-main">
          <Hero />
          <News />
          <Benefits />
          <HowItWorks />
          <Recommended />
          <Investment />
          <Savings />
          <Reviews />
          <Areas />
          <Bonus />
          <Accept />
        </main>

        <Footer />

        <ProposalBottomBar />
      </div>
    </ProposalContext.Provider>
  )
}
