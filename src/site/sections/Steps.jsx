const STEPS = [
  ['Get in touch', 'Request a free quote or call us for a quick chat.'],
  ['Chat with a specialist', 'We’ll understand your water quality and needs.'],
  ['Your tailored solution', 'Get a customised plan and a transparent quote.'],
  ['Enjoy the difference', 'Cleaner, healthier water for your home.'],
]

export default function Steps() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-head reveal-stagger">
          <div className="eyebrow">How it works</div>
          <h2>A simple four-step process.</h2>
        </div>
        <ol className="steps">
          {STEPS.map(([title, body], i) => (
            <li className={`step reveal${i ? ` delay${i}` : ''}`} key={title}>
              <div className="step-num" aria-hidden="true">
                {i + 1}
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
