import { CTA, SYSTEM_DATA } from '../../data/constants'

const CITIES = ['Perth', 'Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Gold Coast']

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="logo" href="#" aria-label="Pure Water Filtration, back to top">
              <span className="logo-mark" />
              <span className="logo-text">
                PureWater<small>Filtration</small>
              </span>
            </a>
            <p className="footer-tagline">Cleaner water. Healthier living.</p>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={CTA.phone.href}>{CTA.phone.label}</a>
            <a href="mailto:admin@purewaterfiltration.com.au">admin@purewaterfiltration.com.au</a>
            <p>
              34 Welshpool Road
              <br />
              Welshpool, WA
            </p>
          </div>
          <div>
            <h4>Systems</h4>
            <a href="#services">{SYSTEM_DATA.whole.title}</a>
            <a href="#services">{SYSTEM_DATA.undersink.title}</a>
            <a href="#services">{SYSTEM_DATA.rain.title}</a>
            <a href="#water-lab">The Water Lab</a>
            <a href="#guide">Pricing guide</a>
          </div>
          <div>
            <h4>Service areas</h4>
            {CITIES.map((city) => (
              <a href="#areas" key={city}>
                {city}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Pure Water Filtration. All rights reserved.</span>
          <span>Privacy policy · Terms &amp; conditions</span>
        </div>
      </div>
    </footer>
  )
}
