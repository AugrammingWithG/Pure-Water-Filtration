# Proposal news thumbnails

The eight press thumbnails for the proposal's "Have you heard the news?" section
(`src/proposal/sections/News.jsx`). Fetched by
`scripts/fetch-news-thumbnails.mjs` (`npm run news:fetch`), which is the whole
pipeline — nothing here is hand-edited, so re-running it reproduces the folder.

Each image is the outlet's own published thumbnail, and each headline is that
outlet's own `og:title`, read off the story rather than transcribed from a
screenshot.

| file | outlet | story |
| --- | --- | --- |
| `news-01-cancer-causing-chemicals.webp` | 9News | [Potential cancer-causing chemicals found in Australia's tap water](https://www.youtube.com/watch?v=B3DUacSu3l0) |
| `news-02-sydney-forever-chemicals.webp` | 9News | [New 'forever chemicals' discovered in Sydney tap water](https://www.youtube.com/watch?v=PbRgMbI97Fw) |
| `news-03-melbourne-contamination-warning.webp` | 7NEWS | [Urgent water contamination warning for Melbourne homes](https://www.youtube.com/watch?v=VYVPAQRt2vs) |
| `news-04-water-drained-forever-chemicals.webp` | 7NEWS | [Drinking water drained over fears it may be contaminated with 'forever chemicals'](https://www.youtube.com/watch?v=3FV7e7u7se0) |
| `news-05-fertility-link.webp` | 7NEWS | [Tap water chemicals linked to fertility issues](https://www.youtube.com/watch?v=jvE-saIkUi4) |
| `news-06-sydney-pfas-detected.webp` | ABC News | [Cancer-linked 'forever chemicals' PFAS detected in Sydney drinking water samples](https://www.abc.net.au/news/2024-08-20/australia-forever-chemicals-pfas-drinking-water-platypus/104244072) |
| `news-07-undrinkable-town.webp` | ABC News | [The Australian town with undrinkable, salty and corrosive tap water](https://www.abc.net.au/news/2024-03-12/quorn-tap-water-breaches-taste-guidelines-south-australia/103524088) |
| `news-08-bullsbrook-bottled-water.webp` | ABC News | [Residents living off bottled water due to PFAS contamination](https://www.abc.net.au/news/2024-10-12/bullsbrook-pfas-contaminated-water-solution-promised-by-defence/104463670) |

## Rights — not cleared

These images belong to the ABC, Nine and Seven. Pure Water Filtration has no
licence to republish them, and fetching them does not create one. Every card
links back to its source, which is attribution, not permission.

Before this section goes to a customer, one of:

1. the client clears each image with the outlet that owns it; or
2. the cards drop the image and run as headline-plus-link, which needs no
   licence and keeps the section's argument intact.

That is the client's call, not this repo's.
