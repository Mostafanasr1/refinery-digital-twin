"""Prepare licensed Task 3 sources; no canonical inputs are modified."""

from pathlib import Path
import hashlib, json, math
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "tests/visual/output/stageC-task-03/sources"
OUT = ROOT / "data/normalized/assets/env"
for record in json.loads((ROOT / "docs/handbacks/evidence/stageC-task-03/source-intake.json").read_text(encoding="utf-8")):
    source_file = SRC / record["file"]
    if source_file.exists():
        assert hashlib.sha256(source_file.read_bytes()).hexdigest() == record["sha256"], str(source_file)

manifest = []


def prepare(name, file, length=None, first=False, triangles=None, bake=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SRC / file))
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if first:
        keep = meshes[0]
        for o in meshes[1:]:
            bpy.data.objects.remove(o, do_unlink=True)
        meshes = [keep]
    for o in meshes:
        o.animation_data_clear()
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector([min(v[i] for v in pts) for i in range(3)])
    hi = Vector([max(v[i] for v in pts) for i in range(3)])
    # Bake source transforms before grounding; vehicle longitudinal axis becomes Blender X.
    for o in meshes:
        o.data = o.data.copy()
        o.data.transform(o.matrix_world)
        o.matrix_world.identity()
        for v in o.data.vertices:
            v.co -= Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    if length:
        long = max(hi.x - lo.x, hi.y - lo.y)
        scale = length / long
        for o in meshes:
            for v in o.data.vertices:
                v.co *= scale
                if hi.y - lo.y > hi.x - lo.x:
                    v.co = Vector((v.co.y, -v.co.x, v.co.z))
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    if triangles:
        count = sum(len(p.vertices) - 2 for p in obj.data.polygons)
        mod = obj.modifiers.new("Presentation LOD", "DECIMATE")
        mod.ratio = min(1, triangles / count)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if bake:
        image = bpy.data.images.new(name + "_albedo", width=1024, height=1024)
        # Keep the source UV layer for material sampling while baking into a new atlas.
        obj.data.uv_layers.active.active_render = True
        original = obj.data.uv_layers.active.name
        for mat in obj.data.materials:
            if not mat or not mat.use_nodes:
                continue
            for node in list(mat.node_tree.nodes):
                if node.type == "TEX_IMAGE" and not node.inputs["Vector"].is_linked:
                    uv = mat.node_tree.nodes.new("ShaderNodeUVMap")
                    uv.uv_map = original
                    mat.node_tree.links.new(uv.outputs["UV"], node.inputs["Vector"])
            target = mat.node_tree.nodes.new("ShaderNodeTexImage")
            target.image = image
            mat.node_tree.nodes.active = target
        obj.data.uv_layers.new(name="PresentationAtlas")
        obj.data.uv_layers.active_index = len(obj.data.uv_layers) - 1
        obj.data.uv_layers.active.active_render = True
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(island_margin=0.012)
        bpy.ops.object.mode_set(mode="OBJECT")
        scene = bpy.context.scene
        scene.render.engine = "CYCLES"
        scene.cycles.samples = 1
        scene.render.bake.use_pass_direct = False
        scene.render.bake.use_pass_indirect = False
        scene.render.bake.use_pass_color = True
        scene.render.bake.margin = 8
        bpy.ops.object.bake(type="DIFFUSE")
        mat = bpy.data.materials.new(name + "_atlas")
        mat.use_nodes = True
        shader = mat.node_tree.nodes.get("Principled BSDF")
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        mat.node_tree.links.new(tex.outputs["Color"], shader.inputs["Base Color"])
        shader.inputs["Roughness"].default_value = 0.7
        shader.inputs["Metallic"].default_value = 0.15
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        for p in obj.data.polygons:
            p.material_index = 0
        for layer in list(obj.data.uv_layers):
            if layer.name != "PresentationAtlas":
                obj.data.uv_layers.remove(layer)
        image.pack()
    obj.name = name
    for image in bpy.data.images:
        if image.size[0] > 1024 or image.size[1] > 1024:
            image.scale(1024, 1024)
        if image.has_data:
            image.pack()
    target = OUT / (name + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=str(target),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_extras=False,
        export_yup=True,
    )
    b = target.read_bytes()
    manifest.append(
        dict(
            file=target.name,
            source=file,
            bytes=len(b),
            sha256=hashlib.sha256(b).hexdigest(),
            triangles=sum(len(p.vertices) - 2 for p in obj.data.polygons),
            bounds=[list(obj.dimensions)],
        )
    )
    print("PREPARED", manifest[-1], flush=True)


prepare("source-rock", "sand_rocks_small_01/sand_rocks_small_01_1k.gltf", triangles=900)
prepare("source-cabin", "cabins-sketchfab.glb", length=12, first=True)
prepare("source-pickup", "pickup-sketchfab.glb", length=5.4, bake=True)
prepare("source-tanker", "tanker-sketchfab.glb", length=8.6, bake=True)
(OUT / "sourced-models.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
