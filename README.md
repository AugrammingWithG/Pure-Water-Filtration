# Pure-Water-Filtration

Interactive 3D diorama of a home showing where each Pure Water Filtration
product lives, built with React and Three.js.

Three systems, each a real product placed where it would be installed:

| System | Product | Placement |
| --- | --- | --- |
| Whole house | White point-of-entry cabinet, copper riser + ball valve | Front wall, where the mains comes in from the street meter |
| Under sink | Three-canister RO unit + pressure tank, dedicated tap | Inside the kitchen sink cabinet |
| Rainwater | Stainless three-canister + UV unit, gauges on top | Right gable wall, beside the rainwater tank |

Picking a system from the sidebar (or clicking the product in the scene) flies
the camera to it, switches the UI accent colour, and x-rays the unit — cover,
cartridge housings and the pipework the route runs inside all go see-through,
so the water is visible for the whole of its journey rather than only where it
crosses open ground. The under-sink view also fades the roof and front wall
away so the camera can get into the kitchen. "Reset view" returns to the wide
framing and puts everything back.

## The filter path

Each system's route is authored in `three/systems.js` as a chain of *legs* —
one run of pipe each, tagged with the stage it belongs to, whether it passes
through a filter element, how fast water moves along it, and whether it is
buried. `three/path.js` turns those into the curve plus everything derived
from it, and because every leg boundary is a real control point of the curve,
each stage's span along the path is measured rather than guessed at.

That structure is what the scene reads:

- **Four marked positions.** A numbered badge hangs at each stage — anchored to
  the middle of that stage's element — and the selected one takes the accent
  colour and grows. Clicking one walks to that stage. Past a few metres the
  unselected badges fade out, so the wide view carries one "you are here" pin
  rather than four overlapping discs.
- **The active unit is outlined.** Its own hard edges, drawn in the accent
  colour, so it is clear which product the walkthrough is on. See the note
  below on why edges rather than a grown shell.
- **Water that changes where it is treated.** The colour ramp sits *across*
  each element, so a bubble visibly clears while it is working through the
  cartridge instead of changing colour once it is already out the far side.
- **Water that slows where it should.** The stream is a column of fine bubbles,
  spaced evenly in *time* rather than distance, so they crowd together through
  media and in the pressure tank and draw apart again in open pipe — and can
  never overtake one another. Each rides at its own distance from the
  centreline and turns slowly around it, so the column churns instead of
  sliding past rigid, and each stretches along its direction of travel in
  proportion to its speed. Every system takes the same ten seconds end to end
  however much of its route is slow.
- **Grit that gets caught.** Specks riding in with the raw water are each given
  a point on the face of the first element to stop at, biased toward the
  leading edge, and sit there a moment before fading.
- **A visible route.** A thin line traces the whole path, carrying the same
  gradient, faint where the run is buried and lit up along the selected stage.
  It is thinner than the narrowest pipe it runs inside, so it shows only in the
  gaps: buried runs, and inside the cartridges.

## The walkthrough

The play button runs a guided tour of the four stages, 3.2 seconds on each,
looping. It is a timeline rather than a timer (`hooks/useWalkthrough.js`): one
playhead in seconds, and the stage showing is whichever dwell it is inside.
That is what makes the three buttons on it honest:

- **Play** flies the camera straight in to the stage the playhead is on,
  instead of sitting at the wide view until the first stage change comes
  round. It never moves the playhead: wherever it was left is where the tour
  picks up.
- **Pause** is a freeze-frame. The playhead stops, and so does the water —
  bubbles held mid-cartridge, grit held on the face of the element — while
  the camera stays free, so a paused tour is something to orbit around and
  inspect. Everything that is UI motion rather than simulation (the fly-to in
  flight, the route highlight sliding on, badges tinting) still settles.
- **Resume** carries on from the same instant, both the tour and the water.
  The remainder of the current stage is honoured rather than restarted.

### The stage timeline

The bar under the scene is the playhead's track with the four stages laid
along it: a marker where each stage begins, and its name in the stretch that
follows. Its colours are the water's own — the same per-stage list the route
is painted with, raw at the left and finished at the right — so the bar is the
journey in miniature.

- **Tap a marker** (or its name) and the tour jumps to the start of that
  stage: the playhead lands exactly on the marker, the camera flies in, and
  the detail card, the marker and the numbered badge in the scene all change
  together. A press a few pixels shy of a marker still means that marker, so
  a fingertip cannot land the tour on the stage before.
- **Drag anywhere along the track** to scrub. The stage the playhead is
  inside is the live one, so the highlighted marker follows the knob across
  the boundaries, and the camera follows the marker.
- **The water is on the same clock.** Every second the playhead is dragged or
  jumped, the water moves by too: scrub the bar back and the stream runs
  backwards under the finger, scrub a paused tour and the held frame moves,
  jump to a stage and the water lands where it would have been.

