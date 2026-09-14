# Graph Report - Pure-Water-Filtration  (2026-09-14)

## Corpus Check
- 69 files · ~128,856 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2221 nodes · 8419 edges · 110 communities (87 shown, 23 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 1337 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02f8716b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RainwaterUnit.jsx
- Grass.jsx
- App.jsx
- package.json
- WaterFlow.jsx
- House.jsx
- quality.js
- selectStage
- three
- Pure-Water-Filtration
- Graphify Knowledge Graph
- CLAUDE.md
- Scene.jsx
- cardTexture.js
- statCardTexture.js
- bake-environment.mjs
- index-C_Y5h7ku.js
- ld
- copy
- c
- em
- add
- n
- Bv
- parse
- a
- dispose
- raycast
- dd
- qm
- b
- r
- constructor
- o
- nc
- setValue
- dc
- uy
- getPoint
- xg
- ec
- icons.jsx
- sc
- dot
- ba
- set
- H
- ma
- sr
- At
- yg
- wo
- Lt
- push
- Og
- i
- ce
- a
- ea
- buildPath
- App
- a
- Cg
- connect
- evaluate
- applyMatrix4
- zg
- hx
- fromArray
- yv
- computeVertexNormals
- de
- qp
- updateProjectionMatrix
- play
- crossFadeFrom
- rotateY
- jp
- nm
- Ground.jsx
- setFromEuler
- getPoints
- setPositions
- ve
- getContext
- enable
- Bp
- pk
- intersectObject
- abort
- area
- contain
- convertLinearToSRGB
- copySRGBToLinear
- distanceToPlane
- findNode
- getAverageFrequency
- getFilter
- hf
- rotate
- my
- nb
- _setAdditiveIdentityNumeric
- _updateTime
- setFromCylindrical
- setFromSpherical
- triangulateShape
- cT
- jl
- unbind

## God Nodes (most connected - your core abstractions)
1. `constructor()` - 213 edges
2. `Bv()` - 210 edges
3. `r()` - 210 edges
4. `n()` - 182 edges
5. `i()` - 168 edges
6. `push()` - 141 edges
7. `t()` - 136 edges
8. `copy()` - 105 edges
9. `a()` - 105 edges
10. `o()` - 98 edges

## Surprising Connections (you probably didn't know these)
- `addCanister()` --semantically_similar_to--> `Canister()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/parts/Canister.jsx
- `selectStage()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `selectSystem()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `startAutoplay()` --semantically_similar_to--> `App()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/App.jsx
- `Vanishing Contaminant Specks` --semantically_similar_to--> `WaterFlow()`  [INFERRED] [semantically similar]
  legacy/filtration-simulation.html → src/three/WaterFlow.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Route Leg Structure Drives Every Scene Reading** — readme_route_legs, readme_media_leg_declaration, readme_stage_badges, readme_colour_ramp_across_element, readme_time_spaced_bubble_column, readme_grit_capture, readme_route_line [EXTRACTED 1.00]
- **Walkthrough Timeline and Its Controls** — readme_walkthrough_timeline, readme_pause_freeze_frame, readme_resume_from_same_instant, readme_scrubbable_progress_bar, readme_stage_seek, readme_keyboard_controls, src_hooks_usewalkthrough_usewalkthrough, src_components_playbar_playbar, src_app_app [EXTRACTED 1.00]
- **Frame-Rate Independent Damping Pattern** — readme_frame_rate_independent_damping, src_three_parts_fadegroup_fadegroup, src_three_parts_outline_outline, src_three_parts_canister_canister, src_three_stagemarkers_stagemarkers, src_three_lighting_lighting [INFERRED 0.85]
- **Legacy prototype stage walkthrough and autoplay flow** — legacy_filtration_simulation_selectstage, legacy_filtration_simulation_selectsystem, legacy_filtration_simulation_startautoplay, legacy_filtration_simulation_stopautoplay, legacy_filtration_simulation_focus, legacy_filtration_simulation_reset [INFERRED 0.85]

## Communities (110 total, 23 thin omitted)

### Community 0 - "RainwaterUnit.jsx"
Cohesion: 0.07
Nodes (46): Roof and Front Wall Cutaway, FadeGroup needsUpdate, Frame-Rate Independent Damping, Hard-Edge Outline, Light Theme Accent Switch, Rainwater System, Revealed Pipework Thinning, Under Sink System (+38 more)

### Community 1 - "Grass.jsx"
Cohesion: 0.14
Nodes (24): blocked(), createCenters(), distToPolyline(), distToSegment(), Grass(), HOTSPOT_LAYERS, hotspotWeight(), makeLawn() (+16 more)

### Community 2 - "App.jsx"
Cohesion: 0.11
Nodes (25): DetailCard(), Removed(), SheetActions(), StageBody(), FactsCard(), Header(), DropletLogo(), PhoneIcon() (+17 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (31): dependencies, react, react-dom, @react-three/drei, @react-three/fiber, three, devDependencies, eslint (+23 more)

### Community 4 - "WaterFlow.jsx"
Cohesion: 0.20
Nodes (17): animate(), colorAt(), colorStops, Vanishing Contaminant Specks, Constant-speed Water Pulses, colorAt(), Bubbles(), buildRide() (+9 more)

### Community 5 - "House.jsx"
Cohesion: 0.04
Nodes (46): Base Colour Surfaces, BACK_PANELS, BOARD, BOARD_EXTRUDE, Boards(), boardShapes(), CLADDING, DECK_TIMBER (+38 more)

### Community 6 - "quality.js"
Cohesion: 0.16
Nodes (14): Fill-Rate Budget, GROUND, Lighting(), makeShadowTexture(), PlinthShadow(), RIM_BASE, getQuality(), listeners (+6 more)

### Community 7 - "selectStage"
Cohesion: 0.14
Nodes (18): Space Grotesk and Inter Google Fonts, addCanister(), buildScene(), Dark Navy Glass UI Theme, orbit.focus(), makeOrbit(), orbit.reset(), roDotLabel (+10 more)

### Community 8 - "three"
Cohesion: 0.13
Nodes (32): three, CarbonAbsorption(), rand(), clamp01(), getDotTexture(), getStarTexture(), lerp(), MAX_DELTA (+24 more)

### Community 9 - "Pure-Water-Filtration"
Cohesion: 0.29
Nodes (6): Notes, Project structure, Pure-Water-Filtration, Running it, The filter path, The walkthrough

### Community 10 - "Graphify Knowledge Graph"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph, Graphify Update After Code Change, Query-First Rule

### Community 12 - "Scene.jsx"
Cohesion: 0.09
Nodes (36): Hand-Written Orbit Rig, Stage Badges, react, @react-three/fiber, clampPhi(), nearestAngle(), NOTE: `moved` is intentionally left alone here. It is reset on, useOrbitRig() (+28 more)

### Community 13 - "cardTexture.js"
Cohesion: 0.32
Nodes (10): toneColour(), TONES, createCardTexture(), hex(), layout(), pin(), readable(), rgba() (+2 more)

### Community 14 - "statCardTexture.js"
Cohesion: 0.10
Nodes (34): AMBER, BORDER, CARD_RADIUS, cardCanvas(), drawLabel(), FONT_DISPLAY, FONT_UI, formatFigure() (+26 more)

### Community 15 - "bake-environment.mjs"
Cohesion: 0.16
Nodes (11): { clamped, peak }, clampLuminance(), encodeChannel(), floatToRgbe(), luminance(), out, rgb, small (+3 more)

### Community 16 - "index-C_Y5h7ku.js"
Cohesion: 0.01
Nodes (65): accumulate(), accumulateAdditive(), addScalar(), addScaledSH(), ae(), applyMatrix(), ar(), bezierCurveTo() (+57 more)

### Community 17 - "ld"
Cohesion: 0.06
Nodes (71): ad(), Au(), bind(), bu(), he(), tt(), z(), cd() (+63 more)

### Community 18 - "copy"
Cohesion: 0.07
Nodes (62): attach(), calculateInverses(), cc(), center(), conjugate(), f(), ie(), vt() (+54 more)

### Community 19 - "c"
Cohesion: 0.12
Nodes (57): l(), p(), ae(), ir(), ke(), lt(), pa(), qe() (+49 more)

### Community 20 - "em"
Cohesion: 0.06
Nodes (41): v(), addEventListener(), _applyGainmapToSDR(), E(), f(), nt(), ya(), nt() (+33 more)

### Community 21 - "add"
Cohesion: 0.08
Nodes (51): add(), addLevel(), angleTo(), ce(), clampLength(), clone(), computeFrenetFrames(), computeLineDistances() (+43 more)

### Community 22 - "n"
Cohesion: 0.08
Nodes (48): ba(), fi(), n(), pi(), t(), te(), zt(), by() (+40 more)

### Community 23 - "Bv"
Cohesion: 0.11
Nodes (38): Bv(), aa(), ca(), da(), dt(), gi(), gt(), h() (+30 more)

### Community 24 - "parse"
Cohesion: 0.08
Nodes (36): _applyTexData(), Bd(), bindLightTargets(), bindSkeletons(), createDataTexture(), fromJSON(), getObjectById(), getObjectByName() (+28 more)

### Community 25 - "a"
Cohesion: 0.06
Nodes (23): a(), Cr(), j(), a(), c(), d(), n(), t() (+15 more)

### Community 26 - "dispose"
Cohesion: 0.08
Nodes (37): absarc(), absellipse(), arc(), q(), cw(), dispose(), ds(), Dw() (+29 more)

### Community 27 - "raycast"
Cohesion: 0.15
Nodes (36): addVectors(), applyBoneTransform(), bs(), Co(), computeBoundingBox(), computeBoundingSphere(), _computeIntersections(), distanceToSquared() (+28 more)

### Community 28 - "dd"
Cohesion: 0.09
Nodes (35): apply(), an(), bn(), bt(), cn(), dn(), dr(), en() (+27 more)

### Community 29 - "qm"
Cohesion: 0.08
Nodes (34): ah(), _allocateTargets(), _applyGGXFilter(), _applyPMREM(), _blur(), _blurPass(), bm(), ch() (+26 more)

### Community 30 - "b"
Cohesion: 0.10
Nodes (33): af(), bf(), b(), ee(), ft(), j(), je(), m() (+25 more)

### Community 31 - "r"
Cohesion: 0.13
Nodes (33): ap(), b(), ct(), er(), l(), o(), r(), rt() (+25 more)

### Community 32 - "constructor"
Cohesion: 0.07
Nodes (28): constructor(), bt(), ht(), u(), ut(), ef(), floor(), getDepthTexture() (+20 more)

### Community 33 - "o"
Cohesion: 0.22
Nodes (29): al(), bl(), ta(), o(), cl(), dl(), el(), gl() (+21 more)

### Community 34 - "nc"
Cohesion: 0.16
Nodes (29): Bi(), ar(), fe(), ge(), gr(), ht(), kr(), mt() (+21 more)

### Community 35 - "setValue"
Cohesion: 0.09
Nodes (28): _activateAction(), _addInactiveAction(), _addInactiveBinding(), _bindAction(), clipAction(), create(), _deactivateAction(), existingAction() (+20 more)

### Community 36 - "dc"
Cohesion: 0.12
Nodes (27): bc(), c(), ha(), ki(), oa(), p(), qi(), vr() (+19 more)

### Community 37 - "uy"
Cohesion: 0.11
Nodes (27): appendChildToContainer(), ay(), commitUpdate(), cv(), dv(), Dy(), ev(), ey() (+19 more)

### Community 38 - "getPoint"
Cohesion: 0.12
Nodes (24): addInstance(), h(), Do(), getCurveLengths(), getInterpolatedAttribute(), getLength(), getLengths(), getPoint() (+16 more)

### Community 39 - "xg"
Cohesion: 0.11
Nodes (12): be(), di(), xg(), de(), fe(), h(), L(), N() (+4 more)

### Community 40 - "ec"
Cohesion: 0.17
Nodes (22): ji(), ri(), ec(), ff(), fromEquirectangularTexture(), gc(), gf(), hc() (+14 more)

### Community 41 - "icons.jsx"
Cohesion: 0.13
Nodes (18): Playhead Written Straight to DOM, Scrubbable Progress Bar, UI Chrome Over Canvas, HouseIcon(), PinIcon(), PlayPauseIcon(), RainIcon(), strokeProps (+10 more)

### Community 42 - "sc"
Cohesion: 0.16
Nodes (20): ac(), ai(), br(), ei(), g(), ii(), na(), ni() (+12 more)

### Community 43 - "dot"
Cohesion: 0.21
Nodes (20): addScaledVector(), clampPoint(), closestPointToPoint(), closestPointToPointParameter(), delta(), distanceSqToLine3(), distanceSqToPoint(), distanceToPoint() (+12 more)

### Community 44 - "ba"
Cohesion: 0.13
Nodes (20): at(), ba(), et(), i(), it(), kn(), ot(), st() (+12 more)

### Community 45 - "set"
Cohesion: 0.12
Nodes (19): deleteGeometry(), deleteInstance(), getColorAt(), getGeometryIdAt(), getGeometryRangeAt(), getHSL(), getVisibleAt(), lerpHSL() (+11 more)

### Community 46 - "H"
Cohesion: 0.11
Nodes (19): bh(), clamp(), clampScalar(), getDataURL(), getHex(), gh(), Gm(), gr() (+11 more)

### Community 47 - "ma"
Cohesion: 0.14
Nodes (18): addGeometry(), addUpdateRange(), ma(), getIndex(), _initializeGeometry(), manhattanLength(), normalizeSkinWeights(), setComponent() (+10 more)

### Community 48 - "sr"
Cohesion: 0.19
Nodes (17): as(), cr(), ie(), lr(), sr(), ur(), xr(), xt() (+9 more)

### Community 49 - "At"
Cohesion: 0.18
Nodes (17): At(), Bt(), fa(), tn(), closePath(), Ew(), fs(), Ga() (+9 more)

### Community 50 - "yg"
Cohesion: 0.17
Nodes (12): qr(), V(), tt(), disable(), yg(), Ae(), ce(), de() (+4 more)

### Community 51 - "wo"
Cohesion: 0.25
Nodes (16): Ao(), bo(), bi(), ci(), tr(), Eo(), go(), jo() (+8 more)

### Community 52 - "Lt"
Cohesion: 0.17
Nodes (16): applyQuaternion(), Fw(), Gw(), Hw(), Lt(), Mw(), Nw(), Ot() (+8 more)

### Community 53 - "push"
Cohesion: 0.18
Nodes (14): n(), d(), g(), CreateClipsFromMorphTargetSequences(), CreateFromMorphTargetSequence(), fp(), getObjectsByProperty(), Gy() (+6 more)

### Community 54 - "Og"
Cohesion: 0.16
Nodes (15): clear(), rt(), customProgramCacheKey(), getFragmentShaderStage(), _getShaderStage(), getVertexShaderStage(), Og(), b() (+7 more)

### Community 55 - "i"
Cohesion: 0.18
Nodes (14): Am(), r(), a(), ga(), i(), E(), kp(), i() (+6 more)

### Community 56 - "ce"
Cohesion: 0.26
Nodes (15): ce(), le(), me(), se(), I(), oe(), de(), fe() (+7 more)

### Community 57 - "a"
Cohesion: 0.15
Nodes (11): addGroup(), a(), ae(), ce(), ie(), re(), se(), v() (+3 more)

### Community 58 - "ea"
Cohesion: 0.40
Nodes (13): ai(), di(), ea(), jr(), li(), ne(), oi(), si() (+5 more)

### Community 59 - "buildPath"
Cohesion: 0.31
Nodes (12): Adding a Product Checklist, Colour Ramp Across Element, Single media Leg Declaration, Route Legs, Route Line, Time-Spaced Bubble Column, boxBlur(), buildPath() (+4 more)

### Community 60 - "App"
Cohesion: 0.29
Nodes (12): Grit Capture, Keyboard Tour Controls, Pause as Freeze-Frame, Real-Time Clocks with Stall Cap, Resume Honours Remaining Dwell, Stage Seek Keeps Tour State, Walkthrough as a Timeline, Water Clock at useFrame Priority -1 (+4 more)

### Community 61 - "a"
Cohesion: 0.18
Nodes (9): a(), d(), f(), h(), m(), u(), equals(), Ne() (+1 more)

### Community 62 - "Cg"
Cohesion: 0.18
Nodes (12): ag(), Cg(), dg(), eg(), _g(), hg(), ig(), lg() (+4 more)

### Community 63 - "connect"
Cohesion: 0.26
Nodes (12): connect(), j(), m(), disconnect(), dispatchEvent(), getOutput(), setFilter(), setFilters() (+4 more)

### Community 64 - "evaluate"
Cohesion: 0.17
Nodes (12): copySampleValue_(), evaluate(), getSettings_(), intervalChanged_(), setDuration(), setEffectiveTimeScale(), setEffectiveWeight(), stopFading() (+4 more)

### Community 65 - "applyMatrix4"
Cohesion: 0.42
Nodes (11): applyMatrix4(), mt(), distanceSqToSegment(), distanceTo(), hs(), intersectsFrustum(), intersectsObject(), intersectsSprite() (+3 more)

### Community 66 - "zg"
Cohesion: 0.18
Nodes (8): Bg(), n(), zg(), c(), l(), o(), s(), u()

### Community 67 - "hx"
Cohesion: 0.22
Nodes (11): Bx(), hu(), hx(), makeTranslation(), Mx(), Ob(), oe(), t() (+3 more)

### Community 68 - "fromArray"
Cohesion: 0.25
Nodes (11): da(), determinantAffine(), extractBasis(), extractRotation(), fromArray(), identity(), c(), setFromMatrix3Column() (+3 more)

### Community 69 - "yv"
Cohesion: 0.24
Nodes (7): hv(), traverseAncestors(), yv(), a(), i(), r(), s()

### Community 70 - "computeVertexNormals"
Cohesion: 0.39
Nodes (9): applyMatrix3(), applyNormalMatrix(), computeVertexNormals(), Dp(), normalizeNormals(), setFromCamera(), setXYZ(), transformDirection() (+1 more)

### Community 71 - "de"
Cohesion: 0.33
Nodes (9): de(), pe(), ue(), pe(), ps(), he(), me(), pe() (+1 more)

### Community 72 - "qp"
Cohesion: 0.29
Nodes (6): clearUpdateRanges(), onUploadCallback(), qp(), n(), o(), r()

### Community 73 - "updateProjectionMatrix"
Cohesion: 0.25
Nodes (8): clearViewOffset(), getFilmHeight(), getFilmWidth(), getFocalLength(), pv(), setFocalLength(), setViewOffset(), updateProjectionMatrix()

### Community 74 - "play"
Cohesion: 0.25
Nodes (8): ft(), getDelta(), getElapsedTime(), play(), setBuffer(), setDetune(), setPlaybackRate(), start()

### Community 75 - "crossFadeFrom"
Cohesion: 0.32
Nodes (8): crossFadeFrom(), crossFadeTo(), fadeIn(), fadeOut(), halt(), _lendControlInterpolant(), _scheduleFading(), warp()

### Community 76 - "rotateY"
Cohesion: 0.29
Nodes (7): applyAxisAngle(), rotateOnAxis(), rotateOnWorldAxis(), rotateX(), rotateY(), rotateZ(), setFromAxisAngle()

### Community 77 - "jp"
Cohesion: 0.29
Nodes (7): et(), hp(), jp(), Np(), pp(), shift(), Yn()

### Community 78 - "nm"
Cohesion: 0.43
Nodes (6): getParameter(), nm(), a(), o(), s(), je()

### Community 79 - "Ground.jsx"
Cohesion: 0.33
Nodes (6): @react-three/drei, GRAVEL, Ground(), LAWN, usePathGeometry(), PATH

### Community 80 - "setFromEuler"
Cohesion: 0.33
Nodes (6): applyEuler(), compose(), makeRotationFromQuaternion(), reorder(), setFromEuler(), setFromQuaternion()

### Community 81 - "getPoints"
Cohesion: 0.47
Nodes (6): containsBox(), extractPoints(), getPoints(), getPointsHoles(), toShapes(), t()

### Community 82 - "setPositions"
Cohesion: 0.40
Nodes (6): fromEdgesGeometry(), fromLine(), fromLineSegments(), fromMesh(), fromWireframeGeometry(), setPositions()

### Community 83 - "ve"
Cohesion: 0.60
Nodes (5): be(), ve(), ye(), ye(), _e()

### Community 84 - "getContext"
Cohesion: 0.40
Nodes (5): xe(), getContext(), outputColorSpace(), Td(), g()

### Community 85 - "enable"
Cohesion: 0.50
Nodes (4): disableAll(), enable(), v(), se()

### Community 87 - "pk"
Cohesion: 0.67
Nodes (3): dk(), fk(), pk()

### Community 88 - "intersectObject"
Cohesion: 0.67
Nodes (3): intersectObject(), intersectObjects(), Wf()

## Knowledge Gaps
- **135 isolated node(s):** `Dark Navy Glass UI Theme`, `roDotLabel`, `UP`, `BRASS`, `HANDLE` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 441 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Bv()` connect `Bv` to `index-C_Y5h7ku.js`, `ld`, `c`, `em`, `add`, `n`, `a`, `dispose`, `dd`, `b`, `r`, `o`, `nc`, `dc`, `xg`, `ec`, `sc`, `ba`, `ma`, `sr`, `At`, `yg`, `wo`, `Lt`, `push`, `i`, `ce`, `ea`, `a`, `connect`, `yv`, `de`, `ve`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `constructor()` connect `constructor` to `index-C_Y5h7ku.js`, `ld`, `copy`, `c`, `em`, `add`, `n`, `Bv`, `parse`, `a`, `dispose`, `raycast`, `dd`, `qm`, `b`, `r`, `o`, `nc`, `uy`, `getPoint`, `xg`, `sc`, `dot`, `ba`, `H`, `ma`, `sr`, `At`, `yg`, `wo`, `Lt`, `push`, `Og`, `i`, `ce`, `a`, `ea`, `a`, `connect`, `applyMatrix4`, `computeVertexNormals`, `de`, `updateProjectionMatrix`, `play`, `rotateY`, `jp`, `getContext`, `enable`, `findNode`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `yg()` connect `yg` to `index-C_Y5h7ku.js`, `ld`, `c`, `n`, `a`, `dispose`, `b`, `r`, `nc`, `dc`, `xg`, `ba`, `i`, `ce`, `ea`, `a`, `Cg`, `fromArray`, `de`, `nm`, `ve`, `enable`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `constructor()` (e.g. with `ae()` and `b()`) actually correct?**
  _`constructor()` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `Bv()` (e.g. with `Bt()` and `bn()`) actually correct?**
  _`Bv()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 105 inferred relationships involving `r()` (e.g. with `af()` and `Am()`) actually correct?**
  _`r()` has 105 INFERRED edges - model-reasoned connections that need verification._
- **Are the 114 inferred relationships involving `n()` (e.g. with `af()` and `Bg()`) actually correct?**
  _`n()` has 114 INFERRED edges - model-reasoned connections that need verification._