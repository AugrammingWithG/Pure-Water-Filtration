# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- 55 files · ~100,812 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 375 nodes · 828 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8315d575`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RainwaterUnit.jsx
- systems.js
- App.jsx
- package.json
- WaterFlow.jsx
- House.jsx
- Scene.jsx
- selectStage
- three
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- StageMarkers.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 30 edges
2. `three` - 28 edges
3. `@react-three/fiber` - 21 edges
4. `clamp01()` - 14 edges
5. `App()` - 11 edges
6. `FadeGroup()` - 10 edges
7. `buildPath()` - 10 edges
8. `useWalkthrough()` - 10 edges
9. `Walkthrough as a Timeline` - 10 edges
10. `selectStage()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `buildScene()` --semantically_similar_to--> `Scene()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/Scene.jsx
- `addCanister()` --semantically_similar_to--> `Canister()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/parts/Canister.jsx
- `selectStage()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `selectSystem()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `startAutoplay()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]

## Communities (13 total, 1 thin omitted)

### Community 0 - "RainwaterUnit.jsx"
Cohesion: 0.06
Nodes (46): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Rainwater System, Revealed Pipework Thinning, Under Sink System (+38 more)

### Community 1 - "systems.js"
Cohesion: 0.06
Nodes (48): blocked(), distToPolyline(), distToSegment(), Grass(), makeLawn(), makeMaterial(), ROOT_COLOR, TIP_COLOR (+40 more)

### Community 2 - "App.jsx"
Cohesion: 0.09
Nodes (37): Keyboard Tour Controls, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Scrubbable Progress Bar, Stage Seek Keeps Tour State, Walkthrough as a Timeline (+29 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+24 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.12
Nodes (31): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture (+23 more)

### Community 5 - "House.jsx"
Cohesion: 0.07
Nodes (27): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+19 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.11
Nodes (24): Fill-Rate Budget, Hand-Written Orbit Rig, UI Chrome Over Canvas, react, @react-three/fiber, SimCanvas(), clampPhi(), nearestAngle() (+16 more)

### Community 7 - "selectStage"
Cohesion: 0.13
Nodes (19): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel (+11 more)

### Community 8 - "three"
Cohesion: 0.14
Nodes (28): three, CarbonAbsorption(), rand(), clamp01(), getDotTexture(), lerp(), MAX_DELTA, smoothstep() (+20 more)

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

### Community 12 - "StageMarkers.jsx"
Cohesion: 0.36
Nodes (7): Stage Badges, Badge(), badgeTexture(), MUTED, StageMarkers(), textures, markerPoint()

## Knowledge Gaps
- **104 isolated node(s):** `ROOT_COLOR`, `TIP_COLOR`, `LAWN`, `GRAVEL`, `CLADDING` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 119 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Scene.jsx` to `RainwaterUnit.jsx`, `systems.js`, `App.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `selectStage`, `three`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Why does `three` connect `three` to `RainwaterUnit.jsx`, `systems.js`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `Scene.jsx` to `RainwaterUnit.jsx`, `systems.js`, `package.json`, `WaterFlow.jsx`, `three`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ROOT_COLOR`, `TIP_COLOR`, `LAWN` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RainwaterUnit.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0632996632996633 - nodes in this community are weakly interconnected._
- **Should `systems.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06170598911070781 - nodes in this community are weakly interconnected._