# Stage C hero stills — offline slide artwork

Three fixed frames from one packed Blender scene: CAM-6 day, CAM-6 night and CAM-2 day. Cycles, 3840 x 2160, 16-bit PNG, adaptive sampling up to 256 samples, denoised. The saved scene contains the current sourced terrain, materials, plant, dressing and lamps. No canonical plant data changes. These files are outside `data/normalized`, the app public directory, and are not deployed runtime assets.

## Reproduce

Use the reference laptop, Blender 5.2.1 and the repository's installed Node dependencies. Run from the project directory. `export.mjs` makes a separate offline Vite build; the published build is never instrumented. Set VISUAL_BROWSER_PATH to the pinned Chrome 146 installation before export.

```powershell
node scripts/stills/export.mjs
& 'D:/blender/blender.exe' -b --factory-startup --python-exit-code 1 --python scripts/stills/import_scene.py
& 'D:/blender/blender.exe' -b --factory-startup --python-exit-code 1 --python scripts/stills/build_scene.py
& 'D:/blender/blender.exe' -b --factory-startup --python-exit-code 1 --python scripts/stills/render.py -- CAM-6 day
& 'D:/blender/blender.exe' -b --factory-startup --python-exit-code 1 --python scripts/stills/render.py -- CAM-6 night
& 'D:/blender/blender.exe' -b --factory-startup --python-exit-code 1 --python scripts/stills/render.py -- CAM-2 day
```

Stop on any command failure. The last three commands can run directly from the packed `stageC-hero-scene.blend` without the export/import source files. Each reloads that same scene; its SHA-256 is written into each frame's JSON. Intermediate GLB/build files stay ignored in `tests/visual/output/stageC-task-05/`. No source downloads are needed. Runtime textures are decompressed for Blender at their existing resolution.

## Cycles adaptations

These are offline renders, not screenshots or exact runtime shader transfers. Geometry, approved camera positions/targets and 42-degree vertical FOV are retained. Terrain uses the adapted Sinai DEM and the existing sand/gravel/rock sources with metre-scale slope/height blending; normal textures are decoded as normals. Cycles nodes approximate the browser's procedural terrain/wear functions. Source instances, physical pipe geometry, optional plant detail, dressing and lights are retained. Blender's importer omits GPU instance colors, so the import script restores and audits them explicitly.

AgX with Medium High Contrast replaces runtime ACES. Day uses the sourced HDR for light and sky. Night uses that HDR at 0.055 for readable fill and the captured original procedural dusk texture for camera rays; this is a disclosed offline lighting adaptation. Existing point/spot lamps use `intensity * 4π / 683 * 8` watts; the final factor is an offline exposure/lighting calibration, not a claim of surveyed photometry. Night camera exposure is +1.3 stops. No extra fixture locations are invented.

Physical volume haze/steam and emissive flame geometry replace browser billboards. The motion sample is frozen at 1.5 seconds so aviation lights are on. Day dust billboards are excluded from the still; atmospheric haze remains. These conversions do not alter the app, performance protocol or engineering baseline. The deferred far-hill/slope-tiling limitation remains visible.

## Attribution for use in slides

Retain this credit with the artwork or in the slide deck credits:

- **Low Poly Shipping Container**, Strifey7 — [source](https://www.fab.com/listings/dfb39352-ae9b-4e17-a6f2-aed1ce39d5c5), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Containers Cabins**, ROGUE / ROGUEENGINEER — [source](https://sketchfab.com/3d-models/containers-cabins-d839483bc2c04404a562c0d6947f5171), CC BY 4.0.
- **Toyota Hilux 1983**, elkarimeldino — [source](https://sketchfab.com/3d-models/toyota-hilux-1983-d874f5e016fe41bd8461adb0c6d41ede), CC BY 4.0.
- **Tanker Truck**, ezbreneman — [source](https://sketchfab.com/3d-models/tanker-truck-0bfeafdb2eb94612ad89ea2e794cf249), CC BY 4.0.
- Poly Haven CC0 materials, HDR and rocks; NASA/NGA/USGS SRTM N28E033, distributed by OpenTopography, DOI 10.5069/G9445JDF. Terrain cropped, scaled and flattened for this synthetic presentation; not a surveyed refinery site.

Models were scaled, grounded, combined/atlased and instanced in the runtime, then exported and rendered here. Texture/shader and lighting adaptations are described above. Full provenance and source/derivative hashes: [ASSETS.md](../../ASSETS.md). No endorsement implied.

## Measured render times

RTX 3050 Laptop GPU / OptiX, Blender 5.2.1, OpenImageDenoise. CAM-6 day: 377.67 seconds; CAM-6 night: 201.83 seconds; CAM-2 day: 502.06 seconds. Times include render preparation, denoising and PNG writing. See each frame JSON for load-plus-render time and the shared scene hash. `node scripts/stills/verify.mjs` verifies the full pipeline evidence after rendering.
