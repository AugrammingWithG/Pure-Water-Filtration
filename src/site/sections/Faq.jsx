import { useLayoutEffect, useRef, useState } from 'react'

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

/**
 * Each answer opens to its own height rather than to a guessed maximum, so a
 * long answer is never clipped and a short one does not leave the panel
 * hanging open. The height is measured from the element, which is why this is
 * a layout effect and not a style.
 */
function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const answerRef = useRef(null)
  const [maxHeight, setMaxHeight] = useState('0px')

  useLayoutEffect(() => {
    setMaxHeight(open && answerRef.current ? `${answerRef.current.scrollHeight}px` : '0px')
  }, [open])

  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {q}
        <span>+</span>
      </button>
      <div className="faq-a" ref={answerRef} style={{ maxHeight }}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <div className="reveal">
          <div className="eyebrow">Questions, answered simply</div>
          <h2>No pressure. Just useful information.</h2>
          <p>
            Buying a filtration system is a home decision, not a technical exam. Here are the
            questions people usually ask first.
          </p>
          <a className="btn outline" href="#contact">
            Ask a Specialist →
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
