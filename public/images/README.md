# Images

Every image the rebuilt page uses. Served from `public/` rather than imported
through the bundler, so a photo can be swapped under the same name with no code
change and no rebuild.

**Reference them with `img()` from `src/proposal/assets.js`, never as a bare
`/images/...` string** — the GitHub Pages build is served under a base path, and
a root-relative URL works in dev then 404s in production.

```jsx
import { img } from '../assets'
;<img src={img('whole-house-unit.webp')} alt="…" loading="lazy" />
```

## What is here

| group | files | source |
| --- | --- | --- |
| `whole-house-*.webp` | 12 | client site |
| `under-sink-*.webp` | 7 | client site |
| `rainwater-*.webp` | 11 | client site |
| `cartridge*.webp` | 4 | client site |
| `water-*.webp` | 3 | client site — the only non-product photography they own |
| `filter-change-guide.webp` | 1 | client site — a poster of small type, not a photo |
| `news/` | 8 | press screenshots, **not yet supplied** — see `news/README.md` |
| `benefits/` | 1 | the proposal film's poster frame, cut from the film itself — see `benefits/README.md` |

Films live alongside this folder in `public/videos/`, pulled by the same script
and read through `video()` rather than `img()`.

The client photos are pulled and re-encoded by `scripts/fetch-site-assets.mjs`
(`npm run assets:fetch`), which is the whole pipeline — nothing here is
hand-edited, so re-running it reproduces the folder. Add a photo by adding a row
to that script's `ASSETS` list, not by dropping a file in here.

## Before using one in front of the client

Only the 14 photos that predate the full-library pull were hand-checked. The
rest were taken wholesale off the client's sitemap and **have not been
eyeballed**. Check for the installer's job-tracking stamp (bottom-left corner)
and for third-party watermarks; the script's `trimBottom` handles the stamp
where it is known about, per photo series.
