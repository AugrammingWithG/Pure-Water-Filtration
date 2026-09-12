# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- 11 files · ~31,791 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 324 nodes · 641 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.85)
- Token cost: 87,962 input · 0 output

## Community Hubs (Navigation)
- Filtration Unit Parts
- Diorama Grounds & Layout
- UI Shell & Walkthrough Controls
- Build Tooling & Dependencies
- Water Route & Flow Animation
- Cabin House Geometry
- Scene, Camera & Stage Markers
- Legacy Simulation & App Entry
- Studio Environment
- README Sections
- Graphify Workflow Rules
- CLAUDE.md Config

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
- `addCanister()` --semantically_similar_to--> `Canister()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/parts/Canister.jsx
- `makeOrbit()` --semantically_similar_to--> `useOrbitRig()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/hooks/useOrbitRig.js
- `Vanishing Contaminant Specks` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `Constant-speed Water Pulses` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx
- `buildScene()` --semantically_similar_to--> `Scene()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/Scene.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]

## Communities (12 total, 1 thin omitted)

### Community 0 - "Filtration Unit Parts"
Cohesion: 0.07
Nodes (43): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Rainwater System, Revealed Pipework Thinning, Under Sink System, Whole House System, X-Ray Reveal, react (+35 more)

### Community 1 - "Diorama Grounds & Layout"
Cohesion: 0.07
Nodes (41): three, blocked(), distToPolyline(), distToSegment(), Grass(), makeBladeGeometry(), makeLawn(), makeMaterial() (+33 more)

### Community 2 - "UI Shell & Walkthrough Controls"
Cohesion: 0.08
Nodes (33): Hand-Written Orbit Rig, Keyboard Tour Controls, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Scrubbable Progress Bar, Stage Seek Keeps Tour State (+25 more)

### Community 3 - "Build Tooling & Dependencies"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "Water Route & Flow Animation"
Cohesion: 0.12
Nodes (30): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture (+22 more)

### Community 5 - "Cabin House Geometry"
Cohesion: 0.07
Nodes (27): Base Colour Surfaces, House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+19 more)

### Community 6 - "Scene, Camera & Stage Markers"
Cohesion: 0.10
Nodes (24): Fill-Rate Budget, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Stage Badges, UI Chrome Over Canvas, @react-three/drei, @react-three/fiber (+16 more)

### Community 7 - "Legacy Simulation & App Entry"
Cohesion: 0.13
Nodes (19): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel (+11 more)

### Community 8 - "Studio Environment"
Cohesion: 0.33
Nodes (8): disposeStudio(), FLOOR, HORIZON, makePanel(), makeRoom(), makeStudio(), SceneEnvironment(), ZENITH

### Community 9 - "README Sections"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Workflow Rules"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

## Knowledge Gaps
- **96 isolated node(s):** `Dark Navy Glass UI Theme`, `BLACK`, `UP`, `BRASS`, `HANDLE` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Filtration Unit Parts` to `Diorama Grounds & Layout`, `UI Shell & Walkthrough Controls`, `Build Tooling & Dependencies`, `Water Route & Flow Animation`, `Cabin House Geometry`, `Scene, Camera & Stage Markers`, `Legacy Simulation & App Entry`, `Studio Environment`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **Why does `three` connect `Diorama Grounds & Layout` to `Filtration Unit Parts`, `Build Tooling & Dependencies`, `Water Route & Flow Animation`, `Cabin House Geometry`, `Scene, Camera & Stage Markers`, `Studio Environment`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `App()` connect `UI Shell & Walkthrough Controls` to `Scene, Camera & Stage Markers`, `Legacy Simulation & App Entry`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Dark Navy Glass UI Theme`, `BLACK`, `UP` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Filtration Unit Parts` be split into smaller, more focused modules?**
  _Cohesion score 0.07337526205450734 - nodes in this community are weakly interconnected._
- **Should `Diorama Grounds & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06588235294117648 - nodes in this community are weakly interconnected._