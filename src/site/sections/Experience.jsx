import { useSite } from '../SiteContext'

const CAPTIONS = [
  ['01', 'Sediment Filter'],
  ['02', 'Carbon Filter'],
  ['03', 'Fine Filter'],
  ['04', 'Clean Water'],
]

export default function Experience() {
  const { openViewer } = useSite()
  return (
    <section className="section dark" id="experience">
      <div className="container interactive">
        <div className="reveal">
          <div className="eyebrow">Interactive 3D Experience</div>
          <h2>See filtration in motion.</h2>
          <p>
            Don't just read about how your water is filtered. See the water flow, filter process and
            clean water — all in one place.
          </p>
          <ul className="interactive-list">
            <li>
              <span className="check">✓</span> Watch the water flow through the system
            </li>
            <li>
              <span className="check">✓</span> See each stage of filtration
            </li>
            <li>
              <span className="check">✓</span> Explore individual components
            </li>
          </ul>
          <button className="btn light" onClick={openViewer}>
            Open Full Screen →
          </button>
        </div>
        <div className="demo reveal delay2">
          <div className="filter-machine" aria-hidden="true">
            <div className="pipe top" />
            <div className="pipe left" />
            <div className="pipe right" />
            <div className="flow f1" />
            <div className="flow f2" />
            <div className="flow f3" />
            <div className="canister" />
            <div className="canister" />
            <div className="canister" />
            <div className="canister" />
          </div>
          <div className="demo-caption">
            {CAPTIONS.map(([num, label]) => (
              <div key={num}>
                <b>{num}</b>
                {label}
              </div>
            ))}
          </div>
          <button className="btn demo-button" onClick={openViewer}>
            Launch Experience ↗
          </button>
        </div>
      </div>
    </section>
  )
}
