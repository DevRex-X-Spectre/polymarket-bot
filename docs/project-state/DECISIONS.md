# Polymarket Trading Bot

## Project Decisions

**Document:** `docs/project-state/DECISIONS.md`
**Status:** Active
**Document Type:** Decision Register
**Last Updated:** 2026-09-13 (D-076 strict market-family validation)

---

# 1. Purpose

This document records important decisions that govern the Polymarket trading bot.

It exists to prevent previously approved decisions from being forgotten, contradicted, or silently changed.

This document records **decisions**, not implementation tasks.

Tasks belong in:

```text
docs/project-state/TODO.md
```

Current implementation state belongs in:

```text
docs/project-state/CURRENT-STATE.md
```

Historical project changes belong in:

```text
docs/project-state/CHANGELOG.md
```

---

# 2. Decision Authority

Project decisions follow this hierarchy:

```text
Human Approval
      ↓
Project Charter
      ↓
Approved Architecture
      ↓
Requirements
      ↓
Technical Specifications
      ↓
Implementation
```

The AI agent must not override an approved decision without the appropriate human review.

---

# 3. Decision Status

Decisions may be classified as:

```text
APPROVED
PROVISIONAL
RESEARCH-DEPENDENT
DEFERRED
SUPERSEDED
```

---

# 4. D-001: Research-First Development

**Status:** APPROVED

The project will be developed using a research-first approach.

A strategy should not be promoted to live trading merely because an idea appears intuitive or profitable.

The expected lifecycle is:

```text
Idea
→ Hypothesis
→ Data
→ Research
→ Backtest
→ Execution Simulation
→ Paper Trading
→ Validation
→ Controlled Live
```

---

# 5. D-002: Profitability Is Not Assumed

**Status:** APPROVED

The project does not assume that the bot will be profitable.

Profit is an outcome that must be demonstrated through evidence.

The system must prioritize:

* Validated edge
* Executability
* Risk control
* Accurate accounting
* Research integrity

---

# 6. D-003: Initial Alpha Research Areas

**Status:** APPROVED

The initial research framework contains four primary alpha areas:

```text
BTC Microstructure
Whale Intelligence
Market Dislocation
Information / Regime
```

These are research categories and are not declarations of proven profitability.

---

# 7. D-004: BTC 5-Minute Markets as Initial Priority

**Status:** RESEARCH-DEPENDENT

BTC short-duration markets are the highest-priority initial research area.

The initial hypothesis concerns whether external BTC market movement can provide useful information before the corresponding Polymarket market fully reflects that information.

This remains a hypothesis.

---

# 8. D-005: Actual Resolution Source Must Be Verified

**Status:** APPROVED

The bot must use the actual resolution rules of each Polymarket market.

It must not assume that an external exchange feed is the resolution source.

For BTC markets, an external feed such as Binance may be used as a predictive input, while the actual market resolution source must be independently identified.

---

# 9. D-006: No Fixed Lead-Lag Assumption

**Status:** APPROVED

The system must not hardcode a permanent assumption that one market or data source leads another by a fixed amount of time.

Lead-lag must be measured from data.

Any observed relationship must be evaluated for:

* Stability
* Market dependence
* Regime dependence
* Execution feasibility
* Decay

---

# 10. D-007: Candidate BTC Time Windows Are Experimental

**Status:** RESEARCH-DEPENDENT

The initial BTC research includes candidate windows:

```text
180–60 seconds
60–20 seconds
20–5 seconds
```

These are research buckets.

They are not approved permanent strategy parameters.

---

# 11. D-008: TypeScript-First Application

**Status:** APPROVED

The primary trading and application layer will use TypeScript.

The current runtime direction is:

```text
Node.js >= 24
pnpm >= 10
```

The application should remain modular.

---

# 12. D-009: Python for Quantitative Research

**Status:** APPROVED

Python will be used primarily for:

* Data analysis
* Research
* Backtesting
* Statistical analysis
* Dataset processing

Python is not currently the primary production trading runtime.

---

# 13. D-010: Rust Is Specialized, Not Default

**Status:** APPROVED

Rust may be introduced where there is a demonstrated requirement for:

* Performance
* Specialized infrastructure
* A suitable official Polymarket Rust component

Rust must not be introduced merely because it is technically capable of high performance.

