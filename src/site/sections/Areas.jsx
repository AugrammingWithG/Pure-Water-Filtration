import AustraliaMap from '../art/AustraliaMap'
import { ArrowIcon } from '../icons'

const CITIES = ['Perth', 'Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Gold Coast']

export default function Areas() {
  return (
    <section className="section pale areas" id="areas">
      <div className="container split">
        <div className="reveal-stagger">
          <div className="eyebrow">Across Australia</div>
          <h2>Proudly serving Australian homes.</h2>
          <p>
            Water quality varies from city to city. Your filtration should too. We provide tailored
            solutions and expert installation across our service areas.
          </p>
          <ul className="city-tags" aria-label="Cities served">
            {CITIES.map((city) => (
              <li className="chip" key={city}>
                {city}
              </li>
            ))}
          </ul>
          <a className="btn outline" href="#contact">
            Check your area <ArrowIcon />
          </a>
        </div>
        <div className="figure map reveal from-right delay2">
          <AustraliaMap />
        </div>
      </div>
    </section>
  )
}
