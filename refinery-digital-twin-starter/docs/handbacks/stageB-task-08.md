# Stage B Task 08 — HUD refinement and presentation

25 September 2026. Branch `dual-look`. Implementation and internal verification complete; submitted for both external approvals. Stop at this gate for both reviewers. The approved engineering screenshot baseline remains unchanged; candidate captures are separate.

## Tasks since the Task 6 direction approval

- Task 06 correction — distributed night illumination, cabin windows, red aviation lights and non-shadow warm pools, all budgets and engineering regression pass: `3d2c575`.
- Task 05b — sphere-tank shell smoothing only, all builder checks, budgets and engineering regression pass: `8729348`.
- Task 07 — skipped by Mostafa; dressing unchanged and density deferred to Stage C. No commit for a skipped task.

## Result

Engineering selection uses cyan surfaces and a restrained amber rim. Photoreal selection retains the material texture with a cyan rim. Proxy selection uses the same inexpensive rim technique. Label sprites retain a readable screen size across camera distances. No extra scene pass or geometry copy is introduced for selection.

One shared EquipmentCard component renders identical normalized equipment and synthetic telemetry in both looks: glass/cyan/amber in engineering and a neutral panel in photoreal. Canonical data and scenario files are unchanged.

The Follow the process tour reads separate `data/presentation/tours.json`: seven crude-path equipment stops over 42 seconds, timed camera_move actions with from/to/duration/easing and matching caption actions. Optional Reveal photoreal changes look midway. Camera motion runs in the existing controls owner, not a second competing controller. End presentation, Escape and canvas navigation interrupt; explicit directory, card, operations and reset actions also return control before acting.

After 60 seconds without input, attract mode travels through the original five approved cameras with slow 20-second moves and alternates engineering and photoreal. Pointer, wheel, keyboard, touch or focus input exits attract mode. Backgrounding the page ends presentation and resets idle timing. No scan animation was added, keeping the HUD calm.

## Evidence and acceptance

The full 42-second tour passes in engineering and photoreal, with all seven asset tags and matching captions asserted. Both preserve the starting look unless reveal is enabled. The optional reveal switches to photoreal at 18 seconds. Reset and manual directory selection interrupt correctly and retain user control. The real 60-second idle wait, five attract legs alternating looks, and pointer exit all pass. No application/shader errors were recorded.

Candidate captures cover all six cameras, default and selected, in engineering, day and night. Engineering candidate metadata explicitly marks it unapproved. The shared card values match across looks. Larger screen-size labels were inspected after the initial candidate proved too small.

Recordings include the full viewport/HUD: tour.mp4 (113.60 seconds, both tours, reveal and interruption checks) and attract.mp4 (103.48 seconds, the initial idle wait trimmed for review). Both are H.264, 1600 × 900 at 25 fps; ffprobe metadata is retained. These are evidence only and are not shipped runtime assets. The original real-time 60-second trigger was exercised, not shortened.

All 228 actual canvas picks and cards pass: 57 assets × two looks × two geometry modes. Ten repeated engineering/night switches in each geometry mode preserve cards, cameras, data layers, process and scenario playback. No GLB reload occurs; warmed geometry counts remain 56 in Blender and 328 in proxy mode. Final valid metrics PASS for every workload. See the table below.

Task 8 intentionally changes the HUD/selection. Candidate screenshots are offered for the new engineering baseline required by this task; the previous baseline is not overwritten or described as newly approved. After both external approvals, promote the engineering candidate through the agreed baseline step. Task 9 is not started.

## Files touched

`app/src/{Atmosphere.tsx,Scene.tsx,equipmentBatches.ts,main.tsx,style.css,EquipmentCard.tsx,presentation.ts,presentation.test.ts}`; `data/presentation/tours.json`; `scripts/visual-common.mjs` (optional full-viewport evidence recording); `tests/visual/presentation-check.mjs`; Task 08 evidence/metrics/handback and REPO_FACTS. No new runtime dependencies or art assets. Playwright's FFmpeg recording helper was installed locally for evidence capture.

