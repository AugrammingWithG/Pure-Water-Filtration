import { CTA } from '../../data/constants'
import { DownloadIcon, MailIcon, OpenIcon, PhoneIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * Where every "Get a free quote" on the page lands. Until the on-site form
 * has somewhere to submit to (PRODUCT.md: backend undecided), the two paths
 * that actually work are the phone and the client's own contact page, so
 * those are the two things offered — not a button that scrolls to another
 * button.
 */
export default function FinalCta() {
  const { showToast } = useSite()
  return (
    <section className="section final-cta" id="contact">
      <div className="container split">
        <div className="reveal">
          <div className="eyebrow">Get a free quote</div>
          <h2>Ready to feel the difference in your water?</h2>
          <p>
            Tell us about your home and what you've noticed. A specialist will come back with a
            recommendation and a transparent quote — same day for quote requests.
          </p>
          <button className="link quiet" onClick={showToast}>
            Or download the pricing guide first <DownloadIcon size={12} />
          </button>
        </div>
        <div className="contact-card reveal delay2">
          <a className="contact-row" href={CTA.phone.href}>
            <span className="contact-icon">
              <PhoneIcon size={20} />
            </span>
            <span>
              <strong>Call {CTA.phone.label}</strong>
              <small>Quickest way to talk to a specialist</small>
            </span>
          </a>
          <a className="contact-row" href={CTA.quote.href} target="_blank" rel="noopener">
            <span className="contact-icon">
              <MailIcon size={20} />
            </span>
            <span>
              <strong>Request a quote online</strong>
              <small>Opens the quote form on purewaterfiltration.com.au</small>
            </span>
            <OpenIcon size={14} />
          </a>
          <p className="contact-note">No obligation. Same-day response to quote requests.</p>
        </div>
      </div>
    </section>
  )
}
