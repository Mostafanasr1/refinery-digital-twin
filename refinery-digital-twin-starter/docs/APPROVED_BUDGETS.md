# Approved rendering budgets

Mostafa's ruling after Stage A Task 08 approval and Stage B Task 0 deployment approval supersedes the provisional table in plan v1.2 and Task 0's proposals. These are final review limits, applied from **Stage B Task 2**. Task 1 must preserve engineering appearance and avoid material performance regression against Task 0, but is not gated on these numbers.

| Metric | Engineering | Photoreal |
|---|---:|---:|
| Median FPS, reference RTX 3050 laptop | ≥60 | ≥40 |
| Frame time p95 | ≤20 ms | ≤33 ms |
| Mean draw calls | ≤150 | ≤200 |
| Initial download | ≤baseline + 1 MB | n/a |
| Lazy photoreal assets | n/a | ≤40 MB |
| Stress workload, 500 assets | ≥40 FPS | n/a |

Use the approved Task 0 capture/active-orbit protocol. The initial-download baseline is 12,200,115 bytes; interpreting MB as decimal gives a maximum of **13,200,115 bytes**. Lazy asset maximum is **40,000,000 bytes**. Source measurements are in `docs/metrics/baseline.json`; they are not overwritten by later runs.

Stage B Task 1 remains an external review gate. Stop after its hand-back and push; do not start Task 2 until both reviewers approve.

## Measurement validity ruling, 24 September 2026

Record the active display refresh rate, AC state, power plan and active monitor topology for every run. The approved setup is AC connected, Performance plan, laptop display only. A median within 2% of refresh is INVALID rather than a budget failure when the prior comparable run was well above that refresh; the tool defines well above as more than 10%. Invalid measurements have no budget verdict and exit with code 2. Genuine budget failures retain exit code 1 and the thresholds above remain unchanged. Task 2 is the prior comparable workload reference. The historical 59.9 FPS cluster is classified by the user as display-capped; its original measurements remain preserved.

Mostafa explicitly approved the more-than-10% definition and authorized the Task 3 rerun on 24 September 2026 after disconnecting the external monitor. The pre-resume inspection confirmed one internal 1920 x 1080 display at 144 Hz, AC connected and the Performance power plan. Each workload run must still record and validate its own setup; this approval does not waive any budget.


## Superseding display protocol — 24 September 2026

The user replaced the laptop-only/refresh-cap rules with an uncapped metrics protocol, confirmed by the two-look 500-asset p95 comparison recorded in `REPO_FACTS.md`. Metrics add `--disable-gpu-vsync` and `--disable-frame-rate-limit`; screenshots retain their existing flags. Record display count, resolutions, refresh rates, primary status and power every run. External monitors are permitted; AC and Performance plan remain required. Legacy refresh-cap classification remains only for historical capped measurements.

Frame-time milliseconds are primary. Median budgets are 1000/60 ms (approximately 16.7 ms) for normal engineering and 25 ms for photoreal and 500-asset engineering; derived FPS = 1000 / median ms. Existing p95 ceilings of 20/33 ms, draw-call and download budgets remain unchanged. Protocol agreement was max(1 ms, 10% of laptop p95), and both looks passed. This tolerance is not a relaxation of application budgets.
