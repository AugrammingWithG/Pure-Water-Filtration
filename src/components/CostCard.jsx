import { useCountUp } from '../hooks/useCountUp'

export default function CostCard({ before, after, savings }) {
  const beforeRef = useCountUp(before)
  const afterRef = useCountUp(after)
  const savingsRef = useCountUp(savings)

  return (
    <div className="float-card card-cost">
      <div className="fc-label">Annual water cost</div>
      <div className="cost-row">
        <div className="cost-col cost-before">
          <span>Before</span>
          <b ref={beforeRef} />
        </div>
        <div className="cost-col cost-after">
          <span>Filtered</span>
          <b ref={afterRef} />
        </div>
      </div>
      <div className="savings-pill">
        Saves <span ref={savingsRef} />/yr
      </div>
    </div>
  )
}
