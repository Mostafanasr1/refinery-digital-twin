# Stage B Task 03 — Environment gate

## Correction and approved rerun — 24 September 2026

The original blocked submission below is retained as history. Mostafa approved the site as ground, sky and sun, requested the terrain correction and CAM-6, and authorized continuation into Task 4 once the rerun passed and the correction was captured at CAM-6. Software approval was conditional on those same corrections. The more-than-10% interpretation of "well above" refresh was explicitly approved before this rerun.

### Summary

Added procedural macro sand tint, up to 900 instanced rocks and 650 dry scrub clumps thinning away from the plant, and a dirt track from the gate. Added the approved CAM-6 low wide view with both-look captures and benchmark comparison, leaving CAM-1 through CAM-5 and their engineering baseline unchanged. Measurement tooling now records monitor topology, refresh rate, AC and power plan, and separates invalid runs from budget failures. The approved laptop-only rerun passes all three workloads; the historical invalid setup and 59.9 FPS measurements remain preserved. These results satisfy the user's stated continuation conditions; this is not a claim of final reference-level visual acceptance, which belongs to Task 6.

### Correction files touched

- `ASSETS.md`: procedural correction provenance, no new external assets.
- `app/src/PhotorealEnvironment.tsx`: macro tint, instanced scatter, dirt track, resource disposal.
- `app/src/looks/looks.ts`: presentation settings for scatter, tint and track.
- `docs/APPROVED_BUDGETS.md`: measurement-validity ruling and explicit cutoff approval.
- `scripts/display-state.ps1`: Windows display and power inspection.
- `scripts/measurement-validity.mjs`: setup and refresh-cap validity checks.
- `scripts/visual-check.mjs`, `scripts/visual-config.mjs`: preserve original regression set; CAM-6 capture-only.
- `tests/visual/cameras.json`: approved sixth camera.
- `tests/visual/config.test.mjs`, `tests/visual/measurement-validity.test.mjs`: camera and validity checks.
- `tests/visual/environment-comparison.mjs`: CAM-6 comparison alongside CAM-1.
- `tests/visual/environment-metrics.mjs`: per-workload setup recording, prior-run comparison, separate rerun outputs.
- `docs/metrics/stageB-task-03-invalid-setup.json`: historical rejected two-display setup.
- `docs/metrics/stageB-task-03-rerun.json` and `.md`: approved valid rerun, raw samples and summary.
- `docs/handbacks/evidence/stageB-task-03/`: updated CAM-1 to CAM-5 photoreal defaults and CAM-1 comparison; CAM-6 both-look images and comparison; correction check, visual, comparison, environment-flow and metrics logs; historical display-power inspection; approved-rerun metrics and canonical-check logs.
- `docs/handbacks/stageB-task-03.md`: this closure and original submission history.

The camera and measurement changes are explicitly authorized corrections. No canonical content or budget threshold changed. No new dependency or downloaded art asset was introduced. Procedural additions do not increase the registered environment asset package: 9,804,474 bytes against 40,000,000 allowed.

### Approved rerun

Command: `node tests/visual/environment-metrics.mjs` with the reference `VISUAL_BROWSER_PATH` from `docs/REPO_FACTS.md`. Exit 0. Same browser, GPU, viewport, warm-up and orbit protocol as before. Every workload records AC connected, Performance power plan and one internal 1920 x 1080 display at 144 Hz. No external display is active. Windows WMI inspection required execution outside the sandbox after its read was denied; no Windows settings were changed.

| Look | Stress assets | Draw calls | Triangles | FPS median | Frame p95 ms | Initial bytes | Validity | Budget |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Engineering | normal | 32.0 | 479196 | 144.9 | 7.40 | 8623896 | VALID | PASS |
| Photoreal | normal | 47.0 | 745510 | 144.9 | 7.50 | 16627881 | VALID | PASS |
| Engineering | 500 | 35.8 | 3917838 | 142.9 | 7.50 | 8623896 | VALID | PASS |

