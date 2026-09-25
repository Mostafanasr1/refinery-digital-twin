# Stage B Task 09 — release preflight

25 September 2026. Branch dual-look. Release not yet merged or deployed.

## Completed

Task 8 approval recorded. All 12 approved engineering candidate PNGs from commit 952d004 promoted byte-for-byte, with approval provenance. CAM-6 now participates in regression; cameras, hardware protocol and 0.5 percent threshold unchanged. Historical candidate files untouched. Review-video ruling recorded in REPO_FACTS: 60 fps frame capture + ffmpeg CRF 18, or high-fixed-bitrate canvas MediaRecorder; Playwright recordings only for interaction assertions from Task 9 onward.

## Decisions required before continuing

The main workflow publishes only the root and would remove /next/. The plan leaves retention/removal to reviewers, and no ruling is recorded. Recommend retain /next/ for continuity until its future use is decided.

Physical-phone acceptance requires a real device. Chrome and Edge are installed locally, but no phone connector or available ADB installation was found. A desktop mobile viewport is not a substitute. Recommend Mostafa perform the physical-phone check using a short checklist after deployment, supplying phone model/browser and observed results; the Task 9 gate remains incomplete until that evidence is recorded.

Paused before merge/deployment pending these decisions. Main and Stage C untouched. No release jobs started.

Verification: all seven visual-tool tests pass; canonical data unchanged (32 files). PNG copy hashes match the approved candidate. A fresh rendering regression run is still pending; no unrun release checks are claimed as passes.
