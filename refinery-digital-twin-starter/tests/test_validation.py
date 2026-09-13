import json
from pathlib import Path
from pipeline.validate import COLLECTIONS, ROOT, validate_directory


def empty_dataset(path: Path):
    for collection in COLLECTIONS:
        (path / f"{collection}.json").write_text("[]")


def test_supplied_sources_validate():
    assert validate_directory(ROOT / "data" / "synthetic") == []


def test_normalized_foundation_validates():
    assert validate_directory(ROOT / "data" / "normalized") == []


def test_invalid_record_has_file_and_index(tmp_path):
    empty_dataset(tmp_path)
    (tmp_path / "assets.json").write_text(json.dumps([{}]))
    errors = validate_directory(tmp_path)
    assert any("assets.json/0" in error and "asset_id" in error for error in errors)


def test_collection_must_be_array(tmp_path):
    empty_dataset(tmp_path)
    (tmp_path / "assets.json").write_text("{}")
    assert any("not of type 'array'" in error for error in validate_directory(tmp_path))


def test_missing_files_are_reported(tmp_path):
    assert len(validate_directory(tmp_path)) == len(COLLECTIONS)


def test_invalid_json_is_reported(tmp_path):
    empty_dataset(tmp_path)
    (tmp_path / "assets.json").write_text("{")
    assert len(validate_directory(tmp_path)) == 1