Engineering first-load bytes remain below 13,200,115. Direct Photoreal navigation includes environment requests; its initial-byte figure is not subject to the Engineering initial-load threshold. The full registered lazy package remains within its independent limit. Timing results near 144 Hz demonstrate compliance on this setup, not unlimited performance headroom or a long-duration thermal benchmark. The previous 59.9 FPS cause is not independently proven by this rerun.

### Verification and visual evidence

Saved correction checks passed: 18 Vitest tests, 18 pytest tests, five visual-tool tests, lint, schema validation, TypeScript and build. Both internal correction reviewers previously passed the implementation. No rendering source changed after those checks; the resumed run adds measurement evidence and the approved ruling. Canonical verification was repeated after the valid rerun and reports all 32 files unchanged.

All ten original engineering comparisons pass at 0.2603% to 0.3147%; CAM-6 is captured without inventing a new baseline. The environment-flow result reports zero browser errors, no Engineering environment requests, cached reuse, and unchanged plant identity. The CAM-6 comparison was visually inspected: horizon/ridges, scattered dressing and sand variation are present. The mountain treatment remains visibly simpler than the reference; whole-image approval remains at Task 6.

### Paused-state history

The earlier rerun was rejected because an external monitor was active. After asking Mostafa to resolve that condition, Codex continued work it considered independent; Mostafa ruled that this was a complete hard stop. That process error is acknowledged, and the workspace working agreement now states the pause/resume rule explicitly. Work resumed only after Mostafa disconnected the monitor and approved the outstanding cutoff and rerun. Task 4 had not started during that pause.

### Evidence logs and final review

Correction output and approved-rerun logs are appended below. Final internal spec review: PASS; final internal code-quality review: PASS. Both independently inspected the rerun evidence and confirmed that the measurement blocker is resolved. Quality review reproduced the reported FPS and p95 values from raw samples. The spec review's administrative request to replace the stale opening status is addressed by this closure section; the old submission is explicitly retained as history. Both reviews agree. Correction and evidence commit: `c4b1871`. This commit identification is recorded separately. Task 3 is complete under the user's conditional continuation ruling.

---

## Original submission and blocker history

## Summary

Photoreal now loads a CC0 HDRI for background and lighting, sand PBR terrain, a generated site pad, marked roads, fence and three cabins, plus procedural distant ridges and haze. The sun direction is derived from the HDRI; equipment and pipe shadows use that direction. Environment assets load only on first Photoreal activation, with a visible loading state, and remain cached for subsequent switches. Canonical plant data, equipment geometry and equipment material definitions are unchanged. Both internal reviewers pass the implementation after loading-label and resource-disposal corrections, but **Task 3 is not complete: its final Engineering median was 59.9 FPS against the approved minimum of 60, triggering the user's hard stop**. No budget was rounded, waived or changed; Task 4 has not started.

Non-gate tasks completed since the Task 1 gate:
- **Task 02 —** batch rendering, canonical pick mapping, lossless GLB compression and 500-asset stress mode; implementation/evidence `a1ddba3`, completed hand-back `d3947c5`, both pushed to `dual-look`.

## Files touched

Environment components, look/presentation settings, tab loading state, generated assets, Blender context pipeline, asset register and acceptance evidence implement Task 3. Two outside-scope dependency files are declared: **pyproject.toml** and **requirements-dev.lock**, pinning the texture compressor. No third exception or plan-level change is introduced. Environment output uses `data/normalized/assets/env/`, the equivalent public directory because Vite's existing publicDir is `data/normalized`; these generated presentation outputs are excluded from canonical truth by the existing verifier.

