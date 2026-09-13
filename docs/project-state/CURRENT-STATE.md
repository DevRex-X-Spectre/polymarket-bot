# Polymarket Trading Bot

## Current Project State

**Document:** `docs/project-state/CURRENT-STATE.md`
**Status:** Active
**Document Type:** Project State Record
**Last Updated:** 2026-09-13 (TODO-013 market WebSocket adapter implemented)

---

# 1. Purpose

This document records the current known state of the Polymarket trading bot.

It is intended to answer:

> **What is true about the project right now?**

This document is operational state, not a permanent design specification.

Historical decisions belong in:

```text
docs/project-state/DECISIONS.md
```

Remaining work belongs in:

```text
docs/project-state/TODO.md
```

Historical changes belong in:

```text
docs/project-state/CHANGELOG.md
```

---

# 2. Current Project Phase

The project is currently in the:

```text
RESEARCH / FOUNDATION IMPLEMENTATION
```

phase.

Documentation remains complete. Phase 0–1, Gamma discovery (TODO-008), market identity (TODO-009), resolution metadata extraction (TODO-010), market-family validation (TODO-011), the read-only CLOB REST adapter (TODO-012), and the read-only market WebSocket adapter (TODO-013) are implemented in code.

The project has not yet been approved for unrestricted live trading.

The current priority is snapshot + stream recovery (TODO-014). Live trading remains unimplemented.

---

# 3. Current Operating Mode

The intended runtime modes are:

```text
RESEARCH
PAPER
LIVE
```

The default development posture is:

```text
RESEARCH
```

Live trading remains explicitly disabled unless the required validation and human authorization have been completed.

---

# 4. Project Objective

The project objective is to build a research-driven Polymarket trading system capable of:

* Discovering market opportunities
* Collecting high-quality market data
* Researching potential alpha
* Measuring executable edge
* Simulating realistic execution
* Applying independent risk controls
* Executing trades when explicitly authorized
* Maintaining accurate portfolio and PnL state
* Measuring strategy health
* Attributing performance to sources of edge

The system is not being built on the assumption that profitability is guaranteed.

---

# 5. Initial Trading Scope

The initial research focus includes four primary alpha areas:

```text
1. BTC Microstructure
2. Whale Intelligence
3. Market Dislocation
4. Information / Regime
```

These are research areas.

They are not automatically approved profitable strategies.

---

# 6. Highest-Priority Research Area

The strongest initial research hypothesis is:

```text
BTC 5-minute market microstructure / lead-lag
```

The research should investigate relationships between:

* External BTC price feeds
* The actual resolution source used by the Polymarket market
* Polymarket prices
* Orderbook state
* Time to resolution
* Volatility
* Liquidity
* Execution conditions

No fixed lead time or fixed profitability assumption has been approved.

---

# 7. BTC Resolution Rule

BTC short-duration markets must be evaluated according to their actual resolution rules.

The system must not assume that:

```text
Binance
```

is the resolution source merely because Binance is used as an external market-data source.

The actual market resolution mechanism must be identified from the market specification.

---

# 8. Current BTC Research Hypothesis

The current hypothesis is that external BTC market movement may contain useful short-term information before the corresponding Polymarket market fully reflects that information.

This remains a hypothesis.

It must be tested against historical data and realistic execution conditions.

---

# 9. Candidate BTC Research Windows

The current research plan includes testing candidate windows such as:

```text
180–60 seconds
60–20 seconds
20–5 seconds
```

These are experimental buckets.

They are not permanent strategy parameters.

---

# 10. External BTC Data

The architecture allows external BTC market data to be used as an input.

The exact feed and implementation must remain consistent with the approved technical architecture and research requirements.

External data must preserve event timestamps separately from:

* Receipt time
* Processing time
* Decision time

---

# 11. Polymarket Integration Status

The project is designed around the current Polymarket CLOB V2 architecture.

Production CLOB endpoint:

```text
https://clob.polymarket.com
```

The official current TypeScript SDK is the primary application integration direction.

