"""Check registered silhouettes against the plain-Python catalog in Blender."""

from pathlib import Path
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from pipeline.catalog import SILHOUETTES  # noqa: E402
from blender.generators.equipment import BUILDERS, build  # noqa: E402


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
    print(f"Checked {len(SILHOUETTES)} silhouettes at 2 detail levels")


if __name__ == "__main__":
    main()
