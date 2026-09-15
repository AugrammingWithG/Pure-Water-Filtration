export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="logo" href="#" style={{ color: '#fff' }}>
              <span className="logo-mark" />
              <span className="logo-text">
                PureWater<small>FILTRATION</small>
              </span>
            </a>
            <p style={{ marginTop: '22px' }}>Cleaner Water. Healthier Living.</p>
          </div>
          <div>
            <h4>CONTACT</h4>
            <a href="tel:1300720031">1300 720 031</a>
            <a href="mailto:admin@purewaterfiltration.com.au">admin@purewaterfiltration.com.au</a>
            <a href="#">
              34 Welshpool Road
              <br />
              Welshpool, WA
            </a>
          </div>
          <div>
            <h4>OUR SERVICES</h4>
            <a href="#services">Whole House Water Filters</a>
            <a href="#services">Under Sink Water Filters</a>
            <a href="#services">Rainwater Filtration</a>
            <a href="#">Filter Replacements</a>
            <a href="#">Maintenance &amp; Repairs</a>
          </div>
          <div>
            <h4>SERVICE AREAS</h4>
            <a href="#">Perth</a>
            <a href="#">Sydney</a>
            <a href="#">Melbourne</a>
            <a href="#">Brisbane</a>
            <a href="#">Adelaide</a>
            <a href="#">Gold Coast</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Pure Water Filtration. All rights reserved.</span>
          <span>Privacy Policy &nbsp;·&nbsp; Terms &amp; Conditions &nbsp;·&nbsp; Sitemap</span>
        </div>
      </div>
    </footer>
  )
}
