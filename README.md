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
the camera to it, switches the UI accent colour, and makes the unit's cover
see-through so the stages inside are visible. The under-sink view also fades
the roof and front wall away so the camera can get into the kitchen. Each
system has four stages you can step through from the bottom bar or by clicking
the cartridges; water pulses run the whole path and change colour as they pass
each stage. "Reset view" returns to the wide framing and puts everything back.

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
    systems.js             Per-system camera views, stage focus points, water paths + colours
    Scene.jsx              Canvas contents: lights, environment, house, products, flow
    SceneEnvironment.jsx   Image-based lighting from three's RoomEnvironment (no fetch)
    Ground.jsx             The diorama plinth
    House.jsx              Cabin shell, roof, glazing, deck; roof + front wall are a cutaway
    Kitchen.jsx            Bench, open sink cabinet, sink, mixer + filtered taps
    WaterFlow.jsx          Pulse + contaminant particles along the active system's path
    products/
      WholeHouseUnit.jsx   Chamfered white cabinet, label plate, riser, street meter
      UnderSinkUnit.jsx    Bracket, teal canisters, tank, P-trap, tubing
      RainwaterUnit.jsx    Stainless unit, gauges, UV lamp, risers, tank + downpipe
    parts/
      Canister.jsx         One cartridge; glows in the accent colour when selected
      Pipe.jsx             Straight-segment pipe runs with ball joints
      Valve.jsx            Brass ball valve with green lever
      FadeGroup.jsx        Fades every mesh beneath it (cutaway + x-ray covers)
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

Adding a product: give it a mount point in `layout.js`, a view / stages /
path entry in `systems.js`, copy in `data/constants.js`, a component under
`three/products/`, and render it in `Scene.jsx` with `unitProps(key)`.
