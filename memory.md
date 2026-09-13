# Memory — Repository Foundation (Phase 0–1)

Last updated: 2026-09-13

## What was built

- pnpm workspace: `apps/trader`, `packages/shared`, `packages/config`
- Isolated Python research package in `research/` (Python 3.12, pytest, pandas/numpy/pyarrow/duckdb)
- Fail-closed config: `POLYMARKET_BOT_MODE` defaults to `research`
- Live trading cannot start; no order-submission code; research runtime refuses live
- Secret redaction in logs; `.env.example`; `.gitignore` excludes secrets and datasets
- Vitest (24 tests) + pytest (8 tests) + GitHub Actions CI
- Git initialized locally (no remote, no commit yet)
- Restored `docs/project-state/CURRENT-STATE.md` (it had been empty; the body lived in CHANGELOG.md)

## Decisions made

- D-061: Workspace monorepo, not microservices
- D-062: Vitest + pytest
- D-063: Fail-closed env config; live requires explicit flags and still cannot submit orders
- Python research targets 3.12 (`requires-python = ">=3.11,<3.14"`), not the machine default 3.14.5
- pnpm 10.17.1 installed via npm (corepack enable failed with EPERM on Program Files)
- Official Polymarket SDK is **not** added yet (belongs to TODO-008+)

## Problems solved

- `CURRENT-STATE.md` was empty; `CHANGELOG.md` contained the current-state document. Copied then replaced changelog.
- pnpm 10 ignores dependency build scripts by default; esbuild must be allowed (`onlyBuiltDependencies` + `pnpm rebuild esbuild`)
- CamelCase keys such as `privateKey` need normalization before secret redaction

## Current state

- Phase 0 (TODO-001–004) and Phase 1 (TODO-005–007) are implemented and tested
- `pnpm test` 24 passed; research pytest 8 passed; `pnpm build` and `pnpm start` succeed in research mode
- Live trading is not active and not implemented
- No Gamma/CLOB/WebSocket adapters yet

## Next session starts with

TODO-008: Gamma market discovery.

Before coding: read `docs/polymarket/10-polymarket-integration.md`, `docs/polymarket/11-market-data-and-streaming.md`, official Polymarket TypeScript SDK / Gamma docs, and any Polymarket agent skills. Do not invent endpoints. Do not add order submission.

## Open questions

- Official Polymarket agent skill files (`SKILL.md`, `market-data.md`, …) are not in this repo; next session must locate or fetch them
- No GitHub remote yet
- Wallet / API credentials are not configured (correct for this phase)
