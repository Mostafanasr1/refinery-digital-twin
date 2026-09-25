"""Convert the licensed source container to a grounded, metre-sized runtime GLB.

Run with Blender --background --python this_file -- /path/to/source.zip.
Source license and source SHA-256 are recorded in ASSETS.md. The source archive
is local intake; this script never downloads or accepts marketplace agreements.
"""
import hashlib
from pathlib import Path
import sys
import tempfile
import zipfile

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
EXPECTED = "b7ef4f9674896d663e1522b77c6a29ab54777320a3d91f6d88055d440ea3f632"
source = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
assert hashlib.sha256(source.read_bytes()).hexdigest() == EXPECTED, "Unexpected source archive"
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

with tempfile.TemporaryDirectory(prefix="refinery-container-") as temporary:
    directory = Path(temporary).resolve()
    with zipfile.ZipFile(source) as archive:
        for member in archive.infolist():
            target = (directory / member.filename).resolve()
            assert target.is_relative_to(directory), "Unsafe archive path"
        archive.extractall(directory)
    bpy.ops.import_scene.fbx(filepath=str(directory / "source/ShippingContainer_LOW.fbx"))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    assert meshes, "Source contains no mesh"
    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    low = Vector(tuple(min(v[axis] for v in corners) for axis in range(3)))
    high = Vector(tuple(max(v[axis] for v in corners) for axis in range(3)))
    extent = high - low
    # Source FBX is Z-up after import. Preserve its proportions and scale the
    # longest horizontal dimension to a 20-foot ISO container's 6.058 metres.
    scale = 6.058 / max(extent.x, extent.y)
    origin = Vector(((low.x + high.x) / 2, (low.y + high.y) / 2, low.z))
    material = bpy.data.materials.new("Sourced_container_Strifey7_CC_BY_4")
    material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    principled = nodes.get("Principled BSDF")
    principled.inputs["Roughness"].default_value = .78
    principled.inputs["Metallic"].default_value = .35
    for suffix, socket in [("BaseColor", "Base Color"), ("Normal", "Normal")]:
        path = directory / f"textures/ShippingContainer_ShippingContainer_mat_{suffix}.png"
        texture = nodes.new("ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(path))
        if max(texture.image.size) > 1024:
            texture.image.scale(1024, 1024)
        texture.image.pack()
        if suffix == "Normal":
            texture.image.colorspace_settings.name = "Non-Color"
            normal = nodes.new("ShaderNodeNormalMap")
            links.new(texture.outputs["Color"], normal.inputs["Color"])
            links.new(normal.outputs["Normal"], principled.inputs[socket])
        else:
            links.new(texture.outputs["Color"], principled.inputs[socket])
    for obj in meshes:
        # Bake original world transform before applying a common translation and
        # scale; object origin differences must not separate source submeshes.
        obj.data.transform(obj.matrix_world)
        obj.matrix_world.identity()
        for vertex in obj.data.vertices:
            vertex.co = (vertex.co - origin) * scale
        obj.data.materials.clear()
        obj.data.materials.append(material)
        for polygon in obj.data.polygons:
            polygon.material_index = 0
        obj.name = "presentation_sourced_container"
    output = ROOT / "data/normalized/assets/env/container.glb"
    bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", export_yup=True,
                              export_extras=False, export_cameras=False, export_lights=False)
    print(f"Container source bounds: {tuple(extent)}; metre scale: {scale}")
    print(f"Output: {output}; bytes: {output.stat().st_size}; sha256: {hashlib.sha256(output.read_bytes()).hexdigest()}")
