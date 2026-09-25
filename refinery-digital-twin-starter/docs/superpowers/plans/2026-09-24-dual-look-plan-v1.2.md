# Refinery Digital Twin: Dual-Look Enhancement Plan (v1.2)

Version: 1.2, 24 Sep 2026. v1.1 revised after Codex's repo review; v1.2 reconciles Stage A evidence, hand-back naming, presentation data and the Task 5 acceptance target. Change log in section 11.

Technology direction, confirmed: Blender for model generation, Three.js for both interactive looks, React for controls and information. No other renderer or runtime is in scope.
Date of v1.0: 23 Sep 2026
Owner: Mostafa Nasr, Project X
Builder: Codex, running Astra
Reviewers: Mostafa (domain and visual), Claude (software and plan)
Live site: https://mostafanasr1.github.io/refinery-digital-twin/
Supersedes: v1.0 of this plan. Runs beside `docs/plans/2026-09-14-roadmap.md`.

## 0. Sequence: grow first, then build

Decision, 24 Sep 2026: the plant grows before the look changes.

**Stage A: roadmap Phase 1, silhouette library.** Execute `docs/plans/2026-09-14-phase-1-silhouette-library.md` as written. It is already fully specified: 8 tasks, `pipeline/catalog.py` as the single source of truth for equipment types, the Kit plus BUILDERS registry, the in-Blender self-check (`npm run check:generators`), runtime proxy families, twelve new silhouettes in four families, an LPG storage unit and a diesel hydrotreater. The plant goes from 43 assets across 4 units to 57 across 6. Its own acceptance criteria hold. Every Phase 1 task uses the audit loop in section 2, with the Stage A evidence rules in 0.1. Phase 1 Task 8's engineer sign-off screenshots go to Mostafa.

### 0.1 Stage A evidence rules

Stage A runs before the screenshot, metrics and data-verification tools exist, and it changes plant data on purpose. So its evidence is different from Stage B's.

- **Canonical data may change.** Adding units, assets and types is the job. The freeze in section 3 rule 2 does not apply in Stage A. Each Stage A hand-back lists every canonical file changed with a one-line summary of what was added, and the asset and unit count before and after.
- **Tests are the gate.** The Phase 1 plan's own acceptance criteria per task, pytest, vitest, and `check:generators` once it exists. All pasted into the hand-back.
- **Screenshots are manual.** No capture protocol yet. Each hand-back that changes what is on screen includes the default view plus one framing per new or changed unit, at 1600 x 900, taken from the local build. Good enough for review, not for pixel comparison.
- **No metrics required.** Codex notes anything that visibly slows the app. Numbers arrive at Stage B Task 0.
- **Stage A closes by freezing the data.** After Stage A Task 8 is approved, the canonical data as it then stands becomes the frozen baseline that Stage B Task 0 hashes.

Hand-back files for Stage A are named `docs/handbacks/stageA-task-NN.md`.

**Stage B: this plan, Tasks 0 to 9.** Starts only after Stage A is approved. Task 0 measures the grown plant, not the 43-asset one. Hand-back files for Stage B are named `docs/handbacks/stageB-task-NN.md`.

Roadmap Phases 2 and 6 stay untouched. Roadmap Phases 3, 4 and 5 are partly pulled into Stage B, as marked in each task.

---

## 1. Read this first

This file is the whole brief. Do not rely on any chat history. If something you need is not here and not in the repo, stop and ask. Do not guess.

### 1.1 What we are building

The twin gets two looks over one truth.

- **Engineering look.** The current dark HUD: grid floor, flat pale equipment, cyan selection glow, amber outlines, lamp posts. We keep it and sharpen it. It is a first-class mode, not a fallback.
- **Photoreal look.** The same plant, same cameras, same data, rendered as a real site: desert terrain, real sky, worn steel, concrete, shadows, haze. The benchmark is PetroMind Rig Explorer (rig.petromind.ai): a browser app whose realism comes from environment, materials and lighting, not from exotic geometry.

The user switches looks with the top tabs ("Refinery demo" becomes Engineering, "Photoreal preview" becomes Photoreal). The Geometry dropdown is not a look control. It selects Blender GLB versus primitive proxies and keeps that job. Selection, the data card, operating state, process paths, data layers and scenarios behave identically in both looks. That continuity is what makes this a digital twin rather than two visual demos.

### 1.2 The one architectural rule

**One plant. One asset identity. Never a duplicate plant.**

A look is a settings object the runtime reads. It controls:

1. Material set applied to equipment
2. Environment: background, sky, ground, fog
3. Lighting: lights, shadows, environment intensity
4. Post-processing stack and tone mapping
5. Visibility of optional groups: site context (terrain, fence, roads, buildings) and hero detail levels

Item 5 is the only way a look may change what geometry is on screen. The plant assets themselves, their IDs, their JSON binding, the camera, selection, operating state, cards and tours are look-agnostic. If a task tempts you to branch data or selection logic by look, stop. That is the wrong design.

