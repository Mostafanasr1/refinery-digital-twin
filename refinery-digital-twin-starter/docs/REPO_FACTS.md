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


## Display-independent metrics ruling — 24 September 2026 (proof pending)

Mostafa authorized adding `--disable-gpu-vsync` and `--disable-frame-rate-limit` to metrics runs only. Screenshot flags and the engineering screenshot baseline remain unchanged. Record display count, resolutions, refresh rates, primary display and power state for each run. Confirm the protocol only after engineering and photoreal median FPS agree within 5% between laptop-only and laptop-plus-external conditions; otherwise report both and stop. Comparison formula: absolute difference divided by laptop-only median. Existing performance budgets are unchanged.

The controlled proof serves the preserved GitHub Pages Task 3 artifact from run 36025950895, commit c1c5b70ce6e3e6af075306ee25c8b6d0c78c4ef3. Its entire served tree is SHA256-hashed in the output. Local Task 4 changes are excluded. Both conditions use the same browser, renderer, viewport, camera, flags, three-second warm-up and ten-second orbit. `tests/visual/display-protocol.mjs` records before/after display and power state and compares the artifact and run settings between conditions.

Connected-monitor condition completed:
- Engineering median: 1111.111 FPS; p95 1.40 ms; 32 draw calls; 479,196 triangles.
- Photoreal median: 714.286 FPS; p95 2.20 ms; 47 draw calls; 745,510 triangles.
- Internal 1920 x 1080 at 144 Hz; external primary 2560 x 1440 at 144 Hz; AC connected; Performance plan.
- These are uncapped browser frame-loop timings, not frames physically displayed by a 144 Hz monitor. They are not compared to the old capped FPS as a performance improvement.
- Raw samples and hardware/setup: `docs/metrics/display-protocol/external.json`.

Outcome: PENDING laptop-only condition. No claim of display independence yet. The new launch mode is available for the controlled proof; normal budget measurements are not resumed until the proof is resolved. Screenshot launch defaults are unchanged. The server's configurable static root passed its production test. Task 4 remains paused pending the second condition and protocol outcome.


## Display-independent proof outcome — 24 September 2026

The laptop-only half completed with AC connected, Performance plan, and the internal primary 1920 x 1080 display at 144 Hz. Both comparisons exceed Mostafa's 5% limit. **Protocol NOT CONFIRMED; hard stop.** This supersedes the pending outcome above.

| Look | Laptop-only median FPS | With external median FPS | Difference / laptop median | Result |
|---|---:|---:|---:|---|
| engineering | 2000.000 | 1111.111 | 44.444% | FAIL |
| photoreal | 1111.111 | 714.286 | 35.714% | FAIL |

The comparison verified identical served-artifact SHA256, source commit, browser, renderer, viewport, camera, warm-up/orbit duration, flags and power plan. Draw calls and triangles match across conditions: engineering 32 / 479,196; photoreal 47 / 745,510. Display configuration and power were recorded before and after each workload. Battery charge advanced from 83% in the connected condition to 85% laptop-only; AC remained connected. Background OS activity and thermal state were not controlled or measured, so the difference does not establish that the monitor alone caused it.

These uncapped values represent browser frame-loop intervals, not displayed frame rates. No adjustment of thresholds, repeated trials, replacement baseline or alternative timing definition was applied to obtain a pass. Screenshot flags remain unchanged. Measurement processes have exited; Task 4 has not resumed. Await Mostafa's ruling on protocol resolution.

Evidence: `docs/metrics/display-protocol/external.json`, `laptop.json`, `comparison.json`; logs under `docs/handbacks/evidence/stageB-task-04/display-protocol-*.log`.


## Revised stress protocol — 24 September 2026 (supersedes 5% FPS test)

