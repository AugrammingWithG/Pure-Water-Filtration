# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- 55 files · ~100,812 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 375 nodes · 837 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41357cd3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RainwaterUnit.jsx
- layout.js
- App.jsx
- package.json
- WaterFlow.jsx
- House.jsx
- Scene.jsx
- selectStage
- react
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- systems.js
- App
- Trees.jsx
- Ground.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 30 edges
2. `three` - 28 edges
3. `@react-three/fiber` - 21 edges
4. `clamp01()` - 14 edges
5. `App()` - 11 edges
6. `FadeGroup()` - 11 edges
7. `useWalkthrough()` - 10 edges
8. `buildPath()` - 10 edges
9. `Walkthrough as a Timeline` - 10 edges
10. `selectStage()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `selectStage()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `selectSystem()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `startAutoplay()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `stageOrder` --semantically_similar_to--> `STAGE_ORDER`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/data/constants.js
- `stageDataBySystem` --semantically_similar_to--> `STAGE_DATA_BY_SYSTEM`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/data/constants.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]

## Communities (16 total, 1 thin omitted)

### Community 0 - "RainwaterUnit.jsx"
Cohesion: 0.07
Nodes (42): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Rainwater System, Revealed Pipework Thinning, Under Sink System, Whole House System, X-Ray Reveal, STREET_METER (+34 more)

### Community 1 - "layout.js"
Cohesion: 0.18
Nodes (17): blocked(), distToPolyline(), distToSegment(), Grass(), makeLawn(), makeMaterial(), ROOT_COLOR, TIP_COLOR (+9 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (27): CostCard(), DetailCard(), Header(), DropletLogo(), HouseIcon(), PinIcon(), PlayPauseIcon(), RainIcon() (+19 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+24 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.18
Nodes (19): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, Grit Capture, Water Clock at useFrame Priority -1, colorAt() (+11 more)

### Community 5 - "House.jsx"
Cohesion: 0.07
Nodes (25): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+17 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.09
Nodes (24): Fill-Rate Budget, SimCanvas(), RainwaterEffects(), UnderSinkEffects(), WholeHouseEffects(), CABINET, CABINET_INNER, COUNTER (+16 more)

### Community 7 - "selectStage"
Cohesion: 0.13
Nodes (19): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel (+11 more)

### Community 8 - "react"
Cohesion: 0.14
Nodes (31): react, @react-three/fiber, three, CarbonAbsorption(), rand(), clamp01(), getDotTexture(), lerp() (+23 more)

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

### Community 12 - "systems.js"
Cohesion: 0.11
Nodes (27): Adding a Product Checklist, Colour Ramp Across Element, Single media Leg Declaration, Route Legs, Route Line, Scrubbable Progress Bar, Stage Badges, Time-Spaced Bubble Column (+19 more)

### Community 13 - "App"
Cohesion: 0.17
Nodes (20): Frame-Rate Independent Damping, Hand-Written Orbit Rig, Hard-Edge Outline, Keyboard Tour Controls, Light Theme Accent Switch, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap (+12 more)

### Community 14 - "Trees.jsx"
Cohesion: 0.21
Nodes (13): makeBladeGeometry(), WIND_FIELD, mulberry32(), makeNeedleMaterial(), makeNeedles(), makeTiers(), NEEDLE_LEN, NEEDLE_ROOT (+5 more)

### Community 15 - "Ground.jsx"
Cohesion: 0.33
Nodes (6): GRAVEL, Ground(), LAWN, usePathGeometry(), GROUND, PATH

## Knowledge Gaps
- **104 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `RainwaterUnit.jsx`, `layout.js`, `App.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `selectStage`, `systems.js`, `App`, `Trees.jsx`, `Ground.jsx`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Why does `three` connect `react` to `RainwaterUnit.jsx`, `layout.js`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `systems.js`, `Trees.jsx`, `Ground.jsx`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `react` to `RainwaterUnit.jsx`, `layout.js`, `package.json`, `WaterFlow.jsx`, `Scene.jsx`, `systems.js`, `App`, `Trees.jsx`, `Ground.jsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RainwaterUnit.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0693815987933635 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._