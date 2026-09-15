import { useRef, useState } from 'react'

const QUESTIONS = [
  {
    title: 'Where do you want better water?',
    choices: [
      { value: 'whole', label: 'Every tap', note: 'Kitchen, bathroom, shower and appliances.' },
      {
        value: 'drink',
        label: 'Kitchen drinking water',
        note: 'Cleaner, better-tasting water at the tap.',
      },
      { value: 'rain', label: 'Rainwater / tank', note: 'Filtration for homes using stored water.' },
      { value: 'unsure', label: 'I’m not sure', note: 'Help me work it out.' },
    ],
  },
  {
    title: 'What matters most to you?',
    choices: [
      {
        value: 'health',
        label: 'Whole-home protection',
        note: 'Cleaner water throughout the house.',
      },
      { value: 'taste', label: 'Better taste & smell', note: 'Focus on the water you drink.' },
      { value: 'family', label: 'Family comfort', note: 'Showers, skin, hair and everyday use.' },
      {
        value: 'simple',
        label: 'Keep it simple',
        note: 'A straightforward solution with minimal fuss.',
      },
    ],
  },
  {
    title: 'What kind of home are we looking at?',
    choices: [
      { value: 'house', label: 'Family home', note: 'Multiple bathrooms and regular daily use.' },
      {
        value: 'apartment',
        label: 'Apartment / unit',
        note: 'Compact, targeted filtration may suit.',
      },
      { value: 'tankhome', label: 'Tank-water home', note: 'Rainwater is part of the supply.' },
      { value: 'other', label: 'Something else', note: 'A specialist can help assess it.' },
    ],
  },
]

/**
 * Only the first answer decides the suggestion — the other two questions are
 * there to make the recommendation feel considered and to give the specialist
 * something to open the conversation with, which is honest enough as long as
 * the result keeps calling itself a starting point.
 */
const RESULTS = {
  drink: {
    title: 'Under Sink Filtration',
    text: 'An under-sink system is a strong starting point when your priority is cleaner, better-tasting drinking water at the kitchen tap.',
  },
  rain: {
    title: 'Rainwater Filtration',
    text: 'A rainwater system is the natural starting point for homes relying on stored tank water, subject to a site assessment.',
  },
  unsure: {
    title: 'A Specialist Assessment',
    text: 'You have a few possible directions. Rather than guess, let a specialist look at your home, water source and priorities.',
  },
  default: {
    title: 'Whole House Filtration',
    text: 'A whole-house system is the strongest starting point when you want filtered water across the home.',
  },
}

export default function Finder() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const nextRef = useRef(null)

  const choose = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const onNext = () => {
    if (!answers[step - 1]) {
      /* nothing picked yet: nudge the button rather than move on silently */
      nextRef.current?.animate(
        [{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }],
        { duration: 220 },
      )
      return
    }
    if (step < QUESTIONS.length) setStep(step + 1)
    else setDone(true)
  }

  const result = RESULTS[answers[0]] ?? RESULTS.default

  return (
    <section className="section finder" id="finder">
      <div className="container finder-grid">
        <div className="reveal">
          <div className="eyebrow">Not sure what you need?</div>
          <h2>Find your best-fit filtration system in 30 seconds.</h2>
          <p>
            Answer three simple questions. We'll point you toward the system that makes the most
            sense for your home — then you can speak to a specialist for the final recommendation.
          </p>
          <div className="audience">
            <span>Easy to understand</span>
            <span>No technical jargon</span>
            <span>No obligation</span>
          </div>
        </div>
        <div className="finder-panel reveal delay2">
          <div className="finder-progress">
            <i style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
          </div>
          {QUESTIONS.map((question, i) => (
            <div
              className={`question${!done && i === step - 1 ? ' active' : ''}`}
              data-q={i + 1}
              key={question.title}
            >
              <h3>{question.title}</h3>
              <div className="choice-grid">
                {question.choices.map((choice) => (
                  <button
                    className={`choice${answers[i] === choice.value ? ' selected' : ''}`}
                    key={choice.value}
                    onClick={() => choose(i, choice.value)}
                  >
                    <strong>{choice.label}</strong>
                    <small>{choice.note}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className={`finder-result${done ? ' active' : ''}`}>
            <span className="result-badge">YOUR STARTING POINT</span>
            <h3>{result.title}</h3>
            <p>{result.text}</p>
            <ul className="result-list">
              <li>Water treated at the point of entry</li>
              <li>Cleaner water from multiple taps</li>
              <li>Designed around your local water</li>
            </ul>
            <a className="btn" href="#contact">
              Talk to a Specialist →
            </a>
          </div>
          {!done && (
            <div className="finder-nav">
              <button
                style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                ← Back
              </button>
              <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                {step} of {QUESTIONS.length}
              </span>
              <button ref={nextRef} onClick={onNext}>
                {step === QUESTIONS.length ? 'See my result →' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
