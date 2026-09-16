import { CONTACT, CTA } from '../../data/constants'
import { MailIcon, PhoneIcon } from '../icons'
import QuoteForm from '../quote/QuoteForm'
import { useSite } from '../SiteContext'

/**
 * Where every "Get a free quote" on the page lands: the quote form itself,
 * with the phone beside it for anyone who would rather talk. The form is
 * the client's own Instant Quote questions (see quote/schema.js), so a lead
 * from here reads the same as one from their current site.
 */
export default function FinalCta() {
  const { quotePrefill } = useSite()
  return (
    <section className="section final-cta" id="contact">
      <div className="container split split-narrow">
        <div className="reveal-stagger">
          <div className="eyebrow">Get a free quote</div>
          <h2>Ready to feel the difference in your water?</h2>
          <p>
            Answer a few quick questions about your home and what you've noticed. A specialist
            comes back with a recommendation and a transparent quote — same business day.
          </p>
          <div className="contact-card">
            <a className="contact-row" href={CTA.phone.href}>
              <span className="contact-icon">
                <PhoneIcon size={20} />
              </span>
              <span>
                <strong>Call {CTA.phone.label}</strong>
                <small>
                  {CONTACT.hours.weekdays} · {CONTACT.hours.weekends}
                </small>
              </span>
            </a>
            <a className="contact-row" href={CTA.email.href}>
              <span className="contact-icon">
                <MailIcon size={20} />
              </span>
              <span>
                <strong>{CTA.email.label}</strong>
                <small>For anything that isn't a quote</small>
              </span>
            </a>
            <p className="contact-note">No obligation. No pushy sales, just honest advice.</p>
          </div>
        </div>
        <div className="reveal from-right delay2">
          <QuoteForm prefill={quotePrefill} />
        </div>
      </div>
    </section>
  )
}