Note on the current code: the existing "Photoreal preview" tab opens a separate study with its own scene, camera, selection state, a detailed exchanger and pump model, and an optional Cycles still. That study is not the photoreal look. Task 1 retires it from the tab and preserves it under `reference/photoreal-study/` for Task 4 to draw on.

### 1.3 Why this order

Grow the plant first, so the look is built on the equipment the demo will actually show. Then evidence, then the look system, then performance headroom, then environment, materials and hero detail. Baked lighting last and optional. Each step is the cheapest remaining move toward the benchmark, and no step adds load before the budget exists to absorb it.

---

## 2. Roles and the audit loop

The builder and the reviewers are separate. Nothing Codex produces is accepted because it was produced.

| Role | Who | Owns |
|---|---|---|
| Builder | Codex (Astra) | Code, tests, screenshots, metrics, the hand-back |
| Software reviewer | Claude | Diff review, tests, budgets, scope, regressions |
| Domain and visual reviewer | Mostafa | Does it read as a refinery, does it read as real, does the HUD still feel right |

### 2.1 The loop, per task

```
Codex builds task N
  -> Codex runs tests, captures screenshots, records metrics
  -> Codex writes the hand-back (section 2.2)
  -> Claude reviews: APPROVE or CORRECT with numbered findings
  -> Mostafa reviews visuals: APPROVE or CORRECT
  -> both APPROVE: merge to `dual-look` branch, publish to /next/, task N+1
  -> any CORRECT: Codex fixes only the findings, re-submits
```

Codex never starts task N+1 before task N is approved by both reviewers.

### 2.2 Hand-back format

Every task ends with a hand-back file (`stageA-task-NN.md` or `stageB-task-NN.md` under `docs/handbacks/`) and a short message pointing to it. The file contains, in this order:

1. **Summary.** Three to six plain sentences. What changed and why.
2. **Files touched.** Full list. Flag any file outside the task's declared scope and explain it.
3. **New dependencies.** Name, version, license, why. "None" if none.
4. **New assets.** Name, source URL, license, size. Must also appear in `ASSETS.md`.
5. **Tests.** Commands run and their results, pasted.
6. **Metrics.** The metrics table (section 5.3), before and after.
7. **Screenshots.** Paths to all fixed-camera captures (section 5.2), both looks.
8. **Visual regression result.** Engineering look diff percentage per camera.
8a. **Canonical data check.** Output of `npm run data:verify` (section 3, rule 2). Must say unchanged.
9. **Known issues.** Anything you noticed and did not fix. Be honest. An empty list that should not be empty is a failed review.
10. **Commit hash.**

No screenshots or no metrics means no review. The task is returned unread.

### 2.3 Review checklist (what the reviewers apply)

- **Integrity.** Engineering look within regression tolerance. Data card, selection, process paths, data layers and scenarios unchanged. All tests green.
- **Budget.** Metrics within section 5.4.
- **Scope.** Only declared files touched, or deviations justified.
- **License.** Every asset CC0 and registered.
- **Visual.** Screenshots against baseline and benchmark.
- **Honesty.** Known issues complete.

Any failed line returns the task.

---

## 3. Ground rules for Codex

1. **Free assets only.** CC0 or equivalent public domain. Approved sources: Poly Haven (polyhaven.com), ambientCG (ambientcg.com), Blender's bundled assets. Anything else needs approval before download. Every asset goes in `ASSETS.md`.
2. **Do not change canonical data in Stage B.** Canonical data is the plant truth: units, assets, types, connections, telemetry, documents. The root build and check commands run normalization, which writes normalized JSON. That is allowed. What must not change is the canonical content. Stage B Task 0 records a hash of the canonical inputs and adds `npm run data:verify`, which recomputes it. Every Stage B hand-back includes its output. Generated models, material packs and other outputs live in their designated output folders and are free. If a task seems to need a canonical change, stop and ask.

   **Presentation data is separate and free.** Looks, fixed cameras, tours, camera moves and captions are presentation, not plant truth. They live in their own files (for example `data/presentation/looks.json`, `cameras.json`, `tours.json`, or under `src/` if the app keeps config there; Task 0 decides and records the location). Presentation data may change in any Stage B task, declared in the hand-back under Files touched. It is excluded from the canonical hash.
3. **Engineering look must not regress.** Section 5.5 defines the tolerance.
4. **No new runtime dependency without declaring it.** Dev dependencies for testing (for example Playwright, gltf-transform) are allowed and must be declared in the hand-back.
5. **Small commits on the `dual-look` branch.** One logical change per commit. Conventional messages: `feat(look): ...`, `perf(scene): ...`, `test(visual): ...`. Never push to `main` during Stage B. `main` deploys the live demo automatically and stays as people currently see it until Task 9.
6. **Stay in scope.** Each task lists what is out of scope. Respect it even when a fix is tempting. Log it under Known issues instead.
7. **Windows first.** The primary machine runs Windows with PowerShell. Scripts must work there. Use cross-platform Node or Python, not bash-only scripts.
8. **Generated output is disposable.** Anything built by the Blender pipeline must be reproducible from source by one command. Never hand-edit a generated GLB.
9. **When in doubt, ask.** A question costs minutes. A wrong assumption costs a review cycle.

