import { useState } from 'react'
import { ArrowIcon, FunnelIcon, GlassIcon, InletIcon, KettleIcon, ShowerIcon, SparkleIcon, TankIcon } from '../icons'
import Stage from '../Stage'

/**
 * The reader picks the thing they actually notice at home; the panel answers
 * in the same language. Deliberately not a diagnosis — see the note it ends on.
 *
 * `lit` is which stops on the journey the concern points at, so the track
 * relights when the tab changes: a taste problem lives at the tap end, a
 * shower problem at the entry end, tank water at the source.
 */
const CONCERNS = [
  {
    key: 'taste',
    tab: 'Taste & smell',
    Icon: GlassIcon,
    title: 'From source to tap',
    state: 'KITCHEN FOCUS',
    lit: [2, 3],
    lead: 'Start at the kitchen tap.',
    answer:
      ' An under-sink system may be worth exploring when taste and odour are your main concern.',
  },
  {
    key: 'shower',
    tab: 'Shower & skin',
    Icon: ShowerIcon,
    title: 'From mains to shower',
    state: 'WHOLE-HOME FOCUS',
    lit: [0, 1],
    lead: 'Think beyond the kitchen.',
    answer:
      ' If your concern follows you into the shower and bathroom, whole-house filtration is worth discussing.',
  },
  {
    key: 'scale',
    tab: 'Scale & residue',
    Icon: KettleIcon,
    title: 'From hard water to home',
    state: 'PROTECTION FOCUS',
    lit: [1, 2],
    lead: 'Look at the whole system.',
    answer:
      ' If residue and mineral build-up are the issue, a specialist can assess your local water and recommend the right configuration.',
  },
  {
    key: 'tank',
    tab: 'Tank water',
    Icon: TankIcon,
    title: 'From tank to tap',
    state: 'RAINWATER FOCUS',
    lit: [0],
    lead: 'Start with your water source.',
    answer:
      ' Tank-water homes need a filtration approach designed around the stored water and intended use.',
  },
]

const JOURNEY = [
  ['Incoming', 'Water enters your home.', InletIcon],
  ['Filter', 'Targeted filtration stages.', FunnelIcon],
  ['Refine', 'Water is further treated.', SparkleIcon],
  ['Enjoy', 'Filtered water where needed.', GlassIcon],
]

export default function Decoder() {
  const [active, setActive] = useState(CONCERNS[0].key)
  const current = CONCERNS.find((c) => c.key === active)

  return (
    <Stage id="decoder" className="pale decoder" curtain="drain">
      <div className="container decoder-grid">
        <div className="decoder-intro stage-copy">
          <div className="eyebrow">Start with what you notice</div>
          <h2>Tell us what's bothering you. We'll show you where to look.</h2>
          <p>
            Forget the technical terms. Pick the thing you notice at home and we'll point at the
            part of the system that deals with it.
          </p>
          <div className="decoder-tabs" role="tablist" aria-label="Water concerns">
            {CONCERNS.map(({ key, tab, Icon }, i) => (
              <button
                key={key}
                className={`decoder-tab${key === active ? ' active' : ''}`}
                style={{ '--i': i }}
                role="tab"
                aria-selected={key === active}
                onClick={() => setActive(key)}
              >
                <Icon size={15} />
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* the instrument: re-keyed pieces re-enter on every tab change */}
        <div className="decoder-panel">
          <div className="decoder-top">
            <div>
              <small>Your water journey</small>
              <h3 className="decoder-title" key={current.key}>
                {current.title}
              </h3>
            </div>
            <span className="decoder-state" key={current.state}>
              {current.state}
            </span>
          </div>
          <div className="water-track" aria-hidden="true">
            <div className="track-fill" key={current.key} />
            {JOURNEY.map(([title, , Icon], i) => (
              <div
                className={`water-dot${current.lit.includes(i) ? ' lit' : ''}`}
                style={{ '--i': i }}
                key={title}
              >
                <Icon size={14} />
              </div>
            ))}
          </div>
          <div className="water-labels">
            {JOURNEY.map(([title, note], i) => (
              <div key={title} style={{ '--i': i }} className={current.lit.includes(i) ? 'lit' : ''}>
                <strong>{title}</strong>
                {note}
              </div>
            ))}
          </div>
          <div className="decoder-answer">
            <p aria-live="polite" className="decoder-reply" key={current.key}>
              <strong>{current.lead}</strong>
              {current.answer}
            </p>
            <a className="btn decoder-cta" href="#finder">
              Find my system <ArrowIcon />
            </a>
          </div>
          <p className="decoder-note">
            A visual guide, not a diagnosis. Final system suitability depends on your home, water
            source and site assessment.
          </p>
        </div>
      </div>
    </Stage>
  )
}