- `ASSETS.md`
- `app/src/Atmosphere.tsx`
- `app/src/PhotorealEnvironment.tsx`
- `app/src/Scene.tsx`
- `app/src/looks/LookProvider.tsx`
- `app/src/looks/looks.ts`
- `app/src/main.tsx`
- `blender/scripts/build_site_context.py`
- `data/normalized/assets/env/context.glb`
- `data/normalized/assets/env/sand-color.webp`
- `data/normalized/assets/env/sand-normal.webp`
- `data/normalized/assets/env/sand-rough.webp`
- `data/normalized/assets/env/sky.hdr`
- `data/normalized/assets/env/sources.json`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-benchmark-comparison.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-engineering-after-switch.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-selected.png`
- `docs/handbacks/evidence/stageB-task-03/build.log`
- `docs/handbacks/evidence/stageB-task-03/check.log`
- `docs/handbacks/evidence/stageB-task-03/comparison.log`
- `docs/handbacks/evidence/stageB-task-03/context-build.log`
- `docs/handbacks/evidence/stageB-task-03/data-verify.log`
- `docs/handbacks/evidence/stageB-task-03/engineering-comparison.json`
- `docs/handbacks/evidence/stageB-task-03/environment-build.log`
- `docs/handbacks/evidence/stageB-task-03/environment-flow.json`
- `docs/handbacks/evidence/stageB-task-03/environment-flow.log`
- `docs/handbacks/evidence/stageB-task-03/look-flow.json`
- `docs/handbacks/evidence/stageB-task-03/look-flow.log`
- `docs/handbacks/evidence/stageB-task-03/metrics.log`
- `docs/handbacks/evidence/stageB-task-03/production.log`
- `docs/handbacks/evidence/stageB-task-03/return-engineering.json`
- `docs/handbacks/evidence/stageB-task-03/sun-alignment.json`
- `docs/handbacks/evidence/stageB-task-03/visual.log`
- `docs/handbacks/stageB-task-03.md`
- `docs/metrics/stageB-task-03-after.json`
- `docs/metrics/stageB-task-03-after.md`
- `docs/reference/petromind-close.png`
- `docs/reference/petromind-wide.png`
- `pyproject.toml`
- `requirements-dev.lock`
- `scripts/build_context.py`
- `scripts/build_environment.py`
- `tests/visual/environment-comparison.mjs`
- `tests/visual/environment-flow.mjs`
- `tests/visual/environment-metrics.mjs`
- `tests/visual/look-common.mjs`
- `tests/visual/look-flow.mjs`

## New dependencies

`Pillow==12.3.0`, development only, HPND/PIL Software License, used for lossless WebP texture compression. No new runtime dependency.

## New assets

All downloaded art is CC0-1.0, verified before download on the official pages:
- HDRI: https://polyhaven.com/a/kloofendal_43d_clear_puresky — 2K RGBE, 4,624,289 bytes.
- Sand maps: https://polyhaven.com/a/sand_01 — 1K diffuse, OpenGL normal and roughness, lossless WebP; 1,170,648 / 1,928,894 / 278,954 bytes.
- License: https://polyhaven.com/license . URLs and source MD5/output SHA256 are pinned in sources.json and registered in ASSETS.md.
- Site context: original procedural Blender geometry, no third-party art, 1,800,372 bytes; seven material meshes, 33,216 triangles. Runtime terrain and mountains are original generated geometry.
- PetroMind images are user-supplied review references, not shipped assets or claimed CC0 artwork.

Texture command: `node scripts/python.mjs scripts/build_environment.py`. Context command: `node scripts/python.mjs scripts/build_context.py`. KTX2 is recommended rather than mandatory in this task; lossless WebP keeps the total package at **9,804,474 bytes**, including provenance metadata, within 40 MB. WebP reduces transfer size, not GPU texture memory.

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
   Start at  20:22:22
   Duration  2.45s (transform 1.25s, setup 0ms, import 4.83s, tests 384ms, environment 1ms)

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

============================= 18 passed in 3.37s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 1.6619
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 2 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 600.2884
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
# duration_ms 759.0613

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
✓ 263 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DupH9ZgS.css     10.54 kB │ gzip:   3.12 kB
dist/assets/index-C6UdNE_f.js   1,365.43 kB │ gzip: 385.45 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 5.90s

```

### context-build.log

