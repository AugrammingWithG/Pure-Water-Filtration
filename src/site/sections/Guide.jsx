import { CheckIcon, DownloadIcon } from '../icons'
import { useSite } from '../SiteContext'

export default function Guide() {
  const { showToast } = useSite()
  return (
    <section className="section guide" id="guide">
      <div className="container split">
        <div className="guide-card reveal">
          <div className="guide-cover">
            <div className="eyebrow">Free guide</div>
            <h3>
              Water Filtration
              <br />
              Pricing Guide
            </h3>
            <p>For Australian homes</p>
          </div>
        </div>
        <div className="reveal delay2">
          <div className="eyebrow">Free resource</div>
          <h2>Know what to expect before you choose a system.</h2>
          <p>
            Our free Water Filtration Pricing Guide explains which system may suit your home, what
            Australian homeowners can expect to pay, and what's worth knowing before you decide.
          </p>
          <ul className="check-list">
            <li>
              <CheckIcon /> Which system suits your home and water type
            </li>
            <li>
              <CheckIcon /> What the lifetime warranty covers
            </li>
            <li>
              <CheckIcon /> How Filter Care keeps costs predictable
            </li>
          </ul>
          <button className="btn" onClick={showToast}>
            Download the free guide <DownloadIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
