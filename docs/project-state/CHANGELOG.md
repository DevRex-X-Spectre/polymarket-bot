# Polymarket Trading Bot

## Changelog

**Document:** `docs/project-state/CHANGELOG.md`
**Status:** Active
**Document Type:** Historical Change Record
**Last Updated:** 2026-09-13

This file records meaningful historical changes. Current operational state belongs in `CURRENT-STATE.md`.

---

## 2026-09-13 — Resolution metadata extraction

### Added

- Official Polymarket agent-skills snapshot (`Polymarket/agent-skills@91ee44ae113e958affd20cd505c6e9d9d6100e0b`) under `vendor/polymarket-agent-skills/` and `.grok/skills/web3-polymarket/`.
- `extractMarketResolution()` in `packages/market-models`.
- Discovery records now include auditable resolution metadata (stated source, rule text, evidence paths, completeness).

### Safety

- Title/slug are not used as a resolution source.
- Conflicting market/event sources remain unknown.
- Gamma `closed` is not mapped to resolved.
- Resolution validation does not imply tradability.
- No `SecureClient` or order APIs.

---

## 2026-09-13 — Gamma market discovery

### Added

- `packages/market-models`: internal market/event identity, Gamma lifecycle status, discovery records.
- `packages/polymarket`: official `@polymarket/client` public-client adapter for Gamma discovery (`listMarkets`, `listEvents`, `fetchMarket`, `fetchEvent`, `search`, `listTags`, `fetchTag`).
- Opt-in live Gamma HTTP test (`POLYMARKET_BOT_LIVE_NETWORK_TESTS=true`).

### Safety

- No `SecureClient` construction.
- No order-submission APIs.
- Discovery does not mark markets tradable.
- Missing identifiers remain null/unknown.

---

## 2026-09-13 — Repository foundation

### Added

- pnpm workspace monorepo with `apps/trader`, `packages/shared`, `packages/config`.
- Isolated Python research package under `research/` (Python 3.12, pytest).
- Fail-closed configuration for `research` / `paper` / `live`.
- Secret redaction in structured logs and `.env.example` / `.gitignore` hygiene.
- Vitest unit and contract tests; GitHub Actions CI without live credentials.
- Dataset directory placeholders under `data/`.

### Safety

- Live order submission is not implemented.
- Trader process refuses to start in live mode.
- Research runtime refuses live configuration.
- Default operating mode is `research`.

### Documentation

- Restored `CURRENT-STATE.md` (its content had been stored in this changelog file).
- This changelog replaced the mislabeled current-state document.