## Known limits

The same procedural terrain and plant density remain; this task does not claim to close the reference-density gap. Attract motion follows the original five camera compositions; CAM-6 remains the photoreal judgment frame and is included in captures. The tour is a guided synthetic process explanation, not an engineering operating procedure.

[Review gallery and recordings](evidence/stageB-task-08/review.html).

## Checks and internal review

Check suite passes: 31 pytest, six visual-tool tests, lint, validation and production build. Final targeted Vitest run passes all 21 tests after adding timeline/reference coverage. All 32 locked canonical files remain unchanged. No baseline files were modified.

Both internal reviewers passed the implementation and completed browser evidence after correction. Their shared finding was manual navigation competing with tour camera ownership; stopping the tour in the capture phase of explicit controls resolved it and the browser tests verify Reset and directory selection. Caption assertions were added so the evidence checks both asset and explanatory text correspondence.

Videos use the reference screenshot browser/flags and full viewport recording; capture-helper CSS transitions are disabled. They demonstrate camera travel and interaction, not frame-time performance. Metrics run separately with the approved uncapping flags. Review PNGs preserve the exact capture resolution independently of video encoding.

## Final budgets

| Workload | Median ms | p95 ms | Mean draw calls | Result |
|---|---:|---:|---:|---|
| Engineering | 1.30 | 2.10 | 47.0 | PASS |
| Photoreal day | 2.50 | 3.60 | 128.0 | PASS |
| Photoreal night | 3.60 | 5.10 | 153.0 | PASS |
| Engineering, 500 assets | 1.30 | 10.30 | 57.3 | PASS |

Initial engineering transfer: 8,834,446 bytes, below 13,200,115. Lazy photoreal assets unchanged at 21,417,040 bytes, below 40,000,000. No added runtime assets. Both 144 Hz displays, AC and Performance plan recorded in each valid measurement. Metrics ran alone after verification browsers and video encoding exited. Night meets the stricter day limits as in prior tasks.

## Gate request

Mostafa: judge the HUD, label/card readability, tour and attract feel, including the engineering candidate baseline. Claude: review implementation and evidence. Both approvals are required before replacing the engineering baseline or proceeding beyond this gate. Task 9 and main are untouched.

## Pasted check and metric evidence

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


 Test Files  8 passed (8)
      Tests  20 passed (20)
   Start at  04:39:11
   Duration  1.68s (transform 1.36s, setup 0ms, import 4.94s, tests 475ms, environment 2ms)

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

============================= 31 passed in 3.44s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 2.6864
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 8.3006
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 595.5277
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 1.7742
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 1.3305
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.4149
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
# duration_ms 747.7158

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
✓ 280 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-BM2E-Etq.css     12.63 kB │ gzip:   3.65 kB
dist/assets/index-BpOzTPHw.js   1,473.68 kB │ gzip: 425.75 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 5.96s

```

### final-checks.log

```text
Final label/control revision: TypeScript and production build PASS.
Final ESLint and Ruff PASS.
Final Vitest: 8 files, 21 tests PASS.
Canonical data unchanged (32 files).

```

### visual-tools-final.log

```text

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 4.3402
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 10.4904
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 664.1602
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 4.2776
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 1.7283
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.3079
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
# duration_ms 843.023

```

# Task 08 rerun

| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 47.0 | 492956 | 1.30 | 2.10 | 769.2 | 8834446 | PASS |
| photoreal | normal | 128.0 | 1456471 | 2.50 | 3.60 | 400.0 | 28200538 | PASS |
| engineering | 500 | 57.3 | 4027048 | 1.30 | 10.30 | 769.2 | 8834446 | PASS |
| photoreal-night | normal | 153.0 | 1812619 | 3.60 | 5.10 | 277.8 | 28200538 | PASS |

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
