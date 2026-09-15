import { useEffect, useState } from 'react'

/**
 * The page's entrance animation, in two layers. Every `.reveal` (and
 * `.reveal-stagger`) is given `visible` the first time it comes near the
 * viewport; every section is given `in-view` as its top edge arrives, and
 * the stylesheet uses that to choreograph the pieces inside it — the step
 * numbers, the decoder's track, the map pins — without each one needing a
 * class of its own. Both fire once: an entrance is made, not repeated.
 * One pass over the tree, as in the original concept — every section is in
 * the tree from the first paint, so nothing arrives later that would need
 * re-observing.
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
