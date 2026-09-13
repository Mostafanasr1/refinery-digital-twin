# Phase 8 visual refinement

## Changes

The plant now has 43 normalized assets. Added product coolers, draw pumps, a utility
air receiver, product separator, and continuous rack sections. Repositioned the core
process area to form an equipment island between the crude and product tank farms.
Connection records now include metre-scale route_points and diameters. Both Blender
and the runtime consume these routes. The crude-to-products trace includes the diesel
cooler before storage. No asset values or sequences were embedded in UI components.

Blender source and GLB were regenerated with 168,252 triangles and stable metadata.
Materials retain their industrial palette during path dimming. The local environment,
warm/cool lighting, shadows and restrained bloom remain self-contained.

Camera focus/reset now interpolate to their destination instead of snapping. Manual
orbit interrupts the transition. The HUD is narrower, its hierarchy is cleaner, and
the initial overview shows the full engineering model. Follow the process starts the
looping flow explanation. Search and select equipment to see close-up detail.

## Verification

- npm run check passed: 11 frontend tests, 15 Python tests, ESLint, Ruff, canonical
  validation, TypeScript and production build.
- Browser: all 43 equipment entries, GLB rendering, process tour, selection, camera
  transition and reset checked without reported page errors.
- Active process playback measured approximately 75-79 FPS in this browser session.
  This is a local observation, not a guaranteed exhibition-device benchmark.
- Diagnostics observed 549 render calls across the rendering passes and about
  313,102 rendered triangles. Source model geometry is 168,252 triangles.
- Screenshots: phase-8-overview.png, phase-8-process.png, phase-8-column.png.

## Run and rebuild

npm.cmd run dev
npm.cmd run build:models
npm.cmd run check
npm.cmd run build

The Blender source remains blender/assets/refinery.blend; the application loads
 data/normalized/models/refinery.glb. Use BLENDER_BIN for another Blender installation.

## Limits

This is a refined procedural demonstration, not a photorealistic engineering model.
It does not yet reproduce the reference image's density or photographic rendering.
The initial JS chunk is still approximately 1.31 MB; Vite emits its size warning.
Adaptive geometry LOD and hardware-specific exhibition tuning remain optimization
opportunities. Phase 9 offline/kiosk packaging has not been implemented.
