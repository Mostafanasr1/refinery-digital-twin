# Photoreal preview study

Open `/#preview` in the running app. The original refinery demo remains at `/#demo`.

The separate tab presents a compact preheat exchanger and two pumps, with canonical asset bindings, flanges, fasteners, valves, motors, pipework and access steelwork. Equipment details come from normalized assets. This is a synthetic visual study rather than an as-built model.

- Interactive 3D: local GLB, PBR materials, environment reflections, shadows, orbit/pan/zoom and equipment selection.
- Cinematic render: explicitly labelled Blender Cycles still of the same model. Procedural surface variation and offline lighting are not represented as live browser rendering.

Authoring configuration: `data/synthetic/preview.json`. Geometry generator: `blender/scripts/build_preview.py`. Rebuild with `npm run build:preview` (Blender 5.2; set BLENDER_BIN if required). Generated source: `blender/assets/photoreal-section.blend`. Local runtime artifacts: `data/normalized/preview/`.

The full plant remains unchanged in scope. Matching the reference across an entire facility requires further asset modeling, texture authoring and rendering optimization. This focused module is an initial visual study, not a claim of completed plant-wide photorealism.
