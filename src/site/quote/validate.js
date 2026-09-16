/**
 * Field validation and the phone formatter. Messages say what to do, not
 * what went wrong, in the site's plain voice.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Digits only, with a leading +61 folded back to a 0. */
export function phoneDigits(value) {
  let d = String(value).replace(/\D/g, '')
  if (d.startsWith('61') && d.length >= 11) d = '0' + d.slice(2)
  return d
}

/**
 * True for the numbers an Australian household actually has: a ten-digit
 * mobile or landline starting with 0, or a 1300 / 1800 ten-digit number.
 */
export function isAuPhone(value) {
  const d = phoneDigits(value)
  return /^0[2-478]\d{8}$/.test(d) || /^1[38]00\d{6}$/.test(d)
}

/**
 * Format as the visitor types: 04XX XXX XXX for mobiles, 1300 XXX XXX for
 * 13/18 numbers, 0X XXXX XXXX for landlines. Anything else is left alone
 * so an international number is not mangled.
 */
export function formatPhone(value) {
  if (/^\s*\+/.test(value)) return value.replace(/[^\d+ ]/g, '')
  const d = phoneDigits(value).slice(0, 10)
  if (!d) return ''
  if (d.startsWith('04') || d.startsWith('05') || /^1[38]00/.test(d)) {
    return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 10)].filter(Boolean).join(' ')
  }
  if (d.startsWith('0')) {
    return [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10)].filter(Boolean).join(' ')
  }
  return d
}

/** The error message for one field against one value, or '' when it passes. */
export function validateField(field, value, answers) {
  const v = (value ?? '').toString().trim()
  if (field.required && !v) {
    if (field.type === 'choice' || field.type === 'select') return 'Choose one to continue'
    if (field.type === 'tel') return 'Enter a phone number we can reach you on'
    if (field.type === 'email') return 'Enter your email address'
    return `Enter your ${field.label.toLowerCase()}`
  }
  if (!v) return ''
  if (field.type === 'choice' && field.allowOther && v === 'Other') {
    if (!(answers[`${field.key}Other`] ?? '').trim()) return 'Tell us a little more'
  }
  if (field.type === 'email' && !EMAIL.test(v)) return 'Enter an email address like you@example.com'
  if (field.type === 'tel' && !isAuPhone(v)) return 'Enter a mobile or landline number, e.g. 04XX XXX XXX'
  if (field.type === 'postcode' && !/^\d{4}$/.test(v)) return 'Enter a four-digit postcode'
  return ''
}

/** Every failing field on a list, keyed by field key. */
export function validateFields(fields, answers) {
  const errors = {}
  for (const field of fields) {
    const message = validateField(field, answers[field.key], answers)
    if (message) errors[field.key] = message
  }
  return errors
}
