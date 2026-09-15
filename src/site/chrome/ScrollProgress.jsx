import { useEffect, useRef } from 'react'

/** The hairline reading-progress bar across the top of the page. */
export default function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%'
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div className="progress" ref={ref} />
}
