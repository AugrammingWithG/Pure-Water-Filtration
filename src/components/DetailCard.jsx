import { PinIcon } from './icons'

export default function DetailCard({ eyebrow, title, desc, placement }) {
  return (
    <div className="float-card card-detail">
      <div className="fc-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {placement && (
        <div className="fc-placement">
          <PinIcon />
          <span>{placement}</span>
        </div>
      )}
      <div className="detail-actions">
        <button className="primary">Overview</button>
        <button>How it works</button>
        <button>Specs</button>
      </div>
    </div>
  )
}
