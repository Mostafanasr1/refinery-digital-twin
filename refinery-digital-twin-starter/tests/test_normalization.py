import json
import shutil
import csv
import pytest
from pipeline.normalize import normalize
from pipeline.validate import ROOT, validate_directory


def source_copy(tmp_path):
    source = tmp_path / "source"
    shutil.copytree(ROOT / "data/synthetic", source)
    return source


def test_deterministic_output(tmp_path):
    source = source_copy(tmp_path)
    output = tmp_path / "output"
    normalize(source, output)
    first = {p.name: p.read_bytes() for p in output.glob("*.json")}
    assets = source / "assets.json"
    assets.write_text(json.dumps(list(reversed(json.loads(assets.read_text())))))
    normalize(source, output)
    assert first == {p.name: p.read_bytes() for p in output.glob("*.json")}
    assert validate_directory(output) == []


@pytest.mark.parametrize("collection,field,value", [
    ("connections", "to_asset_id", "missing"),
    ("assets", "unit_id", "missing"),
    ("model_bindings", "model_ref", "wrong"),
    ("telemetry", "asset_id", "missing"),
])
def test_invalid_references_do_not_replace_output(tmp_path, collection, field, value):
    source = source_copy(tmp_path)
    output = tmp_path / "output"
    normalize(source, output)
    before = (output / "assets.json").read_bytes()
    path = source / f"{collection}.json"
    rows = json.loads(path.read_text())
    rows[0][field] = value
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError):
        normalize(source, output)
    assert (output / "assets.json").read_bytes() == before


def test_csv_equipment_adapter(tmp_path):
    source = source_copy(tmp_path)
    rows = json.loads((source / "assets.json").read_text())
    with (source / "assets.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=rows[0].keys())
        writer.writeheader()
        for row in rows:
            writer.writerow({k: json.dumps(v) if isinstance(v, (dict, bool)) else v
                             for k, v in row.items()})
    normalize(source, tmp_path / "output")
    assert validate_directory(tmp_path / "output") == []


def test_disconnected_process_path(tmp_path):
    source = source_copy(tmp_path)
    path = source / "process_paths.json"
    rows = json.loads(path.read_text())
    rows[0]["connection_ids"][0] = "conn_006"
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="disconnected path"):
        normalize(source, tmp_path / "output")


def test_duplicate_assets(tmp_path):
    source = source_copy(tmp_path)
    path = source / "assets.json"
    rows = json.loads(path.read_text())
    rows.append(rows[0])
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="duplicate"):
        normalize(source, tmp_path / "output")
