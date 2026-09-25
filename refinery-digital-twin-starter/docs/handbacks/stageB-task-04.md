# Stage B Task 04 — Materials

24 September 2026. Status: complete under the authorized non-gate self-review cadence. Branch: `dual-look`. No external visual acceptance or final benchmark match is claimed; the next external gate remains Task 6.

## Result

Added eight reusable photoreal material roles with CC0-derived 1K KTX2 maps, restrained surface variation, an original procedural grating pattern, and lazy cached loading. Mapping lives in `data/presentation/materials.json`, with explicit type defaults and named part overrides. Blender export retains original engineering shader values and records part assignments separately. Insulated hot lines, painted remaining lines and process highlighting share the same plant identities.

Physical scale uses metres across model batches, primitive proxies, pipes and evidence swatches. Grating has 50 mm pitch and 5 mm nominal bars. Crown and stack decks use grating; ladders use galvanized steel; stair treads and handrails use safety yellow. Original positions/topology are unchanged: 57 assets, 6 units, 167 mesh objects, 253,844 exported triangles. Canonical data: no changes, all 32 locked files verified. Engineering screenshot baseline is unchanged.

## Accepted protocol ruling and proof

Metrics alone add `--disable-gpu-vsync` and `--disable-frame-rate-limit`; screenshot flags stay unchanged. Frame-time median and p95 in ms are primary, with derived FPS. Budgets are unchanged. Each run records monitor count, dimensions, refresh, primary status and power. The external monitor can remain connected following the successful Task 3 500-asset comparison:

| Look | Laptop p95 ms | External p95 ms | Difference ms | Tolerance ms | Result |
|---|---:|---:|---:|---:|---|
| Engineering | 11.40 | 12.30 | 0.90 | 1.14 | PASS |
| Photoreal | 11.70 | 12.50 | 0.80 | 1.17 | PASS |

The earlier 5% normal-load FPS-ratio rule failed and was explicitly superseded by Mostafa. Historical records remain intact. The successful comparison uses an identical hashed Task 3 deployment artifact, not this Task 4 candidate. `docs/REPO_FACTS.md` records chronology and outcomes. Measurement figures describe uncapped browser frame-loop timing, not physical monitor presentation rate.

## Task 4 budgets

| Workload | Median ms | p95 ms | Derived FPS | Mean calls | Result |
|---|---:|---:|---:|---:|---|
| Engineering | 0.70 | 1.30 | 1428.6 | 47.0 | PASS |
| Photoreal | 1.10 | 1.70 | 909.1 | 63.0 | PASS |
| Engineering, 500 assets | 1.10 | 10.40 | 909.1 | 57.3 | PASS |

Engineering initial transfer: 8,728,241 bytes, below 13,200,115. Combined lazy environment/material files: 17,504,013 bytes, below 40,000,000. Normal scene triangle count remains 479,196 engineering / 745,510 photoreal. Calls increased from Task 3's 32 / 47 because additional material partitions need submissions; still comfortably within 150 / 200. No visible interaction slowdown observed in verification; uncapped results are not presented as speed improvement over old capped runs.

Raw samples: `docs/metrics/stageB-task-04-rerun.json`; summary `.md`. Current command: `npm run metrics -- --task=04`. Explicit task number prevents accidental use of the historical Task 1 metrics entrypoint.

## Verification and review

- 19 Vitest, 30 pytest and 6 visual-tool tests passed; lint, schema validation, TypeScript and build passed.
- Generator check: all 22 silhouettes at both detail levels passed.
- Ten engineering regression images passed, 0.2603–0.3146% differing pixels against the 0.5% ceiling. CAM-6 remains capture-only.
- All 228 actual canvas picks/cards passed: 57 assets x two looks x two geometry modes.
- Ten repeated look switches per geometry mode retained camera, selected card, plant identity and stable resource counts. Layers, process state and scenario updates passed. No GLB reload on switching.
- Material pack: zero requests on initial engineering load; 24 lazy texture requests; cached across switches; no browser errors.
- Both internal spec and code-quality reviewers PASS. See `evidence/stageB-task-04/internal-reviews.md`.

Evidence includes all six default cameras in both looks, CAM-2/3/4 selected photoreal views, and `material-swatches.png` showing physically scaled 1 m spheres. The parent inspected CAM-2/3/4 and swatches. Material contrast is visible; plain silhouettes and sparse site composition are not represented as final realism. Whole-image assessment remains Task 6.

## Known limitations and carry-forward notes

