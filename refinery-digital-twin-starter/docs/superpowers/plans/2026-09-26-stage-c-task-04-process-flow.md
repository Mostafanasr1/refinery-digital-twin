# Stage C Task 3 closing corrections and Task 4 — user rulings

Task 3 approved by both reviewers. Visual verdict: plant detail and night lighting approved; terrain acceptable for now, far hills and slope tiling deferred.

## Task 3 corrections

1. Show plant dressing in engineering too: flat grey, non-selectable, same Dressing switch. Rocks, scrub and landscape objects remain photoreal only; engineering grid floor remains the ground. Intentional engineering baseline change: capture a candidate; do not overwrite the approved baseline. Produce a per-look visibility diff of all 57 canonical assets and confirm none differs.
2. Correct moving vehicles' backwards-facing forward axis.

## Task 4 — process flow, both looks

Replace airborne dotted arcs. Route each path segment along the centreline of connecting pipe geometry where it exists; arc only across gaps. Thin emissive tube with scrolling gradient shader instead of dots. Subtle emissive tint on pipe segments of the active path. Captions and step timing unchanged. Instance everything. Night draw calls <=200; inherited budgets and canonical freeze continue.

Evidence: CAM-2 and CAM-6 in both looks with active path; 60 fps review clip of one full tour under the approved capture rule; metrics. Internal spec/code-quality reviews and hand-back. Push dual-look, publish /next/ only, root main unchanged.

## Combined gate ruling

Continue from the Task 3 corrections into Task 4. Submit both at the Task 4 gate. Keep Task 3 correction engineering candidate separate from Task 4 candidate, so either may be approved or returned independently. Approved baseline remains unchanged pending explicit approval. No next task starts past this gate.
