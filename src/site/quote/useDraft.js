import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A half-finished quote survives a reload, a tab closed by mistake, or a
 * phone that went to sleep. Answers are written to localStorage a moment
 * after each change and offered back on the next visit; nothing is restored
 * silently, so a visitor is never surprised by a form already filled in.
 *
 * The key is versioned: if the schema changes shape, bump DRAFT_VERSION and
 * old drafts are ignored rather than half-applied.
 */
const KEY = 'pwf-quote-draft'
const DRAFT_VERSION = 1
const DEBOUNCE_MS = 400

function read() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.v !== DRAFT_VERSION || !parsed.answers) return null
    return parsed
  } catch {
    return null
  }
}

function write(answers, stepIndex) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: DRAFT_VERSION, answers, stepIndex, at: Date.now() }))
  } catch {
    /* private mode or full: the form still works, it just won't remember */
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}

/**
 * `pending` is the saved draft found on mount (if any) until the visitor
 * resumes or discards it. `save` debounces writes; call it on every change.
 */
export function useDraft() {
  const [pending, setPending] = useState(() => {
    const draft = read()
    // an empty draft is not worth offering back
    return draft && Object.values(draft.answers).some((v) => v) ? draft : null
  })
  const timer = useRef(0)

  const save = useCallback((answers, stepIndex) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => write(answers, stepIndex), DEBOUNCE_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const dismiss = useCallback(() => setPending(null), [])

  return { pending, save, dismiss }
}
