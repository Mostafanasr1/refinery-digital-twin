# Stage C Task 01 - motion and time of day

Status: local implementation and acceptance checks complete; preparing /next/ publication and external gate on dual-look. Main release remains `83e54ba`. Stop at this task's gate; Stage C Task 2 is not started.

## Scope and ruling

Mostafa approved two photoreal-only, non-canonical end road connectors in the site context group, matching existing surface/markings and clear of equipment. This resolves the preflight road-layout question. The previous hand-back at commit `7ca05fd` records the original paused state; its -no implementation- statements are historical.

Connectors are 8 m wide at runtime x=-21 and x=257, z=37 to-135. They merge into the source Context_road and Context_marking materials. No canonical road/asset data or engineering scene geometry changed. Vehicle circuit has tangent 10 m turns. The far driving line is offset 1.8 m toward the existing road's outer edge to clear CT-404; that existing road remains unchanged. Dense swept-body samples at 0.25 m intervals and separating-axis checks against conservative rotated equipment bounds validate both complete vehicle bodies, cabins, road containment and fences.

## Implemented

- One instanced pickup and one instanced tanker; procedural type geometry, fixed separation, metre-based circuit speed.
- Instanced rotating fan blades at all air coolers and mechanical cooling towers, with inset discs over static base-model blades. Cooling tower louvres remain their physical fixed enclosure; the housed fans rotate.
- Blinking aviation warnings, wind-driven steam, daytime dust, gate flag; no people or birds.
- Instanced travelling process pulses in both looks. Engineering otherwise retains its approved lighting and scene.
- Shared master switch freezes motion and stops guided/attract camera presentation. Engineering exposes it when a process path is active.
- Continuous photoreal time slider with Day/Night presets; sun position/colour, sky, environment intensity, fog and lamp intensity interpolate. Photoreal idle attract advances a day in 240 simulation seconds and stops on input. Engineering-start attract retains its previous alternating-look sequence.
- Desktop time controls have their own bottom row. Mobile portrait/landscape controls and playback avoid overlap. Browser Back/Forward restores the URL's day/night preset.

All new art is original procedural presentation work; no downloaded assets, runtime dependencies, new shadow-casting lights or canonical changes. Lazy photoreal asset inventory remains 21,417,040 bytes (under 40 MB).

## Verification

- Full `npm run check`: 24 Vitest tests, 31 pytest tests, 7 visual-tool tests; schema validation, lint and production build passed.
- `npm run data:verify`: canonical data unchanged (32 files).
- Camera and interaction capture script checks six cameras at day/dusk/night, master freeze/resume, preset history, mobile bounds/non-overlap and both-look behavior. Expanded atmosphere/flow/real-idle checks PASS, including live tour-caption and completion non-overlap.
- `motion-r1` is superseded: an unconditional frozen R3F clock in the old visual bridge prevented actual motion during that run. This was caught by the actor-motion assertion. The bridge now freezes only static captures; animate=1 advances normally. Screenshot flags/protocol and uncapped metrics flags are unchanged.
- Corrected `motion-r2`: engineering median0.9/p951.5ms, day2.3/3.8ms, engineering5001.3/10.0ms, night3.5/5.2ms. Draw calls47/144.2/57.3/170.2. All budgets pass; retained as an earlier valid run; final artifact results below.

## Evidence and remaining gate work

Six-camera day/dusk/night images, mobile frames, tour layouts, browser assertions, engineering comparison and full test log: `docs/handbacks/evidence/stageC-task-01/`. Internal spec and quality source reviews PASS after scoped corrections; see internal-reviews.md.

Engineering visual regression: all12 approved default/selected captures have **0.0000% differing pixels**. Baseline unchanged.

Final animated metrics: `docs/metrics/stageC-task-01-final.json` and `.md`. NVIDIA RTX3050 / Chrome146,1600x900,DPR1, AC/Performance, internal+external144Hz displays recorded in JSON. Uncapped protocol; frame time is primary.

| Look | Median ms | p95 ms | Draw calls | Verdict |
|---|---:|---:|---:|---|
| Engineering |1.10|2.00|47.0|PASS|
| Photoreal day |2.30|3.30|144.2|PASS|
| Engineering500 |1.40|10.50|57.3|PASS|
| Photoreal night |3.20|4.40|170.2|PASS (night p95 limit25ms)|

Initial engineering download8,860,601bytes, limit13,200,115. Lazy photoreal assets21,417,040bytes, limit40,000,000. Canonical57assets/6units unchanged across32 locked files. No visible slowdown observed in automated captures; human motion/appearance judgment remains the gate.

**Review video:** `evidence/stageC-task-01/CAM-6-full-cycle-review.mp4`,1600x900,H264/CRF18,60fps,243.1seconds,31,158,396bytes. Contains240.004simulation seconds (one full day). Recorded through canvas.captureStream(60), MediaRecorder VP9 configured24Mbps; original local404MB source averaged13.32Mbps and55.62captured frames/second with variable timestamps. The review MP4 regularizes those timestamps to60fps with duplicated/dropped frames; it does not invent optical-flow frames or claim60unique source frames per second. Original is retained locally under ignored tests/visual/output/stageC-task-01. Metadata/checksum in video-recording.json. This uses the approved high-bitrate canvas capture method, not Playwright recorder. Static CAM6 camera is held only for review capture; actual idle attract entry/camera/time cycle and cancellation are separately asserted.

The video is review-only, committed with the hand-back, and excluded from app/dist and runtime asset budgets. `motion-video.mjs` reproduces capture and MP4 export using ffmpeg CRF18.

Publication/live provenance verification follows this commit; main must remain83e54ba. No Stage C Task2 work.

Mostafa's corrected Samsung A35 / Chrome layout and loading-timing report remains deferred to this gate. Previous physical phone pass was for the release; no numerical timings for the corrected loading/mobile view have been supplied. Desktop emulation is not physical phone evidence.

## Files touched

Presentation config: data/presentation/motion.json. Runtime: MotionActors, motionMath, motionState, TimeControls, TimeSky, timeLook, FlowOverlay, PhotorealEnvironment, PlantAtmosphere, Scene, LookProvider, main, presentation, style. Verification: motion.test.ts, scripts/visual-runtime.tsx, environment-metrics.mjs, motion-check.mjs, motion-video.mjs. Records: ASSETS.md, docs/REPO_FACTS.md, this hand-back and its evidence/metrics. Canonical files touched: none.
