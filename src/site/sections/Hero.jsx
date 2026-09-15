import waterLab from '../assets/water-lab.png'
import { useSite } from '../SiteContext'

export default function Hero() {
  const { openViewer } = useSite()
  return (
    <section className="hero">
      <div className="water-line" />
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <div className="eyebrow">Australia's water filtration specialists</div>
          <h1>
            Better water <span className="gradient">starts at the source.</span>
          </h1>
          <p>
            Your water enters your home long before you turn on the tap. We design filtration
            around your home, your water and what you actually want to change.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#contact">
              Get My Free Quote <span>→</span>
            </a>
            <button className="btn outline" onClick={openViewer}>
              Enter the Water Lab <span>↗</span>
            </button>
          </div>
          <div className="mini-trust">
            <div>
              <strong>Lifetime Warranty</strong>
              <span>With Filter Care Plan</span>
            </div>
            <div>
              <strong>5.0 Google Rating</strong>
              <span>50+ service areas</span>
            </div>
          </div>
          <div className="hero-micro">
            <span>
              <i />
              Whole house
            </span>
            <span>
              <i />
              Under sink
            </span>
            <span>
              <i />
              Rainwater
            </span>
          </div>
        </div>
        <div className="hero-signature reveal delay2">
          <div className="signature-frame">
            <img
              src={waterLab}
              alt="Pure Water Filtration interactive 3D water filtration viewer showing a home, filtration system and water journey stages"
            />
            <div className="signature-top">
              <div className="signature-chip">
                <b>THE WATER LAB</b>
                <span>Interactive 3D water journey</span>
              </div>
              <div className="signature-live">
                <i />
                LIVE EXPERIENCE
              </div>
            </div>
            <div className="signature-bottom">
              <div className="signature-caption">
                <strong>See your water, stage by stage.</strong>
                <span>Explore the system behind every tap.</span>
              </div>
              <button className="btn dark" onClick={openViewer}>
                Launch 3D Experience ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