Whatever picks a stage — a marker, the numbered badge in the scene, a click
on a cartridge, the keyboard — goes through the same *seek*: the tour moves
there and keeps whatever state it had, so a paused tour can be stepped through
stage by stage with the water held at each, and the stage on screen is always
the one the playhead says. Switching system or resetting the view ends the
tour. Space plays and pauses; the arrow keys step between stages; Home and
End go to the first and last; the markers themselves can be tabbed to and
pressed.

## Running it

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Project structure

```
index.html                 Vite entry, loads the Google fonts the design uses
legacy/
  filtration-simulation.html   Original single-file prototype, kept verbatim
src/
  main.jsx                 React root
  App.jsx                  Owns system/stage/focused state and the walkthrough, holds the rig ref
  data/
    constants.js           All copy: stage + system text, facts, reasons, links — the client's own wording
  hooks/
    useOrbitRig.js         Custom drag-orbit / zoom / fly-to camera rig
    useWalkthrough.js      The tour as a timeline: play / pause / resume, seek, scrub
  three/
    layout.js              Every dimension and mount point in the world
    path.js                Builds a route from its legs: stage spans, colour, pace
    systems.js             Per-system camera views, stage focus points, route legs + colours
    Scene.jsx              Canvas contents: lights, environment, house, products, flow
    SceneEnvironment.jsx   Image-based lighting from a pre-baked sky (assets/textures/env)
    Precompile.jsx         Builds the shaders off the main thread before the scene is shown
    quality.js             Quality tiers (foliage density, dpr cap, shadow map size)
    QualityGovernor.jsx    Steps the tier down when the measured frame rate can't hold
    Ground.jsx             The diorama plinth
    Grass.jsx              The lawn: instanced blades, wind in the vertex shader
    Trees.jsx              Pines behind the house: cone cores under a shell of instanced needles, same wind
    House.jsx              Cabin shell, roof, glazing, deck; roof + front wall are a cutaway
    Kitchen.jsx            Bench, open sink cabinet, sink, mixer + filtered taps
    WaterFlow.jsx          Route line, instanced bubbles and grit along the active route; own clock, so it can be paused
    StageMarkers.jsx       Numbered badges at the four stage positions
    products/
      WholeHouseUnit.jsx   Chamfered white cabinet, label plate, riser, street meter
      UnderSinkUnit.jsx    Bracket, teal canisters, tank, P-trap, tubing
      RainwaterUnit.jsx    Stainless unit, gauges, UV lamp, risers, tank + downpipe
    parts/
      Canister.jsx         One cartridge; glows when selected, housing clears when revealed
      Pipe.jsx             Straight-segment pipe runs with ball joints
      Valve.jsx            Brass ball valve with green lever
      FadeGroup.jsx        Fades every mesh beneath it (cutaway + x-ray covers)
      Outline.jsx          Accent edge outline marking the active unit
      brandLabel.js        Canvas-drawn "Pure Water Filtration" plate texture
      materials.js         Copper / PVC / tubing presets
      blade.js             The one blade the lawn and the pine needles share, and the GLSL wind field
      random.js            Seeded PRNG so scattered things land in the same place every load
  components/
    SimCanvas.jsx          <Canvas> wrapper and renderer configuration
    FactsCard.jsx          The product in the three figures the client's site puts on it
    WhyCard.jsx            The site's "why families choose us" reasons, with the phone number
    DetailCard.jsx         The stage being looked at, where the unit goes, quote + learn-more links
    Header.jsx Sidebar.jsx icons.jsx
    PlayBar.jsx            Play/pause and the stage timeline: markers to jump, track to scrub
  styles/
    index.css              Light theme; accent colour switched by data-system on .app
scripts/
  bake-environment.mjs     Clamps + downsamples the source HDRI into the shipped environment map
```

The UI chrome is plain React and CSS layered over the canvas — none of it is
drawn inside Three.js.

## Notes

Surfaces are base colours only. The timber (deck, floor, window frames) is the
obvious candidate for textures later; the cladding could take a vertical-board
normal map.

The camera is a hand-written rig (`useOrbitRig`), not drei's `OrbitControls`:
the click-vs-drag threshold and the fly-to tween (with angle normalisation so
it never unwinds laps of auto-rotate) are load-bearing for the interaction.

`FadeGroup` flips `material.transparent` at runtime; three bakes that flag into
the compiled shader, so it sets `needsUpdate` when the flag changes. Without
that a material that started opaque stays opaque no matter what `opacity` is.

