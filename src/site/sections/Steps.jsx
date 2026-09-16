import { ChatIcon, ClipboardIcon, GlassIcon, PhoneIcon } from '../icons'
import Stage from '../Stage'

/**
 * Four steps on one pipe: as the section arrives the pipe fills from the
 * left and each step lights as the water reaches it (stages.css), so the
 * order reads as a flow rather than a numbered list.
 */
const STEPS = [
  [PhoneIcon, 'Get in touch', 'Request a free quote or call us for a quick chat.'],
  [ChatIcon, 'Chat with a specialist', 'We’ll understand your water quality and needs.'],
  [ClipboardIcon, 'Your tailored solution', 'Get a customised plan and a transparent quote.'],
  [GlassIcon, 'Enjoy the difference', 'Cleaner, healthier water for your home.'],
]

export default function Steps() {
  return (
    <Stage id="how-it-works" className="how" curtain="wipe">
      <div className="container">
        <div className="section-head stage-copy">
          <div className="eyebrow">How it works</div>
          <h2>A simple four-step process.</h2>
        </div>
        <ol className="steps">
          {STEPS.map(([Icon, title, body], i) => (
            <li className="step" style={{ '--i': i }} key={title}>
              <div className="step-num" aria-hidden="true">
                <Icon size={17} />
                <b>{i + 1}</b>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Stage>
  )
}
