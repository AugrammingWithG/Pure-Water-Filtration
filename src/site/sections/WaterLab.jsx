import waterLab from '../assets/water-lab.png'
import { useSite } from '../SiteContext'

const STAGES = [
  {
    num: '01 / SEDIMENT',
    title: 'Catch what shouldn’t be there.',
    body: 'The first stage visualises the incoming water and the filtration process, without asking visitors to understand technical specifications first.',
  },
  {
    num: '02 / CARBON',
    title: 'Refine the experience.',
    body: 'Show how the next stage fits into the journey and connect it to what homeowners actually notice: taste, smell and everyday comfort.',
  },
  {
    num: '03 / POLISH',
    title: 'Follow it to the tap.',
    body: 'End with the outcome that matters: filtered water moving through the home, where the right system is configured for the property.',
  },
]

export default function WaterLab() {
  const { openViewer } = useSite()
  return (
    <section className="water-lab" id="water-lab">
      <div className="container">
        <div className="lab-head reveal">
          <div>
            <div className="eyebrow" style={{ color: '#67dcff' }}>
              Our Signature Experience
            </div>
            <h2>
              Don't just read about filtration. <span style={{ color: '#63dfff' }}>see it.</span>
            </h2>
          </div>
          <p>
            Pure Water's interactive Water Lab turns a technical system into something anyone can
            understand. Follow the journey from incoming water to every tap in the home.
          </p>
        </div>
        <div className="lab-stage">
          <div className="lab-visual reveal">
            <img src={waterLab} alt="Interactive Pure Water Filtration 3D home and filtration visualization" />
            <div className="lab-overlay" />
            <button className="btn lab-launch" onClick={openViewer}>
              Open Full Water Lab ↗
            </button>
          </div>
          <div className="lab-info">
            {STAGES.map((stage, i) => (
              <article
                className={`lab-card${i === 0 ? ' active' : ''} reveal delay${i + 1}`}
                key={stage.num}
              >
                <div>
                  <div className="stage-num">{stage.num}</div>
                  <h3>{stage.title}</h3>
                  <p>{stage.body}</p>
                </div>
                <div className="lab-line" />
              </article>
            ))}
            <div className="lab-foot">
              <span>Built as a signature digital experience</span>
              <strong>Explore in 3D →</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
