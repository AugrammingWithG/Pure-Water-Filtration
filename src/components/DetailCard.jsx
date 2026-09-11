export default function DetailCard({ eyebrow, title, desc }) {
  return (
    <div className="float-card card-detail">
      <div className="fc-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="detail-actions">
        <button className="primary">Overview</button>
        <button>How it works</button>
        <button>Specs</button>
      </div>
    </div>
  )
}
