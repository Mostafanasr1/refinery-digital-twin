# Stage C Task 01 — motion and time of day

Status: preflight only; road-layout ruling required. No Stage C implementation or runtime presentation-data changes have been made. Stage B Task 9 is complete and live at main `83e54ba`; working branch is dual-look.

## Authorized scope

Photoreal motion: blinking red aviation lights on stacks and flare tip; one instanced pickup and one instanced tanker looping on site roads without entering equipment footprints; rotating fans at air coolers/cooling towers; slow steam wind drift, daytime dust and a gate flag. Flow pulses along the active process path are the explicit both-look exception. No people or birds. All motion is presentation data and has a master disable switch. Engineering otherwise stays untouched.

Replace Day/Night toggle with continuous time of day, interpolating sun elevation/colour, sky, environment intensity, fog colour and lamp emissive strength. Day and Night become presets; expose a photoreal slider and an attract cycle of roughly four minutes per day that pauses on any input. Budgets unchanged, night p95 <=25 ms. Evidence: six cameras at day/dusk/night, a 60 fps CAM-6 full-cycle video using the approved high-quality recording rule, metrics, internal spec and quality reviews. Publish dual-look to /next/ and stop at this gate. Physical Samsung A35 corrected loading timing/layout review is deferred here by Mostafa.

## Observed blocker

`blender/scripts/build_site_context.py:49` creates two straight, parallel roads; its only additional road section is the west gate stub. `app/src/Atmosphere.tsx` agrees. `SiteDressing.tsx` contains stored pipe bundles only. There is no connected road circuit or dedicated turning area. A believable closed pickup/tanker circuit would require a presentation geometry change beyond adding motion to the existing scene.

Observed site bounds in canonical x/y: x=-26..266, y=-46..144. Existing road centre lines: y=-37 and y=135, width 8 m. Checking proposed end connectors against rotated canonical equipment footprint bounding boxes found that x=-17 overlaps TK-101/102/103 by 1 m. Moving the west connector to x=-21 gives 3 m of footprint clearance; east x=257 also gives 3 m to the nearest BT-501/502 footprints. Each connector would be 172 m long. These are preliminary footprint checks, not full vehicle swept-path or site-context clearance approval.

## Decision requested

Recommend authorizing two photoreal-only, non-canonical end road connectors, offset to clear the tank footprints, so vehicles can use a continuous circuit. Validate turns, fences, cabins and other presentation geometry during implementation. Canonical assets, engineering rendering and budgets remain unchanged. No connectors have been built. If the road layout must remain fixed, Mostafa needs to choose the acceptable alternative vehicle movement pattern.

## Paused state

Task 9 correction commit d9fdb3a, release merge 83e54ba, deployment 36127009075; Chrome and Edge live checks PASS. Stage C only inspected existing source and computed preliminary clearances. No scene, canonical, asset or presentation configuration changes for Stage C; no assets downloaded. No background implementation jobs or reviewers running. Await the road-layout ruling before any Stage C execution resumes.
