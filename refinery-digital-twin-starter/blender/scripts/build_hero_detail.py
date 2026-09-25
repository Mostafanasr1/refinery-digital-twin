"""Export optional per-asset detail only; the approved base GLB is never written."""
from pathlib import Path
import json
import sys
import bpy

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from blender.generators.hero_detail import build, BUILDERS  # noqa: E402
from blender.generators.material_stage import apply_part_materials  # noqa: E402

bpy.ops.wm.read_factory_settings(use_empty=True)
assets = json.loads((ROOT / 'data/normalized/assets.json').read_text())
report = {'levels': {'0': 'approved base only', '1': 'base plus optional detail'}, 'types': sorted(BUILDERS), 'assets': {}}
for asset in assets:
    parts = build(asset)
    if not parts:
        continue
    records = apply_part_materials(asset, parts)
    node = bpy.data.objects.new(asset['model_ref'], None)
    bpy.context.collection.objects.link(node)
    for key in ('asset_id', 'tag', 'type', 'unit_id', 'model_ref'):
        node[key] = asset[key]
    node['detail_level'] = 1
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    mesh = bpy.context.object
    mesh.name = asset['model_ref'] + '_hero_detail'
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    mesh.parent = node
    mesh['asset_id'] = asset['asset_id']
    mesh['detail_level'] = 1
    node.location = tuple(asset['position'][key] for key in ('x', 'y', 'z'))
    node.rotation_euler = tuple(asset['rotation'][key] for key in ('x', 'y', 'z'))
    report['assets'][asset['asset_id']] = {'parts': records, 'triangles': sum(len(p.vertices) - 2 for p in mesh.data.polygons)}
folder = ROOT / 'data/normalized/assets/detail'
folder.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/assets/hero-detail.blend'))
bpy.ops.export_scene.gltf(filepath=str(folder / 'hero.glb'), export_format='GLB', export_extras=True, export_yup=True)
report['triangles'] = sum(item['triangles'] for item in report['assets'].values())
(folder / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'assets': len(report['assets']), 'types': len(BUILDERS), 'triangles': report['triangles']}))
