import { useEffect, useState } from 'react'

/**
 * The page's entrance animation: every `.reveal` is given `visible` the first
 * time it comes near the viewport. One observer for the whole page, as in the
 * original concept — every section is in the tree from the first paint, so
 * there is nothing arriving later that would need re-observing.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
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