Mostafa replaced the normal-scene FPS-ratio agreement criterion with frame-time p95 under 500-asset load in both looks. Frame time in ms is primary; FPS is derived as 1000 / median frame time. Budgets remain unchanged (normal engineering median approximately 16.7 ms, normal photoreal 25 ms; existing p95 limits remain separate). Agreement tolerance is max(1.0 ms, 10% of laptop-only p95). Both looks must pass. Metrics use the two uncapping flags; screenshots retain original flags. Per-run display and power records remain mandatory.

Mostafa first authorized Task 4 to resume before the comparison, then explicitly prioritized resolving the protocol first so the monitor can be connected. Task 4 therefore remains paused during this controlled comparison.

Laptop-only 500-asset condition completed against the same preserved Task 3 artifact:
- Engineering: median 0.90 ms, p95 11.40 ms; tolerance 1.14 ms.
- Photoreal: median 1.00 ms, p95 11.70 ms; tolerance 1.17 ms.
- Internal display 1920 x 1080 at 144 Hz, AC connected, Performance plan.
- Raw samples: `docs/metrics/display-protocol-stress/laptop.json`.

Outcome pending matching external-monitor condition. Earlier normal-load measurements remain historical evidence and are not paired with these stress measurements. All measurement processes have exited. Await user connecting the external monitor and confirming readiness; then run the matching external condition once and stop if either comparison exceeds tolerance.


## Stress protocol confirmed — 24 September 2026

Both 500-asset comparisons passed the replacement criterion:

| Look | Laptop p95 ms | External p95 ms | Absolute difference ms | Allowed ms |
|---|---:|---:|---:|---:|
| Engineering | 11.40 | 12.30 | 0.90 | 1.14 |
| Photoreal | 11.70 | 12.50 | 0.80 | 1.17 |

The artifact hash, browser, GPU, camera, viewport, warm-up/orbit duration, flags and power plan matched. Raw samples and before/after display/power records are in `docs/metrics/display-protocol-stress/{laptop,external}.json`; comparison is in `comparison.json`. This confirms the user's operational criterion on this reference setup, not universal invariance on arbitrary hardware.

Effective protocol: metrics use `--disable-gpu-vsync` and `--disable-frame-rate-limit`; frame-time median and p95 in milliseconds are primary, FPS derives from median frame time. Keep recording display count, resolutions, refresh rates, primary display and power. AC and Performance plan remain required. External monitor may stay connected. Screenshot flags and frozen screenshot baseline are unchanged. Earlier normal-scene FPS-ratio failure is superseded by this successful stress-p95 proof; historical results remain intact. Task 4 resumes.

## Internal review correction-loop ruling — 24 September 2026

Mostafa clarified during Task 5: reviewer disagreement means opposite verdicts on the same question. One pass and one correctable in-scope finding is a correction loop: fix and re-review without stopping. Stop if resolution needs an out-of-scope decision or would break another acceptance criterion. The earlier Task 5 pause was resolved by explicit approval to disable hidden-detail raycasting, verify both visibility transitions, complete selection checks, improve F-201 framing, rerun reviews, commit/push and continue to the Task 6 gate.

## Task 6 gate submission — 25 September 2026

Task 4 (`2726b90`) and Task 5 (`b208f23`) completed under non-gate cadence. Task 6 adds post/atmosphere, procedural night, animated flare/steam and a separate non-canonical dressing group; all frozen data remains unchanged. Internal verification and budgets pass; handback is `docs/handbacks/stageB-task-06.md`. Stop at the external Task 6 gate for Claude and Mostafa. Whole-image acceptance, density dressing and whether Tasks 5b/7 run remain Mostafa's decisions. No later task has started. The reviewer-disagreement clarification above remains effective.

## Task 6 correction and onward ruling — 25 September 2026

Mostafa reports both external reviewers approve Task 6 as direction, conditional on broader night illumination. Authorized correction: emissive platform/road lamps, cabin windows, red stack/flare warning lights, and warm process-pad pools using emissive meshes and non-shadow point lights; judge CAM-6 against mood-dusk.png within night budgets. Existing shadow lights remain unchanged. Dressing is frozen; density moves to Stage C.

