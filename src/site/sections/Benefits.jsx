/**
 * The site's own reasons (see PRODUCT.md: sourced from the client's pages,
 * not re-confirmed). A row of five with hairlines between, not five cards:
 * they are one list, and a card each made them look like five products.
 */
const BENEFITS = [
  ['Lifetime warranty', 'Peace of mind with industry-leading coverage.'],
  ['72-hour fix guarantee', 'We’re here when you need us.'],
  ['Interest-free payment plan', 'Flexible options available.'],
  ['Tailored to your area', 'Solutions for your local water conditions.'],
  ['Hassle-free maintenance', 'Keep your system running at its best.'],
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
          {BENEFITS.map(([title, body], i) => (
            <li className={`benefit reveal${i % 4 ? ` delay${i % 4}` : ''}`} key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
