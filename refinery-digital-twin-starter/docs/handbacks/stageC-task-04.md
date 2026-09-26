# Stage C Task 4 — process flow (combined gate)

Local implementation and verification complete; preview publication verification follows. No baseline promotion is authorized by this hand-back.

## Independent decisions at this gate

1. Task 3 correction, commit `e4030f1`: engineering plant dressing in flat grey under the same switch, with rocks/scrub/landscape remaining photoreal only; vehicle forward axis corrected. Its 12-image engineering candidate remains in `evidence/stageC-task-03/correction/engineering-candidate/`. See `stageC-task-03-correction.md` for evidence and known issues.
2. Task 4: physical pipe-following gradients and active pipe tint. Its own 12-image engineering candidate is in `evidence/stageC-task-04/engineering-candidate/`. Both candidates can be approved or returned independently. Approved baseline is unchanged.

## Implementation

Physical pipes and the flow overlay now share one route descriptor. All 22 existing connecting-pipe routes retain their centreline coordinates. Each process path follows these segments in travel order, including reverse traversal when required. All three current paths join continuously, so no gap arc is needed. A bounded quadratic arc exists only for a real uncovered interval, covered by unit tests. Missing route points retain the existing physical fallback pipe geometry rather than inventing an airborne route.

Physical pipes use two instanced material batches. The active route adds one instanced, depth-tested tube shell, just outside the opaque pipe surface (15 mm radial clearance). A scrolling shader gradient advances in metres along cumulative route length through bends. No dotted spheres or cone arrows remain. The physical active segments receive a subtle warm tint and emission; inactive segments retain their engineering/PBR materials and metre-based texture scale. All flow geometry is non-selectable.

Pause, master Motion, path changes and trip-to-standby recovery control the gradient. The existing guided tour already declared its processPathId; the player now renders that path while the tour runs. It clears afterwards without writing an operations selection. No tour data, captions, camera actions or timing changed.

## Evidence

Review entry: `evidence/stageC-task-04/review.html`.

- CAM-2 and CAM-6 in engineering, photoreal day and night: fixed cameras, original screenshot flags, motion time 2 and gradient phase 0, motion disabled and path paused. `frozen-captures.json` records the state.
- `process-flow-check.json`: all 57 canonical assets enabled in engineering/day/night and Blender/proxy; all three paths use physical-pipe segments; one overlay batch; depth testing enabled; master freeze/resume and path clearing.
- `control-check.json`: paused path changes update tint, look switches preserve frozen phase, clearing path clears tint, tripped path stops and standby recovery resumes.
- `full-tour-review.mp4` and `video-recording.json`: complete unchanged 42-second tour plus a short end hold, captured frame-by-frame at 60 virtual time samples per second, full viewport including HUD captions, JPEG quality 95 source frames, H.264 CRF 18 encode. Playwright clock drives only this offline capture; performance measurements use the unchanged real-time uncapped protocol. Every caption is asserted. Playwright recorder is not used for review. A preliminary high-bitrate VP9 recording reached only 29.74 distinct fps and was replaced rather than presented as 60 fps motion.

## Verification and budgets

Full `npm run check` PASS: 29 Vitest, 31 pytest, 7 visual-tool tests, lint, validation, normalization and production build. `check:generators` PASS: 22 silhouettes at two levels and 22 hero types at levels 0/1. Production serving test PASS. Canonical verifier: all 32 files unchanged. Approved baseline hashes and all tour data unchanged (`invariants.json`).

`docs/metrics/stageC-task-04-active.json`: ten fixed-camera active-path cases pass. Engineering CAM-2/CAM-6 peak 70 calls, p95 4.7/3.5 ms; photoreal day peak 164 calls, p95 5.5/5.1 ms. All three routes checked at both cameras at night: peak 196 calls against 200; highest p95 11.3 ms against 25. Lazy assets 42,333,254 bytes, unchanged from Task 3.

`docs/metrics/stageC-task-04-regression.json`: engineering median 1.6 ms/p95 2.4 ms/68 calls; photoreal day 3.3/6.8 ms/159.2 calls; night 5.1/11.1 ms/191.2 calls; engineering stress500 1.7/8.7 ms/78.2 calls. Initial engineering download 10,954,270 bytes against 13,200,115. All validity checks and budgets PASS. AC/Performance, RTX3050, Chrome146, two144Hz displays with external primary,1600x900DPR1; display configuration recorded per run.

All 342 real canvas picks PASS: 57 assets × Blender/proxy × engineering/day/night (`selection-all.json`, `selection-night.json`). Loading/mobile PASS: byte progress in both first-load moments; completion after actual draw; warm cache; history cancellation/proxy recovery; 412×915,915×412 and360×640 layouts without document overflow. These are desktop viewport emulations, not new phone results.

Final review clip: 2,533 unique captured frame hashes,60fps,H.264CRF18,1600×900,42.216667seconds,80,508,188bytes. The unchanged tour runs42seconds, followed by a0.2second hold. Review media is not a runtime/lazy asset. Both internal reviewers PASS the implementation and completed evidence; no unresolved finding. Publication verification is the remaining submission step.

## Limits carried forward

Terrain far hills/slope tiling remain accepted for now under Task 3's verdict. Pre-existing cabin emissive-pane offsets remain the documented later-pass issue. Narrow pipe-following pulses are less conspicuous at the wide CAM-6 framing than the former airborne arcs; they now correctly sit on, and can be occluded with, actual pipes. No claim of reference-level realism is made. No new physical-phone test is claimed; Mostafa's last report was Samsung A35 Chrome, 2-second initial and photoreal loaders, clean layout.

Canonical assets remain 57 across 6 units. No sourced assets or licenses were added. Procedural flow presentation configuration lives in `data/presentation/flow.json`.

## Files touched and review state

Runtime: `FlowOverlay.tsx`, new `ProcessPipes.tsx` and `flowGeometry.ts`, `Scene.tsx`, `MotionActors.tsx` measurement bridge, `main.tsx` and `presentation.ts`. Presentation configuration: new `data/presentation/flow.json`. Unit tests: `flowGeometry.test.ts` and updated `data/flow.test.ts`. Evidence tools: process-flow check/controls/capture/metrics/frames scripts and Task4-conditional live assertions in `slice-live.mjs`. Documentation: README,ASSETS,REPO_FACTS,this hand-back, Task4 metrics and evidence. No canonical file, tour data, camera definition, sourced asset or approved baseline changed.

Task3 correction commit: `e4030f11c9f028c8206de7efc0dbabbf00372901`. Task4 implementation commit and live verification will be recorded after publishing. Main remains the approved release; only dual-look publishes `/next/`. Stop at this combined gate and wait for both reviewers; neither engineering candidate is promoted.
