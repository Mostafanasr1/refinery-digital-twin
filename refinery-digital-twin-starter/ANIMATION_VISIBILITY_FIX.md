# Animation visibility and first visual refinement

The previous flow marker was small and travelled at 3 metres elevation, often inside
or behind equipment. Scenario playback had no path highlight, so only status and
telemetry changes were visible. The short process sequence also ended quickly.

Changes:
- Raised, explicitly illustrative flow paths with five bright directional arrows per
  connection; physical pipe routing remains separate and unchanged.
- Process tour starts on load, loops continuously, and can be paused or stopped/reset.
- Scenario path stops during the duty-pump trip and switches to the standby route.
- Floating current-equipment label makes ordered process highlighting legible.
- Local environment reflections, warm/cool lights, shadows, restrained bloom,
  site plinth, roads, boundary lights and revised exposure.
- Regenerated Blender assets with circumferential tank stairs, guardrails, nozzles,
  column risers, furnace supports and cooling tower louvres. Export: 143,892 triangles.

Verification: 11 frontend and 15 Python tests, lint, normalization, and production
build pass. Two captured running frames show 5,146 changed pixels in a crop of the
3D scene excluding the playback timer, confirming visible scene movement.
Browser screenshots: refined-flow.png, flow-frame-a.png, flow-frame-b.png.

The aesthetic is an initial refinement pass, not yet the reference image's final
photorealistic target. The elevated arcs are flow explanations, not engineering pipes.
The initial JS bundle warning remains. No external textures or CDN assets are needed.

Pause verification: 0 changed scene pixels between paused screenshots.
