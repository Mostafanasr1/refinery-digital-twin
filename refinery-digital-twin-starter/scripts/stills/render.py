"""Render a named camera/time from the single saved scene; write real wall timings."""
import bpy,json,sys,time,math,hashlib
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
cam=args[0] if args else 'CAM-6';preset=args[1] if len(args)>1 else 'day';preview='--preview' in args
ROOT=Path.cwd();OUT=ROOT/'docs/stills';WORK=ROOT/'tests/visual/output/stageC-task-05'
scene_path=OUT/'stageC-hero-scene.blend';started=time.perf_counter();bpy.ops.wm.open_mainfile(filepath=str(scene_path));scene=bpy.context.scene
presets=json.loads(scene['presets_json']);state=presets[preset];scene.camera=bpy.data.objects[cam]
for obj in bpy.data.objects:
 source=obj
 while source and not source.get('sourceId'):source=source.parent
 if source:
  sid=source['sourceId'];obj.hide_render=sid not in state['objects']
  if obj.type=='MESH' and sid in state['objects']:
   spec=state['objects'][sid]
   for i,slot in enumerate(obj.material_slots):
    mat=slot.material
    if not mat or not mat.use_nodes:continue
    s=spec['materials'][min(i,len(spec['materials'])-1)]
    bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs:
     if 'emissive' in s:bs.inputs['Emission Color'].default_value=(*s['emissive'],1);bs.inputs['Emission Strength'].default_value=s['emissiveIntensity']
     if s.get('color') and not bs.inputs['Base Color'].is_linked:bs.inputs['Base Color'].default_value=(*s['color'],1)
    if s.get('basic'):
     t=mat.node_tree;t.nodes.clear();em=t.nodes.new('ShaderNodeEmission');color=s['color'];strength=max(max(color),1);em.inputs['Color'].default_value=(*(c/strength for c in color),1);em.inputs['Strength'].default_value=strength;out=t.nodes.new('ShaderNodeOutputMaterial');t.links.new(em.outputs[0],out.inputs['Surface'])
 if obj.get('preset'):obj.hide_render=obj['preset']!=preset
t=scene.world.node_tree
bg=t.nodes['Environment illumination'];bg.inputs['Strength'].default_value=.65 if preset=='day' else .055
env=next(n for n in t.nodes if n.type=='TEX_ENVIRONMENT');env.image=bpy.data.images['sky.hdr']
camera_env=t.nodes.new('ShaderNodeTexEnvironment');camera_env.image=bpy.data.images['sky.hdr'] if preset=='day' else bpy.data.images['dusk-sky.png']
sky=t.nodes['Camera sky'];t.links.new(camera_env.outputs['Color'],sky.inputs['Color']);sky.inputs['Strength'].default_value=.85 if preset=='day' else .22
scene.view_settings.exposure=0 if preset=='day' else 1.3
# Cycles volume and emissive surfaces provide physically rendered atmosphere/light.
scene.cycles.samples=32 if preview else 256;scene.cycles.adaptive_threshold=.05 if preview else .01
scene.render.resolution_percentage=25 if preview else 100
pref=bpy.context.preferences.addons['cycles'].preferences;pref.compute_device_type='OPTIX';pref.get_devices()
for device in pref.devices:device.use=device.type=='OPTIX'
scene.cycles.device='GPU'
name=f'{cam}-{preset}';folder=WORK if preview else OUT;scene.render.filepath=str(folder/(name+('-preview' if preview else '')+'.png'))
render_start=time.perf_counter();bpy.ops.render.render(write_still=True);render_seconds=time.perf_counter()-render_start
record={'camera':cam,'preset':preset,'engine':'CYCLES','device':[d.name for d in pref.devices if d.use],'backend':'OPTIX','blender':bpy.app.version_string,'width':scene.render.resolution_x*scene.render.resolution_percentage//100,'height':scene.render.resolution_y*scene.render.resolution_percentage//100,'samples_max':scene.cycles.samples,'adaptive_threshold':scene.cycles.adaptive_threshold,'denoising':scene.cycles.use_denoising,'denoiser':scene.cycles.denoiser,'render_seconds':render_seconds,'load_and_render_seconds':time.perf_counter()-started,'scene_sha256':hashlib.sha256(scene_path.read_bytes()).hexdigest(),'source_commit':scene['source_commit'],'output':Path(scene.render.filepath).name,'output_sha256':hashlib.sha256(Path(scene.render.filepath).read_bytes()).hexdigest()}
(folder/(name+('-preview' if preview else '')+'.json')).write_text(json.dumps(record,indent=2),encoding='utf-8');print('RENDER_COMPLETE',json.dumps(record))