The unspecified additional Task 5b types triggered a clarification pause. Mostafa's "Confirmed - proceed" resolves it as sphere-tank smoothing only; no additional builder-detail types are authorized. Task 7 is skipped. After the Task 6 correction and narrow Task 5b pass internal review/evidence, continue Task 8 and stop at its external gate. The new engineering baseline requires approval before replacement. Branch remains dual-look; push each completed task. Canonical data stays frozen.


## Task 8 gate candidate — 25 September 2026

Task 6 night correction completed and pushed as 3d2c575; narrow sphere-only Task 5b completed and pushed as 8729348. Task 7 is skipped; dressing is unchanged and density deferred to Stage C. Task 8 adds shared card styling, selection rims, fixed-screen-size labels, separate presentation tours and a 60-second idle attract mode. All 228 selection checks, complete tours in both looks, reveal, interruption, attract cycle and repeated look/state continuity pass. Tests and budgets pass; canonical data remains frozen.

Current gate: stop for both external Task 8 approvals. Candidate screenshots are under docs/handbacks/evidence/stageB-task-08/engineering-candidate; the approved tests/visual/baseline is unchanged. Only promote the candidate after approval. Task 9 has not started; no main changes. See docs/handbacks/stageB-task-08.md for all evidence and completed-task commits.


## Task 8 approval and Task 9 recording ruling — 25 September 2026

Mostafa reports Task 8 approved by both external reviewers and authorizes promotion of the exact engineering candidate from 952d004. All twelve PNGs (six cameras, default and selected) are copied byte-for-byte into tests/visual/baseline/engineering; approval provenance is in capture.json. Historical candidate evidence remains unchanged. Regression now covers CAM-6 too, retaining the same 0.5 percent tolerance and unchanged cameras.

From Task 9 onward, review motion videos must use 60 fps frame-by-frame capture stitched with ffmpeg CRF 18, or canvas captureStream/MediaRecorder at a high fixed bitrate. Playwright recorder output is interaction evidence only, not visual-review evidence. Task 8 recordings are historical and are not retroactively relabeled.

Task 9 is authorized: release dual-look to main, finalize README/ASSETS/REPO_FACTS, verify Chrome, Edge and one physical phone, and stop at its gate. Stage C is not authorized before Task 9 approval. Preflight found the current main deployment removes /next/, whose retention is explicitly a reviewer decision in the plan. Chrome and Edge are installed; no phone connector or ADB command/default Android SDK is available. Phone verification arrangements and /next/ disposition need a ruling before release work continues.


## Task 9 resume ruling — 25 September 2026

Mostafa resolves both preflight decisions: keep /next/ as dual-look’s Stage C preview while main serves the release. Every Pages publication must assemble both branch builds. Mostafa will perform the physical Samsung A35 / Chrome check after the merge and desktop live verification are reported. Continue through merge/deployment and Chrome/Edge verification, then wait for that phone result before closing Task 9. Earlier preflight pause is resolved. No phone result is inferred from desktop emulation.

Task 8 baseline promotion is committed as 78b8731. Current phone behavior has no automatic quality downgrade; desktop look presets are retained, DPR capped at 1.5. Any necessary visual quality change remains subject to the agreed scope/rulings.

Stage C queue only (not started): Task 1 is motion and continuous time of day; Task 2 is the vertical slice. Task 1 includes blinking aviation lights, procedural pickup/tanker paths avoiding footprints, rotating fans, wind/steam/day dust, gate flag, and process pulses (the explicitly shared both-look exception). No people or birds. Presentation data has a master motion switch. Continuous photoreal sun/sky/environment/fog/lamps expose a slider and roughly four-minute attract day, paused by input. Budgets remain, with night p95 <=25 ms; evidence is six cameras at day/dusk/night and a 60 fps CAM-6 full-cycle review under the new recording rule. Stop at its gate. Stage C may not start until Task 9 approval.


