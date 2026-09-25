# Visual asset register

This register includes the release runtime assets and historical stage notes. Externally sourced runtime HDRI and textures are CC0, recorded below; geometry and effects are original project-generated work. No third-party vehicle or equipment model is shipped. Project-generated assets have no separate CC0 declaration; they are existing project work, not newly sourced third-party CC0 assets. Future external visual assets must have verified CC0 provenance before use.

Sizes below are committed file bytes at Stage A close. Procedural runtime materials and the generated RoomEnvironment have no separately downloaded texture files.

| Asset | Source URL | License / provenance | Local path | Size (bytes) | Used by |
|---|---|---|---|---:|---|
| Whole-plant geometry | [Generator source](https://github.com/Mostafanasr1/refinery-digital-twin/blob/codex/stage-a/refinery-digital-twin-starter/blender/scripts/build_demo_refinery.py) | Original project-generated geometry; no third-party asset | `data/normalized/models/refinery.glb` | 10,786,508 | Both looks / Blender GLB |
| Preheat module study | [Generator source](https://github.com/Mostafanasr1/refinery-digital-twin/blob/codex/stage-a/refinery-digital-twin-starter/blender/scripts/build_preview.py) | Original project-generated geometry; no third-party asset | `reference/photoreal-study/module.glb` | 2,087,040 | Archived Interactive 3D study (Task 4 reference) |
| Preheat Cycles still | [Generator source](https://github.com/Mostafanasr1/refinery-digital-twin/blob/codex/stage-a/refinery-digital-twin-starter/blender/scripts/build_preview.py) | Original project-generated render; no third-party asset | `reference/photoreal-study/render.png` | 2,032,838 | Archived Cycles study (Task 4 reference) |

The Three.js RoomEnvironment is code from the installed MIT-licensed Three.js dependency, not an imported HDRI. Software dependencies retain their own licenses and are not represented as CC0 art.

## Stage B Task 3 environment

External sources below are CC0-1.0, verified on their official asset pages and https://polyhaven.com/license before download. Source URLs, MD5 and output SHA256 are pinned in `data/normalized/assets/env/sources.json`.

| Asset | Source / license | Local file | Bytes |
|---|---|---|---:|
| sky.hdr | https://polyhaven.com/a/kloofendal_43d_clear_puresky / CC0-1.0 | `data/normalized/assets/env/sky.hdr` | 4624289 |
| sand-color.webp | https://polyhaven.com/a/sand_01 / CC0-1.0 | `data/normalized/assets/env/sand-color.webp` | 1170648 |
| sand-normal.webp | https://polyhaven.com/a/sand_01 / CC0-1.0 | `data/normalized/assets/env/sand-normal.webp` | 1928894 |
| sand-rough.webp | https://polyhaven.com/a/sand_01 / CC0-1.0 | `data/normalized/assets/env/sand-rough.webp` | 278954 |
| Site context: pad, marked roads, fence, three cabins | Original project procedural geometry from `blender/scripts/build_site_context.py`; no third-party art | `data/normalized/assets/env/context.glb` | 1,800,372 |

Terrain and mountain ring are original procedural runtime geometry. User-supplied PetroMind screenshots under `docs/reference/` are review references, not shipped assets and not represented as CC0.

Rebuild textures with `node scripts/python.mjs scripts/build_environment.py` after installing declared development dependencies. Pillow 12.3.0 uses lossless WebP, method 6; source pixels are not quantized. KTX2 is deferred because these three texture files total 3,378,496 bytes and the environment fits the approved 40 MB transfer budget. WebP does not reduce GPU texture memory; all three maps are 1K. The 2K RGBE HDR retains its full lighting range. Rebuild context with `node scripts/python.mjs scripts/build_context.py`.

Task 3 review correction: 900 rock instances, 650 dry-scrub instances, macro sand tint and the west-gate dirt track are original procedural runtime geometry/shading. They add no downloaded files; the existing environment asset byte total is unchanged.

## Stage B Task 4 materials

Eight presentation roles are defined in `data/presentation/materials.json`, including physical texture tile sizes in metres. Model geometry is unchanged; exported material names retain both original engineering material and photoreal role. `data/normalized/models/material-parts.json` records every exported part assignment.

Seven roles derive their subtle variation from Poly Haven [metal_plate_02](https://polyhaven.com/a/metal_plate_02) or [concrete_wall_007](https://polyhaven.com/a/concrete_wall_007), both CC0 under [Poly Haven's asset license](https://polyhaven.com/license). Source URLs and checksums are pinned in `scripts/build_materials.py` and the output manifest. Grating replaces these source maps with original procedural 50 mm grid spacing, 5 mm nominal bars and shallow normal-map relief. Its dark recesses suggest openings; the opaque material does not create physical holes.

`data/normalized/assets/materials/` holds 24 1K KTX2 maps with mipmaps, plus manifest and Basis transcoder. It loads only when Photoreal is first used and is cached across look changes. All equipment, fallback proxies and pipes use physical metre-based tiling; engineering retains flat materials.

Rebuild with `node scripts/python.mjs scripts/build_materials.py`, then `npm run build:models`. The pinned official Binomial Basis Universal 2.50.0 WASI encoder runs through `scripts/basis-encode.mjs`; its Apache-2.0 software license is distinct from CC0 texture licensing. The installed Three.js Basis runtime transcoder retains Apache-2.0 licensing. Per-file sizes and output SHA256 hashes are in `data/normalized/assets/materials/manifest.json`.

## Stage B Task 5 hero detail

`data/normalized/assets/detail/hero.glb` is original procedural geometry from `blender/generators/hero_detail.py`, exported by `blender/scripts/build_hero_detail.py`. No third-party art is used. Six type builders cover all 18 matching plant instances, with 71,236 triangles and a 3,654,168-byte GLB. `manifest.json` records asset identities, named parts, materials and counts. The optional model is lazy-loaded in Photoreal and retained without rendering or raycasting in Engineering/proxy modes. The approved base model is untouched. Rebuild with `node scripts/python.mjs scripts/build_hero.py`.

## Stage B Task 6 atmosphere and dressing

Flame shader, steam canvas texture, dusk sky canvas texture, platform lamp geometry and stored-pipe dressing are original procedural project artwork. They introduce no downloaded art. `app/src/PlantAtmosphere.tsx` and `data/presentation/atmosphere.json` define effect placement by equipment type; `app/src/SiteDressing.tsx` makes a separate non-canonical, noninteractive group avoiding canonical equipment footprints. Neither adds asset IDs, telemetry, process connections or scenarios. Lamps are emissive except the explicitly limited real lights. The reused daytime CC0 HDR lights night surfaces at reduced intensity; the night background is procedural.

`docs/reference/mood-dusk.png` is a byte-for-byte copy of Mostafa's supplied refinery dusk HUD reference (`codex-clipboard-517077ab-9eab-4f7e-b08c-fc9e2ca89d4e.png`). It is review-only, not shipped runtime art and not represented as CC0. Other existing CC0 environment/material assets remain unchanged.


## Task 9 release inventory

Current base plant GLB is 7,263,344 bytes after lossless meshopt and Task 5b sphere smoothing. The Stage A table above is historical, not the current transfer size. Hero GLB remains 3,654,168 bytes; combined lazy photoreal assets remain 21,417,040 bytes. Task 6 correction lamps, red warnings, cloned cabin-window emission and six non-shadow warm pools are original procedural work. Task 8 labels/rims/cards/tours add no downloaded art.

All externally sourced runtime visual assets are CC0 with source/checksum manifests retained. Original procedural project work and licensed software are distinguished from downloaded CC0 art; no new license is asserted on user-supplied references. Reference PNGs and evidence videos are review-only and absent from app/dist. Task 9 introduces no visual asset or runtime dependency.


## Stage C Task 1 procedural motion

Pickup, tanker, fan rotors/insets, flag and mast, dust, flow pulses and the two approved road connectors are original procedural presentation geometry. Sky blends the existing CC0 HDR with the original procedural dusk texture. No downloaded art, new visual dependency, canonical asset or texture pack is introduced. Vehicles use instanced meshes and type-based equipment motion; connectors merge into existing context materials. Motion parameters live in data/presentation/motion.json. The raw high-bitrate recording stays under ignored tests/visual/output/stageC-task-01; its31MB CRF18 MP4 review copy is committed with the hand-back. Neither is shipped in app/dist or counted as a runtime asset.
