# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in order:

1. **The client, Pure Water Filtration** (purewaterfiltration.com.au), evaluating this as a pitch: a proposal for a redesigned marketing site with an interactive 3D "Water Lab". They are judging whether it represents their business truthfully, whether it would win them customers, and whether it is worth adopting. Success is the client saying yes.
2. **Australian homeowners** who would visit the site once it were live: people who have noticed something wrong with their water (taste, smell, scale, tank water safety) or are comparing filtration options, on any device, often on a phone. Their job is to work out which of three systems fits their home and then ask for a quote or ring.

The team building it is a small student/agency group (repo contributors: Hans Harold Lee Flores, Joegramming, Augnina Krizel Reburiano); the client is the subject of the work, not yet a confirmed stakeholder.

## Product Purpose

A single-page marketing site plus an interactive 3D diorama that shows, inside a cutaway house, where each Pure Water Filtration product is installed and how water moves through its stages. It exists to make a service that is normally invisible (pipes, cartridges, membranes) legible and persuasive, and to route interested homeowners to a quote or a phone call.

Success for the pitch: the client can see their own products, their own wording, and a credible lead path, and wants it built for real.

## Positioning

The thing a neighbouring installer's site could not truthfully copy: the visitor can *see* filtration happen in a model of a home, stage by stage, for all three of the client's real systems (whole house point-of-entry, under-sink RO, rainwater + UV). The water visibly clears through each element, slows in media, and grit is caught on the first filter face. Everything the scene shows is tied to the client's own published stage descriptions.

## Operating Context

- The client's real business: residential water filtration across Australia; three product lines; CTAs are "Instant quote" (a form) and phone 1300 720 031.
- The prototype is deployed as a static site on GitHub Pages under `/Pure-Water-Filtration/` from `docs/` (Vite `build.outDir`). No server.
- The 3D scene is fill-rate bound and tuned for integrated graphics and phones: dpr capped, quality governor steps tiers down, the Water Lab is mounted only while open. Any new visual work must not fight these constraints.
- Reviewed in browsers by the client; the 3D lab is a modal launched from the page, not the landing viewport.

## Capabilities and Constraints

- **Stack (existing):** Vite 8, React 19, @react-three/fiber + drei, Three.js; plain CSS in `src/site/styles/site.css` and `src/styles/index.css`; ESLint. No Tailwind, no component library, no router (single page, hash anchors).
- **Three systems** with a shared four-stage model (`sediment`, `carbon`, `ro`, `tap`) whose labels are overridden per system (whole-house "Polish", rainwater "Multi-stage"/"UV"). Terminology for stages and products lives in `src/data/constants.js` and must stay the client's wording.
- **Lead capture (confirmed direction):** the on-site quote form is meant to be a *real* form that eventually submits somewhere (email service, Formspree, or the client's CRM). Backend is **undecided**. Design and harden it as a real form; the current toast-only `showToast` behaviour is a stub, not the intent. Until a backend exists, the phone number and the link to `purewaterfiltration.com.au/contact` are the only working conversion paths.
- **Undecided:** service-area coverage claims, warranty/finance offers, and whether the invented cost/savings figures may ever be shown (see Evidence).

## Brand Commitments

- Name: **Pure Water Filtration** (rendered as "Pure Water" in some eyebrows; the legacy concept file used "PureWater"; the client's own site is the authority on the mark).
- Voice: the client's own copy, taken from purewaterfiltration.com.au product pages and blog posts, is used verbatim or trimmed; the codebase treats "in their words" as a rule. Plain, practical, family-and-home oriented Australian English (colour, odour, litres).
- Per-system accent colours already drive the UI (`data-system` on `.app`); the 3D cards and scene are the incumbent visual authority for the product side.
- No logo file, brand guide, or typography spec from the client exists in the repo. Do not invent a logo as if it were theirs.

## Evidence on Hand

**Confirmed by the team as real:**
- 5.0 Google rating and the three named reviews in `src/site/sections/Reviews.jsx` (Jaxon Jarvis, Adam CJ, Bianca Camuglia).

**Taken from the client's public site, not re-confirmed with the client** (treat as sourced, not verified; keep attributable to the site):
- Product/stage copy and the per-system facts in `src/data/constants.js` (`SYSTEM_DATA.facts`: "5 micron", "3 stages", "6–12 months", "95%+", "Under 1 hour", "Same day", "UV").
- "Why us" claims (`WHY_US`): lifetime warranty with the Filter Care Plan, $0 upfront / 6–36 months interest-free through Humm, tailored to your area.
- Service areas: "50+ service areas" and the city list Perth, Sydney, Melbourne, Brisbane, Adelaide, Gold Coast (`src/site/sections/Areas.jsx`).

**Explicitly invented, must not be presented as fact:**
- `MVP_FIGURES` in `src/data/constants.js` (annual cost, five-year cost, litres, bottles, waste). They exist for the 3D cards at the team's request and are documented as needing real numbers before any customer-facing use.

**Absent, do not fabricate:** client logo and brand assets, real product photography, case studies, press, certifications, pricing, an actual list of the 50+ service areas, and a working quote backend. The only image asset is `src/site/assets/water-lab.png`; textures under `src/assets/textures` are for the 3D environment.

## Product Principles

1. **Show, don't claim.** The 3D lab is the argument. Anything on the page should point at, frame, or hand off to what the visitor can see happening.
2. **The client's words are the copy.** New sections may structure and trim, but product and stage language stays theirs; invented statistics are quarantined and labelled.
3. **Every path ends at a quote or a call.** The site is a lead funnel first; exploration exists to make the ask easy to say yes to.
4. **Respect the frame budget.** The scene is already at the edge of what integrated graphics and phones can hold; visual ambition on the page must not cost the lab its frame rate.
5. **Pitch-grade honesty.** The client will read this as a representation of their business; nothing on it should require a "we'll fix that before launch" caveat.

## Accessibility & Inclusion

No client-specified standard. The codebase already commits to keyboard operation of the 3D walkthrough (Space, arrows, Home/End, tabbable markers), a skip link, and a quality governor for low-end devices; keep those as the floor. Visitors skew to homeowners on phones, so mobile reach and touch targets matter more than desktop flourish.
