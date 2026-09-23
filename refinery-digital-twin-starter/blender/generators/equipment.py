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
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12 if detail == 0 else 40, radius=radius, depth=depth, location=location
    )
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
        obj = cylinder(
            f"{name}_{i}", (Vector(start) + Vector(end)) / 2, radius, delta.length, mat, detail
        )
        obj.rotation_euler = delta.to_track_quat("Z", "Y").to_euler()
        objects.append(obj)
    return objects


def platform(name, z, radius, steel, rail, detail):
    objects = [cylinder(name, (0, 0, z), radius, 0.22, steel, detail)]
    if detail:
        for i in range(12):
            angle = i * math.tau / 12
            x, y = radius * math.cos(angle), radius * math.sin(angle)
            objects.append(cylinder(f"{name}_rail_{i}", (x, y, z + 0.5), 0.05, 1, rail, 0))
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius,
            minor_radius=0.05,
            major_segments=24,
            minor_segments=6,
            location=(0, 0, z + 1),
        )
        objects.append(finish(bpy.context.object, name + "_handrail", rail))
    return objects


def stairs(name, height, x, steel, detail):
    objects = []
    count = max(2, int(height / (0.35 if detail else 1)))
    for i in range(count):
        objects.append(
            box(f"{name}_{i}", (x, i * 0.25, (i + 1) * height / count), (1, 0.28, 0.1), steel)
        )
    return objects


def lathe(name, profile, segments, mat):
    """Revolve an ordered (radius, z) profile around the local Z axis."""
    vertices = [
        (radius * math.cos(i * math.tau / segments), radius * math.sin(i * math.tau / segments), z)
        for radius, z in profile
        for i in range(segments)
    ]
    faces = []
    for row in range(len(profile) - 1):
        for i in range(segments):
            following = (i + 1) % segments
            faces.append(
                (
                    row * segments + i,
                    row * segments + following,
                    (row + 1) * segments + following,
                    (row + 1) * segments + i,
                )
            )
    mesh = bpy.data.meshes.new(name + "_mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat)


class Kit:
    """Local asset dimensions, palette and consistently named mesh primitives."""

    def __init__(self, asset, detail=1):
        dimensions = asset["dimensions"]
        self.h = dimensions["height"]
        self.r = dimensions["diameter"] / 2
        self.length = dimensions["length"]
        self.width = dimensions["width"]
        self.kind = asset["type"]
        self.name = asset["model_ref"]
        self.detail = detail
        self.objects = []
        self.steel = material("Brushed steel", (0.38, 0.48, 0.54))
        self.shell = material("Equipment shell", (0.64, 0.71, 0.73), 0.65)
        self.rail = material("Safety ochre", (0.72, 0.43, 0.12), 0.3)
        self.concrete = material("Concrete", (0.18, 0.22, 0.24), 0)

    def add(self, objects):
        self.objects.extend(objects)
        return objects

    def _add_object(self, obj):
        self.objects.append(obj)
        return obj

    def box(self, suffix, location, size, mat=None):
        return self._add_object(
            box(self.name + "_" + suffix, location, size, self.steel if mat is None else mat)
        )

    def cyl(self, suffix, location, radius, depth, mat=None, axis="Z"):
        if axis not in ("X", "Y", "Z"):
            raise ValueError(f"Unsupported cylinder axis: {axis}")
        obj = self._add_object(
            cylinder(
                self.name + "_" + suffix,
                location,
                radius,
                depth,
                self.shell if mat is None else mat,
                self.detail,
            )
        )
        if axis == "X":
            obj.rotation_euler.y = math.pi / 2
        elif axis == "Y":
            obj.rotation_euler.x = math.pi / 2
        return obj

    def cone(self, suffix, location, radius1, radius2, depth, mat=None, vertices=32):
        bpy.ops.mesh.primitive_cone_add(
            vertices=vertices, radius1=radius1, radius2=radius2, depth=depth, location=location
        )
        return self._add_object(
            finish(bpy.context.object, self.name + "_" + suffix, self.shell if mat is None else mat)
        )

    def sphere(self, suffix, location, radius, mat=None, scale=(1, 1, 1)):
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=24, ring_count=12, radius=radius, location=location
        )
        obj = self._add_object(
            finish(bpy.context.object, self.name + "_" + suffix, self.shell if mat is None else mat)
        )
        obj.scale = scale
        return obj

    def torus(self, suffix, location, radius, minor_radius, mat=None, segments=48):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius,
            minor_radius=minor_radius,
            major_segments=segments,
            minor_segments=6,
            location=location,
        )
        return self._add_object(
            finish(bpy.context.object, self.name + "_" + suffix, self.rail if mat is None else mat)
        )

    def route(self, suffix, points, radius, mat=None):
        objects = pipe_route(
            self.name + "_" + suffix,
            points,
            radius,
            self.shell if mat is None else mat,
            self.detail,
        )
        self.objects.extend(objects)
        return objects

    def platform(self, suffix, z, radius):
        objects = platform(self.name + "_" + suffix, z, radius, self.steel, self.rail, self.detail)
        self.objects.extend(objects)
        return objects

    def lathe(self, suffix, profile, segments, mat=None):
        return self._add_object(
            lathe(self.name + "_" + suffix, profile, segments, self.shell if mat is None else mat)
        )


