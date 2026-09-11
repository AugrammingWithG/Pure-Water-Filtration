export default function ImpactCard({ bottles, waste }) {
  return (
    <div className="float-card card-impact">
      <div className="fc-label">Estimated this year</div>
      <div className="impact-row">
        <div>
          <b>{bottles}</b>
          <span>Bottles avoided</span>
        </div>
      </div>
      <div className="impact-row">
        <div>
          <b>{waste}</b>
          <span>Plastic waste diverted</span>
        </div>
      </div>
    </div>
  )
}
