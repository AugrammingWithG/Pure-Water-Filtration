# Benefits section assets

What the proposal's "What changes the day it is installed" section
(`src/proposal/sections/Benefits.jsx`) loads by URL.

## The film — supplied

`public/videos/why-choose-us.mp4` is the client's own piece to camera: Adrian,
in uniform, outside a home with the unit on the wall behind him. 360x640, 35
seconds, 1.5 MB. It is pulled by `scripts/fetch-site-assets.mjs`
(`npm run assets:fetch`) and copied byte for byte — sharp cannot open video,
and re-encoding a film nobody in this repo can watch is how it arrives at the
customer softer than the client shipped it.

Two more films exist on the client's site and are deliberately not pulled,
because nothing uses them: `/videos/hero-bg.mp4` (the homepage's muted
background loop) and `/videos/filter-change-guide-v2.mp4` (a servicing
walkthrough).

### `video-poster.webp` — generated

A frame from the film itself rather than a stock photo, so the still and the
first second of playback are the same picture. Regenerate it with:

```sh
ffmpeg -ss 0.1 -i public/videos/why-choose-us.mp4 -frames:v 1 \
  -c:v libwebp -quality 82 -y public/images/benefits/video-poster.webp
```

0.1s is the widest clean frame: he is standing still, the unit and the phone
number are both in shot. This is not wired into the fetch script, because that
script is meant to run anywhere and ffmpeg is not a dependency of this repo.

## `video-captions.en.vtt` — NOT supplied

The film has speech and no transcript. The `<track>` is already wired up and
will start working the moment this file exists; until then the browser simply
offers no captions. **Someone who can hear the film has to write it** — that is
the one accessibility requirement on this section still outstanding.

## The three card photos — interim

The reference comp wants a child with a glass, a woman in the shower and a
family at the washing machine. None of those exist. The client's entire media
library was swept (every page in their sitemap): 37 images, all product and
installation photography plus two water stills, containing **no people other
than staff, no bathroom, no laundry and no children**.

So the cards currently run on the nearest thing the client owns, set in
`BENEFITS` at the top of `Benefits.jsx`:

| card | showing | honest? |
| --- | --- | --- |
| Safer drinking water | `water-from-tap.webp` | yes — a tap filling a glass |
| Better skin and hair | `water-glass-clean.webp` | no — a glass says nothing about skin or hair |
| Longer life from your appliances | `whole-house-home-02.webp` | no — the unit, not an appliance |

Two of the three are standing in, and the `alt` text describes what is actually
in the frame rather than what the card is about, so a screen reader is not told
about a shower photo that is not there.

To replace one, change its `image` and `alt` in `BENEFITS` — one line each.
Shown at 4:3 and around 340 px wide, so ~1000 px on the longest side is plenty;
match the rest of the library and save as WebP. Two of the three stand-ins are
portrait, so the 4:3 slot crops them hard — worth a look before this goes out.
If any replacement is licensed stock, keep the licence with the client's
records: these go in front of a customer under their name.
