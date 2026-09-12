# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- 55 files · ~101,842 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 380 nodes · 827 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6f5bd2a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- systems.js
- Grass.jsx
- App.jsx
- package.json
- WaterFlow.jsx
- House.jsx
- Scene.jsx
- three
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- StageMarkers.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 30 edges
2. `three` - 28 edges
3. `@react-three/fiber` - 22 edges
4. `clamp01()` - 14 edges
5. `App()` - 11 edges
6. `useWalkthrough()` - 10 edges
7. `buildPath()` - 10 edges
8. `Walkthrough as a Timeline` - 10 edges
9. `selectStage()` - 9 edges
10. `Pause as Freeze-Frame` - 9 edges

## Surprising Connections (you probably didn't know these)
- `addCanister()` --semantically_similar_to--> `Canister()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/parts/Canister.jsx
- `Vanishing Contaminant Specks` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `Constant-speed Water Pulses` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `makeOrbit()` --semantically_similar_to--> `useOrbitRig()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/hooks/useOrbitRig.js
- `buildScene()` --semantically_similar_to--> `Scene()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/Scene.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]

## Communities (12 total, 1 thin omitted)

### Community 0 - "systems.js"
Cohesion: 0.05
Nodes (50): Roof and Front Wall Cutaway, Rainwater System, Revealed Pipework Thinning, Under Sink System, Whole House System, CABINET, CABINET_INNER, COUNTER (+42 more)

### Community 1 - "Grass.jsx"
Cohesion: 0.11
Nodes (29): blocked(), createCenters(), distToPolyline(), distToSegment(), Grass(), HOTSPOT_LAYERS, hotspotWeight(), makeLawn() (+21 more)

### Community 2 - "App.jsx"
Cohesion: 0.05
Nodes (58): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel (+50 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.12
Nodes (31): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture (+23 more)

### Community 5 - "House.jsx"
Cohesion: 0.06
Nodes (27): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+19 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.07
Nodes (40): FadeGroup needsUpdate, Fill-Rate Budget, Frame-Rate Independent Damping, Hand-Written Orbit Rig, Hard-Edge Outline, X-Ray Reveal, react, @react-three/drei (+32 more)

### Community 8 - "three"
Cohesion: 0.13
Nodes (29): three, CarbonAbsorption(), rand(), clamp01(), getDotTexture(), lerp(), MAX_DELTA, smoothstep() (+21 more)

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
- **105 isolated node(s):** `CLADDING`, `ROOF`, `SEAM`, `OAK`, `DECK_TIMBER` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Scene.jsx` to `systems.js`, `Grass.jsx`, `App.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `three`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Why does `three` connect `three` to `systems.js`, `Grass.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `Scene.jsx` to `systems.js`, `Grass.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `three`, `StageMarkers.jsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CLADDING`, `ROOF`, `SEAM` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `systems.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05081585081585081 - nodes in this community are weakly interconnected._
- **Should `Grass.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11174242424242424 - nodes in this community are weakly interconnected._