---

# 14. D-011: Official Polymarket SDK Direction

**Status:** APPROVED

The current official Polymarket TypeScript SDK is the primary application integration direction.

The official Python SDK is primarily intended for research-oriented workflows.

The official Rust CLOB client remains available for specialized components where justified.

---

# 15. D-012: Polymarket CLOB V2

**Status:** APPROVED

The project targets the current Polymarket CLOB V2 architecture.

Production CLOB endpoint:

```text
https://clob.polymarket.com
```

The project must not use archived V1 clients as the production foundation.

---

# 16. D-013: Dynamic Market Parameters Must Not Be Hardcoded

**Status:** APPROVED

The bot must obtain current market-specific values where required.

Examples include:

* Tick size
* Minimum order size
* Fees
* Market state
* Trading constraints

The system must not assume these values are permanently static.

---

# 17. D-014: Fees Must Be Modeled

**Status:** APPROVED

Execution analysis must account for applicable Polymarket fees.

Dynamic fee information must be obtained from the appropriate current market information rather than hardcoded globally.

---

# 18. D-015: Strategies Cannot Submit Orders Directly

**Status:** APPROVED

Strategies produce signals and execution intent.

They do not directly communicate with the exchange.

The approved boundary is:

```text
Strategy
   ↓
Signal
   ↓
Edge
   ↓
Risk
   ↓
Execution
   ↓
Polymarket
```

---

# 19. D-016: Risk Is Independent

**Status:** APPROVED

Risk is an independent system boundary.

The hierarchy is:

```text
Global
 ↓
Strategy
 ↓
Market
 ↓
Trade
 ↓
Order
```

Strategy logic must not bypass risk controls.

---

# 20. D-017: Price Protection Is Mandatory

**Status:** APPROVED

The system must not submit unrestricted execution instructions.

Execution should use explicit price protection.

Conceptually:

```text
Current Book
→ Maximum Acceptable Price
→ Marketable Limit Order
```

---

# 21. D-018: Theoretical Edge Is Not Executable Edge

**Status:** APPROVED

The project explicitly distinguishes:

```text
Theoretical Opportunity
```

from:

```text
Executable Opportunity
```

A price discrepancy is not automatically a tradable opportunity.

---

# 22. D-019: Net Edge Must Include Execution Costs

**Status:** APPROVED

Where relevant, edge calculations must account for:

* Fees
* Spread
* Slippage
* Partial fills
* Latency
* Opportunity decay

The objective is to estimate net expected edge rather than theoretical gross edge alone.

---

# 23. D-020: Opportunity Decay Must Be Measured

**Status:** APPROVED

The project will measure how long opportunities remain executable.

Relevant measurements include:

* Opportunity duration
* Edge decay
* Capture probability
* Fill probability
* Missed opportunities

---

# 24. D-021: Execution Simulation Is Required

**Status:** APPROVED

Strategy validation must include execution simulation where execution materially affects expected performance.

The simulation should account for:

```text
Signal
→ Processing Delay
→ Network Delay
→ Exchange Arrival
→ Book State
→ Queue
→ Matching
→ Fill
```

---

# 25. D-022: Depth-Aware Execution

**Status:** APPROVED

Execution research must account for available orderbook depth.

Top-of-book prices alone are insufficient to claim that a larger order is executable at that price.

Where appropriate, execution analysis should use:

* Depth
* VWAP
* Slippage
* Partial fills

---

# 26. D-023: Passive Execution Requires Fill Modeling

**Status:** APPROVED

Maker or post-only strategies must account for:

* Queue position
* Fill probability
* Opportunity decay
* Cancellation
* Missed opportunities

Post-only execution is not assumed to be superior to taking liquidity.

---

# 27. D-024: Sequential and Parallel Execution Are Both Supported for Research

**Status:** APPROVED

Multi-leg strategies may use:

```text
Sequential Execution
```

or:

```text
Parallel Execution
```

The preferred method must be determined by evidence for the specific strategy.

---

# 28. D-025: Unknown Execution State Is First-Class

**Status:** APPROVED

The system must support an unknown execution state.

A failed request does not automatically prove that an order was not accepted.

When exchange state is uncertain, reconciliation is required.

---

# 29. D-026: Reconciliation Is Mandatory

