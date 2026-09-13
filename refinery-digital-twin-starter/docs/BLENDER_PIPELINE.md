# Blender Pipeline

## Role
Blender handles procedural scene generation, reusable asset creation, geometry cleanup, materials, authored animation references, and GLB export. It is not the preferred tradeshow runtime.

## Scene hierarchy
```text
REFINERY_ROOT
  SITE
  AREA_100_CRUDE
  AREA_200_CDU
  AREA_300_PRODUCTS
  AREA_400_UTILITIES
  AREA_500_STORAGE
  FLARE
  ROADS
  BUILDINGS
```

Within units:
```text
UNIT_CDU
  EQUIPMENT
  STRUCTURES
  PIPE_RACKS
  MAJOR_PIPING
  DETAIL
```

## Naming
Use stable model refs such as `TK-101`, `P-101A`, `E-201`, `F-201`, `T-201`. No default Blender names in production exports.

## Procedural generators
Create generators for vertical vessel, storage tank, shell-and-tube exchanger, centrifugal pump proxy, fired heater, pipe rack, platform, stairs, and pipe route.

Each generator accepts dimensions, transform, asset metadata, and detail level.

## LOD
- LOD0: site-wide silhouette
- LOD1: normal interaction
- LOD2: hero close-up

Do not model small-bore piping, fasteners, dense cable tray, and hidden micro-detail by default.

## Metadata
Attach `asset_id`, `tag`, `type`, `unit_id`, and `area_id` as custom properties where feasible. Runtime still uses a normalized binding table.

## Export
Target GLB with optimized textures, reasonable material count, stable node names, predictable coordinate system.

## Build concept
```text
blender --background base_scene.blend --python scripts/build_demo_refinery.py
```

Build script:
1. load normalized assets
2. instantiate/generate geometry
3. assign transforms
4. attach metadata
5. create major visual paths
6. save source blend
7. export GLB

## Geometry philosophy
Preserve plant layout, major scale, equipment relationships, major piping, pipe racks, elevation logic, and recognizable equipment. Simplify bolts, fasteners, instrument tubing, dense cable tray, small valves, and micro-supports.
