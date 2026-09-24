# Stage B Task 05 — Hero detail (paused)

24 September 2026. Branch: `dual-look`. Candidate is uncommitted; last completed task is Task 04, commit `2726b90`. Task 06 has not started.

## Hard stop: internal review disagreement

The spec reviewer returned PASS. The code-quality reviewer found a blocking interaction defect: optional hero meshes retain pointer handlers under a hidden parent in Engineering and proxy mode. R3F raycasts registered meshes directly, and Three.js raycasting does not honor ancestor visibility. Invisible detail can therefore intercept clicks/hover after Photoreal has been visited. Quality approval awaits correction.

Execution paused under Mostafa's rule that disagreement between the two internal reviewers is a hard stop. Proposed correction: disable raycasting while optional detail is hidden, restore it when visible, and verify both transitions before rerunning affected interaction checks and both reviews. Await Mostafa's ruling and authorization to resume. No correction has been applied after the stop.

## Candidate work and evidence

Six procedural builders add optional secondary detail to all 18 matching assets: columns, fired heater, flare, fixed/floating-roof storage tanks and pipe racks. Detail is a separate lazy GLB, merged into material batches, with 71,236 exported triangles. The approved base GLB remains untouched. Canonical hash check passed: all 32 files unchanged, 57 assets and six units.

Generator check passed for 22 base silhouettes at both levels and six hero types at detail levels 0/1. Check suite passed: 19 Vitest, 31 pytest, six visual-tool tests, lint, validation, TypeScript and build. A final build after snapshot instrumentation passed. Logs are under `evidence/stageB-task-05/`.

Ten Engineering screenshot regressions passed, 0.2603–0.3146% against the 0.5% ceiling; CAM-6 is capture-only. Hero-flow verified base identity and registry preservation, lazy caching, and visual hiding in Engineering; it did not establish that hidden geometry cannot intercept input. Before/after captures at all six cameras and three extra close-ups are saved. F-201's revised extra close-up needs better framing before final handback.

| Workload | Median ms | p95 ms | Draw calls | Budget |
|---|---:|---:|---:|---|
| Engineering | 0.90 | 1.30 | 47.0 | PASS |
| Photoreal | 1.50 | 2.40 | 69.0 | PASS |
| Engineering, 500 assets | 1.00 | 10.80 | 57.2 | PASS |

Engineering initial download is 8,729,224 bytes; combined lazy assets are 21,417,040 bytes. Metrics use the approved uncapped frame-time protocol, with display and power recorded in `docs/metrics/stageB-task-05-rerun.json`. These browser loop timings are not physically displayed FPS.

The all-asset selection run was interrupted at the hard stop. Engineering/Blender completed 57/57 actual canvas picks/cards before interruption; remaining conditions are not passes. The full look-flow regression is unrun for this candidate. Internal reviewer findings are preserved in `evidence/stageB-task-05/internal-reviews.md`.

## Files touched so far

`blender/generators/hero_detail.py`, `blender/scripts/{build_hero_detail.py,check_generators.py}`, `blender/assets/hero-detail.blend`, `scripts/build_hero.py`, `data/normalized/assets/detail/`, `data/presentation/materials.json`, `app/src/Scene.tsx`, `app/src/looks/{looks.ts,LookSnapshot.tsx}`, `tests/test_hero_detail.py`, `tests/visual/{hero-flow.mjs,look-common.mjs}`, Task 05 metrics, evidence and this handback. No canonical data, frozen cameras or screenshot baseline changed. No new external art.

This is a blocker handback, not task completion or visual acceptance. Mostafa's hero/wide-image verdict and decisions on Tasks 5b and 7 remain at Task 6.
