import { SECTIONS } from '../sections'
import { useScrollSpy } from '../hooks'

const IDS = SECTIONS.map(([id]) => id)

/**
 * The right-edge scroll-spy dot nav — one dot per section, in scroll order.
 * The active dot follows `useScrollSpy`; clicking a dot scrolls to that
 * section, which is what then makes it active, so the two never fight.
 */
export default function SectionDots() {
  const active = useScrollSpy(IDS)

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <nav className="pr-dots" aria-label="Proposal sections">
      {SECTIONS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={`pr-dot${id === active ? ' on' : ''}`}
          aria-label={label}
          aria-current={id === active ? 'location' : undefined}
          onClick={() => go(id)}
        >
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
