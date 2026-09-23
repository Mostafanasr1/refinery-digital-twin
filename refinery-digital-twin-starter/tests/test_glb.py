import json
import struct
from pathlib import Path
import pytest
from pipeline.validate import ROOT


def test_exported_glb_binding_coverage_and_geometry():
    raw = (ROOT / "data/normalized/models/refinery.glb").read_bytes()
    assert raw[:4] == b"glTF"
    assert struct.unpack_from("<I", raw, 4)[0] == 2
    length = struct.unpack_from("<I", raw, 12)[0]
    model = json.loads(raw[20:20+length])
    nodes = {n["name"]: n for n in model["nodes"]}
    assets = json.loads((ROOT / "data/normalized/assets.json").read_text())
    for asset in assets:
        node = nodes[asset["model_ref"]]
        assert node["extras"]["asset_id"] == asset["asset_id"]
        assert node["children"]
        expected = [asset["position"]["x"], asset["position"]["z"], -asset["position"]["y"]]
        assert node.get("translation", [0, 0, 0]) == pytest.approx(expected)
    for mesh in model["meshes"]:
        assert not mesh["name"].startswith(("Cube.", "Cylinder."))
        assert mesh["primitives"]
    assert len(model["materials"]) <= 6
    assert all("uri" not in image for image in model.get("images", []))


def test_archived_preview_bindings_and_offline_artifacts():
    archive = ROOT / "reference/photoreal-study"
    manifest = json.loads((archive / "manifest.json").read_text())
    assets = {a["asset_id"]: a for a in json.loads((ROOT / "data/normalized/assets.json").read_text())}
    raw = (archive / Path(manifest["model_url"]).name).read_bytes()
    length = struct.unpack_from("<I", raw, 12)[0]
    model = json.loads(raw[20:20+length])
    bound = {n.get("extras", {}).get("asset_id"): n for n in model["nodes"] if "children" in n}
    for asset_id in manifest["asset_ids"]:
        for key in ("asset_id", "tag", "type", "unit_id", "model_ref"):
            assert bound[asset_id]["extras"][key] == assets[asset_id][key]
    assert all("uri" not in image for image in model.get("images", []))
    rendered = (archive / Path(manifest["render_url"]).name).read_bytes()
    assert rendered[:8] == b"\x89PNG\r\n\x1a\n"