**Status:** APPROVED

The system must reconcile:

```text
Orders
→ Fills
→ Positions
→ Balances
→ PnL
```

The bot must not assume that internal state is correct merely because an API request succeeded.

---

# 30. D-027: PostgreSQL for Structured Operational Data

**Status:** APPROVED

PostgreSQL is the primary structured operational datastore.

It is intended for information such as:

* Markets
* Wallets
* Trades
* Positions
* Orders
* Signals
* PnL
* Strategy state
* Configuration metadata

---

# 31. D-028: Parquet and DuckDB for Research Data

**Status:** APPROVED

Parquet and DuckDB are the primary direction for high-frequency research datasets.

They are intended for:

* Orderbook events
* External market feeds
* Historical datasets
* Backtesting
* Execution replay
* Quantitative analysis

---

# 32. D-029: Redis Is Not the Financial Source of Truth

**Status:** APPROVED

Redis may be used for:

* Short-lived state
* Caching
* Coordination

It must not become the authoritative long-term record for financial state.

---

# 33. D-030: Modular Architecture Before Microservices

**Status:** APPROVED

The initial implementation will use a modular architecture rather than a large microservice architecture.

The project will not introduce systems such as Kafka or Kubernetes without demonstrated requirements.

---

# 34. D-031: Strategy and Execution Separation

**Status:** APPROVED

Strategy logic determines whether an opportunity may be attractive.

Execution logic determines how an approved execution intent should be submitted.

Neither layer should absorb responsibilities belonging to the other.

---

# 35. D-032: Research and Live Trading Must Be Isolated

**Status:** APPROVED

Research code must not automatically have access to live trading capabilities.

The project maintains separate operating modes:

```text
Research
Paper
Live
```

---

# 36. D-033: Live Trading Requires Human Authorization

**Status:** APPROVED

The AI agent cannot independently activate live trading.

Documentation completion, successful tests, or deployment success do not constitute permission to trade live capital.

---

# 37. D-034: AI Agent Cannot Change Risk Authority

**Status:** APPROVED

The AI agent must not independently:

* Remove risk controls
* Change approved risk limits
* Change the trading wallet
* Allocate capital
* Activate live trading
* Expose credentials

---

# 38. D-035: No Hidden Execution

**Status:** APPROVED

The project must not contain hidden paths by which:

* Strategies submit orders
* Dashboards submit unrestricted orders
* Research scripts trade live
* Monitoring bypasses risk
* AI tools bypass authorization

All execution must pass through the approved architecture.

---

# 39. D-036: Human Decision-Making Remains the Authority

**Status:** APPROVED

The AI agent accelerates:

* Research
* Engineering
* Testing
* Benchmarking
* Documentation

It does not replace human authority over:

* Capital
* Live trading
* Risk policy
* Wallets
* Material architecture decisions

---

# 40. D-037: Wallet Intelligence Is Research, Not Automatic Copy Trading

**Status:** APPROVED

Wallet activity may be analyzed for potential predictive information.

The project does not assume that:

```text
Profitable Wallet
=
Copyable Wallet
```

Copyability must be experimentally validated.

---

# 41. D-038: Wallet Classification Is Required

**Status:** APPROVED

Active addresses should be classified where data permits.

Relevant classifications include:

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

The CTF Exchange must not be mistaken for an individual trader simply because it appears repeatedly in transaction data.

---

# 42. D-039: FIFO Wallet Reconstruction

**Status:** APPROVED

Where appropriate, wallet positions should be reconstructed using FIFO methods to analyze:

* Realized PnL
* Holding time
* Entry quality
* Exit quality
* Position behavior

---

# 43. D-040: Competition Must Be Modeled

**Status:** APPROVED

The bot should account for competition when evaluating whether an opportunity is executable.

Relevant measurements include:

* Taker concentration
* Repeat takers
* Maker activity
* Execution density
* Market crowding
* Opportunity decay

---

# 44. D-041: Maker-Side Pair Activity Is Not Automatically Directional

**Status:** APPROVED

Repeated purchases of both YES and NO by the same maker may represent structural or market-making behavior.

It must not automatically be interpreted as directional conviction.

---

# 45. D-042: Market Families Must Be Validated

**Status:** APPROVED

