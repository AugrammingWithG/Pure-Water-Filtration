import logo from '../../site/assets/brand/logo-white.svg'
import { useHeroPassed } from '../hooks'
import { useProposal } from '../ProposalContext'
import { scrollToSection } from '../scroll'

/**
 * The sticky header: logo, "Prepared for {customer}", phone, an ACCEPT
 * pill. Transparent over the hero so the hero art reads full-bleed; solid
 * from the moment the hero is passed, driven by the same `useHeroPassed`
 * signal the bottom bar uses, so the two never disagree about where the
 * hero ends.
 *
 * The logo and the ACCEPT pill scroll rather than navigate — see
 * src/proposal/scroll.js for why that isn't optional here.
 */
export default function ProposalHeader() {
  const { proposal } = useProposal()
  const solid = useHeroPassed()

  if (!proposal) return null

  const goTo = (id) => (e) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <header className={`pr-header${solid ? ' solid' : ''}`}>
      <div className="pr-header-inner">
        <a className="pr-logo" href="#hero" onClick={goTo('hero')} aria-label="Pure Water Filtration">
          <img src={logo} alt="" width="180" height="65" />
        </a>
        <div className="pr-header-mid">
          <span className="pr-prepared-for">
            Prepared for <strong>{proposal.customer.name}</strong>
          </span>
        </div>
        <div className="pr-header-actions">
          <a className="pr-phone" href={`tel:${proposal.specialist.phone.replace(/\s+/g, '')}`}>
            {proposal.specialist.phone}
          </a>
          <a className="pr-pill" href="#accept" onClick={goTo('accept')}>
            Accept
          </a>
        </div>
      </div>
    </header>
  )
}
