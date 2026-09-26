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

Pickup, tanker, fan rotors/insets, flag and mast, dust, flow pulses and the two approved road connectors are original procedural presentation geometry. Sky blends the existing CC0 HDR with the original procedural dusk texture. No downloaded art, new visual dependency, canonical asset or texture pack is introduced. Vehicles use instanced meshes and type-based equipment motion; connectors merge into existing context materials. Motion parameters live in data/presentation/motion.json. The raw high-bitrate recording stays under ignored tests/visual/output/stageC-task-01; its 31 MB CRF 18 MP4 review copy is committed with the hand-back. Neither is shipped in app/dist or counted as a runtime asset.


## Stage C Task 2 vertical slice

All additions are original procedural work: 62 batched dressing modules, route-following fittings, per-type optional Blender detail, metre-space wear/grime and pad tyre-track/joint/noise shading. No downloaded art or new runtime dependency. Dressing is non-canonical and non-selectable, controlled by the photoreal Dressing checkbox. All 57 assets / 22 types receive optional builder detail; the approved base GLB stays unchanged. The lazy asset folder inventory is 29,647,667 bytes (conservative count including manifests), within the task-specific 60 MB allowance. Reference and evidence images remain review-only and are not runtime assets.

## Stage C Task 3 source intake (not yet deployed)

Low Poly Shipping Container by Strifey7. Source: https://www.fab.com/listings/dfb39352-ae9b-4e17-a6f2-aed1ce39d5c5 . License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), verified on the individual live listing before acquisition. Mostafa personally accepted the download agreement. Local source: D:/Downloads/low-poly-shipping-container.zip. Size: 16,012,423 bytes. SHA-256: b7ef4f9674896d663e1522b77c6a29ab54777320a3d91f6d88055d440ea3f632. Contents: FBX, base-colour and normal PNG maps. Not incorporated into the build yet; any derivative will retain credit and document modifications.

Prepared derivative: data/normalized/assets/env/container.glb, 2,493,696 bytes; SHA-256 c1f9e73528911db560d7794843e54642e7bfddf58f872aa4093bae7fd9d43db7. Converted from the Strifey7 source above with blender/scripts/import_site_container.py: FBX to GLB, grounded and uniformly scaled to 6.058 m length, textures reduced to 1024 pixels, PBR roughness/metalness assigned. One mesh, one material, two textures, 1,842 triangles. License remains CC BY 4.0; credit Strifey7 and link the original listing. Prepared only, not integrated or deployed.

### Task 3 additional source intake — not runtime assets yet

Source binaries are retained in `tests/visual/output/stageC-task-03/sources/`. Full download URLs, SHA-256 and byte sizes are in `docs/handbacks/evidence/stageC-task-03/source-intake.json`. These files are not shipped by the app.

