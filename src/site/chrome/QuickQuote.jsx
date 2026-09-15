import { useScrolledPast } from '../hooks'

/** The conversion prompt that arrives once the reader is past the first screen. */
export default function QuickQuote() {
  const visible = useScrolledPast(700)
  return (
    <div className={`quick-quote${visible ? ' visible' : ''}`}>
      <span>Know what you need?</span>
      <a className="btn" href="#contact">
        Get a free quote →
      </a>
    </div>
  )
}
