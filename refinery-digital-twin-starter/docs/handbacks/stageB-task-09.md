# Stage B Task 09 — release

25 September 2026. In progress; Task 9 is not closed. Mostafa authorized merging dual-look into main and desktop verification, then a pause for his physical Samsung A35 / Chrome result. Stage C remains queued.

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
