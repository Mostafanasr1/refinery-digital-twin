## Latest state — revised stress comparison awaiting external monitor

The new p95 stress ruling replaces the failed 5% FPS criterion. Laptop-only 500-asset run completed: engineering p95 11.40 ms, photoreal p95 11.70 ms. Await external monitor connection for the matching condition. Task 4 is paused per Mostafa's latest instruction to resolve the protocol first. All measurement jobs have exited. See the latest entry in `docs/REPO_FACTS.md`.

## Latest state — protocol proof failed; execution stopped

Both uncapped Task 3 comparisons exceed the approved 5% agreement limit. Engineering: laptop 2000.0 FPS, external 1111.1 FPS (44.44%). Photoreal: laptop 1111.1 FPS, external 714.3 FPS (35.71%). The display-independent protocol is not confirmed. Full outcome and limitations recorded in `docs/REPO_FACTS.md`; raw samples preserved under `docs/metrics/display-protocol/`. All measurement processes exited. Task 4 remains paused, uncommitted and unpushed; no later task started. Await a protocol ruling.

## Latest protocol ruling — proof in progress

Mostafa authorized a controlled Task 3 comparison with uncapped metrics flags. The connected-monitor half is complete; laptop-only half awaits the user's setup confirmation. See `docs/REPO_FACTS.md` and `docs/metrics/display-protocol/external.json`. This supersedes the previous immediate requirement to unplug for normal Task 4 metrics: Task 4 now resumes after the protocol proof passes. All measurement processes have exited; implementation and other task execution are paused while awaiting the physical setup change.

# Stage B Task 04 — Corrected candidate; paused for measurement setup

24 September 2026. Mostafa authorized resuming Task 4 and the previously requested corrections. No task completion, commit or push is claimed.

## Current state (supersedes the earlier reviewer-disagreement pause below)

Both internal reviewers now PASS the implementation. Corrected crown/stack decks to grating, ladders to galvanized steel, and stair treads to safety yellow while preserving handrails. Grating has procedural 50 mm spacing and shallow normal-map relief; it remains opaque and creates no physical holes. Provenance is recorded in ASSETS.md and the material manifest.

Mostafa's physical-scale ruling is implemented: material tiling uses metres across model batches, proxy geometries, pipes and swatches. Added semantic mapping, grid periodicity and scale/position-preservation tests.

Rebuilt export: 57 assets, 167 mesh objects, 253,844 triangles; unchanged counts. Compressed GLB: 7,196,332 bytes. Canonical data: all 32 files unchanged.

Validation completed:
- Vitest: 19 passed.
- Pytest: 30 passed.
- Visual-tool tests: 5 passed.
- Lint, schema validation, TypeScript and production build passed.
- check:generators: 22 silhouettes at both detail levels passed.
- An initial sandboxed Vitest launch was blocked by compiler filesystem access; the full authorized rerun passed. This was not a test assertion failure.

Evidence: `evidence/stageB-task-04/check-corrected.log`, `generators-corrected.log`, `build-models-corrected.log`, `build-materials-corrected.log`, and `data-verify-corrected.log`. Earlier screenshots and interaction reports predate these corrections; they are not presented as verification of the final candidate.

## Current blocker and resume condition

Read-only preflight at 2026-09-24T19:31:50Z found:
- AC connected, battery 77%, Performance power plan.
- Internal display 1920 x 1080 at 144 Hz.
- External display 2560 x 1440 at 144 Hz, primary.
- `noExternalMonitor: false`.

The agreed laptop-only measurement condition is not met. No Task 4 performance run was launched and no budget verdict is claimed. Await Mostafa disconnecting the external monitor and authorizing continuation. All Task 4 execution is paused; both reviewers, model/texture builds and check jobs have finished. The separately requested real-estate demo server is outside this task and has not been stopped.

Remaining: corrected captures and visual inspection, interaction checks, engineering pixel regression, valid three-workload metrics, final handback and commit/push. Task 5 has not started.

## Carry-forward ruling for Task 6 (no plan change)

Use a small number of real shadow-casting lights; all other lamps emissive only. Mood reference designated by Mostafa: `docs/reference/mood-dusk.png`. This file was not present at the Task 4 inspection; verify the supplied reference before Task 6. Any density dressing remains a separate non-canonical group and is judged at the Task 6 gate. No canonical assets are to be added to fill the density gap.

## Current check output

