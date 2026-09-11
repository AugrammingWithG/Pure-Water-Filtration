export default function CostCard({ before, after, savings }) {
  return (
    <div className="float-card card-cost">
      <div className="fc-label">Annual water cost</div>
      <div className="cost-row">
        <div className="cost-col cost-before">
          <span>Before</span>
          <b>{before}</b>
        </div>
        <div className="cost-col cost-after">
          <span>Filtered</span>
          <b>{after}</b>
        </div>
      </div>
      <div className="savings-pill">
        Saves <span>{savings}</span>/yr
      </div>
    </div>
  )
}
