"""Build a compact detailed module, export interactive GLB and render an honest still."""
import bpy
import math
import json
import sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'blender/generators'))
from equipment import box, cylinder
bpy.ops.wm.read_factory_settings(use_empty=True)
OUT=ROOT/'data/normalized/preview';OUT.mkdir(parents=True,exist_ok=True)
config=json.loads((ROOT/'data/synthetic/preview.json').read_text())
assets={a['asset_id']:a for a in json.loads((ROOT/'data/normalized/assets.json').read_text())}

def mat(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    m.diffuse_color=(*color,1)
    return m
steel=mat('Satin stainless steel',(.38,.44,.47),.85,.28)
paint=mat('Petrol blue enamel',(.025,.12,.16),.55,.3)
dark=mat('Machined graphite',(.045,.052,.06),.7,.36)
bolt=mat('Galvanized fasteners',(.5,.52,.5),.9,.23)
yellow=mat('Safety yellow',(.75,.36,.035),.25,.36)
concrete=mat('Weathered concrete',(.22,.23,.21),0,.84)
rubber=mat('Gasket elastomer',(.018,.02,.019),0,.8)
# Physical micro-roughness for Cycles. Constant fallback above is used by the GLB.
for m,scale,strength in [(concrete,45,.18),(steel,170,.035),(paint,120,.012)]:
    nodes=m.node_tree.nodes;links=m.node_tree.links
    tex=nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=scale;tex.inputs['Detail'].default_value=3
    bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=strength;bump.inputs['Distance'].default_value=.035
    links.new(tex.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])

root=bpy.data.objects.new('PREHEAT_MODULE',None);bpy.context.collection.objects.link(root)
current=root
counter=0

def own(obj):
    global counter
    counter+=1;obj.parent=current
    if current is not None and current.get('asset_id'):
        for key in ['asset_id','tag','type','unit_id','model_ref']:obj[key]=current[key]
    return obj

def B(name,pos,size,m):
    obj=own(box(name,pos,size,m))
    mod=obj.modifiers.new('Edge highlights','BEVEL');mod.width=.025;mod.segments=2
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def C(name,pos,r,depth,m,axis='Z',vertices=48):
    obj=own(cylinder(name,pos,r,depth,m,1))
    if axis=='X':obj.rotation_euler.y=math.pi/2
    if axis=='Y':obj.rotation_euler.x=math.pi/2
    return obj

def route(name,points,r,m):
    vectors=[Vector(p) for p in points];samples=[vectors[0]]
    for i in range(1,len(vectors)-1):
        before,corner,after=vectors[i-1:i+2]
        distance=min((before-corner).length*.3,(after-corner).length*.3,max(r*2.5,.12))
        entry=corner+(before-corner).normalized()*distance;leave=corner+(after-corner).normalized()*distance
        for step in range(13):
            t=step/12;samples.append((1-t)**2*entry+2*(1-t)*t*corner+t*t*leave)
    samples.append(vectors[-1])
    curve=bpy.data.curves.new(name+'_curve','CURVE');curve.dimensions='3D';curve.bevel_depth=r;curve.bevel_resolution=4;curve.use_fill_caps=True
    spline=curve.splines.new('POLY');spline.points.add(len(samples)-1)
    for point,position in zip(spline.points,samples):point.co=(*position,1)
    obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);obj.data.materials.append(m);own(obj)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
    for polygon in obj.data.polygons:polygon.use_smooth=True

def ring(name,pos,major,minor,m,axis='Z'):
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=10,major_radius=major,minor_radius=minor,location=pos)
    obj=bpy.context.object;obj.name=name;obj.data.name=name+'_mesh';obj.data.materials.append(m)
    if axis=='X':obj.rotation_euler.y=math.pi/2
    if axis=='Y':obj.rotation_euler.x=math.pi/2
    for p in obj.data.polygons:p.use_smooth=True
    return own(obj)

def flange(name,center,r,axis='X',count=12):
    C(name,center,r,.16,steel,axis)
    for i in range(count):
        angle=i*math.tau/count;off=r*.8
        p=list(center)
        if axis=='X':p[1]+=off*math.cos(angle);p[2]+=off*math.sin(angle)
        elif axis=='Y':p[0]+=off*math.cos(angle);p[2]+=off*math.sin(angle)
        else:p[0]+=off*math.cos(angle);p[1]+=off*math.sin(angle)
        bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.065,depth=.25,location=p)
        obj=bpy.context.object;obj.name=name+f'_bolt_{i}';obj.data.name=obj.name+'_mesh';obj.data.materials.append(bolt)
        if axis=='X':obj.rotation_euler.y=math.pi/2
        elif axis=='Y':obj.rotation_euler.x=math.pi/2
        own(obj)

