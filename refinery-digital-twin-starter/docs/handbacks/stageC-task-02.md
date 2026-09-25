# Stage C Task 02 — CAM-6 vertical slice

Status: local candidate complete; publication verification pending, external slice approval pending.

## Authority and boundary

Mostafa supplied the full brief on 2026-09-25. It was saved verbatim before implementation at `docs/superpowers/plans/2026-09-25-stage-c-task-02-vertical-slice.md`, resolving the earlier missing-brief preflight stop. Judgment is CAM-6, photoreal day only. Work is on `dual-look` for `/next/`; main remains the Task 9 release. Stop here for both external reviewers after submission.

Task-specific budgets: CAM-6 photoreal p95 <=25 ms; lazy assets <=60 MB. Canonical truth and approved engineering regression stay unchanged. All additions are procedural; no downloaded art or runtime dependency.

Stage C Task 1 approval and Mostafa's Samsung A35 Chrome report are also recorded in this hand-back's companion Task 1 records: 2-second first-load loader, 2-second first photoreal loader, clean layout. Those are Mostafa's physical-device observations, not new agent measurements.

## What changed

- 62 non-canonical dressing modules: three-tier pipe racks with flange collars and cable trays, secondary vessel skids, connected switchback stairs, maintenance trucks, lighting masts, pipe laydown and cable reels. Six merged material batches; no asset IDs, registry entries or raycast targets. The photoreal Dressing checkbox switches the whole group off/on. Existing standalone pipe bundles are replaced by the integrated laydown group.
- Fittings follow existing canonical route points without modifying routes or process topology. Dressing does not connect new vessels into operational data.
- Optional Blender builders now supply additional detail to every instance of all 22 plant types: 57 assets. Type-specific service nozzles/bands, motor fins, sphere bracing, roof seams, vents/louvres, access and pipe details. Base engineering GLB is unchanged. Generated optional detail: 222,616 triangles.
- Procedural metre-space material wear/grime, with different strengths per material role. Pad variation, concrete joints and tyre tracks. No texture or material-scale changes to engineering.
- Photoreal daylight exposure/bloom and shadow bias tuned at CAM-6. Night preset retains its lighting settings; the new geometry remains available there and is regression-measured.

## Evidence

`docs/handbacks/evidence/stageC-task-02/`:

- `comparison.html`: before / after / original PetroMind wide reference side by side; full-size toggle. Original pixels and aspect ratios retained, no crop or recolouring. Reference remains review-only.
- `before/` and `after/`: all six cameras in engineering and photoreal day, 1600 x 900. Identical approved camera coordinates and noon preset. CAM-6 is the visual judgment frame; others provide context/regression evidence.
- `CAM-6-dressing-off.png`: same final candidate with the presentation group disabled.
- `engineering-comparison.json`: all 12 approved default/selected captures have **0.0000% changed pixels**.
- `slice-check.json`: off/on/restored, hidden engineering group, registry/base identity unchanged, 57 optional-detail assets, hidden-detail raycasting disabled, portrait/landscape toolbar checks, no runtime/shader console errors.
- `check.log`: 26 Vitest tests, 31 pytest tests, seven visual-tool tests, lint/schema validation/build pass.
- `generators.log`: all 22 silhouettes at two base-detail levels, all 22 optional-detail builders at levels 0 and 1 pass.
- `canonical-check.log`: all 32 canonical files unchanged. Asset and unit counts remain **57 / 6**; no canonical files changed.

Full selection verification passes: **57/57 actual canvas picks and correct cards in all six look/geometry combinations (342 total)**. Records: `selection-all.json`, `selection-night.json`, `selection.log`.

## Performance

Reference hardware: NVIDIA RTX 3050 Laptop GPU / D3D11, pinned Chrome 146, 1600 x 900, DPR 1. AC connected, Performance plan. Both 144 Hz displays connected: laptop 1920 x 1080, external primary 2560 x 1440. Uncapped metrics flags as approved; screenshots use their unchanged flags. Final CAM-6 runs freshly record display/power before each repeat. Static captures freeze animation; metrics keep motion active.

| Fixed CAM-6 day | Median ms, three runs | p95 ms, three runs | Mean draw calls |
|---|---|---|---|
| Before Task 2 | 2.3 / 2.3 / 2.4 | 3.5 / 3.7 / 5.6 | 144.2 |
| Final, dressing off | 2.2 / 2.3 / 2.6 | 3.2 / 3.4 / 3.7 | 144.2 |
| Final, dressing on | 2.5 / 2.6 / 2.5 | 3.7 / 4.3 / 3.7 | 162.2 |

