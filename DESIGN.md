---
name: Pure Water Filtration
description: A glass-cutaway showroom for home water filtration, where the page is the showroom and the Water Lab is the instrument.
colors:
  deep-reservoir: "#06284a"
  reservoir-shallow: "#0a3c68"
  tap-blue: "#0879e8"
  filtered-cyan: "#42c9ff"
  still-water: "#eef9ff"
  waterline: "#dcebf4"
  ink: "#082b4c"
  muted: "#668097"
  white: "#ffffff"
  reservoir-floor: "#041e37"
  lab-night: "#061b2e"
  section-pale: "#f6fbfe"
  lab-mist: "#eef1f5"
  lab-mist-light: "#f8f9fb"
  lab-navy: "#1c2f7c"
  lab-ink: "#0f1c33"
  lab-ink-dim: "#5d6c85"
  accent-whole: "#2e8fe0"
  accent-undersink: "#17b3c6"
  accent-rain: "#2fb872"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(46px, 5.6vw, 76px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 48px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "2px"
  lab-title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  lab-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  lab-label:
    fontFamily: "Inter, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.07em"
rounded:
  chip: "8px"
  choice: "15px"
  panel: "14px"
  tile: "18px"
  card: "24px"
  card-lg: "30px"
  pill: "999px"
spacing:
  xs: "10px"
  sm: "18px"
  md: "25px"
  lg: "45px"
  section: "110px"
  section-mobile: "75px"
  container: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.tap-blue}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 21px"
  button-primary-hover:
    backgroundColor: "{colors.tap-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "14px 21px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.tap-blue}"
    rounded: "{rounded.pill}"
    padding: "14px 21px"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.tap-blue}"
    rounded: "{rounded.pill}"
    padding: "14px 21px"
  button-dark:
    backgroundColor: "{colors.deep-reservoir}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "14px 21px"
  chip-city:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
  choice:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.choice}"
    padding: "17px"
  card-service:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "25px"
  card-glass-dark:
    backgroundColor: "rgba(255,255,255,0.10)"
    textColor: "{colors.white}"
    rounded: "22px"
    padding: "27px"
  float-card:
    backgroundColor: "rgba(255,255,255,0.74)"
    textColor: "{colors.lab-ink}"
    typography: "{typography.lab-body}"
    rounded: "{rounded.panel}"
    padding: "16px 18px"
  side-btn-active:
    backgroundColor: "{colors.accent-whole}"
    textColor: "{colors.white}"
    rounded: "11px"
    size: "38px"
---

# Design System: Pure Water Filtration

## Overview

**Creative North Star: "The Glass Cutaway"**

A house with one wall taken off. The whole system is built around letting the visitor see through things: the 3D diorama x-rays its cartridges, the product cards are frosted glass over the scene, the hero canvas bleeds past its column with no frame, and the dark sections glow from behind like light through water. Nothing is decorated for its own sake; every surface either shows the mechanism or gets out of its way. The mood a homeowner should feel is clean and reassuring first, premium and polished second, and warm and local underneath: an engineered thing explained by someone friendly.

The brand has two surfaces and one identity. **The page is the showroom**: white and pale-blue light, Manrope headlines that sit tight and heavy, pill buttons in Tap Blue, sections that alternate between bright and deep-reservoir navy so the scroll has tide. **The Water Lab is the instrument**: a cooler, more neutral chrome (Inter/Space Grotesk, mist greys) laid over the diorama, with the accent colour handed to whichever system is selected so the interface and the water agree. New work picks the layer it lives on and stays in that layer's vocabulary; the two are not to be blended.

Density is generous on the page (110px section rhythm, 24 to 30px card radii, copy capped at about 520px) and compact in the Lab (12.5px body, 14px panel radius, cards sized so the scene stays visible). Depth is atmospheric: large, very soft, blue-tinted shadows that make cards feel buoyant, and hover states that lift rather than press.

**Key Characteristics:**
- See-through by default: frosted glass, cutaways, x-ray reveals, no opaque frames around the 3D scene
- Tap Blue is the one action colour on the page; Filtered Cyan is light, not a button
- Manrope at 800 with tight negative tracking for every heading; DM Sans for reading
- Pill buttons, big soft radii, buoyant hover lift
- Alternating bright and deep-navy sections give the page tide
- The Lab's accent follows the selected system: blue (whole house), teal (under sink), green (rainwater)

