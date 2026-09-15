const STEPS = [
  ['01', 'Get in Touch', 'Request a free quote or call us for a quick chat.'],
  ['02', 'Chat With a Specialist', 'We’ll understand your water quality and needs.'],
  ['03', 'Your Tailored Solution', 'Get a customised plan and transparent quote.'],
  ['04', 'Enjoy the Difference', 'Cleaner, healthier water for your home.'],
]

export default function Steps() {
  return (
    <section className="section pale">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">How It Works</div>
          <h2>A simple 4-step process.</h2>
        </div>
        <div className="steps">
          {STEPS.map(([num, title, body], i) => (
            <article className={`step reveal${i ? ` delay${i}` : ''}`} key={num}>
              <div className="step-num">{num}</div>
              <h3>{title}</h3>
              <p>{body}</p>
              {i < STEPS.length - 1 && <span className="arrow">→</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
