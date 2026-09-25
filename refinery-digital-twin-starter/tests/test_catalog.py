import json

from pipeline.catalog import SILHOUETTES
from pipeline.validate import ROOT


def test_catalog_matches_asset_schema():
    schema = json.loads((ROOT / "schemas" / "asset.schema.json").read_text(encoding="utf-8"))
    assert set(SILHOUETTES) == set(schema["properties"]["type"]["enum"])


def test_catalog_samples_are_complete():
    for entry in SILHOUETTES.values():
        assert entry["description"]
        assert set(entry["sample"]) == {"height", "diameter", "length", "width"}
        assert all(value > 0 for value in entry["sample"].values())
