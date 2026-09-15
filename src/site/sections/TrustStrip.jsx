import { HomeIcon, PinIcon, ShieldIcon, StarIcon } from '../icons'

const TRUST = [
  {
    Icon: StarIcon,
    title: '5.0 Google rating',
    note: 'From verified customer reviews',
  },
  { Icon: PinIcon, title: '50+ service areas', note: 'Across Australia' },
  {
    Icon: ShieldIcon,
    title: 'Lifetime warranty',
    note: 'With the Filter Care Plan',
  },
  { Icon: HomeIcon, title: 'Locally owned', note: 'Australian operated' },
]

export default function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Why customers trust Pure Water">
      <div className="container trust-grid">
        {TRUST.map(({ Icon, title, note }, i) => (
          <div className={`trust reveal${i ? ` delay${i}` : ''}`} key={title}>
            <div className="trust-icon">
              <Icon size={18} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{note}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
