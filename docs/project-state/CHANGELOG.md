# Polymarket Trading Bot

## Changelog

**Document:** `docs/project-state/CHANGELOG.md`
**Status:** Active
**Document Type:** Historical Change Record
**Last Updated:** 2026-09-13 (TODO-013 market WebSocket adapter)

This file records meaningful historical changes. Current operational state belongs in `CURRENT-STATE.md`.

---

## 2026-09-13 — Read-only market WebSocket adapter

### Added

- `createMarketWebSocketAdapter()` and `parseMarketStreamMessage()` in `packages/polymarket/src/websocket.ts`.
- Normalized models for all 7 supported market events (`book`, `price_change`, `last_trade_price`, `tick_size_change`, `best_bid_ask`, `new_market`, `market_resolved`).
- Typed handling for `MarketUnknownEvent` and `MarketMalformedEvent`.
- 10-second `PING` heartbeat keep-alive with automatic `PONG` absorption.
- Dynamic subscription and unsubscription support via `subscribe()` and `unsubscribe()`.
- Focused mock test suite (`packages/polymarket/tests/websocket.test.ts`) covering all events, dynamic subscription, malformed events, connection errors, heartbeat, and disconnect handling.

### Verified sources

- Official agent-skills snapshot: `vendor/polymarket-agent-skills/SKILL.md` (Core Pattern: WebSocket Subscribe), `vendor/polymarket-agent-skills/market-data.md` (CLOB Orderbook & Key Market Fields), `vendor/polymarket-agent-skills/websocket.md` (Market channel endpoint, subscription format, dynamic subscribe/unsubscribe, event types, heartbeat).
- Public market endpoint: `wss://ws-subscriptions-clob.polymarket.com/ws/market`.
- Event schemas: `book`, `price_change` (including level removal with `size: "0"`), `last_trade_price`, `tick_size_change`, `best_bid_ask`, `new_market`, `market_resolved`.

### Safety

- Strictly read-only: no order submission, cancellation, or trading execution.
- No wallet signing, private-key handling, or `SecureClient` construction.
- Canonical market identities are preserved without mutation.

---

## 2026-09-13 — Read-only CLOB REST adapter

### Added

- `createClobMarketData()` in `packages/polymarket` for public CLOB order books, midpoint, spread, and book-provided dynamic parameters.
- Typed normalization for order-book levels and dynamic parameters, with `MarketDataError` at the external boundary.
- Mock-only tests covering multiple and empty books, malformed levels, wrong tokens, API failures, unknown optional prices, and identity preservation.

### Verified sources

- Official agent-skills snapshot: `SKILL.md` (Core Pattern: Read Orderbook) and `market-data.md` (CLOB Orderbook, Prices, Midpoint, Spread, Key Market Fields).
- Official `Polymarket/ts-sdk` `@polymarket/client` public-client API: [`clients.ts`](https://github.com/Polymarket/ts-sdk/blob/main/packages/client/src/clients.ts), [`actions/clob.ts`](https://github.com/Polymarket/ts-sdk/blob/main/packages/client/src/actions/clob.ts), and [`markets.ts` example](https://github.com/Polymarket/ts-sdk/blob/main/examples/scripts/src/lib/markets.ts). Verified public methods: `fetchOrderBook`, `fetchMidpoint`, and `fetchSpread`. The installed public-client type does not expose standalone tick-size or negative-risk methods, so those values are read only from the order-book response.

### Safety

- The adapter constructs only the existing public client and exposes no authenticated or mutating operation.
- No `SecureClient`, order submission, wallet handling, or WebSocket capability was added.

---

## 2026-09-13 — Market-family validation

### Added

- `validateMarketFamily()` and typed market-family candidates in `packages/market-models`.
- Per-field comparison for contract relationship, event identity, authoritative underlying/reference asset facts, resolution mechanism/source/rule/end timestamp, and YES/NO labels.
- Focused tests for compatible contracts, event/resolution/timestamp/outcome mismatches, unknown resolution data, misleading similar titles, and identity preservation.

### Safety

- Results are three-state: `compatible`, `incompatible`, or `unknown`.
- Unknown data is not compatible data.
- Titles, slugs, categories, and ticker-like text are never validation evidence.
- Gamma's absent reference asset remains unknown until an approved authoritative source enriches it.
- No CLOB, order, wallet, or live-trading capability was added.

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