- `gravelly_sand/gravelly_sand_diff_1k.jpg`: 1,062,525 bytes; SHA-256 `bc1624594ce807f04eaa023f6f9df93ffefd20904570cd46ca302b954ef80eec`. Source: https://polyhaven.com/a/gravelly_sand. License: CC0-1.0. Acquired; not yet processed or integrated.
- `gravelly_sand/gravelly_sand_nor_gl_1k.jpg`: 1,387,739 bytes; SHA-256 `7ccb08525d46520a6d00262f4f73483b3569cc6cbc2908da069f033290d1c2f8`. Source: https://polyhaven.com/a/gravelly_sand. License: CC0-1.0. Acquired; not yet processed or integrated.
- `gravelly_sand/gravelly_sand_rough_1k.jpg`: 419,895 bytes; SHA-256 `57188f62c17950f96a5f2b8ce11bc9776e2b5bff8eff5c903402d89553ba3654`. Source: https://polyhaven.com/a/gravelly_sand. License: CC0-1.0. Acquired; not yet processed or integrated.
- `rock_face_03/rock_face_03_diff_1k.jpg`: 927,082 bytes; SHA-256 `ea48e0e47ad42c8bd312476178b1248ec66f0eb19156a26a1c222f2a40caaf2d`. Source: https://polyhaven.com/a/rock_face_03. License: CC0-1.0. Acquired; not yet processed or integrated.
- `rock_face_03/rock_face_03_nor_gl_1k.jpg`: 1,146,788 bytes; SHA-256 `c6423169583f31715cf0636954bad524e806848a5f2861fcea6794275f726ff0`. Source: https://polyhaven.com/a/rock_face_03. License: CC0-1.0. Acquired; not yet processed or integrated.
- `rock_face_03/rock_face_03_rough_1k.jpg`: 638,904 bytes; SHA-256 `9e3d9a2fd75244892e7acb6bab2eaed1279299510a7970672c0ee27ff1c19fea`. Source: https://polyhaven.com/a/rock_face_03. License: CC0-1.0. Acquired; not yet processed or integrated.
- `sand_rocks_small_01/sand_rocks_small_01_1k.gltf`: 2,887 bytes; SHA-256 `8d5dd6fc49f00646f3df1cee18c731c72b843fc9d448830bac5f151180a63d0e`. Source: https://polyhaven.com/a/sand_rocks_small_01. License: CC0-1.0. Acquired; not yet processed or integrated.
- `sand_rocks_small_01/textures/sand_rocks_small_01_nor_gl_1k.jpg`: 1,008,354 bytes; SHA-256 `764d7d9aa1229c0b4716da35b0e0d6cc769c2ce25e4854cc7bbd480dba42cc6c`. Source: https://polyhaven.com/a/sand_rocks_small_01. License: CC0-1.0. Acquired; not yet processed or integrated.
- `sand_rocks_small_01/textures/sand_rocks_small_01_diff_1k.jpg`: 788,042 bytes; SHA-256 `86f57a6fefdc145dd1a386917ae8a73dbcc9230e2eed276df03e930310cd1cd6`. Source: https://polyhaven.com/a/sand_rocks_small_01. License: CC0-1.0. Acquired; not yet processed or integrated.
- `sand_rocks_small_01/sand_rocks_small_01.bin`: 21,253,052 bytes; SHA-256 `77ea63c7cb39654b3e804f3b3a3dafdb5a39ff828192465276908dc3a963a44e`. Source: https://polyhaven.com/a/sand_rocks_small_01. License: CC0-1.0. Acquired; not yet processed or integrated.
- `sand_rocks_small_01/textures/sand_rocks_small_01_arm_1k.jpg`: 758,948 bytes; SHA-256 `6b80000330bfe8710fca1210d1f4a6080f6abb3634294f834810da8e83b5d27b`. Source: https://polyhaven.com/a/sand_rocks_small_01. License: CC0-1.0. Acquired; not yet processed or integrated.
- `N28E033.tif`: 11,779,400 bytes; SHA-256 `2e581371c5197611e498a2b9182988c1888f52f8205fa600df549f30d66976cc`. Source: https://portal.opentopography.org/datasetMetadata?otCollectionID=OT.042013.4326.1. License: US government public-domain SRTM; USGS dataset use constraints retained. acquired; crop not selected
- `pickup-candidate.glb`: 959,376 bytes; SHA-256 `1f51df1e4f17991c72aa19c9e6eba5d99319f57ae651cbfd422f6561180d0496`. Source: https://3dassets.dev/assets/car-park-and-road-vehicle-fleet-double-cab-pickup-5198b9ad. License: CC0-1.0. rejected after local Blender render; inadequate visual quality
- `tanker-candidate.glb`: 209,288 bytes; SHA-256 `8056d575fdb65fa2d91cb2775972e22767700ca08babec5c9cdea3fb35c70df4`. Source: https://3dassets.dev/assets/long-haul-trucking-and-truck-stop-tanker-hoses-out-7b9bd7df. License: CC0-1.0. rejected after local Blender render; inadequate visual quality