- Grating is opaque recess shading/normal relief, not physical openings. No geometry was added in Task 4.
- Weathering is intentionally restrained; builder detail and final atmosphere are later tasks.
- Task 6 ruling: few real shadow-casting lights; remaining lamps emissive. Density dressing must be a separate non-canonical group judged at Task 6. Designated mood reference is `docs/reference/mood-dusk.png`; the file was absent at the last inspection and must be reconciled before that task.
- The initial build/check race, reviewer-disagreement pause, display setup pause and superseded measurement proof are retained in `evidence/stageB-task-04/pause-history.md`. All have explicit subsequent resolutions; no unresolved Task 4 blocker remains.
- The standalone selection test initially wrote its Task 2 default evidence path. Its new results were copied to Task 4 and the historical Task 2 file restored byte-for-byte from HEAD. The tool now accepts `--task=NN`.

## Files touched

Material implementation: `data/presentation/materials.json`; `blender/generators/material_stage.py`; `blender/scripts/build_demo_refinery.py`; `blender/scripts/check_generators.py`; `blender/assets/refinery.blend`; `data/normalized/models/{refinery.glb,material-parts.json}`; `data/normalized/assets/materials/`; `scripts/{build_materials.py,basis-encode.mjs}`; `app/src/{Scene.tsx,equipmentBatches.ts,equipmentBatches.test.ts}`; `app/src/looks/{MaterialPack.tsx,MaterialSwatches.tsx,LookProvider.tsx}`; `tests/{test_glb.py,test_materials.py}`; `tests/visual/{look-common.mjs,material-flow.mjs,selection-all.mjs}`; `ASSETS.md`.

Explicitly authorized measurement-protocol work: `scripts/{serve.mjs,visual-common.mjs,measurement-validity.mjs}`; `tests/visual/{display-protocol.mjs,environment-metrics.mjs,measurement-validity.test.mjs}`; `package.json`; `docs/{REPO_FACTS.md,APPROVED_BUDGETS.md}`; `docs/metrics/display-protocol*/`; Task 4 metrics/evidence and this handback. No other plan-level decisions changed. Unrelated workspace agreement files and real-estate demo are excluded.

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

### generators-corrected.log

```text

> refinery-digital-twin@0.0.0 check:generators
> node scripts/python.mjs -m scripts.check_generators

00:00.078  reports          | WARNING Unable to open 'C:\Users\Mosta\AppData\Roaming\Blender Foundation\Blender\5.2\config\userpref.blend': Permission denied
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)
Extensions: writing cache failed ([WinError 183] Cannot create a file when that file already exists: 'C:\\Users\\Mosta\\AppData\\Roaming\\Blender Foundation\\Blender\\5.2\\extensions\\.cache').
Checked 22 silhouettes at 2 detail levels

Blender quit

```

### visual-tools-final.log

```text

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 1.5394
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 5.7411
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 568.5325
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 1.119
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 0.9546
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.2521
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
# duration_ms 706.8058

```

### engineering-regression.log

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

### selection-all.log

```text
engineering/blender: 57/57 actual canvas picks and cards PASS
engineering/proxy: 57/57 actual canvas picks and cards PASS
photoreal/blender: 57/57 actual canvas picks and cards PASS
photoreal/proxy: 57/57 actual canvas picks and cards PASS

```

### metrics.log

```text

> refinery-digital-twin@0.0.0 metrics
> node tests/visual/environment-metrics.mjs --task=04

# Task 04 rerun

| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 47.0 | 479196 | 0.70 | 1.30 | 1428.6 | 8728241 | PASS |
| photoreal | normal | 63.0 | 745510 | 1.10 | 1.70 | 909.1 | 26240537 | PASS |
| engineering | 500 | 57.3 | 3916827 | 1.10 | 10.40 | 909.1 | 8728241 | PASS |

## engineering / normal submissions

Display: 144 Hz; AC: true; laptop only: false; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 11.0 | 11.0 |
| pipes | 2.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

## photoreal / normal submissions

Display: 144 Hz; AC: true; laptop only: false; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 11.0 | 11.0 |
| pipes | 2.0 | 2.0 |
| lamps | 2.0 | 1.0 |
| ground | 12.0 | 7.0 |
| helpers | 1.0 | 0.0 |

Post passes: 14.0.

## engineering / 500 submissions

Display: 144 Hz; AC: true; laptop only: false; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 21.3 | 11.0 |
| pipes | 2.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.


```
