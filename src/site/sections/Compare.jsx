import { CheckIcon } from '../icons'

/** yes / yes with a footnote / no / it depends */
const ROWS = [
  ['Every tap & shower', 'yes', 'no', 'note'],
  ['Drinking water', 'yes', 'yes', 'note'],
  ['Tank water', 'no', 'no', 'yes'],
  ['Compact installation', 'no', 'yes', 'depends'],
  ['Whole-home coverage', 'yes', 'no', 'note'],
]

function Cell({ value }) {
  if (value === 'yes' || value === 'note') {
    return (
      <div className="yes">
        <CheckIcon size={13} />
        Yes{value === 'note' && <sup>*</sup>}
      </div>
    )
  }
  if (value === 'depends') return <div className="depends">Depends</div>
  return (
    <div className="no" aria-label="No">
      —
    </div>
  )
}

export default function Compare() {
  return (
    <section className="section compare" id="compare">
      <div className="container">
        <div className="section-head reveal-stagger">
          <div className="eyebrow">Side by side</div>
          <h2>Which system does what.</h2>
          <p>The simple version: what each system covers, before a specialist confirms the fit.</p>
        </div>
        <div className="compare-scroll reveal delay1">
          <div className="compare-table" role="table" aria-label="Which system covers what">
            <div className="head">Covers</div>
            <div className="head">Whole house</div>
            <div className="head">Under sink</div>
            <div className="head">Rainwater</div>
            {ROWS.map(([label, ...cells]) => (
              <Row label={label} cells={cells} key={label} />
            ))}
          </div>
        </div>
        <p className="compare-note">
          *Suitability depends on the home's plumbing, water source and system configuration. A
          specialist should confirm the final recommendation.
        </p>
      </div>
    </section>
  )
}

function Row({ label, cells }) {
  return (
    <>
      <div className="label">{label}</div>
      {cells.map((value, i) => (
        <Cell value={value} key={i} />
      ))}
    </>
  )
}
