import HouseCutaway from '../art/HouseCutaway'
import { ArrowIcon, FlaskIcon, GritIcon, MineralIcon } from '../icons'
import Stage from '../Stage'

/** The three things the copy names, as a row the eye can hold. */
const IN_THE_WATER = [
  ['Chlorine', FlaskIcon],
  ['Sediment', GritIcon],
  ['Excess minerals', MineralIcon],
]

export default function About() {
  return (
    <Stage id="about" curtain="wall">
      <div className="container split about-grid">
        <div className="stage-copy">
          <div className="eyebrow">Why filter</div>
          <h2>Your water might be the problem.</h2>
          <p>
            Chlorine, sediment and excess minerals can affect your water, leave residue on your
            appliances, and take a toll on your skin and hair. It can even change the taste and
            smell of your water.
          </p>
          <ul className="water-ills" aria-label="What can be in mains water">
            {IN_THE_WATER.map(([name, Icon], i) => (
              <li key={name} style={{ '--i': i }}>
                <Icon size={16} />
                {name}
              </li>
            ))}
          </ul>
          <p>
            Filtering at the point of entry treats it once, before it reaches a single tap, shower
            or appliance.
          </p>
          <a className="btn outline" href="#services">
            See the three systems <ArrowIcon />
          </a>
        </div>
        <div className="figure">
          <HouseCutaway />
        </div>
      </div>
    </Stage>
  )
}
