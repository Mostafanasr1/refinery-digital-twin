# Blender
Contains reusable source assets and procedural generators backed by the canonical silhouette catalog in `pipeline/catalog.py`.

- `scripts/build_demo_refinery.py` builds the normalized plant, saves the source blend, exports the runtime GLB and writes its build report (`npm.cmd run build:models`).
- `scripts/build_preview.py` builds the separate detailed module preview (`npm.cmd run build:preview`).
- `scripts/check_generators.py` checks `BUILDERS` against the catalog and exercises all 22 types at two detail levels (`npm.cmd run check:generators`).

The Blender scene is an authoring/generated artifact, not the application database.

See [the pipeline](../docs/BLENDER_PIPELINE.md) and [Phase 9](../PHASE_9.md) for workflow, validation and limits.
