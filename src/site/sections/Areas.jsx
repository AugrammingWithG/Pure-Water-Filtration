const CITIES = ['Perth', 'Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Gold Coast']

export default function Areas() {
  return (
    <section className="section areas">
      <div className="container area-layout">
        <div className="reveal">
          <div className="eyebrow">Pure Water, Across Australia</div>
          <h2>Proudly serving Australian homes.</h2>
          <p>
            Water quality varies from city to city. Your filtration should too. We provide tailored
            solutions and expert installation across our service areas.
          </p>
          <a className="btn outline" href="#contact">
            View Service Areas →
          </a>
          <div className="city-tags">
            {CITIES.map((city) => (
              <span className="city" key={city}>
                {city}
              </span>
            ))}
          </div>
        </div>
        <div className="map reveal delay2">
          <div className="aus" />
          <span className="pin p1" />
          <span className="pin p2" />
          <span className="pin p3" />
          <span className="pin p4" />
          <span className="pin p5" />
        </div>
      </div>
    </section>
  )
}
