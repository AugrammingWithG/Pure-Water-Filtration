import { useEffect, useRef, useState } from 'react'
import { LINKS } from '../navLinks'

/**
 * The page's scrollbar, drawn by the page. A frosted rail down the right
 * edge with a glowing thumb that can be dragged, a track that can be
 * clicked, and a dot for every section the nav names — hover one for its
 * name, click it to go there. It fades back after a moment of stillness
 * and returns on scroll or hover. The native scrollbar is hidden beneath it
 * on pointer devices only (see the stylesheet); phones keep their own.
 */
const STOPS = [...LINKS, ['#contact', 'Get a quote']]
const MIN_THUMB = 40
const IDLE_AFTER = 1400

export default function ScrollRail() {
  const trackRef = useRef(null)
  const thumbRef = useRef(null)
  const [stops, setStops] = useState([])
  const [active, setActive] = useState(-1)
  const [idle, setIdle] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const doc = document.documentElement
    const track = trackRef.current
    const thumb = thumbRef.current
    let idleTimer
    let targets = []

    const maxScroll = () => Math.max(1, doc.scrollHeight - window.innerHeight)
    const navH = () => parseFloat(getComputedStyle(doc).getPropertyValue('--nav-h')) || 0

    /* where each stop sits along the rail, as a fraction of the scroll range */
    const measure = () => {
      const max = maxScroll()
      targets = STOPS.map(([href]) => {
        const el = document.querySelector(href)
        const top = el ? el.getBoundingClientRect().top + window.scrollY - navH() : 0
        return Math.min(top, max)
      })
      setStops(targets.map((t, i) => ({ href: STOPS[i][0], label: STOPS[i][1], at: t / max })))
      paint()
    }

    const paint = () => {
      const max = maxScroll()
      const railH = track.clientHeight
      const thumbH = Math.max(MIN_THUMB, (window.innerHeight / doc.scrollHeight) * railH)
      const y = (Math.min(window.scrollY, max) / max) * (railH - thumbH)
      thumb.style.height = `${thumbH}px`
      thumb.style.transform = `translateY(${y}px)`
      let current = -1
      targets.forEach((t, i) => {
        if (window.scrollY >= t - 2) current = i
      })
      setActive(current)
    }

    const wake = () => {
      setIdle(false)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setIdle(true), IDLE_AFTER)
    }
    const onScroll = () => {
      paint()
      wake()
    }

    measure()
    idleTimer = setTimeout(() => setIdle(true), IDLE_AFTER)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    /* content grows and shrinks (an FAQ opening, images arriving) */
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => {
      clearTimeout(idleTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [])

  /* drag the thumb: the page follows the pointer one-to-one, snapping off
     for the duration so the thumb is not fought over */
  const onThumbDown = (e) => {
    e.preventDefault()
    const doc = document.documentElement
    const track = trackRef.current
    const thumb = thumbRef.current
    const startY = e.clientY
    const startScroll = window.scrollY
    const range = track.clientHeight - thumb.offsetHeight
    const max = doc.scrollHeight - window.innerHeight
    setDragging(true)
    document.body.classList.add('rail-drag')
    const onMove = (ev) => {
      const top = startScroll + ((ev.clientY - startY) / range) * max
      window.scrollTo({ top: Math.max(0, Math.min(max, top)), behavior: 'instant' })
    }
    const onUp = () => {
      setDragging(false)
      document.body.classList.remove('rail-drag')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  /* click the empty track: jump to that point (the page then settles on
     the nearest section, as any scroll does) */
  const onTrackClick = (e) => {
    if (e.target !== trackRef.current) return
    const doc = document.documentElement
    const rect = trackRef.current.getBoundingClientRect()
    const thumbH = thumbRef.current.offsetHeight
    const frac = (e.clientY - rect.top - thumbH / 2) / (rect.height - thumbH)
    const max = doc.scrollHeight - window.innerHeight
    window.scrollTo({ top: Math.max(0, Math.min(1, frac)) * max, behavior: 'smooth' })
  }

  const go = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <nav
      className={`scroll-rail${idle ? ' idle' : ''}${dragging ? ' dragging' : ''}`}
      aria-label="Page sections"
    >
      <div className="scroll-rail-track" ref={trackRef} onClick={onTrackClick}>
        <div className="scroll-rail-thumb" ref={thumbRef} onPointerDown={onThumbDown} aria-hidden="true" />
        {stops.map((s, i) => (
          <button
            key={s.href}
            type="button"
            className={`scroll-rail-stop${i === active ? ' on' : ''}`}
            style={{ top: `${s.at * 100}%` }}
            aria-label={s.label}
            aria-current={i === active ? 'location' : undefined}
            onClick={() => go(s.href)}
          >
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
