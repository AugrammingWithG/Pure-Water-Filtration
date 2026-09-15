import { useRef, useState } from 'react'
import {
  ArrowIcon,
  BuildingIcon,
  CheckCircleIcon,
  CheckIcon,
  CompassIcon,
  DotsIcon,
  FamilyIcon,
  GlassIcon,
  HomeIcon,
  RainIcon,
  ShieldIcon,
  SparkleIcon,
  TankIcon,
} from '../icons'
import { useSite } from '../SiteContext'
import Stage from '../Stage'

const QUESTIONS = [
  {
    title: 'Where do you want better water?',
    choices: [
      {
        value: 'whole',
        label: 'Every tap',
        note: 'Kitchen, bathroom, shower and appliances.',
        Icon: HomeIcon,
      },
      {
        value: 'drink',
        label: 'Kitchen drinking water',
        note: 'Cleaner, better-tasting water at the tap.',
        Icon: GlassIcon,
      },
      {
        value: 'rain',
        label: 'Rainwater / tank',
        note: 'Filtration for homes using stored water.',
        Icon: RainIcon,
      },
      { value: 'unsure', label: 'I’m not sure', note: 'Help me work it out.', Icon: CompassIcon },
    ],
  },
  {
    title: 'What matters most to you?',
    choices: [
      {
        value: 'health',
        label: 'Whole-home protection',
        note: 'Cleaner water throughout the house.',
        Icon: ShieldIcon,
      },
      {
        value: 'taste',
        label: 'Better taste & smell',
        note: 'Focus on the water you drink.',
        Icon: SparkleIcon,
      },
      {
        value: 'family',
        label: 'Family comfort',
        note: 'Showers, skin, hair and everyday use.',
        Icon: FamilyIcon,
      },
      {
        value: 'simple',
        label: 'Keep it simple',
        note: 'A straightforward solution with minimal fuss.',
        Icon: CheckCircleIcon,
      },
    ],
  },
  {
    title: 'What kind of home are we looking at?',
    choices: [
      {
        value: 'house',
        label: 'Family home',
        note: 'Multiple bathrooms and regular daily use.',
        Icon: HomeIcon,
      },
      {
        value: 'apartment',
        label: 'Apartment / unit',
        note: 'Compact, targeted filtration may suit.',
        Icon: BuildingIcon,
      },
      {
        value: 'tankhome',
        label: 'Tank-water home',
        note: 'Rainwater is part of the supply.',
        Icon: TankIcon,
      },
      {
        value: 'other',
        label: 'Something else',
        note: 'A specialist can help assess it.',
        Icon: DotsIcon,
      },
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
    service: 'Under-sink filtration',
  },
  rain: {
    title: 'Rainwater Filtration',
    text: 'A rainwater system is the natural starting point for homes relying on stored tank water, subject to a site assessment.',
    service: 'Rainwater filtration',
  },
  unsure: {
    title: 'A Specialist Assessment',
    text: 'You have a few possible directions. Rather than guess, let a specialist look at your home, water source and priorities.',
  },
  default: {
    title: 'Whole House Filtration',
    text: 'A whole-house system is the strongest starting point when you want filtered water across the home.',
    service: 'Whole-house filtration',
  },
}

const CHECKS = ['No technical jargon', 'No obligation', 'A starting point, not a diagnosis']

const RESULT_POINTS = [
  'Water treated at the point of entry',
  'Cleaner water from multiple taps',
  'Designed around your local water',
]

export default function Finder() {
  const { openQuote } = useSite()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  /* which way the last question left, so the next one arrives from the other side */
  const [dir, setDir] = useState(1)
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
        [
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'none' },
        ],
        { duration: 220 },
      )
      return
    }
    setDir(1)
    if (step < QUESTIONS.length) setStep(step + 1)
    else setDone(true)
  }

  const onBack = () => {
    setDir(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  const restart = () => {
    setDir(-1)
    setDone(false)
    setStep(1)
    setAnswers([])
  }

  const result = RESULTS[answers[0]] ?? RESULTS.default
  const question = QUESTIONS[step - 1]

  return (
    <Stage id="finder" className="pale finder" curtain="iris">
      <div className="container finder-grid">
        <div className="stage-copy">
          <div className="eyebrow">Not sure what you need?</div>
          <h2>Find your best‑fit system in 30 seconds.</h2>
          <p>
            Answer three simple questions. We'll point you toward the system that makes the most
            sense for your home — then a specialist confirms the final recommendation.
          </p>
          <ul className="check-list">
            {CHECKS.map((line, i) => (
              <li key={line} style={{ '--i': i }}>
                <CheckIcon /> {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="finder-panel">
          <div className="finder-progress">
            <i style={{ transform: `scaleX(${done ? 1 : step / QUESTIONS.length})` }} />
          </div>
          {!done && (
            /* keyed on the step so a new question is a new element, and slides in */
            <div className="question" key={step} style={{ '--dir': dir }}>
              <h3>{question.title}</h3>
              <div className="choice-grid">
                {question.choices.map(({ value, label, note, Icon }, i) => (
                  <button
                    className={`choice${answers[step - 1] === value ? ' selected' : ''}`}
                    style={{ '--i': i }}
                    key={value}
                    onClick={() => choose(step - 1, value)}
                  >
                    <span className="choice-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>{note}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {done && (
            <div className="finder-result">
              <span className="result-badge">
                {/* a ring that draws itself round the badge */}
                <svg className="result-ring" aria-hidden="true">
                  <rect x="1" y="1" rx="999" pathLength="1" />
                </svg>
                Your starting point
              </span>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              <ul className="result-list">
                {RESULT_POINTS.map((line, i) => (
                  <li key={line} style={{ '--i': i }}>
                    <CheckIcon size={13} />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="actions">
                {/* the result's system is already the form's first answer */}
                <button className="btn" onClick={() => openQuote({ service: result.service })}>
                  Talk to a specialist <ArrowIcon />
                </button>
                <button className="link quiet" onClick={restart}>
                  Start again
                </button>
              </div>
            </div>
          )}
          {!done && (
            <div className="finder-nav">
              <button
                className="link quiet"
                style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
                onClick={onBack}
              >
                Back
              </button>
              <span className="finder-count">
                Question {step} of {QUESTIONS.length}
              </span>
              <button className="btn small" ref={nextRef} onClick={onNext}>
                {step === QUESTIONS.length ? 'See my result' : 'Next'} <ArrowIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </Stage>
  )
}
