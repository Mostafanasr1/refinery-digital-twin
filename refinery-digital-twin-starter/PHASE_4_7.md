# Phases 4-7

## Use the application

Run `npm.cmd run dev` from the repository and open http://localhost:5173.
The default geometry is the generated Blender GLB. The Geometry selector also allows
comparison with the original primitives, using the same model bindings and controls.

- Process path: choose a path, then Play. The trace advances every two seconds,
  dims non-path assets, highlights the current equipment and animates route markers.
  Pause, replay and Clear / reset are available.
- Data layer: health, temperature, energy or sensors. Values come from normalized
  telemetry; the legend explains the scale and missing data is grey.
- Scenario: choose the pump-trip scenario, then Play. It trips the duty pump,
  reduces downstream feed, starts the standby pump, restores flow at seven seconds,
  and clears alerts. Select equipment to inspect effective values during playback.
  Clear / reset restores source telemetry, statuses, highlights and layer state.

## Rebuild

```powershell
npm.cmd run normalize
npm.cmd run build:models
npm.cmd run check
npm.cmd run build
```

Blender is discovered from BLENDER_BIN, PATH, or this workstation's D:/blender/blender.exe.
Set `$env:BLENDER_BIN = "path/to/blender.exe"` on another machine.
Normalization runs before model generation. Rebuild models after engineering changes.
The runtime serves local files only; it does not require Blender to be running.

## Artifacts and architecture

- blender/assets/refinery.blend: generated editable Blender source.
- data/normalized/models/refinery.glb: self-contained runtime model.
- data/normalized/models/build-report.json: generated model statistics.
- blender/generators/equipment.py: reusable tank, vessel/column, exchanger, pump,
  heater, rack, platform, stair and pipe-route generation.
- blender/scripts/build_demo_refinery.py: normalized-data scene assembly and export.
- app/src/data/operations.ts: pure trace evaluation, generic scenario actions,
  effective telemetry/status overrides and layer color mapping.
- app/src/Scene.tsx: model loading, binding, route animation and visualization.

Export: 31 asset bindings, 55 mesh objects including routes, 38,260 triangles,
five shared materials, approximately 2 MB GLB. Deterministic asset and mesh names,
canonical metadata and Z-up to Y-up export are validated. The runtime renders routes
from canonical connection data; the GLB's static routes remain available in Blender.

## Verification

Nine frontend tests and fifteen Python tests cover normalization, references,
registry, process order/completion, scenario loss/recovery/reset, missing layer values,
GLB binding coverage, transforms, naming, material count and self-contained resources.
Lint, TypeScript and production build pass. Browser evidence includes the Blender
overview, live process trace, temperature layer and recovered standby-pump card.

## Remaining work

Phase 8 visual refinement and Phase 9 exhibition packaging have not started.
This procedural model is more detailed than the Phase 3 proxies, but does not yet
match the reference image's photorealism. The current export uses normal interaction
detail; adaptive runtime LOD, cinematic lighting, textures and final optimization
remain later work. Vite still reports the approximately 1.29 MB initial JS chunk.
Scenario playback is synthetic demonstration logic, not a process simulator.