---

## 4. Repo facts

Confirmed by Codex on 23 Sep 2026 against the repo. Task 0 rewrites this section into `docs/REPO_FACTS.md` after Stage A, with anything Stage A changed.

- Static web app. React and Three.js. No backend.
- Canonical plant data in JSON. Root build and check commands run a normalization step that writes normalized JSON.
- Blender pipeline in Python. Blender runs headless and exports GLB loaded by the runtime.
- Before Stage A: 43 synthetic assets across 4 units. No `catalog.py`, no builder registry, no `check:generators`. Stage A adds all three and grows the plant to 57 across 6.
- Engineering materials originate in the GLB and are modified at runtime by selection and data-layer effects. They are not a separate flat library.
- The "Photoreal preview" tab opens a separate study: own scene, own camera, own selection state, a detailed exchanger and pump model, an optional Cycles still.
- The Geometry dropdown selects Blender GLB versus primitive proxies. It is independent of appearance.
- Scenarios support camera focus. There is no camera-move or caption tour system. Task 8 builds it.
- Engineering renders on demand, not continuously. Idle FPS is meaningless. See 5.3.
- Pushing to `main` deploys to GitHub Pages automatically. Must be served over http.
- Git root is the **parent** folder of the app.
- Known loose ends from 14 Sep: stale shared zip, commit hygiene, leaky `.gitignore`. Task 0 closes them.
- Reference hardware: laptop with RTX 3050, 4 GB VRAM. All budgets are measured here.

---

## 5. Definitions used by every task

### 5.1 The look object

Proposed shape. Task 1 finalizes it against the real code.

```ts
type LookId = "engineering" | "photoreal";

interface Look {
  id: LookId;
  materials: MaterialSetId;        // which material set to apply
  environment: {
    background: "grid" | "hdri";
    hdri?: string;                 // asset path
    ground: "grid" | "terrain";
    fog?: { color: string; near: number; far: number };
  };
  lighting: {
    preset: "hud" | "sun";
    shadows: boolean;
    envIntensity: number;
  };
  post: {
    toneMapping: "none" | "aces" | "agx";
    bloom?: { intensity: number; threshold: number };
    ao?: boolean;
  };
}
```

Rules:
- Looks are data in one file (for example `src/looks/looks.ts`). Components read the active look. They never hard-code look values.
- Switching looks must not reload geometry. Materials are swapped on existing meshes. Original materials are cached, not discarded.
- A short fade (about 300 ms, a full-screen overlay to dark and back) hides the swap. No true crossfade of two renders.

### 5.2 Fixed cameras

Five named camera positions, committed as data (for example `tests/visual/cameras.json`). Every screenshot in every hand-back uses these, at 1600 x 900.

| ID | Framing |
|---|---|
| CAM-1 overview | The current default wide oblique view of the whole plot |
| CAM-2 heater | Close on F-201 Crude Fired Heater and the pipe rack beside it |
| CAM-3 column | Low angle on the main distillation column |
| CAM-4 tanks | The tank farm, lower right in the default view |
| CAM-5 flare | The flare stack against the sky |

Task 0 sets exact coordinates from the grown plant after Stage A. If the LPG area or the hydrotreater deserves a frame, Task 0 may propose a sixth camera for reviewer approval. After Task 0 the set does not change unless a reviewer approves it.

Capture protocol, mandatory for every screenshot: time frozen at a fixed value, all animation paused, all assets loaded and settled, camera set programmatically, fixed window 1600 x 900, fixed device pixel ratio of 1, same browser and flags every run, hardware acceleration confirmed. Codex documents the exact flags in `docs/REPO_FACTS.md`.

### 5.3 Metrics

A script (Task 0) records, per look, on the reference laptop. Because engineering renders on demand, every measurement runs under a fixed active workload: a scripted 10 second camera orbit around CAM-1, forcing continuous rendering, after a 3 second warm-up. Fixed window 1600 x 900, device pixel ratio 1, hardware acceleration confirmed and logged.

| Metric | How |
|---|---|
| Draw calls | `renderer.info.render.calls`, mean over the orbit |
| Triangles | `renderer.info.render.triangles`, mean over the orbit |
| FPS | median over the orbit |
| Frame time p95 | ms over the orbit |
| Resource counts | `renderer.info.memory` geometries and textures. These are counts, not GPU memory |
| Initial download | bytes transferred before first interactive frame |
| Total asset size | bytes of everything the photoreal look can load |

### 5.4 Budgets

Proposed. Reviewers set the final numbers at Task 0 approval once the baseline of the grown plant is known. Task 1 is not held to these numbers. Task 2 is the first task that must meet them.

