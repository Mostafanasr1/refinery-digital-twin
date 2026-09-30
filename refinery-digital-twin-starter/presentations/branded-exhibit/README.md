# [Client] branded exhibit

Nine browser slides for an industrial vendor's marketing or technical-sales lead. Self-contained HTML/CSS/JS, one existing release still, and a Python standard-library launcher. No root dependencies, application source, data, pipeline, Blender or deployment configuration changes.

## Local launch

Working directory: repository root (`refinery-digital-twin`). Python 3.10+ is required. Run this one command:

```sh
python3 refinery-digital-twin-starter/presentations/branded-exhibit/launch.py
```

It binds only `127.0.0.1:8765`, prints the URL and requests opening the default browser. On a headless host, use the printed URL in its browser. Stop with Ctrl+C. This exact command was exercised in the executor; browser navigation to its URL was verified separately.

## Presenting

Use arrows, PageUp/PageDown, Home/End or the footer buttons. The hash identifies slides 1–9. Small screens scroll vertically; content is not clipped. Slide 4 starts with the repository still. Load checks the launcher, then requests the live release root with `look=engineering&flow=pipes&measure=1&animate=1`. Select process paths and start tours in the existing demo UI; they are not URL parameters.

Once readiness is confirmed, Enter demo enables focus and pointer interaction. Escape or Leave demo returns to the deck. Tab and Shift+Tab cross iframe boundaries. Leaving slide 4 unloads the iframe. Reduced-motion preference keeps the still instead of loading animation; a separately labelled live link remains available.

## Rendering and fallback contract

The launcher is a fixed GET-only HTTPS pass-through of `https://mostafanasr1.github.io/refinery-digital-twin/` under `/live/`. It does not vendor, rewrite or alter app bytes. Relative Vite assets retain the trailing-slash base. It denies traversal, `/next/`, arbitrary hosts and all redirects, sends no client cookies/authorization upstream, drops Set-Cookie, and preserves CSP, X-Frame-Options and other upstream protections. Local static serving is allowlisted to the deck files; tests, notes and evidence are not served. Host validation also limits DNS rebinding.

The still stays visible while the app downloads/draws. The parent inspects the existing `__refineryLoading.snapshot()` measurement hook and requires `phase=done`, finite `drawn`/`finished` values and a canvas. An iframe load event is never considered successful rendering. A 45-second readiness deadline, loading error, runtime error, offline event, inaccessible frame or WebGL context-loss event restores the still. Readiness remains polled after the initial draw; no continuous-rendering/performance guarantee is claimed. GPU hangs that emit no event cannot be reliably detected. Full reload is used for retry.

Static hosting has no same-origin inspection of the remote app and deliberately keeps the still. Use the loopback launcher for the instrumented embed, or open the live link separately. This is not an offline application package: the deck and still work locally, but interactive content requires the live upstream. No public deployment is part of this change.

## Content and provenance

Baseline main: `7cf6bb63b9ac2d5cc7bf22747893c4f3d343ac94`. Content is grounded in current repository evidence and the user's supplied commercialization conclusions. Library ID `libfile_2693943f8f388191b5c362366ff9bbd0` resolved, but supported materialization failed at the byte transfer in this executor. No readable DOCX was obtained or claimed reviewed.

The offer is a proposed browser-first branded exhibit. Current demo claims are clearly synthetic; customization, offline kiosk packaging and real-data onboarding are future scopes. Price is `[To be agreed]`, brand is `[Client]`. No event date, internal costing or outdated project context appears in the deck.

`assets/engineering.png` is byte-identical to `docs/handbacks/evidence/stageC-task-04-correction/CAM-6-engineering-pipes.png`, 1600×900, SHA-256 `6f6b68b23c886eb117a66efa8d202b8ee8e78145252d53c1760c1046df75e2db`. It is a repository release-review capture, not newly generated or published app media. The opening slide crops/fades it in CSS; slide 4 displays the whole image. No customer/mood art or video was copied.

Slide 9 credits the four CC BY 4.0 models with their creators, original source URLs, license and modifications, verified against the current `ASSETS.md` runtime-derivative/correction entries (the opening historical all-CC0 language is obsolete). Sources: Strifey7 container, ezbreneman tanker, elkarimeldino Hilux, ROGUE/ROGUEENGINEER cabins. It also acknowledges original project geometry, CC0 Poly Haven environment/materials/rocks and modified NASA/NGA/USGS SRTM via OpenTopography. See `../../ASSETS.md` for the complete source and derivative register. Credits do not imply creator endorsement.

## Verification

`test_launcher.py` is a standard-library unittest suite; `verify.cjs` uses an already installed Playwright and Chromium, without modifying any dependency manifests. Tests and screenshots are scoped to this directory. `evidence/checks.json` records the browser assertions; PNGs capture all desktop slides plus mobile and unavailable-live states. Browser fixture readiness/failure cases are expressly not a rendered live refinery.

Executor results and remaining acceptance work are in `../../docs/handbacks/branded-exhibit-presentation.md`. Before presenting to a buyer, verify real live rendering through this launcher on the intended network and hardware, then approve branding, story, device/browser scope and price. The current executor blocks the live host with HTTP CONNECT 403, so live asset resolution and successful GPU rendering remain unverified here.