Public Gamma discovery and read-only CLOB data are implemented via `@polymarket/client` `createPublicClient()` in `packages/polymarket`. `createClobMarketData()` wraps public `fetchOrderBook`, `fetchMidpoint`, and `fetchSpread`, normalizing order-book levels and the book-provided dynamic parameters without leaking SDK response shapes. Internal identity types live in `packages/market-models`. Resolution metadata is extracted from stated Gamma/SDK fields (`market.resolution.*`, `market.description`, outcome labels, timing) without inferring Binance or a reference asset from the title. The read-only market WebSocket adapter (`createMarketWebSocketAdapter`) connects to `wss://ws-subscriptions-clob.polymarket.com/ws/market`, sends 10-second `PING` heartbeats, and normalizes `book`, `price_change`, `last_trade_price`, `tick_size_change`, `best_bid_ask`, `new_market`, and `market_resolved` events without mutating market identity. A `SecureClient` is not constructed. Order submission remains unimplemented.

Official Polymarket agent skills are snapshotted from `Polymarket/agent-skills@91ee44ae113e958affd20cd505c6e9d9d6100e0b` under `vendor/polymarket-agent-skills/` and `.grok/skills/web3-polymarket/`. Those skills remain a domain reference; this repository continues to use `@polymarket/client`, not `@polymarket/clob-client`.

The official Python SDK is primarily intended for research workflows.

The official Rust CLOB client remains an available option for specialized components where justified.

---

# 12. Legacy Integration Status

Archived Polymarket libraries are not approved as the production foundation.

This includes legacy V1-era clients and repositories that have been superseded by the current CLOB V2 ecosystem.

The project must remain aligned with the current Polymarket protocol and SDK architecture.

---

# 13. Market Data Architecture

Current market-data sources include:

```text
Gamma API
CLOB REST
CLOB WebSocket
CLOB User WebSocket
Data API
Polymarket Subgraphs
Resolution Subgraph
External BTC Data
```

Each source has a defined role.

No single source is assumed to be authoritative for every type of information.

---

# 14. Market Data Flow

The intended flow is:

```text
External Sources
      ↓
Data Ingestion
      ↓
Normalization
      ↓
Validation
      ↓
Truth Layer
      ↓
Market State
      ↓
Strategies
```

---

# 15. Market State

The system requires a normalized market state containing relevant information such as:

* Market identity
* Event
* Tokens
* Outcome semantics
* Resolution rules
* Status
* Tick size
* Minimum order size
* Fees
* Orderbook
* Prices
* Liquidity
* Time to resolution

Dynamic values must be obtained from current market data rather than hardcoded.

---

# 16. Market Family

The system includes the concept of a market family.

Before comparing or arbitraging markets, the system must verify that they represent compatible:

* Events
* Underlyings
* Assets
* Resolution mechanisms
* Timestamps
* Outcome semantics

`validateMarketFamily()` now performs strict, deterministic comparison of requested contract relationship, required event identity, authoritative subject and reference-asset facts, resolution mechanism/source/rule text/end timestamp, and YES/NO labels. It returns `compatible`, `incompatible`, or `unknown`; unknown never becomes compatible. Titles, slugs, categories, and ticker-like text are not inputs. Current Gamma discovery has no authoritative reference-asset field, so callers must enrich that fact from an approved source before receiving a fully compatible result.

---

# 17. Orderbook State

The system is designed to maintain orderbook state from:

```text
REST Snapshot
+
WebSocket Updates
```

The system must detect and handle:

* Missing updates
* Duplicate events
* Out-of-order events
* Stale state
* Disconnections
* Invalid state transitions

---

# 18. Streaming State

The market WebSocket is part of the real-time architecture.

The system must support:

* Initial subscription
* Snapshot synchronization
* Incremental updates
* Reconnection
* Resubscription
* Recovery

The read-only market WebSocket adapter connects to the public market endpoint, manages subscriptions with custom features enabled, and emits normalized market events. A WebSocket connection being open does not automatically mean the data is valid or fresh.

---

# 19. Execution Architecture

Execution is intentionally separated from strategy logic.

The intended flow is:

```text
Strategy
   ↓
Signal
   ↓
Edge
   ↓
Risk
   ↓
Execution Intent
   ↓
Execution Engine
   ↓
Polymarket
```

Strategies must not directly submit orders.

