import { useSite } from '../SiteContext'

/** The three things a phone visitor is most likely to want, pinned to the bottom. */
export default function MobileActions() {
  const { openViewer } = useSite()
  return (
    <div className="mobile-actions" aria-label="Quick actions">
      <a href="tel:1300720031">Call</a>
      <button onClick={openViewer}>3D Explorer</button>
      <a className="primary" href="#contact">
        Get a Quote
      </a>
    </div>
  )
}
