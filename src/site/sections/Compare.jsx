const ROWS = [
  ['Every tap & shower', ['✓ Yes', 'yes'], ['—'], ['✓*', 'yes']],
  ['Drinking water', ['✓ Yes', 'yes'], ['✓ Yes', 'yes'], ['✓ Yes*', 'yes']],
  ['Tank water', ['—'], ['—'], ['✓ Yes', 'yes']],
  ['Compact installation', ['—'], ['✓ Yes', 'yes'], ['Depends']],
  ['Whole-home coverage', ['✓ Yes', 'yes'], ['—'], ['✓*', 'yes']],
]

export default function Compare() {
  return (
    <section className="section compare" id="compare">
      <div className="container">
        <div className="section-intro reveal">
          <div className="eyebrow">Make the choice easier</div>
          <h2>See the difference at a glance.</h2>
          <p>
            You shouldn't need to understand filtration engineering to choose a system. Here's the
            simple version.
          </p>
        </div>
        <div className="compare-table reveal delay1">
          <div className="head">Best for</div>
          <div className="head">Whole House</div>
          <div className="head">Under Sink</div>
          <div className="head">Rainwater</div>
          {ROWS.map(([label, ...cells]) => (
            <Row label={label} cells={cells} key={label} />
          ))}
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
      {cells.map(([text, tone], i) => (
        <div className={tone} key={i}>
          {text}
        </div>
      ))}
    </>
  )
}
