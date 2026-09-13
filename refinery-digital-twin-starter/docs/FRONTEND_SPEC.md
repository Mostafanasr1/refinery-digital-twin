# Frontend Specification

## Stack
Recommended: React, TypeScript, Vite, Three.js, React Three Fiber, Drei where useful, Zustand or similar lightweight state store.

## Layout
Full-screen 3D canvas. Sparse HUD:
- top-left: demo mode/title
- top-right: layer controls
- bottom-left: process/scenario actions
- contextual equipment card near an edge
- optional sequence progress/timeline

## Core services
### AssetRegistry
Maps `asset_id <-> model_ref <-> scene object`.

### TelemetryStore
Stores current values and status.

### SelectionStore
Tracks hovered asset, selected asset, selected layer, active process path, active scenario.

### VisualizationController
Generic methods:
- `highlightAsset(assetId, style)`
- `dimNonSelectedAssets(assetIds)`
- `resetVisualState()`
- `showProcessPath(pathId)`
- `setLayer(layerId)`

### ScenarioEngine
Reads scenario definitions and applies timed generic actions.

## Hover
Subtle outline/emissive response plus tag/name tooltip. Avoid large cards on hover.

## Click
Select asset, open data-driven card, optional camera focus, show telemetry and actions.

## Process trace
Driven entirely from `ProcessPath`: ordered highlights, animated route, timed labels, optional camera sequence, cancel/reset.

## Data layers
Each layer is a reusable visualization transform. Initial layers: health, temperature, energy, sensors.

## Scenario actions
Generic action types: set_asset_status, set_metric, highlight_asset, highlight_path, set_layer, show_alert, camera_focus, wait, clear_alert.

## Offline
Must run locally without network access.

## Visual direction
Dark neutral environment, believable industrial forms, restrained cyan holographic edges, stronger accents only for process paths and alerts.