def wrap_stair(k, r, h):
    steel, rail = k.steel, k.rail
    b, c = k.box, k.cyl
    # Circumferential stair with supported treads and outer handrail.
    steps = max(24, int(h / 0.3))
    rail_points = []
    for i in range(steps):
        angle = math.pi * 1.3 * i / (steps - 1)
        radius = r + 0.8
        obj = b(
            f"wrap_stair_{i}",
            (radius * math.cos(angle), radius * math.sin(angle), 0.7 + h * i / (steps - 1)),
            (1.6, 0.45, 0.12),
            steel,
        )
        obj.rotation_euler.z = angle
        rail_points.append(
            ((r + 1.5) * math.cos(angle), (r + 1.5) * math.sin(angle), 1.7 + h * i / (steps - 1))
        )
        if i % 4 == 0:
            c(
                f"stair_post_{i}",
                (
                    (r + 1.5) * math.cos(angle),
                    (r + 1.5) * math.sin(angle),
                    1.2 + h * i / (steps - 1),
                ),
                0.05,
                1,
                rail,
            )
    k.route("stair_rail", rail_points, 0.06, rail)


def roof_ring(k, r, z):
    rail = k.rail
    c = k.cyl
    # Roof safety ring, vents and visible service nozzles.
    for i in range(24):
        angle = math.tau * i / 24
        c(
            f"roof_post_{i}",
            ((r - 0.25) * math.cos(angle), (r - 0.25) * math.sin(angle), z - 0.5),
            0.055,
            1,
            rail,
        )
    k.torus("roof_handrail", (0, 0, z), r - 0.25, 0.06)


def ladder(k, x, h):
    """Build a ladder with its first rail at x."""
    r = x - 0.8
    rail = k.rail
    b = k.box
    for rail_x in [x, r + 1.5]:
        b("ladder_rail_" + str(rail_x), (rail_x, 0, h / 2), (0.07, 0.07, h), rail)
    for i in range(int(h / 0.4)):
        b("rung_" + str(i), (r + 1.15, 0, i * 0.4), (0.7, 0.07, 0.07), rail)


def build_storage_tank(k):
    h, r, detail = k.h, k.r, k.detail
    steel, shell, concrete = k.steel, k.shell, k.concrete
    c = k.cyl
    c("foundation", (0, 0, 0.3), r + 0.8, 0.6, concrete)
    c("shell", (0, 0, h / 2 + 0.6), r, h)
    k.cone("roof", (0, 0, h + 1.35), r, 0, 1.5)
    if detail:
        for z in [h * 0.25, h * 0.5, h * 0.75]:
            c("band_" + str(z), (0, 0, z), r + 0.06, 0.15, steel)
        wrap_stair(k, r, h)
        roof_ring(k, r, h + 1.6)
        for x in [-r / 3, r / 3]:
            c("vent_" + str(x), (x, 0, h + 1.9), 0.25, 1, steel)
        for y in [-r / 3, r / 3]:
            k.route(
                "inlet_" + str(y),
                [(r - 0.2, y, 1.5), (r + 3, y, 1.5), (r + 3, y, 0.7)],
                0.35,
                shell,
            )


