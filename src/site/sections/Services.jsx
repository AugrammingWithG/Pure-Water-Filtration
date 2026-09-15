import { SYSTEM_DATA } from '../../data/constants'
import SystemGlyph from '../art/SystemGlyph'
import { ArrowIcon, OpenIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The three systems, named and described exactly as the Lab names and
 * describes them (data/constants.js), so a visitor who opens the Lab from
 * here finds the same words on the other side.
 */
const ORDER = ['whole', 'undersink', 'rain']

export default function Services() {
  const { openViewer } = useSite()
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head reveal">
          <div className="eyebrow">The systems</div>
          <h2>Filtration for every part of your home.</h2>
          <p>Three systems, one goal: better water where you need it.</p>
        </div>
        <div className="card-grid three">
          {ORDER.map((key, i) => {
            const system = SYSTEM_DATA[key]
            return (
              <article className={`card service reveal${i ? ` delay${i}` : ''}`} key={key}>
                <div className={`service-art service-art-${key}`}>
                  <SystemGlyph kind={key} />
                </div>
                <div className="service-content">
                  <h3>{system.title}</h3>
                  <p>{system.subtitle}</p>
                  <div className="service-links">
                    <button className="link" onClick={openViewer}>
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
