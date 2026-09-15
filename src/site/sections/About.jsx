import HouseCutaway from '../art/HouseCutaway'
import { ArrowIcon } from '../icons'

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container split">
        <div className="reveal">
          <div className="eyebrow">Why filter</div>
          <h2>Your water might be the problem.</h2>
          <p>
            Chlorine, sediment and excess minerals can affect your water, leave residue on your
            appliances, and take a toll on your skin and hair. It can even change the taste and
            smell of your water.
          </p>
          <p>
            Filtering at the point of entry treats it once, before it reaches a single tap, shower
            or appliance.
          </p>
          <a className="btn outline" href="#services">
            See the three systems <ArrowIcon />
          </a>
        </div>
        <div className="figure reveal delay2">
          <HouseCutaway />
        </div>
      </div>
    </section>
  )
}
