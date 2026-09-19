/**
 * The first switch from navy to off-white: what the customer actually gets,
 * told as one film plus three outcomes. Sits directly under the news band, so
 * it answers the pressure that section builds rather than adding to it.
 *
 * Nothing here reads the proposal context. These three outcomes are the same
 * for every customer, so — like News — they are section-local rather than part
 * of the Proposal contract, which would otherwise mean copying them into every
 * future proposal JSON.
 *
 * Every asset here is the client's own, pulled off their site by
 * scripts/fetch-site-assets.mjs and referenced by URL rather than imported —
 * the same arrangement as the news thumbnails, so a replacement photo drops in
 * under the same name with no code change. `img()` and `video()` apply the
 * deploy's base path; see src/proposal/assets.js.
 */
import { useRef, useState } from 'react'
import { img, video } from '../assets'

/**
 * The single supply point for the film — the client's own piece to camera,
 * pulled off their site by scripts/fetch-site-assets.mjs.
 *
 * It is 360x640: shot on a phone, in portrait, 35 seconds long. That is not a
 * limitation to design around so much as a fact to design *to* — the player is
 * a centred 9:16 frame at the width the file actually is, because scaling a
 * 360px-wide source across a 1080px band would only show it soft. Swapping in
 * a landscape film later means changing `aspect` here and nothing else.
 *
 * `poster` is a frame lifted from the film itself rather than a stock photo,
 * so the still and the first second of playback are the same picture. See
 * public/images/benefits/README.md for the one command that regenerates it.
 *
 * `captions` points at a WebVTT track that does not exist yet — the film has
 * speech and no transcript has been written. It is wired up now because a
 * missing track degrades quietly (the browser just offers no captions) while a
 * forgotten one ships a video nobody deaf can follow.
 *
 * @type {{ src: string, poster: string, captions: string, aspect: string, title: string }}
 */
const VIDEO = {
  src: video('why-choose-us.mp4'),
  poster: img('benefits/video-poster.webp'),
  captions: img('benefits/video-captions.en.vtt'),
  aspect: '9 / 16',
  title: 'Adrian from Pure Water Filtration on why families choose a whole-house system',
}

/**
 * The photos are the client's own, from `public/images/` — INTERIM, and worth
 * knowing why before anyone assumes they were chosen.
 *
 * The reference comp wants a child with a glass, a woman in the shower and a
 * family at the washing machine. The client's entire media library was swept,
 * every page in their sitemap: it is product and installation photography plus
 * two water stills, with no bathroom, no laundry and nobody but staff in it.
 * So the first card gets a photo that genuinely shows what it claims, and the
 * other two get the nearest thing the client owns — which is a real decision
 * taken with the gap in view, not a match.
 *
 * `alt` describes what is actually in the frame, not what the card is about.
 * Someone using a screen reader gets the same photo everyone else gets; it is
 * the photo that is standing in, and writing the caption as though the shower
 * shot were there would hide that from exactly one group of readers.
 *
 * Replacing these is one line each — see public/images/benefits/README.md for
 * the three subjects to shoot or license.
 *
 * @typedef {Object} Benefit
 * @property {string} id
 * @property {string} image - filename inside public/images/
 * @property {string} alt - describes the photo, for anyone who cannot see it
 * @property {() => JSX.Element} icon
 * @property {string} title
 * @property {string} body
 */

/** @type {Benefit[]} */
const BENEFITS = [
  {
    id: 'drinking-water',
    image: 'water-from-tap.webp',
    alt: 'Filtered water running from a kitchen tap into a glass',
    icon: DropIcon,
    title: 'Safer drinking water',
    body: 'Protect your family by removing potentially harmful levels of chlorine and metals, so every glass poured anywhere in the house tastes clean and fresh.',
  },
  {
    id: 'skin-and-hair',
    image: 'water-glass-clean.webp',
    alt: 'A glass of clear filtered water on a kitchen bench',
    icon: SparkleIcon,
    title: 'Better skin and hair',
    body: 'Enjoy softer, healthier and shinier hair and skin, with showers that no longer smell like a swimming pool.',
  },
  {
    id: 'appliances',
    image: 'whole-house-home-02.webp',
    alt: 'A Pure Water Filtration unit mounted on the outside wall of a home',
    icon: ApplianceIcon,
    title: 'Longer life from your appliances',
    body: 'Sediment and scale never reach your kettle, dishwasher or washing machine, so they run better and last years longer between repairs.',
  },
]

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c3.2 3.6 5.2 6.4 5.2 8.9a5.2 5.2 0 1 1-10.4 0c0-2.5 2-5.3 5.2-8.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ApplianceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <rect x="4.2" y="3.2" width="15.6" height="17.6" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="13.4" r="4.1" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="6.6" r="1" fill="currentColor" />
      <circle cx="11.2" cy="6.6" r="1" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path d="M9 5.6 19 12 9 18.4V5.6Z" fill="currentColor" />
    </svg>
  )
}

