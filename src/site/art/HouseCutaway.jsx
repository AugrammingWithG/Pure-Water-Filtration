/**
 * A house with one wall taken off, drawn in the page's own line.
 *
 * Mains water comes in from the left, passes the whole-house unit on the
 * entry wall, and runs on to the kitchen, the bathroom and the laundry. The
 * raw run is drawn in grey; everything past the unit is Tap Blue, and the
 * dashes travelling along it are the water moving. Replaces the CSS-drawn
 * gable that stood in for a photo.
 */
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
      <path d="M24 392h592" className="cw-ground" />
      <path d="M60 392v-16M100 392v-9M540 392v-12M580 392v-20" className="cw-ground" />

      {/* the shell, front wall removed: walls, roof, chimney */}
      <path d="M160 392V200L340 80l180 120v192z" fill="url(#cw-wall)" className="cw-line" />
      <path d="M440 158v-46h22v32" className="cw-line" fill="#fff" />
      <path d="M140 212L340 80l200 132" className="cw-roof" />

      {/* floor and the two interior walls */}
      <path d="M160 392h360" className="cw-line" />
      <path d="M340 200v192M160 296h360" className="cw-inner" />

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

      {/* the whole-house unit, inside the entry wall */}
      <rect x="170" y="236" width="30" height="60" rx="5" className="cw-unit" />
      <path d="M178 250h14M178 258h14M178 266h14" className="cw-unit-lines" />

      {/* raw mains in */}
      <path d="M30 266h140" className="cw-pipe cw-pipe-raw" />
      <path d="M30 266h140" className="cw-flow cw-flow-raw" />

      {/* filtered: on to the kitchen tap, down to the bathroom, across to the laundry */}
      <path d="M200 266h120v-44h132v-24" className="cw-pipe" />
      <path d="M320 266v76h62v-22" className="cw-pipe" />
      <path d="M200 266h40v64" className="cw-pipe" />
      <path d="M200 266h120v-44h132v-24" className="cw-flow" />
      <path d="M320 266v76h62v-22" className="cw-flow cw-flow-2" />
      <path d="M200 266h40v64" className="cw-flow cw-flow-3" />

      {/* labels */}
      <g className="cw-label">
        <text x="30" y="254">
          Mains in
        </text>
        <text x="170" y="228">
          Whole-house filter
        </text>
        <text x="360" y="212">
          Kitchen
        </text>
        <text x="440" y="336">
          Bathroom
        </text>
        <text x="204" y="322">
          Laundry
        </text>
      </g>
    </svg>
  )
}
