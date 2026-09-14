# Phase 1 — Silhouette Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the procedural equipment library from 10 to 22 recognizable refinery silhouettes, with one tested source of truth for equipment types shared by the schema, the Blender generators and the runtime proxies, and populate the synthetic plant with an LPG area and a diesel hydrotreater that use them.

**Architecture:** `pipeline/catalog.py` (plain Python, no Blender) lists every canonical `type` with a sample dimension set; pytest asserts it equals the `asset.schema.json` enum and vitest asserts the runtime proxy table covers the enum. `blender/generators/equipment.py` is refactored into a `Kit` helper (naming, palette, part list) plus a `BUILDERS` registry so each silhouette is one function of the four canonical dimensions. `blender/scripts/check_generators.py` builds every catalogued type at both detail levels inside Blender and fails on structural mistakes. Runtime changes are limited to the proxy fallback shapes and the site foundation pads.

**Tech Stack:** Blender 5.2 LTS (`bpy`, `mathutils`) at `D:\blender\blender.exe`, Python 3.11 in `.venv` (pytest, jsonschema), TypeScript/React Three Fiber (vitest), npm scripts. All commands run from the project root `refinery-digital-twin-starter/` in PowerShell (no `&&`; use separate commands).

**Read first:** `AGENTS.md`, `docs/superpowers/plans/2026-09-14-roadmap.md` §1–2, `blender/generators/equipment.py`, `blender/scripts/build_demo_refinery.py`, `app/src/Scene.tsx` lines 46–63 (`Proxy`), `app/src/Atmosphere.tsx` line 71 (`Site` pads).

**Coordinate conventions:** Blender/data are Z-up metres; asset local origin is ground centre. Runtime maps `(x, y, z) → (x, z, -y)` in `app/src/data/registry.ts`. `dimensions` = `{height, diameter, length, width}`; `height` is the top of the main body (stacks may exceed it, checked ≤ 2.2×).

---

## File map

| Path | Responsibility |
|---|---|
| Create `pipeline/catalog.py` | `SILHOUETTES`: canonical type → description + sample dimensions. No bpy import. |
| Create `tests/test_catalog.py` | Catalog ⇔ schema enum sync; sample completeness. |
| Modify `blender/generators/equipment.py` | `Kit`, shared part helpers (`wrap_stair`, `roof_ring`, `ladder`, `lathe`), one `build_<type>` per silhouette, `BUILDERS`, `build()`. |
| Create `blender/scripts/check_generators.py` | In-Blender self-check of every builder at detail 0 and 1. |
| Create `scripts/check_generators.py` | Launches Blender for the self-check (same discovery as `scripts/build_models.py`). |
| Modify `package.json` | `check:generators` script. |
| Create `app/src/data/silhouettes.ts` | `proxyFamily` and `selfFoundation` tables. |
| Create `app/src/data/silhouettes.test.ts` | Proxy table covers the schema enum. |
| Modify `app/src/Scene.tsx:46-63` | `Proxy` picks geometry by family. |
| Modify `app/src/Atmosphere.tsx:71` | `Site` skips pads for `selfFoundation` types. |
| Modify `schemas/asset.schema.json` | `type` enum grows per task. |
| Modify `data/synthetic/{units,assets,model_bindings,telemetry}.json` | New units and assets. |
| Regenerate `data/normalized/**`, `blender/assets/refinery.blend` | By `npm run build:models` / `npm run normalize`. |
| Create `PHASE_9.md`; modify `README.md`, `docs/BLENDER_PIPELINE.md`, `blender/README.md` | Documentation. |

---

### Task 1: Silhouette catalog as the single source of truth

**Files:**
- Create: `pipeline/catalog.py`
- Test: `tests/test_catalog.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_catalog.py
import json
from pipeline.catalog import SILHOUETTES
from pipeline.validate import ROOT


def test_catalog_matches_asset_schema():
    schema = json.loads((ROOT / "schemas/asset.schema.json").read_text())
    assert set(SILHOUETTES) == set(schema["properties"]["type"]["enum"])


def test_catalog_samples_are_complete():
    for kind, entry in SILHOUETTES.items():
        assert entry["description"], kind
        assert set(entry["sample"]) == {"height", "diameter", "length", "width"}, kind
        assert all(value > 0 for value in entry["sample"].values()), kind
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node scripts/python.mjs -m pytest tests/test_catalog.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'pipeline.catalog'`

- [ ] **Step 3: Create the catalog with the 10 existing types**

```python
# pipeline/catalog.py
"""Silhouette catalog: the one list of equipment types the schema, generators and runtime agree on.

Keys are canonical asset ``type`` values. ``sample`` is a representative metre-scale dimension set
used by the Blender generator self-check and by documentation. No Blender imports live here so the
pipeline tests can load it.
"""
SILHOUETTES = {
    "storage_tank": {
        "description": "Cone-roof atmospheric storage tank with spiral stair and roof handrail",
        "sample": {"height": 16.2, "diameter": 28, "length": 8, "width": 4},
    },
    "pump": {
        "description": "Horizontal centrifugal pump with motor, volute and discharge riser",
        "sample": {"height": 2, "diameter": 3, "length": 5, "width": 2},
    },
    "heat_exchanger": {
        "description": "Shell-and-tube exchanger on saddles with end flanges and nozzles",
        "sample": {"height": 4, "diameter": 2.5, "length": 10, "width": 4},
    },
    "fired_heater": {
        "description": "Box (cabin) fired heater with structural frame, burners and stack",
        "sample": {"height": 18, "diameter": 3, "length": 14, "width": 10},
    },
    "column": {
        "description": "Distillation column with skirt, platforms, ladder and draw-off risers",
        "sample": {"height": 44, "diameter": 6, "length": 8, "width": 4},
    },
    "vessel": {
        "description": "Vertical drum with skirt, platforms and ladder",
        "sample": {"height": 10, "diameter": 4, "length": 8, "width": 4},
    },
    "flare": {
        "description": "Guyed flare stack with tip and three braces",
        "sample": {"height": 65, "diameter": 3, "length": 8, "width": 4},
    },
    "pipe_rack": {
        "description": "Two-tier steel pipe rack with four pipe runs per tier",
        "sample": {"height": 8, "diameter": 3, "length": 22, "width": 5},
    },
    "building": {
        "description": "Concrete utility building with windows",
        "sample": {"height": 7, "diameter": 3, "length": 24, "width": 14},
    },
    "cooling_tower": {
        "description": "Mechanical-draft cooling tower with louvres and two fans",
        "sample": {"height": 12, "diameter": 3, "length": 12, "width": 10},
    },
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node scripts/python.mjs -m pytest tests/test_catalog.py -v`
Expected: `2 passed`

- [ ] **Step 5: Lint and commit**

Run: `node scripts/python.mjs -m ruff check pipeline tests`
Expected: `All checks passed!`

```bash
git add pipeline/catalog.py tests/test_catalog.py
git commit -m "feat(pipeline): silhouette catalog as single source of truth for asset types"
```

---

### Task 2: Refactor the generators into a Kit + BUILDERS registry with a Blender self-check

This task must not change what the existing 10 types look like. The self-check is the test; the regenerated GLB must still pass `tests/test_glb.py`.

**Files:**
- Modify: `blender/generators/equipment.py` (whole file)
- Create: `blender/scripts/check_generators.py`
- Create: `scripts/check_generators.py`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add the npm script and the Blender launcher**

In `package.json` add after `"build:models"`:

```json
    "check:generators": "node scripts/python.mjs -m scripts.check_generators",
```

```python
# scripts/check_generators.py
"""Run the Blender generator self-check; BLENDER_BIN overrides local discovery."""
import os
from pathlib import Path
import shutil
import subprocess
from pipeline.validate import ROOT

executable = os.environ.get("BLENDER_BIN") or shutil.which("blender")
if not executable and Path("D:/blender/blender.exe").exists():
    executable = "D:/blender/blender.exe"
if not executable:
    raise SystemExit("Set BLENDER_BIN to your Blender executable")
subprocess.run([executable, "--background", "--python-exit-code", "1", "--python",
                str(ROOT / "blender/scripts/check_generators.py")], cwd=ROOT, check=True)
```