| Metric | Engineering | Photoreal |
|---|---|---|
| Draw calls | at or below 120 | at or below 150 |
| FPS median, reference laptop | at or above 60 | at or above 40 |
| Frame time p95 | at or below 20 ms | at or below 33 ms |
| Initial download | at or below baseline plus 1 MB | n/a |
| Photoreal assets, lazy loaded on first switch | n/a | at or below 40 MB |

Photoreal assets load only when the user first switches to photoreal. The engineering look must not pay for them.

### 5.5 Engineering-look regression tolerance

A visual regression script (Task 0) renders the engineering look at all fixed cameras under the capture protocol in 5.2 and compares against the committed baseline with a per-pixel diff. Because the engineering materials live in the GLB and are modified at runtime, the baseline is captured with no selection and the default data layer, and a second baseline with one fixed asset selected, so both the imported materials and the runtime effects are covered.

- Tasks 1 to 7: at or below 0.5 percent differing pixels per camera. The engineering look should not change in these tasks.
- Task 8 intentionally improves the HUD. From Task 8 onward a new baseline is committed after reviewer approval.

---

## 6. Tasks

Each task lists: goal, scope, steps, acceptance, evidence, out of scope.

---

### Task 0: Baseline and hygiene

**Goal.** Know exactly what exists. Lock the measuring tools before anything changes.

**Scope.** `docs/`, `tests/visual/`, `scripts/`, `.gitignore`, repo root housekeeping.

**Steps.**
1. Re-verify section 4 after Stage A. Write `docs/REPO_FACTS.md`: folder layout, commands, test counts, Blender path and version, Node version, deploy flow, branch and publish flow, browser flags for capture, asset count.
2. Screenshot and document the existing photoreal study and the Geometry dropdown as they are, so Task 1 has a record of what it consolidates.
2a. Record the canonical data hash and add `npm run data:verify`.
2b. Set up the `dual-look` branch and the `/next/` publish path on the same GitHub Pages site. Confirm `main` is untouched by it.
3. Fix the loose ends: remove or regenerate the stale zip, tighten `.gitignore` (node_modules, build output, Blender temp files, `*.blend1`, OS files), confirm the repo is committed and pushed cleanly.
4. Add a headless screenshot tool (Playwright recommended) that opens the local build, sets a camera from `tests/visual/cameras.json`, waits for a stable frame, and saves a PNG. Command: `npm run shots`.
5. Set the five camera coordinates to match the framings in 5.2. Commit.
6. Add the metrics script. Command: `npm run metrics`. Output a markdown table and a JSON file in `docs/metrics/`.
7. Add the visual regression script with a per-pixel diff (pixelmatch or equivalent). Command: `npm run visual:check`. Commit current screenshots as `tests/visual/baseline/engineering/`.
8. Create `ASSETS.md` with columns: asset, source URL, license, local path, size, used by.
9. Create `docs/handbacks/`.

**Acceptance.**
- `docs/REPO_FACTS.md` exists and is accurate.
- `npm run shots`, `npm run metrics`, `npm run visual:check` run on Windows and pass against themselves.
- Baseline screenshots (both variants per 5.5) and metrics committed.
- `npm run data:verify` reports unchanged.
- `/next/` publishes from the branch and `main` is unchanged.
- Existing tests green, including `check:generators` from Stage A.

**Evidence.** Hand-back with the baseline metrics table and all five baseline screenshots.

**Out of scope.** Any visual change.

**Gate.** Reviewers confirm or adjust the budgets in 5.4 at this approval.

---

### Task 1: The look system

**Goal.** Consolidate the two experiences into one plant with a data-driven look switch. No visual change in engineering. A placeholder photoreal that proves the swap works.

**Scope.** `src/looks/` (new), the scene component, the top tabs, retirement of the separate photoreal study from the tab, tests. The Geometry dropdown is out of scope beyond confirming it still works in both looks.

**Steps.**
1. Implement the `Look` type and a `looks.ts` file holding both presets. Engineering values must reproduce the current scene exactly.
2. Add a single source of active-look state (context or store, matching what the app already uses).
3. Refactor the scene so background, ground, lights, materials and post read from the active look. No hard-coded look values left in components.
4. Material swapping: cache each mesh's imported GLB material on first load, keyed by mesh UUID. Apply the look's material set on switch. Restore from cache when returning, then reapply the runtime selection and data-layer effects so the engineering look is complete. Do not reload GLBs.
4a. Retire the separate photoreal study from the tab. Move its scene, the exchanger and pump model and the Cycles still to `reference/photoreal-study/` with a short README. Nothing deleted.
5. Wire the top tabs to the active look. Leave the Geometry dropdown as the GLB versus proxy selector. Confirm every combination of look and geometry renders and selects correctly.
6. Photoreal placeholder: a plain sky colour, a flat sand-coloured ground, one directional light with shadows. Enough to prove the switch. Not meant to look good.
7. Add the 300 ms fade overlay on switch.
8. Persist the chosen look in the URL (for example `?look=photoreal`) so a link opens in the right look.
9. Tests:
   - Unit: look object shapes are valid, engineering preset matches previous constants.
   - Behaviour: selecting an asset in engineering, switching to photoreal, the same asset stays selected and the card shows identical content. And the reverse.
   - Behaviour: switching looks ten times does not increase geometry count (no reloads, no leaks).