def asset_node(asset_id):
    global current
    asset=assets[asset_id];node=bpy.data.objects.new(asset['model_ref'],None);bpy.context.collection.objects.link(node);node.parent=root
    for key in ['asset_id','tag','type','unit_id','model_ref']:node[key]=asset[key]
    current=node
    return node

# Concrete equipment pad with cast joints and anchor blocks.
B('Equipment slab',(0,0,-.22),(15,9,.44),concrete)
for x in [-5,0,5]:B('Slab joint '+str(x),(x,0,.003),(.025,8.9,.01),dark)
for y in [-3.6,3.6]:B('Safety line '+str(y),(0,y,.015),(14,.045,.025),yellow)
# Heat exchanger: shell, channel head, bolted covers and saddle supports.
asset_node(config['asset_ids'][0])
C('Exchanger shell',(0,1.4,2.25),.76,7.5,steel,'X')
for x in [-3.8,3.8]:
    flange('Channel flange '+str(x),(x,1.4,2.25),.9,'X',20)
    C('Channel head '+str(x),(x+(-.3 if x<0 else .3),1.4,2.25),.76,.6,paint,'X')
    flange('End cover '+str(x),(x+(-.62 if x<0 else .62),1.4,2.25),.82,'X',16)
for x in [-2.5,2.5]:
    B('Saddle foot '+str(x),(x,1.4,.35),(1.1,2,.3),paint)
    B('Saddle web '+str(x),(x,1.4,1.15),(.4,1.2,1.4),paint)
    for y in [.7,2.1]:C(f'Anchor {x} {y}',(x,y,.6),.07,.4,bolt)
    ring('Shell stiffener '+str(x),(x,1.4,2.25),.78,.045,steel,'X')
for x in [-2.8,2.8]:
    C('Shell nozzle '+str(x),(x,1.4,3.2),.2,.7,steel)
    flange('Nozzle flange '+str(x),(x,1.4,3.55),.34,'Z',8)
    route('Upper process riser '+str(x),[(x,1.4,3.55),(x,1.4,4.3),(x,3,4.3),(5.7,3,4.3)],.18,steel)
# Pump duty / standby skids with motors, volutes, coupling guards and pipe manifolds.
for index,asset_id in enumerate(config['asset_ids'][1:]):
    asset_node(asset_id);x=-2.4+index*4.4;y=-1.9
    B(f'Skid {index}',(x,y,.35),(3.5,1.6,.3),paint)
    for xx in [x-1.4,x+1.4]:
        for yy in [y-.55,y+.55]:C(f'Skid bolt {index} {xx} {yy}',(xx,yy,.6),.065,.25,bolt)
    C(f'Motor {index}',(x-.75,y,1),.4,1.1,paint,'X')
    for j in range(14):
        angle=j*math.tau/14
        B(f'Motor fin {index}_{j}',(x-.75,y+.42*math.cos(angle),1+.42*math.sin(angle)),(1.05,.055,.055),paint)
    B(f'Terminal box {index}',(x-.8,y,1.53),(.4,.5,.25),paint)
    C(f'Coupling guard {index}',(x+.05,y,1),.24,.4,yellow,'X')
    C(f'Pump casing {index}',(x+.65,y,1.05),.49,.55,paint,'Y')
    flange(f'Pump face {index}',(x+.65,y-.35,1.05),.43,'Y',10)
    route(f'Suction {index}',[(x+.65,y-.42,1.05),(x+.65,-3.1,1.05),(6,-3.1,1.05)],.14,steel)
    route(f'Discharge {index}',[(x+.65,y,1.5),(x+.65,y,2.1),(x+.65,-.5,2.1),(5.7,-.5,2.1),(5.7,-.5,4.3),(5.7,3,4.3)],.12,steel)
    flange(f'Discharge flange {index}',(x+.65,y,1.7),.25,'Z',8)
    C(f'Valve bonnet {index}',(x+.65,-.7,2.37),.15,.4,paint)
    C(f'Valve stem {index}',(x+.65,-.7,2.75),.045,.5,steel)
    ring(f'Handwheel {index}',(x+.65,-.7,3.02),.27,.035,yellow)
    for angle in [0,math.pi/2]:
        obj=B(f'Wheel spoke {index}_{angle}',(x+.65,-.7,3.02),(.5,.025,.025),yellow);obj.rotation_euler.z=angle
    # Gauge with real dial ticks, no fabricated operational reading.
    C(f'Gauge body {index}',(x+.65,y+.2,1.95),.15,.09,steel,'Y')
    C(f'Gauge dial {index}',(x+.65,y+.145,1.95),.13,.008,mat('Gauge white '+str(index),(.8,.82,.78),0,.5),'Y')
    for j in range(9):
        angle=j*math.pi/6
        B(f'Gauge tick {index}_{j}',(x+.65+.1*math.cos(angle),y+.135,1.95+.1*math.sin(angle)),(.012,.01,.026),dark)
