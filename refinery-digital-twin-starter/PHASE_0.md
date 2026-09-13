# Phase 0 foundation

Scope: TypeScript/Vite/React/Three.js/React Three Fiber setup, Python environment,
existing-schema validation, lint/test/build commands, and a normalized loader boundary.
No Phase 1+ work is implemented. Original source data and schemas are preserved.

## Run (PowerShell, from this directory)

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.lock
.venv/Scripts/python.exe -m pip install --no-deps -e .
npm.cmd ci
npm.cmd run check
npm.cmd run dev
```

Individual commands: `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run validate`,
`npm.cmd run build`. The local development URL is printed by Vite.
Build output: `app/dist`. Serve it over local HTTP, not file://.

## Files and boundaries

- `app/`: frontend package/configuration, empty R3F canvas, loading/error status,
  normalized JSON loader interface and tests. No equipment definitions in components.
- `pipeline/validate.py`: CLI validates arrays against the five supplied Draft 2020-12 schemas.
- `tests/test_validation.py`: valid data, invalid records, wrong collection shape,
  missing files, and malformed JSON coverage.
- `data/normalized/*.json`: deliberately empty canonical collections for bootstrap.
- Root npm scripts, `pyproject.toml`, dependency locks, and `.gitignore`: development tooling.

The runtime receives only `data/normalized`, served/copied by Vite. It never imports
`data/synthetic`. Normalized files are separate from raw sources; no adapter or fake
normalization is added in Phase 0. The loader validates at the runtime boundary using
those same supplied schemas and exposes an interface replaceable by an API adapter.

## Decisions and limits

No architectural deviation from the requested stack. Optional Drei and a global state
store are deferred until interaction needs them. React is constrained to 19.2 because
the installed R3F peer range excludes React 19.3. Root Python commands use a portable Node launcher to select the local venv interpreter.
Vite/Vitest overrides prevent npm from selecting incompatible optional test-tool peers.

The existing schemas are intentionally unchanged. Reference integrity, richer entity
contracts, model bindings, and scenario semantics belong to subsequent phases; schema
validation alone does not claim those checks. The empty scene and zero assets are
intentional. No refined visuals, geometry, scenario engine, or normalization adapters.

## Verified status

`npm run check` passed: ESLint/Ruff, 4 frontend tests, 6 Python tests, validation
of all supplied source and empty normalized collections, TypeScript, and production build.
Browser smoke check: title and normalized-ready status render, screenshot inspected,
no browser errors reported. Evidence: `phase-0-browser.png`.
`npm install` audit reports zero vulnerabilities. Vite warns that the initial JS chunk
is 1.20 MB (337 KB gzip); optimization is deferred to the planned performance phase.
The Codex sandbox blocked esbuild parent-directory resolution; checks succeeded with
approved execution outside that sandbox. Phase 1 has not started.
