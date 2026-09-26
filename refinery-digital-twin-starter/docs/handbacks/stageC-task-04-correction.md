# Stage C Task 4 closing correction and release

Prior Task 3 correction and Task 4 approved by both external reviewers. Engineering baseline promoted in order: `d57b027` (Task 3 correction), then `ae2a048` (Task 4). Candidate archives retained. The current approved baseline is Task 4; all 12 regression captures compare at 0.0000% difference after this correction.

## Flow correction

Flow control sits beside Process path when a path or guided tour is active. Pipes is the default; Arcs restores the former raised Catmull-Rom route shape. Both use one instanced tube batch with a travelling gradient, with a faint continuous guide for Arcs and no dots. Physical active pipes remain subtly tinted. Either style uses a minimum three-CSS-pixel tube diameter with perspective distance scaling; nearby physical thickness is retained. Depth testing and non-selection remain enabled.

The choice is presentation data in `data/presentation/flow.json`, persists as `?flow=pipes|arcs`, and survives reload, back/forward and look switching. Flow changes during a tour do not stop it or change its timing/captions. Same-look history navigation preserves a custom time of day.

## Verification

Final npm check PASS: 31 Vitest, 31 pytest and 7 visual-tooling tests; lint, validation and build pass. Style/URL/history/tour and mobile checks PASS at 412 x 915, 915 x 412 and 360 x 640. Canonical verifier PASS: 32 frozen files unchanged. All 12 promoted baseline comparisons are exact. Internal specification and code-quality reviewers both give final PASS, no unresolved findings. Reviewer findings were fixed in scope: style-dependent geometry memoization; same-look history resetting a custom hour.

Both-style rendering budgets pass on the reference RTX3050 laptop, AC/Performance, two144Hz displays recorded, pinned Chrome146,1600x900DPR1, approved uncapped flags. Geometry/shaders were final at measurement; the subsequent history guard affects only same-look popstate, not fresh-load measurement cases. No budget, renderer, camera or timing protocol changed.

| Style | Look | Camera | Median ms | p95 ms | Peak calls | Result |
|---|---|---|---:|---:|---:|---|
| pipes | engineering | CAM-6 | 1.7 | 3.0 | 70 | PASS |
| pipes | photoreal | CAM-6 | 3.3 | 5.4 | 164 | PASS |
| pipes | photoreal-night | CAM-2 | 4.8 | 7.8 | 191 | PASS |
| pipes | photoreal-night | CAM-6 | 5.3 | 9.0 | 196 | PASS |
| arcs | engineering | CAM-6 | 1.4 | 2.4 | 70 | PASS |
| arcs | photoreal | CAM-6 | 2.9 | 5.1 | 164 | PASS |
| arcs | photoreal-night | CAM-2 | 4.8 | 7.3 | 191 | PASS |
| arcs | photoreal-night | CAM-6 | 4.9 | 7.3 | 196 | PASS |

Lazy assets remain 42,333,254 bytes. Canonical truth remains 57 assets,6 units,32 frozen files. No source asset/license changes. No runtime asset added by the alternate flow style.

## Files and release

FlowOverlay,flowGeometry,ProcessPipes,flowStyle,main,LookProvider,flow presentation config and focused tests/evidence. Baseline promotion metadata preserves browser/renderer/config compatibility. Main release merge and Chrome/Edge verification follow local completion. Phone check belongs to Mostafa; no new report claimed. Keep /next/ on dual-look. Task 5 offline stills follow release; stop at its gate.

### Published release

Correction commit `7cf6bb63b9ac2d5cc7bf22747893c4f3d343ac94` pushed to dual-look, then fast-forward merged and pushed to main under explicit authorization. Pages run 36219034526 succeeded. Installed Chrome and Edge both PASS root verification: exact release commit, 57 bound canonical assets, actual Pipes/Arcs geometry in engineering/day/night, URL persistence/reload. `/next/` remains dual-look at the same release commit. Evidence: `evidence/stageC-task-04-correction/live/`. The first live-check attempt incorrectly expected the process-path selection to persist after reload; the harness now reselects the path before asserting persisted Flow style. No app change was needed. Physical-phone result remains pending Mostafa; no inferred pass. Working branch returned to dual-look for Task 5.
