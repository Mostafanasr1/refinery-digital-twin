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
