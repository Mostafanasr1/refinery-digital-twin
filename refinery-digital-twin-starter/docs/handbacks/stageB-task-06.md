# Stage B Task 06 — Post-processing and atmosphere

25 September 2026. Branch: `dual-look`. Implementation and internal verification complete; submitted for the Task 6 external gate. Stop here for both Claude and Mostafa. No approval of reference-level realism is claimed.

## Tasks since the Task 3 gate

- Task 04 — physical-scale lazy material pack and confirmed uncapped display-independent metrics protocol: `2726b90`.
- Task 05 — six per-type optional hero-detail builders, hidden-detail picking correction, 228 selection checks and both reviews passed: `b208f23`.

## Result

Photoreal day gains half-resolution SSAO contact shading, restrained high-threshold bloom, animated procedural flare and soft steam from three cooling towers. The shared `photoreal-night` preset adds a procedural dusk sky, dimmer environment lighting, emissive platform/site lamps, one mounted floodlight and the flare's local light. Day/night is a toggle inside Photoreal. All plant data, asset identities, selections and operating overlays remain shared.

At night only two lights cast shadows: the directional light and one 1024 px spotlight mounted at a column platform. The flare adds one non-shadow point light; all other site/platform lamps are emissive meshes. Flame and steam are excluded from the AO normal pass. SSAO synchronizes camera projection/near/far each frame and explicitly disposes resources omitted by the installed Three.js pass cleanup.

A separate `non-canonical-site-dressing` group adds restrained instanced stored-pipe bundles in clear areas. It has no IDs, telemetry, process meaning or raycasting. It avoids equipment footprints and is subject to Mostafa's density judgment here. No canonical plant assets were added.

## Tone-mapping comparison

Both ACES and AgX were captured at every approved camera, in day and night. ACES is retained: stronger separation around heater/column/racks, clearer safety yellow and warmer flare/lamp highlights; AgX produces softer, more neutral/desaturated midtones in this scene. The internal spec reviewer inspected all 24 images and independently recommended ACES. Engineering retains its original ACES settings.

The first comparison could be reset to ACES by Canvas configuration after lazy-loading state updates, so it was not used to choose. The corrected post stack sets tone mapping immediately before output; repeated captures assert the requested mapping reaches the renderer. Evidence: `evidence/stageB-task-06/CAM-N-photoreal[-night]-{aces,agx}.png`.

## Final budgets

| Workload | Median ms | p95 ms | Mean draw calls | Result |
|---|---:|---:|---:|---|
| Engineering | 1.30 | 2.10 | 47.0 | PASS |
| Photoreal day | 2.50 | 3.60 | 128.0 | PASS |
| Photoreal night | 2.80 | 4.80 | 152.0 | PASS |
| Engineering, 500 assets | 1.40 | 10.00 | 57.3 | PASS |

Engineering initial download: 8,755,718 bytes, below 13,200,115. Combined lazy assets remain 21,417,040 bytes, below 40,000,000; Task 6 adds procedural code only. Night also passes the stricter day limits, so no reliance on the plan's 30 FPS allowance was necessary. Engineering triangles remain 479,196; day 1,435,831 and night 1,782,995 include multiple rendering passes.

Final metrics ran alone after other verification browsers exited. Metrics-only uncapping flags are preserved, animation is active, and each workload records both 144 Hz displays, resolutions, primary display, AC and Performance plan. Frame time is primary; derived FPS is browser-loop throughput, not physical display rate. Raw samples and summary: `docs/metrics/stageB-task-06-rerun.{json,md}`. Earlier pre-tone-fix measurements are retained as historical evidence and are not the final verdict.

## Verification

- Check suite passes: 19 Vitest, 31 pytest, six visual-tool tests; lint, validation, TypeScript and production build. Final tone-ownership change also passed TypeScript/build and browser checks.
- Canonical hash: all 32 locked files unchanged; 57 assets and six units. Base GLB untouched.
- Engineering regression: ten captures pass at 0.2603–0.3146%; CAM-6 capture-only. Original cameras and screenshot baseline untouched.
- Direct night URL and day/night/Engineering identity/registry continuity pass. No application or shader errors in comparison captures. Existing missing `favicon.ico` is recorded separately as a known warning.
- All 114 actual night picks/cards pass: 57 assets in both Blender and proxy modes.
- Ten repeated Engineering/night switches per geometry mode preserve card, camera, layers, process and scenario state, with no GLB reload. Resource counts stabilize after warming the exact measured camera: Blender 54 cold, 55 warm, 55 after ten switches; proxy 327 throughout. The initial cold/warm mismatch was investigated; the test now warms the same camera after geometry replacement and retains strict no-growth assertions.
- `CAM-5-flare.mp4`: exactly 10.000 seconds, 1600 x 900, H.264, 30 FPS, 300 frames, checked with ffprobe. It records the live canvas using screenshot flags; HUD elements outside the canvas are not in the video. An 11-second source capture provides timestamp margin before encoding the ten-second clip.
- Internal spec and code-quality reviews approve implementation; final review records are in `evidence/stageB-task-06/internal-reviews.md`. Internal review does not replace the external visual/software gate.

