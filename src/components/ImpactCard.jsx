import { formatFigure } from '../data/figures'
import { useCountUp } from '../hooks/useCountUp'

/**
 * The yearly impact figures. Each counts up on first appearance, and again
 * from wherever it currently reads when the system changes.
 */
function Stat({ figure, label, unit }) {
  return (
    <div className="impact-row">
      <div>
        <b>{formatFigure(figure, { unit })}</b>
        <span>{label}</span>
      </div>
    </div>
  )
}

export default function ImpactCard({ bottles, waste, litres }) {
  const progress = useCountUp(true, `${litres}/${bottles}/${waste}`)

  return (
    <div className="float-card card-impact">
      <div className="fc-label">Estimated this year</div>
      <Stat figure={litres * progress} label="Litres filtered" unit="L" />
      <Stat figure={bottles * progress} label="Bottles avoided" />
      <Stat figure={waste * progress} label="Plastic waste diverted" unit="kg" />
    </div>
  )
}