/**
 * Until a photo exists the browser would draw its broken-image glyph across the
 * card. Marking the card instead leaves the tinted photo slot in place, which
 * is what the layout is built on anyway.
 */
function hideMissingImage(event) {
  event.currentTarget.closest('.pr-benefit-card')?.classList.add('is-missing')
}

/**
 * The poster frame carries its own play control rather than showing the
 * browser's, for two reasons: the native control set on an unplayed video is a
 * different shape in every browser, and a poster with `controls` already on
 * would stack two play buttons on top of each other. Once it is playing the
 * native controls take over — scrubbing, volume and the captions menu are all
 * work this section has no business reimplementing badly.
 *
 * No `autoPlay` and no `muted`: nothing makes a sound until someone asks it to.
 */
function BenefitsVideo() {
  const videoRef = useRef(null)
  const [started, setStarted] = useState(false)

  function play() {
    videoRef.current?.play()
  }

  return (
    <figure className="pr-benefits-video" style={{ aspectRatio: VIDEO.aspect }}>
      <video
        ref={videoRef}
        src={VIDEO.src}
        poster={VIDEO.poster}
        controls={started}
        preload="metadata"
        playsInline
        onPlay={() => setStarted(true)}
        onEnded={() => setStarted(false)}
      >
        <track kind="captions" src={VIDEO.captions} srcLang="en" label="English" default />
      </video>

      {!started && (
        <button type="button" className="pr-video-play" onClick={play}>
          <PlayIcon />
          <span className="pr-sr-only">Play video: {VIDEO.title}</span>
        </button>
      )}
    </figure>
  )
}

export default function Benefits() {
  return (
    <section id="benefits" className="pr-section band-off" aria-labelledby="benefits-h">
      <div className="pr-wrap">
        <div className="pr-benefits-head">
          <span className="pr-eyebrow on-light">Benefits of pure water</span>
          <h2 id="benefits-h">What changes the day it is installed</h2>
          <p className="pr-benefits-lead">
            Three differences our customers notice first, usually within the first fortnight.
          </p>
        </div>

        <ul className="pr-benefits-grid">
          {BENEFITS.map(({ id, image, alt, icon: Icon, title, body }) => (
            <li key={id} className="pr-benefit-card">
              <img
                src={img(image)}
                alt={alt}
                loading="lazy"
                decoding="async"
                onError={hideMissingImage}
              />
              <div className="pr-benefit-body">
                <span className="pr-benefit-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Under the cards, not between them and the head. In the reference the
            three cards sit directly beneath the subhead — the big play triangle
            in that screenshot washes over the header and the bottom bar too, so
            it belongs to the screen recorder the comp was captured through, not
            to this section. The film is still worth having, so it runs after the
            argument the cards make rather than interrupting it.

            It is paired with copy rather than centred on its own: the file is a
            9:16 phone video, and a tall narrow frame alone in a 1080px band is
            mostly empty band. Beside a short intro it reads as what it is — a
            person, talking — and the panel gives the portrait shape a reason to
            be that tall. */}
        <aside className="pr-benefits-film">
          <BenefitsVideo />
          <div className="pr-benefits-film-copy">
            <span className="pr-eyebrow on-light">A word from the team</span>
            <h3>Meet Adrian</h3>
            <p>
              Thirty-five seconds on why customers choose Pure Water Filtration, filmed on site at
              a whole-house install.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
