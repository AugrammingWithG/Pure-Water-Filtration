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

/**
 * The pointer tilt on the card grids. Written against the DOM rather than as
 * React state because it runs on every pointer move over a card: the transform
 * is a style on one element, and routing it through a render would rebuild the
 * grid around it for no reason.
 */
export function useCardTilt() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.service,.benefit,.review'))
    const onMove = (e) => {
      const card = e.currentTarget
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.transform = `translateY(-8px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`
    }
    const onLeave = (e) => {
      e.currentTarget.style.transform = ''
    }
    cards.forEach((card) => {
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
    })
    return () =>
      cards.forEach((card) => {
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
        card.style.transform = ''
      })
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

/** True once the page has scrolled past `offset`. */
export function useScrolledPast(offset) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return past
}