---

# 20. Current Execution Principles

Execution must account for:

* Market state
* Dynamic tick size
* Minimum order size
* Fees
* Spread
* Depth
* Slippage
* Price protection
* Latency
* Fill probability
* Partial fills
* Opportunity decay

---

# 21. Order Types

The architecture supports research and execution around:

```text
GTC
GTD
FOK
FAK
Post-only
```

The appropriate order type is strategy-dependent.

---

# 22. Price Protection

The system must not use unrestricted execution.

The intended model is:

```text
Current Book
    ↓
Maximum Acceptable Price
    ↓
Marketable Limit Order
```

Price protection is a core execution safety requirement.

---

# 23. Execution State

The execution layer must preserve order state.

Important lifecycle concepts include:

```text
Placement
Update
Cancellation
```

and trade lifecycle states such as:

```text
MATCHED
MINED
CONFIRMED
RETRYING
FAILED
```

---

# 24. Unknown Execution State

Unknown execution state is explicitly supported as a valid system condition.

The system must not assume that an unsuccessful request means the order did not reach the exchange.

Reconciliation is required when exchange state is uncertain.

---

# 25. Execution Simulation

Execution simulation is a required part of strategy validation.

The simulator is intended to model:

```text
Signal
→ Processing Delay
→ Network Delay
→ Exchange Arrival
→ Book State
→ Queue Position
→ Matching
→ Fill
→ Remaining Order
```

---

# 26. Opportunity Classification

The project explicitly distinguishes:

```text
THEORETICAL OPPORTUNITY
```

from:

```text
EXECUTABLE OPPORTUNITY
```

An apparent price discrepancy does not automatically represent a tradable opportunity.

---

# 27. Opportunity Decay

The project includes opportunity-decay analysis.

Relevant measurements include:

* Opportunity duration
* Edge decay
* Capture probability
* Fill probability
* Missed opportunity rate

---

# 28. Current Competition Research

Competition analysis is part of the research architecture.

The system may analyze:

* Taker concentration
* Repeat takers
* Maker activity
* Maker/taker overlap
* Execution density
* Market crowding
* Opportunity decay
* Competitor behavior

---

# 29. Wallet Intelligence

Wallet analysis is an approved research capability.

The system is intended to evaluate:

* Historical trades
* Positions
* Realized PnL
* Holding time
* Entry quality
* Exit quality
* Market concentration
* Trade frequency

---

# 30. Wallet Classification

The system should distinguish observable address types where possible:

```text
EOA
Contract
CTF Exchange
Known Protocol
Market Maker
Bot
Human
Unknown
```

An address must not automatically be classified as a whale or profitable trader.

---

# 31. Copyability Research

Wallet profitability does not automatically imply copyability.

Copyability research should consider:

* Historical profitability
* Profit factor
* Consistency
* Drawdown
* Trade count
* Holding time
* Entry edge
* Trade size
* Liquidity
* Spread
* Execution delay
* Maker/taker behavior
* Averaging
* Split/merge behavior
* Simulated copy performance

---

# 32. Maker-Side Research

The system may investigate wallets that repeatedly buy both sides of a market.

Such behavior may represent:

* Market making
* Inventory management
* Structural strategies
* Split/merge/redeem activity

It must not automatically be interpreted as directional conviction.

---

# 33. Signal Architecture

Signals are expected to follow:

```text
Raw Observation
      ↓
Feature
      ↓
Signal
      ↓
Normalized Signal
      ↓
Fair Value / Probability
      ↓
Edge
      ↓
Execution Adjustment
      ↓
Net Expected Edge
```

---

# 34. Signal Freshness

Signals must contain enough timing information to determine whether they remain actionable.

A stale signal must not be treated as current simply because its underlying source remains available.

---

# 35. Signal Fusion

Signal fusion may combine multiple independent or partially independent signals.

The system must avoid double-counting correlated information.

---

# 36. Edge Calculation

The project distinguishes:

```text
Theoretical Edge
```

from:

```text
Execution-Adjusted Edge
```

and:

```text
Net Expected Edge
```

Net edge should account for relevant execution costs.

---

# 37. Cost Model

Relevant costs may include:

