import { ArrowIcon } from '../icons'

const CHANGES = [
  {
    no: 'Taste',
    title: 'Better tasting water.',
    body: 'Customers often tell Pure Water they notice a difference in taste and odour after installation.',
  },
  {
    no: 'Shower',
    title: 'A different shower.',
    body: 'Chlorine and sediment take a toll on skin and hair. Whole-house filtration takes them out before the bathroom.',
  },
  {
    no: 'Home',
    title: 'Filtered where it matters.',
    body: 'Whole-house, under-sink and rainwater systems are designed around how the home actually uses water.',
  },
  {
    no: 'Confidence',
    title: 'Know what you’re buying.',
    body: 'Clear explanations, a pricing guide and a specialist conversation before the final recommendation.',
  },
]

export default function Difference() {
  return (
    <section className="section pale" id="difference">
      <div className="container split split-wide">
        <div className="reveal">
          <div className="eyebrow">What people actually notice</div>
          <h2>
            The difference is <em>everyday.</em>
          </h2>
          <p className="lead">
            You shouldn't need to learn filtration engineering. The change shows up in the things
            you already notice at home.
          </p>
          <a className="btn outline" href="#decoder">
            Start with what you notice <ArrowIcon />
          </a>
        </div>
        <div className="card-grid two">
          {CHANGES.map((change, i) => (
            <article className={`card reveal${i ? ` delay${i}` : ''}`} key={change.no}>
              <div className="kicker">{change.no}</div>
              <h3>{change.title}</h3>
              <p>{change.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