**Acceptance.**
- Engineering regression at or below 0.5 percent at all cameras.
- Photoreal placeholder renders at all cameras.
- Selection, card, operating state, process paths, data layers and scenarios work in both looks and both geometry modes.
- Geometry count stable across switches.
- No material performance regression against the Task 0 baseline. Budgets in 5.4 do not apply yet.

**Evidence.** Hand-back with both looks at all cameras and the switch-leak test output.

**Out of scope.** Real photoreal visuals. Any HUD change.

---

### Task 2: Rendering budget

**Goal.** Create headroom before adding terrain, textures and context. This is the subset of roadmap Phase 4 we need. It is the first task held to the numbers in 5.4.

**Scope.** Scene loading, GLB post-processing, pipeline export options, tests.

**Steps.**
1. Measure draw calls by category (equipment, pipes, lamps, ground, UI helpers). Record in the hand-back.
2. Instance repeated meshes. Lamp posts, identical tanks, pumps, supports and similar repeats become `InstancedMesh` or equivalent. Keep per-instance asset IDs so selection still resolves to the right asset.
3. Merge static non-selectable geometry (pipe racks, ground details, fences when added later) into as few meshes as material count allows.
4. Selection must still work on instanced and merged objects. Map picks back to `asset_id`. Test it.
5. Add GLB optimisation to the build: meshopt or Draco compression via gltf-transform, as a scripted step. Document the command.
6. Add a stress mode behind a URL flag (for example `?stress=500`) that clones assets to about 500, to test scale. Not shipped as a visible feature.

**Acceptance.**
- Engineering draw calls at or below the budget.
- Stress mode at or above 40 FPS on the reference laptop in engineering.
- Every asset selectable in both looks. A test clicks each asset ID and checks the card.
- Engineering regression at or below 0.5 percent.

**Evidence.** Hand-back with draw-call breakdown before and after, stress metrics, selection test output.

**Out of scope.** New visuals.

---

### Task 3: Environment

**Goal.** The single largest step toward the benchmark. The plant stops floating in a void and sits on a site.

**Scope.** Photoreal look only. `public/assets/env/` (or equivalent), environment components, `ASSETS.md`.

**Steps.**
1. HDRI. Choose one CC0 HDRI from Poly Haven: clear or lightly hazy sky, arid or open landscape, sun high enough for crisp shadows. 2K resolution maximum for web. Use it for both lighting (environment map) and background.
2. Sun. A directional light aligned to the HDRI's sun position. Shadow map sized to cover the plot. Tune shadow bias to avoid acne and peter-panning. Shadows on equipment, pipes and ground.
3. Terrain. Replace the grid ground in photoreal with a terrain mesh larger than the plot, gently undulating beyond the fence line and flat inside it. Apply a CC0 sand or dry earth PBR texture from ambientCG or Poly Haven. Tile it with a detail texture to avoid obvious repetition.
4. Plot slab. The plant area gets a concrete or compacted gravel pad, distinct from surrounding desert.
5. Site context, kept simple and generated in the Blender pipeline as a new context module, loaded as a visibility group the photoreal look turns on (rule 5 in section 1.2):
   - Perimeter fence along the plot edge
   - Internal roads with markings following the current lamp post line
   - Two or three portacabin-style site buildings near the gate
   - A few parked vehicles or skids as simple blocks, only if they help scale
6. Distant context: optional low-poly mountain silhouette ring or rely on the HDRI horizon. Choose whichever reads better at CAM-1 and CAM-5.
7. Fog or haze that matches the HDRI horizon colour, to seat distant terrain.
8. Lazy load all photoreal environment assets on first switch. Show a small loading indicator in the photoreal tab while they load.
9. Compress textures. KTX2 (Basis) recommended. Document the command.

**Acceptance.**
- At CAM-1, the plant reads as an operating refinery on an Egyptian desert site. Mostafa judges this against the PetroMind reference in `docs/reference/`. The primary target is PetroMind's wide oblique view with the mountains and the dirt track. Secondary targets are the heater close-up and the flare against the sky.
- Shadows correct and stable while orbiting. No flicker.
- Photoreal budgets hold.
- Engineering initial download unchanged within budget. Engineering regression at or below 0.5 percent.
- All assets registered as CC0.

**Evidence.** Hand-back with photoreal at all cameras, one side-by-side of CAM-1 against the benchmark screenshot (supplied by Mostafa in `docs/reference/`), metrics.

**Out of scope.** Equipment materials. Equipment geometry.

---

### Task 4: Materials

