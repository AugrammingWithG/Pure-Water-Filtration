import { CTA } from '../../data/constants'
import { allActiveFields } from './schema'

/**
 * Where a finished request goes.
 *
 * With VITE_QUOTE_ENDPOINT set (see .env.example), the answers are POSTed
 * as JSON — the shape any form-to-email service (Web3Forms, Formspree, a
 * small function of the client's own) accepts. Without it, there is nowhere
 * to send to, and this module says so (`mode: 'offline'`) rather than
 * pretending: the form then hands the visitor a prefilled email and the
 * phone number, which are the two channels that do work today.
 */
const ENDPOINT = import.meta.env.VITE_QUOTE_ENDPOINT

/** The visitor's answers, only the fields that applied, in form order. */
export function buildPayload(answers, prefill) {
  const wants = prefill ?? {}
  const fields = allActiveFields(answers)
  const payload = {}
  for (const field of fields) {
    const value = answers[field.key]
    if (value == null || value === '') continue
    payload[field.key] =
      field.allowOther && value === 'Other' ? `Other: ${answers[`${field.key}Other`] ?? ''}`.trim() : value
  }
  if (wants.intent === 'pricing-guide') payload.wants = 'Pricing guide'
  payload.source = 'purewaterfiltration.com.au redesign — quote form'
  return payload
}

/** The same answers as readable lines, for the email body and the clipboard. */
export function summaryLines(answers, prefill) {
  const lines = []
  for (const field of allActiveFields(answers)) {
    const value = answers[field.key]
    if (value == null || value === '') continue
    const shown = field.allowOther && value === 'Other' ? `Other — ${answers[`${field.key}Other`] ?? ''}` : value
    lines.push(`${field.label.replace(/\?$/, '')}: ${shown}`)
  }
  if (prefill?.intent === 'pricing-guide') lines.push('Also: please send the pricing guide')
  return lines
}

export function summaryText(answers, prefill) {
  return summaryLines(answers, prefill).join('\n')
}

/** A mailto: carrying the whole request, for the no-backend path. */
export function mailtoHref(answers, prefill) {
  const subject = ['Quote request', answers.service, answers.suburb].filter(Boolean).join(' – ')
  const body = `Hi Pure Water Filtration,\n\nI'd like a quote. Here are my details:\n\n${summaryText(answers, prefill)}\n\nThanks,\n${answers.firstName ?? ''}`
  return `${CTA.email.href}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Resolves to `{ mode: 'sent' }`, `{ mode: 'offline' }`, or throws with a
 * message the form can show. The honeypot is passed through so a real
 * endpoint can drop bot submissions server-side.
 */
export async function submitQuote(answers, prefill, honeypot = '') {
  if (!ENDPOINT) return { mode: 'offline' }
  if (honeypot) return { mode: 'sent' } // a bot filled the hidden field; pretend and drop it
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(buildPayload(answers, prefill)),
  })
  if (!res.ok) throw new Error(`The form service answered ${res.status}. Please try again, or call ${CTA.phone.label}.`)
  return { mode: 'sent' }
}