## Task 9 live release; awaiting phone — 25 September 2026

Main released at a6bf9bcae3fc36fa114ad36a463cc1d8faccc673 (merge of dual-look 0ac3443); Pages deployment 36088650349 succeeded. Root serves main and /next/ serves dual-look; both expose deploy.json commit provenance. Live Chrome 153.0.8010.53 and Edge 153.0.4234.48 pass desktop functional and six-camera captures in engineering/day/night, with no application/shader errors. Engineering first transfer is 2,066,238 bytes on Pages and no photoreal packs are requested before switching. Pinned Chrome 146 local regression remains 0% across all 12 images, and budgets pass. Canonical data unchanged.

Wait for Mostafa's actual Samsung A35 / Chrome report before Task 9 closure/approval. Stage C remains queued. Release evidence and phone-pending handback live on dual-look; main was pushed once for this release. Automatic preview publication preserves the main release. No further implementation is authorized across the Task 9 gate.


## Task 9 closing correction and mobile ruling — 25 September 2026

Mostafa reports the Samsung A35 / Chrome phone check passed and both reviewers approve Task 9, subject to the closing loading correction. The earlier phone-pending stop is resolved. Authorized correction: actual received asset bytes / known build-time sizes as a percentage and short label for the initial engineering GLB and first photoreal environment/material download, remaining visible through the rendered frame. Elapsed time is displayed on mobile as well. Mostafa additionally authorizes optimizing the mobile UI. Corrected mobile appearance and physical-device timing are deferred to the next gate; no numerical phone timings have been reported and desktop emulation is not phone evidence.

Commit/push/publish the correction to main, then Task 9 closes under the explicit ruling (this authorizes the additional main publication). Continue Stage C Task 1 on dual-look and publish /next/, stopping at its gate. The existing main release remains live while this correction is under verification.


## Task 9 complete; Stage C Task 1 preflight — 25 September 2026

The closing correction is `d9fdb3a`, main merge `83e54ba`; Pages run 36127009075 succeeded and installed Chrome/Edge live checks pass. Root remains main, /next/ remains dual-look. Task 9 is complete under the latest explicit approval. Current branch dual-look includes the released merge. No Stage C runtime changes have been made.

Stage C preflight found two parallel 8 m roads with no end connectors, confirmed in the site-context generator and runtime Site; existing SiteDressing adds pipe bundles, not roads. A continuous vehicle circuit requires additional presentation road geometry or an explicitly accepted alternative vehicle pattern. A tentative west connector at canonical x=-17 would overlap crude tank footprints by 1 m; x=-21 clears those footprints by 3 m. Proposed end connectors: x=-21 and x=257, y=-37 through 135 (canonical coordinate convention), 8 m wide, each 172 m. This is a proposal, not approved work. Other context/turning clearances remain to validate if authorized. See stageC-task-01 hand-back. Pause for Mostafa's road-layout ruling; no independent Stage C work around the question. Corrected physical phone timing/layout remains deferred to the next gate.


## Stage C Task 1 road ruling and execution - 25 September 2026

Mostafa approved two photoreal-only, non-canonical end road connectors in site context, matching source materials and clear of equipment. The earlier road question is resolved. Connectors at runtime x=-21 and 257 join z=37 to -135, 8 m wide. Vehicle centre line on the far existing road is offset 1.8 m outward to avoid the CT-404 footprint; road geometry there is unchanged. Dense swept-body, oriented rectangle/equipment and cabin/fence checks pass. This is presentation data, not canonical plant truth. Main remains 83e54ba; work/publishing stays on dual-look /next/.

The animated verification bridge must leave the R3F clock running when animate=1. Previously it froze that clock unconditionally, so the initial Stage C motion-r1 metrics are superseded, not acceptance evidence. Static screenshots keep the prior frozen clock and flags. Corrected animated runs retain uncapped metrics flags and display/power JSON.


