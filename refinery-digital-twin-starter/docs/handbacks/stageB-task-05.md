# Stage B Task 05 — Hero detail

24 September 2026. Branch: `dual-look`. Complete under the authorized non-gate self-review cadence. Task 06 remains the next external gate.

## Result

Six procedural builders add optional detail to every matching instance: 18 assets across columns, fired heater, flare, fixed/floating-roof storage tanks and pipe racks. Cages, platform supports, heater stairs/burners, tank fittings/stringers, rack bracing/trays/shoes are generated from existing dimensions. No new canonical equipment. Optional detail is a separate lazy GLB: 71,236 triangles, 3,654,168 bytes. The approved base GLB is untouched.

Detail is merged into material batches and cached after first Photoreal use. Engineering and proxy modes hide it and disable raycasting. Direct mesh-ray probes verified visible/hidden/restored transitions: 7 → 0 → 7 → 0 → 0 → 7 hits across Engineering/Photoreal and Blender/proxy. Base geometry identities and registry bindings are unchanged. All 32 canonical files verify unchanged; 57 assets and six units remain.

## Review correction and ruling

The first quality review identified hidden geometry intercepting clicks. The parent paused after a spec PASS and that correctable finding. Mostafa clarified: opposite verdicts on the same question constitute reviewer disagreement; one pass plus an in-scope finding is a correction loop. Correct and re-review without stopping, unless resolution needs an out-of-scope decision or breaks another acceptance criterion. This ruling is recorded in `docs/REPO_FACTS.md`. Historical pause handback is retained as `evidence/stageB-task-05/resolved-pause.md`.

The approved correction disables each hidden detail mesh's raycast and restores the native instanced-mesh method when visible. Actual browser raycasts verified both transitions; quality re-review passed. F-201's extra close-up was raised and pulled back to show stairs, platform and burners above the foreground rack. Approved fixed cameras were not changed.

## Verification

- 19 Vitest, 31 pytest and six visual-tool tests pass; lint, validation, TypeScript and build pass after the correction.
- Generator check passes: 22 silhouettes at both levels and six hero types at levels 0/1, covering names, proportions, grade and materials.
- Ten Engineering regression captures pass, 0.2603–0.3146% against the 0.5% ceiling. CAM-6 remains capture-only. The picking correction changes no rendered geometry or materials.
- Before/after captures at all six cameras and three extra close-ups are in the evidence folder. Hero-flow validates lazy caching, identical base identity and registry, visual hiding and actual picking transitions, without browser errors.
- All 228 actual canvas picks/cards pass across both looks and geometry modes. Ten look switches per geometry retain selection, camera and stable resources; layers, process playback and scenarios pass. Both internal reviewers returned final PASS.

## Budgets

| Workload | Median ms | p95 ms | Draw calls | Budget |
|---|---:|---:|---:|---|
| Engineering | 1.00 | 1.60 | 47.0 | PASS |
| Photoreal | 1.70 | 2.60 | 69.0 | PASS |
| Engineering, 500 assets | 1.30 | 10.20 | 57.3 | PASS |

Combined lazy assets: 21,417,040 bytes against 40,000,000. Metrics are in `docs/metrics/stageB-task-05-rerun.{json,md}` using the approved uncapped frame-time protocol with display and power records. These are browser-loop timings, not physical monitor presentation rates. Final corrected-build measurements all pass. Engineering initial download is 8,729,913 bytes, below 13,200,115.

## Files touched

`blender/generators/hero_detail.py`, `blender/scripts/{build_hero_detail.py,check_generators.py}`, `blender/assets/hero-detail.blend`, `scripts/build_hero.py`, `data/normalized/assets/detail/`, `data/presentation/materials.json`, `app/src/Scene.tsx`, `app/src/looks/{looks.ts,LookSnapshot.tsx}`, `tests/test_hero_detail.py`, `tests/visual/{hero-flow.mjs,look-common.mjs}`, `ASSETS.md`, `docs/REPO_FACTS.md`, Task 05 metrics/evidence and this handback. No canonical data, frozen cameras or screenshot baseline changed. All new art is original procedural geometry.

## Known limitations

Hero detail does not resolve the overall plant density or final lighting. Mostafa's hero/wide-image verdict and decisions on Tasks 5b and 7 remain at Task 6. No human visual acceptance is claimed here. Daytime close-ups still show deliberately restrained materials; atmosphere is Task 6.

## Pasted check evidence

### check-corrected.log

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
   Start at  23:33:30
   Duration  1.95s (transform 1.38s, setup 0ms, import 5.45s, tests 545ms, environment 2ms)

============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.4.2, pluggy-1.6.0
rootdir: C:\Users\Mosta\OneDrive\Documents\ChatGPT\Oil and Gas\refinery-digital-twin-starter
configfile: pyproject.toml
testpaths: tests
collected 31 items

tests\test_catalog.py ..                                                 [  6%]
tests\test_glb.py ..                                                     [ 12%]
tests\test_hero_detail.py .                                              [ 16%]
tests\test_materials.py ............                                     [ 54%]
tests\test_normalization.py ........                                     [ 80%]
tests\test_validation.py ......                                          [100%]

============================= 31 passed in 5.03s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 4.0169
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 10.7111
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 707.6039
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 2.6551
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 2.032
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.5117
  type: 'test'
  ...
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 897.4871

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
dist/assets/index-DrkZRsYt.js   1,438.48 kB │ gzip: 414.57 kB
✓ built in 6.36s

```

### generators.log

```text

> refinery-digital-twin@0.0.0 check:generators
> node scripts/python.mjs -m scripts.check_generators

Checked 22 silhouettes at 2 detail levels; 6 hero types at levels 0 and 1
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)

Blender quit

```

### regression.log

```text
CAM-1-default.png: 0.2825% differing pixels (PASS)
CAM-1-selected.png: 0.2802% differing pixels (PASS)
CAM-2-default.png: 0.3146% differing pixels (PASS)
CAM-2-selected.png: 0.3135% differing pixels (PASS)
CAM-3-default.png: 0.2610% differing pixels (PASS)
CAM-3-selected.png: 0.2603% differing pixels (PASS)
CAM-4-default.png: 0.2654% differing pixels (PASS)
CAM-4-selected.png: 0.2649% differing pixels (PASS)
CAM-5-default.png: 0.2647% differing pixels (PASS)
CAM-5-selected.png: 0.2630% differing pixels (PASS)
CAM-6-default.png: CAPTURED — new approved camera, no baseline comparison
CAM-6-selected.png: CAPTURED — new approved camera, no baseline comparison

```