- [ ] **Step 2: Write the in-Blender self-check (the failing test)**

```python
# blender/scripts/check_generators.py
"""blender --background --python-exit-code 1 --python blender/scripts/check_generators.py

Builds every catalogued silhouette at both detail levels and fails on structural mistakes:
unregistered types, parts not prefixed by the model_ref, parts below grade, or a height/footprint
that does not match the requested dimensions.
"""
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'blender' / 'generators'))
from pipeline.catalog import SILHOUETTES  # noqa: E402
from equipment import BUILDERS, build  # noqa: E402


def check(kind, detail):
    sample = SILHOUETTES[kind]['sample']
    asset = {'model_ref': f'CHK-{kind}', 'type': kind, 'dimensions': sample}
    objects = build(asset, detail)
    bpy.context.view_layer.update()
    problems = []
    if not objects:
        return [f'{kind}/{detail}: builder produced no parts']
    names = [obj.name for obj in objects]
    if len(set(names)) != len(names):
        problems.append(f'{kind}/{detail}: duplicate part names')
    for obj in objects:
        if not obj.name.startswith(asset['model_ref'] + '_'):
            problems.append(f'{kind}/{detail}: part {obj.name} is not prefixed by the model_ref')
        if obj.type != 'MESH' or not obj.data.materials:
            problems.append(f'{kind}/{detail}: part {obj.name} is not a mesh with a material')
    corners = [obj.matrix_world @ Vector(c) for obj in objects for c in obj.bound_box]
    lo = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
    hi = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
    height, footprint = hi.z - lo.z, max(hi.x - lo.x, hi.y - lo.y)
    largest = max(sample['length'], sample['width'], sample['diameter'])
    if lo.z < -0.3:
        problems.append(f'{kind}/{detail}: geometry {lo.z:.2f} m below grade')
    if not 0.8 * sample['height'] <= height <= 2.2 * sample['height']:
        problems.append(f'{kind}/{detail}: built height {height:.1f} m vs requested {sample["height"]} m')
    if footprint > largest + 14:
        problems.append(f'{kind}/{detail}: footprint {footprint:.1f} m exceeds {largest + 14:.1f} m')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    return problems


bpy.ops.wm.read_factory_settings(use_empty=True)
problems = []
if set(BUILDERS) != set(SILHOUETTES):
    problems.append(f'BUILDERS {sorted(BUILDERS)} != catalog {sorted(SILHOUETTES)}')
for kind in sorted(SILHOUETTES):
    for detail in (0, 1):
        problems.extend(check(kind, detail))
if problems:
    print('\n'.join(problems))
    sys.exit(1)
print(f'Checked {len(SILHOUETTES)} silhouettes at 2 detail levels')
```

- [ ] **Step 3: Run the self-check to verify it fails**

Run: `npm run check:generators`
Expected: FAIL — `ImportError: cannot import name 'BUILDERS' from 'equipment'` and a non-zero exit.

- [ ] **Step 4: Rewrite `blender/generators/equipment.py`**

Replace the whole file. Geometry for the 10 existing types is moved verbatim into per-type functions; only the plumbing changes.

