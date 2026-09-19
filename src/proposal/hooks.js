import { useEffect, useRef, useState } from 'react'

/**
 * Which section is in view, by id, for the right-edge dot nav. An
 * IntersectionObserver rather than measured offsets (compare
 * src/site/chrome/ScrollRail.jsx, which measures section tops by hand and
 * has to re-measure on a ResizeObserver to stay honest): a section growing
 * — the hero picking up the 3D house in PWF-015, a card list gaining rows —
 * never needs this to be told to re-check itself.
 *
 * The active section is whichever observed element has the most of itself
 * in the "reading band" — a horizontal strip a bit above the viewport's
 * centre. That keeps a short trailing section (Accept) from stealing the
 * active dot the instant its top edge appears.
 */
export function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0] ?? null)
  const ratios = useRef(new Map())

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (els.length === 0) return undefined

    ratios.current = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })
        let best = null
        let bestRatio = 0
        ratios.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        })
        if (best) setActive(best)
      },
      { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

/**
 * True once the hero has scrolled past — the single signal the sticky
 * header (transparent → solid) and the sticky bottom bar (hidden → shown)
 * both key off. A sentinel at the hero's own bottom edge, rather than a
 * fixed scrollY offset, so this stays correct however tall the hero ends
 * up once PWF-015 lands the 3D house in it.
 */
export function useHeroPassed(heroId = 'hero') {
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(heroId)
    if (!hero) return undefined

    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'position:absolute;bottom:0;left:0;width:1px;height:1px;'
    hero.style.position ||= 'relative'
    hero.appendChild(sentinel)

    const observer = new IntersectionObserver(([entry]) => setPassed(!entry.isIntersecting), {
      rootMargin: '0px',
    })
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [heroId])

  return passed
}