## Stage C Task 1 local acceptance - 25 September 2026

Implementation, swept-body tests, 24 Vitest / 31 pytest / 7 visual-tool tests, browser motion/history/idle/tour/mobile checks and canonical verification pass. All 12 engineering regression frames have 0.0000% differing pixels. Final uncapped p95: engineering 2.0 ms, photoreal day 3.3 ms, engineering 500: 10.5 ms, night 4.4 ms. Night draw calls 170.2 (<200); all budgets pass. Both internal source reviews pass after in-scope corrections. Review video uses high-bitrate canvas capture and a CRF18 60fps MP4; its VFR source timing and CFR conversion are disclosed in the hand-back. Main remains 83e54ba; publish only dual-look /next/ then stop for Stage C Task 1 external reviews and Mostafa's deferred corrected phone timing/layout report.


## Stage C Task 1 gate hand-back - 25 September 2026

Implementation `d4657c0` published by successful Pages run 36133916881. Installed Chrome and Edge live checks PASS: root remains main `83e54ba`, /next/ serves the motion/time-of-day candidate. Live slider/presets, motion advance/master freeze and emulated mobile layouts pass; evidence under stageC-task-01/live. Follow-up commit records evidence only, with unchanged application source. Stop at the Stage C Task 1 gate for both external reviews, including Mostafa's deferred corrected Samsung A35 timing/layout report. No Stage C Task 2 work started. No active technical blocker.


## Stage C Task 1 approved; Task 2 preflight - 25 September 2026

Mostafa approves Task 1 on behalf of both external reviewers. Physical Samsung A35 / Chrome report: first-load loader 2 seconds, first photoreal switch 2 seconds, mobile layout clean. The earlier external-review and phone-pending conditions are resolved. See stageC-task-01/phone-report.json.

Mostafa authorizes Stage C Task 2, the vertical slice, stopping at its gate. Repository plans, facts and retrievable earlier discussion name the queued slice but do not supply a recoverable detailed scope or acceptance definition. Do not invent the target area, asset/detail additions, interactions or a canonical-data exception. Task 2 is at preflight, with no runtime/canonical changes; see stageC-task-02.md for the missing brief and resume condition. Task 1 implementation remains d4657c0, latest published evidence commit 6ea0b8c; main remains83e54ba.


## 2026-09-25 — Stage C Task 2 brief resolves preflight stop

Mostafa supplied and authorized the vertical slice brief, saved verbatim first at docs/superpowers/plans/2026-09-25-stage-c-task-02-vertical-slice.md. The earlier missing-brief pause is resolved. Judgment is CAM-6 photoreal day only; canonical data and engineering baseline remain frozen. The task-specific CAM-6 limit is p95 <=25 ms, lazy assets <=60 MB. Other inherited regression checks remain. Work remains on dual-look, preview /next/ only; stop at the slice gate.

Candidate: 62 switchable/non-selectable procedural dressing modules; route fittings; optional Blender detail for 57 assets across all 22 types; per-material metre-scale grime and pad wear; restrained daylight/post/shadow adjustment. Six-camera before/after set and unaltered reference comparison are in docs/handbacks/evidence/stageC-task-02. CAM-6 day p95 3.7/4.3/3.7 ms, conservative lazy inventory 29,647,667 bytes. Engineering captures: all 12 exactly match the approved baseline; 32 canonical hashes unchanged. External slice judgment is pending.

Task 2 gate candidate published from `4a1646979ff768cef8e1ec1752b22a16c04b9474`; Pages run 36145021604 succeeded. Installed Chrome and Edge live checks pass, root main remains `83e54ba7cbb42d6d7cff1dbeb8c90457bbc2d494`. All 342 selection checks and 22-type generator checks pass. Both internal reviewers give final local PASS. Awaiting Mostafa and Claude at the slice gate; do not begin a later task. Publication-evidence follow-up is documentation only.