Task-specific p95 budget: PASS in every repeat. Conservative lazy folder inventory, including manifests: **29,647,667 bytes / 60,000,000**. The earlier before-run inventory excluded the optional manifest; its byte value is not used as an apples-to-apples growth calculation. No validity claim relies on FPS versus refresh rate.

Inherited orbit regression metrics:

| Workload | Median ms | p95 ms | Draw calls | Result |
|---|---:|---:|---:|---|
| Engineering | 0.9 | 1.5 | 47.0 | PASS |
| Photoreal day | 2.5 | 4.0 | 162.2 | PASS |
| Engineering, 500 assets | 1.4 | 10.1 | 57.3 | PASS |
| Photoreal night | 3.9 | 6.5 | 194.2 | PASS |

Initial engineering download: **8,867,158 bytes**, below 13,200,115. Night p95 remains below 25 ms; night mean calls remain below 200. Raw records: `docs/metrics/stageC-task-02-before.json`, `stageC-task-02-after.json`, `stageC-task-02-regression.json` and its Markdown report.

## Visual gain per millisecond

My visual assessment: the batched dressing gives the largest visible gain, particularly in the previously empty right-hand process area. Controlled off/on measurements on the same final candidate change the median of run medians from 2.3 to 2.5 ms (approximately +0.2 ms); median p95 changes from 3.4 to 3.7 ms (+0.3 ms), adding 18 draw calls. Run-to-run variation is material at these small times, so this is an approximate cost, not a precision benchmark. Other individual changes were not separately ablated; this is a visual judgment supported by the dressing comparison, not a proven exhaustive ranking.

## Corrections and limitations

Both internal reviewers' initial attachment/stair findings were corrected: per-type shell/motor centres, tapered stack band radius, sphere-leg attachment positions, connected stair flights/landing/supports and separate grounded tyres. The complete vehicle circuit and cabin strip are checked for clearance. Tests that encoded the former six-type detail subset were updated to enforce all registered types and valid optional-part prefixes.

A draft ground shader used a reserved GLSL identifier and failed to draw the pad. Visual inspection caught it; the identifier was corrected, shader-console failure checks added, and final captures regenerated. That draft is superseded and is not acceptance evidence. The initial sandbox denied esbuild's config reads; the required suite was rerun successfully with authorized tool escalation. Blender's user-preferences/cache warnings did not prevent generation or checks.

The distant tank seams still show dotted/aliased detail in the before and after frames. Ground and equipment changes do not eliminate the existing broad background mountain forms or the fixed frame's limited plant pixel coverage. No reference-level realism claim is made; Mostafa and Claude judge the image. Mobile checks here are emulated toolbar checks, not a new physical-phone review.

## Review and publication

Internal spec and code-quality reviewers passed the source and completed slice evidence. Inherited metrics and all-selection checks are now complete; final publication records remain to be appended. External approval is pending. No Stage C task beyond this gate is authorized to start.


## Files touched

- `data/presentation/slice.json`: procedural layout, material wear and daylight tuning.
- `app/src/sliceDressing.ts`, `SiteDressing.tsx`, `sliceState.ts`, `TimeControls.tsx`, `Scene.tsx`: grouped geometry, placement, switch and scene wiring.
- `app/src/looks/surfaceWear.ts`, `equipmentBatches.ts`, `PhotorealEnvironment.tsx`, `looks/timeLook.ts`: photo-only material/ground/light treatment.
- `app/src/looks/LookSnapshot.tsx`, `slice.test.ts`: measurement-only visibility inspection and clearance/non-selection tests.
- `blender/generators/hero_detail.py`, `blender/scripts/check_generators.py`: all-type optional-detail generation and verification.
- `blender/assets/hero-detail.blend`, `data/normalized/assets/detail/hero.glb`, `manifest.json`: regenerated optional presentation geometry and material-part inventory; not canonical truth.
- `tests/test_hero_detail.py`: all-type ID/coverage verification.
- `tests/visual/slice-capture.mjs`, `slice-check.mjs`, `slice-metrics.mjs`, `slice-live.mjs`, `selection-all.mjs`: slice evidence and Stage C output routing.
- Plan, this hand-back, `docs/metrics/stageC-task-02-*`, and `docs/handbacks/evidence/stageC-task-02/**`: ruling and evidence.
- `ASSETS.md`, `README.md`, `docs/REPO_FACTS.md`: inventory, usage and current state.
- `docs/handbacks/stageC-task-01.md`, `docs/handbacks/evidence/stageC-task-01/phone-report.json`: already-authorized prior gate approval and Mostafa's phone report.

No canonical files, approved baseline, CAM-6 coordinates, base GLB, main branch, package dependencies or workflow changed. Unrelated workspace files are excluded from the commit.