SRTM N28E033 covers 28–29 N, 33–34 E in Egypt, WGS84 horizontal and EGM96 heights, 3601 × 3601 samples. NASA/NGA/USGS data distributed by OpenTopography, DOI 10.5069/G9445JDF. The distributor leaves its license field blank; licensing is supported by the originating USGS public-data policy and dataset metadata, not a license invented by this project. Retained USGS metadata requests acknowledgement and disclosure of modifications. Crop, scaling and flattening must be documented when performed; this is presentation geography, not a surveyed plant location.

Tanker Truck by ezbreneman, https://sketchfab.com/3d-models/tanker-truck-0bfeafdb2eb94612ad89ea2e794cf249, CC BY 4.0 https://creativecommons.org/licenses/by/4.0/. Own-page license verified before official UI download. Source GLB 11,069,784 bytes; SHA-256 bf15aa18bdb055291ebe5ca7b7c37eece5a72303ccc8cc7cc5454547cf85c4f6. Saved as tests/visual/output/stageC-task-03/sources/tanker-sketchfab.glb; import/render succeeds. No modifications yet; not integrated or selected for final use.

### Task 3 signed-in acquisition completed

- **Toyota Hilux 1983** by elkarimeldino: https://sketchfab.com/3d-models/toyota-hilux-1983-d874f5e016fe41bd8461adb0c6d41ede. CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), verified on the individual download page before acquisition. `pickup-sketchfab.glb`: 4,070,956 bytes; SHA-256 `de8b4828ccc68cc420f470399cb07fb131552770ef570dfeccb4f3912025f134`. Unmodified source GLB retained locally. Local Blender render inspected. Not yet runtime-integrated.
- **Containers Cabins** by ROGUE (ROGUEENGINEER): https://sketchfab.com/3d-models/containers-cabins-d839483bc2c04404a562c0d6947f5171. CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), verified on the individual download page before acquisition. `cabins-sketchfab.glb`: 1,091,484 bytes; SHA-256 `a0237230d009d666fc2be751cfef65524a58d2e1a407d4817047302d7da05f8a`. Unmodified source GLB retained locally. Local Blender render inspected. Not yet runtime-integrated.


## Stage C Task 3 runtime derivatives — local candidate

The acquisition-only statements above are historical. The selected sources are now integrated in the local candidate; publication and visual acceptance remain pending. Source credits, URLs and licenses above apply to these modified derivatives. CC BY 4.0 models are used under Mostafa’s recorded sourcing ruling.

Blender preparation (`blender/scripts/prepare_real_assets.py`): grounded and scaled models; first yellow cabin variant selected; vehicles combined into one material with a 1024² baked albedo atlas; Poly Haven rock reduced to 900 triangles. Pickup 12,140 triangles; tanker 64,337; cabin 282. Runtime instances fit the approved vehicle footprint envelopes. No canonical equipment is replaced. Original source files remain local and are not distributed.

Terrain preparation (`scripts/prepare_real_terrain.py`): SRTM N28E033, crop pixels (2340,540)–(3420,1620), approximately 33.65–33.95 E / 28.55–28.85 N in Sinai, Egypt. Bilinear 257² float32 grid; horizontally compressed to a 4,200 m presentation extent; height differences scaled by 0.28, recentered using the middle sample with a +420 m source-height offset, then clamped and smoothly flattened around the synthetic plant. This is adapted presentation geography, not a surveyed facility or unmodified elevation product. Acknowledge NASA/NGA/USGS SRTM and OpenTopography, DOI 10.5069/G9445JDF; no endorsement implied.

Six Poly Haven maps converted to 1K quality-88 WebP; colour, tangent normal and roughness blend by height/slope. Gravel tile 2.5 m, rock-face tile 2.7 m. Existing sand, tracks and wear retained.

