export default function Guide() {
  return (
    <section className="section guide">
      <div className="container split">
        <div className="guide-card reveal">
          <div className="guide-cover">
            <div className="eyebrow" style={{ color: '#8de7ff' }}>
              Free Guide
            </div>
            <h3>
              Water Filtration
              <br />
              Pricing Guide
            </h3>
            <p style={{ color: '#d9f4ff', fontSize: '11px' }}>For Aussie Homes</p>
          </div>
        </div>
        <div className="guide-copy reveal delay2">
          <div className="eyebrow">Free Resource</div>
          <h2>Know what to expect before you choose a system.</h2>
          <p>
            Our free Water Filtration Pricing Guide explains which system may suit your home, what
            Australian homeowners can expect to pay, and what's worth knowing before you decide.
          </p>
          <p>
            ✓ Which system suits your home and water type
            <br />✓ What the lifetime warranty covers
            <br />✓ How Filter Care keeps costs predictable
          </p>
          <a className="btn" href="#contact">
            Download Free Guide →
          </a>
        </div>
      </div>
    </section>
  )
}