Cross-market comparisons must verify that markets share compatible:

* Event
* Underlying
* Asset
* Resolution
* Timestamp
* Outcome semantics

---

# 46. D-043: Strategy Parameters Are Research Variables

**Status:** APPROVED

Strategy thresholds and parameters must not be treated as optimal without evidence.

Third-party parameters are hypotheses until independently validated.

---

# 47. D-044: Third-Party Strategy Claims Are Not Proof

**Status:** APPROVED

Third-party repositories may provide:

* Ideas
* Algorithms
* Data structures
* Research directions

They do not automatically prove:

* Profitability
* Robustness
* Current compatibility
* Production safety

---

# 48. D-045: No Fixed DipArb Parameters

**Status:** RESEARCH-DEPENDENT

Thresholds observed in third-party implementations may be tested experimentally.

They are not approved production parameters.

The previously observed dip-arbitrage behavior is therefore treated as a research hypothesis rather than an established strategy.

---

# 49. D-046: Strategy Health Must Be Observable

**Status:** APPROVED

The system should measure strategy health through metrics including:

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

# 50. D-047: Edge Attribution Is Required for Mature Strategies

**Status:** APPROVED

The system should eventually identify which sources contributed to realized performance.

Potential attribution categories include:

```text
BTC Lead-Lag
Orderbook
Whale
Market Dislocation
Information / Regime
Execution
Other
```

---

# 51. D-048: Free Infrastructure First

**Status:** APPROVED

The project follows a cost-conscious infrastructure progression.

The initial direction is:

```text
Local
→ Render Free
→ Oracle Always Free
→ Paid Infrastructure Only When Justified
```

The availability of free infrastructure must not override reliability requirements.

---

# 52. D-049: Render Is Not Assumed to Be Permanent Live Infrastructure

**Status:** APPROVED

Render free services are useful for development and paper-oriented workloads.

The project does not assume that free Render infrastructure provides guaranteed uninterrupted execution for a live trading engine.

---

# 53. D-050: Oracle Always Free Is the Candidate Long-Running Runtime

**Status:** APPROVED**

Oracle Always Free is the current preferred candidate for a continuously running low-cost trading VM once the project reaches the appropriate stage.

Operational recovery remains mandatory.

---

# 54. D-051: Docker Is the Deployment Packaging Standard

**Status:** APPROVED

Runtime components should be containerized using Docker where appropriate.

---

# 55. D-052: CI/CD Before Live Deployment

**Status:** APPROVED

Code should pass the required CI checks before deployment.

The intended flow is:

```text
Commit
→ CI
→ Tests
→ Build
→ Deploy
→ Health Verification
```

Deployment itself does not activate live trading.

---

# 56. D-053: Monitoring Is a Core System Component

**Status:** APPROVED

Monitoring is not an optional dashboard feature.

The system must observe:

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

# 57. D-054: Liveness Is Not Trading Readiness

**Status:** APPROVED

The system distinguishes:

```text
Liveness
Readiness
Trading Readiness
```

A running process must not automatically be considered safe to trade.

---

# 58. D-055: No Magic Numbers

**Status:** APPROVED

Dynamic, financial, or strategy-critical values must not be scattered as unexplained constants throughout the codebase.

Values that are research-dependent must be:

* Explicit
* Configurable where appropriate
* Versioned where appropriate
* Supported by evidence

---

# 59. D-056: Event Time Must Be Preserved

**Status:** APPROVED

The system must distinguish:

```text
Event Time
Receipt Time
Processing Time
Decision Time
Submission Time
Exchange Arrival Time
Fill Time
```

These timestamps are important for lead-lag research and execution analysis.

---

# 60. D-057: Unknown Must Remain Unknown

**Status:** APPROVED

When the system cannot determine a fact reliably, it must preserve the uncertainty.

The system must not convert:

```text
Unknown
```

into:

```text
Assumed False
```

or:

```text
Assumed True
```

without justification.

---

# 61. D-058: Backtesting Must Include Execution Reality

**Status:** APPROVED

Backtesting must not rely solely on theoretical prices.

Where execution materially affects performance, research should incorporate:

* Historical depth
* Slippage
* Fees
* Latency
* Fill behavior
* Opportunity decay

---

# 62. D-059: Research Must Be Reproducible

