# Stage B Task 01 — One plant, two looks

## Summary

The top links now switch Engineering and Photoreal appearances over one persistent whole-plant scene. Camera, selection, operating state, process paths, data layers and scenarios stay shared; changing appearance does not reload the GLB or replace plant geometry. Look values are centralized, imported material sets are cached by mesh UUID, and returning to Engineering restores its materials and reapplies operating effects. Photoreal is the specified placeholder: plain sky, sand-colored ground and one active directional light with shadows. The separate preheat study is preserved under `reference/photoreal-study/`, with its original files unchanged. Task 1 is ready for the external gate after publication verification; Task 2 has not started.

Stage A Task 08 and Stage B Task 0 are approved. Task 0 `/next/` publication was verified before this task began; closure and approved budgets were recorded in `ac3345d`. No non-gate task has been completed since that gate.

## Files touched

Paths below are relative to the project. Scene components, look data/provider, top links, archive retirement and tests are Task 1 scope. Evidence/hand-back documents are required by the plan. Exactly two additional files are declared: `package.json` maps the current-look metrics and browser-test commands, and `ASSETS.md` updates the archived files' paths. No plan-level decision changed.

- `app/src/looks/LookProvider.tsx`
- `app/src/looks/LookSnapshot.tsx`
- `app/src/looks/looks.test.ts`
- `app/src/looks/looks.ts`
- `app/src/looks/materials.ts`
- `docs/handbacks/evidence/stageB-task-01/CAM-1-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-1-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-1-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-1-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-2-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-2-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-2-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-2-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-3-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-3-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-3-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-3-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-4-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-4-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-4-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-4-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-5-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-5-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-5-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-01/CAM-5-selected.png`
- `docs/handbacks/evidence/stageB-task-01/data-verify.log`
- `docs/handbacks/evidence/stageB-task-01/engineering-comparison.json`
- `docs/handbacks/evidence/stageB-task-01/generators.log`
- `docs/handbacks/evidence/stageB-task-01/look-flow.json`
- `docs/handbacks/evidence/stageB-task-01/look-flow.log`
- `docs/handbacks/evidence/stageB-task-01/metrics.log`
- `docs/handbacks/evidence/stageB-task-01/production-test.log`
- `docs/handbacks/evidence/stageB-task-01/project-check.log`
- `docs/handbacks/evidence/stageB-task-01/visual-check.log`
- `docs/metrics/stageB-task-01.json`
- `docs/metrics/stageB-task-01.md`
- `reference/photoreal-study/PhotorealPreview.tsx`
- `reference/photoreal-study/README.md`
- `reference/photoreal-study/manifest.json`
- `reference/photoreal-study/module.glb`
- `reference/photoreal-study/preview.css`
- `reference/photoreal-study/render.png`
- `tests/visual/look-common.mjs`
- `tests/visual/look-flow.mjs`
- `tests/visual/look-metrics.mjs`
- `ASSETS.md`
- `app/src/Atmosphere.tsx`
- `app/src/PhotorealPreview.tsx`
- `app/src/Scene.tsx`
- `app/src/main.tsx`
- `data/normalized/preview/manifest.json`
- `data/normalized/preview/module.glb`
- `data/normalized/preview/render.png`
- `package.json`
- `tests/production.test.mjs`
- `tests/test_glb.py`
- `docs/handbacks/stageB-task-01.md`: this hand-back.

Deleted original study paths are moves to the archive, not removal of the assets. The original scene, stylesheet, manifest, GLB and PNG match their pre-task Git blobs exactly. Presets live under `app/src/looks/`, the app-configuration option allowed by the presentation ruling; they are outside canonical plant truth. Future tour/caption files remain assigned to `data/presentation/`.

## New dependencies

None. Existing React/Three.js and Task 0 testing dependencies are used.

## New assets

None. No external model, HDRI, texture or image was downloaded. Original study assets were moved intact and their register paths updated. Photoreal placeholder values are configuration, not imported art.

## Tests

Commands run on Windows with the Task 0 browser, RTX 3050, flags and 1600 × 900 / DPR 1 protocol. All final commands below exited successfully. The browser check covers both looks with both Blender GLB and primitive proxies, including actual scenario playback in Photoreal and preserved advanced values after returning to Engineering.

### data-verify.log

```text
> refinery-digital-twin@0.0.0 data:verify
> node scripts/data-verify.mjs

Canonical data unchanged (32 files).
```

### generators.log

```text
> refinery-digital-twin@0.0.0 check:generators
> node scripts/python.mjs -m scripts.check_generators

00:00.094  reports          | WARNING Unable to open 'C:\Users\Mosta\AppData\Roaming\Blender Foundation\Blender\5.2\config\userpref.blend': Permission denied
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)
Extensions: writing cache failed ([WinError 183] Cannot create a file when that file already exists: 'C:\\Users\\Mosta\\AppData\\Roaming\\Blender Foundation\\Blender\\5.2\\extensions\\.cache').
Checked 22 silhouettes at 2 detail levels

Blender quit
```

