"""Generate original, non-canonical site context; no third-party model inputs."""
import json
import math
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[2]
assets = json.loads((ROOT / "data/normalized/assets.json").read_text())
xs = [a["position"]["x"] for a in assets]
ys = [a["position"]["y"] for a in assets]
x0, x1 = min(xs) - 26, max(xs) + 26
y0, y1 = min(ys) - 26, max(ys) + 26
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
width, depth = x1 - x0, y1 - y0
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Linear RGB values, restrained under the runtime HDRI. One mesh per material.
specs = {
    "Context_concrete": ((.34, .32, .28), .95, 0),
    "Context_road": ((.065, .062, .057), .96, 0),
    "Context_marking": ((.60, .57, .44), .9, 0),
    "Context_galvanized": ((.23, .25, .25), .65, .65),
    "Context_cabin": ((.61, .59, .52), .78, .05),
    "Context_trim": ((.07, .105, .12), .65, .2),
    "Context_window": ((.035, .07, .085), .25, .1),
}
parts = {name: ([], []) for name in specs}


def box(material, center, size):
    """Append a box directly to a material batch, without Blender operators."""
    vertices, faces = parts[material]
    start = len(vertices)
    x, y, z = center
    a, b, c = [value / 2 for value in size]
    vertices.extend([(x + dx * a, y + dy * b, z + dz * c)
                     for dx, dy, dz in [(-1, -1, -1), (1, -1, -1),
                                        (1, 1, -1), (-1, 1, -1),
                                        (-1, -1, 1), (1, -1, 1),
                                        (1, 1, 1), (-1, 1, 1)]])
    faces.extend([tuple(start + i for i in face) for face in
                  [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                   (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]])


# Match the original runtime slab and road elevations exactly.
box("Context_concrete", (cx, cy, -.725), (width, depth, .55))
for side in [-1, 1]:
    road_y = cy + side * (depth / 2 - 9)
    box("Context_road", (cx, road_y, -.4), (width - 10, 8, .1))
    for i in range(22):
        box("Context_marking", (cx - width / 2 + 12 + i * (width - 24) / 21, road_y, -.34), (3, .2, .018))


def fence(a, b):
    """Simple welded-wire fence: structural posts, rails and fine wire grid."""
    length = math.dist(a, b)
    horizontal = a[1] == b[1]
    count = math.ceil(length / 3)
    for i in range(count + 1):
        t = i / count
        x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        box("Context_galvanized", (x, y, .7), (.065, .065, 2.3))
        box("Context_concrete", (x, y, -.34), (.26, .26, .22))
    center = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    for height in [0, .45, .9, 1.35, 1.8]:
        box("Context_galvanized", (*center, height),
            (length, .018, .018) if horizontal else (.018, length, .018))
    wire_count = math.ceil(length / .5)
    for i in range(wire_count + 1):
        t = i / wire_count
        box("Context_galvanized", (a[0] + (b[0] - a[0]) * t,
                                   a[1] + (b[1] - a[1]) * t, .9), (.013, .013, 1.8))


# West entry aligns with the near internal road; an 8 m opening is unobstructed.
gate_y = y0 + 9
fence((x0, y0), (x1, y0))
fence((x1, y0), (x1, y1))
fence((x1, y1), (x0, y1))
fence((x0, y1), (x0, gate_y + 4))
fence((x0, gate_y - 4), (x0, y0))
box("Context_road", (x0 + 2.5, gate_y, -.4), (5, 8, .1))

# Cabins sit on the clear strip between the near road and equipment footprints.
# They are visual context only, never registered as plant equipment.
cabin_y = y0 + 21
for i in range(3):
    cabin_x = x0 + 21 + i * 17
    box("Context_concrete", (cabin_x, cabin_y, -.225), (12.5, 4.5, .45))
    box("Context_cabin", (cabin_x, cabin_y, 1.4), (12, 4, 2.8))
    box("Context_trim", (cabin_x, cabin_y, 2.86), (12.3, 4.25, .12))
    box("Context_trim", (cabin_x, cabin_y, .12), (12.08, 4.08, .15))
    for side in [-1, 1]:
        face_y = cabin_y + side * 2.025
        for offset in [-3.8, -.7, 2.4]:
            box("Context_trim", (cabin_x + offset, face_y, 1.75), (1.7, .07, 1.1))
            box("Context_window", (cabin_x + offset, face_y + side * .045, 1.75), (1.48, .025, .88))
    box("Context_trim", (cabin_x + 4.65, cabin_y - 2.055, 1.08), (.95, .06, 2.12))
    box("Context_cabin", (cabin_x + 4.65, cabin_y - 2.095, 1.08), (.8, .025, 1.98))
    box("Context_concrete", (cabin_x + 4.65, cabin_y - 2.65, -.1), (1.3, 1.1, .3))
    # Roof-mounted air conditioner and understated wall ribs.
    box("Context_cabin", (cabin_x - 2, cabin_y, 3.15), (1.3, 1, .48))
    for offset in range(-5, 6):
        for side in [-1, 1]:
            box("Context_cabin", (cabin_x + offset, cabin_y + side * 2.025, 1.4), (.035, .055, 2.65))

triangles = 0
for name, (color, roughness, metalness) in specs.items():
    vertices, faces = parts[name]
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metalness
    obj.data.materials.append(material)
    obj["category"] = "context"
    obj["presentation_only"] = True
    triangles += len(faces) * 2

output = ROOT / "data/normalized/assets/env/context.glb"
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB",
                          export_extras=True, export_yup=True)
assert len(bpy.data.objects) == len(specs) <= 8
assert output.stat().st_size < 2_000_000
print(json.dumps({"output": str(output), "bytes": output.stat().st_size,
                  "meshes": len(specs), "triangles": triangles,
                  "runtime_bounds": {"x": [x0, x1], "z": [-y1, -y0]},
                  "runtime_gate": [x0, -.45, -gate_y], "cabins": 3,
                  "provenance": "Original procedural geometry; no external models"}))
