/**
 * Every image on the proposal is served from `public/images/`, not imported
 * through the bundler — see the header of scripts/fetch-site-assets.mjs for
 * why. That choice has one sharp edge: a file in public/ is addressed by URL,
 * and this app is deployed under a base path (`/Pure-Water-Filtration/` on
 * GitHub Pages, see vite.config.js). A bare `/images/whole-house-unit.webp`
 * works in dev and 404s in production.
 *
 * So no section writes that path by hand. `img()` is the only place the base
 * is applied, which is what stops eleven sections each getting it right ten
 * times and wrong once.
 *
 *   <img src={img('whole-house-unit.webp')} />
 *   <img src={img('news/news-04-water-warning.webp')} />
 */
export function img(name) {
  return `${import.meta.env.BASE_URL}images/${name}`
}

/**
 * The same arrangement for the client's films, which live in `public/videos/`
 * and are copied byte for byte rather than re-encoded (see the VID block in
 * scripts/fetch-site-assets.mjs).
 *
 *   <video src={video('why-choose-us.mp4')} />
 */
export function video(name) {
  return `${import.meta.env.BASE_URL}videos/${name}`
}
