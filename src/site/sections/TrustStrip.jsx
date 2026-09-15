const TRUST = [
  { icon: '★', title: '5.0 Google Reviews', note: '5.0 Google rating' },
  { icon: '⌖', title: '50+ Service Areas', note: 'Across Australia' },
  { icon: '✓', title: 'Lifetime Warranty', note: 'On all systems' },
  { icon: '⌂', title: 'Locally Owned', note: 'Australian operated' },
]

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container trust-grid">
        {TRUST.map((item, i) => (
          <div className={`trust reveal${i ? ` delay${i}` : ''}`} key={item.title}>
            <div className="trust-icon">{item.icon}</div>
            <div>
              <strong>{item.title}</strong>
              <span>{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
