import LabControls from '../lab/LabControls'
import LabStage from '../lab/LabStage'
import { useMiniLab } from '../lab/useMiniLab'

/**
 * The Water Lab, live on the page. The frame on the left is the diorama
 * itself — orbit it, click a unit, watch the water — and the three cards on
 * the right are the Lab's three moves as working controls. One piece of
 * state (useMiniLab) sits under both, so the scene and the cards always
 * agree. The full-screen Lab is still one button away for the reader who
 * wants the cards, the figures and the whole chrome.
 */
export default function WaterLab() {
  const lab = useMiniLab()
  return (
    <section className="section dark feature water-lab" id="water-lab">
      <div className="container">
        <div className="section-head split-head reveal-stagger">
          <div>
            <div className="eyebrow">The Water Lab</div>
            <h2>
              Don't just read about filtration. <em>See it.</em>
            </h2>
          </div>
          <p>
            A live 3D home showing where each Pure Water system goes and how water moves through
            its stages. Take hold of it here, or open it full screen.
          </p>
        </div>

        <div className="lab-stage">
          <LabStage lab={lab} />
          <LabControls lab={lab} />
        </div>
      </div>
    </section>
  )
}
