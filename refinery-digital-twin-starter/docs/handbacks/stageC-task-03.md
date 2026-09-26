# Stage C Task 03 â€” environment from real assets

Status: implementation, verification and publication complete; both internal reviews PASS. Original candidate approved by both reviewers on 26 September 2026, subject to the closing corrections recorded separately. Work on dual-look only; main unchanged.

## Authority and resolved acquisition rulings

Task 2 was approved by both reviewers. Mostafa judged its remaining gap to be terrain, ground and sourced assets, not generator detail. The Task 3 brief is saved in docs/superpowers/plans/2026-09-25-stage-c-task-03-real-assets.md.

Mostafa personally completed the Fab agreement and Sketchfab login. His broader sourcing ruling authorizes verified attribution-licensed models beyond the original Sketchfab CC0 filter. No credentials were accessed or agreements accepted by the agent. The subsequent acquisition checkpoint is explicitly resolved: implement, verify and stop at the Task 3 gate. Historical pauses are preserved in evidence/stageC-task-03/acquisition-history.md and do not remain active.

## What changed

- Real SRTM N28E033 terrain from Sinai, Egypt replaces generated ridge rings. Crop, source URL, license basis, horizontal compression, vertical scaling and protected-pad flattening are disclosed in ASSETS.md and sinai-terrain.json. This is adapted presentation geography around a synthetic plant, not a surveyed site.
- Poly Haven sand, Gravelly Sand and Rock Face 03 surfaces blend by slope/height, including colour, normal and roughness maps. Physical gravel/rock tile scales are 2.5/2.7 metres. Existing dirt track, tyre marks and macro variation remain.
- Poly Haven rock clusters replace generated rocks, instanced at a 900-triangle LOD. Existing procedural dry scrub remains.
- Three sourced cabins, two shipping containers, sourced parked pickups and moving pickup/tanker replace generated versions. One material per prepared model; instancing and baked vehicle atlases control render cost. Moving vehicle dimensions fit the existing road envelopes. Lamps/fans/flag/dust remain presentation features.
- New objects remain non-canonical, non-selectable and under the photoreal Dressing switch. Placement is separate presentation configuration. Near-plant props cast sun shadows. Cached model resources are cloned before modification and owned copies disposed.
- Loading size discovery includes the new GLBs, WebP maps and DEM binary. No external runtime service is required.

## Boundary

CAM-6 photoreal day is the judgment frame against the original PetroMind reference. Canonical data, six approved cameras and engineering baseline are unchanged. Asset/unit counts remain 57/6. All 32 canonical files verified unchanged. CAM-6 p95 <=25 ms, lazy assets <=80,000,000 bytes; inherited engineering/day/night/500-asset budgets remain.

## Verification

- npm run check: PASS, 26 Vitest tests, 31 pytest tests, seven visual-tool tests, lint, schemas and build.
- check:generators: PASS, 22 silhouettes at two base-detail levels and 22 optional-detail types at levels 0/1.
- Dressing visibility, unchanged plant identity/registry and portrait/landscape controls: PASS.
- Initial CAM-6 three active-motion dressing-on runs: p95 7.5 / 4.9 / 4.6 ms; approximately 159.2 draw calls. Lazy inventory 42,333,254 bytes. This preliminary run is superseded by the final results below.
- Full selection: PASS, 57 actual canvas picks with correct cards in all six look/geometry combinations (342 total). This run preceded only the non-selectable static-prop y correction; final dressing checks were rerun afterward.
- Motion/time/attract/tour checks: PASS. No Playwright video used as visual review evidence.
- Cold-load byte progress, completion after drawn frame, cancellation recovery and three mobile viewport layouts: PASS. Deliberate network throttling is documented; no new phone timing claim.
- Engineering regression: all 12 approved default/selected captures have 0.0000% differing pixels.
- Production server test: PASS. Final six-camera sets refreshed in both looks; final dressing/mobile/identity checks PASS.
- Final inherited/CAM-6 metrics: PASS. Both internal reviews: PASS; no unresolved implementation findings.

Hardware recorded: RTX 3050 Laptop GPU, pinned Chrome 146, 1600 x 900 DPR 1. AC/Performance plan. Laptop 1920 x 1080 and primary external 2560 x 1440, both 144 Hz. Metrics use approved uncapped flags; screenshots retain their approved flags.

## Evidence and limitations

Before captures are byte-for-byte copies of the approved Task 2 after set, with manifest/source commit. comparison.html presents before, candidate and original reference without crop or recolouring. Source and runtime inventories record SHA-256 and byte sizes. ASSETS.md contains individual-source attribution and modification records.

No reference-level realism claim. The fixed CAM-6 still allocates limited pixels to the plant; supplied models are not claimed as scans. Terrain is deliberately compressed and flattened for presentation. Existing distant equipment aliasing is not addressed by this task. Far hills remain smooth and a regular texture pattern is visible on some slopes. Internal review caught a 0.15 m static-prop grounding offset; containers and parked pickups now align with the pad top at -0.45 m, while cabins stay on the existing plinths at 0 m. Mobile browser emulation is not a new Samsung A35 physical-device report.