def build_vertical_vessel(k):
    h, r, kind, detail = k.h, k.r, k.kind, k.detail
    steel, shell, concrete = k.steel, k.shell, k.concrete
    b, c = k.box, k.cyl
    c("skirt", (0, 0, 0.6), r + 0.5, 1.2, concrete)
    c("shell", (0, 0, h / 2), r, h)
    obj = k.sphere("head", (0, 0, h), r)
    obj.scale.z = 0.4
    if detail and kind != "flare":
        for i in range(1, 4):
            k.platform(f"platform_{i}", h * i / 4, r + 0.8)
        ladder(k, r + 0.8, h)
    if kind == "column" and detail:
        for i in range(3):
            z = h * (0.2 + i * 0.22)
            k.route(
                f"riser_{i}",
                [
                    (r - 0.1, 0, z),
                    (r + 2 + i * 0.6, 0, z),
                    (r + 2 + i * 0.6, 0, 1),
                    (r + 5 + i * 0.6, 0, 1),
                ],
                0.18 + i * 0.04,
                shell,
            )
            b(f"support_{i}", (r + 2, 0, z - 0.5), (4, 0.4, 0.25), steel)
    if kind == "flare":
        c("tip", (0, 0, h + 1), r * 1.3, 2, steel)
        for angle in [0, math.tau / 3, math.tau * 2 / 3]:
            k.route(
                "brace_" + str(angle),
                [
                    (8 * math.cos(angle), 8 * math.sin(angle), 0),
                    (r * math.cos(angle), r * math.sin(angle), h * 0.65),
                ],
                0.12,
                steel,
            )


def build_heat_exchanger(k):
    r, length = k.r, k.length
    steel, concrete = k.steel, k.concrete
    b, c = k.box, k.cyl
    c("shell", (0, 0, r + 1), r, length, axis="X")
    for x in [-length / 2, length / 2]:
        c("flange_" + str(x), (x, 0, r + 1), r + 0.2, 0.35, steel, axis="X")
    for x in [-length / 3, length / 3]:
        b("saddle_" + str(x), (x, 0, 0.6), (0.8, 2 * r, 1.2), concrete)
    for x in [-length / 3, length / 3]:
        c("nozzle_" + str(x), (x, 0, 2 * r + 1.3), 0.3, 1)


def build_pump(k):
    length, width = k.length, k.width
    steel, shell, concrete = k.steel, k.shell, k.concrete
    b, c = k.box, k.cyl
    b("base", (0, 0, 0.25), (length + 1, width + 1, 0.5), concrete)
    c("motor", (-length / 4, 0, 1.1), 0.7, length / 2, steel, axis="X")
    c("volute", (length / 4, 0, 1.1), 0.95, 0.7, axis="Y")
    k.route(
        "discharge",
        [(length / 4, 0, 1.1), (length / 4, 0, 2.7), (length / 4 + 1, 0, 2.7)],
        0.22,
        shell,
    )


def build_pipe_rack(k):
    h, length, width = k.h, k.length, k.width
    shell = k.shell
    b = k.box
    for x in [-length / 2, 0, length / 2]:
        for y in [-width / 2, width / 2]:
            b(f"post_{x}_{y}", (x, y, h / 2), (0.35, 0.35, h))
    for z in [h * 0.6, h]:
        for y in [-width / 2, width / 2]:
            b(f"long_{z}_{y}", (0, y, z), (length + 1, 0.3, 0.5))
        for x in [-length / 2, 0, length / 2]:
            b(f"cross_{z}_{x}", (x, 0, z), (0.3, width + 1, 0.5))
        for i in range(4):
            k.route(
                f"pipe_{z}_{i}",
                [
                    (-length / 2, -width / 2 + 0.8 + i, z + 0.6),
                    (length / 2, -width / 2 + 0.8 + i, z + 0.6),
                ],
                0.16,
                shell,
            )