**Status:** APPROVED

Research results should be traceable to:

```text
Dataset
+
Dataset Version
+
Code Version
+
Parameters
+
Method
+
Results
```

---

# 63. D-060: Negative Results Must Be Preserved

**Status:** APPROVED

Failed experiments and unsupported hypotheses are valuable project knowledge.

They should be documented rather than silently discarded.

---

# 64. D-061: Workspace Monorepo Without Microservices

**Status:** APPROVED

The repository is a pnpm workspace:

```text
apps/trader
packages/shared
packages/config
research/
data/
scripts/
tests/
docs/
```

Logical engines listed in the technical stack remain modules, not independently deployed services.

---

# 65. D-062: Vitest and pytest

**Status:** APPROVED

TypeScript tests use Vitest. Python research tests use pytest. CI runs both without live credentials.

---

# 66. D-063: Fail-Closed Environment Configuration

**Status:** APPROVED

Configuration is loaded from environment variables.

```text
POLYMARKET_BOT_MODE
POLYMARKET_BOT_LIVE_TRADING_ENABLED
NODE_ENV
```

Rules:

* Default mode is `research`.
* Unknown values fail closed.
* Live mode requires both `POLYMARKET_BOT_MODE=live` and `POLYMARKET_BOT_LIVE_TRADING_ENABLED=true`.
* Test environment cannot enable live trading.
* The current build still cannot submit live orders even if those flags are set.
* Secrets are environment-only and must be redacted from logs.

---

# 67. D-064: Official TypeScript Client Package Name

**Status:** APPROVED

The official TypeScript SDK repository is `Polymarket/ts-sdk`.

The published npm package used by the application is:

```text
@polymarket/client
```

Public discovery uses `createPublicClient()` and does not require credentials.

A `SecureClient` must not be constructed until live/authenticated work is explicitly authorized. Order submission remains unimplemented.

---

# 64. D-061: Live Trading Is Not a Documentation Milestone

**Status:** APPROVED

Completing the project documentation does not mean that live trading is ready.

Live trading requires:

* Implementation
* Testing
* Research
* Execution simulation
* Paper validation
* Operational readiness
* Risk readiness
* Human approval

---

# 65. D-062: Initial Capital Is Research Capital

**Status:** APPROVED

Initial capital is treated as research capital rather than money that the system is expected to multiply.

The previously established reference range is:

```text
$20–$50
```

This is not an automatic funding instruction.

---

# 66. D-063: Success Is Defined by Validated Edge

**Status:** APPROVED

The project does not define success as:

```text
Number of trades
```

or:

```text
Short-term PnL
```

The primary objective is to establish whether a repeatable, executable, risk-adjusted edge exists.

---

# 67. D-064: Architecture Must Evolve From Evidence

**Status:** APPROVED

The system should become more complex only when measured requirements justify that complexity.

Examples include:

* Additional services
* Queues
* Caching layers
* Specialized runtimes
* Additional infrastructure

---

# 68. D-065: Agent Must Not Guess

**Status:** APPROVED

When information is unavailable or uncertain, the agent must:

1. Identify the unknown.
2. Research it if possible.
3. Run an experiment if appropriate.
4. Ask for a decision when human judgment is required.

It must not silently invent an answer.

---

# 69. D-066: Official Sources Take Priority

**Status:** APPROVED

For current Polymarket protocol behavior, the project prioritizes:

```text
Official Documentation
→ Official SDK
→ Official Protocol Repository
→ Verified Runtime Behavior
→ Community Evidence
→ Hypothesis
```

---

# 70. D-067: Third-Party Research Is Used Selectively

**Status:** APPROVED

Third-party repositories may contribute ideas that improve the system.

Relevant examples include:

* Opportunity decay
* Competition analysis
* Wallet reconstruction
* Copyability analysis
* Depth-aware execution
* Maker-side pattern analysis
* Execution simulation

These ideas must be independently validated before becoming production behavior.

---

# 71. D-068: No Premature Microservices

**Status:** APPROVED

The initial system will not be split into numerous independently deployed services unless requirements demonstrate a need.

The preferred initial architecture is a modular application.

---

# 72. D-069: Dashboard Cannot Bypass Trading Controls

**Status:** APPROVED

The API or dashboard must not provide an alternative path around:

