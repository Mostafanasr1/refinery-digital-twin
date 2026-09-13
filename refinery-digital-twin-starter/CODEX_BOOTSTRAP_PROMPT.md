# CODEX BOOTSTRAP INSTRUCTION

Read, in order:
1. `AGENTS.md`
2. `MASTER_PROMPT.md`
3. all files in `docs/`

Then execute **Phase 0 only** from `docs/CODEX_TASK_SEQUENCE.md`.

Do not proceed to Phase 1 until Phase 0 is complete and the repository passes its own checks.

For Phase 0:
- initialize the frontend
- establish the Python pipeline environment
- add JSON schema validation
- add lint/test/build commands
- add a normalized-data loader interface
- do not build refined visuals
- do not hardcode refinery assets into UI components

At the end:
1. summarize files created/changed,
2. list commands to run,
3. report tests/build status,
4. identify any architectural decisions that differ from the specs and why.
