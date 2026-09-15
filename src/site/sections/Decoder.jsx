import { useState } from 'react'
import { ArrowIcon } from '../icons'

/**
 * The reader picks the thing they actually notice at home; the panel answers
 * in the same language. Deliberately not a diagnosis — see the note it ends on.
 */
const CONCERNS = [
  {
    key: 'taste',
    tab: 'Taste & smell',
    title: 'From source to tap',
    state: 'KITCHEN FOCUS',
    lead: 'Start at the kitchen tap.',
    answer:
      ' An under-sink system may be worth exploring when taste and odour are your main concern.',
  },
  {
    key: 'shower',
    tab: 'Shower & skin',
    title: 'From mains to shower',
    state: 'WHOLE-HOME FOCUS',
    lead: 'Think beyond the kitchen.',
    answer:
      ' If your concern follows you into the shower and bathroom, whole-house filtration is worth discussing.',
  },
  {
    key: 'scale',
    tab: 'Scale & residue',
    title: 'From hard water to home',
    state: 'PROTECTION FOCUS',
    lead: 'Look at the whole system.',
    answer:
      ' If residue and mineral build-up are the issue, a specialist can assess your local water and recommend the right configuration.',
  },
  {
    key: 'tank',
    tab: 'Tank water',
    title: 'From tank to tap',
    state: 'RAINWATER FOCUS',
    lead: 'Start with your water source.',
    answer:
      ' Tank-water homes need a filtration approach designed around the stored water and intended use.',
  },
]

const JOURNEY = [
  ['Incoming', 'Water enters your home.'],
  ['Filter', 'Targeted filtration stages.'],
  ['Refine', 'Water is further treated.'],
  ['Enjoy', 'Filtered water where needed.'],
]

export default function Decoder() {
  const [active, setActive] = useState(CONCERNS[0].key)
  const current = CONCERNS.find((c) => c.key === active)

  return (
    <section className="section pale decoder" id="decoder">
      <div className="container decoder-grid">
        <div className="decoder-intro reveal-stagger">
          <div className="eyebrow">Start with what you notice</div>
          <h2>Tell us what's bothering you. We'll show you where to look.</h2>
          <p>
            Forget the technical terms. Pick the thing you notice at home and we'll point at the
            part of the system that deals with it.
          </p>
          <div className="decoder-tabs" role="tablist" aria-label="Water concerns">
            {CONCERNS.map((concern) => (
              <button
                key={concern.key}
                className={`decoder-tab${concern.key === active ? ' active' : ''}`}
                role="tab"
                aria-selected={concern.key === active}
                onClick={() => setActive(concern.key)}
              >
                {concern.tab}
              </button>
            ))}
          </div>
        </div>
        <div className="decoder-panel reveal from-right delay2">
          <div className="decoder-top">
            <div>
              <small>Your water journey</small>
              <h3>{current.title}</h3>
            </div>
            <span className="decoder-state">{current.state}</span>
          </div>
          <div className="water-track" aria-hidden="true">
            <div className="track-fill" />
            <div className="water-dot">01</div>
            <div className="water-dot">02</div>
            <div className="water-dot">03</div>
            <div className="water-dot">04</div>
          </div>
          <div className="water-labels">
            {JOURNEY.map(([title, note]) => (
              <div key={title}>
                <strong>{title}</strong>
                {note}
              </div>
            ))}
          </div>
          <div className="decoder-answer">
            <p aria-live="polite">
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
    </section>
  )
}
