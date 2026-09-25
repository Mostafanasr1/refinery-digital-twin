import json
import struct
from pipeline.validate import ROOT


def test_optional_details_cover_every_hero_instance_without_new_asset_ids():
    folder = ROOT / 'data/normalized/assets/detail'
    manifest = json.loads((folder / 'manifest.json').read_text())
    assets = json.loads((ROOT / 'data/normalized/assets.json').read_text())
    expected = {a['asset_id']: a for a in assets if a['type'] in manifest['types']}
    assert set(manifest['types']) == {'column', 'flare', 'fired_heater', 'storage_tank', 'floating_roof_tank', 'pipe_rack'}
    assert set(manifest['assets']) == set(expected)
    raw = (folder / 'hero.glb').read_bytes()
    model = json.loads(raw[20:20 + struct.unpack_from('<I', raw, 12)[0]])
    nodes = {node['name']: node for node in model['nodes']}
    for asset_id, asset in expected.items():
        assert nodes[asset['model_ref']]['extras']['asset_id'] == asset_id
        assert nodes[asset['model_ref']]['extras']['detail_level'] == 1
        parts = manifest['assets'][asset_id]['parts']
        assert parts and all(part['part'].startswith('hero_') for part in parts)
    assert manifest['triangles'] > 0
