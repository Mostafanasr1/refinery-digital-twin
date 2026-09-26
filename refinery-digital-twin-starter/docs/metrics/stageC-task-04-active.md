# Stage C Task 4 active process paths

All fixed-camera cases use the approved uncapped protocol, 3-second warmup and 10-second sample. Display/power state and raw samples are in the JSON. No offline video clock is used here.

| Look | Camera | Path | Median ms | p95 ms | Max calls | Result |
|---|---|---|---:|---:|---:|---|
| engineering | CAM-2 | path_crude_to_products | 1.50 | 4.70 | 70 | PASS |
| engineering | CAM-6 | path_crude_to_products | 1.60 | 3.50 | 70 | PASS |
| photoreal | CAM-2 | path_crude_to_products | 2.60 | 5.50 | 159 | PASS |
| photoreal | CAM-6 | path_crude_to_products | 2.70 | 5.10 | 164 | PASS |
| photoreal-night | CAM-2 | path_crude_to_products | 3.80 | 7.00 | 191 | PASS |
| photoreal-night | CAM-2 | path_overhead | 3.80 | 7.00 | 191 | PASS |
| photoreal-night | CAM-2 | path_standby | 4.10 | 11.30 | 191 | PASS |
| photoreal-night | CAM-6 | path_crude_to_products | 3.80 | 6.50 | 196 | PASS |
| photoreal-night | CAM-6 | path_overhead | 4.10 | 6.70 | 196 | PASS |
| photoreal-night | CAM-6 | path_standby | 3.80 | 6.50 | 196 | PASS |

Lazy assets: 42,333,254 bytes, unchanged from Task 3.