**Goal.** Equipment stops looking like grey plastic in photoreal. It reads as painted steel, insulation, concrete and grating.

**Scope.** Blender pipeline material stage, photoreal material set, `ASSETS.md`.

**Steps.**
1. Define a material library of about eight PBR materials, CC0 sources:
   - Painted steel, light grey or white (tanks, columns, vessels)
   - Weathered painted steel (older equipment)
   - Aluminium-clad insulation (hot lines, insulated vessels)
   - Galvanized steel (pipe racks, structure, ladders)
   - Safety yellow paint (handrails, stairs)
   - Concrete (foundations, plinths, bund walls)
   - Steel grating (platforms)
   - Refractory or dark steel (fired heater casing, flare tip)
2. Add a material stage to the Blender pipeline. Each equipment type in `pipeline/catalog.py` (from Stage A) gets a default material mapping per part (shell, nozzle, support, platform). Mapping lives in data, not in builder code. Builders must expose part names for this to work; Stage A's Kit is where that lives.
2a. The retired photoreal study in `reference/photoreal-study/` already carries a detailed exchanger and pump. Use it as material reference, not as geometry to ship.
3. Weathering. Use a subtle dirt or grime mask (ambient occlusion driven or a CC0 grunge texture) so surfaces are not uniformly clean. Keep it restrained. This is an operating refinery, not a ruin.
4. Export: the pipeline produces two things. Plain geometry GLBs as today, and a photoreal material pack (textures plus a material manifest) that the runtime applies when photoreal is active. Engineering look keeps its runtime flat materials.
5. Pipes: colour-code by service only if it does not fight the realism. Default is insulated cladding for hot lines and painted steel otherwise. Process path highlighting from the HUD must still work in photoreal.
6. Texture budget: 1K textures for most materials, 2K only where the camera gets close (CAM-2, CAM-3). KTX2 compressed.
7. Add a pipeline test that every catalog type maps every part to a defined material.

**Acceptance.**
- Photoreal at CAM-2, CAM-3 and CAM-4 reads as real material. Mostafa judges.
- Selection highlight and process path highlight remain clearly visible over textured materials.
- Pipeline test green. `check:generators` green.
- Budgets hold. Engineering regression at or below 0.5 percent.

**Evidence.** Hand-back with photoreal at all cameras, a material swatch sheet (one sphere or cube per material, rendered in-scene), metrics.

**Out of scope.** Geometry changes.

---

### Task 5: Hero detail

**Goal.** Add the secondary detail that makes the camera's landing points convincing. Start with the types the tours and cameras show.

**Scope.** Blender builders for the hero types first. No new equipment types. Detail is added per type in the builder, so it propagates to every instance of that type across the plant, not to a few hand-picked assets.

**On the acceptance target.** The reference-level look is judged at Task 6, on the whole image, not here. Task 5 is judged at the hero cameras. It is possible that hero-type detail alone leaves the wide view reading flat because non-hero types stay plain. That is what 5b is for.

**Hero set.**
- F-201 Crude Fired Heater
- Main distillation column
- Flare stack
- Two storage tanks in the CAM-4 frame (the builder change applies to all tanks of that type)
- The main pipe rack

**Steps.**
1. Add parametric secondary detail to these builders:
   - Caged ladders and platforms with handrails on the column and flare stack
   - Stairs and platforms on the heater, burner rows, stack
   - Tank roof handrail, spiral stair, nozzles, manway
   - Pipe rack cross-members, cable trays, pipe shoes
2. Detail must be generated by code from existing parameters. No hand-modelled imports.
3. Two levels of detail, exposed as a detail group per rule 5 in section 1.2. Detail appears only in photoreal, or at close range in both looks if it helps the HUD. Engineering default stays simple.
3a. Extend `check:generators` to the new parts before the acceptance run.
4. Detail geometry is instanced or merged per Task 2 rules.
5. Update the generator self-check to cover the new parts: no geometry below grade, names valid, proportions sane.

**Acceptance.**
- At CAM-2, CAM-3 and CAM-5 the equipment reads as the real thing to an engineer. Mostafa judges, from an ENPPI engineer's eye.
- Budgets hold, including stress mode.
- Engineering regression at or below 0.5 percent at default detail level.
- Mostafa also records a verdict on CAM-1: does the wide view read as an operating plant, or do the plain types drag it down. That verdict decides 5b.

**Evidence.** Hand-back with before and after at hero cameras, CAM-1, three extra close-ups of your choosing, metrics.

**Out of scope.** New equipment types. Stage A delivered the library.

---

### Task 5b: Second-tier detail (gated)

**Gate.** Runs only if Mostafa's CAM-1 verdict at Task 5 says the wide view fails on plain equipment. Otherwise skipped and logged.

**Goal.** Bring the next tier of types up so the whole plant holds at reference level in the wide view.

