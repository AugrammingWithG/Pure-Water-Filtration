import { CITIES } from './cities'

/**
 * The mainland and Tasmania, simplified to about fifty points, with a pin on
 * each city the site names. Coordinates are longitude 112–155 → x 0–100 and
 * latitude 10–44 → y 0–100, so a city is placed by its real position rather
 * than by eye. Replaces the fourteen-point polygon that stood in for the
 * continent.
 */
const MAINLAND =
  'M70.9 2 L72.6 4.6 74.4 9.8 76.3 14.6 78.6 20.3 80.9 27.4 83.6 30.2 86.5 32.6 ' +
  '89.5 39.4 92.4 44.9 95.8 51.5 96.7 54.7 95.2 60 92.6 67.4 91.2 70.3 90 73.8 ' +
  '88.4 79.7 84.8 83.6 80 85.6 77.9 82.2 76.7 81.8 73.3 85 68.8 83.2 66.3 82 ' +
  '64 77.9 60.5 75.3 59.3 69.1 57.6 71.4 55.8 72.9 54.7 72 51.2 68.9 46.5 64.7 ' +
  '41.8 64.9 37.2 64.7 30.2 69.1 25.6 70.6 23 70.3 18.6 72.6 13.7 73.5 9.5 73.4 ' +
  '7 71.8 7.3 68 9 64.7 7.8 60 6 55.3 4.4 51 3.5 47 4 41.4 4.9 35 9.6 32 ' +
  '15.3 30.3 19.4 26.9 23.7 23.5 27.9 19.1 30.6 14.8 33.7 11.8 37 12.7 39.5 14.7 ' +
  '41.4 10.2 43.7 7 47.7 4.4 51 5.6 54.6 4.8 57 5.9 57.7 6.8 57.4 12 58.1 17.6 ' +
  '61 20.4 64 22 67.4 17.6 68.2 12.4 68.6 7.4 69.6 4.6 Z'

const TASMANIA =
  'M76 90.3 L79.6 89.8 83.7 90.6 84.4 94.7 83 97.4 81.4 98.5 78.8 98.2 77.9 97 76.4 94.6 Z'

function labelPos({ x, y, label }) {
  if (label === 'end') return { x: x - 2.4, y: y + 1, anchor: 'end' }
  if (label === 'below') return { x, y: y + 5.2, anchor: 'middle' }
  if (label === 'start-below') return { x: x + 2.6, y: y + 4.2, anchor: 'start' }
  return { x: x + 2.6, y: y + 1, anchor: 'start' }
}

export default function AustraliaMap() {
  return (
    <svg
      className="aus-map"
      viewBox="-8 -2 128 104"
      role="img"
      aria-label="Map of Australia with the six cities Pure Water Filtration serves: Perth, Adelaide, Melbourne, Sydney, Brisbane and Gold Coast."
    >
      {/* pathLength="1": the coastline is drawn by the stylesheet as the section arrives */}
      <path d={MAINLAND} className="aus-land" pathLength="1" />
      <path d={TASMANIA} className="aus-land" pathLength="1" style={{ '--d': 1 }} />
      {CITIES.map((city, i) => {
        const pos = labelPos(city)
        return (
          <g key={city.name} className="aus-city" data-city={city.slug} style={{ '--i': i }}>
            <circle cx={city.x} cy={city.y} r="2.4" className="aus-ping" />
            <circle cx={city.x} cy={city.y} r="1.15" className="aus-pin" />
            <text x={pos.x} y={pos.y} textAnchor={pos.anchor} className="aus-name">
              {city.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
