import hummLogo from '../assets/brand/humm-logo.svg'

/**
 * The site's own reasons (see PRODUCT.md), in its own words. The warranty
 * and the 72-hour guarantee are also on the technical datasheet; the
 * finance line is the site's Humm partnership, so it carries Humm's mark.
 * A row of five with hairlines between, not five cards: they are one list,
 * and a card each made them look like five products.
 */
const BENEFITS = [
  ['Lifetime warranty', 'Every system is backed for life when paired with the Filter Care Plan.'],
  ['72-hour fix or replace', 'A guarantee, not a promise: we’re here when you need us.'],
  [
    'Interest-free payment plan',
    'Spread payments over 6 to 36 months with $0 upfront.',
    { logo: hummLogo, alt: 'Humm', href: 'https://www.shophumm.com/au/' },
  ],
  ['Tailored to your area', 'Every system is customised to your location, household size and water source.'],
  ['Hassle-free maintenance', 'Replacement filters delivered to your door on schedule.'],
]

export default function Benefits() {
  return (
    <section className="section pale" id="why-us">
      <div className="container">
        <div className="section-head reveal">
          <div className="eyebrow">Why families choose Pure Water</div>
          <h2>Trusted. Proven. Local.</h2>
          <p>
            Real solutions for real homes, backed by our commitment to quality, service and your
            peace of mind.
          </p>
        </div>
        <ol className="benefit-row">
          {BENEFITS.map(([title, body, partner], i) => (
            <li className={`benefit reveal${i % 4 ? ` delay${i % 4}` : ''}`} key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
              {partner && (
                <a className="benefit-partner" href={partner.href} target="_blank" rel="noopener">
                  <span>Through</span>
                  <img src={partner.logo} alt={partner.alt} height="18" loading="lazy" />
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
