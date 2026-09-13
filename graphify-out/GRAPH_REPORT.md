# Graph Report - Pure-Water-Filtration  (2026-09-13)

## Corpus Check
- 63 files · ~108,277 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 422 nodes · 949 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `813565b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RainwaterUnit.jsx
- Grass.jsx
- react
- package.json
- systems.js
- House.jsx
- Scene.jsx
- selectStage
- MineralBalance.jsx
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- three
- cardTexture.js

## God Nodes (most connected - your core abstractions)
1. `react` - 35 edges
2. `three` - 31 edges
3. `@react-three/fiber` - 23 edges
4. `clamp01()` - 14 edges
5. `App()` - 12 edges
6. `FadeGroup()` - 11 edges
7. `useWalkthrough()` - 10 edges
8. `buildPath()` - 10 edges
9. `Walkthrough as a Timeline` - 10 edges
10. `layout()` - 9 edges

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

## Communities (14 total, 1 thin omitted)

### Community 0 - "RainwaterUnit.jsx"
Cohesion: 0.06
Nodes (48): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Rainwater System, Revealed Pipework Thinning, UI Chrome Over Canvas (+40 more)

### Community 1 - "Grass.jsx"
Cohesion: 0.12
Nodes (28): blocked(), createCenters(), distToPolyline(), distToSegment(), Grass(), HOTSPOT_LAYERS, hotspotWeight(), makeLawn() (+20 more)

### Community 2 - "react"
Cohesion: 0.07
Nodes (47): Space Grotesk and Inter Google Fonts, Keyboard Tour Controls, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Scrubbable Progress Bar, Stage Seek Keeps Tour State (+39 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "systems.js"
Cohesion: 0.09
Nodes (38): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture (+30 more)

### Community 5 - "House.jsx"
Cohesion: 0.05
Nodes (38): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+30 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.10
Nodes (27): Fill-Rate Budget, Hand-Written Orbit Rig, @react-three/fiber, SimCanvas(), clampPhi(), nearestAngle(), NOTE: `moved` is intentionally left alone here. It is reset on, useOrbitRig() (+19 more)

### Community 7 - "selectStage"
Cohesion: 0.16
Nodes (18): addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel, selectStage() (+10 more)

### Community 8 - "MineralBalance.jsx"
Cohesion: 0.12
Nodes (32): CarbonAbsorption(), rand(), clamp01(), getDotTexture(), getStarTexture(), lerp(), MAX_DELTA, smoothstep() (+24 more)

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

### Community 12 - "three"
Cohesion: 0.19
Nodes (18): three, ARMS_LENGTH, DECLUTTER_FAR, DECLUTTER_NEAR, declutterAt(), faceCamera(), fitAt(), MAX_FIT (+10 more)

### Community 13 - "cardTexture.js"
Cohesion: 0.21
Nodes (14): DetailCard(), Removed(), PinIcon(), toneColour(), TONES, BUTTONS, createCardTexture(), hex() (+6 more)

## Knowledge Gaps
- **115 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 129 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `RainwaterUnit.jsx`, `Grass.jsx`, `package.json`, `systems.js`, `House.jsx`, `Scene.jsx`, `MineralBalance.jsx`, `three`?**
  _High betweenness centrality (0.269) - this node is a cross-community bridge._
- **Why does `three` connect `three` to `RainwaterUnit.jsx`, `Grass.jsx`, `package.json`, `systems.js`, `House.jsx`, `Scene.jsx`, `MineralBalance.jsx`, `cardTexture.js`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `Scene.jsx` to `RainwaterUnit.jsx`, `Grass.jsx`, `package.json`, `systems.js`, `House.jsx`, `MineralBalance.jsx`, `three`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _115 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RainwaterUnit.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `Grass.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11693548387096774 - nodes in this community are weakly interconnected._