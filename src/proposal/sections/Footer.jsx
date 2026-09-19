import { CONTACT, CTA, SITE } from '../../data/constants'
import logo from '../../site/assets/brand/logo-white.svg'
import { useProposal } from '../ProposalContext'

/**
 * The proposal's last page: the same business facts the marketing site's
 * own footer carries (src/site/sections/SiteFooter.jsx) — phone, email,
 * head office — reused rather than re-typed, because they are the
 * company's facts, not this customer's. The one column that IS
 * customer-specific is "Your specialist", which comes from the fixture
 * like everything else on this page.
 *
 * The ABN has no home in src/data/constants.js yet, so it stays local
 * here rather than pulling this ticket into editing a marketing-site
 * data file for one new field.
 */
const ABN = '98 681 184 798'

export default function Footer() {
  const { proposal } = useProposal()
  if (!proposal) return null

  return (
    <footer id="footer" className="pr-section band-navy pr-footer" aria-labelledby="footer-h">
      <div className="pr-wrap pr-footer-grid">
        <div className="pr-footer-brand">
          <img src={logo} alt="Pure Water Filtration" width="180" height="65" />
          <p>Australia's trusted water filtration specialists. Softer skin and hair from every tap.</p>
        </div>

        <div className="pr-footer-col">
          <h3 id="footer-h">Contact</h3>
          <a href={CTA.phone.href}>{CTA.phone.label}</a>
          <a href={CTA.email.href}>{CTA.email.label}</a>
          <a href={SITE} target="_blank" rel="noopener">
            {SITE.replace('https://', '')}
          </a>
        </div>

        <div className="pr-footer-col">
          <h3>Head office</h3>
          <p>
            {CONTACT.address[0]}
            <br />
            {CONTACT.address[1]}
          </p>
          <p>ABN {ABN}</p>
        </div>

        <div className="pr-footer-col">
          <h3>Your specialist</h3>
          <p>
            <strong>{proposal.specialist.name}</strong>
            <br />
            {proposal.specialist.email}
          </p>
        </div>
      </div>

      <div className="pr-wrap pr-footer-bottom">
        <span>© {new Date(proposal.preparedOn).getFullYear()} Pure Water Filtration Pty Ltd. All rights reserved.</span>
        <span>Proposal reference {proposal.ref}</span>
      </div>
    </footer>
  )
}
