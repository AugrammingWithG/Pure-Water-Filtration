import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CTA } from '../../data/constants'
import { ArrowIcon, CheckIcon, MailIcon, PhoneIcon } from '../icons'
import { ChoiceGroup, SelectField, TextArea, TextField } from './fields'
import { stateForPostcode } from './postcodes'
import { activeFields, activeSteps } from './schema'
import { mailtoHref, submitQuote, summaryLines, summaryText } from './submit'
import { clearDraft, useDraft } from './useDraft'
import { formatPhone, validateFields } from './validate'

/**
 * The quote form: the client's Instant Quote questions, one small screen at
 * a time, ending on a summary the visitor can check before it goes.
 *
 * `prefill` arrives from elsewhere on the page — the finder's result, a
 * service card, the pricing-guide button — and pre-answers the first
 * question so the visitor lands one step in. `prefill.key` changes on every
 * request so the same button pressed twice still lands here twice.
 */
const AUTO_ADVANCE_MS = 260

export default function QuoteForm({ prefill }) {
  const [answers, setAnswers] = useState({})
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ mode: 'idle' })
  const [copied, setCopied] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const stateAuto = useRef(true) // the state field still follows the postcode
  const headingRef = useRef(null)
  const firstInvalidRef = useRef(null)
  const advanceTimer = useRef(0)
  const { pending, save, dismiss } = useDraft()

  const steps = useMemo(() => activeSteps(answers), [answers])
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const fields = useMemo(() => activeFields(step, answers), [step, answers])
  const total = steps.length
  const current = steps.indexOf(step) + 1

  /* remember progress, but not a finished request */
  useEffect(() => {
    if (status.mode === 'idle' || status.mode === 'error') save(answers, stepIndex)
  }, [answers, stepIndex, status.mode, save])

  /* each new screen announces itself and takes focus, so a keyboard or
     screen-reader visitor is never left on a button that just vanished —
     but not on first paint, where the form is far below the fold */
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    headingRef.current?.focus({ preventScroll: true })
  }, [step?.key, status.mode])

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  /* after Next is refused, focus lands on the first field that needs fixing —
     only then, not on a single field's blur check, which would drag focus back */
  const wantFocus = useRef(false)
  useEffect(() => {
    if (!wantFocus.current) return
    wantFocus.current = false
    firstInvalidRef.current?.focus()
  }, [errors])

  /* a prefill from the page pre-answers the first question and moves on:
     state adjusted in render, keyed on the prefill, rather than in an effect */
  const [seenPrefill, setSeenPrefill] = useState(null)
  if (prefill?.key && prefill.key !== seenPrefill) {
    setSeenPrefill(prefill.key)
    dismiss()
    setStatus({ mode: 'idle' })
    setErrors({})
    setAnswers((prev) => (prefill.service ? { ...prev, service: prefill.service } : prev))
    setStepIndex(prefill.service && prefill.service !== 'Filter replacements' ? 1 : 0)
  }

  const set = useCallback((key, value) => {
    const guess = key === 'postcode' && stateAuto.current ? stateForPostcode(value) : ''
    const touched = guess ? [key, 'state'] : [key]
    if (key === 'state') stateAuto.current = !value
    setAnswers((prev) => (guess ? { ...prev, [key]: value, state: guess } : { ...prev, [key]: value }))
    /* an answer clears its own error — and the state's, when the postcode filled it */
    setErrors((prev) => {
      if (!touched.some((k) => prev[k])) return prev
      const next = { ...prev }
      touched.forEach((k) => delete next[k])
      return next
    })
  }, [])

  const goTo = (index, count = total) => {
    clearTimeout(advanceTimer.current)
    setErrors({})
    setStepIndex(Math.max(0, Math.min(index, count - 1)))
  }

  /**
   * Validate this screen and move on if it is clean. `from` is the answers
   * as they will be once React has caught up — an auto-advance fires on the
   * answer that was just chosen, and that answer may add or remove steps.
   */
  const advance = (from = answers) => {
    const stepsNow = activeSteps(from)
    const stepNow = stepsNow[Math.min(stepIndex, stepsNow.length - 1)]
    const found = validateFields(activeFields(stepNow, from), from)
    if (Object.keys(found).length) {
      wantFocus.current = true
      setErrors(found)
      return false
    }
    goTo(stepIndex + 1, stepsNow.length)
    return true
  }

  /** After a single-choice answer, move on by itself once the screen is complete. */
  const autoAdvance = (key, value) => {
    const from = { ...answers, [key]: value }
    const stepsNow = activeSteps(from)
    const stepNow = stepsNow[Math.min(stepIndex, stepsNow.length - 1)]
    const clean = !Object.keys(validateFields(activeFields(stepNow, from), from)).length
    if (!clean) return
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => advance(from), AUTO_ADVANCE_MS)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!step.review) {
      advance()
      return
    }
    setStatus({ mode: 'sending' })
    try {
      const result = await submitQuote(answers, prefill, honeypot)
      clearDraft()
      setStatus(result)
    } catch (err) {
      setStatus({ mode: 'error', message: err.message })
    }
  }

  const restart = () => {
    clearDraft()
    dismiss()
    stateAuto.current = true
    setAnswers({})
    setErrors({})
    setStatus({ mode: 'idle' })
    setCopied(false)
    goTo(0)
  }

  const resume = () => {
    setAnswers(pending.answers)
    setStepIndex(pending.stepIndex ?? 0)
    dismiss()
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(answers, prefill))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the summary is on screen to select by hand */
    }
  }

  /* ---------- finished states ---------- */

  if (status.mode === 'sent') {
    return (
      <div className="quote-panel quote-done" aria-live="polite">
        <span className="result-badge">Request sent</span>
        <h3 ref={headingRef} tabIndex={-1}>
          Thanks{answers.firstName ? `, ${answers.firstName}` : ''}. We'll be in touch same business day.
        </h3>
        <p>
          A specialist will call or email to talk through your home and water, then follow up with
          a transparent quote. No obligation.
        </p>
        <div className="actions">
          <a className="btn outline" href={CTA.phone.href}>
            <PhoneIcon size={14} /> Prefer to talk? Call {CTA.phone.label}
          </a>
          <button type="button" className="link quiet" onClick={restart}>
            Send another request
          </button>
        </div>
      </div>
    )
  }

  if (status.mode === 'offline') {
    const lines = summaryLines(answers, prefill)
    return (
      <div className="quote-panel quote-done" aria-live="polite">
        <span className="result-badge">One more step</span>
        <h3 ref={headingRef} tabIndex={-1}>
          Send your request by email.
        </h3>
        <p>
          Online sending isn't switched on for this site yet, so your answers below go to us from
          your own mail app — the button opens a message with everything filled in.
        </p>
        <ul className="quote-summary" aria-label="Your answers">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="actions">
          <a className="btn" href={mailtoHref(answers, prefill)}>
            <MailIcon size={14} /> Send by email <ArrowIcon />
          </a>
          <button type="button" className="btn outline" onClick={copySummary}>
            {copied ? (
              <>
                <CheckIcon size={13} /> Copied
              </>
            ) : (
              'Copy my answers'
            )}
          </button>
        </div>
        <p className="contact-note">
          Or ring <a href={CTA.phone.href}>{CTA.phone.label}</a> and read them out — Mon – Fri, 8am – 4pm.{' '}
          <button type="button" className="link quiet" onClick={restart}>
            Start again
          </button>
        </p>
      </div>
    )
  }

  /* ---------- the form ---------- */

  /* the first field with an error takes the ref that `advance` focuses */
  const firstInvalidKey = fields.find((f) => errors[f.key])?.key
  const refFor = (key) => (key === firstInvalidKey ? firstInvalidRef : undefined)

  return (
    <form className="quote-panel" onSubmit={onSubmit} noValidate>
      {pending && status.mode === 'idle' && (
        <div className="quote-resume" role="status">
          <span>You started a request earlier. Pick up where you left off?</span>
          <div>
            <button type="button" className="btn small" onClick={resume}>
              Resume
            </button>
            <button type="button" className="link quiet" onClick={restart}>
              Start fresh
            </button>
          </div>
        </div>
      )}

      <div className="finder-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${current / total})` }} />
      </div>
      <p className="finder-count">
        Step {current} of {total}
        {prefill?.intent === 'pricing-guide' && ' · Pricing guide'}
      </p>

      <div className="quote-step" key={step.key}>
        <h3 className="quote-title" ref={headingRef} tabIndex={-1}>
          {step.title}
        </h3>

        {step.review ? (
          <Review answers={answers} steps={steps} onEdit={goTo} prefill={prefill} />
        ) : (
          <div className="quote-fields">
            {fields.map((field) => {
              const common = { field, value: answers[field.key], error: errors[field.key] }
              if (field.type === 'choice') {
                return (
                  <ChoiceGroup
                    key={field.key}
                    {...common}
                    inputRef={refFor(field.key)}
                    otherValue={answers[`${field.key}Other`]}
                    onChange={(v) => set(field.key, v)}
                    onOtherChange={(v) => set(`${field.key}Other`, v)}
                    onAutoAdvance={(v) => autoAdvance(field.key, v)}
                  />
                )
              }
              if (field.type === 'select') {
                return (
                  <SelectField
                    key={field.key}
                    {...common}
                    onChange={(v) => set(field.key, v)}
                    inputRef={refFor(field.key)}
                  />
                )
              }
              if (field.type === 'textarea') {
                return <TextArea key={field.key} {...common} onChange={(v) => set(field.key, v)} />
              }
              return (
                <TextField
                  key={field.key}
                  {...common}
                  inputRef={refFor(field.key)}
                  onChange={(v) => set(field.key, field.type === 'tel' ? formatPhone(v) : v)}
                  onBlur={() => {
                    const found = validateFields([field], answers)
                    if (found[field.key]) setErrors((prev) => ({ ...prev, ...found }))
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* bots fill every field; people never see this one */}
      <input
        className="q-honey"
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {status.mode === 'error' && (
        <p className="q-error q-error-block" role="alert">
          {status.message}
        </p>
      )}

      <div className="finder-nav">
        <button
          type="button"
          className="link quiet"
          style={{ visibility: current > 1 ? 'visible' : 'hidden' }}
          onClick={() => goTo(stepIndex - 1)}
        >
          Back
        </button>
        {step.review ? (
          <button type="submit" className="btn" disabled={status.mode === 'sending'}>
            {status.mode === 'sending' ? 'Sending…' : 'Send my request'} <ArrowIcon />
          </button>
        ) : (
          <button type="submit" className="btn small">
            {current === total - 1 ? 'Review' : 'Next'} <ArrowIcon />
          </button>
        )}
      </div>
    </form>
  )
}

/** The last screen: everything answered, grouped by step, each group editable. */
function Review({ answers, steps, onEdit, prefill }) {
  return (
    <div className="quote-review">
      {steps
        .filter((s) => !s.review)
        .map((s, i) => {
          const rows = activeFields(s, answers)
            .filter((f) => answers[f.key])
            .map((f) => [
              f.label,
              f.allowOther && answers[f.key] === 'Other'
                ? `Other — ${answers[`${f.key}Other`] ?? ''}`
                : answers[f.key],
            ])
          if (!rows.length) return null
          return (
            <section className="quote-review-group" key={s.key}>
              <header>
                <h4>{s.title}</h4>
                <button type="button" className="link" onClick={() => onEdit(i)}>
                  Edit
                </button>
              </header>
              <dl>
                {rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
      <p className="contact-note">
        {prefill?.intent === 'pricing-guide' && "We'll send the pricing guide with our reply. "}
        We'll only use these details to talk to you about your quote. No obligation, and no
        pushy sales.
      </p>
    </div>
  )
}