### look-flow.log

```text
> refinery-digital-twin@0.0.0 test:looks
> node tests/visual/look-flow.mjs

{
  "hardware": {
    "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "look": "engineering",
    "interactiveAt": 1464.9000000953674,
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
      "initialGeometryCount": 441,
      "finalGeometryCount": 441,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 429,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 441,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 429,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 441,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 429,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 441,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 429,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 441,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 429,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 441,
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
      "initialGeometryCount": 724,
      "finalGeometryCount": 724,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 712,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 724,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 712,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 724,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 712,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 724,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 712,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 724,
          "textures": 17
        },
        {
          "look": "photoreal",
          "geometries": 712,
          "textures": 15
        },
        {
          "look": "engineering",
          "geometries": 724,
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

### metrics.log

```text
> refinery-digital-twin@0.0.0 metrics
> node tests/visual/look-metrics.mjs

# Stage B Task 1 metrics

Task 1 whole-plant photoreal placeholder uses shared plant geometry and procedural colors only: no additional downloadable photoreal assets (0 bytes). Archived study is not served. Task 0 baseline is retained separately. Budgets apply from Task 2.

| Look | Draw calls | Triangles | Median FPS | p95 ms | Geometries | Textures | Initial bytes |
|---|---:|---:|---:|---:|---:|---:|---:|
| engineering | 611.9 | 468082 | 140.8 | 10.90 | 443 | 16 | 12203738 |
| photoreal | 610.9 | 468082 | 144.9 | 8.30 | 430 | 14 | 12203738 |
```

### production-test.log

```text
> refinery-digital-twin@0.0.0 test:production
> node --test tests/production.test.mjs

TAP version 13
# Subtest: production server serves the complete build with correct types and real missing-file errors
ok 1 - production server serves the complete build with correct types and real missing-file errors
  ---
  duration_ms: 319.2197
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
# duration_ms 462.8842
```

### project-check.log

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


 Test Files  6 passed (6)
      Tests  17 passed (17)
   Start at  18:53:50
   Duration  1.34s (transform 651ms, setup 0ms, import 2.90s, tests 319ms, environment 1ms)

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

============================= 18 passed in 3.53s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 2.0228
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 2 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 666.2256
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
# duration_ms 845.5657

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
✓ 258 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DupH9ZgS.css     10.54 kB │ gzip:   3.12 kB
dist/assets/index-BHnt4lel.js   1,322.13 kB │ gzip: 371.73 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 4.90s
```

### visual-check.log

```text
> refinery-digital-twin@0.0.0 visual:check
> node scripts/visual-check.mjs

CAM-1-default.png: 0.2585% differing pixels (PASS)
CAM-1-selected.png: 0.2585% differing pixels (PASS)
CAM-2-default.png: 0.3098% differing pixels (PASS)
CAM-2-selected.png: 0.3098% differing pixels (PASS)
CAM-3-default.png: 0.2585% differing pixels (PASS)
CAM-3-selected.png: 0.2585% differing pixels (PASS)
CAM-4-default.png: 0.2541% differing pixels (PASS)
CAM-4-selected.png: 0.2539% differing pixels (PASS)
CAM-5-default.png: 0.2585% differing pixels (PASS)
CAM-5-selected.png: 0.2585% differing pixels (PASS)
```

## Metrics

Same three-second warm-up and ten-second CAM-1 orbit as Task 0, native performance clock, cold browser context per look. Task 0's original baseline files were not overwritten.

| Metric | Task 0 engineering | Task 1 engineering | Task 1 photoreal placeholder |
|---|---:|---:|---:|
| Draw calls, mean | 611.9 | 611.9 | 610.9 |
| Triangles, mean | 468,082 | 468,082 | 468,082 |
| FPS median | 133.3 | 140.8 | 144.9 |
| Frame time p95 | 12.10 ms | 10.90 ms | 8.30 ms |
| Geometries | 443 | 443 | 430 |
| Textures | 16 | 16 | 14 |
| Initial transferred bytes | 12,200,115 | 12,203,738 | 12,203,738 |
| Additional lazy photoreal asset bytes | n/a | n/a | 0 |

No material engineering performance regression was observed in this run. Initial transfer increased by 3,623 bytes, well below the approved future baseline-plus-1-MB allowance. The current draw-call counts exceed the approved Task 2 limits (150 engineering / 200 photoreal); Task 1 is explicitly not gated on those limits. No Task 2 optimization or 500-asset stress implementation was attempted.

The selection/switch test reports stable per-look counts across ten switches: Blender engineering 441 geometries on each return (photoreal 429), proxy engineering 724 on each return (photoreal 712). These selected static-view counts differ from the active-orbit metric counts. The look-specific environment changes resource totals; plant mesh and geometry UUIDs remain identical, textures do not accumulate, and GLB requests during switches are zero.