```text
C:\Users\Mosta\OneDrive\Documents\ChatGPT\Oil and Gas\refinery-digital-twin-starter\blender\scripts\build_site_context.py:119: DeprecationWarning: 'Material.use_nodes' is expected to be removed in Blender 6.0
  material.use_nodes = True
INFO Draco is available, use library at D:\blender\5.2\scripts\addons_core\io_scene_gltf2\bf_intern_draco_bridge.dll
INFO MeshOptimizer is available, use library at D:\blender\5.2\scripts\addons_core\io_scene_gltf2\bf_intern_meshopt_bridge.dll
20:21:10 | INFO: Starting glTF 2.0 export
20:21:10 | INFO: Extracting primitive: Context_cabin_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_concrete_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_galvanized_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_marking_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_road_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_trim_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Extracting primitive: Context_window_mesh
20:21:10 | INFO: Primitives created: 1
20:21:10 | INFO: Finished glTF 2.0 export in 0.11714529991149902 s

{"output": "C:\\Users\\Mosta\\OneDrive\\Documents\\ChatGPT\\Oil and Gas\\refinery-digital-twin-starter\\data\\normalized\\assets\\env\\context.glb", "bytes": 1800372, "meshes": 7, "triangles": 33216, "runtime_bounds": {"x": [-26, 266], "z": [-144, 46]}, "runtime_gate": [-26, -0.45, 37], "cabins": 3, "provenance": "Original procedural geometry; no external models"}
Blender 5.2.1 LTS (hash 9e2066aef7ef built 2026-08-25 02:38:20)

Blender quit

```

### environment-build.log

```text
[
  {
    "file": "sky.hdr",
    "url": "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloofendal_43d_clear_puresky_2k.hdr",
    "license": "CC0-1.0",
    "sourceMd5": "62f7cb7b1dac5a90a5bbde728606773b",
    "bytes": 4624289,
    "sha256": "462a3cc63bfcd9fe0299137a0f33f4ade84e237f4cb6115fe46f5ab400693fe6"
  },
  {
    "file": "sand-color.webp",
    "url": "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_diff_1k.png",
    "license": "CC0-1.0",
    "sourceMd5": "2a0bb026ff6270a8b633f6a9a3492e58",
    "bytes": 1170648,
    "sha256": "31cbf20c3514c429ca4f7dc7b7392206e8dfb03b29375536b68cd85cf7ccda16"
  },
  {
    "file": "sand-normal.webp",
    "url": "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_nor_gl_1k.png",
    "license": "CC0-1.0",
    "sourceMd5": "4005969e85765551ccf8f121e8ee3bbd",
    "bytes": 1928894,
    "sha256": "5b01adebabeecf0323ea870847b9e8971705527f052b9f8e43dfbadc81d8115f"
  },
  {
    "file": "sand-rough.webp",
    "url": "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/sand_01/sand_01_rough_1k.png",
    "license": "CC0-1.0",
    "sourceMd5": "1b0b2c4ead63bc95240aea9739b9a670",
    "bytes": 278954,
    "sha256": "09a1079e329ce488ac5aa262ad824bc562425cbe10c8dc497de0d9b0f077e9fb"
  }
]

```

### production.log

```text

> refinery-digital-twin@0.0.0 test:production
> node --test tests/production.test.mjs

TAP version 13
# Subtest: production server serves the complete build with correct types and real missing-file errors
ok 1 - production server serves the complete build with correct types and real missing-file errors
  ---
  duration_ms: 831.3327
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
# duration_ms 1200.0456

```

### environment-flow.log

```text
{
  "hardware": {
    "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "look": "engineering",
    "interactiveAt": 1865.5,
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
  "loadingIndicator": "PASS while HDR request held",
  "engineeringEnvironmentRequests": 0,
  "loadedRequests": 5,
  "repeatSwitchRequests": 0,
  "lazyBytes": 9804474,
  "files": [
    {
      "name": "context.glb",
      "bytes": 1800372
    },
    {
      "name": "sand-color.webp",
      "bytes": 1170648
    },
    {
      "name": "sand-normal.webp",
      "bytes": 1928894
    },
    {
      "name": "sand-rough.webp",
      "bytes": 278954
    },
    {
      "name": "sky.hdr",
      "bytes": 4624289
    },
    {
      "name": "sources.json",
      "bytes": 1317
    }
  ],
  "plantIdentity": "unchanged",
  "errors": []
}

```

### look-flow.log