def build_block(k):
    h, length, width, kind, detail = k.h, k.length, k.width, k.kind, k.detail
    steel, shell, rail, concrete = k.steel, k.shell, k.rail, k.concrete
    b, c = k.box, k.cyl
    b("body", (0, 0, h / 2), (length, width, h), concrete if kind == "building" else shell)
    b("roof", (0, 0, h + 0.2), (length + 0.4, width + 0.4, 0.4))
    if kind == "fired_heater":
        for x in [-length / 2 - 0.2, 0, length / 2 + 0.2]:
            for y in [-width / 2 - 0.2, width / 2 + 0.2]:
                b(f"frame_{x}_{y}", (x, y, h / 2), (0.35, 0.35, h), steel)
        for z in [h / 3, h * 2 / 3]:
            for y in [-width / 2 - 0.3, width / 2 + 0.3]:
                b(f"frame_band_{z}_{y}", (0, y, z), (length + 1, 0.4, 0.3), steel)
        c("stack", (0, 0, h + 6), 1.1, 12, steel)
        for x in [-length / 3, 0, length / 3]:
            b("burner_" + str(x), (x, -width / 2 - 0.1, 2), (1.5, 0.3, 2), rail)
    elif kind == "cooling_tower":
        for i in range(1, 12):
            for y in [-width / 2 - 0.05, width / 2 + 0.05]:
                b(f"louvre_{i}_{y}", (0, y, h * i / 12), (length, 0.16, 0.25), steel)
        for x in [-length / 4, length / 4]:
            c("fan_" + str(x), (x, 0, h + 0.6), width / 3, 0.8, steel)
    elif detail:
        for x in range(-int(length / 2) + 2, int(length / 2) - 1, 3):
            b("window_" + str(x), (x, -width / 2 - 0.03, h * 0.65), (1.5, 0.08, 1.2), steel)


def build_floating_roof_tank(k):
    h, r = k.h, k.r
    deck = 0.6 + h * 0.8                                  # roof floats at a partly-full level
    k.cyl('foundation', (0, 0, 0.3), r + 0.8, 0.6, k.concrete)
    # Open profiles keep the floating deck visible below the rim at both LODs.
    segments = 12 if k.detail == 0 else 40
    k.lathe('shell', [(r, 0.6), (r, h + 0.6), (r - 0.12, h + 0.6),
                      (r - 0.12, 0.6)], segments)
    k.lathe('rim', [(r + 0.15, h + 0.4), (r + 0.15, h + 0.7),
                    (r - 0.15, h + 0.7), (r - 0.15, h + 0.4),
                    (r + 0.15, h + 0.4)], segments, k.steel)
    k.cyl('deck', (0, 0, deck), r - 0.15, 0.12, k.steel)
    k.torus('pontoon', (0, 0, deck + 0.3), r - 1.0, 0.55, k.shell, segments=64)
    if k.detail:
        girder_z = 0.6 + h * 0.62
        k.lathe('wind_girder', [(r, girder_z - 0.07), (r + 0.55, girder_z - 0.07),
                               (r + 0.55, girder_z + 0.07), (r, girder_z + 0.07),
                               (r, girder_z - 0.07)], segments, k.steel)
        wrap_stair(k, r, h)
        for i in range(24):
            angle = math.tau * i / 24
            k.cyl(f'rim_post_{i}', ((r + 0.4) * math.cos(angle), (r + 0.4) * math.sin(angle), h + 1.2), 0.055, 1, k.rail)
        k.torus('rim_handrail', (0, 0, h + 1.7), r + 0.4, 0.06, k.rail)
        for i in range(8):
            angle = math.tau * i / 8
            k.box(f'foam_pourer_{i}', ((r + 0.3) * math.cos(angle), (r + 0.3) * math.sin(angle), h + 0.95),
                  (0.5, 0.5, 0.5), k.rail)
        obj = k.box('rolling_ladder', (r * 0.5, 0, (h + 0.7 + deck) / 2), (r * 0.9, 0.9, 0.12), k.rail)
        obj.rotation_euler.y = -math.atan2(h + 0.7 - deck, r * 0.9)
        for y in [-r / 3, r / 3]:
            k.route('inlet_' + str(y), [(r - 0.2, y, 1.5), (r + 3, y, 1.5), (r + 3, y, 0.7)], 0.35)


