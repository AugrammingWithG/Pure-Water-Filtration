import { ArrowIcon, OpenIcon, PhoneIcon } from '../icons'
import { useSite } from '../SiteContext'

/** The three things a phone visitor is most likely to want, pinned to the bottom. */
export default function MobileActions() {
  const { openViewer } = useSite()
  return (
    <nav className="mobile-actions" aria-label="Quick actions">
      <a href="tel:1300720031">
        <PhoneIcon size={15} /> Call
      </a>
      <button onClick={openViewer}>
        <OpenIcon size={15} /> Water Lab
      </button>
      <a className="primary" href="#contact">
        Get a quote <ArrowIcon size={13} />
      </a>
    </nav>
  )
}
