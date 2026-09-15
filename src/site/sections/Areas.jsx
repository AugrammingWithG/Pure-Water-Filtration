import { useState } from 'react'
import AustraliaMap from '../art/AustraliaMap'
import { CITIES } from '../art/cities'
import { ArrowIcon, PinIcon } from '../icons'
import Stage from '../Stage'

/**
 * The map surveys itself as the section arrives — the coastline is drawn,
 * then filled, then the pins drop west to east (stages.css) — and a city
 * chip under the pointer lights its pin on the map: `data-city` on the
 * section is the bridge between the list and the drawing.
 */
export default function Areas() {
  const [city, setCity] = useState(null)
  return (
    <Stage id="areas" className="pale areas" curtain="diagonal" data-city={city ?? undefined}>
      <div className="container split">
        <div className="stage-copy">
          <div className="eyebrow">Across Australia</div>
          <h2>Proudly serving Australian homes.</h2>
          <p>
            Water quality varies from city to city. Your filtration should too. We provide tailored
            solutions and expert installation across our service areas.
          </p>
          <ul className="city-tags" aria-label="Cities served" onMouseLeave={() => setCity(null)}>
            {CITIES.map(({ name, slug }, i) => (
              <li
                className="chip"
                data-city={slug}
                style={{ '--i': i }}
                key={name}
                onMouseEnter={() => setCity(slug)}
                onFocus={() => setCity(slug)}
                onBlur={() => setCity(null)}
                tabIndex={0}
              >
                <PinIcon size={13} />
                {name}
              </li>
            ))}
          </ul>
          <a className="btn outline" href="#contact">
            Check your area <ArrowIcon />
          </a>
        </div>
        <div className="figure map">
          <AustraliaMap />
        </div>
      </div>
    </Stage>
  )
}
