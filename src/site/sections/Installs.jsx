import perth01 from '../assets/photos/install-perth-01.webp'
import perth02 from '../assets/photos/install-perth-02.webp'
import perth03 from '../assets/photos/install-perth-03.webp'
import rainwater from '../assets/photos/install-rainwater-02.webp'
import underSink from '../assets/photos/install-under-sink-03.webp'
import brick from '../assets/photos/install-whole-house-brick.webp'
import { ArrowIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The client's own installation photos, from their site, as a strip the
 * visitor can flick through. Captions say only what the photograph shows and
 * what the filename says about where; nothing is claimed that the picture
 * does not support.
 */
const INSTALLS = [
  {
    src: perth01,
    system: 'Whole house',
    where: 'Perth',
    alt: 'A whole-house unit on a rendered grey wall beside a hose reel, Perth',
  },
  {
    src: brick,
    system: 'Whole house',
    where: 'Brick home',
    alt: 'A whole-house unit against a red brick wall with copper pipework and a shrub in front',
  },
  {
    src: underSink,
    system: 'Under sink',
    where: 'Kitchen cabinet',
    alt: 'Three blue filter housings and a storage tank fitted inside a kitchen cupboard',
  },
  {
    src: rainwater,
    system: 'Rainwater',
    where: 'Side of house',
    alt: 'A stainless-steel rainwater unit with three gauges beside an air-conditioning unit on a brick wall',
  },
  {
    src: perth02,
    system: 'Whole house',
    where: 'Perth',
    alt: 'A whole-house unit installed on an exterior wall, Perth',
  },
  {
    src: perth03,
    system: 'Whole house',
    where: 'Perth',
    alt: 'A whole-house unit with its copper inlet and outlet, Perth',
  },
]

export default function Installs() {
  const { openQuote } = useSite()
  return (
    <section className="section installs" id="installs">
      <div className="container">
        <div className="section-head split-head reveal">
          <div>
            <div className="eyebrow">Real installs</div>
            <h2>What it looks like on your wall.</h2>
          </div>
          <p>
            Units go in near the meter, under the bench or beside the tank, and are plumbed in copper
            by qualified local technicians.
          </p>
        </div>
      </div>
      <div className="install-strip reveal delay1" aria-label="Photographs of installed systems">
        <ul className="install-track">
          {INSTALLS.map(({ src, system, where, alt }) => (
            <li key={src}>
              <figure className="install-shot">
                <img src={src} alt={alt} loading="lazy" />
                <figcaption>
                  <strong>{system}</strong>
                  <span>{where}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      <div className="container install-foot reveal delay2">
        <button className="btn outline" onClick={() => openQuote()}>
          Get one for your home <ArrowIcon />
        </button>
      </div>
    </section>
  )
}
