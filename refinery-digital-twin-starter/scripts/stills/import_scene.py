"""Import runtime GLB, retain its GPU instances/colors, and audit completeness."""
import bpy,json,struct,hashlib
from pathlib import Path
ROOT=Path.cwd();WORK=ROOT/'tests/visual/output/stageC-task-05';raw=(WORK/'hero-source.glb').read_bytes()
length,kind=struct.unpack_from('<II',raw,12);gltf=json.loads(raw[20:20+length]);offset=20+length;binary=raw[offset+8:]
def accessor(index):
 a=gltf['accessors'][index];v=gltf['bufferViews'][a['bufferView']];width={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']];assert a['componentType']==5126
 start=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',width*4)
 return [struct.unpack_from('<'+'f'*width,binary,start+i*stride) for i in range(a['count'])]
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(WORK/'hero-source.glb'))
rows=[];colored=0
for n in gltf['nodes']:
 if 'mesh' not in n:continue
 root=bpy.data.objects[n['name']];meshes=[o for o in [root,*root.children_recursive] if o.type=='MESH']
 attrs=n.get('extensions',{}).get('EXT_mesh_gpu_instancing',{}).get('attributes',{});expected=gltf['accessors'][next(iter(attrs.values()))]['count'] if attrs else 1
 assert len(meshes)==expected,(root.name,len(meshes),expected)
 base_tri=sum(gltf['accessors'][p.get('indices',p['attributes']['POSITION'])]['count']//3 for p in gltf['meshes'][n['mesh']]['primitives'])
 assert sum(len(o.data.polygons) for o in meshes)==base_tri*expected
 if 'TRANSLATION' in attrs:
  positions=accessor(attrs['TRANSLATION']);meshes.sort(key=lambda o:0 if '.' not in o.name else int(o.name.rsplit('.',1)[-1]))
  for o,pos in zip(meshes,positions):
   want=(pos[0],-pos[2],pos[1]);assert max(abs(o.location[i]-want[i]) for i in range(3))<.001,(o.name,tuple(o.location),want)
 if '_COLOR_0' in attrs:
  colors=accessor(attrs['_COLOR_0'])
  for o,c in zip(meshes,colors):
   o.color=(*c[:3],1);colored+=1
  for mat in {slot.material for o in meshes for slot in o.material_slots}:
   t=mat.node_tree;bs=next(node for node in t.nodes if node.type=='BSDF_PRINCIPLED');base=bs.inputs['Base Color'];mix=t.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
   if base.is_linked:t.links.new(base.links[0].from_socket,mix.inputs[1])
   else:mix.inputs[1].default_value=base.default_value
   info=t.nodes.new('ShaderNodeObjectInfo');t.links.new(info.outputs['Color'],mix.inputs[2]);t.links.new(mix.outputs[0],base)
 rows.append({'sourceId':n['name'],'name':root.get('originalName',''),'ancestry':root.get('ancestry',''),'expected_instances':expected,'imported_instances':len(meshes),'triangles':base_tri*expected,'instance_colors':expected if '_COLOR_0' in attrs else 0})
audit={'source_glb_sha256':hashlib.sha256(raw).hexdigest(),'status':'PASS','source_nodes':len(rows),'imported_mesh_instances':sum(r['imported_instances'] for r in rows),'triangles':sum(r['triangles'] for r in rows),'colored_instances_restored':colored,'mesh_rows':rows}
(WORK/'import-audit.json').write_text(json.dumps(audit,indent=2),encoding='utf-8');bpy.ops.wm.save_as_mainfile(filepath=str(WORK/'import.blend'),compress=True);print('IMPORT_AUDIT',json.dumps({k:v for k,v in audit.items() if k!='mesh_rows'}))
