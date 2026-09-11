# Pure-Water-Filtration

Interactive 3D simulation of a whole-house water filtration system, built with
React and Three.js.

Three switchable systems (whole-house, under-sink, rainwater) share one 3D
scene; each has four pipeline stages you can click through in the viewport or
from the bottom playback bar.

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
  App.jsx                  Owns system/stage/autoplay state, holds the rig ref
  data/
    constants.js           All stage + system copy, ported as-is
  hooks/
    useOrbitRig.js         Custom drag-orbit / zoom / focus-tween camera rig
  three/
    waterline.js           Service-line curve, stage positions, colour gradient
    lighting.js            Legacy light-intensity compensation constant
    Scene.jsx              Canvas contents; owns the rig, routes stage picks
    House.jsx              Walls, roof, windows, door, rack plate, driveway
    ServiceLine.jsx        Tube geometry along the curve + street meter marker
    Canister.jsx           One filter stage: glass, emissive core, hit sphere
    TapAssembly.jsx        Tap glass, falling stream, rising water level
    WaterFlow.jsx          Pulse + contaminant particles, travelling glow lights
  components/
    SimCanvas.jsx          <Canvas> wrapper and renderer configuration
    Header.jsx Sidebar.jsx CostCard.jsx TrendCard.jsx ImpactCard.jsx
    DetailCard.jsx PlayBar.jsx icons.jsx
  styles/
    index.css              Ported from the prototype's <style> block
```

The UI chrome is plain React and CSS layered over the canvas — none of it is
drawn inside Three.js.

## Notes on the port

The camera is a hand-written rig (`useOrbitRig`), not drei's `OrbitControls`.
The click-vs-drag threshold and the focus tween are load-bearing for the
interaction, and stock controls provide neither.

`SimCanvas` sets the renderer's `legacy`, `linear` and `flat` flags to restore
the r128 colour pipeline the prototype was authored against, and
`three/lighting.js` scales light intensities by PI for the same reason. See the
comments in those files.
