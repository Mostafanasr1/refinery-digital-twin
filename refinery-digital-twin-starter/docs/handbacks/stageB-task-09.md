# Stage B Task 09 — release

25 September 2026. Desktop release complete; Task 9 remains open for the physical-phone result and gate. Mostafa authorized merging dual-look into main and desktop verification, then a pause for his physical Samsung A35 / Chrome result. Stage C remains queued.

## Approved prerequisites and rulings

Task 8 approved by both reviewers. Commit 78b8731 promotes all twelve engineering PNGs byte-for-byte from the approved 952d004 candidate, with provenance. CAM-6 now participates in regression; cameras and the 0.5 percent threshold are unchanged.

Keep /next/: root is built from main; /next/ is built from dual-look. Both publications now assemble both branch builds and expose deploy.json provenance. This resolves the preflight pause. The phone result is explicitly deferred until after the merge and desktop live report; no desktop emulation will be presented as physical-device evidence.

Review videos from Task 9 must use 60 fps frame capture + ffmpeg CRF 18, or high-fixed-bitrate canvas MediaRecorder. Playwright video is interaction-only. This release handback uses live screenshots; historical Task 8 videos remain unchanged.

## Changes

- Pages workflow preserves release and preview independently on every publication and records each checked-out branch SHA.
- README explains both looks, day/night, geometry, process/scenario controls, tours, setup, rebuilding models/context/materials, capture/metrics/regression commands and release behavior.
- ASSETS distinguishes current sizes from historical inventory, CC0 external art, original procedural work, licensed software and review-only references. No art or runtime dependency added.
- REPO_FACTS records approvals, release rulings, actual phone behavior and Stage C queue (not started).
- Release browser verifier checks deployed provenance, lazy engineering load, six cameras in engineering/day/night, shared selection/camera/card identity and proxy mode, plus /next/.

## Local verification

Full check suite passes: 21 Vitest, 31 pytest, seven visual-tool tests, lint, normalized-data validation, TypeScript and production build. Production server asset/MIME/missing-file test passes. All 32 canonical files unchanged. All twelve engineering baseline captures pass at 0.0000 percent difference.

Both internal reviewers approve pre-merge scope, workflow and documentation. Metrics and desktop deployment results are appended when complete; unrun checks are not passes.

## Phone acceptance pending

Device: Mostafa's Samsung A35, Chrome. After release, check both looks and night; select equipment in scene/register and compare cards; try orbit/zoom, process path, a scenario and the tour; report loading problems, inaccessible controls, stalls or crashes. Portrait and landscape observations are useful. No automatic mobile quality reduction currently exists; DPR is capped at 1.5 and the same presets apply. Do not close Task 9 until the actual result is recorded.

## Files touched

.github/workflows/pages.yml (git root), README.md, ASSETS.md, docs/REPO_FACTS.md, tests/visual/environment-metrics.mjs, tests/visual/release-check.mjs, and Task 09 evidence/metrics/handback. No canonical or runtime scene changes. Baseline promotion was separately authorized and committed as 78b8731.

## Release budgets

# Task 09 rerun

| Look | Stress assets | Draw calls | Triangles | Median ms | p95 ms | Derived FPS | Initial bytes | Budget |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| engineering | normal | 47.0 | 492956 | 0.80 | 1.40 | 1250.0 | 8834446 | PASS |
| photoreal | normal | 128.0 | 1456471 | 2.00 | 3.00 | 500.0 | 28200538 | PASS |
| engineering | 500 | 57.3 | 4026813 | 1.30 | 10.80 | 769.2 | 8834446 | PASS |
| photoreal-night | normal | 153.0 | 1812619 | 2.80 | 4.00 | 357.1 | 28200538 | PASS |

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

Lazy photoreal asset bytes remain 21,417,040 (<40,000,000). Initial engineering download is 8,834,446 (<13,200,115). Measurements ran alone with the approved uncapped protocol, recorded displays and AC Performance power.


## Merge and live desktop verification

Released merge commit: a6bf9bcae3fc36fa114ad36a463cc1d8faccc673. Release preparation: 0ac3443. Main deployment succeeded: https://github.com/Mostafanasr1/refinery-digital-twin/actions/runs/36088650349.

Live release: https://mostafanasr1.github.io/refinery-digital-twin/
Preview retained: https://mostafanasr1.github.io/refinery-digital-twin/next/

Installed Google Chrome 153.0.8010.53 and Microsoft Edge 153.0.4234.48 both PASS on the reference laptop (RTX 3050 / D3D11). These live functional/capture runs are separate from the pinned Chrome 146 baseline and budget runs; the approved measurement protocol was not changed.

