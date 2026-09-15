const SERVICES = [
  {
    title: 'Whole House Water Filtration',
    body: 'Filtered water from every tap, shower and appliance. Perfect for families who want complete protection.',
  },
  {
    title: 'Under Sink Water Filtration',
    body: 'Clean, great tasting drinking water straight from your kitchen tap. Compact and effective.',
  },
  {
    title: 'Rainwater Filtration Systems',
    body: 'Advanced UV filtration designed to make tank water safer for drinking, cooking and bathing.',
  },
]

export default function Services() {
  return (
    <section className="section pale" id="services">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">Our Services</div>
          <h2>Filtration for Every Part of Your Home</h2>
          <p>Three systems. One goal: better water where you need it.</p>
        </div>
        <div className="service-grid">
          {SERVICES.map((service, i) => (
            <article className={`service reveal${i ? ` delay${i}` : ''}`} key={service.title}>
              <div className="service-image" />
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <a className="link" href="#contact">
                  Learn More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
