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
      <button className="browse-btn">Browse plans</button>
    </header>
  )
}
