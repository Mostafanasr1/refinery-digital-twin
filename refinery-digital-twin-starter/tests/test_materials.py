import json
import pytest
from pipeline.catalog import SILHOUETTES
from pipeline.validate import ROOT
from blender.generators.material_stage import CONFIG, role_for


@pytest.mark.parametrize('kind,part,source,expected', [
    ('sphere_tank', 'crown_platform', 'Brushed steel', 'grating'),
    ('cylindrical_heater', 'stack_platform', 'Brushed steel', 'grating'),
    ('cylindrical_heater', 'stack_platform_handrail', 'Safety ochre', 'safety-yellow'),
    ('column', 'ladder_rail_3.8', 'Safety ochre', 'galvanized'),
    ('column', 'rung_12', 'Safety ochre', 'galvanized'),
    ('floating_roof_tank', 'rolling_ladder', 'Safety ochre', 'galvanized'),
    ('storage_tank', 'wrap_stair_12', 'Brushed steel', 'safety-yellow'),
    ('sphere_tank', 'sphere_stair_12', 'Brushed steel', 'safety-yellow'),
    ('flare', 'tip', 'Equipment shell', 'dark-steel'),
])
def test_semantic_part_assignments(kind, part, source, expected):
    assert role_for(kind, part, source) == expected


def test_grating_has_physical_period_and_relief():
    from scripts.build_materials import grating_maps
    color, normal, rough = grating_maps(200, .5)
    # Ten 50 mm cells in a half-metre tile. Bar and recess differ.
    assert color.getpixel((0, 10)) == color.getpixel((20, 10))
    assert color.getpixel((0, 10))[0] > color.getpixel((10, 10))[0]
    assert len(set(normal.get_flattened_data())) > 1
    assert rough.getpixel((0, 10)) != rough.getpixel((10, 10))


def test_every_type_has_complete_material_defaults():
    assert set(CONFIG['types']) == set(SILHOUETTES)
    expected = {'Equipment shell', 'Brushed steel', 'Concrete', 'Safety ochre'}
    for kind, mapping in CONFIG['types'].items():
        assert set(mapping) == expected
        assert set(mapping.values()) <= set(CONFIG['materials'])
        for source in expected:
            assert role_for(kind, 'shell', source) in CONFIG['materials']
    with pytest.raises(KeyError):
        role_for('column', 'shell', 'Unregistered source')


def test_exported_parts_and_compressed_material_pack_are_complete():
    assets = json.loads((ROOT / 'data/normalized/assets.json').read_text())
    parts = json.loads((ROOT / 'data/normalized/models/material-parts.json').read_text())
    assert set(parts) == {asset['asset_id'] for asset in assets}
    for asset in assets:
        assert parts[asset['asset_id']]
        for part in parts[asset['asset_id']]:
            assert part['role'] == role_for(asset['type'], part['part'], part['source'])
    folder = ROOT / 'data/normalized/assets/materials'
    manifest = json.loads((folder / 'manifest.json').read_text())
    assert set(manifest['materials']) == set(CONFIG['materials'])
    for material in manifest['materials'].values():
        for path in material['maps'].values():
            assert (ROOT / 'data/normalized' / path).read_bytes()[:12] == b'\xabKTX 20\xbb\r\n\x1a\n'
