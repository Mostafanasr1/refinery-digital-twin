# Refinery Digital Twin Demo

A future-proof, synthetic-first refinery visualization platform for a tradeshow pitch.

## Goal
Build a visually compelling interactive refinery digital twin using synthetic engineering and operating data today, while preserving a clean migration path to real engineering documents, asset registers, 3D plant models, historian data, DCS/SCADA sources, and other plant systems later.

## Core principle
**The demo must be a real product architecture populated with synthetic content, not a hardcoded visual mockup.**

## Recommended stack
- Blender: model authoring and procedural generation
- Python: source normalization and validation
- React + TypeScript + Three.js / React Three Fiber: interactive runtime
- GLB: runtime 3D exchange format
- JSON initially; API/database later

## Demo modes
1. Explore
2. Process Trace
3. Operations / Data Layers
4. Scenario Simulation

## Read first
1. `AGENTS.md`
2. `MASTER_PROMPT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_MODEL.md`
5. `docs/DEMO_STORYBOARD.md`
6. `docs/BLENDER_PIPELINE.md`
7. `docs/FRONTEND_SPEC.md`
8. `docs/CODEX_TASK_SEQUENCE.md`

## Phase 0 setup
See [PHASE_0.md](PHASE_0.md) for setup, commands, boundaries, and validation status.

## Current implementation
Phases 1-3 are implemented. See [PHASE_1_3.md](PHASE_1_3.md) for controls, commands, verification, and limits.

## Phases 4-7
Process tracing, layers, scenarios and Blender generation are implemented. See [PHASE_4_7.md](PHASE_4_7.md).

## Phase 8
The plant layout and presentation have been refined. See [PHASE_8.md](PHASE_8.md) for changes and measured verification.
