import { useEffect, useState } from 'react'
import logo from '../assets/brand/logo.webp'
import { useBodyClass } from '../hooks'
import { ArrowIcon, CloseIcon, MenuIcon, MotionIcon, PhoneIcon, TextSizeIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The nav names the sections in the order they appear, using the same words
 * the sections use for themselves, so a link and the heading it lands on
 * always agree.
 */
const LINKS = [
  ['#water-lab', 'Water Lab'],
  ['#about', 'Why filter'],
  ['#services', 'Systems'],
  ['#finder', 'Find my system'],
  ['#reviews', 'Reviews'],
]

/** The announcement strip, the sticky nav, and the phone menu behind it. */
export default function SiteHeader() {
  const { prefs, setPref, openViewer } = useSite()
  const [menuOpen, setMenuOpen] = useState(false)
  useBodyClass('menu-open', menuOpen)

  /* the drawer closes on Escape, and whenever the viewport grows past it */
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    const wide = window.matchMedia('(min-width: 901px)')
    const onWide = () => wide.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      <div className="topbar">
        <span>Australian water filtration specialists · Same-day quote response</span>
        <a href="tel:1300720031">1300 720 031</a>
      </div>

      <div className="nav-wrap">
        <nav className="nav" aria-label="Main">
          <a className="logo" href="#" aria-label="Pure Water Filtration, back to top">
            <img src={logo} alt="" width="550" height="200" />
          </a>
          <div className="navlinks">
            {LINKS.map(([href, label]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <a className="phone" href="tel:1300720031">
              <PhoneIcon size={15} />
              1300 720 031
            </a>
            <a className="btn" href="#contact">
              Get a free quote <ArrowIcon />
            </a>
          </div>
          <button
            className="menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>

        <div id="site-menu" className={`menu${menuOpen ? ' open' : ''}`} hidden={!menuOpen}>
          <div className="menu-links">
            {LINKS.map(([href, label]) => (
              <a href={href} key={href} onClick={close}>
                {label}
                <ArrowIcon />
              </a>
            ))}
          </div>
          <div className="menu-actions">
            <a className="btn" href="#contact" onClick={close}>
              Get a free quote <ArrowIcon />
            </a>
            <button
              className="btn outline"
              onClick={() => {
                close()
                openViewer()
              }}
            >
              Open the Water Lab
            </button>
          </div>
          {/* the same two reading aids the desktop pill offers, in the one place a phone has room for them */}
          <div className="menu-prefs" aria-label="Reading options">
            <button
              className={prefs.easyRead ? 'on' : ''}
              aria-pressed={prefs.easyRead}
              onClick={() => setPref('easyRead', !prefs.easyRead)}
            >
              <TextSizeIcon /> Larger text
            </button>
            <button
              className={prefs.reducedMotion ? 'on' : ''}
              aria-pressed={prefs.reducedMotion}
              onClick={() => setPref('reducedMotion', !prefs.reducedMotion)}
            >
              <MotionIcon /> Reduce motion
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