**Steps.**
1. Mostafa names the types that read flat at CAM-1. Codex ranks them by count and screen coverage and proposes the tier.
2. Add builder detail per type at the same two levels as Task 5: nozzles, supports, platforms, ladders where the real equipment has them. Restraint applies. A pump does not need a stair.
3. Instanced or merged per Task 2. `check:generators` extended.
4. Stop when Mostafa's CAM-1 verdict passes or the budget is reached, whichever first. If the budget is reached first, report which types remain plain and move on.

**Acceptance.**
- CAM-1 verdict from Mostafa passes, or budget-limited stop documented.
- Budgets hold, including stress mode.
- Engineering regression at or below 0.5 percent at default detail level.

---

### Task 6: Post-processing and atmosphere

**Goal.** Finish the image. Then add the moments that sell: the flare burning, steam, and night.

**Scope.** Post stack, atmosphere effects, look presets.

**Steps.**
1. Tone mapping. Compare ACES and AgX at all cameras. Pick one. Record the choice and why.
2. Ambient occlusion (SSAO or GTAO, whichever the stack supports cheaply). Contact shadows under equipment must read.
3. Bloom with a high threshold. Only the flare, lamp heads and emissive markers should bloom.
4. Flare flame. An animated emissive flame at the flare tip, shader or sprite based. Subtle heat shimmer optional.
5. Steam plumes. Soft sprite particles from two or three vents or cooling points. Cheap.
6. Night variant. A third preset `photoreal-night` built on the same look system: night HDRI or dark sky, site lighting from lamp posts, flare as a key light, equipment floodlights. Exposed in the UI as a day/night toggle inside photoreal.
7. If any effect breaks the FPS budget, it gets a quality toggle that defaults off on the reference laptop.

**Acceptance.**
- Photoreal day and night at all cameras approved by Mostafa.
- Budgets hold for day. Night may run at or above 30 FPS.
- Engineering look untouched, regression at or below 0.5 percent.

**Evidence.** Hand-back with day and night at all cameras, a 10 second screen capture at CAM-5 showing the flare, metrics for both.

**Out of scope.** Baked lighting.

---

### Task 7: Baked lighting (gated)

**Gate.** This task runs only if reviewers decide Tasks 3 to 6 do not reach the target look. Otherwise it is skipped and logged.

**Goal.** Bake global illumination and soft shadows for static geometry in Blender Cycles and ship it as lightmaps.

**Scope.** Blender pipeline bake stage, runtime lightmap loading.

**Steps.**
1. Generate a second UV channel for lightmaps on static geometry.
2. Bake with Cycles under the chosen HDRI and sun. Denoise.
3. Pack lightmaps into atlases. KTX2 compress.
4. Runtime: apply lightmaps only in photoreal day.
5. Dynamic objects (selection highlights, flame, particles) stay real-time lit.
6. Bake must be one command and reproducible. Document time taken on the reference machine.

**Acceptance.**
- Visible improvement in bounce light and soft shadows at CAM-1 and CAM-4, approved by Mostafa.
- Budgets hold. Asset budget holds.

**Out of scope.** Night lightmaps.

---

### Task 8: HUD refinement and presentation

**Goal.** Sharpen the engineering look you already like, and make the demo present itself in both looks. This is roadmap Phase 3, light.

**Scope.** HUD styling, selection visuals, tours, attract mode.

**Steps.**
1. HUD polish in engineering: crisper selection outline, consistent cyan and amber palette, readable labels at distance, subtle scan-line or grid animation only if it stays calm.
2. Selection in photoreal: an outline or rim effect that reads over textures without breaking realism.
3. Data card: shared component, styled for both looks. Glass HUD panel in engineering, cleaner neutral panel in photoreal. Same data.
4. Build the tour system. Scenarios today support camera focus only. Add `camera_move` (from, to, duration, easing) and `caption` (text, duration) actions, a player that runs them, and a "Follow the process" tour along the crude path. Tours are presentation data (section 3 rule 2) and live in `tours.json` or the location Task 0 recorded, not in canonical plant data. If the existing scenario format lives inside canonical data, tours get their own file and the player reads both; canonical scenarios are not edited. Works in both looks. One tour can switch look mid-way as a reveal moment.
5. Idle attract mode: after 60 s idle, a slow orbit cycling through the five cameras and both looks. Any input exits.
6. New engineering baseline committed after approval.

**Acceptance.**
- Mostafa approves HUD feel and tour.
- Tour runs end to end in both looks without errors.
- Budgets hold.

**Evidence.** Hand-back with a screen recording of the tour and attract mode, all cameras both looks, metrics.

**Out of scope.** Kiosk offline packaging (roadmap Phase 3 full). Real estate domain.

---

### Task 9: Release

**Goal.** Ship to the live site and leave the repo ready for the next person.