def build_sphere_tank(k):
    h, r = k.h, k.r
    centre = h - r                                        # overall height includes the crown
    k.cyl('foundation', (0, 0, 0.25), r + 1.5, 0.5, k.concrete)
    k.sphere('shell', (0, 0, centre), r)
    legs = 12 if r >= 8 else 8
    for i in range(legs):
        angle = math.tau * i / legs
        x, y = r * 0.92 * math.cos(angle), r * 0.92 * math.sin(angle)
        k.cyl(f'leg_{i}', (x, y, centre / 2), 0.32, centre, k.steel)
        k.box(f'leg_base_{i}', (x, y, 0.65), (1.2, 1.2, 0.3), k.concrete)
    if k.detail:
        for i in range(legs):
            a0, a1 = math.tau * i / legs, math.tau * (i + 1) / legs
            k.route(f'brace_{i}', [(r * 0.92 * math.cos(a0), r * 0.92 * math.sin(a0), 1.0),
                                   (r * 0.92 * math.cos(a1), r * 0.92 * math.sin(a1), centre * 0.6)], 0.08, k.steel)
        steps, points = 28, []
        for i in range(steps + 1):
            t = i / steps
            angle, lift, rad = math.pi * 1.5 * t, math.pi / 2 * t, r + 0.6
            points.append((rad * math.cos(lift) * math.cos(angle), rad * math.cos(lift) * math.sin(angle),
                           centre + rad * math.sin(lift)))
            if i < steps:
                obj = k.box(f'sphere_stair_{i}', points[-1], (1.0, 0.4, 0.1), k.steel)
                obj.rotation_euler.z = angle
        k.route('sphere_stair_rail', [(x, y, z + 1.0) for x, y, z in points], 0.06, k.rail)
        k.platform('crown_platform', h + 0.2, 1.8)
        ladder(k, r * 0.92 + 0.5, centre)


def build_bullet_tank(k):
    length, r = k.length, k.r
    cz = 1.5 + r
    for x in [-length / 3, length / 3]:
        k.box(f'saddle_{x}', (x, 0, 0.75), (1.0, 2 * r * 0.9, 1.5), k.concrete)
    k.cyl('shell', (0, 0, cz), r, length - 1.2 * r, axis='X')
    for sign in (-1, 1):
        k.sphere(f'head_{sign}', (sign * (length / 2 - 0.6 * r), 0, cz), r, scale=(0.6, 1, 1))
    if k.detail:
        k.box('walkway', (0, 0, cz + r + 0.1), (length * 0.6, 1.2, 0.1), k.steel)
        for i in range(int(length * 0.6 / 2) + 1):
            for y in (-0.55, 0.55):
                k.cyl(f'walkway_post_{i}_{y}', (-length * 0.3 + i * 2, y, cz + r + 0.6), 0.04, 1, k.rail)
        for y in (-0.55, 0.55):
            k.route(f'walkway_rail_{y}', [(-length * 0.3, y, cz + r + 1.1), (length * 0.3, y, cz + r + 1.1)], 0.05, k.rail)
        k.cyl('relief_valve', (length * 0.1, 0, cz + r + 0.8), 0.18, 1.4, k.steel)
        k.route('inlet', [(-length * 0.2, 0, cz - r + 0.2), (-length * 0.2, 0, 0.6), (-length * 0.2, r + 1.5, 0.6)], 0.15)
        ladder(k, length / 2 + 0.3, cz + r + 0.1)


