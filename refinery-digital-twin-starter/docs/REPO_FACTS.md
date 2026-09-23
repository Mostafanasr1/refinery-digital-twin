# Repository facts at Stage B Task 0

Stage A closes at `fb2de98` on `codex/stage-a`. `dual-look` starts from that commit. The external combined review remains pending; the overnight ruling permits this baseline task before that review. Stage B Task 1 has not started.

## Layout and data

The Git root is the parent of `refinery-digital-twin-starter/`. Commands below run inside that project directory. `app/` contains the React/Three.js runtime; `pipeline/` normalizes and validates data; `schemas/` describes canonical records; `blender/` generates geometry; `scripts/` holds build and evidence tools. Source JSON is in `data/synthetic/`; runtime records are in `data/normalized/`. Generated GLB is in `data/normalized/models/`; the existing separate study is in `data/normalized/preview/`.

The completed plant has **57 assets, six units, 22 equipment types, and 67 telemetry points**. The model build report records 167 mesh objects and 253,844 triangles at detail level 1. These export totals are not runtime draw-call or rendered-triangle measurements.

Presentation data will live in `data/presentation/`: looks, tours, camera moves and captions are separate from canonical plant truth. Measurement camera fixtures live in `tests/visual/cameras.json`. Both are excluded from the canonical hash. Existing canonical scenarios remain frozen; future tours use their own presentation files and the player reads both categories.

## Local tools and commands

- Node: 22.16.0; Python: 3.11.9 through `node scripts/python.mjs` and the local `.venv`.
- Blender: `D:/blender/blender.exe`, 5.2.1 LTS. `BLENDER_BIN` can override discovery.
- `npm ci` installs locked JavaScript dependencies. Windows shell commands use `npm.cmd` where PowerShell execution policy requires it.
- `npm run check`: normalize, ESLint/Ruff, Vitest/pytest, source and normalized schema validation, TypeScript/Vite production build.
- Stage A closeout: 12 Vitest tests in five files; 18 pytest tests; `npm run test:production` passes its server test.
- `npm run check:generators`: all 22 builders twice in Blender, checking determinism and contract validity.
- `npm run build:models`: regenerate Blender model and runtime GLB. Do not run against changed canonical data in Stage B without a ruling.
- `npm run build:preview`: regenerate the existing separate module study and Cycles still.
- `npm run build`, then `npm start`: production server on port 3000; `npm run dev`: Vite development server.

## Existing UI before consolidation

`#demo` opens the whole plant. Geometry selects **Blender GLB** or **Primitive proxies**; it is independent of the top tabs. Data layer defaults to Engineering view, with no scenario, process path or selection active.

`#preview` opens a separate three-asset crude preheat module study, with its own camera and selection state. Its Interactive 3D view uses `preview/module.glb`; Cinematic render displays the offline Cycles PNG. This is not yet a photoreal look over the whole plant. Task 0 records it without changing its appearance; consolidation belongs to Task 1.

## Publishing

GitHub Pages uses Actions. The live root is <https://mostafanasr1.github.io/refinery-digital-twin/>. The branch preview is intended at <https://mostafanasr1.github.io/refinery-digital-twin/next/>.

The `dual-look` workflow builds the branch for `/next/` and independently checks out and builds `main` for the site root, then publishes one combined artifact. It never commits to or merges into main. The main ref at Stage A close is `6b4ee831512b0356e6904244f0477b37551c5b7f`. A future deployment using main's older workflow replaces the complete site and removes `/next/` until dual-look is republished; changing main's workflow is outside this branch-only task.

The expired earlier Pages artifact cannot be reused, so the root is rebuilt from main's committed lockfile and data. Deployment evidence must verify the root page and main ref, plus the `/next/` asset count.

## Hygiene

Removed the stale ignored 4,154,429-byte `refinery-demo-share.zip`. Ignore rules cover dependencies, build outputs, Python caches, Blender backups and common OS metadata. The unrelated untracked sibling `real-estate-poc/` is left untouched and is not part of this project.

## Capture and measurement protocol

The capture browser is Chrome 146.0.7680.153, selected with `VISUAL_BROWSER_PATH=C:/Users/Mosta/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe`. Install a matching browser on another machine; visual verification refuses a browser version or GPU change against the baseline. Playwright is a declared development dependency.

Exact flags: `--enable-gpu`, `--force_high_performance_gpu`, `--use-angle=d3d11`, `--force-color-profile=srgb`, `--disable-background-timer-throttling`, `--disable-renderer-backgrounding`, `--disable-backgrounding-occluded-windows`. The high-performance flag is necessary on this hybrid laptop: the initial attempt selected AMD integrated graphics and was rejected. The accepted renderer identifies **NVIDIA GeForce RTX 3050 Laptop GPU**, ANGLE Direct3D11; it is recorded in capture and metric JSON.

Viewport is 1600 Ã— 900, DPR 1, locale en-US and timezone UTC. Date is frozen at the camera fixture timestamp; the Three.js simulation clock and CSS animations are paused. Native performance timing remains real. A scripted camera overrides interactive controls only with `?measure=1`; ordinary runtime appearance and controls are unchanged. Captures wait for loaded geometry, a rendered frame, fonts and network settling. Both no-selection and fixed T-201 selection variants use the default data layer.

`npm run shots -- --baseline --reference` records the initial ten engineering images and the existing study/Geometry references; later runs use `npm run shots` without those flags. The reference flag is only for the pre-consolidation study. `npm run visual:check` compares fresh images against the committed baseline, refusing more than 0.5% differing pixels per frame. Pixelmatch uses color threshold 0.1 and includes antialiasing differences. Baselines must not be replaced to conceal a failed comparison.

`npm run metrics` uses a cold browser context for each existing view, a three-second warm-up and ten-second active camera orbit. It records draw calls, triangles, actual frame intervals, resource counts and transferred bytes through the first loaded interactive frame. The local static server is uncompressed; its byte baseline must be compared using the same server. The separate study is reported as a study, not a whole-plant photoreal look.

`npm run data:verify` checks 32 canonical files against the Stage A close snapshot: source JSON, normalized record JSON, schemas and `pipeline/catalog.py`. It normalizes JSON object key order and text line endings, while retaining array order and values. Added, removed and changed truth files fail verification. Generated model and preview outputs are excluded. `npm run test:visual-tools` tests this contract with temporary fixture files.

No budget is final until the combined review.

## Deployment status at hand-back

The dual-look build and combined artifact succeeded, but GitHub rejected deployment because the github-pages environment permits only main. The allowlist remains unchanged; adding dual-look awaits explicit approval after automatic approval review rejected that security-setting mutation. The live main page and main ref are unchanged. `/next/` is not yet published. See the Task 0 hand-back for the run and evidence.

## Deployment resolution and approved budgets

The user added dual-look to the existing github-pages allowlist. The failed deployment was rerun successfully. `/next/` serves 57 assets and main root serves 43, with identical root HTML and unchanged main commit. Task 0's prior blocker is resolved; Stage A Task 08 and Stage B Task 0 are approved. See `docs/APPROVED_BUDGETS.md` for the final limits applying from Task 2.
