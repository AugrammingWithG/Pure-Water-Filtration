# Graph Report - Pure-Water-Filtration  (2026-09-12)

## Corpus Check
- Corpus is ~29,437 words - fits in a single context window. You may not need a graph.

## Summary
- 297 nodes · 591 edges · 9 communities
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.87)
- Token cost: 169,493 input · 0 output

## Community Hubs (Navigation)
- Filtration Unit Parts
- Water Route & Flow Animation
- Diorama Grounds & Layout
- Build Tooling & Dependencies
- UI Shell & Stage Data
- Cabin House Geometry
- Legacy Simulation & App Entry
- Studio Environment
- Orbit Camera Rig

## God Nodes (most connected - your core abstractions)
1. `react` - 20 edges
2. `three` - 18 edges
3. `@react-three/fiber` - 14 edges
4. `FadeGroup()` - 11 edges
5. `Route Legs and Measured Stage Spans` - 10 edges
6. `selectStage()` - 9 edges
7. `useOrbitRig()` - 8 edges
8. `WaterFlow()` - 8 edges
9. `buildPath()` - 8 edges
10. `X-ray Reveal of the Active Unit` - 8 edges

## Surprising Connections (you probably didn't know these)
- `stageOrder` --semantically_similar_to--> `STAGE_ORDER`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/data/constants.js
- `stageDataBySystem` --semantically_similar_to--> `STAGE_DATA_BY_SYSTEM`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/data/constants.js
- `systemData` --semantically_similar_to--> `SYSTEM_DATA`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/data/constants.js
- `buildScene()` --semantically_similar_to--> `Scene()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/Scene.jsx
- `colorAt()` --semantically_similar_to--> `colorAt()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/path.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Scene features all derived from the route leg declarations** — readme_route_legs, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]
- **Legacy prototype concepts ported into the React/R3F rebuild** — legacy_filtration_simulation_makeorbit, legacy_filtration_simulation_water_pulses, legacy_filtration_simulation_contaminant_specks, legacy_filtration_simulation_colorstops, readme_hand_written_orbit_rig, readme_time_spaced_bubble_column, readme_grit_capture, readme_colour_ramp_across_element [INFERRED 0.75]

## Communities (9 total, 0 thin omitted)

### Community 0 - "Filtration Unit Parts"
Cohesion: 0.06
Nodes (53): addCanister(), Accent Hard-edge Outline (not inverted hull), Roof and Front Wall Cutaway, FadeGroup transparent flag needs shader rebuild, Frame-rate Independent Damping, Rainwater Filtration System, Under Sink Filtration System, Whole House Filtration System (+45 more)

### Community 1 - "Water Route & Flow Animation"
Cohesion: 0.08
Nodes (41): Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Each Filter Element, Fill-rate Bound Performance Budget, Grit Caught at the First Element, Route Legs and Measured Stage Spans, Gradient Route Line (+33 more)

### Community 2 - "Diorama Grounds & Layout"
Cohesion: 0.07
Nodes (36): blocked(), distToPolyline(), distToSegment(), Grass(), makeBladeGeometry(), makeLawn(), makeMaterial(), mulberry32() (+28 more)

### Community 3 - "Build Tooling & Dependencies"
Cohesion: 0.06
Nodes (32): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+24 more)

### Community 4 - "UI Shell & Stage Data"
Cohesion: 0.11
Nodes (25): CostCard(), DetailCard(), Header(), DropletLogo(), HouseIcon(), PinIcon(), PlayPauseIcon(), RainIcon() (+17 more)

### Community 5 - "Cabin House Geometry"
Cohesion: 0.07
Nodes (25): Base-colour Surfaces (textures deferred), House Cladding Wood Texture, Timber Cladding Material, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes() (+17 more)

### Community 6 - "Legacy Simulation & App Entry"
Cohesion: 0.11
Nodes (24): Space Grotesk and Inter Google Fonts, animate(), buildScene(), colorAt(), colorStops, Dark Navy Glass UI Theme, orbit.focus(), orbit.reset() (+16 more)

### Community 7 - "Studio Environment"
Cohesion: 0.33
Nodes (8): disposeStudio(), FLOOR, HORIZON, makePanel(), makeRoom(), makeStudio(), SceneEnvironment(), ZENITH

### Community 8 - "Orbit Camera Rig"
Cohesion: 0.43
Nodes (6): makeOrbit(), Hand-written Orbit Rig, clampPhi(), nearestAngle(), NOTE: `moved` is intentionally left alone here. It is reset on, useOrbitRig()

## Knowledge Gaps
- **87 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+82 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 96 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Filtration Unit Parts` to `Water Route & Flow Animation`, `Diorama Grounds & Layout`, `Build Tooling & Dependencies`, `UI Shell & Stage Data`, `Cabin House Geometry`, `Legacy Simulation & App Entry`, `Studio Environment`, `Orbit Camera Rig`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Why does `three` connect `Filtration Unit Parts` to `Water Route & Flow Animation`, `Diorama Grounds & Layout`, `Build Tooling & Dependencies`, `Cabin House Geometry`, `Studio Environment`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `Filtration Unit Parts` to `Water Route & Flow Animation`, `Diorama Grounds & Layout`, `Build Tooling & Dependencies`, `Studio Environment`, `Orbit Camera Rig`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Route Legs and Measured Stage Spans` (e.g. with `buildPath()` and `SYSTEMS`) actually correct?**
  _`Route Legs and Measured Stage Spans` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _87 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Filtration Unit Parts` be split into smaller, more focused modules?**
  _Cohesion score 0.06105834464043419 - nodes in this community are weakly interconnected._
- **Should `Water Route & Flow Animation` be split into smaller, more focused modules?**
  _Cohesion score 0.08115942028985507 - nodes in this community are weakly interconnected._