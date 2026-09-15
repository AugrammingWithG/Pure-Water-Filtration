import { CheckIcon, DashIcon, HelpIcon, HomeIcon, RainIcon, TapIcon } from '../icons'
import Stage from '../Stage'

/** yes / yes with a footnote / no / it depends */
const ROWS = [
  ['Every tap & shower', 'yes', 'no', 'note'],
  ['Drinking water', 'yes', 'yes', 'note'],
  ['Tank water', 'no', 'no', 'yes'],
  ['Compact installation', 'no', 'yes', 'depends'],
  ['Whole-home coverage', 'yes', 'no', 'note'],
]

const SYSTEMS = [
  ['Whole house', HomeIcon],
  ['Under sink', TapIcon],
  ['Rainwater', RainIcon],
]

function Cell({ value }) {
  if (value === 'yes' || value === 'note') {
    return (
      <div className="cell yes" role="cell">
        <CheckIcon size={13} />
        Yes{value === 'note' && <sup>*</sup>}
      </div>
    )
  }
  if (value === 'depends') {
    return (
      <div className="cell depends" role="cell">
        <HelpIcon size={15} />
        Depends
      </div>
    )
  }
  return (
    <div className="cell no" role="cell" aria-label="No">
      <DashIcon size={15} />
    </div>
  )
}

/**
 * The table fills in behind a scan line that runs down it as the section
 * arrives, a row at a time, the ticks drawing as it passes (stages.css).
 * Rows are real elements (display: contents) so a pointer over any cell
 * lights the whole row.
 */
export default function Compare() {
  return (
    <Stage id="compare" className="compare" curtain="split">
      <div className="container">
        <div className="section-head stage-copy">
          <div className="eyebrow">Side by side</div>
          <h2>Which system does what.</h2>
          <p>The simple version: what each system covers, before a specialist confirms the fit.</p>
        </div>
        <div className="compare-scroll">
          <div className="compare-table" role="table" aria-label="Which system covers what">
            <div className="row" role="row" style={{ '--r': 0 }}>
              <div className="head" role="columnheader">
                Covers
              </div>
              {SYSTEMS.map(([name, Icon]) => (
                <div className="head" role="columnheader" key={name}>
                  <Icon size={15} />
                  {name}
                </div>
              ))}
            </div>
            {ROWS.map(([label, ...cells], r) => (
              <div className="row" role="row" style={{ '--r': r + 1 }} key={label}>
                <div className="label" role="rowheader">
                  {label}
                </div>
                {cells.map((value, i) => (
                  <Cell value={value} key={i} />
                ))}
              </div>
            ))}
            <i className="scan" aria-hidden="true" />
          </div>
        </div>
        <p className="compare-note">
          *Suitability depends on the home's plumbing, water source and system configuration. A
          specialist should confirm the final recommendation.
        </p>
      </div>
    </Stage>
  )
}