| Runtime file | Bytes | SHA-256 |
|---|---:|---|
| `data/normalized/assets/env/container.glb` | 2493696 | `c1f9e73528911db560d7794843e54642e7bfddf58f872aa4093bae7fd9d43db7` |
| `data/normalized/assets/env/sinai-height.bin` | 264196 | `70583f5d65e78be3a183c949e890e85c1b1ca4d9619aa825a98dcb513f3c4ed0` |
| `data/normalized/assets/env/sinai-terrain.json` | 622 | `1ec4bd70b757820e2c4ccdce4030c2248e6c9adf0995e526caac8425f3f608ec` |
| `data/normalized/assets/env/sourced-models.json` | 1391 | `d767468e415d7884f9798fcecca1a6374c312d525fcb59bfc347df341f02bcb1` |
| `data/normalized/assets/env/gravel-color.webp` | 390532 | `4fe9f5d803d3b4cdc18ebc15eec6eec4c745ba6820b845dc3cec596875a4756d` |
| `data/normalized/assets/env/gravel-normal.webp` | 533952 | `c7cea1b65349354d859914c728a501ab93c24d47ee7863f6787c07ebe40c8c5e` |
| `data/normalized/assets/env/gravel-rough.webp` | 32742 | `6315bd7622421713e3683c4ed8b391ec34f4e2916c64a0454c8e5815678451de` |
| `data/normalized/assets/env/rock-color.webp` | 299380 | `2fbbed8b17b274e3cdcc9a396acd6b33d9207c847bf05891a8e082130e79bfd7` |
| `data/normalized/assets/env/rock-normal.webp` | 378900 | `caabc3298c804f510cfdcdf7b8d02d4ab13635e0f7381db1fce6716721a28658` |
| `data/normalized/assets/env/rock-rough.webp` | 198192 | `e39cc1e7e71565d6d3af4331b5b897f08843ad5beafd66286f8416a0821480a2` |
| `data/normalized/assets/env/source-rock.glb` | 2596804 | `2e6bc55154a3074ac585f46b117f15a349630eea34f7d749c10d3f9866160af0` |
| `data/normalized/assets/env/source-cabin.glb` | 1003296 | `f09a88c767183a3eaa57a903f62dec74bc94c586e3c724d7c3cd246b0fbf33c4` |
| `data/normalized/assets/env/source-pickup.glb` | 1072696 | `affe2402b3fc78193ade8c68cb214313b0617e96084eea4193f28f46db6f0d83` |
| `data/normalized/assets/env/source-tanker.glb` | 3419188 | `551c033320f90ed3599cd1c57c7ea89f3a52d4503a38a5ef20c8a5a4916b10c1` |


## Task 3 correction: engineering geometry-only dressing

Derived from the already credited CC BY 4.0 cabin (ROGUE), container (Strifey7), pickup (elkarimeldino) and tanker (ezbreneman). Same source URLs/licenses as above. Textures removed, neutral-grey material, lossless meshopt; decoded vertex attributes verified byte-identical by scripts/prepare-engineering-dressing.mjs. Initial engineering pack only.

| File | Bytes | SHA-256 |
|---|---:|---|
| `data/normalized/assets/dressing/source-cabin.glb` | 9116 | `165774542b1440b48f9e14cf2b68702b3c59de2aae80cd881de77d329f38a2c3` |
| `data/normalized/assets/dressing/container.glb` | 57612 | `089f98ed0db5c6e4b6b890bacac4d83599b6232f115070f00b2e77eafeb633fc` |
| `data/normalized/assets/dressing/source-pickup.glb` | 367608 | `0f412c94504dee156dc8b84a49b7dc5163a37ef4713fd5f0df61d3d3d71d8f6c` |
| `data/normalized/assets/dressing/source-tanker.glb` | 1640748 | `4e68e0c347690418bbc580b1c0b345a9b63264ab96856dbeb0e42116756ffba7` |
