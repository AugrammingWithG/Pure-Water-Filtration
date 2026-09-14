# Graph Report - Pure-Water-Filtration  (2026-09-14)

## Corpus Check
- 68 files · ~71,942 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 487 nodes · 1090 edges · 16 communities (15 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6f9e862e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RainwaterUnit.jsx
- Grass.jsx
- App.jsx
- package.json
- WaterFlow.jsx
- House.jsx
- Scene.jsx
- selectStage
- systems.js
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- three
- DetailCard.jsx
- statCardTexture.js
- bake-environment.mjs

## God Nodes (most connected - your core abstractions)
1. `react` - 39 edges
2. `three` - 36 edges
3. `@react-three/fiber` - 27 edges
4. `clamp01()` - 14 edges
5. `App()` - 13 edges
6. `FadeGroup()` - 11 edges
7. `useQuality()` - 11 edges
8. `useWalkthrough()` - 10 edges
9. `buildPath()` - 10 edges
10. `Walkthrough as a Timeline` - 10 edges

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
Cohesion: 0.06
Nodes (45): addCanister(), Roof and Front Wall Cutaway, FadeGroup needsUpdate, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Rainwater System, Revealed Pipework Thinning (+37 more)

### Community 1 - "Grass.jsx"
Cohesion: 0.08
Nodes (39): blocked(), createCenters(), distToPolyline(), distToSegment(), Grass(), HOTSPOT_LAYERS, hotspotWeight(), makeLawn() (+31 more)

### Community 2 - "App.jsx"
Cohesion: 0.08
Nodes (43): Space Grotesk and Inter Google Fonts, Keyboard Tour Controls, Pause as Freeze-Frame, Playhead Written Straight to DOM, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Scrubbable Progress Bar, Stage Seek Keeps Tour State (+35 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.13
Nodes (30): animate(), colorAt(), Vanishing Contaminant Specks, Constant-speed Water Pulses, Adding a Product Checklist, Colour Ramp Across Element, Grit Capture, Single media Leg Declaration (+22 more)

### Community 5 - "House.jsx"
Cohesion: 0.07
Nodes (23): Base Colour Surfaces, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes(), CLADDING, DECK_TIMBER (+15 more)

### Community 6 - "Scene.jsx"
Cohesion: 0.07
Nodes (39): Fill-Rate Budget, Hand-Written Orbit Rig, UI Chrome Over Canvas, react, @react-three/drei, @react-three/fiber, SimCanvas(), clampPhi() (+31 more)

### Community 7 - "selectStage"
Cohesion: 0.16
Nodes (17): buildScene(), colorStops, Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel, selectStage() (+9 more)

### Community 8 - "systems.js"
Cohesion: 0.09
Nodes (41): CarbonAbsorption(), rand(), clamp01(), getDotTexture(), getStarTexture(), lerp(), MAX_DELTA, smoothstep() (+33 more)

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

### Community 12 - "three"
Cohesion: 0.17
Nodes (20): Stage Badges, three, ARMS_LENGTH, DECLUTTER_FAR, DECLUTTER_NEAR, declutterAt(), faceCamera(), fitAt() (+12 more)

### Community 13 - "DetailCard.jsx"
Cohesion: 0.15
Nodes (18): DetailCard(), Removed(), SheetActions(), StageBody(), PinIcon(), clamp(), MobileSheet(), TABS (+10 more)

### Community 14 - "statCardTexture.js"
Cohesion: 0.10
Nodes (35): AMBER, BORDER, CARD_RADIUS, cardCanvas(), drawLabel(), FONT_DISPLAY, FONT_UI, formatFigure() (+27 more)

### Community 15 - "bake-environment.mjs"
Cohesion: 0.16
Nodes (11): { clamped, peak }, clampLuminance(), encodeChannel(), floatToRgbe(), luminance(), out, rgb, small (+3 more)

## Knowledge Gaps
- **135 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 156 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Scene.jsx` to `RainwaterUnit.jsx`, `Grass.jsx`, `App.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `systems.js`, `three`, `DetailCard.jsx`, `statCardTexture.js`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Why does `three` connect `three` to `RainwaterUnit.jsx`, `Grass.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `Scene.jsx`, `systems.js`, `DetailCard.jsx`, `statCardTexture.js`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `@react-three/fiber` connect `Scene.jsx` to `RainwaterUnit.jsx`, `Grass.jsx`, `package.json`, `WaterFlow.jsx`, `House.jsx`, `systems.js`, `three`, `statCardTexture.js`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `selectStage()` and `selectSystem()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RainwaterUnit.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0649895178197065 - nodes in this community are weakly interconnected._
- **Should `Grass.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0782608695652174 - nodes in this community are weakly interconnected._