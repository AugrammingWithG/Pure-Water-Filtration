import { SIDEBAR_LABELS, SYSTEM_ORDER } from '../data/constants'
import { HouseIcon, RainIcon, TapIcon } from './icons'

const SYSTEM_ICONS = {
  whole: HouseIcon,
  undersink: TapIcon,
  rain: RainIcon,
}

export default function Sidebar({ currentSystem, onSelectSystem }) {
  return (
    <div className="sidebar">
      {SYSTEM_ORDER.map((key) => {
        const Icon = SYSTEM_ICONS[key]
        const active = key === currentSystem
        return (
          <button
            key={key}
            className={`side-btn${active ? ' active' : ''}`}
            onClick={() => onSelectSystem(key)}
            aria-pressed={active}
            data-system={key}
          >
            <span className="ico">
              <Icon />
            </span>
            <span>{SIDEBAR_LABELS[key]}</span>
          </button>
        )
      })}
    </div>
  )
}
