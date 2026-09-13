"""Reusable metre-scale generators. Each builder receives dimensions and detail level."""
import math
import bpy
from mathutils import Vector

MATERIALS = {}


def material(name, color, metallic=0.5):
    if name not in MATERIALS:
        mat = bpy.data.materials.new(name)
        mat.diffuse_color = (*color, 1)
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = (*color, 1)
        shader.inputs["Metallic"].default_value = metallic
        shader.inputs["Roughness"].default_value = 0.28
        MATERIALS[name] = mat
    return MATERIALS[name]


def finish(obj, name, mat):
    obj.name = name
    obj.data.name = name + "_mesh"
    obj.data.materials.append(mat)
    return obj


def box(name, location, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat)


def cylinder(name, location, radius, depth, mat, detail=1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12 if detail == 0 else 40, radius=radius,
                                      depth=depth, location=location)
    obj = finish(bpy.context.object, name, mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4
    return obj


def pipe_route(name, points, radius, mat, detail=1):
    objects = []
    for i, (start, end) in enumerate(zip(points, points[1:])):
        delta = Vector(end) - Vector(start)
        if delta.length < 0.001:
            continue
        obj = cylinder(f"{name}_{i}", (Vector(start) + Vector(end)) / 2,
                       radius, delta.length, mat, detail)
        obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
        objects.append(obj)
    return objects


def platform(name, z, radius, steel, rail, detail):
    objects = [cylinder(name, (0, 0, z), radius, 0.22, steel, detail)]
    if detail:
        for i in range(12):
            angle = i * math.tau / 12
            x, y = radius * math.cos(angle), radius * math.sin(angle)
            objects.append(cylinder(f"{name}_rail_{i}", (x, y, z+0.5), 0.05, 1, rail, 0))
        bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=0.05,
                                        major_segments=24, minor_segments=6, location=(0,0,z+1))
        objects.append(finish(bpy.context.object, name+'_handrail', rail))
    return objects


def stairs(name, height, x, steel, detail):
    objects = []
    count = max(2, int(height / (0.35 if detail else 1)))
    for i in range(count):
        objects.append(box(f"{name}_{i}", (x, i*0.25, (i+1)*height/count), (1,0.28,0.1), steel))
    return objects


