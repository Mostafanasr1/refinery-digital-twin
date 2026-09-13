# AGENTS.md

## Mission
Build a premium interactive refinery digital twin demonstration that is synthetic-first but real-data-ready.

## Non-negotiable rules
1. Do not hardcode demo data into UI components or 3D object logic.
2. Keep source data, normalized data, 3D geometry, telemetry, scenarios, and UI logic separate.
3. All runtime code consumes a canonical normalized data model.
4. Every addressable 3D asset must have `asset_id`, `tag`, `type`, `unit_id`, and `model_ref`.
5. Never depend on a specific engineering authoring format at runtime. PDMS/E3D/Smart3D/Navisworks/Excel are ingestion sources only.
6. Mark synthetic data clearly as synthetic.
7. Build generic capabilities, not one-off demo tricks.
   - Good: `highlightAsset(assetId)`, `traceProcess(pathId)`, `setLayer(layerId)`, `playScenario(scenarioId)`.
   - Bad: fixed T-201 animation logic or baked popup values.
8. Blender is an authoring/generation tool, not the preferred tradeshow runtime.
9. Runtime must support offline/local deployment.
10. Performance matters: use LOD, instancing, controlled material counts, optimized GLB.
11. Use deterministic naming; never rely on Blender defaults such as `Cube.001`.
12. Every synthetic source should have an obvious future real-source equivalent.

## Engineering credibility
The demo is not a certified engineering model. However, process topology should be plausible, equipment recognizable, spatial relationships believable, and telemetry internally consistent.

## UX principle
The refinery itself is the interface. HUD elements support the 3D scene rather than obscure it.

## Visual principle
Premium dark industrial aesthetic with restrained holographic/cyan data overlays. Avoid a generic sci-fi dashboard.

## Testing expectations
Test schema validation, normalization, asset lookup, process trace, scenario transitions, and model-binding coverage.