```python
# blender/generators/equipment.py
"""Reusable metre-scale generators. Each builder receives a Kit carrying dimensions, palette and detail level."""
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from pipeline.catalog import SILHOUETTES  # noqa: E402,F401

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


def lathe(name, profile, segments, mat):
    """Revolve a list of (radius, z) pairs around Z into an open-ended smooth surface."""
    verts, faces = [], []
    for radius, z in profile:
        for j in range(segments):
            angle = math.tau * j / segments
            verts.append((radius * math.cos(angle), radius * math.sin(angle), z))
    for i in range(len(profile) - 1):
        for j in range(segments):
            a, b = i * segments + j, i * segments + (j + 1) % segments
            faces.append((a, b, b + segments, a + segments))
    mesh = bpy.data.meshes.new(name + '_mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat)


class Kit:
    """Per-asset naming, palette and part collection shared by every builder."""

    def __init__(self, asset, detail):
        d = asset['dimensions']
        self.h, self.r = d['height'], d['diameter'] / 2
        self.length, self.width = d['length'], d['width']
        self.kind, self.name, self.detail = asset['type'], asset['model_ref'], detail
        self.objects = []
        self.steel = material('Brushed steel', (0.38, 0.48, 0.54))
        self.shell = material('Equipment shell', (0.64, 0.71, 0.73), 0.65)
        self.rail = material('Safety ochre', (0.72, 0.43, 0.12), 0.3)
        self.concrete = material('Concrete', (0.18, 0.22, 0.24), 0)

    def add(self, objects):
        self.objects.extend(objects)
        return objects

    def box(self, suffix, loc, size, mat=None):
        obj = box(f'{self.name}_{suffix}', loc, size, mat or self.steel)
        self.objects.append(obj)
        return obj

    def cyl(self, suffix, loc, radius, depth, mat=None, axis='Z'):
        obj = cylinder(f'{self.name}_{suffix}', loc, radius, depth, mat or self.shell, self.detail)
        if axis == 'X':
            obj.rotation_euler.y = math.pi / 2
        elif axis == 'Y':
            obj.rotation_euler.x = math.pi / 2
        self.objects.append(obj)
        return obj

    def cone(self, suffix, loc, radius_bottom, radius_top, depth, mat=None, vertices=32):
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius_bottom, radius2=radius_top,
                                        depth=depth, location=loc)
        obj = finish(bpy.context.object, f'{self.name}_{suffix}', mat or self.shell)
        self.objects.append(obj)
        return obj

    def sphere(self, suffix, loc, radius, mat=None, scale=(1, 1, 1)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=loc)
        obj = finish(bpy.context.object, f'{self.name}_{suffix}', mat or self.shell)
        obj.scale = scale
        self.objects.append(obj)
        return obj

    def torus(self, suffix, loc, major, minor, mat=None, segments=48):
        bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=segments,
                                        minor_segments=6, location=loc)
        obj = finish(bpy.context.object, f'{self.name}_{suffix}', mat or self.rail)
        self.objects.append(obj)
        return obj

    def route(self, suffix, points, radius, mat=None):
        return self.add(pipe_route(f'{self.name}_{suffix}', points, radius, mat or self.shell, self.detail))

    def platform(self, suffix, z, radius):
        return self.add(platform(f'{self.name}_{suffix}', z, radius, self.steel, self.rail, self.detail))

    def lathe(self, suffix, profile, segments, mat=None):
        obj = lathe(f'{self.name}_{suffix}', profile, segments, mat or self.shell)
        self.objects.append(obj)
        return obj


# --- shared sub-assemblies ---------------------------------------------------------------------

def wrap_stair(k, r, h):
    """Circumferential stair with supported treads and an outer handrail (tanks)."""
    steps = max(24, int(h / 0.3))
    rail_points = []
    for i in range(steps):
        angle = math.pi * 1.3 * i / (steps - 1)
        radius = r + 0.8
        obj = k.box(f'wrap_stair_{i}', (radius * math.cos(angle), radius * math.sin(angle),
                                        0.7 + h * i / (steps - 1)), (1.6, 0.45, 0.12), k.steel)
        obj.rotation_euler.z = angle
        rail_points.append(((r + 1.5) * math.cos(angle), (r + 1.5) * math.sin(angle), 1.7 + h * i / (steps - 1)))
        if i % 4 == 0:
            k.cyl(f'stair_post_{i}', ((r + 1.5) * math.cos(angle), (r + 1.5) * math.sin(angle),
                                      1.2 + h * i / (steps - 1)), 0.05, 1, k.rail)
    k.route('stair_rail', rail_points, 0.06, k.rail)


def roof_ring(k, r, z):
    """Safety handrail ring just inside a tank roof edge; z is the handrail height."""
    for i in range(24):
        angle = math.tau * i / 24
        k.cyl(f'roof_post_{i}', ((r - 0.25) * math.cos(angle), (r - 0.25) * math.sin(angle), z - 0.5), 0.055, 1, k.rail)
    k.torus('roof_handrail', (0, 0, z), r - 0.25, 0.06, k.rail)


def ladder(k, x, h):
    """Vertical ladder from grade: rails at x and x + 0.7, rungs every 0.4 m."""
    for offset in (0, 0.7):
        k.box(f'ladder_rail_{x + offset}', (x + offset, 0, h / 2), (0.07, 0.07, h), k.rail)
    for i in range(int(h / 0.4)):
        k.box(f'rung_{i}', (x + 0.35, 0, i * 0.4), (0.7, 0.07, 0.07), k.rail)


# --- builders ------------------------------------------------------------------------------------

def build_storage_tank(k):
    h, r = k.h, k.r
    k.cyl('foundation', (0, 0, 0.3), r + 0.8, 0.6, k.concrete)
    k.cyl('shell', (0, 0, h / 2 + 0.6), r, h)
    k.cone('roof', (0, 0, h + 1.35), r, 0, 1.5)
    if k.detail:
        for z in [h * 0.25, h * 0.5, h * 0.75]:
            k.cyl('band_' + str(z), (0, 0, z), r + 0.06, 0.15, k.steel)
        wrap_stair(k, r, h)
        roof_ring(k, r, h + 1.6)
        for x in [-r / 3, r / 3]:
            k.cyl('vent_' + str(x), (x, 0, h + 1.9), 0.25, 1, k.steel)
        for y in [-r / 3, r / 3]:
            k.route('inlet_' + str(y), [(r - 0.2, y, 1.5), (r + 3, y, 1.5), (r + 3, y, 0.7)], 0.35)


def build_vertical_vessel(k):
    """column, vessel and flare share a skirt + shell + head; detail differs by kind."""
    h, r = k.h, k.r
    k.cyl('skirt', (0, 0, 0.6), r + 0.5, 1.2, k.concrete)
    k.cyl('shell', (0, 0, h / 2), r, h)
    k.sphere('head', (0, 0, h), r, scale=(1, 1, 0.4))
    if k.detail and k.kind != 'flare':
        for i in range(1, 4):
            k.platform(f'platform_{i}', h * i / 4, r + 0.8)
        ladder(k, r + 0.8, h)
    if k.kind == 'column' and k.detail:
        for i in range(3):
            z = h * (0.2 + i * 0.22)
            k.route(f'riser_{i}', [(r - 0.1, 0, z), (r + 2 + i * 0.6, 0, z), (r + 2 + i * 0.6, 0, 1),
                                   (r + 5 + i * 0.6, 0, 1)], 0.18 + i * 0.04)
            k.box(f'support_{i}', (r + 2, 0, z - 0.5), (4, 0.4, 0.25), k.steel)
    if k.kind == 'flare':
        k.cyl('tip', (0, 0, h + 1), r * 1.3, 2, k.steel)
        for angle in [0, math.tau / 3, math.tau * 2 / 3]:
            k.route('brace_' + str(angle), [(8 * math.cos(angle), 8 * math.sin(angle), 0),
                                            (r * math.cos(angle), r * math.sin(angle), h * 0.65)], 0.12, k.steel)


def build_heat_exchanger(k):
    length, r = k.length, k.r
    k.cyl('shell', (0, 0, r + 1), r, length, axis='X')
    for x in [-length / 2, length / 2]:
        k.cyl('flange_' + str(x), (x, 0, r + 1), r + 0.2, 0.35, k.steel, axis='X')
    for x in [-length / 3, length / 3]:
        k.box('saddle_' + str(x), (x, 0, 0.6), (0.8, 2 * r, 1.2), k.concrete)
    for x in [-length / 3, length / 3]:
        k.cyl('nozzle_' + str(x), (x, 0, 2 * r + 1.3), 0.3, 1)


def build_pump(k):
    length, width = k.length, k.width
    k.box('base', (0, 0, 0.25), (length + 1, width + 1, 0.5), k.concrete)
    k.cyl('motor', (-length / 4, 0, 1.1), 0.7, length / 2, k.steel, axis='X')
    k.cyl('volute', (length / 4, 0, 1.1), 0.95, 0.7, axis='Y')
    k.route('discharge', [(length / 4, 0, 1.1), (length / 4, 0, 2.7), (length / 4 + 1, 0, 2.7)], 0.22)


def build_pipe_rack(k):
    length, width, h = k.length, k.width, k.h
    for x in [-length / 2, 0, length / 2]:
        for y in [-width / 2, width / 2]:
            k.box(f'post_{x}_{y}', (x, y, h / 2), (0.35, 0.35, h))
    for z in [h * 0.6, h]:
        for y in [-width / 2, width / 2]:
            k.box(f'long_{z}_{y}', (0, y, z), (length + 1, 0.3, 0.5))
        for x in [-length / 2, 0, length / 2]:
            k.box(f'cross_{z}_{x}', (x, 0, z), (0.3, width + 1, 0.5))
        for i in range(4):
            k.route(f'pipe_{z}_{i}', [(-length / 2, -width / 2 + 0.8 + i, z + 0.6),
                                      (length / 2, -width / 2 + 0.8 + i, z + 0.6)], 0.16)


def build_block(k):
    """building, fired_heater and cooling_tower: a body box with kind-specific dressing."""
    length, width, h, kind = k.length, k.width, k.h, k.kind
    k.box('body', (0, 0, h / 2), (length, width, h), k.concrete if kind == 'building' else k.shell)
    k.box('roof', (0, 0, h + 0.2), (length + 0.4, width + 0.4, 0.4))
    if kind == 'fired_heater':
        for x in [-length / 2 - 0.2, 0, length / 2 + 0.2]:
            for y in [-width / 2 - 0.2, width / 2 + 0.2]:
                k.box(f'frame_{x}_{y}', (x, y, h / 2), (0.35, 0.35, h), k.steel)
        for z in [h / 3, h * 2 / 3]:
            for y in [-width / 2 - 0.3, width / 2 + 0.3]:
                k.box(f'frame_band_{z}_{y}', (0, y, z), (length + 1, 0.4, 0.3), k.steel)
        k.cyl('stack', (0, 0, h + 6), 1.1, 12, k.steel)
        for x in [-length / 3, 0, length / 3]:
            k.box('burner_' + str(x), (x, -width / 2 - 0.1, 2), (1.5, 0.3, 2), k.rail)
    elif kind == 'cooling_tower':
        for i in range(1, 12):
            for y in [-width / 2 - 0.05, width / 2 + 0.05]:
                k.box(f'louvre_{i}_{y}', (0, y, h * i / 12), (length, 0.16, 0.25), k.steel)
        for x in [-length / 4, length / 4]:
            k.cyl('fan_' + str(x), (x, 0, h + 0.6), width / 3, 0.8, k.steel)
    elif k.detail:
        for x in range(-int(length / 2) + 2, int(length / 2) - 1, 3):
            k.box('window_' + str(x), (x, -width / 2 - 0.03, h * 0.65), (1.5, 0.08, 1.2), k.steel)


BUILDERS = {
    'storage_tank': build_storage_tank,
    'column': build_vertical_vessel,
    'vessel': build_vertical_vessel,
    'flare': build_vertical_vessel,
    'heat_exchanger': build_heat_exchanger,
    'pump': build_pump,
    'pipe_rack': build_pipe_rack,
    'building': build_block,
    'fired_heater': build_block,
    'cooling_tower': build_block,
}


def build(asset, detail=1):
    """Generate local geometry; caller applies canonical transform and metadata."""
    kit = Kit(asset, detail)
    BUILDERS[asset['type']](kit)
    return kit.objects
```

- [ ] **Step 5: Run the self-check to verify it passes**

Run: `npm run check:generators`
Expected: last line `Checked 10 silhouettes at 2 detail levels`, exit 0.

