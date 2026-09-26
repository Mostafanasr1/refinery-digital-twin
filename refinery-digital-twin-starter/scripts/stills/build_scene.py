"""Assemble one offline Cycles scene from the released runtime geometry.
Run from repository root: blender -b --python scripts/stills/build_scene.py
All output stays outside the app's publicDir.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT=Path.cwd(); WORK=ROOT/'tests/visual/output/stageC-task-05'; OUT=ROOT/'docs/stills'; OUT.mkdir(parents=True,exist_ok=True)
META=json.loads((WORK/'hero-source.json').read_text(encoding='utf-8'))
bpy.ops.wm.open_mainfile(filepath=str(WORK/'import.blend'))
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=256;scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.01;scene.cycles.use_denoising=True
scene.cycles.max_bounces=8;scene.cycles.diffuse_bounces=4;scene.cycles.glossy_bounces=4;scene.cycles.transmission_bounces=4;scene.cycles.transparent_max_bounces=8
scene.cycles.sample_clamp_indirect=8
scene.render.resolution_x=3840;scene.render.resolution_y=2160;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='16'
scene.render.film_transparent=False;scene.render.use_persistent_data=True
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=0

def xyz(a):return Vector((a[0],-a[2],a[1]))
def node(tree,kind,label=None):
 n=tree.nodes.new(kind)
 if label:n.name=label;n.label=label
 return n
def link(tree,a,b):tree.links.new(a,b)
def mathn(tree,op,a,b=None):
 n=node(tree,'ShaderNodeMath');n.operation=op
 for i,v in enumerate([a,b]):
  if v is None:continue
  if isinstance(v,(int,float)):n.inputs[i].default_value=v
  else:link(tree,v,n.inputs[i])
 return n.outputs[0]
def mix(tree,f,a,b,blend='MIX'):
 n=node(tree,'ShaderNodeMixRGB');n.blend_type=blend
 for inp,v in zip(n.inputs,[f,a,b]):
  if isinstance(v,(int,float)):inp.default_value=v
  elif isinstance(v,(list,tuple)):inp.default_value=v
  else:link(tree,v,inp)
 return n.outputs[0]
def position(tree):return node(tree,'ShaderNodeNewGeometry').outputs['Position']
def noise(tree,vector,scale):
 n=node(tree,'ShaderNodeTexNoise');n.inputs['Scale'].default_value=scale;n.inputs['Detail'].default_value=3;link(tree,vector,n.inputs['Vector']);return n.outputs['Fac']
def image(tree,name,vector,scale,normal=False):
 path=ROOT/'data/normalized/assets/env'/name
 im=bpy.data.images.load(str(path),check_existing=True)
 if normal:im.colorspace_settings.name='Non-Color'
 n=node(tree,'ShaderNodeTexImage');n.image=im;n.projection='BOX';n.projection_blend=.2
 v=node(tree,'ShaderNodeVectorMath');v.operation='SCALE';v.inputs[3].default_value=scale;link(tree,vector,v.inputs[0]);link(tree,v.outputs[0],n.inputs['Vector']);return n

def terrain_material():
 m=bpy.data.materials.new('Sinai DEM / sourced slope-height blend');m.use_nodes=True;t=m.node_tree;t.nodes.clear()
 out=node(t,'ShaderNodeOutputMaterial');bs=node(t,'ShaderNodeBsdfPrincipled');bs.inputs['Roughness'].default_value=.95;link(t,bs.outputs[0],out.inputs['Surface'])
 pos=position(t);separate=node(t,'ShaderNodeSeparateXYZ');link(t,pos,separate.inputs[0]);z=separate.outputs['Z']
 geo=node(t,'ShaderNodeNewGeometry');normal=node(t,'ShaderNodeSeparateXYZ');link(t,geo.outputs['Normal'],normal.inputs[0]);slope=mathn(t,'SUBTRACT',1,mathn(t,'ABSOLUTE',normal.outputs['Z']))
 rock_factor=mathn(t,'MAXIMUM',mathn(t,'MULTIPLY',slope,4),mathn(t,'MULTIPLY',mathn(t,'MAXIMUM',mathn(t,'SUBTRACT',z,60),0),.0044));rock_factor=mathn(t,'MINIMUM',rock_factor,1)
 macro=noise(t,pos,.015);gravel_factor=mathn(t,'MULTIPLY',macro,mathn(t,'MAXIMUM',mathn(t,'SUBTRACT',.65,mathn(t,'MULTIPLY',z,.004)),0))
 colors=[];rough=[]
 for prefix,scale in [('sand',1/11),('gravel',1/2.5),('rock',1/2.7)]:
  colors.append(image(t,prefix+'-color.webp',pos,scale).outputs['Color']);rough.append(image(t,prefix+'-rough.webp',pos,scale,True).outputs['Color'])
 color=mix(t,rock_factor,mix(t,gravel_factor,colors[0],colors[1]),colors[2]);r=mix(t,rock_factor,mix(t,gravel_factor,rough[0],rough[1]),rough[2]);link(t,r,bs.inputs['Roughness'])
 variation=mathn(t,'ADD',.72,mathn(t,'MULTIPLY',macro,.28));color=mix(t,1,color,variation,'MULTIPLY')
 # Same gate-to-horizon curved track, in converted world metres (Three Z = -Blender Y).
 along=mathn(t,'SUBTRACT',-26,separate.outputs['X']);center=mathn(t,'ADD',37,mathn(t,'ADD',mathn(t,'MULTIPLY',along,.14),mathn(t,'MULTIPLY',mathn(t,'SINE',mathn(t,'MULTIPLY',along,.003)),25)))
 distance=mathn(t,'ABSOLUTE',mathn(t,'SUBTRACT',mathn(t,'MULTIPLY',separate.outputs['Y'],-1),center));track=mathn(t,'MULTIPLY',mathn(t,'LESS_THAN',distance,3.5),mathn(t,'GREATER_THAN',along,0))
 color=mix(t,mathn(t,'MULTIPLY',track,.22),color,(.24,.19,.12,1),'MULTIPLY');link(t,color,bs.inputs['Base Color'])
 normals=[]
 for prefix,scale in [('sand',1/11),('gravel',1/2.5),('rock',1/2.7)]:
  tex=image(t,prefix+'-normal.webp',pos,scale,True);tex.projection='FLAT';normals.append(tex.outputs['Color'])
 # Plane UV tangents align with world XY. Decode directional data, never height.
 normalmap=node(t,'ShaderNodeNormalMap');normalmap.space='TANGENT';normalmap.inputs['Strength'].default_value=.24
 link(t,mix(t,rock_factor,mix(t,gravel_factor,normals[0],normals[1]),normals[2]),normalmap.inputs['Color']);link(t,normalmap.outputs[0],bs.inputs['Normal']);return m

terrain=terrain_material()
# Preserve imported texture graphs; add the runtime's metre-space material wear.
for mat in list(bpy.data.materials):
 if mat==terrain or not mat.use_nodes:continue
 t=mat.node_tree;bs=next((n for n in t.nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not bs:continue
 program=mat.get('program','');original=mat.get('originalName','')
 if 'sinai-slope' in program:
  for obj in bpy.data.objects:
   if obj.type=='MESH':
    for slot in obj.material_slots:
     if slot.material==mat:slot.material=terrain
  continue
 if 'slice-wear' in program:
  amount=float(program.rsplit('/',1)[-1]);p=position(t);n=noise(t,p,.25);factor=mathn(t,'SUBTRACT',1,mathn(t,'MULTIPLY',n,amount))
  base=bs.inputs['Base Color'];source=base.links[0].from_socket if base.is_linked else tuple(base.default_value)
  link(t,mix(t,1,source,factor,'MULTIPLY'),base)
 if 'instanced-pipe-metres' in program:
  role='insulation' if 'insulation' in program else 'painted-steel';metres=1 if role=='insulation' else 2
  vec=node(t,'ShaderNodeVectorMath');vec.operation='SCALE';vec.inputs[3].default_value=1/metres;link(t,position(t),vec.inputs[0])
  for n in list(t.nodes):
   if n.type=='TEX_IMAGE':n.projection='BOX';n.projection_blend=.15;link(t,vec.outputs[0],n.inputs['Vector'])
# Cameras use the runtime's 42-degree vertical FOV and the approved coordinates.
for spec in META['cameras']:
 data=bpy.data.cameras.new(spec['id']);cam=bpy.data.objects.new(spec['id'],data);scene.collection.objects.link(cam);cam.location=xyz(spec['position']);cam.rotation_euler=(xyz(spec['target'])-cam.location).to_track_quat('-Z','Y').to_euler();data.type='PERSP';data.sensor_fit='VERTICAL';data.sensor_height=24;data.lens=12/math.tan(math.radians(42)/2);data.clip_end=10000
scene.camera=bpy.data.objects['CAM-6']
# Existing scene lights are rebuilt from both presentation states; no new plant fixtures.
for preset in ['day','night']:
 for index,spec in enumerate(META['presets'][preset]['lights']):
  if spec['intensity']<=0 or spec['type'] not in ['DirectionalLight','PointLight','SpotLight']:continue
  kind={'DirectionalLight':'SUN','PointLight':'POINT','SpotLight':'SPOT'}[spec['type']]
  data=bpy.data.lights.new(f'{preset}-light-{index}',kind);obj=bpy.data.objects.new(data.name,data);scene.collection.objects.link(obj);obj['preset']=preset;obj.location=xyz(spec['position']);data.color=spec['color']
  if kind=='SUN':data.energy=spec['intensity'];data.angle=math.radians(.8)
  else:data.energy=spec['intensity']*4*math.pi/683*8;data.shadow_soft_size=.35
  if 'target' in spec:obj.rotation_euler=(xyz(spec['target'])-obj.location).to_track_quat('-Z','Y').to_euler()
  if kind=='SPOT':data.spot_size=spec['angle']*2;data.spot_blend=spec['penumbra']
  obj.hide_render=preset!='day'
# Sourced HDR and the captured procedural dusk sky are the same sources as runtime.
world=bpy.data.worlds.new('Sourced desert sky');world.use_nodes=True;scene.world=world;t=world.node_tree;t.nodes.clear();out=node(t,'ShaderNodeOutputWorld');env=node(t,'ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(ROOT/'data/normalized/assets/env/sky.hdr'));bg=node(t,'ShaderNodeBackground','Environment illumination');bg.inputs['Strength'].default_value=.65;link(t,env.outputs['Color'],bg.inputs['Color']);camera_bg=node(t,'ShaderNodeBackground','Camera sky');camera_bg.inputs['Color'].default_value=(.4,.6,.8,1);lightpath=node(t,'ShaderNodeLightPath');mixsh=node(t,'ShaderNodeMixShader');link(t,lightpath.outputs['Is Camera Ray'],mixsh.inputs[0]);link(t,bg.outputs[0],mixsh.inputs[1]);link(t,camera_bg.outputs[0],mixsh.inputs[2]);link(t,mixsh.outputs[0],out.inputs[0])
# A restrained physical haze, not an image backdrop.
bpy.ops.mesh.primitive_cube_add(size=1,location=(100,35,1100));haze=bpy.context.object;haze.name='offline-atmospheric-haze';haze.scale=(9000,9000,2300);m=bpy.data.materials.new('Desert haze');m.use_nodes=True;m.node_tree.nodes.clear();vo=node(m.node_tree,'ShaderNodeVolumeScatter');vo.inputs['Color'].default_value=(.68,.74,.78,1);vo.inputs['Density'].default_value=.00008;vo.inputs['Anisotropy'].default_value=.35;out=node(m.node_tree,'ShaderNodeOutputMaterial');link(m.node_tree,vo.outputs[0],out.inputs['Volume']);haze.data.materials.append(m)
# Steam sprite positions become soft volume puffs; one frozen motion sample shared by all frames.
for i,spec in enumerate(META['presets']['day']['steam']):
 if spec['opacity']<.015:continue
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=spec['scale'][0]/2,location=xyz(spec['position']));obj=bpy.context.object;obj.name=f'offline-steam-{i}';obj.scale=(1,1,1.25)
 m=bpy.data.materials.new(obj.name);m.use_nodes=True;m.node_tree.nodes.clear();vol=node(m.node_tree,'ShaderNodeVolumePrincipled');vol.inputs['Density'].default_value=spec['opacity']*.09;out=node(m.node_tree,'ShaderNodeOutputMaterial');link(m.node_tree,vol.outputs[0],out.inputs['Volume']);obj.data.materials.append(m)
# Procedural physical flame at the same tip; offline geometry replaces the camera-facing shader.
flame=next(o for o in META['presets']['day']['omitted'] if isinstance(o,dict) and 'plant-atmosphere' in o['ancestry'])
for i in range(3):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=xyz(flame['position'])+Vector((i*.2,0,i*.7-1)))
 obj=bpy.context.object;obj.name=f'offline-flare-flame-{i}';obj.scale=(.7-i*.12,.6-i*.1,2.7-i*.5)
 m=bpy.data.materials.new(obj.name);m.use_nodes=True;t=m.node_tree;t.nodes.clear();em=node(t,'ShaderNodeEmission');em.inputs['Color'].default_value=(1,.24+i*.15,.012,1);em.inputs['Strength'].default_value=12+i*4;out=node(t,'ShaderNodeOutputMaterial');link(t,em.outputs[0],out.inputs[0]);obj.data.materials.append(m)
bpy.data.images.load(str(WORK/'dusk-sky.png'),check_existing=True).use_fake_user=True
scene['source_commit']=META['sourceCommit'];scene['offline_only']=True;scene['runtime_fov_vertical_degrees']=42;scene['presets_json']=json.dumps(META['presets']);scene['source_manifest']=str(WORK/'hero-source.json')
# Pack imported and sourced textures so this single scene is portable.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'stageC-hero-scene.blend'),compress=True)
print('HERO_SCENE_SAVED',len(bpy.data.objects),len(bpy.data.meshes),len(bpy.data.materials))