```text

> refinery-digital-twin@0.0.0 test:looks
> node tests/visual/look-flow.mjs

{
  "hardware": {
    "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "look": "engineering",
    "interactiveAt": 2770.399999976158,
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
      "initialGeometryCount": 38,
      "finalGeometryCount": 38,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 26,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 38,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 26,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 38,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 26,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 38,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 26,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 38,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 26,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 38,
          "textures": 23
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
      "initialGeometryCount": 317,
      "finalGeometryCount": 317,
      "counts": [
        {
          "look": "photoreal",
          "geometries": 305,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 317,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 305,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 317,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 305,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 317,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 305,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 317,
          "textures": 23
        },
        {
          "look": "photoreal",
          "geometries": 305,
          "textures": 21
        },
        {
          "look": "engineering",
          "geometries": 317,
          "textures": 23
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

### comparison.log

```text
Engineering after round trip: 0.2822% PASS; benchmark comparison rendered.

```

Both internal reviewers pass implementation. Quality correction: explicitly dispose the owned mountain material. Spec correction: replace a wrongly encoded loading symbol with ASCII Loading..., verified while the HDR request is deliberately held. The environment has zero cold-Engineering requests, five first-Photoreal asset requests and zero repeated requests after switching.

## Metrics

Before (completed Task 2):

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

After (Task 3 candidate):

# Task 3 after

| Look | Stress assets | Draw calls | Triangles | FPS median | p95 ms | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 32.0 | 479196 | 59.9 | 17.70 | 8620032 | FAIL |
| photoreal | normal | 45.0 | 613110 | 59.9 | 17.50 | 18424689 | PASS |
| engineering | 500 | 35.8 | 3917877 | 59.9 | 17.60 | 8620032 | PASS |

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
| pipes | 1.0 | 1.0 |
| lamps | 2.0 | 1.0 |
| ground | 10.0 | 7.0 |
| helpers | 1.0 | 0.0 |

Post passes: 14.0.

## engineering / 500 submissions

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 7.8 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

**HARD STOP: Engineering FPS median 59.9 < 60.** The raw value is retained in stageB-task-03-after.json; no rounding to 60 is accepted. The three runs clustered near 60 FPS, while Task 2 measured near 145 FPS on the same recorded RTX 3050 renderer. This observation does not establish the cause, and no budget retest or implementation change was made after the miss. The reference machine/display scheduling condition and/or rendering change needs investigation under a reviewer ruling. All other approved measured budgets pass: Engineering 32 calls and 17.7 ms p95, Photoreal 45 calls / 59.9 FPS / 17.5 ms, stress 59.9 FPS, Engineering initial 8,620,032 bytes, lazy assets 9,804,474 bytes.

## Screenshots

- `docs/handbacks/evidence/stageB-task-03/CAM-1-benchmark-comparison.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-engineering-after-switch.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-1-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-2-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-3-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-4-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-photoreal-default.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-photoreal-selected.png`
- `docs/handbacks/evidence/stageB-task-03/CAM-5-selected.png`

Fixed cameras and 1600 x 900 captures are unchanged. The side-by-side report labels and contains the original supplied reference without altering its contents. The fixed CAM-1 is steeper than the supplied PetroMind wide view, so it shows primarily terrain rather than the sky; this task did not change the approved camera to hide that difference.

## Visual regression result


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

Final Engineering return from Photoreal: Engineering after round trip: 0.2822% PASS; benchmark comparison rendered.

The all-camera Engineering run preceded the final Photoreal-only shadow/ridge tuning; the final return-to-Engineering CAM-1 check also passes. All final Photoreal default/selected captures are from the shared-flow test. Pad shadow banding observed in the first candidate was corrected. Formal orbit-shadow visual sign-off remains pending with this blocked gate; performance orbit completed but is not a substitute for visual approval.

## Canonical data check

```text

> refinery-digital-twin@0.0.0 data:verify
> node scripts/data-verify.mjs

Canonical data unchanged (32 files).

