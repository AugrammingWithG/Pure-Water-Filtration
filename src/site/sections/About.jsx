export default function About() {
  return (
    <section className="section" id="about">
      <div className="container split">
        <div className="reveal">
          <div className="eyebrow">The Problem</div>
          <h2>Your water might be the problem.</h2>
          <p>
            Chlorine, sediment and excess minerals can affect your water, leave residue on your
            appliances, and take a toll on your skin and hair. It can even change the taste and
            smell of your water.
          </p>
          <a className="btn outline" href="#services">
            Discover Your Solution →
          </a>
        </div>
        <div className="photo reveal delay2">
          <div className="house" />
          <div className="filter-box" />
        </div>
      </div>
    </section>
  )
}
