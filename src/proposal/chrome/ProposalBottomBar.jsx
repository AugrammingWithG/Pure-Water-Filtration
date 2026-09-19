import { money } from '../format'
import { useHeroPassed } from '../hooks'
import { useProposal } from '../ProposalContext'

/**
 * The sticky bottom bar: "YOUR TOTAL $x" on the left, ACCEPT PROPOSAL on
 * the right. Hidden over the hero — the hero is the pitch, not the
 * invoice — and slides in from section 2 onward, on the same
 * `useHeroPassed` signal the header uses.
 *
 * The total is the one-off investment only (see quote.js for why the Care
 * Plan's recurring fee is kept out of it); `hasOnRequest` renders as a "+"
 * so a hidden cost is never implied as zero.
 */
export default function ProposalBottomBar() {
  const { totals } = useProposal()
  const visible = useHeroPassed()

  return (
    <div className={`pr-bottom-bar${visible ? ' visible' : ''}`} aria-hidden={!visible}>
      <div className="pr-bottom-bar-inner">
        <div className="pr-bottom-bar-total">
          <span className="pr-bottom-bar-label">Your total</span>
          <span className="pr-bottom-bar-amount">
            {money(totals.total)}
            {totals.hasOnRequest && <span className="pr-bottom-bar-plus">+</span>}
          </span>
        </div>
        <a className="pr-btn" href="#accept" tabIndex={visible ? 0 : -1}>
          Accept proposal
        </a>
      </div>
    </div>
  )
}