[Review gallery: camera, tone and reference comparisons](evidence/stageB-task-06/review.html). [Flare video](evidence/stageB-task-06/CAM-5-flare.mp4).

## Known visual limits and required gate decisions

The night preset is a dusk/early-night interpretation of the supplied mood image. Procedural ridges and some non-hero shapes, notably faceted sphere tanks, remain visibly coarser than the references. Stored-pipe dressing does not erase the wide-view density gap. These are submitted for Mostafa's whole-image verdict at CAM-6, with CAM-1 retained as the regression anchor. Tasks 5b and 7 have not run; only Mostafa triggers them at this gate. No user reference image is shipped as runtime art. No visible interaction slowdown was observed during verification.

Required: Mostafa's day/night whole-image and density-dressing verdict, including whether 5b and/or 7 should run, plus Claude's software/plan approval. No later task starts before both approvals and any required rulings.

## Files touched

`app/src/{Atmosphere.tsx,PhotorealEnvironment.tsx,PlantAtmosphere.tsx,SiteDressing.tsx,Scene.tsx,equipmentBatches.ts,main.tsx,style.css}`, `app/src/looks/{looks.ts,MaterialPack.tsx}`, `data/presentation/atmosphere.json`, `tests/visual/{look-common.mjs,look-flow.mjs,selection-all.mjs,environment-metrics.mjs,atmosphere-capture.mjs,atmosphere-video.mjs}`, `ASSETS.md`, `docs/REPO_FACTS.md`, `docs/reference/mood-dusk.png`, Task 06 metrics/evidence and this handback. All new runtime art is original procedural work. Canonical data unchanged.

## Reproduce the video

Run `node tests/visual/atmosphere-video.mjs` with the reference browser environment. Encode its ignored raw recording with:

```text
ffmpeg -y -i tests/visual/output/CAM-5-flare-raw.webm -t 10 -r 30 -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart docs/handbacks/evidence/stageB-task-06/CAM-5-flare.mp4
```

## Pasted check evidence

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
   Start at  23:54:03
   Duration  1.64s (transform 1.02s, setup 0ms, import 4.35s, tests 416ms, environment 2ms)

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

============================= 31 passed in 3.66s ==============================

> refinery-digital-twin@0.0.0 test:visual-tools
> node --test tests/visual/*.test.mjs

TAP version 13
# Subtest: capture rejects missing cameras, changed dimensions and non-finite positions
ok 1 - capture rejects missing cameras, changed dimensions and non-finite positions
  ---
  duration_ms: 2.5704
  type: 'test'
  ...
# Subtest: approved CAM-6 is capture-only while the original engineering protocol stays frozen
ok 2 - approved CAM-6 is capture-only while the original engineering protocol stays frozen
  ---
  duration_ms: 11.0832
  type: 'test'
  ...
# Subtest: canonical lock detects added, changed and deleted data but excludes presentation and formatting
ok 3 - canonical lock detects added, changed and deleted data but excludes presentation and formatting
  ---
  duration_ms: 694.7708
  type: 'test'
  ...
# Subtest: refresh-capped results are invalid rather than budget failures
ok 4 - refresh-capped results are invalid rather than budget failures
  ---
  duration_ms: 1.5323
  type: 'test'
  ...
# Subtest: invalid power/display setup cannot pass a budget
ok 5 - invalid power/display setup cannot pass a budget
  ---
  duration_ms: 1.4417
  type: 'test'
  ...
# Subtest: confirmed uncapped protocol permits external displays but still requires power and display records
ok 6 - confirmed uncapped protocol permits external displays but still requires power and display records
  ---
  duration_ms: 0.4075
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
# duration_ms 876.9924

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
dist/assets/index-CV0iaQVG.js   1,463.84 kB │ gzip: 422.45 kB
✓ built in 6.67s

```

### build-tone-fix.log

```text

> @refinery/app@0.0.0 build
> tsc --noEmit && vite build

vite v6.4.3 building for production...
transforming...
✓ 277 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.37 kB │ gzip:   0.27 kB
dist/assets/index-DBIp-N-9.css     10.76 kB │ gzip:   3.18 kB
dist/assets/index-GeCDiHw7.js   1,464.07 kB │ gzip: 422.49 kB
✓ built in 6.13s

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

### selection-night.log

```text
photoreal-night/blender: 57/57 actual canvas picks and cards PASS
photoreal-night/proxy: 57/57 actual canvas picks and cards PASS

```

### metrics.log

```text

> refinery-digital-twin@0.0.0 metrics
> node tests/visual/environment-metrics.mjs --task=06

# Task 06 rerun

| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 47.0 | 479196 | 1.30 | 2.10 | 769.2 | 8755718 | PASS |
| photoreal | normal | 128.0 | 1435831 | 2.50 | 3.60 | 400.0 | 28121810 | PASS |
| engineering | 500 | 57.3 | 3916793 | 1.40 | 10.00 | 714.3 | 8755718 | PASS |
| photoreal-night | normal | 152.0 | 1782995 | 2.80 | 4.80 | 357.1 | 28121810 | PASS |

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
| lamps | 5.0 | 2.0 |
| ground | 28.0 | 15.0 |
| helpers | 21.0 | 0.0 |

Post passes: 17.0.


```

