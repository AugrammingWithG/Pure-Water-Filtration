import { useScrolledPast } from '../hooks'
import { ArrowIcon } from '../icons'

/**
 * The conversion prompt that arrives once the reader is past the first
 * screen. Desktop only: on a phone the action bar already pins the same
 * button to the same edge.
 */
export default function QuickQuote() {
  const visible = useScrolledPast(700, 1100)
  return (
    <div className={`quick-quote${visible ? ' visible' : ''}`}>
      <span>Know what you need?</span>
      <a className="btn small" href="#contact">
        Get a free quote <ArrowIcon size={12} />
      </a>
    </div>
  )
}
