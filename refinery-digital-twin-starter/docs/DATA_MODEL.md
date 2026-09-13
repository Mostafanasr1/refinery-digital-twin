# Canonical Data Model

## Asset
```json
{
  "asset_id": "asset_t201",
  "tag": "T-201",
  "name": "Atmospheric Distillation Column",
  "type": "column",
  "facility_id": "demo_refinery",
  "area_id": "area_200",
  "unit_id": "unit_cdu",
  "service": "crude_fractionation",
  "status": "online",
  "model_ref": "T-201",
  "position": {"x": 120.0, "y": 40.0, "z": 0.0},
  "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
  "dimensions": {"height": 42.0, "diameter": 4.8}
}
```

## Connection
```json
{
  "connection_id": "conn_001",
  "from_asset_id": "asset_p101a",
  "to_asset_id": "asset_e201",
  "line_tag": "10-P-1001",
  "service": "crude",
  "flow_direction": "forward",
  "visual_path_ref": "path_conn_001"
}
```

## TelemetryPoint
```json
{
  "point_id": "tp_t201_temp_bottom",
  "asset_id": "asset_t201",
  "parameter": "temperature_bottom",
  "value": 356,
  "unit": "degC",
  "status": "normal",
  "quality": "good",
  "timestamp": "synthetic"
}
```

## ProcessPath
```json
{
  "process_path_id": "path_crude_to_products",
  "name": "Crude to Products",
  "ordered_asset_ids": ["asset_tk101", "asset_p101a", "asset_e201", "asset_f201", "asset_t201"],
  "connection_ids": ["conn_001", "conn_002", "conn_003", "conn_004"]
}
```

## Scenario
```json
{
  "scenario_id": "scenario_p101_trip",
  "name": "Crude Transfer Pump Trip",
  "trigger_asset_id": "asset_p101a",
  "steps": [
    {"at_seconds": 0, "actions": [{"type": "set_asset_status", "asset_id": "asset_p101a", "value": "trip"}]},
    {"at_seconds": 1, "actions": [{"type": "set_metric", "asset_id": "asset_t201", "metric": "feed_rate", "value": 90}]}
  ]
}
```

## DocumentReference
```json
{
  "document_id": "doc_t201_datasheet",
  "asset_id": "asset_t201",
  "document_type": "datasheet",
  "title": "T-201 Equipment Datasheet",
  "source_ref": "synthetic://documents/t201-datasheet"
}
```

## ModelBinding
```json
{
  "asset_id": "asset_t201",
  "model_ref": "T-201",
  "lod_refs": {"0": "T-201_LOD0", "1": "T-201_LOD1", "2": "T-201_LOD2"}
}
```

## Rules
- `asset_id` is the system identifier.
- `tag` is the engineering-facing label.
- `model_ref` is the 3D lookup key.
- Never use tag text as the primary database key.
- Keep telemetry separate from static asset definition.
- Keep visual state separate from engineering state.
