# Stage A Task 03 hand-back: blocked before implementation

## Status

Blocked. No Task 03 implementation changes were made. The overnight instruction removes the Task 08 gate but explicitly retains ambiguity hard stops and requires this write-up before skipping to independent later tasks.

Starting commit: `b4c99fb524feb9c4d0fa3b50d997fab62ae1b843` on `codex/stage-a`.

## Ruling needed: existing flare proxy appearance

The Phase 1 plan (`docs/superpowers/plans/2026-09-14-phase-1-silhouette-library.md`, Task 3, line 609) says that all ten existing types must look identical in proxy mode. Its prescribed table maps `flare` to `stack` (line 650), but its new stack branch (line 691) draws only a shell and a foundation with radius `d / 2 + 1.5`.

The current `Proxy` in `app/src/Scene.tsx` sends flare through the vertical fallback: shell, foundation radius `d / 2 + 0.7`, and four platforms at quarter-height intervals. Implementing the prescribed stack branch would remove those platforms and increase foundation radius by 0.8 m. These are incompatible visual requirements.

Recommended ruling: preserve the current flare appearance in Task 03, and reserve the new stack geometry for standalone stacks. This recommendation is not implemented or treated as approved. The alternative is explicit approval of the simplified flare appearance in the prescribed code.

## Later-task dependency audit

- Task 04 adds tank families to `app/src/data/silhouettes.ts` and runs the Task 03 schema-parity test. It depends on the blocked task.
- Task 05 extends the same table and the growing canonical plant. It depends on Task 03 and earlier expansion work.
- Task 06 extends the same table with the stack family at issue and grows the plant further. It depends on Task 03.
- Task 07 extends the same table and proxy renderer, with cumulative plant verification. It depends on Task 03.
- Task 08 documents and verifies the completed 22-type, 57-asset, six-unit plant. It depends on Tasks 03–07.
- Stage B Task 0 must baseline and hash the plant at Stage A close. Stage A is not complete; measuring the existing 43-asset plant would not satisfy that requirement.

No later task can be completed independently under its acceptance criteria. Partial builders or draft completion documentation would not unblock their required runtime parity and final-plant verification, so no downstream implementation was started. The `dual-look` branch was not created.

## Files touched and canonical data

Only `docs/handbacks/stageA-task-03.md` is added by this blocker write-up. No canonical files, application code, generated models, dependencies, or plans changed.

Assets: 43 before / 43 after. Units: 4 before / 4 after.

## Verification and evidence

Read the Phase 1 Task 03 requirements, current proxy implementation, later-task dependencies, and Stage B baseline prerequisites. Confirmed branch and starting commit against the remote tracking ref. Tests and screenshots were not run: implementation stopped before changes, and this is a blocker hand-back, not a passing task hand-back. No runtime slowdown assessment was performed.

Internal implementation spec/code-quality reviews are pending because there is no implementation to review. No reviewer disagreement occurred.

## Budgets and next action

No Stage B measurements or proposed budget numbers exist for this run. Do not use the current smaller plant as the final baseline. Resolve the flare appearance ruling, resume Task 03, then follow the authorized overnight sequence through Stage B Task 0. Budget proposals remain subject to the combined morning review; Stage B Task 1 must wait.
