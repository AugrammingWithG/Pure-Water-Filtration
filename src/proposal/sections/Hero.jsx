import { date } from '../format'
import { useProposal } from '../ProposalContext'

/**
 * The proposal's opener. The reference is a full-bleed photo with the copy
 * sitting over it in a single column — not the two-column grid this file
 * used to have, which was built before the reference screenshots existed.
 * There is no 3D house slot: PWF-015 decides where that lands and adds it
 * to whichever section it lands in.
 *
 * Every value on the page comes from the fixture; nothing here is written
 * for Katie Wells specifically. The photo background, trust pills and CTAs
 * visible in the reference are the hero content ticket's, not this shell's.
 */
export default function Hero() {
  const { proposal } = useProposal()
  if (!proposal) return null

  const { customer, specialist, ref, headline, preparedOn, heldUntil } = proposal

  return (
    <section id="hero" className="pr-section pr-hero band-navy" aria-labelledby="hero-h">
      <div className="pr-wrap pr-hero-copy">
        <span className="pr-eyebrow">Proposal prepared for {customer.name}</span>
        <h1 id="hero-h">{headline}</h1>
        <p className="pr-hero-lead">
          A filtration system matched to the water at {customer.address}, {customer.suburb}.
        </p>
        <dl className="pr-hero-meta">
          <div>
            <dt>Your water specialist</dt>
            <dd>{specialist.name}</dd>
          </div>
          <div>
            <dt>Prepared</dt>
            <dd>{date(preparedOn)}</dd>
          </div>
          <div>
            <dt>Held until</dt>
            <dd>{date(heldUntil)}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{ref}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
