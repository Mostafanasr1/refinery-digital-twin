# MASTER PROMPT — Refinery Digital Twin Demo

You are building a production-quality proof-of-concept for an interactive refinery digital twin intended for a high-level tradeshow pitch.

## Strategic context
The current build has no real refinery data. Use synthetic but engineering-plausible data and a fictional refinery.

The commercial goal is to win a contract for a real implementation. If that happens, real engineering documentation, asset data, process data, and potentially 3D plant exports will become available.

Therefore the demo must be designed so real data can replace synthetic data without forcing a redesign of the runtime, interaction model, or 3D architecture.

## Product proposition
A navigable 3D refinery acting as a visual intelligence layer over engineering assets, process relationships, operating data, scenarios, documents, and later AI.

## Required demo experience
1. Cinematic reveal of the refinery.
2. Explore mode with hover/click equipment cards.
3. Data-driven `Crude to Products` process trace.
4. Toggleable layers: health, temperature, energy, emissions, sensors.
5. Pump-trip scenario with downstream impact and standby recovery.

## Architecture
Use Blender for 3D authoring and procedural generation; Python for normalization and validation; GLB for runtime 3D exchange; React + Three.js / React Three Fiber for the interactive runtime; JSON for initial normalized data.

Raw/synthetic source -> ingestion adapters -> canonical normalized model -> runtime.
The app must never depend directly on raw source files.

## Fictional refinery scope
Create a compact but visually rich refinery with crude storage, crude pumps, heat exchanger train, fired heater, atmospheric distillation column, overhead vessel, product treatment, utilities, product storage, pipe racks, flare, roads/buildings/structures.

Target roughly 30–50 major visible equipment assets, 12–15 strongly interactive assets, and 3–5 animated process paths.

## Deliverables
Build sequentially:
1. repository foundation
2. schemas and synthetic data
3. normalization pipeline
4. minimal runtime shell
5. primitive/mock 3D refinery
6. hover/click interaction
7. process trace
8. data layers
9. scenario engine
10. Blender procedural build/export pipeline
11. visual refinement and optimization
12. offline exhibition package

## Acceptance principle
The demo succeeds if it feels visually premium, keeps the 3D plant central, is data-driven, permits synthetic data replacement, and does not need a major rewrite when real plant data arrives.

Start by reading `AGENTS.md` and all files under `docs/`.
