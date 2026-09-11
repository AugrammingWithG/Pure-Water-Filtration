/** Static sparkline — the legacy markup hard-codes both polylines. */
export default function TrendCard() {
  return (
    <div className="float-card card-trend">
      <div className="fc-label">Water quality over time</div>
      <svg width="150" height="46" viewBox="0 0 150 46">
        <polyline
          points="0,34 25,30 50,24 75,26 100,16 125,12 150,8"
          fill="none"
          stroke="#3FD8FF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polyline
          points="0,40 25,39 50,40 75,38 100,39 125,38 150,39"
          fill="none"
          stroke="#FFB37A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <div className="trend-legend">
        <span>
          <i className="dot" style={{ background: '#3FD8FF' }} />
          Filtered
        </span>
        <span>
          <i className="dot" style={{ background: '#FFB37A' }} />
          Unfiltered
        </span>
      </div>
    </div>
  )
}