If a type fails the height/footprint bounds, fix the bound in `check_generators.py` only if the geometry is
legitimately outside it (e.g. the flare's 8 m braces); never weaken a check to hide a builder bug.

- [ ] **Step 6: Regenerate the plant and run the full check**

Run: `npm run build:models`
Expected: prints `{"assets": 43, "detail": 1, "mesh_objects": ..., "triangles": ...}` and exits 0. Triangle count should be within a few percent of 168252 (same geometry, same parts).

Run: `npm run check`
Expected: all green (vitest 11 passed, pytest 18 passed, ruff clean, build ok).

- [ ] **Step 7: Commit**

```bash
git add blender/generators/equipment.py blender/scripts/check_generators.py scripts/check_generators.py package.json data/normalized blender/assets/refinery.blend
git commit -m "refactor(blender): Kit + BUILDERS registry and in-Blender generator self-check"
```

---

### Task 3: Runtime proxy families

The GLB path is type-agnostic. Only the primitive `Proxy` fallback and the site pads need to know about type families. This task keeps the 10 existing types looking identical in proxy mode.

**Files:**
- Create: `app/src/data/silhouettes.ts`
- Test: `app/src/data/silhouettes.test.ts`
- Modify: `app/src/Scene.tsx:46-63`
- Modify: `app/src/Atmosphere.tsx:71`

- [ ] **Step 1: Write the failing test**

```ts
// app/src/data/silhouettes.test.ts
import { expect, it } from 'vitest';
import schema from '../../../schemas/asset.schema.json';
import { proxyFamily, selfFoundation } from './silhouettes';

it('every canonical asset type has a proxy family and nothing else does', () => {
  const types = schema.properties.type.enum as string[];
  expect(Object.keys(proxyFamily).sort()).toEqual([...types].sort());
  for (const type of selfFoundation) expect(types).toContain(type);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -w app -- silhouettes`
Expected: FAIL — `Failed to resolve import "./silhouettes"`

- [ ] **Step 3: Create the table**

```ts
// app/src/data/silhouettes.ts
/** Fallback primitive shape per canonical asset type when GLB geometry is unavailable. */
export type ProxyFamily = 'vertical' | 'horizontal' | 'box' | 'sphere' | 'rack' | 'pump' | 'stack';
export const proxyFamily: Record<string, ProxyFamily> = {
  storage_tank: 'vertical',
  pump: 'pump',
  heat_exchanger: 'horizontal',
  fired_heater: 'box',
  column: 'vertical',
  vessel: 'vertical',
  flare: 'stack',
  pipe_rack: 'rack',
  building: 'box',
  cooling_tower: 'box',
};
/** Types whose generator draws its own foundation, so the site adds no concrete pad. */
export const selfFoundation = new Set<string>(['storage_tank']);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -w app -- silhouettes`
Expected: `1 passed`

- [ ] **Step 5: Make `Proxy` and `Site` use the tables**

In `app/src/Scene.tsx` add the import after line 10:

```ts
import { proxyFamily } from './data/silhouettes';
```

Replace the `Proxy` function (lines 46–63) with:

```tsx
function Proxy({ asset, active, tint, dim }: { asset: Asset; active: boolean; tint?: string; dim?: boolean }) {
  const { height: h, diameter: d, length: l, width: w } = asset.dimensions;
  const family = proxyFamily[asset.type] ?? 'vertical';
  const color = dim ? '#26353d' : active ? '#4ed9e8' : tint ? tint : asset.type === 'pipe_rack' ? '#536b77' : asset.type === 'fired_heater' ? '#b99671' : '#a9bcc4';
  const material = <meshStandardMaterial color={color} metalness={0.45} roughness={0.48} emissive={active ? '#167382' : '#000000'} emissiveIntensity={0.3} />;
  const box = (key: string, pos: [number, number, number], scale: [number, number, number]) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={pos}><boxGeometry args={scale} />{material}</mesh>;
  const cylinder = (key: string, y: number, radius: number, height: number) => <mesh key={key} name={`${asset.model_ref}_${key}`} position={[0, y, 0]}><cylinderGeometry args={[radius, radius, height, 24]} />{material}</mesh>;
  if (family === 'rack') return <>
    {[-l / 2, 0, l / 2].flatMap((x, i) => [-w / 2, w / 2].map((z, j) => box(`post_${i}_${j}`, [x, h / 2, z], [0.6, h, 0.6])))}
    {[h * 0.6, h].flatMap((y, i) => [box(`beam_${i}`, [0, y, 0], [l + 1, 0.6, w + 1]), ...[-2, 0, 2].map((z, j) => box(`pipe_${i}_${j}`, [0, y + 0.6, z], [l + 1, 0.25, 0.25]))])}
  </>;
  if (family === 'pump') return <>{box('base', [0, 0.3, 0], [l + 1, 0.6, w + 1])}<mesh name={`${asset.model_ref}_motor`} position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.85, 0.85, l, 16]} />{material}</mesh>{box('discharge', [l / 2, 2, 0], [0.5, 2, 0.5])}</>;
  if (family === 'horizontal') return <><mesh name={`${asset.model_ref}_shell`} position={[0, d / 2 + 1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[d / 2, d / 2, l, 24]} />{material}</mesh>{[-l / 3, l / 3].map((x, i) => box(`saddle_${i}`, [x, 0.7, 0], [1, 1.4, d]))}</>;
  if (family === 'box') return <>{box('body', [0, h / 2, 0], [l, h, w])}{asset.type === 'fired_heater' ? cylinder('stack', h + 6, 1.1, 12) : box('roof', [0, h + 0.3, 0], [l + 1, 0.6, w + 1])}</>;
  if (family === 'sphere') return <><mesh name={`${asset.model_ref}_shell`} position={[0, h - d / 2, 0]}><sphereGeometry args={[d / 2, 24, 16]} />{material}</mesh>
    {[0, 1, 2, 3].map(i => <mesh key={i} name={`${asset.model_ref}_leg_${i}`} position={[Math.cos(i * Math.PI / 2) * d * 0.4, (h - d / 2) / 2, Math.sin(i * Math.PI / 2) * d * 0.4]}><cylinderGeometry args={[0.3, 0.3, h - d / 2, 8]} />{material}</mesh>)}</>;
  if (family === 'stack') return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 1.5, 0.6)}</>;
  return <>{cylinder('shell', h / 2, d / 2, h)}{cylinder('foundation', 0.3, d / 2 + 0.7, 0.6)}
    {asset.type === 'storage_tank' || asset.type === 'floating_roof_tank' ? <mesh name={`${asset.model_ref}_roof`} position={[0, h + 0.6, 0]}><coneGeometry args={[d / 2, 1.2, 32]} />{material}</mesh> : [0.25, 0.5, 0.75, 1].map((fraction, i) => cylinder(`platform_${i}`, h * fraction, d / 2 + 0.7, 0.3))}
    {asset.type === 'column' ? box('ladder', [d / 2 + 0.5, h / 2, 0], [0.4, h, 0.7]) : null}
  </>;
}
```

In `app/src/Atmosphere.tsx` add the import after line 9:

```ts
import { selfFoundation } from './data/silhouettes';
```

and change line 71 from `{assets.filter(a=>a.type!=='storage_tank').map(` to `{assets.filter(a=>!selfFoundation.has(a.type)).map(`.

- [ ] **Step 6: Verify**

Run: `npm run check`
Expected: green (vitest now 12 passed).

Run: `npm start` then open http://localhost:3000/, switch Geometry to "Primitive proxies", confirm the plant looks as before. Stop the server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add app/src/data/silhouettes.ts app/src/data/silhouettes.test.ts app/src/Scene.tsx app/src/Atmosphere.tsx
git commit -m "feat(app): proxy families table shared with the asset schema"
```

---

### Task 4: Tank family — floating_roof_tank, sphere_tank, bullet_tank

**Files:**
- Modify: `pipeline/catalog.py`, `schemas/asset.schema.json`, `app/src/data/silhouettes.ts`, `blender/generators/equipment.py`
- Modify: `data/synthetic/units.json`, `data/synthetic/assets.json`, `data/synthetic/model_bindings.json`, `data/synthetic/telemetry.json`

- [ ] **Step 1: Add catalog entries (pytest goes red)**

Append inside `SILHOUETTES` in `pipeline/catalog.py`:

```python
    "floating_roof_tank": {
        "description": "External floating-roof tank: open top, pontoon deck below the rim, wind girder, rolling ladder",
        "sample": {"height": 16.2, "diameter": 28, "length": 8, "width": 4},
    },
    "sphere_tank": {
        "description": "LPG pressure sphere on tubular legs with cross bracing and a spiral stair to the crown",
        "sample": {"height": 20, "diameter": 16, "length": 8, "width": 4},
    },
    "bullet_tank": {
        "description": "Horizontal LPG bullet with dished heads on concrete saddles, top walkway and relief valve",
        "sample": {"height": 5, "diameter": 3.5, "length": 20, "width": 4},
    },
```

Run: `node scripts/python.mjs -m pytest tests/test_catalog.py -v`
Expected: FAIL — `test_catalog_matches_asset_schema` (set mismatch).

- [ ] **Step 2: Extend the schema enum (pytest green, vitest red)**

In `schemas/asset.schema.json` add to the `type.enum` array after `"cooling_tower"`:

```json
        "floating_roof_tank",
        "sphere_tank",
        "bullet_tank"
```

Run: `node scripts/python.mjs -m pytest tests/test_catalog.py -v` → `2 passed`.
Run: `npm run test -w app -- silhouettes` → FAIL (proxy table missing the three types).

- [ ] **Step 3: Extend the proxy table (vitest green)**

In `app/src/data/silhouettes.ts` add to `proxyFamily`:

```ts
  floating_roof_tank: 'vertical',
  sphere_tank: 'sphere',
  bullet_tank: 'horizontal',
```

and change `selfFoundation` to `new Set<string>(['storage_tank', 'floating_roof_tank', 'sphere_tank'])`.

Run: `npm run test -w app -- silhouettes` → `1 passed`.

- [ ] **Step 4: Run the generator check to see it fail on the unregistered builders**

Run: `npm run check:generators`
Expected: FAIL — `BUILDERS [...] != catalog [...]`.

- [ ] **Step 5: Add the three builders**

Insert into `blender/generators/equipment.py` before the `BUILDERS = {` line:

```python
def build_floating_roof_tank(k):
    h, r = k.h, k.r
    deck = 0.6 + h * 0.8                                  # roof floats at a partly-full level
    k.cyl('foundation', (0, 0, 0.3), r + 0.8, 0.6, k.concrete)
    k.cyl('shell', (0, 0, h / 2 + 0.6), r, h)
    k.cyl('rim', (0, 0, h + 0.55), r + 0.15, 0.3, k.steel)
    k.cyl('deck', (0, 0, deck), r - 0.15, 0.12, k.steel)
    k.torus('pontoon', (0, 0, deck + 0.3), r - 1.0, 0.55, k.shell, segments=64)
    if k.detail:
        k.cyl('wind_girder', (0, 0, 0.6 + h * 0.62), r + 0.55, 0.14, k.steel)
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
```

Register them in `BUILDERS`:

```python
    'floating_roof_tank': build_floating_roof_tank,
    'sphere_tank': build_sphere_tank,
    'bullet_tank': build_bullet_tank,
```

Run: `npm run check:generators` → `Checked 13 silhouettes at 2 detail levels`.

- [ ] **Step 6: Add the LPG unit and five assets to the synthetic plant**

Append to `data/synthetic/units.json`:

```json
  {
    "unit_id": "unit_lpg",
    "area_id": "area_500",
    "name": "LPG storage"
  }
```

Append to `data/synthetic/assets.json` (all share `"facility_id": "demo_refinery"`, `"rotation": {"x": 0, "y": 0, "z": 0}`, `"status": "online"`, `"interactive": true`, `"synthetic": true`):

```json
  {
    "asset_id": "asset_tk103", "tag": "TK-103", "name": "Crude Storage Tank (floating roof)",
    "type": "floating_roof_tank", "facility_id": "demo_refinery", "area_id": "area_100", "unit_id": "unit_crude",
    "service": "crude_storage", "status": "online", "model_ref": "TK-103",
    "position": {"x": 0, "y": 76, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 16.2, "length": 8, "width": 4, "diameter": 28}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_sp501", "tag": "SP-501", "name": "LPG Storage Sphere A",
    "type": "sphere_tank", "facility_id": "demo_refinery", "area_id": "area_500", "unit_id": "unit_lpg",
    "service": "lpg_storage", "status": "online", "model_ref": "SP-501",
    "position": {"x": 215, "y": -8, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 20, "length": 8, "width": 4, "diameter": 16}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_sp502", "tag": "SP-502", "name": "LPG Storage Sphere B",
    "type": "sphere_tank", "facility_id": "demo_refinery", "area_id": "area_500", "unit_id": "unit_lpg",
    "service": "lpg_storage", "status": "online", "model_ref": "SP-502",
    "position": {"x": 215, "y": 14, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 20, "length": 8, "width": 4, "diameter": 16}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_bt501", "tag": "BT-501", "name": "Propane Bullet",
    "type": "bullet_tank", "facility_id": "demo_refinery", "area_id": "area_500", "unit_id": "unit_lpg",
    "service": "lpg_storage", "status": "online", "model_ref": "BT-501",
    "position": {"x": 240, "y": -12, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 5, "length": 20, "width": 4, "diameter": 3.5}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_bt502", "tag": "BT-502", "name": "Butane Bullet",
    "type": "bullet_tank", "facility_id": "demo_refinery", "area_id": "area_500", "unit_id": "unit_lpg",
    "service": "lpg_storage", "status": "online", "model_ref": "BT-502",
    "position": {"x": 240, "y": -4, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 5, "length": 20, "width": 4, "diameter": 3.5}, "interactive": true, "synthetic": true
  }
```

Append to `data/synthetic/model_bindings.json`:

```json
  {"asset_id": "asset_tk103", "model_ref": "TK-103", "node_name": "TK-103"},
  {"asset_id": "asset_sp501", "model_ref": "SP-501", "node_name": "SP-501"},
  {"asset_id": "asset_sp502", "model_ref": "SP-502", "node_name": "SP-502"},
  {"asset_id": "asset_bt501", "model_ref": "BT-501", "node_name": "BT-501"},
  {"asset_id": "asset_bt502", "model_ref": "BT-502", "node_name": "BT-502"}
```

Append to `data/synthetic/telemetry.json` (mirrors the existing record shape):

```json
  {"point_id": "tp_asset_tk103_level", "asset_id": "asset_tk103", "parameter": "level", "value": 64, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_tk103_health", "asset_id": "asset_tk103", "parameter": "health", "value": 95, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_sp501_pressure", "asset_id": "asset_sp501", "parameter": "pressure", "value": 7.8, "unit": "barg", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_sp501_health", "asset_id": "asset_sp501", "parameter": "health", "value": 99, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_sp502_pressure", "asset_id": "asset_sp502", "parameter": "pressure", "value": 7.6, "unit": "barg", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_sp502_health", "asset_id": "asset_sp502", "parameter": "health", "value": 98, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"}
```

- [ ] **Step 7: Rebuild, check, look**

Run: `npm run build:models` → report shows `"assets": 48`.
Run: `npm run check` → green (pytest includes `test_glb.py` coverage of the new nodes).
Run: `npm start`, open http://localhost:3000/, search `SP-501`, `BT-501`, `TK-103`; confirm sphere on legs, horizontal bullet with heads, open-top tank with deck. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add pipeline/catalog.py schemas/asset.schema.json app/src/data/silhouettes.ts blender/generators/equipment.py data/synthetic data/normalized blender/assets/refinery.blend
git commit -m "feat(silhouettes): floating-roof tank, LPG sphere and bullet with an LPG storage unit"
```

---

### Task 5: Process family — reactor, horizontal_drum, air_cooler, compressor

**Files:** same set as Task 4.

- [ ] **Step 1: Catalog entries (pytest red)**

```python
    "reactor": {
        "description": "Thick-walled hydrotreating reactor: tall skirt, hemispherical heads, top inlet, two platforms",
        "sample": {"height": 24, "diameter": 3.6, "length": 8, "width": 4},
    },
    "horizontal_drum": {
        "description": "Horizontal separator drum with dished heads on steel saddles, water boot and top platform",
        "sample": {"height": 5, "diameter": 2.6, "length": 8, "width": 4},
    },
    "air_cooler": {
        "description": "Fin-fan air cooler: elevated bundle with header boxes, fan rings, motors and side walkway",
        "sample": {"height": 8, "diameter": 3, "length": 12, "width": 6},
    },
    "compressor": {
        "description": "Motor-driven centrifugal compressor on a concrete base under an open shelter",
        "sample": {"height": 6, "diameter": 3, "length": 9, "width": 4},
    },
```

Run pytest catalog test → FAIL.

- [ ] **Step 2: Schema enum (pytest green, vitest red)**

Add `"reactor", "horizontal_drum", "air_cooler", "compressor"` to the enum. Run pytest → pass; vitest silhouettes → FAIL.

- [ ] **Step 3: Proxy table (vitest green)**

```ts
  reactor: 'vertical',
  horizontal_drum: 'horizontal',
  air_cooler: 'box',
  compressor: 'pump',
```

Run vitest silhouettes → pass. Run `npm run check:generators` → FAIL (registry mismatch).

- [ ] **Step 4: Builders**

```python
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
```

Register: `'reactor': build_reactor, 'horizontal_drum': build_horizontal_drum, 'air_cooler': build_air_cooler, 'compressor': build_compressor,`

Run `npm run check:generators` → `Checked 17 silhouettes at 2 detail levels`.

- [ ] **Step 5: Hydrotreater unit and four assets**

Append to `data/synthetic/units.json`:

```json
  {
    "unit_id": "unit_hds",
    "area_id": "area_200",
    "name": "Diesel hydrotreater"
  }
```

Append to `data/synthetic/assets.json` (same constant fields as Task 4; `area_id` `area_200`, `unit_id` `unit_hds`):

```json
  {
    "asset_id": "asset_c501", "tag": "C-501", "name": "Recycle Gas Compressor",
    "type": "compressor", "facility_id": "demo_refinery", "area_id": "area_200", "unit_id": "unit_hds",
    "service": "recycle_gas", "status": "online", "model_ref": "C-501",
    "position": {"x": 58, "y": 62, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 6, "length": 9, "width": 4, "diameter": 3}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_r501", "tag": "R-501", "name": "Diesel Hydrotreater Reactor",
    "type": "reactor", "facility_id": "demo_refinery", "area_id": "area_200", "unit_id": "unit_hds",
    "service": "hydrotreating", "status": "online", "model_ref": "R-501",
    "position": {"x": 72, "y": 62, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 24, "length": 8, "width": 4, "diameter": 3.6}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_ea501", "tag": "EA-501", "name": "Reactor Effluent Air Cooler",
    "type": "air_cooler", "facility_id": "demo_refinery", "area_id": "area_200", "unit_id": "unit_hds",
    "service": "effluent_cooling", "status": "online", "model_ref": "EA-501",
    "position": {"x": 90, "y": 62, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 8, "length": 12, "width": 6, "diameter": 3}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_v501", "tag": "V-501", "name": "Cold Separator",
    "type": "horizontal_drum", "facility_id": "demo_refinery", "area_id": "area_200", "unit_id": "unit_hds",
    "service": "separation", "status": "online", "model_ref": "V-501",
    "position": {"x": 108, "y": 62, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 5, "length": 8, "width": 4, "diameter": 2.6}, "interactive": true, "synthetic": true
  }
```

Bindings:

```json
  {"asset_id": "asset_c501", "model_ref": "C-501", "node_name": "C-501"},
  {"asset_id": "asset_r501", "model_ref": "R-501", "node_name": "R-501"},
  {"asset_id": "asset_ea501", "model_ref": "EA-501", "node_name": "EA-501"},
  {"asset_id": "asset_v501", "model_ref": "V-501", "node_name": "V-501"}
```

Telemetry:

```json
  {"point_id": "tp_asset_r501_temperature", "asset_id": "asset_r501", "parameter": "inlet_temperature", "value": 345, "unit": "degC", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_r501_pressure", "asset_id": "asset_r501", "parameter": "pressure", "value": 62, "unit": "barg", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_r501_health", "asset_id": "asset_r501", "parameter": "health", "value": 96, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_c501_power", "asset_id": "asset_c501", "parameter": "power", "value": 4.2, "unit": "MW", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_c501_health", "asset_id": "asset_c501", "parameter": "health", "value": 93, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_ea501_temperature", "asset_id": "asset_ea501", "parameter": "outlet_temperature", "value": 55, "unit": "degC", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_v501_pressure", "asset_id": "asset_v501", "parameter": "pressure", "value": 58, "unit": "barg", "status": "normal", "quality": "good", "timestamp": "synthetic"}
```

- [ ] **Step 6: Rebuild, check, look**

`npm run build:models` → `"assets": 52`. `npm run check` → green. `npm start` and inspect `R-501`, `EA-501`, `C-501`, `V-501`.

- [ ] **Step 7: Commit**

```bash
git add pipeline/catalog.py schemas/asset.schema.json app/src/data/silhouettes.ts blender/generators/equipment.py data/synthetic data/normalized blender/assets/refinery.blend
git commit -m "feat(silhouettes): reactor, horizontal drum, air cooler, compressor with a hydrotreater unit"
```

---

### Task 6: Fired family — cylindrical_heater, stack

- [ ] **Step 1: Catalog entries (pytest red)**

```python
    "cylindrical_heater": {
        "description": "Vertical cylindrical fired heater on legs: radiant section, conical transition, convection box, stack",
        "sample": {"height": 20, "diameter": 6, "length": 8, "width": 4},
    },
    "stack": {
        "description": "Free-standing tapered steel stack with base ring, two platforms and aviation lights",
        "sample": {"height": 45, "diameter": 2.5, "length": 8, "width": 4},
    },
```

- [ ] **Step 2: Schema enum** — add `"cylindrical_heater", "stack"`. pytest green, vitest red.

- [ ] **Step 3: Proxy table** — add `cylindrical_heater: 'vertical', stack: 'stack',`. vitest green; `check:generators` red.

- [ ] **Step 4: Builders**

```python
def build_cylindrical_heater(k):
    h, r = k.h, k.r
    legs, radiant = 2.2, h * 0.62
    k.cyl('base', (0, 0, 0.3), r + 0.6, 0.6, k.concrete)
    for i in range(8):
        angle = math.tau * i / 8
        k.cyl(f'leg_{i}', (r * 0.85 * math.cos(angle), r * 0.85 * math.sin(angle), legs / 2), 0.2, legs, k.steel)
    k.cyl('floor', (0, 0, legs + 0.2), r, 0.4, k.steel)
    k.cyl('radiant', (0, 0, legs + 0.4 + radiant / 2), r, radiant)
    k.cone('transition', (0, 0, legs + 0.4 + radiant + h * 0.08), r, r * 0.6, h * 0.16)
    convection = h - (legs + 0.4 + radiant + h * 0.16)
    k.box('convection', (0, 0, h - convection / 2), (r * 1.3, r * 1.3, max(convection, 1.0)), k.steel)
    k.cyl('stack', (0, 0, h + h * 0.2), r * 0.3, h * 0.4, k.steel)
    if k.detail:
        for i in range(6):
            angle = math.tau * i / 6
            k.cyl(f'burner_{i}', (r * 0.55 * math.cos(angle), r * 0.55 * math.sin(angle), legs - 0.5), 0.22, 1.0, k.rail)
        k.platform('platform_1', legs + 0.4 + radiant * 0.5, r + 0.8)
        k.platform('platform_2', legs + 0.4 + radiant, r + 0.8)
        ladder(k, r + 0.8, h)
        k.platform('stack_platform', h + h * 0.35, r * 0.3 + 0.7)
        k.route('crossover', [(r, 0, legs + 0.4 + radiant), (r + 1.2, 0, legs + 0.4 + radiant),
                              (r + 1.2, 0, legs + 1.0), (r, 0, legs + 1.0)], 0.2)


def build_stack(k):
    h, r = k.h, k.r
    k.cyl('foundation', (0, 0, 0.4), r + 1.5, 0.8, k.concrete)
    k.cone('shell', (0, 0, 0.8 + (h - 0.8) / 2), r, r * 0.7, h - 0.8, k.steel, vertices=40)
    k.cyl('base_ring', (0, 0, 1.3), r + 0.3, 1.0, k.steel)
    if k.detail:
        for i, level in enumerate((0.5, 0.92)):
            k.platform(f'platform_{i}', h * level, r * (1 - 0.3 * level) + 0.8)
        ladder(k, r * 0.85 + 0.8, h * 0.92)
        for i in range(4):
            angle = math.tau * i / 4
            k.box(f'aviation_light_{i}', ((r * 0.7 + 0.3) * math.cos(angle), (r * 0.7 + 0.3) * math.sin(angle), h + 0.3),
                  (0.3, 0.3, 0.3), k.rail)
        k.route('flue_inlet', [(r + 4, 0, 3.0), (r * 0.95, 0, 3.0)], r * 0.55, k.steel)
```

Register: `'cylindrical_heater': build_cylindrical_heater, 'stack': build_stack,`. `npm run check:generators` → `Checked 19 silhouettes`.

- [ ] **Step 5: Assets**

```json
  {
    "asset_id": "asset_f501", "tag": "F-501", "name": "Reactor Charge Heater",
    "type": "cylindrical_heater", "facility_id": "demo_refinery", "area_id": "area_200", "unit_id": "unit_hds",
    "service": "feed_heating", "status": "online", "model_ref": "F-501",
    "position": {"x": 44, "y": 62, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 20, "length": 8, "width": 4, "diameter": 6}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_stk401", "tag": "STK-401", "name": "Utility Boiler Stack",
    "type": "stack", "facility_id": "demo_refinery", "area_id": "area_400", "unit_id": "unit_utilities",
    "service": "flue_gas", "status": "online", "model_ref": "STK-401",
    "position": {"x": 136, "y": 83, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 45, "length": 8, "width": 4, "diameter": 2.5}, "interactive": true, "synthetic": true
  }
```

Bindings: `{"asset_id": "asset_f501", "model_ref": "F-501", "node_name": "F-501"}`, `{"asset_id": "asset_stk401", "model_ref": "STK-401", "node_name": "STK-401"}`.

Telemetry:

```json
  {"point_id": "tp_asset_f501_temperature", "asset_id": "asset_f501", "parameter": "outlet_temperature", "value": 348, "unit": "degC", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_f501_power", "asset_id": "asset_f501", "parameter": "power", "value": 18.5, "unit": "MW", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_f501_health", "asset_id": "asset_f501", "parameter": "health", "value": 94, "unit": "percent", "status": "normal", "quality": "good", "timestamp": "synthetic"}
```

- [ ] **Step 6: Rebuild, check, look** — `npm run build:models` → `"assets": 54`; `npm run check` green; inspect `F-501`, `STK-401`.

- [ ] **Step 7: Commit**

```bash
git add pipeline/catalog.py schemas/asset.schema.json app/src/data/silhouettes.ts blender/generators/equipment.py data/synthetic data/normalized blender/assets/refinery.blend
git commit -m "feat(silhouettes): cylindrical fired heater and free-standing stack"
```

---

### Task 7: Utilities family — hyperbolic_cooling_tower, substation, control_room

- [ ] **Step 1: Catalog entries (pytest red)**

```python
    "hyperbolic_cooling_tower": {
        "description": "Natural-draft hyperboloid concrete cooling tower on diagonal legs with a basin",
        "sample": {"height": 45, "diameter": 34, "length": 8, "width": 4},
    },
    "substation": {
        "description": "Electrical substation building with a fenced transformer yard",
        "sample": {"height": 5, "diameter": 3, "length": 16, "width": 10},
    },
    "control_room": {
        "description": "Low blast-resistant control building with canopy, slit windows and rooftop HVAC",
        "sample": {"height": 4.5, "diameter": 3, "length": 20, "width": 12},
    },
```

- [ ] **Step 2: Schema enum** — add `"hyperbolic_cooling_tower", "substation", "control_room"`.

- [ ] **Step 3: Proxy table** — add `hyperbolic_cooling_tower: 'vertical', substation: 'box', control_room: 'box',` and add `'hyperbolic_cooling_tower'` to `selfFoundation`.

- [ ] **Step 4: Builders**

```python
def build_hyperbolic_cooling_tower(k):
    h, r = k.h, k.r
    throat_z, throat_r = h * 0.78, r * 0.62
    spread = 0.66 * h / math.sqrt((r / throat_r) ** 2 - 1)   # hyperbola meets the base radius at 0.12 h
    rings = 20 if k.detail else 8
    profile = []
    for i in range(rings + 1):
        z = h * (0.12 + 0.88 * i / rings)
        profile.append((throat_r * math.sqrt(1 + ((z - throat_z) / spread) ** 2), z))
    k.lathe('shell', profile, 48 if k.detail else 24, k.concrete)
    k.cyl('basin', (0, 0, 0.3), r + 1.0, 0.6, k.concrete)
    legs = 24 if k.detail else 12
    for i in range(legs):
        a0 = math.tau * i / legs
        for suffix, a1 in (('leg', math.tau * (i + 1.5) / legs), ('leg_x', math.tau * (i - 1.5) / legs)):
            k.route(f'{suffix}_{i}', [(r * math.cos(a0), r * math.sin(a0), 0.6),
                                      (r * math.cos(a1), r * math.sin(a1), h * 0.12)], 0.35, k.concrete)
    if k.detail:
        k.cyl('fill_deck', (0, 0, h * 0.14), r * 0.98, 0.3, k.steel)
        k.route('riser', [(r + 3, 0, 0.6), (r + 3, 0, h * 0.2), (r * 0.9, 0, h * 0.2)], 0.8)


def build_substation(k):
    length, width, h = k.length, k.width, k.h
    k.box('body', (-length * 0.15, 0, h / 2), (length * 0.7, width, h), k.concrete)
    k.box('roof', (-length * 0.15, 0, h + 0.15), (length * 0.7 + 0.4, width + 0.4, 0.3), k.steel)
    for j, y in enumerate((-width / 4, width / 4)):
        x = length * 0.32
        k.box(f'plinth_{j}', (x, y, 0.1), (3.6, 2.8, 0.2), k.concrete)
        k.box(f'transformer_{j}', (x, y, 1.4), (3.0, 2.2, 2.4), k.shell)
        for i in range(4):
            k.box(f'radiator_{j}_{i}', (x - 1.85, y - 1.05 + i * 0.7, 1.3), (0.6, 0.12, 2.0), k.steel)
        for i in range(3):
            k.cyl(f'bushing_{j}_{i}', (x - 0.8 + i * 0.8, y, 3.2), 0.12, 1.2, k.rail)
    if k.detail:
        for i in range(int(width / 2) + 1):
            for x in (length * 0.2, length * 0.5):
                k.cyl(f'fence_post_{i}_{x}', (x, -width / 2 + i * 2, 1.1), 0.05, 2.2, k.steel)
        for y in (-width / 2, width / 2):
            k.route(f'fence_rail_{y}', [(length * 0.2, y, 2.1), (length * 0.5, y, 2.1)], 0.03, k.steel)
        for i in range(3):
            k.box(f'louvre_{i}', (-length * 0.5 - 0.02, -width / 4 + i * width / 4, h * 0.6), (0.05, 1.6, 1.2), k.steel)
        k.box('cable_trench', (length * 0.05, 0, 0.05), (0.8, width, 0.1), k.steel)


def build_control_room(k):
    length, width, h = k.length, k.width, k.h
    k.box('body', (0, 0, h / 2), (length, width, h), k.concrete)
    k.box('roof', (0, 0, h + 0.2), (length + 0.6, width + 0.6, 0.4), k.steel)
    k.box('canopy', (0, -width / 2 - 1.5, h * 0.7), (5, 3, 0.25), k.steel)
    for x in (-2, 2):
        k.cyl(f'canopy_post_{x}', (x, -width / 2 - 2.8, h * 0.35), 0.1, h * 0.7, k.steel)
    if k.detail:
        for x in range(-int(length / 2) + 2, int(length / 2) - 1, 3):
            k.box('window_' + str(x), (x, -width / 2 - 0.03, h * 0.6), (1.5, 0.08, 0.6), k.steel)
        for i, x in enumerate((-length / 4, 0, length / 4)):
            k.box(f'hvac_{i}', (x, width / 6, h + 1.0), (2.4, 1.6, 1.2), k.steel)
            k.cyl(f'hvac_fan_{i}', (x, width / 6, h + 1.65), 0.5, 0.1, k.rail)
        k.cyl('mast', (length / 2 - 1, width / 2 - 1, h + 2.2), 0.06, 4.4, k.steel)
        k.box('blast_wall', (0, width / 2 + 0.6, 1.2), (length * 0.6, 0.3, 2.4), k.concrete)
```

Register: `'hyperbolic_cooling_tower': build_hyperbolic_cooling_tower, 'substation': build_substation, 'control_room': build_control_room,`. `npm run check:generators` → `Checked 22 silhouettes at 2 detail levels`.

- [ ] **Step 5: Assets**

```json
  {
    "asset_id": "asset_ct404", "tag": "CT-404", "name": "Natural Draft Cooling Tower",
    "type": "hyperbolic_cooling_tower", "facility_id": "demo_refinery", "area_id": "area_400", "unit_id": "unit_utilities",
    "service": "cooling_water", "status": "online", "model_ref": "CT-404",
    "position": {"x": 30, "y": 118, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 45, "length": 8, "width": 4, "diameter": 34}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_ss401", "tag": "SS-401", "name": "Main Substation",
    "type": "substation", "facility_id": "demo_refinery", "area_id": "area_400", "unit_id": "unit_utilities",
    "service": "power_distribution", "status": "online", "model_ref": "SS-401",
    "position": {"x": 152, "y": 83, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 5, "length": 16, "width": 10, "diameter": 3}, "interactive": true, "synthetic": true
  },
  {
    "asset_id": "asset_cr401", "tag": "CR-401", "name": "Central Control Room",
    "type": "control_room", "facility_id": "demo_refinery", "area_id": "area_400", "unit_id": "unit_utilities",
    "service": "operations", "status": "online", "model_ref": "CR-401",
    "position": {"x": 178, "y": 83, "z": 0}, "rotation": {"x": 0, "y": 0, "z": 0},
    "dimensions": {"height": 4.5, "length": 20, "width": 12, "diameter": 3}, "interactive": true, "synthetic": true
  }
```

Bindings: `CT-404`, `SS-401`, `CR-401` in the same `{asset_id, model_ref, node_name}` shape.

Telemetry:

```json
  {"point_id": "tp_asset_ss401_power", "asset_id": "asset_ss401", "parameter": "power", "value": 22.4, "unit": "MW", "status": "normal", "quality": "good", "timestamp": "synthetic"},
  {"point_id": "tp_asset_ct404_temperature", "asset_id": "asset_ct404", "parameter": "outlet_temperature", "value": 29, "unit": "degC", "status": "normal", "quality": "good", "timestamp": "synthetic"}
```

- [ ] **Step 6: Rebuild, check, look** — `npm run build:models` → `"assets": 57`; `npm run check` green; inspect `CT-404`, `SS-401`, `CR-401`. Use "Reset view" to confirm the overview camera still frames the plant acceptably (the tower extends the site north; if the default view cuts it off, widen `destination.current.set(228, 116, 176)` in `Scene.tsx` `Controls` to `(250, 140, 200)` and note it in the commit).

- [ ] **Step 7: Commit**

```bash
git add pipeline/catalog.py schemas/asset.schema.json app/src/data/silhouettes.ts blender/generators/equipment.py app/src/Scene.tsx data/synthetic data/normalized blender/assets/refinery.blend
git commit -m "feat(silhouettes): hyperbolic cooling tower, substation and control room"
```

---

### Task 8: Documentation, deploy, verification

**Files:**
- Create: `PHASE_9.md`
- Modify: `README.md`, `docs/BLENDER_PIPELINE.md`, `blender/README.md`

- [ ] **Step 1: Write `PHASE_9.md`** (fill the numbers from `data/normalized/models/build-report.json` and your session)

```markdown
# Phase 9 silhouette library

## Changes

Equipment types grew from 10 to 22. `pipeline/catalog.py` is the single source of truth for
types; `tests/test_catalog.py` keeps it equal to the asset schema enum and
`app/src/data/silhouettes.test.ts` keeps the runtime proxy table equal to the schema.
`blender/generators/equipment.py` is a `Kit` + `BUILDERS` registry: one function per silhouette,
parameterized only by height/diameter/length/width. `npm run check:generators` builds every type
at both detail levels inside Blender and fails on unprefixed names, geometry below grade, or
height/footprint outside the requested dimensions.

New types: floating_roof_tank, sphere_tank, bullet_tank, reactor, horizontal_drum, air_cooler,
compressor, cylindrical_heater, stack, hyperbolic_cooling_tower, substation, control_room.

New synthetic units: LPG storage (SP-501/502, BT-501/502) and Diesel hydrotreater (F-501, C-501,
R-501, EA-501, V-501); plus TK-103, STK-401, CT-404, SS-401, CR-401. 57 assets total.

## Verification

- npm run check: <N> frontend tests, <N> Python tests, ESLint, Ruff, validation, build.
- npm run check:generators: 22 silhouettes × 2 detail levels.
- build-report.json: <triangles> triangles, <mesh_objects> mesh objects.
- Browser: each new tag selected and inspected; screenshots phase-9-lpg.png, phase-9-hds.png,
  phase-9-utilities.png.

## Limits

Silhouettes are procedural approximations validated against the owner's engineering judgement,
not against vendor drawings. No new process paths or scenarios use the new equipment yet
(Phase 2). Proxy-mode shapes for the new families are coarse by design.
```

- [ ] **Step 2: Update the pointers**

`README.md`: add after the Phase 8 section:

```markdown
## Phase 9
The equipment silhouette library grew to 22 types with a tested catalog. See [PHASE_9.md](PHASE_9.md).
```

`docs/BLENDER_PIPELINE.md`: replace the "Procedural generators" paragraph with:

```markdown
## Procedural generators
`pipeline/catalog.py` lists every equipment type with a sample dimension set. `blender/generators/equipment.py`
implements one builder per type in `BUILDERS`, each a function of a `Kit` (dimensions, palette, naming, detail
level). Add a type by adding a catalog entry, the schema enum value, a runtime proxy family, and a builder;
`npm run check:generators` verifies the result inside Blender.
```

`blender/README.md`: replace the first line with:

```markdown
Contains reusable source assets, procedural generators (`generators/equipment.py`, one builder per catalogued
type), `scripts/build_demo_refinery.py` (plant export), `scripts/build_preview.py` (photoreal module) and
`scripts/check_generators.py` (generator self-check).
```

- [ ] **Step 3: Full verification and push**

Run: `npm run check` → green.
Run: `npm run test:production` → pass.

```bash
git add PHASE_9.md README.md docs/BLENDER_PIPELINE.md blender/README.md
git commit -m "docs: phase 9 silhouette library"
git push
```

Run: `gh run list -R Mostafanasr1/refinery-digital-twin --limit 1 --json databaseId --jq '.[0].databaseId'` then
`gh run watch <id> -R Mostafanasr1/refinery-digital-twin --exit-status`
Expected: build and deploy jobs green.

- [ ] **Step 4: Verify the live site**

Open https://mostafanasr1.github.io/refinery-digital-twin/, confirm the asset register shows 57 assets, select
`SP-501`, `R-501`, `CT-404`. Report the live URL and the three screenshots to the owner for silhouette sign-off.

---

## Self-review notes

- Spec coverage: catalog + schema + proxy sync (Tasks 1, 3); Kit/BUILDERS refactor (2); self-check (2); 12 new
  types (4–7); synthetic units/assets (4–7); docs + deploy (8). Phase 1b backlog types are intentionally out.
- Type consistency: `Kit` methods `box/cyl/cone/sphere/torus/route/platform/lathe/add`, helpers
  `wrap_stair(k, r, h)`, `roof_ring(k, r, z)`, `ladder(k, x, h)` are used with those exact signatures throughout.
  `proxyFamily` / `selfFoundation` names match between `silhouettes.ts`, its test, `Scene.tsx` and
  `Atmosphere.tsx`.
- Bounds in `check_generators.py` (height 0.8–2.2×, footprint ≤ largest + 14 m, grade ≥ −0.3 m) were derived from
  the existing 10 types' geometry (fired heater stack reaches 1.67×h; flare braces span 16 m; rotated route
  cylinders dip ~0.12 m below grade).
