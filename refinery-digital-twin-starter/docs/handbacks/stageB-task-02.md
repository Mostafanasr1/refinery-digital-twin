# Stage B Task 02 — Rendering budget

## Summary

Equipment is merged by original material, retaining triangle ranges for canonical asset picking. Site elements are instanced and pipes merged, reducing Engineering draw calls from about 612 to 32. Scripted lossless Meshopt compression reduces the GLB from 10,786,508 to 7,159,504 bytes. The hidden `?stress=500` mode instances eight full source-linked plants plus 44 assets. Both internal reviewers pass after correcting registry cleanup ownership; this non-gate task continues to Task 3.

## Files touched

Scene rendering/loading, compression build scripts and tests are Task 2 scope. Package manifests declare its development tools; evidence documents are required by the plan. No canonical or plan-level decisions changed.

- `refinery-digital-twin-starter/app/src/Atmosphere.tsx`
- `refinery-digital-twin-starter/app/src/BudgetProfiler.tsx`
- `refinery-digital-twin-starter/app/src/Scene.tsx`
- `refinery-digital-twin-starter/app/src/equipmentBatches.test.ts`
- `refinery-digital-twin-starter/app/src/equipmentBatches.ts`
- `refinery-digital-twin-starter/app/src/looks/LookSnapshot.tsx`
- `refinery-digital-twin-starter/data/normalized/models/refinery.glb`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-1-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-1-photoreal-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-1-photoreal-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-1-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-2-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-2-photoreal-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-2-photoreal-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-2-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-3-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-3-photoreal-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-3-photoreal-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-3-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-4-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-4-photoreal-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-4-photoreal-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-4-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-5-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-5-photoreal-default.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-5-photoreal-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/CAM-5-selected.png`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/before-metrics.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/build-models.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/check.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/data-verify.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/engineering-comparison.json`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/generators.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/look-flow.json`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/look-flow.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/metrics.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/model-optimization.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/production.log`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/selection-all.json`
- `refinery-digital-twin-starter/docs/handbacks/evidence/stageB-task-02/visual.log`
- `refinery-digital-twin-starter/docs/handbacks/stageB-task-02.md`
- `refinery-digital-twin-starter/docs/metrics/stageB-task-02-after.json`
- `refinery-digital-twin-starter/docs/metrics/stageB-task-02-after.md`
- `refinery-digital-twin-starter/docs/metrics/stageB-task-02-before.json`
- `refinery-digital-twin-starter/docs/metrics/stageB-task-02-before.md`
- `refinery-digital-twin-starter/package-lock.json`
- `refinery-digital-twin-starter/package.json`
- `refinery-digital-twin-starter/scripts/build_models.py`
- `refinery-digital-twin-starter/scripts/optimize-models.mjs`
- `refinery-digital-twin-starter/tests/visual/budget-metrics.mjs`
- `refinery-digital-twin-starter/tests/visual/look-common.mjs`
- `refinery-digital-twin-starter/tests/visual/look-flow.mjs`
- `refinery-digital-twin-starter/tests/visual/selection-all.mjs`

## New dependencies

Development dependencies, all MIT: `@gltf-transform/core` 4.5.0 (GLB I/O), `@gltf-transform/extensions` 4.5.0 (Meshopt extension), `meshoptimizer` 0.25.0 (encoder/validation decoder). Runtime uses the decoder bundled in existing Three.js; no new runtime package.

## New assets

None. The existing project-generated plant GLB is compressed. Decoded vertex attributes are byte-identical; topology, winding, hierarchy and materials are validated before replacement. ASSETS.md retains original Stage A sizes; the optimized size is above. No third-party art introduced.

## Tests

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
      Tests  18 passed (18)
   Start at  19:49:43
   Duration  1.34s (transform 842ms, setup 0ms, import 3.14s, tests 346ms, environment 1ms)

============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.4.2, pluggy-1.6.0
rootdir: C:\Users\Mosta\OneDrive\Documents\ChatGPT\Oil and Gas\refinery-digital-twin-starter
configfile: pyproject.toml
testpaths: tests
collected 18 items

tests\test_catalog.py ..                                                 [ 11%]
tests\test_glb.py ..                                                     [ 22%]
tests\test_normalization.py ........                                     [ 66%]
tests\test_validation.py ......                                          [100%]

============================= 18 passed in 2.96s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 1.7622
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 2 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 625.8311
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 772.1516

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
✓ 260 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DupH9ZgS.css     10.54 kB │ gzip:   3.12 kB
dist/assets/index-BvWHW-m3.js   1,354.38 kB │ gzip: 381.73 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 6.81s

```

### generators.log

