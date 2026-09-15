const CHANGES = [
  {
    no: '01 / TASTE',
    title: 'Better tasting water.',
    body: 'Customers often tell Pure Water they notice a difference in taste and odour after installation.',
  },
  {
    no: '02 / SHOWER',
    title: 'A different shower.',
    body: 'Turn the everyday shower experience into a reason to understand whole-home filtration.',
  },
  {
    no: '03 / HOME',
    title: 'Filtered where it matters.',
    body: 'Whole-house, under-sink and rainwater systems are designed around how the home actually uses water.',
  },
  {
    no: '04 / CONFIDENCE',
    title: 'Know what you’re buying.',
    body: 'Clear explanations, a pricing guide and a specialist conversation before the final recommendation.',
  },
]

export default function Difference() {
  return (
    <section className="change-section" id="difference">
      <div className="container change-grid">
        <div className="reveal">
          <div className="eyebrow">What people actually notice</div>
          <h2>
            The difference is <span className="gradient">everyday.</span>
          </h2>
          <p className="lead">
            The best filtration website should not make homeowners learn filtration engineering. It
            should help them recognise the things they already notice at home.
          </p>
          <a className="btn outline" href="#decoder">
            Explore Your Water →
          </a>
        </div>
        <div className="change-stack">
          {CHANGES.map((change, i) => (
            <article className={`change-card reveal${i ? ` delay${i}` : ''}`} key={change.no}>
              <div className="change-no">{change.no}</div>
              <h3>{change.title}</h3>
              <p>{change.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
