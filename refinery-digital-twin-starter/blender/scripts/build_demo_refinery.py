"""blender --background --python blender/scripts/build_demo_refinery.py -- --detail 1"""
import argparse
import json
import sys
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "blender" / "generators"))
from equipment import build, pipe_route, material  # noqa: E402
from material_stage import apply_part_materials  # noqa: E402

parser=argparse.ArgumentParser()
parser.add_argument('--detail',type=int,choices=[0,1,2],default=1)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
assets=json.loads((ROOT/'data/normalized/assets.json').read_text())
units=json.loads((ROOT/'data/normalized/units.json').read_text())
areas=json.loads((ROOT/'data/normalized/areas.json').read_text())

def empty(name,parent=None):
    obj=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(obj);obj.parent=parent
    return obj

root=empty('REFINERY_ROOT')
area_nodes={a['area_id']:empty(a['area_id'].upper(),root) for a in areas}
unit_nodes={u['unit_id']:empty(u['unit_id'].upper(),area_nodes[u['area_id']]) for u in units}
asset_nodes={}
material_parts={}
for asset in assets:
    node=empty(asset['model_ref'],unit_nodes[asset['unit_id']]);asset_nodes[asset['asset_id']]=node
    for key in ['asset_id','tag','type','unit_id','area_id','model_ref']:node[key]=asset[key]
    parts=build(asset,args.detail)
    material_parts[asset['asset_id']]=apply_part_materials(asset,parts)
    # Join by material-preserving mesh to keep object/draw overhead controlled.
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join();mesh=bpy.context.object;mesh.name=asset['model_ref']+'_geometry';mesh.data.name=asset['model_ref']+'_mesh'
    # Bake part origin into mesh, keep asset node transform canonical.
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    mesh.parent=node
    for key in ['asset_id','tag','type','unit_id','area_id','model_ref']:mesh[key]=asset[key]
    node.location=tuple(asset['position'][k] for k in ['x','y','z'])
    node.rotation_euler=tuple(asset['rotation'][k] for k in ['x','y','z'])
# Static major routes are also exported for standalone Blender inspection.
pipes=empty('MAJOR_PIPING',root)
lookup={a['asset_id']:a for a in assets}
for conn in json.loads((ROOT/'data/normalized/connections.json').read_text()):
    a=lookup[conn['from_asset_id']]['position'];b=lookup[conn['to_asset_id']]['position']
    for obj in pipe_route(conn['connection_id'],[tuple(p[k] for k in ['x','y','z']) for p in conn.get('route_points',[dict(x=a['x'],y=a['y'],z=3),dict(x=a['x'],y=b['y'],z=3),dict(x=b['x'],y=b['y'],z=3)])],conn.get('diameter',0.6)/2,material('Route steel',(0.4,0.53,0.57)),args.detail):
        obj.parent=pipes;obj['connection_id']=conn['connection_id'];obj['asset_id']=conn['from_asset_id']
output=ROOT/'data/normalized/models';output.mkdir(parents=True,exist_ok=True)
blend=ROOT/'blender/assets/refinery.blend'
bpy.context.scene.world.color=(0.025,0.04,0.06)
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
bpy.ops.export_scene.gltf(filepath=str(output/'refinery.glb'),export_format='GLB',export_extras=True,export_yup=True)
report={'assets':len(assets),'detail':args.detail,'mesh_objects':sum(o.type=='MESH' for o in bpy.data.objects),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in bpy.data.objects if o.type=='MESH')}
(output/'build-report.json').write_text(json.dumps(report,indent=2))
(output/'material-parts.json').write_text(json.dumps(material_parts,indent=2))
print(json.dumps(report))