```text

> refinery-digital-twin@0.0.0 check:generators
> node scripts/python.mjs -m scripts.check_generators

Checked 22 silhouettes at 2 detail levels
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)

Blender quit

```

### build-models.log

```text

> refinery-digital-twin@0.0.0 build:models
> node scripts/python.mjs -m scripts.build_models

01:02.891  reports          | WARNING Path 'D:\blender\5.2\datafiles\assets\brushes\essentials_brushes-gp_draw.blend' cannot be made relative for Material 'Dots Stroke'
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)
01:02.891  reports          | WARNING Path 'D:\blender\5.2\datafiles\assets\brushes\essentials_brushes-gp_draw.blend' cannot be made relative for Material 'Material'
Info: Saved as "refinery.blend"
INFO Draco is available, use library at D:\blender\5.2\scripts\addons_core\io_scene_gltf2\bf_intern_draco_bridge.dll
INFO MeshOptimizer is available, use library at D:\blender\5.2\scripts\addons_core\io_scene_gltf2\bf_intern_meshopt_bridge.dll
19:47:31 | INFO: Starting glTF 2.0 export
19:47:31 | INFO: Extracting primitive: P-101A_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-101B_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: TK-101_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-102_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-103_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: E-201_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-202_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-203_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-204_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-205_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-206_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: E-207_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: F-201_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-201_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-202_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-203_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-204_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: PR-001_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-002_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-003_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-004_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-005_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-006_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: PR-007_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: T-201_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: V-202_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: V-203_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: C-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: EA-501_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: F-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: R-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: V-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: B-401_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: B-402_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: CR-401_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: CT-401_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: CT-402_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: CT-403_mesh
19:47:31 | INFO: Primitives created: 2
19:47:31 | INFO: Extracting primitive: CT-404_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: FL-401_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-401_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: SS-401_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: STK-401_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: V-401_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: V-402_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: BT-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: BT-502_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: SP-501_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: SP-502_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: P-301_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: P-302_mesh
19:47:31 | INFO: Primitives created: 3
19:47:31 | INFO: Extracting primitive: T-302_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-301_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-302_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-303_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: TK-304_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: V-301_mesh
19:47:31 | INFO: Primitives created: 4
19:47:31 | INFO: Extracting primitive: conn_001_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_001_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_001_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_001_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_001_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_002_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_002_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_002_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_002_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_002_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_003_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_003_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_003_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_003_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_003_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_004_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_004_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_004_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_004_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_004_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_005_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_005_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_005_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_005_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_005_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_006_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_006_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_006_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_006_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_006_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_007_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_007_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_007_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_007_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_007_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_008_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_008_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_008_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_008_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_008_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_009_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_009_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_009_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_009_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_009_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_010_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_010_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_010_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_010_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_010_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_011_0_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_011_1_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_011_2_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_011_3_mesh
19:47:31 | INFO: Primitives created: 1
19:47:31 | INFO: Extracting primitive: conn_011_4_mesh
19:47:31 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_012_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_012_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_012_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_012_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_012_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_013_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_013_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_013_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_013_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_013_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_014_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_014_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_014_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_014_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_014_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_015_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_015_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_015_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_015_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_015_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_016_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_016_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_016_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_016_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_016_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_017_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_017_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_017_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_017_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_017_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_018_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_018_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_018_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_018_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_018_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_019_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_019_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_019_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_019_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_019_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_020_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_020_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_020_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_020_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_020_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_021_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_021_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_021_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_021_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_021_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_022_0_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_022_1_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_022_2_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_022_3_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Extracting primitive: conn_022_4_mesh
19:47:32 | INFO: Primitives created: 1
19:47:32 | INFO: Finished glTF 2.0 export in 0.9961442947387695 s

{"assets": 57, "detail": 1, "mesh_objects": 167, "triangles": 253844}

Blender quit
{
  "file": "data/normalized/models/refinery.glb",
  "inputBytes": 10786508,
  "outputBytes": 7159504,
  "compression": "EXT_meshopt_compression",
  "decodedVertexAttributes": "byte-identical",
  "triangleTopology": "same faces and winding; cyclic corner rotations allowed",
  "assetHierarchyAndMaterials": "unchanged"
}

```

### production.log

```text

> refinery-digital-twin@0.0.0 test:production
> node --test tests/production.test.mjs

TAP version 13
# Subtest: production server serves the complete build with correct types and real missing-file errors
ok 1 - production server serves the complete build with correct types and real missing-file errors
  ---
  duration_ms: 226.9524
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 375.3626

```

### look-flow.log