**Steps.**
1. Production build. Confirm lazy loading: engineering first load within budget.
2. Merge `dual-look` into `main`. This is the first and only push to `main` in Stage B. Verify on the live URL in Chrome and Edge on the reference laptop and on one phone. Retire `/next/` or keep it for the next plan, reviewer's call.
3. On phone: photoreal may drop quality automatically (lower shadow map, no AO). Document the rule.
4. Update `README.md`: what the two looks are, how to switch, how to rebuild assets, how to run shots, metrics and visual checks.
5. Update `docs/REPO_FACTS.md` and `ASSETS.md`.
6. Final hand-back with live URL screenshots at all cameras, both looks.

**Acceptance.**
- Live site works in both looks.
- Every asset registered and CC0.
- All scripts documented and runnable by a fresh session from the README alone.

---

## 7. Risks and how to handle them

| Risk | Sign | Response |
|---|---|---|
| 4 GB VRAM ceiling | Photoreal stutters or crashes on switch | Drop texture resolution, reduce shadow map, disable AO by default. Report before cutting visuals. |
| Engineering look drifts | Regression above 0.5 percent | Stop. Find the leak. Look values are bleeding outside the preset. |
| Selection breaks after instancing or merging | Wrong card or no card | Fix the pick-to-asset mapping before continuing. Selection is the product. |
| Asset licensing ambiguity | Unclear license text | Do not use. Pick another CC0 asset. |
| Photoreal looks like a game, not a site | Oversaturated, too clean, too bloomy | Pull back. Desaturate, add restrained grime, lower bloom. Realism is restraint. |
| Scope creep into roadmap Phase 1 | New equipment types appear | Out of scope. Log it. |
| Blender version drift | Builds differ between machines | Pin Blender version in `REPO_FACTS.md`. Pipeline fails fast on mismatch. |

---

## 8. When to stop and ask

Stop and ask Mostafa or Claude when:

- A task requires editing canonical data
- A budget cannot be met without cutting a listed visual feature
- A needed asset is not available under CC0
- Repo facts contradict this plan in a way that changes a task
- A reviewer finding is unclear
- You are about to touch more than two files outside a task's declared scope

---

## 9. Definition of done for the whole plan

- Two looks, one scene, switchable from the existing UI and by URL
- Engineering look sharper than today and still recognisably the same HUD
- Photoreal look approved by Mostafa against the PetroMind benchmark
- Day and night photoreal
- Selection, cards, process paths, data layers, scenarios and the tour work in both looks
- Budgets hold on the reference laptop
- Every asset CC0 and registered
- Live on GitHub Pages
- A fresh session can rebuild everything from the README

---

## 10. Reference material

- `docs/plans/2026-09-14-roadmap.md` and the Phase 1 plan: the full refinery roadmap this plan runs beside
- `docs/reference/petromind-*.png`: benchmark screenshots, supplied by Mostafa before Stage B Task 3. Codex cannot open the live site; these files are the benchmark
- PetroMind Rig Explorer: rig.petromind.ai
- Poly Haven: polyhaven.com (HDRIs, textures, models, CC0)
- ambientCG: ambientcg.com (PBR materials, CC0)

---

## 11. Change log, v1.0 to v1.1

Decisions by Mostafa, 24 Sep 2026:
- Grow first. Roadmap Phase 1 runs as Stage A before this plan's Tasks 0 to 9.
- The existing photoreal study leaves the tab and is preserved as reference.
- Task-by-task gates hold. Work on `dual-look`, publish to `/next/`, merge to `main` at Task 9 only.
- Visual target is an Egyptian desert refinery. PetroMind's wide oblique view is the primary benchmark.

Corrections from Codex's repo review, 23 Sep 2026, all accepted:
- Geometry dropdown is GLB versus proxies, not a look control. Tabs carry the look.
- Engineering materials come from the GLB and are modified at runtime. Baseline and restore now cover both.
- No catalog, registry or generator check existed. Stage A supplies them.
- No tour system existed. Task 8 builds it.
- Task 1 no longer held to 5.4 budgets. Task 2 is.
- Section 1.2 rule now allows visibility and detail groups per look. Never a duplicate plant.
- Measurement protocol fixed: scripted orbit workload, pixel ratio 1, acceleration confirmed, counts labelled as counts.
- Capture protocol fixed: frozen time, paused animation, settled load, fixed flags.
- Canonical data protection now distinguishes canonical content (hash verified) from normalization output and generated folders.
- Release policy made explicit.

## 12. Change log, v1.1 to v1.2

Reconciliations from Codex, 24 Sep 2026, all accepted:
- Stage A has its own evidence rules (0.1): canonical data may change, tests are the gate, screenshots manual, no metrics, data frozen at close.
- Hand-back files named `stageA-task-NN.md` and `stageB-task-NN.md`.
- Presentation data (looks, cameras, tours, captions) is defined as separate from canonical plant data and is free to change in Stage B. Task 8 writes tours there, never into canonical scenarios.
- Task 5 acceptance is scoped to hero cameras, detail is per type not per asset, and a gated Task 5b extends detail to a second tier if the wide view fails. Reference-level look is judged at Task 6 on the whole image.
- Technology direction stated at the top: Blender, Three.js, React.