Each browser verified root provenance at the merge SHA and preview provenance at 0ac344363ae37c7f8dd7a2e933ef1ac31d9c280a; 57 assets/six units; six cameras in engineering, photoreal day and photoreal night; selection/card/camera/asset identity continuity; proxy mode; and engineering/photoreal at /next/. All 38 live screenshots are retained. Both recorded zero application/shader errors; missing favicon warnings are separately recorded.

Live engineering transfer before first interaction was 2,066,238 bytes in Chrome and 2,066,238 in Edge (compressed Pages transfer). Neither requested environment/material/detail packs until switching to Photoreal. This wire-size result is distinct from the local budget measurement.

README and ASSETS updates are in the released merge. Final deployment evidence and these current-state notes are committed on dual-look, preserving the single authorized main release push. Evidence-only preview updates do not change the main release.

## Historical desktop handoff (superseded by closing ruling below)

Desktop release work complete. Await Mostafa's physical Samsung A35 / Chrome result before Task 9 closure and external gate approval. Stage C is not started. No claim of phone compatibility or phone performance is made before that test.

[Live screenshots and evidence gallery](evidence/stageB-task-09/review.html).


## Closing correction — loading progress and mobile layout

Mostafa reports the Samsung A35 / Chrome phone check passed and Task 9 approved by both reviewers. Later ruling authorizes this closing correction, publication to main and continuation into Stage C Task 1. Corrected phone layout and physical-device loading timings will be reviewed at the next gate; no numeric phone timings were supplied.

Changes: build-time sizes drive byte progress for the 7,263,344-byte engineering GLB and 21,156,883 bytes of first-use photoreal environment, material/transcoder and hero detail resources. These are decoded response-body bytes against original file sizes, not compressed wire transfer. Downloads are streamed once, then fed to the existing Three loaders through temporary blob URLs; response copies are released after draw. At 100% the label becomes Preparing scene; the overlay clears after the completed scene/post frame and the next RAF. Elapsed seconds remain visible on both mobile and desktop. Warm look switching reuses decoded resources without another download indicator. Error feedback covers failed files, size mismatch, scene errors and WebGL context failure. The underlying UI is inert while loading.

Mobile: Equipment and Controls panels collapse by default, touch controls have larger targets, the selected card becomes a scrollable bottom panel, safe-area spacing and landscape rules keep controls accessible, and portrait FOV preserves horizontal scene coverage. Desktop camera settings and approved HUD are unchanged.

Presentation check: `node tests/visual/presentation-check.mjs --loading` adds assertions and captures for both loading moments on desktop and mobile viewports, warm request deduplication, 412x915 / 915x412 / 360x640 layouts, search/selection, geometry controls, page overflow, history cancellation and first photoreal from proxy geometry. `loading-mobile/timings.json` explicitly labels its artificial desktop throttle; it is not a phone measurement.

Verification: 21 Vitest, 31 pytest, seven visual-tool tests, lint/schema validation/production build PASS. Production server test PASS. Canonical hash: all 32 files unchanged. All twelve approved engineering camera captures: 0.0000% difference. Spec and quality reviewers completed correction loops and pass the implementation. No plan, canonical, equipment, material or environment-art changes.

Desktop screenshots: [loading and mobile evidence](evidence/stageB-task-09/loading-mobile/). Physical Samsung A35 timing and corrected layout remain pending Mostafa's next-gate review by explicit ruling; this no longer blocks publication or Stage C.


Closing-correction budget run (approved uncapped protocol; AC Performance, both displays recorded): engineering median 1.50 ms / p95 2.20 ms / 47 calls; photoreal day 2.30 / 3.30 / 128; engineering 500 assets 1.30 / 10.80 / 57; night 2.80 / 4.50 / 153. All PASS. Engineering initial bytes 8,846,144 against 13,200,115; lazy assets remain 21,417,040 against 40 MB. See `docs/metrics/stageB-task-09-loading-mobile.json` and `.md`. Simulated WebGL-unavailable check confirms a visible error and Reload rather than indefinite Preparing scene.


## Task 9 closed under Mostafa's ruling

Correction commit `d9fdb3a2185f24c0d458bfbc24b8bd58ba7335e5`; published main merge `83e54ba7cbb42d6d7cff1dbeb8c90457bbc2d494`. Pages run 36127009075 succeeded. Installed Chrome 153.0.8010.53 and Edge passed the live correction check: root provenance, both actual byte-loading phases through drawn completion, mobile panel search/selection and preserved /next/. Evidence: `loading-mobile/live/`. The manual Samsung A35 Chrome pass and both reviewer approvals were supplied by Mostafa. Corrected physical-phone layout/timing review is deferred to the Stage C Task 1 gate, as explicitly authorized. No further Task 9 blocker.
