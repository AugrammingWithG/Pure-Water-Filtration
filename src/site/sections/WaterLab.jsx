import waterLab from '../assets/water-lab.png'
import { PlayIcon } from '../icons'
import { useSite } from '../SiteContext'

/**
 * What the visitor can do in the Lab, in the order they will do it. This is
 * the one section that sells the Lab; the old "See filtration in motion"
 * block said the same thing a second time with a cartoon.
 */
const CAN_DO = [
  {
    num: '01',
    title: 'Pick a system.',
    body: 'Whole house, under sink or rainwater — see exactly where each one is installed in a real home.',
  },
  {
    num: '02',
    title: 'Follow the water.',
    body: 'Play the walkthrough and watch water clear stage by stage: sediment, carbon, polish or UV, then the tap.',
  },
  {
    num: '03',
    title: 'See what each stage removes.',
    body: 'Every stage names what it catches — rust, sand, chlorine, taste and odour — so you know what changes and why.',
  },
]

export default function WaterLab() {
  const { openViewer } = useSite()
  return (
    <section className="section dark feature water-lab" id="water-lab">
      <div className="container">
        <div className="section-head split-head reveal">
          <div>
            <div className="eyebrow">The Water Lab</div>
            <h2>
              Don't just read about filtration. <em>See it.</em>
            </h2>
          </div>
          <p>
            An interactive 3D home that shows where each Pure Water system goes and how water moves
            through its stages. Open it in full screen, or start with the home above.
          </p>
        </div>

        <div className="lab-stage">
          <button
            className="lab-visual reveal"
            onClick={openViewer}
            aria-label="Open the Water Lab, the interactive 3D filtration viewer"
          >
            <img src={waterLab} alt="" />
            <span className="lab-tag">
              <i /> Interactive 3D
            </span>
            <span className="lab-play">
              <span className="lab-play-btn">
                <PlayIcon size={18} />
              </span>
              <span>Open the Water Lab</span>
            </span>
          </button>

          <div className="lab-info">
            {CAN_DO.map((item, i) => (
              <article className={`lab-card reveal delay${i + 1}`} key={item.num}>
                <div className="kicker">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
