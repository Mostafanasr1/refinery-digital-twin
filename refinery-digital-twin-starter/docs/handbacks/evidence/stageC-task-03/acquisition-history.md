# Stage C Task 03 â€” environment from real assets

Status: sourcing resumed; Google/Sketchfab sign-in verified on 2026-09-25. The earlier container EULA stop is resolved. Not submitted for acceptance. Task 2 approval and Mostafa's visual verdict are recorded in its hand-back. Task 3 brief is saved at `docs/superpowers/plans/2026-09-25-stage-c-task-03-real-assets.md`.

## Current progress and decision needed

Mostafa personally accepted the Fab agreement and confirmed completion. The downloaded container ZIP was found locally and converted successfully by `blender/scripts/import_site_container.py`. The script verifies the source hash, checks archive paths, imports the FBX, grounds and scales it to 6.058 metres long, reconstructs its base-colour/normal material, reduces textures to 1024 pixels, and exports a presentation GLB. It does not accept agreements or download files.

Output `data/normalized/assets/env/container.glb`: 2,493,696 bytes; SHA-256 `c1f9e73528911db560d7794843e54642e7bfddf58f872aa4093bae7fd9d43db7`. NodeIO successfully reads one mesh, one material, two textures, 1,842 triangles. This is source preparation only: it is not integrated into the scene or visually accepted. `npm run data:verify` passes: all 32 canonical files unchanged. Full tests, screenshots, metrics and reviews have not run for Task 3. No commit, push or deployment yet.

The brief permits Sketchfab **filtered to CC0**, followed by Fab free with its license recorded. Public CC0 searches have not identified suitable pickup/tanker/site-cabin replacements. A wider discovery-only Sketchfab search returned relevant tanker models under **CC Attribution**, outside that Sketchfab boundary; none were downloaded. Example candidate: https://sketchfab.com/3d-models/none-33fa260e257a42dc8cb20608761eef2d (Tanker Truck (Bowser)). Its public API identifies CC Attribution; its own-page license and visual fitness must still be verified before acquisition. No ripped-game candidates will be used.

Fab's own free search was also inspected. A pickup candidate, https://www.fab.com/listings/7acb0ec5-dd9d-4b0f-b9c6-a0a46f89a9fc (Hilux-like pick-up truck, matisosanimation), explicitly lists Free and CC BY 4.0 on its live page; original ZIP 7.59 MB. It has not been downloaded. The General Realistic Utility Truck 1 page displayed no license value and was not selected. No suitable free tanker/cabin with verified terms has yet been selected; this does not claim that none exists.

Requested ruling: extend the Task 3 Sketchfab allowance from CC0-only to verified CC BY 4.0 for sourced cabin/vehicle replacements, with attribution and modification records. Recommend this narrow extension because Task 3 already permits attribution-licensed Fab assets. Paid assets, NC/ND/ShareAlike assets and assets with unclear provenance remain outside this request. Until Mostafa answers and authorizes continuation, all Task 3 work pauses under the workspace agreement. No background jobs or review agents remain running.

## Boundary

Photoreal only, judged at unchanged CAM-6 day against `docs/reference/petromind-wide.png`. Engineering and canonical data unchanged. CAM-6 p95 <=25 ms; lazy assets <=80 MB. Work remains on dual-look for /next/; main remains the release.

## Source preflight observations