The scene is fill-rate bound, not geometry bound — halving the resolution
roughly doubles the frame rate — and the foliage is most of the fill: tens of
thousands of thin double-sided blades and needles, most of the plinth covered
several times over. Several deliberate choices follow from that, and they look
like omissions if you don't know why they are there: `dpr` is capped at 1.5
rather than 2; the rim light does **not** cast shadows; the lawn and the pines
use `MeshLambertMaterial` rather than standard (on integrated graphics the
standard material's specular and environment lookups on the foliage cost more
per frame than the rest of the scene put together, for a sheen that on matte
green was never visible); and there are quality tiers (`three/quality.js`).
Blades and needles are laid down in random order, so a tier thins them by
drawing only the first fraction of each instanced mesh — nothing is rebuilt.
Phones start one tier down, and `QualityGovernor` steps any device down
further when a second's average drops below 45 fps twice running. It never
steps back up: v-sync hides how much headroom a fast scene has, so it would
be a guess. Smooth motion matters more here than any of these would give
back, because water that stutters stops reading as water. If you re-enable
any of them, measure first.

Loading is dominated by the shaders, not the assets. Every texture together
is under half a megabyte: the environment map is the 4k HDRI clamped and
resampled to 1k by `scripts/bake-environment.mjs` and shipped as an UltraHDR
JPEG (270 KB against 28 MB for the source), and the lawn's speckle is a 512-px
tile mirrored across the plinth. What used to freeze the page for a couple of
seconds after that was the first frame compiling twenty-odd programs at once
— twice, because the environment map arrived in a passive effect after the
first frame and changed every material's program. `SceneEnvironment` sets
the map in a layout effect so there is one compile, `Precompile` runs it
through `KHR_parallel_shader_compile` with the scene hidden and fades the
canvas in when the driver reports the programs linked, and the renderer's
`checkShaderErrors` is off in production (reading each program's log waits
for its compile). Safari has no parallel compile, so it still stalls once,
but only once.

Anything animated per frame damps with `Math.min(1, delta * rate)`, never a
fixed per-frame fraction — otherwise transitions run at different speeds on
different monitors, and on a slow machine they look broken rather than slow.

The two clocks — the walkthrough's and the water's — are the exception: they
have to keep to real time, so they take the frame's whole delta and cap it at
a quarter of a second rather than the 0.05 the transitions use. The cap is
only there to swallow a stall (a background tab, a shader compile); a machine
merely struggling to draw the scene still gets a tour that runs to time and
water that flows at the speed it should. Both clocks read a `paused` flag
rather than being torn down, so resuming is nothing more than letting the
delta count again.

They are two clocks rather than one because the water runs while the tour is
idle, and the tour loops while the water does not. What ties them together is
that every seek on the walkthrough — a scrub, a marker, a badge, an arrow key
— is published with the signed seconds it moved the playhead, and the water
adds the same amount to its own clock (banked between frames and taken in the
next step, so bubbles and grit see one delta). Playing publishes no movement
at all, so the loop wrapping round is not read as a jump back to the start.

The cards carry no figures of our own. Every number on screen — the micron
rating, the stage count, the filter interval, the install time — is one the
client's site states for that product, and the copy is the site's wording
(`data/constants.js` says which page each line came from). The site publishes
no cost, savings or bottle-count claims, so the simulation makes none: an
earlier cost / savings / impact trio with invented figures was retired (it is
in history at `970f7f4` if the client ever supplies real ones), and with it
the first-frame signal from `Scene` that its count-up waited on.

The water's clock is stepped in a `useFrame` at priority `-1` so it is ahead
of the bubbles and grit that read it in the same frame. r3f runs frame
callbacks in priority order; only a priority *above* zero switches off its
automatic render, so a negative one is safe to use purely for ordering.

The play bar's playhead is written straight to the DOM — a CSS variable the
fill and the knob both read — from a subscription on the walkthrough. Holding
it in React state would re-render the app, canvas included, every frame.

`Outline` draws a unit's own hard edges rather than the usual inverted hull —
the shape grown slightly and drawn back-faces-only. The hull was tried first.
It depends on the object writing depth to hide the shell's interior, and these
units stop writing depth the moment the x-ray fades their covers; masking the
interior off with the stencil buffer instead still left a fringe many times
wider than the shell's own 1.04 scale could account for. Edges sit exactly on
the surface, so they behave the same whether the cover is solid or see-through.
They go through drei's `Line`, not `lineSegments`, because WebGL clamps native
line width to one pixel.

Adding a product: give it a mount point in `layout.js`, a view / stages /
legs entry in `systems.js`, copy in `data/constants.js`, a component under
`three/products/`, and render it in `Scene.jsx` with `unitProps(key)`.

Routing its water: write the legs in flow order, each listing only the points
it adds to the route. Mark the run through each filter element `media: true`
with a slow `pace` — that is what places the colour change, the stage marker
and the slowdown, all from the one declaration. `buried: true` on a run that
disappears underground or under the floor draws the route line faintly there.

A product whose route runs inside modelled pipework should thin that pipework
out on `revealed`, the way the three existing units do; otherwise the water is
hidden inside its own plumbing for most of the journey.