## Screenshots

All five approved cameras, no selection and fixed T-201 selection, for both looks. The original engineering baseline remains intact. Photoreal was inspected as a placeholder only; it is not a claim to meet the later reference-level visual target.

![CAM-1-default.png](evidence/stageB-task-01/CAM-1-default.png)

![CAM-1-selected.png](evidence/stageB-task-01/CAM-1-selected.png)

![CAM-1-photoreal-default.png](evidence/stageB-task-01/CAM-1-photoreal-default.png)

![CAM-1-photoreal-selected.png](evidence/stageB-task-01/CAM-1-photoreal-selected.png)

![CAM-2-default.png](evidence/stageB-task-01/CAM-2-default.png)

![CAM-2-selected.png](evidence/stageB-task-01/CAM-2-selected.png)

![CAM-2-photoreal-default.png](evidence/stageB-task-01/CAM-2-photoreal-default.png)

![CAM-2-photoreal-selected.png](evidence/stageB-task-01/CAM-2-photoreal-selected.png)

![CAM-3-default.png](evidence/stageB-task-01/CAM-3-default.png)

![CAM-3-selected.png](evidence/stageB-task-01/CAM-3-selected.png)

![CAM-3-photoreal-default.png](evidence/stageB-task-01/CAM-3-photoreal-default.png)

![CAM-3-photoreal-selected.png](evidence/stageB-task-01/CAM-3-photoreal-selected.png)

![CAM-4-default.png](evidence/stageB-task-01/CAM-4-default.png)

![CAM-4-selected.png](evidence/stageB-task-01/CAM-4-selected.png)

![CAM-4-photoreal-default.png](evidence/stageB-task-01/CAM-4-photoreal-default.png)

![CAM-4-photoreal-selected.png](evidence/stageB-task-01/CAM-4-photoreal-selected.png)

![CAM-5-default.png](evidence/stageB-task-01/CAM-5-default.png)

![CAM-5-selected.png](evidence/stageB-task-01/CAM-5-selected.png)

![CAM-5-photoreal-default.png](evidence/stageB-task-01/CAM-5-photoreal-default.png)

![CAM-5-photoreal-selected.png](evidence/stageB-task-01/CAM-5-photoreal-selected.png)

## Visual regression result

All captures pass the approved ≤0.5% threshold. The prescribed top-link names changed; the comparison still includes the full UI and no pixels are masked.

| Capture | Differing pixels | Result |
|---|---:|---|
| CAM-1-default.png | 0.2585% | PASS |
| CAM-1-selected.png | 0.2585% | PASS |
| CAM-2-default.png | 0.3098% | PASS |
| CAM-2-selected.png | 0.3098% | PASS |
| CAM-3-default.png | 0.2585% | PASS |
| CAM-3-selected.png | 0.2585% | PASS |
| CAM-4-default.png | 0.2541% | PASS |
| CAM-4-selected.png | 0.2539% | PASS |
| CAM-5-default.png | 0.2585% | PASS |
| CAM-5-selected.png | 0.2585% | PASS |

## Canonical data check

```text
Canonical data unchanged (32 files).
```

57 assets / six units before and after. The archived preview GLB, still and manifest are generated outputs excluded from canonical hashing. No source JSON, normalized plant record, schema or catalog change was made.

## Known issues

- Photoreal is intentionally a plain placeholder. Single-source lighting produces dark back-facing surfaces, especially at CAM-5. Environment, real surface materials and atmosphere are later tasks; no visual refinement was smuggled into this gate.
- Existing HUD text still says “Engineering. In perspective.” in the no-selection caption, including Photoreal. HUD refinement is out of scope except the prescribed top-link switch and fade.
- The archive retains historical import/URL paths and is reference material, not a runnable second app. The legacy preview generator still writes its old output directory if explicitly run; it does not reconnect that study to the top links. Do not run the old `scripts/metrics.mjs` baseline recorder for current looks; `npm run metrics` now uses the current-look tool and preserves Task 0 data.
- Browser metrics are a fixed short active workload on the reference laptop, not a long-run thermal benchmark. Resource counts are not VRAM measurements.
- The existing Vite large-chunk warning and Blender user-preference/cache warnings remain non-fatal. Draw-call reduction and 500-asset stress testing belong to Task 2.
- The unrelated untracked sibling `real-estate-poc/` remains untouched.

## Internal review and gate

Specification reviewer: PASS, including final local evidence. Code-quality reviewer: PASS, including enhanced scenario playback. No reviewer disagreement or unresolved local blocker.

External approval by Claude and Mostafa is required at this Task 1 gate. Stop here; Task 2 is not started. Final budgets are in `docs/APPROVED_BUDGETS.md` and first apply to Task 2.

## Commit and publication

Pending Task 1 commit and branch publication verification. A follow-up evidence commit will record the implementation hash and successful `/next/` check. No main merge or main push.
