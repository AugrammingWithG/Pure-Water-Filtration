import { useSite } from '../SiteContext'

export default function FinalCta() {
  const { showToast } = useSite()
  return (
    <section className="section final-cta" id="contact">
      <div className="container split">
        <div className="reveal">
          <div className="eyebrow">Cleaner Water. Healthier Living.</div>
          <h2>Ready to feel the difference in your water?</h2>
          <p>Cleaner water. Healthier home. A better everyday experience.</p>
        </div>
        <div className="hero-actions reveal delay2" style={{ justifyContent: 'flex-end' }}>
          <a className="btn" href="tel:1300720031">
            Instant Quote →
          </a>
          <button className="btn outline" onClick={showToast}>
            Download Pricing Guide ↓
          </button>
        </div>
      </div>
    </section>
  )
}
