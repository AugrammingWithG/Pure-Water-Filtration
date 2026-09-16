import { useRef } from 'react'
import { StageContext, usePresence } from './hooks'

/**
 * A section staged behind glass. The page snaps section to section, so
 * every arrival is a slide change, and each Stage plays one: a pane
 * (`.tide`) covers the section until the reader is on it, then leaves in
 * the way its `curtain` names — drains like water, slides like the wall
 * taken off the house, irises like a lens, turns like a page — and the
 * pieces inside choreograph behind it (stages.css).
 *
 * Presence, not a one-shot: `is-in` comes and goes with the section, so a
 * flick back replays the entrance, and `--from` is the edge the reader left
 * by, so pieces strike out that way and set again from it. Every piece is a
 * transition off the `--in` gate rather than a keyframe, which is what makes
 * the exit the entrance run backwards, shorter, for free.
 */
export default function Stage({ id, className = '', curtain, children, ...rest }) {
  const ref = useRef(null)
  const state = usePresence(ref)
  return (
    <StageContext.Provider value={state}>
      <section
        ref={ref}
        id={id}
        className={`section stage curtain-${curtain} ${className}${state.present ? ' is-in' : ''}`}
        style={{ '--from': state.from }}
        {...rest}
      >
        <i className="tide" aria-hidden="true" />
        {children}
      </section>
    </StageContext.Provider>
  )
}

/** A heading split so each word can land on its own (`--w` is its index). */
export function Words({ text }) {
  return text.split(' ').map((word, i) => (
    <span key={i}>
      <span className="word" style={{ '--w': i }}>
        {word}
      </span>{' '}
    </span>
  ))
}
