# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- 52 files · ~39,823 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 324 nodes · 643 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3311b275`
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
- SceneEnvironment.jsx
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `react` - 22 edges
2. `three` - 18 edges
3. `@react-three/fiber` - 14 edges
4. `FadeGroup()` - 11 edges
5. `App()` - 11 edges
6. `useWalkthrough()` - 10 edges
7. `Walkthrough as a Timeline` - 10 edges
8. `buildPath()` - 9 edges
9. `selectStage()` - 9 edges
10. `Pause as Freeze-Frame` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Vanishing Contaminant Specks` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `Constant-speed Water Pulses` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `addCanister()` --semantically_similar_to--> `Canister()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/parts/Canister.jsx
- `selectStage()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `selectSystem()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]

## Communities (12 total, 1 thin omitted)

### Community 0 - "RainwaterUnit.jsx"
Cohesion: 0.07
Nodes (43): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Rainwater System, Revealed Pipework Thinning, Under Sink System, Whole House System, X-Ray Reveal, react (+35 more)

### Community 1 - "systems.js"
Cohesion: 0.07
Nodes (41): three, blocked(), distToPolyline(), distToSegment(), Grass(), makeBladeGeometry(), makeLawn(), makeMaterial() (+33 more)

### Community 2 - "App.jsx"
Cohesion: 0.08
Nodes (33): Hand-Written Orbit Rig, Keyboard Tour Controls, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Scrubbable Progress Bar, Stage Seek Keeps Tour State (+25 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.14
Nodes (29): animate(), colorAt(), Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture, Single media Leg Declaration (+21 more)

### Community 5 - "House.jsx"
Cohesion: 0.07
Nodes (27): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+19 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.10
Nodes (24): Fill-Rate Budget, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Stage Badges, UI Chrome Over Canvas, @react-three/drei, @react-three/fiber (+16 more)

### Community 7 - "selectStage"
Cohesion: 0.12
Nodes (20): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), colorStops, Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset() (+12 more)

### Community 8 - "SceneEnvironment.jsx"
Cohesion: 0.33
Nodes (8): disposeStudio(), FLOOR, HORIZON, makePanel(), makeRoom(), makeStudio(), SceneEnvironment(), ZENITH

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

## Knowledge Gaps
- **96 isolated node(s):** `WHITE`, `Dark Navy Glass UI Theme`, `BLACK`, `UP`, `BRASS` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `RainwaterUnit.jsx` to `systems.js`, `App.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `selectStage`, `SceneEnvironment.jsx`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **Why does `three` connect `systems.js` to `RainwaterUnit.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `SceneEnvironment.jsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `App()` connect `App.jsx` to `Scene.jsx`, `selectStage`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `WHITE`, `Dark Navy Glass UI Theme`, `BLACK` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RainwaterUnit.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07337526205450734 - nodes in this community are weakly interconnected._
- **Should `systems.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06588235294117648 - nodes in this community are weakly interconnected._