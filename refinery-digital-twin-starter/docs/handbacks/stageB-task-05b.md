# Stage B Task 05b — sphere-tank smoothing

25 September 2026. Branch dual-look. Narrow scope confirmed by Mostafa: sphere shells only; no additional type detailing. Task 7 is skipped and density remains Stage C.

## Change

Sphere-tank shells now use 64 longitudinal segments and 32 rings with smooth normals, at both builder levels. Other sphere callers retain 24/12 and their prior shading. Dimensions, materials, asset identities, supports and all other equipment builders are unchanged. The base model regenerated with 57 assets across six units. Meshopt preserves decoded vertex attributes exactly during compression.

Base GLB grows from 7,196,332 to 7,263,344 bytes (+67,012). No new downloaded assets or dependencies. The procedural Blender source remains reproducible with npm run build:models.

## Evidence

All 22 silhouette builders at two levels and six optional hero builders pass check:generators. Check suite passes 19 Vitest, 31 pytest and six visual-tool tests, lint, validation and production build. All 32 canonical files unchanged. Engineering regression passes all ten anchors, maximum 0.3744%; CAM-6 remains capture-only. CAM-6 captures cover engineering, day and night; the visible flat sphere facets are removed. Internal spec and code-quality reviewers both PASS the implementation.

Final valid metrics all PASS: engineering median/p95 1.10/2.20 ms, 47 calls; day 2.40/3.40 ms, 128 calls; night 3.00/4.90 ms, 153 calls; engineering 500 assets 1.30/10.70 ms. Initial engineering download 8,825,211 bytes; lazy photoreal assets unchanged at 21,417,040 bytes. Both 144 Hz displays, AC Performance and uncapped flags recorded. Task complete under non-gate cadence; continue Task 8.

## Files touched

blender/generators/equipment.py; blender/scripts/check_generators.py; generated blender/assets/refinery.blend and data/normalized/models/{refinery.glb,build-report.json}; tests/visual/{environment-metrics.mjs,sphere-capture.mjs}; Task 05b handback, evidence and metrics. No canonical files changed. No other builder detail or dressing change.

## Known limits

Primitive proxies retain their deliberate low-detail geometry. Reference judgment uses the generated Blender model. Other plain types are outside the confirmed narrow scope.

## Pasted checks

### check.log

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
   Start at  04:30:12
   Duration  1.47s (transform 964ms, setup 0ms, import 4.05s, tests 422ms, environment 1ms)

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

============================= 31 passed in 3.42s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 2.2248
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 7.3487
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 612.9967
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 1.7933
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 1.2125
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.3209
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
# duration_ms 769.0102

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
✓ 277 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DBIp-N-9.css     10.76 kB │ gzip:   3.18 kB
dist/assets/index-CDnUoZjF.js   1,466.55 kB │ gzip: 423.23 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 5.82s

```

### generators.log

```text

> refinery-digital-twin@0.0.0 check:generators
> node scripts/python.mjs -m scripts.check_generators

Checked 22 silhouettes at 2 detail levels; 6 hero types at levels 0 and 1
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)

Blender quit

```


## Pasted metrics

# Task 05b rerun

| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 47.0 | 492956 | 1.10 | 2.20 | 909.1 | 8825211 | PASS |
| photoreal | normal | 128.0 | 1456471 | 2.40 | 3.40 | 416.7 | 28191303 | PASS |
| engineering | 500 | 57.3 | 4027004 | 1.30 | 10.70 | 769.2 | 8825211 | PASS |
| photoreal-night | normal | 153.0 | 1812619 | 3.00 | 4.90 | 333.3 | 28191303 | PASS |

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
| equipment | 28.0 | 14.0 |
| pipes | 4.0 | 2.0 |
| lamps | 4.0 | 1.0 |
| ground | 28.0 | 9.0 |
| helpers | 21.0 | 0.0 |

Post passes: 17.0.

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

## photoreal-night / normal submissions

Display: 144 Hz; AC: true; laptop only: false; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: not measured. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 28.0 | 28.0 |
| pipes | 4.0 | 4.0 |
| lamps | 6.0 | 2.0 |
| ground | 28.0 | 15.0 |
| helpers | 21.0 | 0.0 |

Post passes: 17.0.
