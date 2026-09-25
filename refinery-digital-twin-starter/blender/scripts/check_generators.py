"""Check registered silhouettes against the plain-Python catalog in Blender."""

from pathlib import Path
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from pipeline.catalog import SILHOUETTES  # noqa: E402
from blender.generators.equipment import BUILDERS, build  # noqa: E402
from blender.generators.material_stage import CONFIG, role_for  # noqa: E402
from blender.generators.hero_detail import BUILDERS as HERO_BUILDERS, build as build_hero  # noqa: E402


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    require(
        set(BUILDERS) == set(SILHOUETTES),
        f"Registry/catalog mismatch: missing={set(SILHOUETTES) - set(BUILDERS)}, "
        f"extra={set(BUILDERS) - set(SILHOUETTES)}",
    )
    for kind, entry in SILHOUETTES.items():
        dimensions = entry["sample"]
        prefix = f"CHK-{kind}"
        for detail in (0, 1):
            label = f"{kind} detail={detail}"
            objects = build({"model_ref": prefix, "type": kind, "dimensions": dimensions}, detail)
            bpy.context.view_layer.update()
            require(objects, f"{label}: no parts generated")
            names = [obj.name for obj in objects]
            if kind == 'sphere_tank':
                shell = next(obj for obj in objects if obj.name == prefix + '_shell')
                require(all(face.use_smooth for face in shell.data.polygons), f'{label}: sphere shell has flat normals')
                require(len(shell.data.vertices) >= 1900, f'{label}: sphere silhouette tessellation too low')
            require(len(names) == len(set(names)), f"{label}: duplicate part names")
            require(
                all(name.startswith(prefix + "_") for name in names),
                f"{label}: part name missing model_ref prefix",
            )
            for obj in objects:
                require(obj.type == "MESH", f"{label}: {obj.name} is not a mesh")
                require(
                    len(obj.data.materials) > 0 and all(obj.data.materials),
                    f"{label}: {obj.name} has no material",
                )
                for mat in obj.data.materials:
                    require(role_for(kind, obj.name.removeprefix(prefix + '_'), mat.name) in CONFIG['materials'], f'{label}: unmapped part {obj.name}')
            corners = [
                obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box
            ]
            minimum = [min(point[axis] for point in corners) for axis in range(3)]
            maximum = [max(point[axis] for point in corners) for axis in range(3)]
            height = maximum[2] - minimum[2]
            footprint = max(maximum[axis] - minimum[axis] for axis in (0, 1))
            require(minimum[2] >= -0.3, f"{label}: minimum z {minimum[2]:.3f} below -0.3 m")
            require(
                0.8 * dimensions["height"] <= height <= 2.2 * dimensions["height"],
                f"{label}: height {height:.3f} outside sample tolerance",
            )
            limit = max(dimensions[key] for key in ("length", "width", "diameter")) + 14
            require(footprint <= limit, f"{label}: footprint {footprint:.3f} exceeds {limit} m")
            for obj in objects:
                mesh = obj.data
                bpy.data.objects.remove(obj, do_unlink=True)
                if mesh.users == 0:
                    bpy.data.meshes.remove(mesh)
    required = {'column': 'hero_cage', 'flare': 'hero_platform', 'fired_heater': 'hero_stair', 'storage_tank': 'hero_tank_manway', 'floating_roof_tank': 'hero_tank_manway', 'pipe_rack': 'hero_tray'}
    require(set(SILHOUETTES) == set(HERO_BUILDERS), 'Slice detail must cover every registered type')
    required.update({kind: 'slice_' for kind in HERO_BUILDERS if kind not in required})
    for kind in HERO_BUILDERS:
        asset = {'model_ref': 'HERO-' + kind, 'type': kind, 'dimensions': SILHOUETTES[kind]['sample']}
        require(build_hero(asset, 0) == [], f'{kind}: level 0 must add no geometry')
        objects = build_hero(asset, 1)
        bpy.context.view_layer.update()
        names = [obj.name for obj in objects]
        require(len(set(names)) == len(names), f'{kind}: duplicate hero part names')
        require(any(required[kind] in name for name in names), f'{kind}: required secondary detail missing')
        limit = max(asset['dimensions'].values()) + 14
        for obj in objects:
            require(obj.type == 'MESH' and obj.name.startswith(tuple(asset['model_ref'] + '_' + prefix for prefix in ('hero_', 'slice_'))), f'{kind}: invalid hero part')
            corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
            require(min(point.z for point in corners) >= -.001, f'{obj.name}: hero detail below grade')
            require(max(abs(point.x) for point in corners) <= limit and max(abs(point.y) for point in corners) <= limit, f'{obj.name}: unreasonable footprint')
            require(max(point.z for point in corners) <= asset['dimensions']['height'] * 2.2 + 2, f'{obj.name}: unreasonable height')
            for mat in obj.data.materials:
                require(role_for(kind, obj.name.removeprefix(asset['model_ref'] + '_'), mat.name) in CONFIG['materials'], f'{obj.name}: unmapped material')
        for obj in objects:
            mesh = obj.data
            bpy.data.objects.remove(obj, do_unlink=True)
            if not mesh.users:
                bpy.data.meshes.remove(mesh)
    print(f"Checked {len(SILHOUETTES)} silhouettes at 2 detail levels; {len(HERO_BUILDERS)} hero types at levels 0 and 1")


if __name__ == "__main__":
    main()
