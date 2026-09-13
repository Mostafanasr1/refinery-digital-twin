# Codex Task Sequence

## Phase 0 — Repository foundation
Initialize TypeScript frontend, Three.js/R3F, Python pipeline environment, schema validation, lint/test/build scripts, normalized-data loader interface.
Acceptance: frontend/tests/build run; no hardcoded equipment values in UI.

## Phase 1 — Canonical schemas and synthetic data
Create schemas and a compact fictional refinery.
Acceptance: all data validates; all references resolve; all interactive assets have model bindings.

## Phase 2 — Normalization pipeline
Build adapters from source equipment/connections/telemetry/process/scenario files into validated normalized output.
Acceptance: deterministic output; readable validation errors; runtime reads only normalized data.

## Phase 3 — Primitive 3D runtime
Use primitives before refined assets. Create tank/column/pump/furnace/rack proxies.
Acceptance: all scene objects map to asset IDs; hover/click/cards are data-driven.

## Phase 4 — Process trace
Implement process selection, non-path dimming, animated route, ordered equipment highlighting.
Acceptance: no hardcoded asset sequence in component code.

## Phase 5 — Data layers
Implement health, temperature, energy, sensors through a generic layer API.

## Phase 6 — Scenario engine
Implement generic timed scenario actions and the pump-trip/recovery scenario.
Acceptance: scenario comes from JSON and resets cleanly.

## Phase 7 — Blender procedural scene
Create Blender generators and build/export scripts.
Acceptance: generated scene uses normalized assets, stable names, GLB loads without runtime code changes.

## Phase 8 — Visual refinement
Improve materials, atmosphere, lighting, holographic treatment, camera, transitions, HUD motion.
Acceptance: wow-first, sparse text, readable refinery.

## Phase 9 — Exhibition packaging
Offline bundle, kiosk mode, attract loop, reset/recovery behavior, performance safeguards.
Acceptance: no network required; safe idle loop; rapid restart.
