import { useCountUp } from '../hooks/useCountUp'

/**
 * The yearly impact figures. Each counts up on first appearance, and again
 * from wherever it currently reads when the system changes.
 */
function Stat({ figure, label }) {
  const ref = useCountUp(figure)
  return (
    <div className="impact-row">
      <div>
        <b ref={ref} />
        <span>{label}</span>
      </div>
    </div>
  )
}

export default function ImpactCard({ bottles, waste, litres }) {
  return (
    <div className="float-card card-impact">
      <div className="fc-label">Estimated this year</div>
      <Stat figure={litres} label="Litres filtered" />
      <Stat figure={bottles} label="Bottles avoided" />
      <Stat figure={waste} label="Plastic waste diverted" />
    </div>
  )
}