* Fees
* Spread
* Slippage
* Partial fills
* Latency
* Opportunity decay

Dynamic Polymarket fees must not be hardcoded.

---

# 38. Risk Architecture

Risk is independent from strategy.

The hierarchy is:

```text
GLOBAL RISK
    ↓
STRATEGY RISK
    ↓
MARKET RISK
    ↓
TRADE RISK
    ↓
ORDER RISK
```

---

# 39. Risk Boundary

The intended flow is:

```text
Signal
   ↓
Edge
   ↓
Risk Decision
   ↓
Execution Permission
```

The execution layer must not bypass the risk layer.

---

# 40. Kill Switch

The project requires a kill-switch mechanism.

The kill switch is intended to prevent continued trading during dangerous conditions.

The exact activation criteria remain governed by approved risk and operational rules.

---

# 41. Portfolio and PnL

The system is expected to maintain authoritative state for:

* Orders
* Fills
* Positions
* Balances
* Fees
* PnL

---

# 42. Reconciliation

Reconciliation is a core system requirement.

The intended chain is:

```text
Orders
→ Fills
→ Positions
→ Balances
→ PnL
```

Any discrepancy must remain visible until resolved.

---

# 43. Strategy Health

The system should monitor:

* Signal count
* Execution count
* Fill rate
* Win rate
* Profit factor
* Net PnL
* Drawdown
* Average edge
* Realized edge
* Slippage
* Fees
* Latency
* Opportunity survival

---

# 44. Edge Attribution

The system should eventually attribute realized performance to sources such as:

```text
BTC Lead-Lag
Orderbook
Whale
Market Dislocation
Information / Regime
Execution
Other
```

Attribution must be based on evidence rather than assumed causality.

---

# 45. Data Architecture

The current approved data architecture separates structured operational data from high-frequency research data.

Primary structured store:

```text
PostgreSQL
```

Research/high-frequency storage:

```text
Parquet
+
DuckDB
```

Optional short-lived state/caching:

```text
Redis
```

---

# 46. PostgreSQL Role

PostgreSQL is intended for structured application state including:

* Markets
* Wallets
* Trades
* Positions
* Signals
* Orders
* PnL
* Strategy state
* Configuration metadata

---

# 47. Parquet and DuckDB Role

Parquet and DuckDB are intended for research workloads such as:

* High-frequency orderbook data
* External market feeds
* Historical event datasets
* Backtests
* Execution replay
* Research analysis

---

# 48. Research Architecture

The research pipeline is:

```text
Raw Data
   ↓
Validation
   ↓
Normalization
   ↓
Dataset
   ↓
Experiment
   ↓
Backtest
   ↓
Execution Simulation
   ↓
Result
   ↓
Decision
```

---

# 49. Research Integrity

The system must avoid:

* Look-ahead bias
* Data leakage
* Survivorship bias
* Data snooping
* Unrealistic execution
* Ignored fees
* Ignored slippage
* Ignored latency

---

# 50. Current Technology Direction

Primary application language:

```text
TypeScript
```

Research language:

```text
Python
```

Rust:

```text
Specialized / Conditional
```

---

# 51. Runtime

The current TypeScript runtime direction is:

```text
Node.js >= 24
pnpm >= 10
```

The application architecture should remain modular.

---

# 52. Initial Application Architecture

The project should begin as a modular application rather than a large collection of microservices.

Expected logical components include:

```text
Market Data
Truth Layer
Market State
Strategy Engine
Signal Fusion
Edge Calculator
Risk Engine
Execution Engine
Portfolio
PnL
Monitoring
API / Dashboard
```

---

# 53. Infrastructure Direction

The project follows a cost-conscious infrastructure strategy.

Initial deployment options include:

```text
Render
Oracle Always Free
```

The infrastructure must not be treated as permanently sufficient simply because it is free.

---

# 54. Current Deployment Philosophy

The intended progression is:

```text
Local Research
    ↓
Render Paper
    ↓
Extended Paper
    ↓
Oracle Always Free
    ↓
Controlled Live
```

Live deployment requires human authorization.

---

# 55. Render Role

Render may be used for:

* Development
* Paper trading
* API
* Dashboard
* Non-critical services

