import { useEffect, useRef } from 'react'

/** The soft pool of light that follows the pointer across the page. */
export default function CursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    const onMove = (e) => {
      const el = ref.current
      if (!el) return
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return <div className="cursor-glow" ref={ref} aria-hidden="true" />
}
