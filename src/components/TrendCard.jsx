/** Static sparkline; the filtered line takes the active system's accent. */
export default function TrendCard() {
  return (
    <div className="float-card card-trend">
      <div className="fc-label">Water quality over time</div>
      <svg width="150" height="46" viewBox="0 0 150 46">
        <polyline
          points="0,34 25,30 50,24 75,26 100,16 125,12 150,8"
          fill="none"
          style={{ stroke: 'var(--accent)' }}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polyline
          points="0,40 25,39 50,40 75,38 100,39 125,38 150,39"
          fill="none"
          style={{ stroke: 'var(--amber)' }}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <div className="trend-legend">
        <span>
          <i className="dot" style={{ background: 'var(--accent)' }} />
          Filtered
        </span>
        <span>
          <i className="dot" style={{ background: 'var(--amber)' }} />
          Unfiltered
        </span>
      </div>
    </div>
  )
}