```text

> refinery-digital-twin@0.0.0 test:looks
> node tests/visual/look-flow.mjs

{
  "hardware": {
    "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "look": "engineering",
    "interactiveAt": 1628.6999999284744,
    "dpr": 1,
    "browser": "146.0.7680.153",
    "flags": [
      "--enable-gpu",
      "--force_high_performance_gpu",
      "--use-angle=d3d11",
      "--force-color-profile=srgb",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows"
    ],
    "viewport": {
      "width": 1600,
      "height": 900
    }
  },
  "results": [
    {
      "geometry": "blender",
      "initialGeometryCount": 28,
      "finalGeometryCount": 28,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 16,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 28,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 16,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 28,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 16,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 28,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 16,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 28,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 16,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 28,
          "textures": 17
        }
      ],
      "lookSwitches": 10,
      "glbRequestsDuringSwitches": 0,
      "selection": "PASS",
      "layers": "PASS",
      "process": "PASS",
      "scenario": "PASS",
      "camera": "PASS"
    },
    {
      "geometry": "proxy",
      "initialGeometryCount": 307,
      "finalGeometryCount": 307,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 295,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 307,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 295,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 307,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 295,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 307,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 295,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 307,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 295,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 307,
          "textures": 17
        }
      ],
      "lookSwitches": 10,
      "glbRequestsDuringSwitches": 0,
      "selection": "PASS",
      "layers": "PASS",
      "process": "PASS",
      "scenario": "PASS",
      "camera": "PASS"
    }
  ],
  "directPhotorealUrl": "PASS",
  "screenshotCount": 10,
  "errors": []
}

```

Actual canvas picks and cards: 57/57 each for Engineering/Blender, Engineering/proxy, Photoreal/Blender and Photoreal/proxy: **228/228 PASS**, recorded in selection-all.json. Both geometry switch directions retain all 57 registry bindings before other interactions. Internal spec and quality reviewers pass; both agreed on and verified the ownership cleanup correction.

## Metrics

# Task 2 before

| Look | Stress assets | Draw calls | Triangles | FPS median | p95 ms | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 611.9 | 468082 | 144.9 | 8.10 | 12201324 | baseline |

## engineering / normal submissions

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 182.0 | 168.0 |
| pipes | 110.0 | 0.0 |
| lamps | 39.9 | 0.0 |
| ground | 97.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

# Task 2 after

| Look | Stress assets | Draw calls | Triangles | FPS median | p95 ms | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 32.0 | 479196 | 144.9 | 7.30 | 8608978 | PASS |
| photoreal | normal | 31.0 | 479196 | 144.9 | 7.20 | 8608978 | PASS |
| engineering | 500 | 35.8 | 3917838 | 144.9 | 7.60 | 8608978 | PASS |

## engineering / normal submissions

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 4.0 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

## photoreal / normal submissions

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 4.0 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 1.0 | 0.0 |

Post passes: 13.0.

## engineering / 500 submissions

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 7.8 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

Photoreal-specific lazy assets: 0 bytes. Approved initial-byte cap remains 13,200,115. Raw samples, hardware and resource counts are in metric JSON files.

## Screenshots

- `docs/handbacks/evidence/stageB-task-02/CAM-1-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-1-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-1-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-1-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-2-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-2-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-2-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-2-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-3-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-3-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-3-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-3-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-4-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-4-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-4-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-4-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-5-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-5-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-5-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-02/CAM-5-selected.png`

## Visual regression result

```text

> refinery-digital-twin@0.0.0 visual:check
> node scripts/visual-check.mjs

CAM-1-default.png: 0.2822% differing pixels (PASS)
CAM-1-selected.png: 0.2801% differing pixels (PASS)
CAM-2-default.png: 0.3147% differing pixels (PASS)
CAM-2-selected.png: 0.3135% differing pixels (PASS)
CAM-3-default.png: 0.2610% differing pixels (PASS)
CAM-3-selected.png: 0.2603% differing pixels (PASS)
CAM-4-default.png: 0.2649% differing pixels (PASS)
CAM-4-selected.png: 0.2644% differing pixels (PASS)
CAM-5-default.png: 0.2644% differing pixels (PASS)
CAM-5-selected.png: 0.2629% differing pixels (PASS)

```

## Canonical data check

```text

> refinery-digital-twin@0.0.0 data:verify
> node scripts/data-verify.mjs

Canonical data unchanged (32 files).

```

## Known issues

- Normal equipment is merged by material, not deduplicated per type. Stress copies instance the batches and retain source IDs plus distinct instance IDs.
- Budgets measure default Blender geometry; proxy picking and shared behavior are tested separately.
- Existing Vite large-chunk advisory and Blender cache warning are non-fatal.
- Resource counts are not GPU memory. Photoreal is still the Task 1 placeholder.

## Commit hash

Implementation and evidence: `a1ddba3`. This completion document is committed separately.
