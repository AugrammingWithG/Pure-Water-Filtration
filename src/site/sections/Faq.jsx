import { useState } from 'react'
import { ArrowIcon, PlusIcon } from '../icons'

const FAQS = [
  {
    q: 'Do I need whole-house filtration?',
    a: 'If you want cleaner water from showers, bathroom taps, kitchen taps and appliances, whole-house filtration is the natural system to discuss. The right setup depends on your home and local water.',
  },
  {
    q: 'Will filtered water taste different?',
    a: 'Many customers notice a difference in taste and odour, particularly where chlorine or other water characteristics are noticeable. Your result depends on your incoming water and selected system.',
  },
  {
    q: 'How often do filters need replacing?',
    a: 'Replacement timing depends on the system, water usage and local conditions. A maintenance plan can make this easier to manage without having to remember everything yourself.',
  },
  {
    q: 'Can you tell me which system I need?',
    a: 'Yes. You can use the quick finder above as a starting point, then a specialist can assess your home, water source and priorities before recommending a system.',
  },
  {
    q: 'Do you offer payment options?',
    a: 'Interest-free payment options may be available for eligible customers. Ask the team about current options and terms when requesting your quote.',
  },
]

/** One question; the answer opens to its own height (see .faq-a in site.css). */
function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {q}
        <span className="faq-toggle">
          <PlusIcon />
        </span>
      </button>
      <div className="faq-a">
        <div>
          <p>{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <section className="section pale faq" id="faq">
      <div className="container split split-narrow">
        <div className="reveal">
          <div className="eyebrow">Common questions</div>
          <h2>No pressure. Just useful answers.</h2>
          <p>
            Buying a filtration system is a home decision, not a technical exam. Here are the
            questions people usually ask first.
          </p>
          <a className="btn outline" href="#contact">
            Ask a specialist <ArrowIcon />
          </a>
        </div>
        <div className="faq-list reveal delay2">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
