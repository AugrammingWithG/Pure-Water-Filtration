const BENEFITS = [
  ['01', 'Lifetime Warranty', 'Peace of mind with industry-leading coverage.'],
  ['02', '72-Hour Fix Guarantee', 'We’re here when you need us.'],
  ['03', 'Interest-Free Payment Plan', 'Flexible options available.'],
  ['04', 'Tailored to Your Area', 'Solutions for your local water conditions.'],
  ['05', 'Hassle-Free Maintenance', 'Keep your system running at its best.'],
]

export default function Benefits() {
  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">Why Australian Families Choose Pure Water</div>
          <h2>Trusted. Proven. Local.</h2>
          <p>
            Real solutions for real homes, backed by our commitment to quality, service and your
            peace of mind.
          </p>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map(([num, title, body], i) => (
            <article className={`benefit reveal${i % 4 ? ` delay${i % 4}` : ''}`} key={num}>
              <div className="num">{num}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
