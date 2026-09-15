/** The announcement strip and the sticky navigation bar. */
export default function SiteHeader() {
  return (
    <>
      <div className="topbar">
        <span>
          ◈ Australia's Trusted Water Filtration Specialists &nbsp;·&nbsp; Same-Day Quote Response
        </span>
        <span>1300 720 031</span>
      </div>

      <nav className="nav">
        <a className="logo" href="#">
          <span className="logo-mark" />
          <span className="logo-text">
            PureWater<small>FILTRATION</small>
          </span>
        </a>
        <div className="navlinks">
          <a href="#about">Why Pure Water</a>
          <a href="#services">Services</a>
          <a href="#finder">Find My System</a>
          <a href="#experience">3D Experience</a>
          <a href="#reviews">Reviews</a>
        </div>
        <div className="nav-actions">
          <a className="phone" href="tel:1300720031">
            1300 720 031
          </a>
          <a className="btn" href="#contact">
            Instant Quote <span>→</span>
          </a>
        </div>
        <button className="menu-btn" aria-label="Open menu">
          ☰
        </button>
      </nav>
    </>
  )
}
