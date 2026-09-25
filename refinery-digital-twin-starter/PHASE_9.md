# Phase 9 equipment silhouette expansion

## Scope and implementation

Stage A expands the canonical equipment catalog from 10 to 22 types and
the synthetic refinery from 43 to 57 assets across six units. The new equipment
includes LPG spheres SP-501/SP-502 and bullets BT-501/BT-502, floating-roof tank
TK-103, HDS equipment F-501, C-501, R-501, EA-501 and V-501, and utilities
STK-401, CT-404, SS-401 and CR-401.

`pipeline/catalog.py` supplies the silhouette descriptions and sample dimensions.
Catalog/schema parity and runtime proxy/schema parity are checked by tests.
Blender's `Kit` supplies local dimensions, materials and consistently named mesh
primitives; `BUILDERS` maps every catalog type to a procedural builder. The
generator check enforces registry/catalog parity and exercises all 22 types at
detail levels 0 and 1, checking names, materials and geometry bounds.

The existing flare treatment is preserved under the Task 03 flare ruling. The
floating-roof tank uses open lathe profiles so its deck remains visible below
the rim at both detail levels. The overview reset position is `[250, 140, 200]`.

## Verification and evidence

The generated `data/normalized/models/build-report.json` records 57 assets,
167 mesh objects and 253,844 triangles at detail level 1. These are source-model
counts, not rendered frame statistics. The implementation validation reports
12 Vitest tests, 18 pytest tests and all 22 generators at two detail levels.

The [Task 08 handback](docs/handbacks/stageA-task-08.md) is the authoritative
record for the fresh full check, production verification and browser evidence.
Its evidence set includes `default-view.png`, `SP-501.png`, `R-501.png` and
`CT-404.png`; use the handback for their paths and verification status.

## Run and rebuild

```text
npm.cmd run build:models
npm.cmd run check:generators
npm.cmd run check
npm.cmd run test:production
npm.cmd run dev
```

The model build saves `blender/assets/refinery.blend` and
`data/normalized/models/refinery.glb`. Use `BLENDER_BIN` to select another
Blender installation. The separate detailed module preview remains available
through `npm.cmd run build:preview`.

## Review status and limits

The user's explicit overnight override removes the Task 08 gate for this run:
push only `codex/stage-a`, then branch for the Stage B0 dual-look work. This does
not authorize a main-branch deployment. A combined morning review of A08 and B0
is pending; this document does not record engineering approval or an update to
a live plant.

The equipment remains synthetic procedural approximation. The new assets have
no new process routes or scenarios, and runtime fallback proxies remain coarse.
The larger catalog does not certify engineering accuracy or complete offline/
kiosk packaging, which the earlier phase plan also called Phase 9.
