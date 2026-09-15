import { ASSURANCES, COMPONENTS, DATASHEET_VERSION, MODEL, REPLACEMENT, SPECS, STAGES } from '../../data/datasheet'
import wholeHouse from '../assets/photos/whole-house.webp'
import { ArrowIcon, OpenIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * The whole-home system's technical datasheet, on the page. Every number and
 * phrase is the client's (data/datasheet.js); the section only lays it out.
 * It sits after the side-by-side comparison so a visitor who wants the
 * engineering gets it right where the plain-English version ends.
 */
export default function Specs() {
  const { openViewer, openQuote } = useSite()
  return (
    <section className="section dark specs" id="specs">
      <div className="container">
        <div className="section-head split-head reveal-stagger">
          <div>
            <div className="eyebrow">Whole home system · Technical datasheet</div>
            <h2>What's inside the box on the wall.</h2>
          </div>
          <p>
            Three 20″ × 4.5″ cartridges in a stainless frame, rated for the whole house. Model{' '}
            <strong className="specs-model">{MODEL}</strong>.
          </p>
        </div>

        <div className="specs-grid">
          <figure className="specs-photo reveal zoom">
            <img
              src={wholeHouse}
              alt="The whole-house unit: a white UV-protected cover on a limestone wall with copper inlet and outlet"
              loading="lazy"
            />
            <figcaption>74 cm × 59 cm × 21 cm · ground-mounted, optional back cover</figcaption>
          </figure>

          <ol className="specs-stages">
            {STAGES.map((stage) => (
              <li className="specs-stage" key={stage.n}>
                <span className="kicker">Stage {stage.n}</span>
                <h3>{stage.title}</h3>
                <dl>
                  <div>
                    <dt>Removes</dt>
                    <dd>{stage.removes}</dd>
                  </div>
                  <div>
                    <dt>Filter type</dt>
                    <dd>{stage.filter}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{stage.note}</dd>
                  </div>
                </dl>
                <ul className="specs-chips" aria-label={`Stage ${stage.n} specifications`}>
                  {stage.specs.map(([label, value]) => (
                    <li key={label}>
                      <span>{label}</span> {value}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <div className="specs-tables reveal delay1">
          <div className="specs-table">
            <h3>Technical specifications</h3>
            <dl>
              {SPECS.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="specs-table">
            <h3>System components</h3>
            <dl>
              {COMPONENTS.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>Filter replacement</dt>
                <dd>
                  {REPLACEMENT.recommended} for all three stages · {REPLACEMENT.max} maximum
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ul className="specs-assurances reveal delay2" aria-label="Certifications and warranty">
          {ASSURANCES.map(({ title, note }) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{note}</span>
            </li>
          ))}
        </ul>

        <div className="actions specs-actions reveal delay2">
          <button className="btn light" onClick={openViewer}>
            Watch the three stages work <OpenIcon />
          </button>
          <button className="btn outline" onClick={() => openQuote({ service: 'Whole-house filtration' })}>
            Get a whole-house quote <ArrowIcon />
          </button>
          <span className="specs-version">{DATASHEET_VERSION}</span>
        </div>
      </div>
    </section>
  )
}