Render's free-tier limitations mean it is not assumed to be a guaranteed permanent live trading runtime.

---

# 56. Oracle Role

Oracle Always Free is a candidate for a continuously running low-cost trading environment once the system reaches the appropriate validation stage.

Operational recovery remains necessary because free infrastructure may experience:

* Resource constraints
* Availability issues
* Reclamation
* Restart

---

# 57. Deployment Architecture

Current direction:

```text
GitHub
   ↓
CI/CD
   ↓
┌───────────────┬────────────────┐
│               │                │
Render       Oracle VM
│               │
API / UI     Trading Engine
│               │
└───────┬───────┘
        ↓
   PostgreSQL
        ↓
   Polymarket
```

The exact production topology may evolve based on measured requirements.

---

# 58. Containerization

Docker is the preferred packaging mechanism for deployed runtime components.

---

# 59. CI/CD

The intended pipeline is:

```text
Commit
 ↓
Static Checks
 ↓
Tests
 ↓
Build
 ↓
Deployment
 ↓
Health Verification
```

Live activation remains separate from deployment.

---

# 60. Monitoring

Monitoring must cover:

```text
System
Data
Strategy
Execution
Risk
Portfolio
Infrastructure
```

---

# 61. Health States

The system distinguishes:

```text
Liveness
Readiness
Trading Readiness
```

A process can be alive while still being unsafe to trade.

---

# 62. Security State

Current security principles include:

* Secrets must remain outside source code.
* Private keys must be protected.
* API credentials must be protected.
* Live credentials must be isolated.
* Research environments must not unnecessarily access live credentials.
* Sensitive information must not appear in logs.

---

# 63. Agent Governance

The AI agent may:

* Research
* Implement
* Test
* Benchmark
* Refactor
* Document

The AI agent may not independently:

* Allocate capital
* Activate live trading
* Change the wallet
* Remove risk controls
* Change approved risk limits
* Expose credentials
* Deploy live-money changes without the required authorization
* Redefine project authority

---

# 64. Agent Operating Workflow

The approved workflow is:

```text
Read
 ↓
Understand
 ↓
Inspect
 ↓
Verify
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Review
 ↓
Document
 ↓
Report
```

---

# 65. Documentation Dependency

The agent should not read every project document for every task.

It should read the project charter and current state, then load the specifications relevant to the task.

---

# 66. Current Documentation Completion

The following core documentation has been established:

```text
00-project-charter.md
01-project-requirements.md
02-system-architecture.md
03-technical-stack.md
04-data-architecture.md

polymarket/
10-polymarket-integration.md
11-market-data-and-streaming.md
12-trading-and-execution.md

strategies/
20-strategy-framework.md
21-alpha-strategies.md
22-signal-fusion-and-edge.md

research/
30-research-and-backtesting.md
31-execution-simulation.md

risk/
40-risk-and-safety.md

infrastructure/
50-development-and-deployment.md
51-monitoring-and-operations.md

engineering/
60-engineering-standards.md
61-testing-and-ci-cd.md

agent/
70-agent-contract.md
71-agent-operating-protocol.md
72-agent-skills.md
```

---

# 67. Current Documentation Status

The architecture and operating documentation is considered established for the current project phase.

The next project-state files provide the operational record required for implementation.

---

# 68. Known Research Unknowns

The following remain intentionally unresolved:

* Whether BTC lead-lag produces persistent net edge
* Which time window performs best
* Which external feed provides the best predictive information
* How much latency affects capture
* How much opportunity decay affects execution
* Whether whale activity is consistently predictive
* Whether profitable wallets are copyable
* Which market-dislocation relationships are executable
* Which execution method is optimal for each strategy
* Which strategy parameters are robust
* Whether strategies remain profitable after all costs
* Whether observed edges survive changing market regimes

These must be answered through research.

---

# 69. Known Non-Assumptions

The project does not currently assume that:

1. Whale copying is profitable.
2. A profitable wallet is copyable.
3. BTC 5-minute markets contain a persistent edge.
4. Binance always leads Polymarket by a fixed amount.
5. A specific latency threshold guarantees profitability.
6. Arbitrage is automatically executable.
7. Any specific strategy parameter is optimal.
8. AI can determine the best trading algorithm without evidence.
9. Historical profitability guarantees future profitability.
10. Free infrastructure is sufficient for every production requirement.
11. Price discrepancies are risk-free.
12. More signals automatically improve performance.

