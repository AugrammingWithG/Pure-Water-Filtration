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
  each element, so a droplet visibly clears while it is working through the
  cartridge instead of changing colour once it is already out the far side.
- **Water that slows where it should.** Droplets are spaced evenly in *time*,
  not distance, so they crowd together through media and in the pressure tank
  and draw apart again in open pipe. Each stretches along its direction of
  travel in proportion to its speed. Every system takes the same ten seconds
  end to end however much of its route is slow.
- **Grit that gets caught.** Specks riding in with the raw water are each given
  a point on the face of the first element to stop at, biased toward the
  leading edge, and sit there a moment before fading.
- **A visible route.** A thin line traces the whole path, carrying the same
  gradient, faint where the run is buried and lit up along the selected stage.
  It is thinner than the narrowest pipe it runs inside, so it shows only in the
  gaps: buried runs, and inside the cartridges.

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
  App.jsx                  Owns system/stage/focused/autoplay state, holds the rig ref
  data/
    constants.js           All stage + system copy (titles, descriptions, placement)
  hooks/
    useOrbitRig.js         Custom drag-orbit / zoom / fly-to camera rig
  three/
    layout.js              Every dimension and mount point in the world
    path.js                Builds a route from its legs: stage spans, colour, pace
    systems.js             Per-system camera views, stage focus points, route legs + colours
    Scene.jsx              Canvas contents: lights, environment, house, products, flow
    SceneEnvironment.jsx   Image-based lighting from three's RoomEnvironment (no fetch)
    Ground.jsx             The diorama plinth
    House.jsx              Cabin shell, roof, glazing, deck; roof + front wall are a cutaway
    Kitchen.jsx            Bench, open sink cabinet, sink, mixer + filtered taps
    WaterFlow.jsx          Route line, instanced droplets and grit along the active route
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
  components/
    SimCanvas.jsx          <Canvas> wrapper and renderer configuration
    Header.jsx Sidebar.jsx CostCard.jsx TrendCard.jsx ImpactCard.jsx
    DetailCard.jsx PlayBar.jsx icons.jsx
  styles/
    index.css              Light theme; accent colour switched by data-system on .app
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
roughly doubles the frame rate. Two deliberate choices follow from that, and
both look like omissions if you don't know why they are there: `dpr` is capped
at 1.5 rather than 2, and the rim light does **not** cast shadows. Measured on
integrated graphics at 1600x1000, the pair take a high-DPI display from about
12fps to about 24. Smooth motion matters more here than either would give back,
because water that stutters stops reading as water. If you re-enable either,
measure first.

Anything animated per frame damps with `Math.min(1, delta * rate)`, never a
fixed per-frame fraction — otherwise transitions run at different speeds on
different monitors, and on a slow machine they look broken rather than slow.

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
