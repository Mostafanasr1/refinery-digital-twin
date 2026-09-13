# Architecture

## System layers

```text
RAW SOURCES
  synthetic CSV/JSON now
  engineering/OT sources later
        |
        v
INGESTION ADAPTERS
        |
        v
CANONICAL NORMALIZED MODEL
        |
        +--> 3D asset mapping
        +--> telemetry/state engine
        +--> process topology
        +--> document references
        |
        v
INTERACTIVE RUNTIME
  React + Three.js
        |
        v
HUD / PROCESS / SCENARIOS / LAYERS
```

## Source adapters
Initial adapters: equipment CSV, line/connection CSV, telemetry JSON, scenarios JSON.

Future adapters may include equipment registers, line lists, instrument indexes, P&ID metadata, plot plans, coordinate lists, PDMS/E3D/Smart3D exports, Navisworks-derived geometry, historian, DCS/SCADA, CMMS/EAM, and document repositories.

## Canonical model
Primary entities: Facility, Area, Unit, Asset, Connection, ProcessPath, TelemetryPoint, Alarm, Scenario, DocumentReference, ModelBinding.

## 3D model architecture
Each addressable asset has a stable `asset_id`, one or more 3D nodes, an asset type, optional LODs, material grouping, and a metadata/model binding. The GLB is not the database.

## Runtime state
Separate static engineering model, current telemetry, scenario overrides, and UI visualization state.

Effective state:
```text
static asset definition
+ telemetry
+ scenario override
+ UI visualization state
```

## Offline first
Initial runtime: local static app + local GLB + local normalized JSON.
Future runtime: API-backed data, websocket telemetry, auth, enterprise deployment.

## Future AI layer
Do not place AI in the first critical path. Leave hooks for selected-asset Q&A, alarm context, document retrieval, process explanation, and historical comparisons. AI queries canonical data/documents, not arbitrary meshes.

## Performance targets
Smooth interaction on a modern exhibition GPU; optimized GLB; instancing; LOD; limited dynamic lights; controlled postprocessing.