## Gate

Stop here for both external reviewers. No next task starts without both external approvals.

## Files touched

- `app/src/PhotorealEnvironment.tsx`, `SourcedDressing.tsx`, `MotionActors.tsx`, `sliceDressing.ts`, `looks/looks.ts`, `looks/LookSnapshot.tsx`: terrain/surface blending, replacement props, motion integration, visibility inspection.
- `data/presentation/real-assets.json`: presentation placement and sizing, outside canonical truth.
- `blender/scripts/import_site_container.py`, `prepare_real_assets.py`, `scripts/prepare_real_terrain.py`: reproducible derivative preparation with source checksums.
- `data/normalized/assets/env/`: DEM binary/metadata, six WebP maps, five sourced GLBs, derivative manifest; presentation assets excluded from canonical hash.
- `tests/visual/slice-capture.mjs`, `slice-check.mjs`, `slice-metrics.mjs`, `slice-live.mjs`, `motion-check.mjs`, `presentation-check.mjs`: Task 3 output routing and source visibility assertions; earlier task evidence preserved.
- `ASSETS.md`, `README.md`, `docs/REPO_FACTS.md`, Task 2 approval record, Task 3 plan/handback/evidence/metrics: provenance, rulings and verification.

No package dependencies, workflow, main branch, canonical data, approved baseline or camera coordinates changed. Unrelated workspace files are excluded.

## Final inherited performance checks

| Workload | Median ms | p95 ms | Draw calls | Result |
|---|---:|---:|---:|---|
| engineering / normal | 1.20 | 2.10 | 47.0 | PASS |
| photoreal / normal | 3.00 | 5.50 | 159.2 | PASS |
| engineering / 500 | 1.80 | 10.50 | 57.0 | PASS |
| photoreal-night / normal | 4.50 | 8.10 | 191.2 | PASS |

Initial engineering download: 8,870,467 bytes, below 13,200,115. All runs valid under recorded AC/Performance/display conditions. Raw evidence: docs/metrics/stageC-task-03-regression.json. Final CAM-6 repeats also pass, as recorded below.

## Final CAM-6 measurements and internal review

| Dressing | Median ms (three repeats) | p95 ms (three repeats) | Mean draw calls |
|---|---|---|---:|
| Off | 2.6 / 2.6 / 2.4 | 4.7 / 4.7 / 3.9 | 123.2 |
| On | 3.6 / 2.9 / 3.2 | 6.1 / 4.6 / 5.2 | 159.2 |

Every repeat passes 25 ms. Lazy assets: **42,333,254 / 80,000,000 bytes**. Source archives and review images are not shipped. Measurements run alone after browser interaction checks finish, with active motion and the approved uncapped flags. Raw samples: docs/metrics/stageC-task-03-after.json.

The terrain silhouette is the largest visible change in my assessment. It was not individually ablated, so no isolated cost or proven gain-per-millisecond ranking is claimed. Switching all dressing on raises the median of run medians from 2.6 to 3.2 ms and median p95 from 4.7 to 5.2 ms; this includes existing dressing and new sourced props, not solely the new models. Small frame-time differences remain subject to run variation.

Internal spec and code-quality reviewers both PASS after the grounding/shadow/validation corrections and completed evidence. Their metrics-only contingencies are satisfied by the final passing runs. No unresolved blocker. Publication verification passes below; external visual acceptance remains pending.

## Published candidate

Implementation/evidence commit: `4c71e7491a81300249aa9b30790cd65b8a1dfe1d`, pushed to origin/dual-look. GitHub Pages run [36191315285](https://github.com/Mostafanasr1/refinery-digital-twin/actions/runs/36191315285) succeeded.

Installed Chrome and Edge live checks PASS: [preview](https://mostafanasr1.github.io/refinery-digital-twin/next/) provenance matches the implementation commit; [root release](https://mostafanasr1.github.io/refinery-digital-twin/) remains main `83e54ba7cbb42d6d7cff1dbeb8c90457bbc2d494`. Live checks include both looks, day/night, motion freeze, Dressing switching, mobile viewport and actual asset selection. Captures and JSON are in evidence/stageC-task-03/live/; live-verification.log records both verdicts.

A documentation/evidence-only follow-up records this publication; it changes no runtime inputs. Both external approvals are still required. No active blocker or background work remains at hand-back.

## External approval and closing correction ruling — 26 September 2026

Both reviewers approve Task 3. Mostafa approves plant detail and night lighting; terrain acceptable for now, far hills and slope tiling deferred. Closing corrections: shared flat-grey plant dressing in engineering and corrected vehicle forward axis. Landscape remains photoreal; engineering grid remains. Continue into Task 4; submit corrections and Task 4 together with separate candidate sets. Approved engineering baseline remains untouched. See stageC-task-03-correction.md.
