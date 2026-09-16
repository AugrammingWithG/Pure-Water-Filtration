import { ASSURANCES, COMPONENTS, DATASHEET_VERSION, MODEL, REPLACEMENT, SPECS, STAGES } from '../../data/datasheet'
import wholeHouse from '../assets/photos/whole-house.webp'
import {
  ArrowIcon,
  CertificateIcon,
  ClockIcon,
  HexIcon,
  LayersIcon,
  OpenIcon,
  ShieldIcon,
  SparkleIcon,
  WrenchIcon,
} from '../icons'
import { useSite } from '../SiteContext'
import Stage from '../Stage'

/** One icon per stage, in the order the datasheet lists them. */
const STAGE_ICONS = [LayersIcon, HexIcon, SparkleIcon]
/** One per assurance, in the order the datasheet lists them. */
const ASSURANCE_ICONS = [ShieldIcon, ClockIcon, CertificateIcon, WrenchIcon]

/**
 * The whole-home system's technical datasheet, on the page. Every number and
 * phrase is the client's (data/datasheet.js); the section only lays it out.
 * It sits after the side-by-side comparison so a visitor who wants the
 * engineering gets it right where the plain-English version ends.
 *
 * It arrives as an inspection: a scan line runs down the photograph, the
 * three stages come on down a line that fills the way water runs through
 * them, and the tables type themselves in (stages.css).
 */
export default function Specs() {
  const { openViewer, openQuote } = useSite()
  return (
    <Stage id="specs" className="dark specs" curtain="scan">
      <div className="container">
        <div className="section-head split-head stage-copy">
          <div className="stage-copy">
            <div className="eyebrow">Whole home system · Technical datasheet</div>
            <h2>What's inside the box on the wall.</h2>
          </div>
          <p>
            Three 20″ × 4.5″ cartridges in a stainless frame, rated for the whole house. Model{' '}
            <strong className="specs-model">{MODEL}</strong>.
          </p>
        </div>

        <div className="specs-grid">
          <figure className="specs-photo">
            <img
              src={wholeHouse}
              alt="The whole-house unit: a white UV-protected cover on a limestone wall with copper inlet and outlet"
              loading="lazy"
            />
            <i className="specs-scan" aria-hidden="true" />
            <figcaption>74 cm × 59 cm × 21 cm · ground-mounted, optional back cover</figcaption>
          </figure>

          <ol className="specs-stages">
            <i className="specs-drop" aria-hidden="true" />
            {STAGES.map((stage, i) => {
              const Icon = STAGE_ICONS[i]
              return (
                <li className="specs-stage" style={{ '--i': i }} key={stage.n}>
                  <div className="specs-stage-head">
                    <span className="stage-icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <div>
                      <span className="kicker">Stage {stage.n}</span>
                      <h3>{stage.title}</h3>
                    </div>
                  </div>
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
                    {stage.specs.map(([label, value], k) => (
                      <li key={label} style={{ '--k': k }}>
                        <span>{label}</span> {value}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="specs-tables">
          <div className="specs-table" style={{ '--i': 0 }}>
            <h3>Technical specifications</h3>
            <dl>
              {SPECS.map(([label, value], k) => (
                <div key={label} style={{ '--k': k }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="specs-table" style={{ '--i': 1 }}>
            <h3>System components</h3>
            <dl>
              {COMPONENTS.map(([label, value], k) => (
                <div key={label} style={{ '--k': k }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div style={{ '--k': COMPONENTS.length }}>
                <dt>Filter replacement</dt>
                <dd>
                  {REPLACEMENT.recommended} for all three stages · {REPLACEMENT.max} maximum
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ul className="specs-assurances" aria-label="Certifications and warranty">
          {ASSURANCES.map(({ title, note }, i) => {
            const Icon = ASSURANCE_ICONS[i]
            return (
              <li key={title} style={{ '--i': i }}>
                <span className="assurance-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{note}</span>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="actions specs-actions">
          <button className="btn light" onClick={openViewer}>
            Watch the three stages work <OpenIcon />
          </button>
          <button className="btn outline" onClick={() => openQuote({ service: 'Whole-house filtration' })}>
            Get a whole-house quote <ArrowIcon />
          </button>
          <span className="specs-version">{DATASHEET_VERSION}</span>
        </div>
      </div>
    </Stage>
  )
}
