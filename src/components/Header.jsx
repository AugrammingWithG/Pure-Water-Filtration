import { CTA } from '../data/constants'
import { DropletLogo, PhoneIcon } from './icons'

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
      {/*
        The quote link always; click-to-call stacked under it once the layout
        drops the Why card, which is otherwise the only place the number
        appears — taking it off the page at exactly the size where it is the
        easiest thing to act on.
      */}
      <div className="header-actions">
        <a className="browse-btn" href={CTA.quote.href} target="_blank" rel="noopener">
          {CTA.quote.label}
        </a>
        <a className="call-btn" href={CTA.phone.href}>
          <PhoneIcon />
          {CTA.phone.label}
        </a>
      </div>
    </header>
  )
}