```

## Known issues / blockers

1. **Blocking:** Engineering 59.9 FPS misses 60 FPS. User ruling required before investigation/resumption; thresholds remain unchanged.
2. Task 3 visual approval by Mostafa and software approval by Claude remain pending. The mountains are deliberately simple procedural ridges, visibly coarser than the PetroMind benchmark. Equipment still has the existing materials/detail; those belong to later tasks.
3. CAM-1's approved steep framing leaves little sky; no camera change made. The wider benchmark composition is shown honestly side by side.
4. KTX2 deferred; textures are lossless WebP at 1K. Total asset transfer budget passes; GPU-memory compression is not claimed.
5. Existing Vite large-chunk advisory and RGBELoader deprecation warning are non-fatal. Explicit task metrics command is `node tests/visual/environment-metrics.mjs`; the older root metrics alias still targets Task 1, so use the documented task command.
6. Initial packaging mistake (app/public instead of configured normalized public directory) caused a 404 in the first development run and was corrected before all recorded successful captures. No failed capture is presented as evidence of success.

## Commit hash

Candidate and evidence: `bdcc098`. This final hand-back entry is committed separately. This is a blocked review checkpoint, not an accepted/completed Task 3.

## Correction and approved rerun log output

### correction-check.log
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
   Start at  02:57:33
   Duration  11.21s (transform 3.75s, setup 0ms, import 31.32s, tests 1.25s, environment 5ms)

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

============================= 18 passed in 13.29s =============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 9.2849
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 27.5974
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 2374.2523
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 6.0004
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 4.9771
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
# duration_ms 2888.1538

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
✓ 263 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DupH9ZgS.css     10.54 kB │ gzip:   3.12 kB
dist/assets/index-DJAtT_sT.js   1,369.29 kB │ gzip: 387.05 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 22.78s
```
### correction-visual.log
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
CAM-6-default.png: CAPTURED — new approved camera, no baseline comparison
CAM-6-selected.png: CAPTURED — new approved camera, no baseline comparison
```
### correction-comparison.log
```text
Engineering after round trip: 0.2822% PASS; CAM-1 and CAM-6 benchmark comparisons rendered.
```
### correction-environment-flow.log
```text
{
  "hardware": {
    "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "look": "engineering",
    "interactiveAt": 6811.5999999996275,
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
  "loadingIndicator": "PASS while HDR request held",
  "engineeringEnvironmentRequests": 0,
  "loadedRequests": 5,
  "repeatSwitchRequests": 0,
  "lazyBytes": 9804474,
  "files": [
    {
      "name": "context.glb",
      "bytes": 1800372
    },
    {
      "name": "sand-color.webp",
      "bytes": 1170648
    },
    {
      "name": "sand-normal.webp",
      "bytes": 1928894
    },
    {
      "name": "sand-rough.webp",
      "bytes": 278954
    },
    {
      "name": "sky.hdr",
      "bytes": 4624289
    },
    {
      "name": "sources.json",
      "bytes": 1317
    }
  ],
  "plantIdentity": "unchanged",
  "errors": []
}
```
### approved-rerun-metrics.log
```text
# Task 03 rerun

| Look | Stress assets | Draw calls | Triangles | FPS median | p95 ms | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 32.0 | 479196 | 144.9 | 7.40 | 8623896 | PASS |
| photoreal | normal | 47.0 | 745510 | 144.9 | 7.50 | 16627881 | PASS |
| engineering | 500 | 35.8 | 3917838 | 142.9 | 7.50 | 8623896 | PASS |

## engineering / normal submissions

Display: 144 Hz; AC: true; laptop only: true; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 4.0 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

## photoreal / normal submissions

Display: 144 Hz; AC: true; laptop only: true; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 4.0 | 4.0 |
| pipes | 1.0 | 1.0 |
| lamps | 2.0 | 1.0 |
| ground | 12.0 | 7.0 |
| helpers | 1.0 | 0.0 |

Post passes: 14.0.

## engineering / 500 submissions

Display: 144 Hz; AC: true; laptop only: true; Power Scheme GUID: 27fa6203-3987-4dcc-918d-748559d549ec  (Performance). Previous comparable FPS: 144.9. Measurement: VALID.

| Category | Color | Shadow |
|---|---:|---:|
| equipment | 7.8 | 4.0 |
| pipes | 1.0 | 0.0 |
| lamps | 2.0 | 0.0 |
| ground | 6.0 | 0.0 |
| helpers | 2.0 | 0.0 |

Post passes: 13.0.

```
### approved-rerun-data-verify.log
```text
Canonical data unchanged (32 files).
```
