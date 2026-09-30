# Branded exhibit buyer presentation

## Implementation

Nine slides for Route 1, an industrial vendor's branded exhibit buyer. Engineering HUD styling, [Client] branding placeholder and [To be agreed] pricing. Current synthetic demo capabilities are separated from proposed branding/narrative, device/review/acceptance and commercial scope. Scripted pump-trip is explicitly not simulation; no operational accuracy, predictive-maintenance, safety qualification or live-data promises. No event date or historical project context.

Self-contained `presentations/branded-exhibit/`: HTML, CSS, JavaScript, one unmodified release still, Python standard-library loopback launcher, scoped test scripts, README and browser evidence. Slides have keyboard navigation, progress, focus management and reduced-motion behavior. Model credits include actual CC BY 4.0 creators/source links/license/modifications, plus Poly Haven and adapted SRTM acknowledgment.

The launcher serves fixed live release content under a same-origin trailing-slash path, without rewriting bytes or removing upstream security policies. It never requests /next/, binds only loopback, rejects traversal/arbitrary hosts/redirects, and forwards no client credentials. Still remains until the existing measurement hook confirms draw completion. Loading/error/45-second-timeout/offline/context-loss handling returns to the still. Iframe interaction is explicit with Escape and Tab exits. Static hosts keep the still because remote render readiness cannot be established.

## Evidence and verification

- Main verified against remote: `7cf6bb63b9ac2d5cc7bf22747893c4f3d343ac94`. Clean initial worktree; no existing local/remote authorized branch and no existing PR found through the connected GitHub app before writes. Created only `kazem/presentation`.
- Five Python launcher tests PASS: path/host denial, read-only/static routes, fixed upstream and unchanged bytes, preserved security headers/no credentials, redirect denial, upstream failure response.
- Chromium headless browser checks PASS: nine slides, arrows/PageUp/PageDown/Home/End and bounds, content/placeholders/credits, responsive portrait 390×844 and landscape 844×390, reduced motion, static fallback, supported URL parameters, iframe load alone not readiness, draw readiness, Escape and both Tab boundaries, loading error, post-ready runtime error/context-loss event, timeout, offline event and unload on slide exit. Fixture results explicitly test the parent's contract, not actual refinery rendering.
- Actual live-host request from executor: FAILED, HTTP CONNECT 403 from environment network proxy; launcher returns 502. Actual browser attempt retained the still and timed out honestly after 45 seconds. Successful live scene, published asset paths and actual GPU context loss remain NOT VERIFIED.
- Agent-browser verification: deck loads; meaningful interactive snapshot; screenshot captured; no page errors. Playwright also reports no presentation JavaScript errors. Initial tooling/socket issues were resolved using a writable runtime directory and Chromium container flags.
- Screenshots in `../../presentations/branded-exhibit/evidence/`: all desktop slides, mobile credits/opening and blocked-live fallback. Final images were visually inspected. A caught slide-height issue was fixed before final verification. Desktop target 1600×900 fits without scrolling; mobile uses natural vertical scrolling.
- No physical mobile, reference RTX3050, hardware performance, Safari or Edge tests ran. No changed application tests were needed; application source was untouched. This is not a claim of complete live-embed acceptance.
- Still metadata/pixels inspected; byte-identical SHA-256 and provenance are recorded in the presentation README. CC BY credits checked against the later runtime entries in ASSETS.md, not its historical all-CC0 opening.
- Library reference resolved through the supported flow but byte materialization failed. No readable commercialization DOCX was obtained. Used the user-authorized report conclusions and repository evidence instead.

## Local launch

Working directory: repository root (`refinery-digital-twin`). Tested command:

```sh
python3 refinery-digital-twin-starter/presentations/branded-exhibit/launch.py
```

Prints `http://127.0.0.1:8765/` and requests opening the default browser. The headless executor verified this URL through Chromium. Python 3.10+; stop with Ctrl+C.

## Limits and next work

Successful live render and asset loading through the fixed proxy must be verified on a network that can reach the Pages host, on the agreed buyer device/browser. Preserve upstream security headers; if policy prevents framing, retain the still. The measurement hook is an existing internal diagnostic interface, so a future upstream release could change it; absence fails closed. Initial readiness is not a continuous-liveness guarantee. Eventless GPU hangs remain outside this detector. Reduced-motion mode intentionally does not start the animated demo.

The local deck and still are available without upstream access; this is not shipped offline kiosk support. Client scope, brand permissions, narrative, review rounds, device/browser matrix, acceptance and commercial terms need agreement. No public presentation deployment, workflow trigger, main/dual-look push or merge is authorized or performed.

## Files and release state

Only `presentations/branded-exhibit/` and this note are in scope. Protected source/data/pipeline/Blender paths, root manifests and Pages workflow remain unchanged. The sole existing workflow only triggers for main/dual-look pushes or manual dispatch; this branch does not add CI/deployment configuration. Final commit/PR and remote status are reported in the delivery message.
