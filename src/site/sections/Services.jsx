import { SYSTEM_DATA } from '../../data/constants'
import rainwater from '../assets/photos/rainwater.webp'
import underSink from '../assets/photos/under-sink.webp'
import wholeHouse from '../assets/photos/whole-house.webp'
import { ArrowIcon, HomeIcon, OpenIcon, RainIcon, TapIcon } from '../icons'
import { useSite } from '../SiteContext'
import Stage from '../Stage'

/**
 * The three systems, named and described exactly as the Lab names and
 * describes them (data/constants.js), so a visitor who opens the Lab from
 * here finds the same words on the other side.
 *
 * The photographs are the client's own installs, from their site: the unit
 * as it actually looks against a wall or under a bench, not an illustration
 * of one. They develop as the section arrives — grey and soft, then sharp
 * and in colour, with one pass of light across each (stages.css). Each
 * card also names the form's answer for its system, so "Get a quote" here
 * lands on the form one question in.
 */
const SYSTEMS = [
  {
    key: 'whole',
    photo: wholeHouse,
    alt: 'A white Pure Water Filtration whole-house unit mounted on a limestone wall with copper pipework',
    service: 'Whole-house filtration',
    tag: 'Whole house',
    Icon: HomeIcon,
  },
  {
    key: 'undersink',
    photo: underSink,
    position: 'center 32%',
    alt: 'A Pure Water Filtration reverse-osmosis storage tank and cartridges installed under a kitchen sink',
    service: 'Under-sink filtration',
    tag: 'Under sink',
    Icon: TapIcon,
  },
  {
    key: 'rain',
    photo: rainwater,
    alt: 'A stainless-steel Pure Water Filtration rainwater unit with three pressure gauges beside a garden',
    service: 'Rainwater filtration',
    tag: 'Rainwater',
    Icon: RainIcon,
  },
]

export default function Services() {
  const { openViewer, openQuote } = useSite()
  return (
    <Stage id="services" className="services" curtain="shutter">
      <div className="container">
        <div className="section-head stage-copy">
          <div className="eyebrow">The systems</div>
          <h2>Filtration for every part of your home.</h2>
          <p>Three systems, one goal: better water where you need it.</p>
        </div>
        <div className="card-grid three">
          {SYSTEMS.map(({ key, photo, position, alt, service, tag, Icon }, i) => {
            const system = SYSTEM_DATA[key]
            return (
              <article className="card service" style={{ '--i': i }} key={key}>
                <div className="service-art">
                  <img src={photo} alt={alt} loading="lazy" style={position ? { objectPosition: position } : undefined} />
                  <span className="service-tag">
                    <Icon size={14} />
                    {tag}
                  </span>
                </div>
                <div className="service-content">
                  <h3>{system.title}</h3>
                  <p>{system.subtitle}</p>
                  <div className="service-links">
                    <button className="link" onClick={() => openQuote({ service })}>
                      Get a quote <ArrowIcon size={12} />
                    </button>
                    <button className="link quiet" onClick={openViewer}>
                      See it in the Lab <OpenIcon size={12} />
                    </button>
                    <a
                      className="link quiet"
                      href={system.learnMore}
                      target="_blank"
                      rel="noopener"
                    >
                      Learn more <ArrowIcon size={12} />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Stage>
  )
}
