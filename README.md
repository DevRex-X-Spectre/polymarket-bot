# Polymarket Trading Bot

Research-first trading system for Polymarket. **Live trading is disabled.**

Do not trade because an opportunity looks profitable. Trade only when expected net edge has been demonstrated to be executable and the trade passes risk and execution checks.

Documentation in `/docs` is the source of truth. Project status lives in `/docs/project-state`.

## Current phase

Repository foundation, configuration isolation, Gamma discovery, and resolution metadata extraction. No CLOB/WebSocket adapters, no order submission, no live wallet handling.

Operating modes:

| Mode | Meaning |
| --- | --- |
| `research` | Default. No live orders. |
| `paper` | Simulated execution (not implemented yet). No live orders. |
| `live` | Requires explicit flags **and** human authorization. The current build still refuses to start. |

## Requirements

- Node.js `>= 24`
- pnpm `>= 10`
- Python `3.12` for research (`>= 3.11, < 3.14`)

## Setup

```bash
pnpm install
pnpm test
pnpm build
pnpm start
```

Research environment (PowerShell):

```powershell
.\scripts\bootstrap-research.ps1
.\scripts\test-research.ps1
```

Copy `.env.example` to `.env` if you need local overrides. Never commit `.env` or private keys.

## Layout

```text
apps/trader              TypeScript process (research/paper shell)
packages/shared          Modes, logging, redaction, safety flags
packages/config          Fail-closed environment configuration
packages/market-models   Internal market/event identity and resolution metadata
packages/polymarket      Official public Gamma client (no orders)
vendor/polymarket-agent-skills  Unmodified official Polymarket agent-skills snapshot
research/            Isolated Python research package
data/                Research datasets (not committed)
scripts/             Operator helpers
tests/               Cross-package contract tests
docs/                Architecture and project state
```

Logical engines in `docs/03-technical-stack.md` are modules, not independently deployed services.

## Safety

- Default mode is `research`.
- Invalid configuration fails closed.
- Loggers redact credential-like keys.
- CI runs without live credentials.
- Research Python refuses live configuration.

## Next implementation

See `docs/project-state/TODO.md`. The next work is market-family validation (TODO-011).
