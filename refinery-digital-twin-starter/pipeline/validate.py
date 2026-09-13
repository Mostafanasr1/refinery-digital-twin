"""Validate collection files against the supplied Draft 2020-12 schemas."""
import argparse
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
COLLECTIONS = {
    "assets": "asset", "connections": "connection", "telemetry": "telemetry",
    "process_paths": "process_path", "scenarios": "scenario",
    "model_bindings": "model_binding", "facilities": "facility", "areas": "area",
    "units": "unit", "documents": "document",
}


def validate_directory(directory: Path) -> list[str]:
    errors = []
    dataset = {}
    for collection, schema_name in COLLECTIONS.items():
        path = directory / f"{collection}.json"
        schema = json.loads((ROOT / "schemas" / f"{schema_name}.schema.json").read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator({"type": "array", "items": schema})
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        dataset[collection] = data
        for error in validator.iter_errors(data):
            location = "/".join(map(str, error.absolute_path))
            errors.append(f"{path.name}/{location}: {error.message}")
    if not errors:
        errors.extend(validate_references(dataset))
    return errors



def validate_references(data: dict) -> list[str]:
    errors = []
    keys = {"assets": "asset_id", "connections": "connection_id", "telemetry": "point_id",
            "process_paths": "process_path_id", "scenarios": "scenario_id",
            "model_bindings": "asset_id", "facilities": "facility_id", "areas": "area_id",
            "units": "unit_id", "documents": "document_id"}
    indexes = {}
    for collection, key in keys.items():
        indexes[collection] = {}
        for row in data[collection]:
            value = row[key]
            if value in indexes[collection]:
                errors.append(f"{collection}: duplicate {key} {value}")
            indexes[collection][value] = row

    def ref(collection, value, location):
        if value not in indexes[collection]:
            errors.append(f"{location}: unresolved {collection} reference {value}")

    for collection in ["assets", "areas", "units", "telemetry", "documents", "model_bindings"]:
        for row in data[collection]:
            for key, target in [("asset_id", "assets"), ("facility_id", "facilities"),
                                ("area_id", "areas"), ("unit_id", "units")]:
                if key in row and not (collection == "assets" and key == "asset_id"):
                    ref(target, row[key], collection)
    model_refs = set()
    for asset in data["assets"]:
        if asset["model_ref"] in model_refs:
            errors.append(f"assets: duplicate model_ref {asset['model_ref']}")
        model_refs.add(asset["model_ref"])
        binding = indexes["model_bindings"].get(asset["asset_id"])
        if not binding or binding["model_ref"] != asset["model_ref"] or binding["node_name"] != asset["model_ref"]:
            errors.append(f"assets/{asset['asset_id']}: missing or mismatched model binding")
        unit = indexes["units"].get(asset["unit_id"])
        if unit and unit["area_id"] != asset["area_id"]:
            errors.append(f"assets/{asset['asset_id']}: unit/area mismatch")
    for row in data["connections"]:
        ref("assets", row["from_asset_id"], row["connection_id"])
        ref("assets", row["to_asset_id"], row["connection_id"])
    for path in data["process_paths"]:
        ordered = path["ordered_asset_ids"]
        for value in ordered:
            ref("assets", value, path["process_path_id"])
        if len(path["connection_ids"]) != len(ordered) - 1:
            errors.append(f"{path['process_path_id']}: path must connect every adjacent asset")
        for i, value in enumerate(path["connection_ids"]):
            ref("connections", value, path["process_path_id"])
            conn = indexes["connections"].get(value)
            if conn and i + 1 < len(ordered):
                if (conn["from_asset_id"], conn["to_asset_id"]) != tuple(ordered[i:i+2]):
                    errors.append(f"{path['process_path_id']}: disconnected path at {value}")
    for scenario in data["scenarios"]:
        if "trigger_asset_id" in scenario:
            ref("assets", scenario["trigger_asset_id"], scenario["scenario_id"])
        previous = -1
        for step in scenario["steps"]:
            if step["at_seconds"] < previous:
                errors.append(f"{scenario['scenario_id']}: steps must be time ordered")
            previous = step["at_seconds"]
            for action in step["actions"]:
                if "asset_id" in action:
                    ref("assets", action["asset_id"], scenario["scenario_id"])
                if "path_id" in action:
                    ref("process_paths", action["path_id"], scenario["scenario_id"])
                if action["type"] == "set_metric" and not any(
                    p["asset_id"] == action["asset_id"] and p["parameter"] == action["metric"]
                    for p in data["telemetry"]
                ):
                    errors.append(f"{scenario['scenario_id']}: metric has no telemetry point")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    errors = validate_directory(args.directory)
    if errors:
        print("\n".join(errors))
        return 1
    print(f"Validated all collections in {args.directory}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