- Poly Haven model catalog queried through its public API. Suitable rock scans exist; no suitable site cabin, pickup or tanker replacement identified in the catalog query.
- Individual Poly Haven pages inspected before any download: [Gravelly Sand](https://polyhaven.com/a/gravelly_sand), [Sand 02](https://polyhaven.com/a/sand_02), [Sand Rocks Small 01](https://polyhaven.com/a/sand_rocks_small_01), and [Rock Face 03](https://polyhaven.com/a/rock_face_03). These are candidates, not incorporated assets. Gravelly Sand, Sand 02 and Sand Rocks Small 01 explicitly displayed CC0 in retrieved page content. Final selection and full provenance remain outstanding.
- Sketchfab public API queried with licenses=cc0 and downloadable=true. Queries pickup, tanker and portable cabin returned no results. The container query returned unsuitable small/historical objects. This is a search observation, not proof no suitable model exists anywhere.
- Some search hits say CC0 in descriptive text but list another license in the actual license field. None were downloaded or accepted as CC0.
- The permitted Fab fallback produced [Low Poly Shipping Container by Strifey7](https://www.fab.com/listings/dfb39352-ae9b-4e17-a6f2-aed1ce39d5c5). Its live page explicitly shows Free, CC BY 4.0, FBX and converted GLB/glTF/USDZ, with a 15.27 MB source ZIP. This is a candidate under the task's Fab-free exception, not a claim of CC0 and not yet selected for final visual quality.
- DEM research is preliminary. No tile downloaded or chosen. Do not label blended Mapzen terrain tiles as pure public-domain SRTM without verifying contributing sources.

## Blocker and resume condition

Resolved for the container: Mostafa personally accepted and downloaded `D:/Downloads/low-poly-shipping-container.zip` (16,012,423 bytes; SHA-256 `b7ef4f9674896d663e1522b77c6a29ab54777320a3d91f6d88055d440ea3f632`). The archive contains the source FBX and base-colour/normal textures. The in-app browser remains signed out and still prompts; no agent acceptance was performed. Use the supplied local archive, retaining attribution. The following paragraphs preserve the historical stop.

Clicking Fab's Download opens an unchecked agreement: "I have read and agree to the Fab End User License Agreement", with disabled Accept. Agreement URL: https://www.fab.com/eula.

The browser tool's confirmation policy requires explicit confirmation at action time before accepting an EULA, even with prior source authorization. Nothing was accepted. Ask Mostafa whether to accept this Fab EULA to access the free model download. Resume only after an answer resolves this blocker and authorizes continuation. In accordance with the workspace working agreement, all Task 3 execution pauses while that answer is pending; do not work around the pause on terrain or other independent parts.

No background jobs or review agents started for Task 3. No asset binaries downloaded, no runtime changes, no canonical changes, no tests or metrics run, no new deployment. Changes so far are approval/state documentation and the saved Task 3 plan. Asset hashes/sizes will be recorded in ASSETS.md only after authorized acquisition; this hand-back does not claim asset acceptance or completed implementation.

## 2026-09-25 sourcing ruling â€” current

Mostafa: "get all the assets you need to build a better than petromind photo mate". This resolves the sourcing-boundary question and authorizes sourcing beyond the prior Sketchfab CC0 filter, including verified attribution-licensed models. Acquisition remains free; each source license, attribution and modifications will be recorded. No performance, canonical, engineering or gate boundary changes. Reference superiority is an aspiration, not a claimed result. Earlier pause paragraphs above are historical and superseded.

## Current acquisition state and authentication blocker

Downloaded six Poly Haven 1K texture maps (Gravelly Sand and Rock Face 03), Sand Rocks Small 01 glTF plus four dependencies, and SRTM N28E033 GeoTIFF (11,779,400 bytes; decoded successfully as 3601 x 3601 signed heights). Poly Haven published MD5 values match. Sources and hashes are recorded in ASSETS.md and evidence/stageC-task-03/source-intake.json. These are source intake only, not scene integration or finished evidence.

Two additional CC0 vehicle candidates from 3DAssets.dev were downloaded and rendered in Blender, then rejected for visual quality. They are explicitly AI-generated source models; neither is selected for runtime. The pickup has visible modelling defects; the tanker is a simplistic trailer. No reference-quality claim.

A stronger tanker candidate by ezbreneman is listed at https://sketchfab.com/3d-models/tanker-truck-0bfeafdb2eb94612ad89ea2e794cf249 (64.3k triangles, own-page CC BY 4.0 verified). Its download requires sign-in. Google recognizes Mostafa's existing account but requests his password in the in-app browser. No password entered, no new agreement accepted, no model downloaded from Sketchfab. Ask Mostafa to finish sign-in in the browser (never send credentials in chat), then confirm continuation. All work pauses when that request is sent; no jobs or agents running. The earlier license question is resolved and is not being asked again. No runtime or canonical changes, commit, push, deployment or Task 3 gate submission.


Sign-in pause resolved: Mostafa confirmed completion; signed-in Sketchfab session verified. Tanker Truck by ezbreneman acquired through the official download UI (CC BY 4.0), copied to local source intake and successfully imported/rendered with Blender. 11,069,784 bytes, SHA-256 bf15aa18bdb055291ebe5ca7b7c37eece5a72303ccc8cc7cc5454547cf85c4f6. Not yet integrated or visually accepted. The browser download arrived in D:/Downloads/tanker_truck.glb. No new agreement was accepted by the agent.


## Source acquisition checkpoint

Signed-in downloads verified locally: tanker by ezbreneman (11,069,784 bytes), Toyota Hilux 1983 by elkarimeldino (4,070,956 bytes), and four Container Cabins by ROGUE (1,091,484 bytes). Each is CC BY 4.0, checked on its individual page before downloading. All import and render in Blender. Source previews are in evidence/stageC-task-03/*-source-preview.png. They have useful geometry/texturing for CAM-6; final fitness, material adaptation, instance batching and performance remain to verify in the actual scene. Cabin colours should be muted for an industrial site; the tanker needs daylight material tuning. No new agreement was accepted and no credentials were accessed.

All required source categories now have local files: SRTM terrain, Poly Haven sand/gravel/rock surfaces and rock model, container, cabin variants, pickup and tanker. Existing CC0 sand and HDR remain available. The David_Holiday Hilux candidate was not downloaded because its comments raised a provenance concern. Two earlier 3DAssets.dev candidates remain rejected. Acquisition is not Task 3 completion: terrain crop, optimized derivatives, integration, loading-progress coverage, regression, metrics, six-camera comparison, internal reviews and commit/push remain outstanding. No active authentication blocker; no jobs or agents running. Canonical data and the deployed scene have not changed.
