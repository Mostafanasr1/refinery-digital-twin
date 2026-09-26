# Stage C Task 5 — hero stills

State: all three final renders and verification complete. Internal specification and code-quality reviewers both give final PASS with no outstanding blocker. Stopped at the external Task 5 gate.

## Scope and release

Task 3 correction and Task 4 were externally approved. Engineering baselines promoted in order at `d57b027` and `ae2a048`. Flow correction `7cf6bb6` is merged to main and published; root verified in installed Chrome and Edge. `/next/` remains on dual-look. Release evidence committed at `cd67ef8`. Mostafa's new physical-phone check is pending, not claimed as a pass.

Task 5 is offline only: CAM-6 day, CAM-6 night, CAM-2 day, Cycles 3840 x 2160, denoised, from one Blender scene on the reference laptop. No canonical changes; 57 assets, 6 units and 32 frozen files remain.

## Implementation and source fidelity

A separate offline Vite build exposes the current scene to an exporter. It does not instrument the production build. Standard source textures are retained; KTX2 textures are decompressed at their existing resolution. Runtime-only shader attributes are excluded from the interchange mesh. The import audits every source mesh's instance and triangle count, checks GPU-instance translations, and restores the per-instance rock/scrub colour that Blender's importer otherwise drops.

Final import: 45 source mesh nodes, 2,013 imported mesh instances, 1,975,047 triangles; 1,550 instance tints restored. Optional plant detail, sourced dressing, terrain and lamps are included. Source export has no page/shader errors. The current adapted Sinai DEM geometry is retained. Terrain normal maps are decoded as directional normal data, with matching plane-UV/world-XY basis.

One packed `docs/stills/stageC-hero-scene.blend` is loaded for each frame. Approved camera position/target and 42-degree vertical FOV are retained. Geometry and source assets are shared across all three frames; only the camera and recorded presentation lighting preset change. Each render record carries the same scene SHA-256, output SHA-256, actual device/settings, render time and load-plus-render time.

## Offline adaptations and limits

These are rendered slide images, not runtime screenshots. Cycles materials approximate the browser's procedural slope/height blend and wear functions. AgX replaces ACES. The sourced HDR supplies daylight and a restrained 0.055 night fill; the captured original procedural dusk texture supplies the night camera sky. Existing point/spot lights use eight times the nominal `4π/683` conversion, with night exposure +1.3 stops, to keep equipment readable. This is an offline visual calibration, not engineering photometry. No new fixture locations are added.

Physical haze/steam and emissive flame geometry replace billboards. Motion is frozen at 1.5 seconds, with aviation lights on. Day dust billboards are omitted; atmospheric haze remains. Deferred far-hill/slope-tiling limitations remain. No claim of reference-level realism; reviewers judge the images.

## Verification and evidence

Full `npm run check` passes (31 Vitest, 31 pytest, 7 visual tooling tests; lint, validation, build). Canonical verifier passes, all 32 files unchanged. Actual export/import/render execution validates the offline scripts. Engineering runtime source and approved baseline do not change in Task 5. Final output, scene-hash and app-exclusion checks PASS: three 3840 x 2160 16-bit PNGs, correct camera/preset identities, Cycles/OptiX on RTX 3050, OpenImageDenoise, matching source/scene/output hashes, and no stills, Blender scene or offline export bridge in app/dist. Runtime metrics were not rerun for these offline-only changes; the Task 4 correction evidence covers both flow styles.

Evidence is under `docs/handbacks/evidence/stageC-task-05/`. Source and derivative credits are retained in ASSETS.md and docs/stills/README.md, including the CC BY models' attribution for slide use. No new external assets were acquired.

## Files touched

Offline scripts under `scripts/stills/`; packed scene, images, frame JSON and attribution/reproduction under `docs/stills/`; this hand-back and evidence; ASSETS.md and REPO_FACTS.md record the offline deliverables. Nothing in app/src, canonical data, runtime assets, baseline PNGs or deployment configuration is changed by Task 5.

## Next gate

Delivery and both internal reviews are complete. External Task 5 approval remains required. No later task is authorized or started.

## Final render timings

Measured around `bpy.ops.render.render(write_still=True)`, including render preparation, denoising and PNG writing; scene loading is reported separately. These are actual laptop timings, not estimates. Blender 5.2.1 LTS, RTX 3050 Laptop GPU / OptiX, 256 maximum adaptive samples, noise threshold 0.01, OpenImageDenoise. All three use scene SHA-256 `ca73bc2c483104ec6e02994f9e3b21b6ebab6f1a99f47deb19ae0a7dda27e372`.

| Frame | Render seconds | Load + render seconds | Image bytes |
|---|---:|---:|---:|
| CAM-6 day | 377.67 | 378.52 | 37,373,118 |
| CAM-6 night | 201.83 | 202.84 | 36,524,335 |
| CAM-2 day | 502.06 | 502.90 | 37,302,223 |

All three final images visually inspected using lossless downscaled inspection copies because the image tool could not accept the original large 16-bit PNG payload. Original files remain unmodified and their dimensions, bit depth and hashes are verified. No missing scene elements or failed render observed. Final inspection is technical; visual acceptance belongs to the external reviewers. Source-transfer review findings corrected: normal-map decoding, export error assertions, instance-colour retention, and frame identity/backend/source-commit assertions.

Gallery: [hero stills](../stills/index.html); path: `docs/stills/index.html`. Per-frame JSON, packed scene, source-input hashes, credits and reproduction commands are beside it.

Final reference-state capture after the render queue: AC connected, Performance plan, RTX 3050 Laptop GPU; display configuration retained in evidence. Both internal reviewers give final PASS. All render jobs finished; no background render remains. New physical-phone release report and external Task 5 visual approval remain pending.
