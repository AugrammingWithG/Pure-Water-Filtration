import HeroScene from '../HeroScene'
import { ArrowIcon, OpenIcon } from '../icons'
import { useSite } from '../SiteContext'

export default function Hero() {
  const { openViewer } = useSite()
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <HeroScene />
      </div>
      <div className="hero-scrim" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy reveal-stagger">
          <div className="eyebrow">Australia's water filtration specialists</div>
          <h1>
            Better water <em>starts at the source.</em>
          </h1>
          <p className="lead">
            Your water enters your home long before you turn on the tap. We design filtration around
            your home, your water and what you actually want to change.
          </p>
          <div className="actions">
            <a className="btn" href="#contact">
              Get a free quote <ArrowIcon />
            </a>
            <button className="btn outline" onClick={openViewer}>
              Open the Water Lab <OpenIcon />
            </button>
          </div>
          <dl className="mini-trust">
            <div>
              <dt>Lifetime warranty</dt>
              <dd>With the Filter Care Plan</dd>
            </div>
            <div>
              <dt>5.0 Google rating</dt>
              <dd>50+ service areas</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
