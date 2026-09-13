import { CTA } from '../data/constants'
import { DropletLogo } from './icons'

export default function Header({ title, subtitle }) {
  return (
    <header>
      <div>
        <div className="brand">
          <DropletLogo size={20} />
          <span>
            Pure Water <em>Filtration</em>
          </span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <a className="browse-btn" href={CTA.quote.href} target="_blank" rel="noopener">
        {CTA.quote.label}
      </a>
    </header>
  )
}
