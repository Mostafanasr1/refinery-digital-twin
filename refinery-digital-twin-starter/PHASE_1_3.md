# Phases 1-3 completion

## Run

From this repository directory in PowerShell:

```powershell
npm.cmd run dev
```

Open http://localhost:5173. If already running, refresh the page.
Search the asset register, click equipment in the scene or register, drag to orbit,
right-drag to pan, scroll to zoom, and use Reset view to return to the overview.

```powershell
npm.cmd run normalize
npm.cmd run check
```

## Delivered

- Phase 1: 31 synthetic assets, four units, facility/area hierarchy, three process
  paths, telemetry, scenario definitions, document references, and model bindings.
- Phase 2: JSON collection adapters and CSV equipment/connection support; stable
  JSON output; staging validation before publication; useful schema/reference errors.
- Phase 3: reusable equipment proxies, static connection pipes, orbit/pan/zoom,
  hover highlighting, searchable selection, camera focus, and telemetry cards.

The frontend reads only data/normalized. Root dev/build scripts normalize first.
Engineering coordinates are metres with Z up; worldPosition maps to Three.js Y up.
All equipment descendants carry canonical asset identity. Ground and grid are
non-addressable scene context. Static connection geometry carries the source asset
identity. The model registry is independent of proxy geometry for future GLB binding.

## Main changes

- schemas/: asset dimensions/provenance, structured scenario steps, hierarchy,
  model binding and document schemas.
- data/synthetic/ and data/normalized/: source and canonical collections.
- pipeline/normalize.py and pipeline/validate.py: adapters and integrity validation.
- app/src/data/: loader and asset/model/scene registry.
- app/src/Scene.tsx: reusable proxies, static pipes and camera controls.
- app/src/main.tsx and style.css: explorer and contextual equipment details.
- tests/ and frontend test files: schema, references, deterministic normalization,
  invalid-input preservation, CSV ingestion, registry and loader tests.

## Validation

Full npm run check passed: ESLint, Ruff, six frontend tests, fourteen Python tests,
source/normalized validation, TypeScript and production build. Browser screenshots
verify the overview, selected-column card and camera orbit. Search returns the correct
asset and its telemetry values. No page errors were reported in the browser checks.

## Deliberate limits and decisions

The reference image is the eventual quality benchmark. This phase intentionally uses
primitive geometry. Detailed Blender assets, cinematic lighting, animated process
tracing, operational layers and scenario playback remain Phases 4-8. Scenario data
and process paths are validated definitions; the app does not claim playback yet.
Document source references identify synthetic records, not generated document files.
The first adapters accept the supplied JSON layout and equivalent CSV fields; nested
CSV cells use JSON. Real engineering mappings will need source-specific adapters.
No global state library is needed for the current interaction scope.

Vite reports a 1.23 MB initial JS chunk (346 KB gzip); performance refinement remains
scheduled. Runtime requires local HTTP and WebGL; no remote assets are fetched.
