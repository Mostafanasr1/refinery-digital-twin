# Stage C Task 3 closing corrections

Local corrections implemented and verified; external engineering candidate approval pending at the combined Task 4 gate. Original Task 3 plant/night approved; terrain accepted provisionally with far hills/tiling deferred.

## Changes

Plant dressing is visible in both looks under the same Dressing switch. Engineering uses untextured neutral grey; landscape rocks/scrub remain photoreal only, and the engineering grid remains. No canonical asset was added, removed or hidden. Moving pickup and tanker source nose is -X; a PI yaw correction aligns it with the path tangent. Static vehicles are unaffected.

Geometry-only versions of the four sourced models are losslessly meshopt-compressed. Vertex attributes are checked byte-for-byte against the source geometry. These initial engineering assets add 2,075,084 bytes plus a small manifest; photoreal textures remain lazy. Loading counts the new engineering files and waits for the correct sourced dressing to draw.

## Evidence

`evidence/stageC-task-03/correction/engineering-candidate/`: 12 fixed-camera default/selected captures. This is a candidate, not the approved baseline. Task 4's candidate is stored separately. No approved baseline files changed.

`visibility-diff.json`: all 57 canonical assets have enabled base geometry in engineering, photoreal day and night, each in Blender and proxy mode. Zero per-look differences. This measures scene visibility, not pixel occlusion. All six sourced batches follow the shared switch. No canonical hashes changed (32 files;57 assets/6 units).

`pickup-forward.png`, `tanker-forward.png` and matrix assertions confirm noses face the near-road +X and opposite-road -X travel directions. `entry-check.json`: direct photoreal -> first engineering -> photoreal and initial proxy drawing pass. Build and prior full npm check pass (26 Vitest,31 pytest,7 visual-tool tests).

## Budgets

All inherited budgets PASS in docs/metrics/stageC-task-03-correction.json. Engineering median1.5ms/p952.2ms/68calls; initial10,950,548bytes. Photoreal day2.8/4.1ms/159.2calls. Night3.9/6.1ms/191.2calls. Engineering500:1.6/9.3ms/78.3calls. AC/Performance, recorded two144Hzdisplays, RTX3050, Chrome146,1600x900DPR1, approved uncapped protocol.

## Limitations and files

Vehicle close-ups also reveal pre-existing cabin emissive-pane offsets from the sourced window frames; this is outside the requested two corrections and is recorded for a later pass. Existing night lighting at CAM-6 remains as approved.

Changed SourcedDressing, SiteDressing, PhotorealEnvironment, Scene, TimeControls/main UI, loading/draw gate/build size inventory, visibility snapshot, presentation placement, geometry-only derivatives/preparation script and evidence helpers. Canonical data, captions/timing and approved baseline remain unchanged. New geometry derivatives retain the original CC BY credits in ASSETS.md.

Next: Task 4 under the explicit combined-gate ruling. Do not promote either engineering candidate until approved.

Internal spec and code-quality reviewers both give final PASS for the correction. No unresolved blocker. External candidate approval remains at the combined Task 4 gate.