def build(asset, detail=1):
    """Generate local geometry; caller applies canonical transform and metadata."""
    d = asset['dimensions']; h=d['height']; r=d['diameter']/2
    length=d['length']; width=d['width']; name=asset['model_ref']; kind=asset['type']
    steel=material('Brushed steel',(0.38,0.48,0.54))
    shell=material('Equipment shell',(0.64,0.71,0.73),0.65)
    rail=material('Safety ochre',(0.72,0.43,0.12),0.3)
    concrete=material('Concrete',(0.18,0.22,0.24),0)
    objects=[]
    def b(suffix, loc, size, mat=steel):
        obj=box(name+'_'+suffix,loc,size,mat);objects.append(obj);return obj
    def c(suffix, loc, rad, dep, mat=shell):
        obj=cylinder(name+'_'+suffix,loc,rad,dep,mat,detail);objects.append(obj);return obj
    if kind=='storage_tank':
        c('foundation',(0,0,0.3),r+0.8,0.6,concrete)
        c('shell',(0,0,h/2+0.6),r,h)
        bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=0,depth=1.5,location=(0,0,h+1.35))
        objects.append(finish(bpy.context.object,name+'_roof',shell))
        if detail:
            for z in [h*0.25,h*0.5,h*0.75]:c('band_'+str(z),(0,0,z),r+0.06,0.15,steel)
            # Circumferential stair with supported treads and outer handrail.
            steps=max(24,int(h/0.3))
            rail_points=[]
            for i in range(steps):
                angle=math.pi*1.3*i/(steps-1)
                radius=r+0.8
                obj=b(f'wrap_stair_{i}',(radius*math.cos(angle),radius*math.sin(angle),0.7+h*i/(steps-1)),(1.6,0.45,0.12),steel)
                obj.rotation_euler.z=angle
                rail_points.append(((r+1.5)*math.cos(angle),(r+1.5)*math.sin(angle),1.7+h*i/(steps-1)))
                if i%4==0:c(f'stair_post_{i}',((r+1.5)*math.cos(angle),(r+1.5)*math.sin(angle),1.2+h*i/(steps-1)),0.05,1,rail)
            objects.extend(pipe_route(name+'_stair_rail',rail_points,0.06,rail,detail))
            # Roof safety ring, vents and visible service nozzles.
            for i in range(24):
                angle=math.tau*i/24
                c(f'roof_post_{i}',((r-0.25)*math.cos(angle),(r-0.25)*math.sin(angle),h+1.1),0.055,1,rail)
            bpy.ops.mesh.primitive_torus_add(major_radius=r-0.25,minor_radius=0.06,major_segments=48,minor_segments=6,location=(0,0,h+1.6))
            objects.append(finish(bpy.context.object,name+'_roof_handrail',rail))
            for x in [-r/3,r/3]:c('vent_'+str(x),(x,0,h+1.9),0.25,1,steel)
            for y in [-r/3,r/3]:objects.extend(pipe_route(name+'_inlet_'+str(y),[(r-0.2,y,1.5),(r+3,y,1.5),(r+3,y,0.7)],0.35,shell,detail))
    elif kind in ['column','vessel','flare']:
        c('skirt',(0,0,0.6),r+0.5,1.2,concrete)
        c('shell',(0,0,h/2),r,h)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=r,location=(0,0,h))
        obj=finish(bpy.context.object,name+'_head',shell);obj.scale.z=0.4;objects.append(obj)
        if detail and kind!='flare':
            for i in range(1,4):objects.extend(platform(name+f'_platform_{i}',h*i/4,r+0.8,steel,rail,detail))
            for x in [r+0.8,r+1.5]:b('ladder_rail_'+str(x),(x,0,h/2),(0.07,0.07,h),rail)
            for i in range(int(h/0.4)):b('rung_'+str(i),(r+1.15,0,i*0.4),(0.7,0.07,0.07),rail)
        if kind=='column' and detail:
            for i in range(3):
                z=h*(0.2+i*0.22)
                objects.extend(pipe_route(name+f'_riser_{i}',[(r-0.1,0,z),(r+2+i*0.6,0,z),(r+2+i*0.6,0,1),(r+5+i*0.6,0,1)],0.18+i*0.04,shell,detail))
                b(f'support_{i}',(r+2,0,z-0.5),(4,0.4,0.25),steel)
        if kind=='flare':
            c('tip',(0,0,h+1),r*1.3,2,steel)
            for angle in [0,math.tau/3,math.tau*2/3]:
                objects.extend(pipe_route(name+'_brace_'+str(angle),[(8*math.cos(angle),8*math.sin(angle),0),(r*math.cos(angle),r*math.sin(angle),h*0.65)],0.12,steel,detail))
    elif kind=='heat_exchanger':
        obj=c('shell',(0,0,r+1),r,length);obj.rotation_euler.y=math.pi/2
        for x in [-length/2,length/2]:
            obj=c('flange_'+str(x),(x,0,r+1),r+0.2,0.35,steel);obj.rotation_euler.y=math.pi/2
        for x in [-length/3,length/3]:b('saddle_'+str(x),(x,0,0.6),(0.8,2*r,1.2),concrete)
        for x in [-length/3,length/3]:c('nozzle_'+str(x),(x,0,2*r+1.3),0.3,1)
    elif kind=='pump':
        b('base',(0,0,0.25),(length+1,width+1,0.5),concrete)
        obj=c('motor',(-length/4,0,1.1),0.7,length/2,steel);obj.rotation_euler.y=math.pi/2
        obj=c('volute',(length/4,0,1.1),0.95,0.7);obj.rotation_euler.x=math.pi/2
        objects.extend(pipe_route(name+'_discharge',[(length/4,0,1.1),(length/4,0,2.7),(length/4+1,0,2.7)],0.22,shell,detail))
    elif kind=='pipe_rack':
        for x in [-length/2,0,length/2]:
            for y in [-width/2,width/2]:b(f'post_{x}_{y}',(x,y,h/2),(0.35,0.35,h))
        for z in [h*0.6,h]:
            for y in [-width/2,width/2]:b(f'long_{z}_{y}',(0,y,z),(length+1,0.3,0.5))
            for x in [-length/2,0,length/2]:b(f'cross_{z}_{x}',(x,0,z),(0.3,width+1,0.5))
            for i in range(4):objects.extend(pipe_route(name+f'_pipe_{z}_{i}',[(-length/2,-width/2+0.8+i,z+0.6),(length/2,-width/2+0.8+i,z+0.6)],0.16,shell,detail))
    else:
        b('body',(0,0,h/2),(length,width,h),concrete if kind=='building' else shell)
        b('roof',(0,0,h+0.2),(length+0.4,width+0.4,0.4))
        if kind=='fired_heater':
            for x in [-length/2-0.2,0,length/2+0.2]:
                for y in [-width/2-0.2,width/2+0.2]:b(f'frame_{x}_{y}',(x,y,h/2),(0.35,0.35,h),steel)
            for z in [h/3,h*2/3]:
                for y in [-width/2-0.3,width/2+0.3]:b(f'frame_band_{z}_{y}',(0,y,z),(length+1,0.4,0.3),steel)
            c('stack',(0,0,h+6),1.1,12,steel)
            for x in [-length/3,0,length/3]:b('burner_'+str(x),(x,-width/2-0.1,2),(1.5,0.3,2),rail)
        elif kind=='cooling_tower':
            for i in range(1,12):
                for y in [-width/2-0.05,width/2+0.05]:b(f'louvre_{i}_{y}',(0,y,h*i/12),(length,0.16,0.25),steel)
            for x in [-length/4,length/4]:c('fan_'+str(x),(x,0,h+0.6),width/3,0.8,steel)
        elif detail:
            for x in range(-int(length/2)+2,int(length/2)-1,3):b('window_'+str(x),(x,-width/2-0.03,h*0.65),(1.5,0.08,1.2),steel)
    return objects
