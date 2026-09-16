import { ArrowIcon, GlassIcon, HomeIcon, ShowerIcon, VerifiedIcon } from '../icons'
import Stage from '../Stage'

/**
 * Four things a household notices, each behind a round window that starts
 * murky and clears as the section arrives (stages.css): the change the
 * copy describes, shown rather than said.
 */
const CHANGES = [
  {
    no: 'Taste',
    Icon: GlassIcon,
    title: 'Better tasting water.',
    body: 'Customers often tell Pure Water they notice a difference in taste and odour after installation.',
  },
  {
    no: 'Shower',
    Icon: ShowerIcon,
    title: 'A different shower.',
    body: 'Chlorine and sediment take a toll on skin and hair. Whole-house filtration takes them out before the bathroom.',
  },
  {
    no: 'Home',
    Icon: HomeIcon,
    title: 'Filtered where it matters.',
    body: 'Whole-house, under-sink and rainwater systems are designed around how the home actually uses water.',
  },
  {
    no: 'Confidence',
    Icon: VerifiedIcon,
    title: 'Know what you’re buying.',
    body: 'Clear explanations, a pricing guide and a specialist conversation before the final recommendation.',
  },
]

export default function Difference() {
  return (
    <Stage id="difference" className="pale difference" curtain="flip">
      <div className="container split split-wide">
        <div className="stage-copy">
          <div className="eyebrow">What people actually notice</div>
          <h2>
            The difference is{' '}
            <em className="scribbled">
              everyday.
              {/* a hand-drawn underline that draws itself under the word */}
              <svg className="scribble" viewBox="0 0 200 14" aria-hidden="true" preserveAspectRatio="none">
                <path d="M3 9c30-6 70-7 194-3" pathLength="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </em>
          </h2>
          <p className="lead">
            You shouldn't need to learn filtration engineering. The change shows up in the things
            you already notice at home.
          </p>
          <a className="btn outline" href="#decoder">
            Start with what you notice <ArrowIcon />
          </a>
        </div>
        <div className="card-grid two change-grid">
          {CHANGES.map(({ no, Icon, title, body }, i) => (
            <article className="card change" style={{ '--i': i }} key={no}>
              <span className="change-window" aria-hidden="true">
                <i className="murk" />
                <Icon size={22} />
              </span>
              <div className="kicker">{no}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </Stage>
  )
}