## Colors

Water at three depths: pale, lit surfaces; one clear blue for action; a deep reservoir for the sections that need weight.

### Primary
- **Tap Blue** (#0879e8): the only action colour on the page. Primary buttons, eyebrows, link text, nav underline, map pins, step numerals, the progress bar. It is rare on purpose; a screen with more than a few Tap Blue elements is shouting.
- **Filtered Cyan** (#42c9ff): light, not paint. Radial glows behind hero and dark sections, the focus ring, the stars in reviews, the glowing dot on the Decoder kicker, the gradient end of progress fills. Never a button background, never body text.

### Secondary
- **Accent, Whole House** (#2e8fe0), **Accent, Under Sink** (#17b3c6), **Accent, Rainwater** (#2fb872): the Lab's per-system accents, set on `.app[data-system]` and mirrored in `three/systems.js`. They colour the active rail button, the detail card eyebrow, the placement callout, the phone link, the numbered stage badge and the finished water. They live only inside the Lab; the page never borrows them.

### Neutral
- **Deep Reservoir** (#06284a): the brand's dark. Top bar, logo, phone number, `.btn.dark`, the dark section background, toast, quick-quote pill, and the gradient start of gradient headlines.
- **Reservoir Shallow** (#0a3c68): the lighter navy used in gradients with Deep Reservoir.
- **Reservoir Floor** (#041e37): the footer; darker than any section so the page visibly ends.
- **Lab Night** (#061b2e): the Water Lab and Decoder section backgrounds; the "underwater" dark.
- **Ink** (#082b4c): body text on light backgrounds. Navy-black, never pure black.
- **Muted** (#668097): secondary text, captions, notes, mini-trust subtitles.
- **Still Water** (#eef9ff) and **Section Pale** (#f6fbfe): pale section washes and hover fills; the page's "not white."
- **Waterline** (#dcebf4): every hairline. Card borders, dividers, the nav's bottom edge, trust-strip separators.
- **White** (#ffffff): the base; cards, nav, and the light button.

### Lab Neutrals
- **Lab Mist** (#eef1f5) and **Lab Mist Light** (#f8f9fb): the viewer's ground gradient, with three accent-tinted radial ellipses laid over it.
- **Lab Ink** (#0f1c33) and **Lab Ink Dim** (#5d6c85): viewer text and secondary text.
- **Lab Navy** (#1c2f7c): the small uppercase brand line in the viewer header only.

### Named Rules
**The One Tap Rule.** Tap Blue is the single action colour on the page. Cyan glows, navy anchors, blue acts. If a new element needs to be clicked, it is Tap Blue or an outline of it; if it is not clickable, it is not Tap Blue.

**The Accent Stays in the Lab Rule.** The per-system accents (`--accent`, `--accent-rgb`) exist only under `.app`. Marketing sections that reference a system use Tap Blue and copy, not the system's colour.

**The Hairline Rule.** Borders on light surfaces are Waterline (#dcebf4) at 1px. On dark surfaces they are white at 10 to 16% alpha. No grey borders, no 2px borders except the left rule on mini-trust and placement callouts.

## Typography

**Display Font:** Manrope (with sans-serif fallback), page headings
**Body Font:** DM Sans (with sans-serif fallback), page copy, buttons, labels
**Lab Display Font:** Space Grotesk, headings inside the Water Lab viewer
**Lab Body Font:** Inter, everything else inside the viewer

**Character:** Heavy, close-set headlines over light, open body copy. Manrope at 800 with strong negative tracking reads like a product name stamped on a unit; DM Sans underneath is plain and easy, the way the client's own copy is written. In the Lab, Space Grotesk and Inter are cooler and more instrumental, matching chrome that has to sit over a live scene without competing with it.

### Hierarchy
- **Display** (Manrope 800, clamp(46px, 5.6vw, 76px), line-height 0.95, tracking -0.035em): the hero H1 only. One phrase may be set in solid Tap Blue (`<em>`); no gradient text.
- **Headline** (Manrope 800, clamp(32px, 3.6vw, 48px), line-height 1.04, tracking -0.03em): every section H2. The one feature section (the Water Lab) steps up to clamp(38px, 4.6vw, 62px) at line-height 0.98.
- **Title** (Manrope 800, 16 to 24px, tracking -0.02em): card, step, benefit and question H3s. 20px is the default; 19px on Lab cards, 16 to 17px on benefits and steps, 23 to 24px in the finder and decoder.
- **Body** (DM Sans 400, 15px, line-height 1.75, Muted): section copy, capped at 520 to 680px. Hero lead is 16 to 17px at 1.65. Card copy drops to 11 to 13px at 1.5 to 1.7.
- **Label** (DM Sans 800, 11px, tracking 2px, uppercase, Tap Blue): eyebrows. Stage numbers and kickers use the same treatment at 9 to 10px, sometimes in Manrope.
- **Lab Title** (Space Grotesk 600, 19px, tracking -0.01em): viewer header; 16 to 17px for card values and detail headings.
- **Lab Body** (Inter 400, 12.5px, line-height 1.5): viewer copy; 10 to 11px for captions.
- **Lab Label** (Inter 700, 10px, tracking 0.07em, uppercase, Lab Ink Dim): float-card labels.

### Named Rules
**The Stamped Heading Rule.** Every Manrope heading is weight 800 with negative tracking, in ems so it scales with the size. No light, medium or wide-tracked headings on the page; the eyebrow above it carries the wide tracking.

**The Scoped Heading Rule.** The page's `h1`–`h4` rules are written `:not(.app *)`, and the page's scroll bar is `.scroll-progress`, not `.progress`: the Water Lab has a `.progress` of its own. Nothing in `site.css` may reach into `.app`.

**The Two Faces Rule.** Manrope and DM Sans on the page; Space Grotesk and Inter under `.app`. Do not import a fifth face, and do not let a page section pick up the Lab's fonts or vice versa.

## Layout

One centred container at min(1180px, 100% - 48px) (100% - 30px under 560px). Sections run 110px top and bottom (75px on phones), with feature sections at 125px. Most sections are two-column grids with an asymmetric split (43/57 for the hero, 42/58 for the Decoder, 40/60 for the finder and areas, 38/62 for the interactive and FAQ blocks) that collapse to a single column at 900px. Card grids are 3-up (services, reviews, journey), 4-up (trust, steps) or 5-up (benefits) with 12 to 20px gaps; they step to 2-up at 900px and 1-up at 560px.

The hero is the only section where content leaves the container: the 3D canvas extends 140px past the right column edge so the diorama's plinth is not clipped, and the section's own overflow trims it at the viewport. Copy in the hero stays inside 500px.

Fixed chrome sits at the edges: sticky 82px nav (70px on phones) over a 34px top bar, a 3px scroll-progress bar, a bottom-centre quick-quote pill after 700px of scroll, a bottom-right utility bar, and on phones a three-button action bar pinned to the bottom (the quick-quote and utility bar move up 72 to 76px to clear it).

The Water Lab is one grid cell: the scene fills it and the chrome (header, 84px system rail, floating cards, play bar) is laid over it. Cards position off measured chrome insets (`--ui-top`, `--ui-left`, `--ui-bottom`), not off percentages of the canvas. Inside the modal the viewer is min(1250px, 100%) by min(800px, 90dvh); on phones the modal is the whole screen with no padding and no radius.

## Elevation & Depth

Ambient lift. Cards float on a soft blue haze rather than sitting on drawn layers: the signature shadow is huge, low-opacity and tinted with navy, so a card reads as hovering a few centimetres above pale water. Hover lifts things 3 to 10px and deepens the same shadow. Structural separation is done by glass, not shadow: frosted panels (`backdrop-filter: blur(10-18px)` over white at 74 to 92% alpha on light, white at 4 to 14% alpha on dark) with a hairline border mark where one layer ends and the scene behind begins. Dark sections get depth from radial cyan glows behind the content instead of from shadows.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 24px 70px rgba(4,45,78,.12)`, `--shadow`): the default card and panel shadow on the page; also the toast, skip link and finder panel.
- **Float, resting** (`0 12px 40px rgba(5,50,80,.06)`): service cards at rest, before hover raises them to Float.
- **Float, raised** (`0 25px 65px rgba(4,45,78,.12)`): change cards on hover.
- **Button glow** (`0 12px 30px rgba(8,121,232,.22)`, hover `0 18px 38px rgba(8,121,232,.3)`): primary buttons only; the shadow is Tap Blue, so the button casts its own colour.
- **Hero stage** (`0 35px 90-100px rgba(5,63,101,.24)`, or `rgba(0,0,0,.3)` on dark): the viewer card and Lab visual.
- **Modal** (`0 40px 120px rgba(0,0,0,.45)`): the Water Lab frame.
- **Lab panel** (`0 18px 40px rgba(15,28,51,.12), 0 2px 6px rgba(15,28,51,.06)`, `--shadow` under `.app`): floating cards in the viewer; a tighter two-layer version of Float.
- **Active rail button** (`0 8px 18px rgba(var(--accent-rgb),.35)`): the selected system's icon glows in its own accent.

### Named Rules
**The Blue Haze Rule.** Shadows are tinted, never grey or black on light surfaces. Every page shadow uses a navy rgba (4,45,78 / 5,50,80 / 15,28,51) at 6 to 14% alpha, spread 40 to 100px.

**The Lift, Don't Press Rule.** Hover translates up (-3px buttons, -5 to -10px cards) and deepens the shadow. There is no pressed or inset state anywhere in the system.

**The Glass Edge Rule.** A frosted panel always has a 1px hairline (Waterline on light, white at 10 to 25% on dark). Blur without an edge is a smudge.

## Shapes

Everything is rounded and nothing is sharp. Buttons, chips, tags, badges and the quick-quote are full pills (999px). Cards are 22 to 30px: 24px is the default (`--radius`), 30px for hero-scale frames (viewer card, Decoder panel, Lab visual), 22px for review and Lab cards, 18px for benefit tiles, 20px for journey and guide cards. Small controls step down: choices 15px, FAQ items 16px, toast 14px, Lab panels 14px, Lab chips and placement callouts 8px, mobile action buttons 10px. Circles are used for icons, step numbers, trust icons, the modal close and the rail icon backgrounds (11 to 12px on a 38px square, not fully round).

Two deliberate exceptions: the placement callout in the Lab is a left-ruled block with radius only on its right side (0 8px 8px 0), and the guide mockup is rotated -4deg to read as a physical booklet.

Silhouettes on the page are soft: radial glows are circles cropped by section edges, the hero canvas has no frame, the map is a clip-path polygon with a drop shadow.

## Components

### Buttons
Smooth and buoyant. A primary button is a Tap Blue pill that casts a blue glow and rises on hover.
- **Shape:** full pill (999px), no border
- **Primary:** Tap Blue on white, DM Sans 700 12px, 14px 21px padding, inline-flex with a 10px gap for the trailing arrow, `0 12px 30px rgba(8,121,232,.22)` glow
- **Hover:** `translateY(-3px)`, glow deepens to `0 18px 38px rgba(8,121,232,.3)`, `.3s` transition
- **Outline** (`.btn.outline`): transparent, Tap Blue text, 1px #a9d6f4 border, no shadow; the secondary action beside a primary
- **Light** (`.btn.light`): white with Tap Blue text, no shadow; on dark and gradient sections
- **Dark** (`.btn.dark`): Deep Reservoir fill, white text; on the guide cover and final CTA
- **Text link** (`.link`, `.finder-nav button`): Tap Blue, 800, 12px, no underline
- **Mobile action bar**: three 10px-radius buttons, 11px 6px padding, 10px 800 text; the primary one Tap Blue, the others `#eef8fd` with navy text
- **Lab buttons** (`.browse-btn`, `.call-btn`, `.chip-btn`): 20px or 8px radius, white at 70 to 75% alpha, hairline `--line` border, Lab Ink 600 12.5px or Lab Ink Dim 11px; hover swaps border and text to the system accent. Full width in the hero on phones.

### Chips
- **City tag**: white pill, 1px #cde8f5 border, 10px 14px, 11px 700
- **Audience tag**: `#f0f8fc` pill, `#49677e` text, 9px 12px, 10px 700
- **Result badge**: `#e7f8ff` pill, Tap Blue 800 10px
- **Decoder tab** (dark): white at 5% alpha, 1px white at 20% border, `#dcefff` text; hover and active go solid white with Deep Reservoir text
- **Decoder state pill** (dark): 9px 800 `#8de7ff`, 1px border in the same colour at 25%
- **Sheet tab** (Lab): borderless 7px-radius tab, 10px 700; `aria-selected` takes the accent on a 10% accent tint

### Cards / Containers
- **Service card**: white, 24px radius, 1px Waterline border, `0 12px 40px rgba(5,50,80,.06)`; a 220px gradient image band on top; 25px content padding; hover `translateY(-10px) rotateX(2deg)` to Float over `.45s`
- **Change card**: `linear-gradient(145deg, #fff, #f5fbfe)`, 24px, Waterline border, 28px padding, min-height 190px, `0 18px 50px rgba(4,45,78,.07)`; hover lifts 5px
- **Benefit tile**: white, 18px radius, Waterline border, 24px 18px padding; hover lifts 7px and border shifts to #b5dcf3
- **Journey card**: white, 20px, Waterline border, 25px padding, with a pale circle (`#e8f8ff`) tucked into the bottom-right corner
- **Glass card, dark** (reviews): white at 10% alpha, 1px white at 16%, 22px radius, 27px padding, `backdrop-filter: blur(10px)`; hover lifts 8px and brightens to 14%
- **Lab card** (Water Lab section): white at 4.5% alpha, 1px `rgba(159,222,246,.15)`, 22px, 25px padding; active state takes a cyan-tinted gradient and a 35% cyan border
- **Decoder panel**: `linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.035))`, 30px radius, 28px padding, blur(14px), `0 35px 90px rgba(0,0,0,.25)`
- **Finder panel**: white, 26px, Waterline border, 30px padding, Float shadow
- **Float card** (Lab viewer): white at 74% alpha, `backdrop-filter: blur(14px)`, 1px `rgba(15,28,51,.07)`, 14px radius, 16px 18px padding, Lab panel shadow; 190px wide on the left (facts, why), 236px on the right (detail); `pointer-events: none` unless it holds a control
- **Compare table**: one bordered 22px-radius grid, 17px 15px cells with Waterline rules, `#f4fbff` header cells in Manrope 800 13px navy

### Inputs / Fields
- **Choice** (finder and quote form): white, 1px Waterline border, 15px radius, 17px padding, min-height 75px, left-aligned with a 13px bold line and a 10px Muted line; hover and selected turn the border #7bcaf2, the fill `#effaff`, and lift 2px. In the quote form the tile is a `<label>` over a visually hidden radio, so the group has a name and arrow keys walk it; a focused radio draws the ring on the tile via `:has()`. `.choice-grid.compact` is the 3-up, single-line version for long option lists.
- **Text field** (`.q-input`): white, 1px Waterline border, 15px radius, 13px 16px padding, 15px DM Sans, placeholder `#a3b6c6`; hover border #7bcaf2, focus border Tap Blue on `#fbfeff`, the global cyan ring on keyboard focus, no inset shadow. Selects share it with an inline chevron; textareas resize vertically.
- **Label** (`.q-label`): 13.5px 700 Deep Reservoir; "(optional)" appended in Muted at 500. **Hint** 12px Muted under the label. **Error** 12px 700 `#c43a3a` under the field, with the field's border `#d64545`; errors appear on blur or on Next, never on first paint.
- **Form panel** (`.quote-panel`): the finder panel — white, 30px radius, Waterline border, 30px padding, Float shadow — with the same 5px progress bar and "Step n of m" count above a 24px Manrope step title.

### Navigation
- **Top bar**: 34px, Deep Reservoir, `#dcecff` 11px text
- **Nav**: 82px sticky, white at 90% with blur(16px), Waterline hairline underneath. Links 13px 600 `#38556e` with a 2px Tap Blue underline that slides in from the left on hover (`.35s`). Phone number Deep Reservoir 700. Collapses to a 24px navy menu glyph at 900px.
- **Logo**: the client's own lockup as an image, 46px tall in the nav (38px on phones), the white version 44px tall in the footer
- **Lab rail**: 84px column of 72px buttons, each a 38px icon tile (11px radius, white 75%, hairline) over a 9.5px 600 caption; active fills the tile with the system accent and its glow, and the caption takes the accent

### Photography
The client's own installs, not stock: the three service cards carry one unit each in a 230px band (`object-fit: cover`, a soft navy gradient over the bottom half, a 1.04 zoom on hover); the Installs strip is 340px cards with a 400px photo and a Manrope caption, snap-scrolling with the container's own inset; the Specs section pins the whole-house unit beside the stage list with the Hero-stage shadow. Every photo has an alt that says what is in it and where.

### Signature: the Water Lab frame
A 1250 by 800 frosted frame over a `rgba(2,15,28,.94)` backdrop with blur(18px): 28px radius, 1px `rgba(130,220,255,.25)` border, `linear-gradient(140deg, #0b466e, #031827)` behind the viewer, `0 40px 120px rgba(0,0,0,.45)`. A 42px circular close button (white 8% fill, 25% border) sits top-right and outranks the viewer's own header. On phones the frame becomes the screen. Inside, the viewer's chrome is a scrim, not a bar: the page colour fades from 94% to 0 over the top of the scene so the title stays readable when the camera flies in.

### Signature: the stage timeline
A 5px track with the four stage markers laid along it, painted in the water's own per-stage colours (raw at the left, finished in the system accent at the right). The Decoder section on the page echoes it as `.water-track`: a 5px white-11% rail with a cyan-to-white gradient fill glowing at `0 0 20px rgba(66,201,255,.7)`, and 30px white dots ringed with a 7px cyan halo.

### Motion
Reveals fade up 35px over `.8s` on `cubic-bezier(.2,.7,.2,1)` with 80ms stagger steps; hovers transition `.25 to .45s`; the quick-quote slides in over `.45s cubic-bezier(.2,.8,.2,1)`; ambient glows breathe on 5 to 8s ease-in-out loops; map pins ping on 2.2s. `body.reduced-motion` and `prefers-reduced-motion` collapse all of it to 1ms. The 3D canvas fades in over `.9s` (page) or `.6s` (Lab) only once its shaders are built.

## Do's and Don'ts

### Do:
- **Do** keep Tap Blue for actions only, and let cyan be light (glows, rings, highlights) rather than fill.
- **Do** use the Float shadow (`0 24px 70px rgba(4,45,78,.12)`) or one of its named siblings; do not invent a new shadow value.
- **Do** give every frosted panel a 1px hairline edge: Waterline on light, white at 10 to 25% on dark.
- **Do** set every Manrope heading at 800 with negative tracking in ems (-0.035em at hero scale, -0.03em at section scale, -0.02em on titles), never in pixels: -1.8px on a 16px title fused its letters.
- **Do** alternate bright and Deep Reservoir or Lab Night sections so the scroll has tide; two dark sections back to back is a wall.
- **Do** let hover lift (translateY up) and deepen the shadow; keep transitions between .25s and .45s.
- **Do** keep the 3D scene unframed and let it bleed past the column on the right in the hero.
- **Do** put Lab-side work under `.app` and use `var(--accent)` or `rgba(var(--accent-rgb), a)` so it follows the selected system.
- **Do** position Lab cards off `--ui-top`, `--ui-left` and `--ui-bottom`, never off canvas percentages.
- **Do** respect `body.reduced-motion` and `prefers-reduced-motion` for anything that animates.

### Don't:
- **Don't** use grey or black shadows on light surfaces; every shadow is navy-tinted.
- **Don't** bring the per-system accents (#2e8fe0, #17b3c6, #2fb872) onto page sections; the page's accent is Tap Blue.
- **Don't** use Space Grotesk or Inter on the page, or Manrope and DM Sans inside the viewer, and don't add a fifth typeface.
- **Don't** put a square corner, a 2px+ border, or an inset or pressed state on any control; the system is pills, soft radii, and lift.
- **Don't** wrap the diorama in a card, frame, overlay label or gradient on the page; it sits straight on the section.
- **Don't** make cyan (#42c9ff) a button background or body text.
- **Don't** add shadows, filters or blur to elements over the live canvas beyond what `.float-card` already carries; the scene is fill-rate bound.
- **Don't** use `100vh` for the modal or any full-height frame; use `dvh` with the `100vh` fallback already in place.