---

# 70. Current Major Risks

The primary known project risks include:

### Research Risk

A historical relationship may disappear in live conditions.

### Execution Risk

An apparent edge may disappear before the order executes.

### Data Risk

Incorrect or stale market state can generate incorrect decisions.

### Resolution Risk

The market's actual resolution mechanism may differ from assumptions.

### Competition Risk

Other participants may capture the same opportunity first.

### Infrastructure Risk

Free infrastructure may restart, become unavailable, or degrade.

### Strategy Risk

Backtested performance may not survive out-of-sample conditions.

### AI Risk

An AI agent may introduce unsupported assumptions or unsafe changes if governance is not enforced.

---

# 71. Current Development Priority

The next implementation priorities should generally follow:

```text
1. Establish repository structure
2. Establish configuration and environment handling
3. Establish market-data ingestion
4. Establish market-state normalization
5. Establish persistent data layer
6. Establish research datasets
7. Establish BTC research pipeline
8. Establish backtesting
9. Establish execution simulation
10. Establish risk engine
11. Establish paper trading
12. Establish monitoring and reconciliation
13. Validate strategies
14. Human-controlled live activation
```

The exact implementation order may change if a documented dependency requires it.

---

# 72. Live Trading Status

Live trading is:

```text
NOT ACTIVE
```

The system must not interpret documentation completion as authorization to trade live capital.

---

# 73. Capital Status

The project is intended to treat initial capital as research capital.

The previously defined research-capital philosophy is small-scale capital, with the initial reference range being approximately:

```text
$20–$50
```

This is not a guaranteed allocation and does not override human approval or risk controls.

---

# 74. Current Success Definition

At this stage, success is not defined by profit.

Current success means:

* Correct architecture
* Reliable data
* Reproducible research
* Realistic execution simulation
* Strong risk controls
* Accurate PnL
* Complete observability
* Safe agent behavior
* Evidence-based strategy validation

---

# 75. Project Principle

The central project principle remains:

> Do not trade because an opportunity looks profitable. Trade only when the expected net edge has been demonstrated to be executable and the trade passes the risk and execution requirements.

---

# 76. Current State Summary

The project currently has:

```text
Architecture        Defined
Requirements        Defined
Technical Stack     Defined
Data Architecture   Defined
Polymarket Layer    Defined
Strategy Framework  Defined
Alpha Research      Defined
Backtesting         Defined
Execution Simulation Defined
Risk Architecture   Defined
Infrastructure      Defined
Monitoring          Defined
Engineering Rules   Defined
Testing Strategy    Defined
Agent Contract      Defined
Agent Protocol      Defined
Agent Skills        Defined
Repository          Phase 0 implemented (pnpm workspace + Python research)
Configuration       Phase 1 implemented (research default, fail closed)
TypeScript runtime  Boots in research/paper; refuses live
Research Python     Isolated; refuses live
CI                  GitHub Actions (typecheck, vitest, pytest, build)
Live Trading        Not Active
Market data         Not implemented
Order submission    Not implemented
```

---

# 77. State Integrity Rule

If the actual implementation diverges from this document, this document must be updated.

The agent must not silently modify the system while leaving the documented project state inaccurate.

---

# 78. Update Rule

`CURRENT-STATE.md` should be updated whenever a material change occurs to:

* Implementation state
* Strategy state
* Deployment state
* Research state
* Infrastructure state
* Live/paper state
* Major blockers

---

# 79. Final Principle

This file describes the **current known state**, not what the project hopes to become.

When a fact changes:

```text
Implementation
→ Verify
→ Update Current State
```

When a decision changes:

```text
Evidence
→ Human Decision
→ DECISIONS.md
→ CURRENT-STATE.md
```

When work remains:

```text
TODO.md
```

When history needs recording:

```text
CHANGELOG.md
```

This separation keeps the project state accurate and prevents the AI agent from confusing planned architecture with implemented reality.
