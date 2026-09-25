# Stage C Task 01 - motion and time of day

Status: **approved by both external reviewers**. Mostafa reports Samsung A35 / Chrome first-load loader 2 seconds, first photoreal switch 2 seconds, and clean mobile layout. Task 1 is complete. Main release remains `83e54ba`; Task 2 is authorized, subject to recovering its queued scope.

## Scope and ruling

Mostafa approved two photoreal-only, non-canonical end road connectors in the site context group, matching existing surface/markings and clear of equipment. This resolves the preflight road-layout question. The previous hand-back at commit `7ca05fd` records the original paused state; its -no implementation- statements are historical.

Connectors are 8 m wide at runtime x=-21 and x=257, z=37 to -135. They merge into the source Context_road and Context_marking materials. No canonical road/asset data or engineering scene geometry changed. Vehicle circuit has tangent 10 m turns. The far driving line is offset 1.8 m toward the existing road's outer edge to clear CT-404; that existing road remains unchanged. Dense swept-body samples at 0.25 m intervals and separating-axis checks against conservative rotated equipment bounds validate both complete vehicle bodies, cabins, road containment and fences.

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
- Corrected `motion-r2`: engineering median 0.9 / p95 1.5 ms, day 2.3 / 3.8 ms, engineering 500: 1.3 / 10.0 ms, night 3.5 / 5.2 ms. Draw calls 47 / 144.2 / 57.3 / 170.2. All budgets pass; retained as an earlier valid run; final artifact results below.

## Evidence and remaining gate work

Six-camera day/dusk/night images, mobile frames, tour layouts, browser assertions, engineering comparison and full test log: `docs/handbacks/evidence/stageC-task-01/`. Internal spec and quality source reviews PASS after scoped corrections; see internal-reviews.md.

Engineering visual regression: all 12 approved default/selected captures have **0.0000% differing pixels**. Baseline unchanged.

Final animated metrics: `docs/metrics/stageC-task-01-final.json` and `.md`. NVIDIA RTX 3050 / Chrome 146, 1600 x 900, DPR 1, AC/Performance, internal + external 144 Hz displays recorded in JSON. Uncapped protocol; frame time is primary.

| Look | Median ms | p95 ms | Draw calls | Verdict |
|---|---:|---:|---:|---|
| Engineering |1.10|2.00|47.0|PASS|
| Photoreal day |2.30|3.30|144.2|PASS|
| Engineering500 |1.40|10.50|57.3|PASS|
| Photoreal night |3.20|4.40|170.2|PASS (night p95 limit 25 ms)|

Initial engineering download 8,860,601 bytes, limit 13,200,115. Lazy photoreal assets 21,417,040 bytes, limit 40,000,000. Canonical 57 assets / 6 units unchanged across 32 locked files. No visible slowdown observed in automated captures; human motion/appearance judgment remains the gate.

**Review video:** `evidence/stageC-task-01/CAM-6-full-cycle-review.mp4`,1600 x 900, H264 / CRF 18, 60 fps, 243.1 seconds, 31,158,396 bytes. Contains 240.004 simulation seconds (one full day). Recorded through canvas.captureStream(60), MediaRecorder VP9 configured 24 Mbps; original local 404 MB source averaged 13.32 Mbps and 55.62 captured frames/second with variable timestamps. The review MP4 regularizes those timestamps to 60 fps with duplicated/dropped frames; it does not invent optical-flow frames or claim 60 unique source frames per second. Original is retained locally under ignored tests/visual/output/stageC-task-01. Metadata/checksum in video-recording.json. This uses the approved high-bitrate canvas capture method, not Playwright recorder. Static CAM-6 camera is held only for review capture; actual idle attract entry/time cycle and cancellation are separately asserted.

The video is review-only, committed with the hand-back, and excluded from app/dist and runtime asset budgets. `motion-video.mjs` reproduces capture and MP4 export using ffmpeg CRF18.

Implementation commit: `d4657c0a6a5cbb855f899d0912b4d06a7dc703d7`. Pages run [36133916881](https://github.com/Mostafanasr1/refinery-digital-twin/actions/runs/36133916881) succeeded. Installed Chrome and Edge both verify root main `83e54ba7cbb42d6d7cff1dbeb8c90457bbc2d494` and /next/ dual-look `d4657c0`. Live checks cover motion advance, slider keyboard input, presets, master freeze, day/night and mobile emulation. Evidence: `evidence/stageC-task-01/live/`.

Preview: https://mostafanasr1.github.io/refinery-digital-twin/next/

This hand-back's follow-up commit contains verification records and documentation only; it does not change the tested application. No non-gate task or Stage C Task 2 work has been started since the prior gate. No outstanding technical blocker; stop for Claude and Mostafa's gate reviews.

Mostafa's corrected Samsung A35 / Chrome layout and loading-timing report remains deferred to this gate. Previous physical phone pass was for the release; no numerical timings for the corrected loading/mobile view have been supplied. Desktop emulation is not physical phone evidence.

## Files touched

Presentation config: data/presentation/motion.json. Runtime: MotionActors, motionMath, motionState, TimeControls, TimeSky, timeLook, FlowOverlay, PhotorealEnvironment, PlantAtmosphere, Scene, LookProvider, main, presentation, style. Verification: motion.test.ts, scripts/visual-runtime.tsx, environment-metrics.mjs, motion-check.mjs, motion-video.mjs. Records: ASSETS.md, docs/REPO_FACTS.md, this hand-back and its evidence/metrics. Canonical files touched: none.


## External approval and physical phone report - 25 September 2026

Mostafa confirms both reviewers approve Stage C Task 1. Samsung A35, Chrome: first-load loader 2 seconds; first photoreal switch 2 seconds; mobile layout clean. These are Mostafa's physical-device observations, not desktop emulation or agent measurements. They resolve the earlier phone-pending gate items above. Evidence record: evidence/stageC-task-01/phone-report.json. Task 2 (the queued vertical slice) is authorized next, with a stop at its gate.
