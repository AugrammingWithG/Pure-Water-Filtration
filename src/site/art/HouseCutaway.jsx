/**
 * A house with one wall taken off, drawn in the page's own line.
 *
 * Mains water comes in from the left, passes the whole-house unit on the
 * entry wall, and runs on to the kitchen, the bathroom and the laundry. The
 * raw run is drawn in grey; everything past the unit is Tap Blue, and the
 * dashes travelling along it are the water moving. Replaces the CSS-drawn
 * gable that stood in for a photo.
 *
 * It draws itself as its section arrives (stages.css): every structural
 * line carries pathLength="1" and a draw order (`--d`), so the stylesheet
 * can run its dashoffset from 1 to 0 — ground, then walls, roof, rooms,
 * fixtures, pipes — before the flow and the labels come on. The grey specks
 * in the raw pipe are grit: they travel to the unit and stop at its face.
 */
const draw = (d, cls = '') => ({ pathLength: 1, className: `${cls} cw-draw`.trim(), style: { '--d': d } })

export default function HouseCutaway() {
  return (
    <svg
      className="cutaway"
      viewBox="0 0 640 440"
      role="img"
      aria-label="Cutaway of a home: mains water enters at the wall, passes through the whole-house filter, then reaches the kitchen, bathroom and laundry."
    >
      <defs>
        <linearGradient id="cw-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3f9fd" />
        </linearGradient>
      </defs>

      {/* ground */}
      <g className="cw-ground">
        <path d="M24 392h592" {...draw(0)} />
        <path d="M60 392v-16M100 392v-9M540 392v-12M580 392v-20" {...draw(1)} />
      </g>

      {/* the shell, front wall removed: walls, roof, chimney */}
      <path d="M160 392V200L340 80l180 120v192z" fill="url(#cw-wall)" className="cw-line cw-shell" />
      <path d="M160 392V200L340 80l180 120v192z" {...draw(1, 'cw-line')} />
      <path d="M440 158v-46h22v32" {...draw(2, 'cw-line')} />
      <path d="M140 212L340 80l200 132" {...draw(2, 'cw-roof')} />

      {/* floor and the two interior walls */}
      <path d="M160 392h360" {...draw(3, 'cw-line')} />
      <path d="M340 200v192M160 296h360" {...draw(3, 'cw-inner')} />

      <g className="cw-fixtures">
        {/* kitchen, top right: bench, sink, tap */}
        <path d="M360 222h150v18H360z" className="cw-fixture" />
        <path d="M452 222v-24a9 9 0 0118 0v6" className="cw-tap" />
        {/* bathroom, bottom right: shower and tub */}
        <path d="M382 342v-22h30" className="cw-tap" />
        <path d="M406 320v6M413 320v6" className="cw-tap" />
        <path d="M440 346h64v34h-64z" className="cw-fixture" />
        {/* laundry, bottom left: a washing machine */}
        <path d="M204 330h52v52h-52z" className="cw-fixture" />
        <circle cx="230" cy="358" r="15" className="cw-fixture" />
      </g>

      {/* the whole-house unit, inside the entry wall */}
      <g className="cw-unit-group">
        <rect x="170" y="236" width="30" height="60" rx="5" className="cw-unit" />
        <path d="M178 250h14M178 258h14M178 266h14" className="cw-unit-lines" />
      </g>

      {/* raw mains in */}
      <path d="M30 266h140" {...draw(4, 'cw-pipe cw-pipe-raw')} />
      <path d="M30 266h140" className="cw-flow cw-flow-raw" />
      {/* grit in the raw water: it gets as far as the unit and no further */}
      <g className="cw-grit" aria-hidden="true">
        <circle cx="34" cy="264.5" r="1.8" style={{ '--g': 0 }} />
        <circle cx="34" cy="267.5" r="1.4" style={{ '--g': 1 }} />
        <circle cx="34" cy="266" r="2.1" style={{ '--g': 2 }} />
        <circle cx="34" cy="264" r="1.3" style={{ '--g': 3 }} />
        <circle cx="34" cy="268" r="1.6" style={{ '--g': 4 }} />
      </g>

      {/* filtered: on to the kitchen tap, down to the bathroom, across to the laundry */}
      <path d="M200 266h120v-44h132v-24" {...draw(5, 'cw-pipe')} />
      <path d="M320 266v76h62v-22" {...draw(6, 'cw-pipe')} />
      <path d="M200 266h40v64" {...draw(6, 'cw-pipe')} />
      <g className="cw-flows">
        <path d="M200 266h120v-44h132v-24" className="cw-flow" />
        <path d="M320 266v76h62v-22" className="cw-flow cw-flow-2" />
        <path d="M200 266h40v64" className="cw-flow cw-flow-3" />
      </g>

      {/* labels */}
      <g className="cw-label">
        <text x="30" y="254" style={{ '--i': 0 }}>
          Mains in
        </text>
        <text x="170" y="228" style={{ '--i': 1 }}>
          Whole-house filter
        </text>
        <text x="360" y="212" style={{ '--i': 2 }}>
          Kitchen
        </text>
        <text x="440" y="336" style={{ '--i': 3 }}>
          Bathroom
        </text>
        <text x="204" y="322" style={{ '--i': 4 }}>
          Laundry
        </text>
      </g>
    </svg>
  )
}