# Shared raised access platform, open grating, guardrails and cable tray.
current=root
for x in [-4.9,4.9]:
    for y in [2.75,3.95]:B(f'Platform leg {x}_{y}',(x,y,1.1),(.12,.12,2.2),paint)
for y in [2.75,3.95]:B('Platform beam '+str(y),(0,y,2.2),(10,.13,.18),paint)
for i in range(75):B(f'Grating bar {i}',(-5+i*10/74,3.35,2.32),(.03,1.25,.06),steel)
for x in [-5,-2.5,0,2.5,5]:
    C('Guard post '+str(x),(x,3.95,2.86),.035,1.1,yellow)
for z in [2.85,3.4]:route('Guardrail '+str(z),[(-5,3.95,z),(5,3.95,z)],.035,yellow)
for i in range(9):B(f'Access stair {i}',(-5.5+i*.24,3.3,.23+i*.23),(.28,1.2,.08),steel)
for y in [2.65,3.95]:route('Stair handrail '+str(y),[(-5.7,y,1),(-3.5,y,3.4)],.035,yellow)
for y in [-3.25,-3.5]:B('Tray rail '+str(y),(0,y,.65),(11,.04,.12),steel)
for i in range(45):B(f'Tray rung {i}',(-5.5+i*.25,-3.375,.62),(.035,.25,.03),steel)
for i in range(3):route(f'Cable run {i}',[(-5,-3.3-i*.065,.68),(5,-3.3-i*.065,.68)],.022,rubber)
# Join static objects by asset parent/material to reduce draw calls without losing binding.
for parent in [root]+[o for o in bpy.data.objects if o.type=='EMPTY' and o.parent==root]:
    parts=[o for o in bpy.data.objects if o.type=='MESH' and o.parent==parent]
    if not parts:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join()
    o=bpy.context.object;o.name=parent.name+'_DETAIL';o.data.name=o.name+'_mesh'
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
# Color variation uses procedural nodes for the offline render; GLB retains base PBR values.
for material, low, high, scale in [(concrete,(.07,.075,.065,1),(.25,.26,.23,1),18),(steel,(.18,.22,.24,1),(.4,.45,.48,1),95)]:
    nodes=material.node_tree.nodes;links=material.node_tree.links
    noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=4
    ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=low;ramp.color_ramp.elements[1].color=high
    links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
# Export before adding render-only surroundings.
bpy.ops.export_scene.gltf(filepath=str(OUT/'module.glb'),export_format='GLB',export_extras=True,export_yup=True)
# Render scene with sky, soft key and ground context.
current=None
floor=B('Render ground',(0,0,-.55),(200,200,.2),mat('Yard asphalt',(.065,.075,.075),0,.9))
world=bpy.data.worlds.new('Industrial daylight');bpy.context.scene.world=world;world.use_nodes=True
nodes=world.node_tree.nodes;nodes.clear();sky=nodes.new('ShaderNodeTexSky');sky.sky_type='MULTIPLE_SCATTERING';sky.sun_elevation=math.radians(22);sky.sun_rotation=math.radians(125)
bg=nodes.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.035;out=nodes.new('ShaderNodeOutputWorld');world.node_tree.links.new(sky.outputs['Color'],bg.inputs['Color']);world.node_tree.links.new(bg.outputs[0],out.inputs[0])
for name,loc,power,size,color in [('Softbox',(1,-5,10),2200,8,(.76,.87,1)),('Warm rim',(-6,5,8),1800,6,(1,.77,.51))]:
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=color
    obj=bpy.data.objects.new(name,light);bpy.context.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,1.7))-obj.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('Presentation camera');camera=bpy.data.objects.new('Presentation camera',camdata);bpy.context.collection.objects.link(camera)
camera.location=(13,-16,10);camera.rotation_euler=(Vector((0,0,1.9))-camera.location).to_track_quat('-Z','Y').to_euler();camdata.lens=48
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.view_settings.exposure=-1.0;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'render.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'blender/assets/photoreal-section.blend'))
manifest={**config,'model_url':'preview/module.glb','render_url':'preview/render.png','asset_count':len(config['asset_ids']),'note':'Synthetic design study. Rendered and interactive views are labelled separately.'}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
bpy.ops.render.render(write_still=True)


