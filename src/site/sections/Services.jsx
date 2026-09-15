import { SYSTEM_DATA } from '../../data/constants'
import rainwater from '../assets/photos/rainwater.webp'
import underSink from '../assets/photos/under-sink.webp'
import wholeHouse from '../assets/photos/whole-house.webp'
import { ArrowIcon, OpenIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The three systems, named and described exactly as the Lab names and
 * describes them (data/constants.js), so a visitor who opens the Lab from
 * here finds the same words on the other side.
 *
 * The photographs are the client's own installs, from their site: the unit
 * as it actually looks against a wall or under a bench, not an illustration
 * of one. Each card also names the form's answer for its system, so "Get a
 * quote" here lands on the form one question in.
 */
const SYSTEMS = [
  {
    key: 'whole',
    photo: wholeHouse,
    alt: 'A white Pure Water Filtration whole-house unit mounted on a limestone wall with copper pipework',
    service: 'Whole-house filtration',
  },
  {
    key: 'undersink',
    photo: underSink,
    alt: 'A Pure Water Filtration reverse-osmosis storage tank and cartridges installed under a kitchen sink',
    service: 'Under-sink filtration',
  },
  {
    key: 'rain',
    photo: rainwater,
    alt: 'A stainless-steel Pure Water Filtration rainwater unit with three pressure gauges beside a garden',
    service: 'Rainwater filtration',
  },
]

export default function Services() {
  const { openViewer, openQuote } = useSite()
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head reveal">
          <div className="eyebrow">The systems</div>
          <h2>Filtration for every part of your home.</h2>
          <p>Three systems, one goal: better water where you need it.</p>
        </div>
        <div className="card-grid three">
          {SYSTEMS.map(({ key, photo, alt, service }, i) => {
            const system = SYSTEM_DATA[key]
            return (
              <article className={`card service reveal${i ? ` delay${i}` : ''}`} key={key}>
                <div className="service-art">
                  <img src={photo} alt={alt} loading="lazy" />
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
    </section>
  )
}