```text
Risk
Execution Validation
Authentication
Auditability
```

---

# 73. D-070: Monitoring Cannot Invent Trading Decisions

**Status:** APPROVED

Monitoring may detect conditions and invoke approved safety mechanisms.

It must not independently create new trading strategies or execution behavior.

---

# 74. D-071: Strategy Health Actions Require Approved Rules

**Status:** APPROVED

The system may support automatic degradation or disabling of strategies.

However, the exact rules must be explicitly approved.

The AI agent must not invent automatic shutdown thresholds.

---

# 75. D-072: Project-State Files Are Operational Records

**Status:** APPROVED

The project-state layer is separated into:

```text
CURRENT-STATE.md
DECISIONS.md
TODO.md
CHANGELOG.md
```

Each file has a distinct purpose.

---

# 76. D-073: Public Gamma Discovery Adapter

**Status:** APPROVED

Market discovery uses the official `@polymarket/client` public client:

```text
createPublicClient()
```

Rules:

* `packages/polymarket` is the only package that depends on `@polymarket/client`.
* `packages/market-models` owns internal event/market identity types.
* A `SecureClient` must not be constructed.
* Discovery does not submit orders and does not decide profitability.
* A discovered market is not tradable merely because Gamma returned it.
* Gamma `closed` includes resolved markets; a distinct resolved status is not inferred (TODO-010).
* Unit tests mock the client. Live HTTP tests are opt-in.

---

# 77. D-074: Official Agent Skills Are a Domain Reference

**Status:** APPROVED

The official Polymarket agent-skills repository is:

```text
https://github.com/Polymarket/agent-skills
```

Snapshot: commit `91ee44ae113e958affd20cd505c6e9d9d6100e0b` (retrieved 2026-09-13) at `vendor/polymarket-agent-skills/` and `.grok/skills/web3-polymarket/`. Official skill text is not modified.

Those skills describe Polymarket behavior. This project's application integration remains `@polymarket/client` `createPublicClient()` (D-064). The skill examples that use `@polymarket/clob-client` must not replace that decision.

---

# 78. D-075: Resolution Metadata Does Not Infer a Source

**Status:** APPROVED

Resolution extraction records stated Gamma/SDK evidence:

* `market.resolution.source` / `event.resolution.source`
* `market.description` as observed rule text
* YES/NO outcome labels
* timing fields
* UMA status (`resolved` / `settled` / `proposed` / `disputed` / `requested`)

It must not infer Binance, Chainlink, or any reference asset from the market title or slug. There is no official Gamma `referenceAsset` field in the current SDK `Market` type, so `referenceAsset` remains `null`.

If market and event stated sources differ, the interpreted source stays unknown and both values are preserved as evidence.

Gamma `closed` is not treated as UMA resolved.

Successful resolution extraction does not make a market tradable.

---

# 79. D-076: Market-Family Validation Is Strict and Three-State

**Status:** APPROVED

Market-family validation compares only authoritative normalized facts and returns `compatible`, `incompatible`, or `unknown`. It verifies the requested contract relationship, event identity when required, underlying, reference asset, resolution mechanism, stated resolution source, stated rule text, resolution end timestamp, and YES/NO labels. A missing fact remains unknown; it is not treated as a match. Titles, slugs, categories, and ticker-like text are not validation evidence. Gamma's current missing reference-asset field must be enriched from an approved source before a fully compatible family can be established.

---

# 80. D-077: CLOB Dynamic Parameters Come From Public Order Books

**Status:** APPROVED

The TODO-012 adapter uses the current `@polymarket/client` public-client methods `fetchOrderBook`, `fetchMidpoint`, and `fetchSpread`. Although the archived agent-skills snapshot shows standalone tick-size and negative-risk reads in an older CLOB client pattern, the installed current public-client type does not expose those methods. Tick size, minimum order size, and negative-risk status are therefore preserved only when present in the public order-book response; otherwise they remain null. No authenticated client is introduced to obtain them.

---

# 81. D-078: Read-Only Market WebSocket Adapter

**Status:** APPROVED

