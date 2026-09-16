import { createContext, useContext, useEffect, useState } from 'react'

/**
 * The page's entrance animation, in two layers. Every `.reveal` (and
 * `.reveal-stagger`) is given `visible` the first time it comes near the
 * viewport; every section is given `in-view` as its top edge arrives, and
 * the stylesheet uses that to choreograph the pieces inside it — the Lab's
 * cards, the contact rows — without each one needing a class of its own.
 * Both fire once: an entrance is made, not repeated.
 *
 * The fourteen sections between the Lab and the final ask are staged
 * differently: see Stage.jsx and usePresence below. They set when the
 * reader arrives and strike when they leave, so a flick back replays them.
 */
export function useReveal() {
  useEffect(() => {
    const once = (className, options) =>
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add(className)
          observer.unobserve(entry.target)
        })
      }, options)

    const reveals = once('visible', { threshold: 0.12 })
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => reveals.observe(el))

    /* a section has arrived once its top is in the upper 85% of the screen */
    const sections = once('in-view', { threshold: 0, rootMargin: '0px 0px -15% 0px' })
    document.querySelectorAll('.section, .hero').forEach((el) => sections.observe(el))

    return () => {
      reveals.disconnect()
      sections.disconnect()
    }
  }, [])
}

/**
 * True while the element is on screen, and the edge it last left by:
 * `from` is 1 when it went out below (so it will come back up from below)
 * and -1 when it went out above. The default margins count the element as
 * present while any of it crosses the band from 15% to 58% of the viewport:
 * low enough that a section snapped to the top is always in it, high enough
 * that the next section, peeking in at the bottom, is not yet.
 */
export function usePresence(ref, { threshold = 0, rootMargin = '-15% 0px -42% 0px' } = {}) {
  const [state, setState] = useState({ present: false, from: 1 })
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState((s) => (s.present ? s : { ...s, present: true }))
        } else {
          setState({ present: false, from: entry.boundingClientRect.top < 0 ? -1 : 1 })
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin])
  return state
}

/** The presence of the nearest Stage (Stage.jsx), for pieces that need it in JS. */
export const StageContext = createContext({ present: false, from: 1 })
export const useStage = () => useContext(StageContext)

export const prefersStill = () =>
  document.body.classList.contains('reduced-motion') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts from 0 to `target` over `duration`ms once `active`, easing out. */
export function useCountUp(target, decimals, active, delay, duration = 1400) {
  const [value, setValue] = useState(0)
  /* going inactive resets the figure, so the next run counts from nought again */
  const [wasActive, setWasActive] = useState(active)
  if (wasActive !== active) {
    setWasActive(active)
    if (!active) setValue(0)
  }
  useEffect(() => {
    if (!active) return undefined
    /* under reduced motion the count is instant: a zero-length run, no wait */
    const still = prefersStill()
    let frame
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = still ? 1 : Math.min(1, (now - start) / duration)
        setValue(target * (1 - (1 - p) ** 4))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, still ? 0 : delay * 1000)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [active, target, duration, delay])
  return value.toFixed(decimals)
}

/** Hold a class on <body> for as long as a flag is true. */
export function useBodyClass(name, on) {
  useEffect(() => {
    if (!on) return undefined
    document.body.classList.add(name)
    return () => document.body.classList.remove(name)
  }, [name, on])
}

/**
 * True once the page has scrolled past `offset`, and not yet within
 * `untilEnd` of the bottom — where the contact block already is the ask.
 */
export function useScrolledPast(offset, untilEnd = 0) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const end = document.documentElement.scrollHeight - window.innerHeight - untilEnd
      setPast(window.scrollY > offset && window.scrollY < end)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset, untilEnd])
  return past
}
