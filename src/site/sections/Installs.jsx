import perth01 from '../assets/photos/install-perth-01.webp'
import perth02 from '../assets/photos/install-perth-02.webp'
import perth03 from '../assets/photos/install-perth-03.webp'
import rainwater from '../assets/photos/install-rainwater-02.webp'
import underSink from '../assets/photos/install-under-sink-03.webp'
import brick from '../assets/photos/install-whole-house-brick.webp'
import { ArrowIcon, HomeIcon, PinIcon, RainIcon, TapIcon } from '../icons'
import { useSite } from '../SiteContext'
import Stage from '../Stage'

/**
 * The client's own installation photos, from their site, as a strip the
 * visitor can flick through. Captions say only what the photograph shows and
 * what the filename says about where; nothing is claimed that the picture
 * does not support.
 *
 * The strip is laid out like a contact sheet — a sprocket edge above and
 * below — and the prints are dealt onto it one after another as the
 * section arrives, each landing from a slight angle (stages.css).
 */
const ICONS = { 'Whole house': HomeIcon, 'Under sink': TapIcon, Rainwater: RainIcon }

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
    <Stage id="installs" className="installs" curtain="advance">
      <div className="container">
        <div className="section-head split-head stage-copy">
          <div className="stage-copy">
            <div className="eyebrow">Real installs</div>
            <h2>What it looks like on your wall.</h2>
          </div>
          <p>
            Units go in near the meter, under the bench or beside the tank, and are plumbed in copper
            by qualified local technicians.
          </p>
        </div>
      </div>
      <div className="install-strip" aria-label="Photographs of installed systems">
        <ul className="install-track">
          {INSTALLS.map(({ src, system, where, alt }, i) => {
            const Icon = ICONS[system]
            return (
              <li key={src} style={{ '--i': i }}>
                <figure className="install-shot">
                  <img src={src} alt={alt} loading="lazy" />
                  <figcaption>
                    <strong>
                      <Icon size={14} />
                      {system}
                    </strong>
                    <span>
                      <PinIcon size={13} />
                      {where}
                    </span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="container install-foot stage-copy">
        <button className="btn outline" onClick={() => openQuote()}>
          Get one for your home <ArrowIcon />
        </button>
      </div>
    </Stage>
  )
}