The market WebSocket adapter connects to the public endpoint `wss://ws-subscriptions-clob.polymarket.com/ws/market`. It manages subscriptions by asset IDs (token IDs), sends mandatory 10-second `PING` heartbeats, and normalizes supported public events (`book`, `price_change`, `last_trade_price`, `tick_size_change`, `best_bid_ask`, `new_market`, and `market_resolved`). Unknown events are explicitly preserved as `MarketUnknownEvent`, and malformed payloads are classified as `MarketMalformedEvent`. The adapter is strictly read-only, constructs no `SecureClient`, performs no user streaming or order management, and does not mutate canonical market identities.

---

# 82. Decision Change Protocol

When an approved decision needs to change:

```text
Existing Decision
      ↓
Reason for Reconsideration
      ↓
Evidence
      ↓
Alternative
      ↓
Human Review
      ↓
New Decision
      ↓
Update Documentation
```

The previous decision must not simply disappear from the project history.

---

# 83. Decision Integrity Rule

The AI agent must not silently change an approved decision because:

* A different implementation is easier.
* A third-party repository does something differently.
* A newer idea appears attractive.
* A shortcut would reduce development time.

Material changes require evidence and appropriate approval.

---

# 84. Final Decision Principle

The project follows:

> **Evidence before assumption, execution before profit claims, and human authority before live capital.**

The bot is being built as a research and execution system whose profitability must be demonstrated rather than assumed.

---

# 85. Decision Register Summary

| ID    | Decision                        | Status             |
| ----- | ------------------------------- | ------------------ |
| D-001 | Research-first development      | Approved           |
| D-002 | Profitability not assumed       | Approved           |
| D-003 | Four initial alpha areas        | Approved           |
| D-004 | BTC 5m research priority        | Research-dependent |
| D-005 | Verify actual resolution source | Approved           |
| D-006 | No fixed lead-lag assumption    | Approved           |
| D-008 | TypeScript-first application    | Approved           |
| D-009 | Python for research             | Approved           |
| D-010 | Rust specialized only           | Approved           |
| D-012 | CLOB V2                         | Approved           |
| D-013 | Dynamic market parameters       | Approved           |
| D-015 | Strategy/execution separation   | Approved           |
| D-016 | Independent risk layer          | Approved           |
| D-018 | Theoretical vs executable edge  | Approved           |
| D-021 | Execution simulation            | Approved           |
| D-022 | Depth-aware execution           | Approved           |
| D-026 | Reconciliation                  | Approved           |
| D-027 | PostgreSQL operational data     | Approved           |
| D-028 | Parquet/DuckDB research data    | Approved           |
| D-030 | Modular architecture            | Approved           |
| D-032 | Research/live isolation         | Approved           |
| D-033 | Human live authorization        | Approved           |
| D-037 | Wallet intelligence is research | Approved           |
| D-040 | Competition modeling            | Approved           |
| D-042 | Market-family validation        | Approved           |
| D-047 | Edge attribution                | Approved           |
| D-048 | Free infrastructure first       | Approved           |
| D-053 | Monitoring is core              | Approved           |
| D-057 | Unknown remains unknown         | Approved           |
| D-058 | Execution-aware backtesting     | Approved           |
| D-059 | Reproducible research           | Approved           |
| D-060 | Preserve negative results       | Approved           |
| D-065 | Agent must not guess            | Approved           |
| D-066 | Official sources prioritized    | Approved           |
| D-068 | No premature microservices      | Approved           |
| D-075 | Project-state separation        | Approved           |
| D-076 | Strict market-family validation | Approved           |
| D-077 | Public order-book dynamic fields | Approved          |
| D-078 | Read-only market WebSocket      | Approved           |

---

# 86. Completion Criteria

This document is complete when:

* Major architecture decisions are recorded.
* Technology decisions are recorded.
* Polymarket integration decisions are recorded.
* Research decisions are recorded.
* Execution decisions are recorded.
* Risk decisions are recorded.
* Infrastructure decisions are recorded.
* Agent authority decisions are recorded.
* Important non-assumptions are recorded.
* Decision changes have a defined process.
* The decision register can be used to identify when new implementation behavior conflicts with an approved decision.

---

# 87. Next Document

The next document is:

```text
docs/project-state/TODO.md
```

It will convert the remaining work into an ordered project backlog covering research, implementation, testing, execution simulation, paper trading, infrastructure, monitoring, and eventual controlled live deployment.
