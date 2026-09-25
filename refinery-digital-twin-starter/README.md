# Refinery Digital Twin

A synthetic refinery demonstration: 57 assets, six units and two looks over the same equipment, telemetry, process paths and scenarios. This is a concept model, not an engineering operating system.

- Release (main): https://mostafanasr1.github.io/refinery-digital-twin/
- Preview (dual-look): https://mostafanasr1.github.io/refinery-digital-twin/next/

## Use the demo

Engineering is the dark HUD look. Photoreal adds desert surroundings, physical-scale materials, detailed equipment and atmosphere. Switch with the top tabs; Day/Night is inside Photoreal. Selection, cards and operating state persist. Geometry independently selects generated Blender models or primitive proxies.

On phones, Equipment and Controls open collapsible panels; selected equipment appears in a scrollable bottom card. Portrait framing preserves more of the plant, and the view uses the available screen height.

Initial plant loading and the first photoreal switch show received asset bytes as a percentage, with elapsed seconds on desktop and mobile. At 100%, Preparing scene remains until a completed scene frame and the following animation frame. Asset sizes come from the build; unavailable or mismatched files show an error with Reload. Photoreal files remain lazy.

Select equipment in the scene or register. Process path animates the synthetic process; Data layer colours operating values; Scenario runs a synthetic event. Follow the process starts a 42-second narrated camera tour, with an optional photoreal reveal. End presentation, Escape or manual navigation returns control. After 60 seconds idle, attract mode traverses five cameras and both looks; input exits it.

## Windows setup

From this directory, install Node.js 22 and Python 3.11+ (pip available):

```powershell
npm ci
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.lock
.venv/Scripts/python.exe -m pip install --no-deps -e .
npm run check
npm run dev
```

The Python wrapper uses this project’s `.venv` interpreter; create it before running npm checks. For a production preview:

```powershell
npm run build
npm start
```

Open http://localhost:3000. Serve over HTTP, not file://. The production build is `app/dist`; it includes committed normalized data and generated assets. Engineering loads first; environment, materials and hero detail load on first Photoreal use.

## Regenerate assets

Blender 5.2.1 LTS is the recorded authoring version. Set `BLENDER_BIN` if it is not on PATH or at `D:/blender/blender.exe`.

```powershell
$env:BLENDER_BIN='D:/blender/blender.exe'
npm run normalize
npm run build:models
npm run check:generators
node scripts/python.mjs scripts/build_context.py
node scripts/python.mjs scripts/build_hero.py
node scripts/python.mjs scripts/build_environment.py
node scripts/python.mjs scripts/build_materials.py
npm run build
```

Environment/material rebuilds fetch the pinned CC0 sources and use the dependencies documented in ASSETS.md and their scripts. Ordinary builds need no Blender or asset downloads: generated assets are committed. The model command applies lossless meshopt compression. Never hand-edit generated GLBs.

## Verify

```powershell
npm run check
npm run test:production
npm run data:verify
npm run check:generators
$env:VISUAL_BROWSER_PATH='C:/Users/Mosta/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe'
npm run shots
npm run visual:check
npm run metrics -- --task=09
```

Install the reference Chrome 146.0.7680.153 and set VISUAL_BROWSER_PATH to its actual location. Visual checks require the recorded RTX 3050/D3D11 setup, 1600 × 900, DPR 1 and matching browser/flags; do not silently replace the baseline on other hardware. Task 8 approved all six engineering cameras, default and selected. Tolerance remains 0.5 percent. `shots` captures views; `visual:check` compares engineering against the approved baseline. Use task-specific metric output IDs to preserve evidence.

Metrics alone use disabled GPU vsync/frame limiting and report frame-time median/p95 in ms, with derived FPS. AC/Performance plan and recorded display configuration are required; an external monitor is permitted by the approved protocol. Budgets: engineering median ≤16.67 ms/p95 ≤20 ms/150 calls; photoreal median ≤25 ms/p95 ≤33 ms/200 calls; engineering 500 assets median ≤25 ms. Initial engineering transfer ≤13,200,115 bytes; lazy photoreal assets ≤40 MB. Measurements are reference-machine evidence, not guarantees for every phone.

From Task 9, motion review recordings use 60 fps frame-by-frame capture stitched with ffmpeg CRF 18, or canvas captureStream/MediaRecorder at high fixed bitrate. Playwright video is for interaction assertions only.

## Release and records

Both main and dual-look pushes publish a combined Pages artifact: root built from main, /next/ built from dual-look. `deploy.json` at each URL identifies its source commit. A preview push does not merge into main. Release changes require the agreed gates.

Canonical plant truth is frozen and verified by `data:verify`. Presentation cameras, looks and tours live separately under `data/presentation` and application look configuration. Original project geometry is procedural; all externally sourced runtime art is registered CC0. User reference images and review videos are not runtime assets. See [ASSETS.md](ASSETS.md), [repo facts](docs/REPO_FACTS.md), [approved budgets](docs/APPROVED_BUDGETS.md) and [Task 9 hand-back](docs/handbacks/stageB-task-09.md).

Phone: there is currently no automatic mobile quality reduction; presets retain their desktop settings, with DPR capped at 1.5. Mostafa reports the Samsung A35/Chrome release check passed and Task 9 approved. Mostafa approved the corrected mobile layout at the Stage C Task 1 gate: Samsung A35 / Chrome first-load loader 2 seconds, first photoreal switch 2 seconds, mobile layout clean. These are reported physical-device observations.


### Stage C Task 2 preview candidate

The dual-look preview adds switchable procedural site dressing, optional detail across all equipment types, and material/ground wear. Use **Photoreal → Dressing** to compare. Canonical data and the approved engineering baseline stay unchanged. CAM-6 day is the slice judgment frame; see [the hand-back](docs/handbacks/stageC-task-02.md) and [before/after/reference comparison](docs/handbacks/evidence/stageC-task-02/comparison.html). Both reviewers approved Task 2. Mostafa judges the remaining reference gap to be terrain, ground and sourced assets; Stage C Task 3 addresses that gap.


### Stage C Task 3 — real environment assets

The `/next/` candidate replaces generated ridges with adapted SRTM terrain from Sinai and blends Poly Haven sand, gravel and rock. Instanced sourced cabins, containers and vehicles remain presentation-only and can be hidden with **Photoreal → Dressing**. Engineering and canonical equipment are unchanged. Sources, licenses and derivative transformations are listed in [ASSETS.md](ASSETS.md); see the [Task 3 hand-back](docs/handbacks/stageC-task-03.md) and [CAM-6 comparison](docs/handbacks/evidence/stageC-task-03/comparison.html). External visual acceptance is pending; no reference-level realism claim.