```text

> refinery-digital-twin@0.0.0 check
> npm run normalize && npm run lint && npm test && npm run validate && npm run build


> refinery-digital-twin@0.0.0 normalize
> node scripts/python.mjs -m pipeline.normalize data/synthetic data/normalized

Validated normalized output written to data\normalized

> refinery-digital-twin@0.0.0 lint
> npm run lint -w app && node scripts/python.mjs -m ruff check pipeline tests


> @refinery/app@0.0.0 lint
> eslint src

All checks passed!

> refinery-digital-twin@0.0.0 test
> npm run test -w app && node scripts/python.mjs -m pytest && npm run test:visual-tools


> @refinery/app@0.0.0 test
> vitest run


 RUN  v4.1.11 C:/Users/Mosta/OneDrive/Documents/ChatGPT/Oil and Gas/refinery-digital-twin-starter/app


 Test Files  7 passed (7)
      Tests  19 passed (19)
   Start at  22:31:04
   Duration  2.53s (transform 1.79s, setup 0ms, import 8.31s, tests 392ms, environment 2ms)

============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.4.2, pluggy-1.6.0
rootdir: C:\Users\Mosta\OneDrive\Documents\ChatGPT\Oil and Gas\refinery-digital-twin-starter
configfile: pyproject.toml
testpaths: tests
collected 30 items

tests\test_catalog.py ..                                                 [  6%]
tests\test_glb.py ..                                                     [ 13%]
tests\test_materials.py ............                                     [ 53%]
tests\test_normalization.py ........                                     [ 80%]
tests\test_validation.py ......                                          [100%]

============================= 30 passed in 3.76s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 3.7986
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 12.3464
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 819.9906
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 2.8891
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 3.2983
  type: 'test'
  ...
1..5
# tests 5
# suites 0
# pass 5
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1043.8339

> refinery-digital-twin@0.0.0 validate
> node scripts/python.mjs -m pipeline.validate data/synthetic && node scripts/python.mjs -m pipeline.validate data/normalized

Validated all collections in data\synthetic
Validated all collections in data\normalized

> refinery-digital-twin@0.0.0 prebuild
> npm run normalize


> refinery-digital-twin@0.0.0 normalize
> node scripts/python.mjs -m pipeline.normalize data/synthetic data/normalized

Validated normalized output written to data\normalized

> refinery-digital-twin@0.0.0 build
> npm run build -w app


> @refinery/app@0.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 271 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DupH9ZgS.css     10.54 kB │ gzip:   3.12 kB
dist/assets/index-D0RSZepQ.js   1,436.79 kB │ gzip: 413.99 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 11.14s

```

## Historical paused submission

# Stage B Task 04 — Materials: paused candidate

24 September 2026. Branch: `dual-look`. Task 4 is incomplete, uncommitted and unpushed. Task 3 closed in `c4b1871`, with handback commit `c1c5b70`; both were pushed.

## Hard stop and decision required

Code-quality reviewer: PASS, no blocking quality findings. Specification reviewer: changes required. Applying Mostafa's explicit hard stop, "Your two internal reviewers disagree," execution is paused. These reviews address different axes; the quality pass does not establish specification compliance.

The specification findings are:

- `crown_platform` decks receive galvanized steel and `stack_platform` decks receive dark steel; both need grating. Stack platform handrails already retain safety yellow and should stay unchanged.
- Ladder rails/rungs inherit safety yellow instead of galvanized steel; stair treads remain galvanized instead of safety yellow.
- The grating texture currently uses metal-plate imagery without a grating grid. It needs material-only relief/pattern, preserving geometry.
- Add representative semantic mapping assertions; the current coverage checks only prove assigned roles exist.

Recommendation: authorize correction of these findings within Task 4, then repeat both internal reviews and finish the outstanding evidence. No budget, geometry, canonical-data or scope change is proposed. Await Mostafa's ruling before implementation or later tasks.

## Candidate changes

Added eight photoreal material roles, presentation-only type/part mapping, export-time material labels, lazy cached KTX2 loading, optional evidence swatches, textured pipe finishes, reproducible texture preparation, and mapping tests. Original engineering material values remain available. Export counts remain 57 assets, 167 meshes and 253,844 triangles.

Files touched:

- `data/presentation/materials.json`: material definitions and part rules.
- `blender/generators/material_stage.py`, `blender/scripts/build_demo_refinery.py`, `blender/scripts/check_generators.py`: role assignment and generation checks.
- `blender/assets/refinery.blend`, `data/normalized/models/refinery.glb`, `data/normalized/models/material-parts.json`: generated candidate export and part record.
- `scripts/basis-encode.mjs`, `scripts/build_materials.py`, `data/normalized/assets/materials/`: pinned portable encoder, texture preparation, 24 KTX2 maps, manifest and runtime transcoder.
- `app/src/Scene.tsx`, `app/src/equipmentBatches.ts`, `app/src/looks/LookProvider.tsx`, `app/src/looks/MaterialPack.tsx`, `app/src/looks/MaterialSwatches.tsx`: material integration, loading and evidence view.
- `tests/test_glb.py`, `tests/test_materials.py`, `tests/visual/look-common.mjs`, `tests/visual/material-flow.mjs`: candidate verification.
- This handback and `docs/handbacks/evidence/stageB-task-04/`: partial evidence.

Canonical data: no changes; 32 files verified unchanged after build/check. Source textures are Poly Haven CC0 metal_plate_02 and concrete_wall_007, with source checksums in the preparation script and output manifest. ASSETS.md documentation remains outstanding.

## Evidence at pause

- Model generation completed; log: `evidence/stageB-task-04/build-models.log`.
- An early check ran before export finished and failed on absent new metadata. Retained in `check.log`.
- Completed-export rerun passed: 18 Vitest, 20 pytest, 5 visual-tool tests, lint/validation and production build. Full output: `evidence/stageB-task-04/check-after-export.log`.
- The in-flight browser capture had completed with exit 0 by the halt attempt. It wrote six cameras in both looks and the material swatches. This is disclosed as completion during the stop transition, not additional authorized continuation.
- Browser flow reported no errors, no material requests on initial engineering load, 24 lazy texture requests, cache reuse and unchanged plant identity. Results: `material-flow.json` and `material-flow.log` in the evidence directory.
- Combined lazy environment/material files: 18,404,972 bytes, below 40 MB. This is only the file-size check, not full Task 4 budget acceptance.
- Task 4 performance metrics, engineering pixel regression, generator check and remaining interaction/visual acceptance are outstanding. Captures have not yet been accepted visually. No Task 4 completion or budget pass is claimed.

Both internal reviewers have finished. The browser capture process has exited. No review agents or measurement jobs remain active. Candidate files and partial evidence are preserved locally; Tasks 5 and 6 have not started.