def build_reactor(k):
    h, r = k.h, k.r
    skirt = 3.0
    body = h - skirt - r
    k.cyl('skirt', (0, 0, skirt / 2), r + 0.25, skirt, k.concrete)
    k.sphere('bottom_head', (0, 0, skirt), r, scale=(1, 1, 0.5))
    k.cyl('shell', (0, 0, skirt + body / 2), r, body)
    k.sphere('head', (0, 0, skirt + body), r)
    if k.detail:
        for i in range(1, 3):
            k.platform(f'platform_{i}', skirt + body * i / 2.5, r + 0.8)
        ladder(k, r + 0.8, h - r)
        k.cyl('inlet_nozzle', (0, 0, h - 0.2), r * 0.3, 1.6, k.steel)
        k.route('inlet', [(0, 0, h + 0.5), (0, r + 2, h + 0.5), (0, r + 2, 1.0)], 0.28)
        k.route('outlet', [(0, 0, skirt - r * 0.5), (0, 0, 0.8), (r + 3, 0, 0.8)], 0.28)
        for i in range(3):
            k.cyl(f'insulation_band_{i}', (0, 0, skirt + body * (0.2 + 0.3 * i)), r + 0.05, 0.2, k.steel)


def build_horizontal_drum(k):
    length, r, h = k.length, k.r, k.h
    cz = max(h - r, r + 0.8)                              # h is the top of the shell
    support = cz - r
    for x in [-length / 3, length / 3]:
        k.box(f'saddle_{x}', (x, 0, support / 2), (0.8, 2 * r * 0.9, support),
              k.steel if support > 1.5 else k.concrete)
        k.box(f'saddle_base_{x}', (x, 0, 0.15), (1.4, 2 * r + 0.4, 0.3), k.concrete)
    k.cyl('shell', (0, 0, cz), r, length - 1.2 * r, axis='X')
    for sign in (-1, 1):
        k.sphere(f'head_{sign}', (sign * (length / 2 - 0.6 * r), 0, cz), r, scale=(0.6, 1, 1))
    if k.detail:
        k.cyl('boot', (length / 4, 0, cz - r - 0.35), r * 0.35, 0.8)
        for i, x in enumerate([-length / 3, 0, length / 3]):
            k.cyl(f'nozzle_{i}', (x, 0, cz + r + 0.4), 0.22, 0.9, k.steel)
        k.box('platform', (0, r + 0.6, cz + r * 0.6), (length * 0.6, 1.0, 0.1), k.steel)
        for y in (r + 0.15, r + 1.05):
            k.route(f'platform_rail_{y}', [(-length * 0.3, y, cz + r * 0.6 + 1.0),
                                           (length * 0.3, y, cz + r * 0.6 + 1.0)], 0.05, k.rail)
        ladder(k, length / 2 + 0.3, cz + r * 0.6)


