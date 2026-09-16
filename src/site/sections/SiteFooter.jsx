import { CONTACT, CTA, SITE, SYSTEM_DATA } from '../../data/constants'
import logoWhite from '../assets/brand/logo-white.svg'

const CITIES = ['Perth', 'Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Gold Coast']

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="logo" href="#" aria-label="Pure Water Filtration, back to top">
              <img src={logoWhite} alt="" width="520" height="174" />
            </a>
            <p className="footer-tagline">Cleaner water. Healthier living.</p>
            <div className="footer-socials">
              {CONTACT.socials.map(({ label, href }) => (
                <a href={href} target="_blank" rel="noopener" key={label}>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={CTA.phone.href}>{CTA.phone.label}</a>
            <a href={CTA.email.href}>{CTA.email.label}</a>
            <a href={CONTACT.mapsUrl} target="_blank" rel="noopener">
              {CONTACT.address[0]}
              <br />
              {CONTACT.address[1]}
            </a>
            <p>
              {CONTACT.hours.weekdays}
              <br />
              {CONTACT.hours.weekends}
            </p>
          </div>
          <div>
            <h4>Systems</h4>
            <a href="#services">{SYSTEM_DATA.whole.title}</a>
            <a href="#services">{SYSTEM_DATA.undersink.title}</a>
            <a href="#services">{SYSTEM_DATA.rain.title}</a>
            <a href="#specs">Technical datasheet</a>
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
          <span>
            <a href={`${SITE}/privacy`} target="_blank" rel="noopener">
              Privacy policy
            </a>
            {' · '}
            <a href={`${SITE}/terms-of-use`} target="_blank" rel="noopener">
              Terms of use
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