def build_air_cooler(k):
    length, width, h = k.length, k.width, k.h
    deck = h - 1.6                                        # bundle top; fan rings sit above it
    for x in (-length / 2 + 0.5, length / 2 - 0.5):
        for y in (-width / 2 + 0.5, width / 2 - 0.5):
            k.box(f'leg_{x}_{y}', (x, y, deck / 2), (0.45, 0.45, deck), k.steel)
    k.box('plenum', (0, 0, deck - 0.9), (length - 0.6, width - 0.6, 1.8), k.steel)
    k.box('bundle', (0, 0, deck + 0.3), (length, width, 0.6), k.shell)
    for sign in (-1, 1):
        k.box(f'header_{sign}', (sign * (length / 2 + 0.25), 0, deck + 0.3), (0.5, width - 0.4, 0.9), k.steel)
    fans = max(1, round(length / max(width, 1)))
    for i in range(fans):
        x = -length / 2 + (i + 0.5) * length / fans
        radius = min(width, length / fans) * 0.42
        k.torus(f'fan_ring_{i}', (x, 0, deck + 0.9), radius, 0.12, k.steel, segments=32)
        k.cyl(f'hub_{i}', (x, 0, deck + 0.9), 0.3, 0.5, k.rail)
        if k.detail:
            for b in range(4):
                obj = k.box(f'blade_{i}_{b}', (x, 0, deck + 0.9), (radius * 1.8, 0.35, 0.05), k.steel)
                obj.rotation_euler.z = math.pi * b / 4
            k.cyl(f'motor_{i}', (x, 0, deck - 2.1), 0.35, 0.8, k.steel)
    if k.detail:
        k.box('walkway', (0, width / 2 + 0.7, deck + 0.05), (length, 1.2, 0.1), k.steel)
        for i in range(int(length / 2) + 1):
            k.cyl(f'walkway_post_{i}', (-length / 2 + i * 2, width / 2 + 1.25, deck + 0.55), 0.04, 1, k.rail)
        k.route('walkway_rail', [(-length / 2, width / 2 + 1.25, deck + 1.05),
                                 (length / 2, width / 2 + 1.25, deck + 1.05)], 0.05, k.rail)
        ladder(k, length / 2 + 0.6, deck)


def build_compressor(k):
    length, width, h = k.length, k.width, k.h
    k.box('base', (0, 0, 0.4), (length + 1.5, width + 1.5, 0.8), k.concrete)
    k.cyl('motor', (-length / 4, 0, 1.75), 0.95, length * 0.42, k.steel, axis='X')
    k.box('casing', (length / 4, 0, 1.9), (length * 0.38, width * 0.8, 2.2), k.shell)
    k.cyl('coupling_guard', (0, 0, 1.75), 0.5, length * 0.14, k.rail, axis='X')
    k.route('suction', [(length / 4, 0, 3.0), (length / 4, 0, 4.4), (length / 4, width / 2 + 2, 4.4),
                        (length / 4, width / 2 + 2, 1.0)], 0.35)
    k.route('discharge', [(length / 4 + 1.2, 0, 3.0), (length / 4 + 1.2, 0, 4.9),
                          (length / 4 + 1.2, -width / 2 - 2, 4.9), (length / 4 + 1.2, -width / 2 - 2, 1.0)], 0.3)
    if k.detail:
        for x in (-length / 2 - 0.5, length / 2 + 0.5):
            for y in (-width / 2 - 0.5, width / 2 + 0.5):
                k.box(f'shelter_post_{x}_{y}', (x, y, h / 2), (0.3, 0.3, h), k.steel)
        k.box('shelter_roof', (0, 0, h + 0.15), (length + 2.2, width + 2.2, 0.3), k.steel)
        k.box('local_panel', (-length / 2, width / 2 + 0.2, 1.6), (0.8, 0.3, 1.6), k.steel)
        k.cyl('lube_skid', (-length / 4, -width / 2 - 0.2, 1.2), 0.5, 1.0, k.steel)


BUILDERS = {
    'reactor': build_reactor,
    'horizontal_drum': build_horizontal_drum,
    'air_cooler': build_air_cooler,
    'compressor': build_compressor,
    'floating_roof_tank': build_floating_roof_tank,
    'sphere_tank': build_sphere_tank,
    'bullet_tank': build_bullet_tank,

    "storage_tank": build_storage_tank,
    "column": build_vertical_vessel,
    "vessel": build_vertical_vessel,
    "flare": build_vertical_vessel,
    "heat_exchanger": build_heat_exchanger,
    "pump": build_pump,
    "pipe_rack": build_pipe_rack,
    "building": build_block,
    "fired_heater": build_block,
    "cooling_tower": build_block,
}


def build(asset, detail=1):
    """Generate local geometry; caller applies canonical transform and metadata."""
    k = Kit(asset, detail)
    BUILDERS[k.kind](k)
    return k.objects
