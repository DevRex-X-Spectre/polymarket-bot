# Polymarket Trading Bot

## Project TODO

**Document:** `docs/project-state/TODO.md`
**Status:** Active
**Document Type:** Project Backlog
**Last Updated:** 2026-09-13 (TODO-012 read-only CLOB REST adapter implemented)

---

# 1. Purpose

This document contains the ordered work required to move the Polymarket trading bot from its current research and documentation phase toward controlled live operation.

The backlog is intentionally ordered by dependency.

A later task should not be treated as ready simply because it appears in this document. Its prerequisites must be satisfied first.

---

# 2. Current Project Position

The project is currently in:

```text
Research
Architecture
Documentation
Repository foundation (Phase 0 completed)
Configuration isolation (Phase 1 completed)
Gamma market discovery (TODO-008 completed)
Market identity types (TODO-009 completed)
Resolution metadata extraction (TODO-010 completed)
```

The following are established:

* Project charter
* Requirements
* System architecture
* Technical stack
* Data architecture
* Polymarket integration specification
* Market data specification
* Trading and execution specification
* Strategy framework
* Alpha research framework
* Signal and edge framework
* Research and backtesting specification
* Execution simulation specification
* Risk and safety specification
* Development and deployment specification
* Monitoring and operations specification
* Engineering standards
* Testing and CI/CD standards
* Agent contract
* Agent operating protocol
* Agent skills
* Current project state
* Decision register

Live trading is **not active**.

---

# 3. Backlog Status Definitions

Each task may use one of the following states:

```text
NOT STARTED
IN PROGRESS
BLOCKED
READY FOR REVIEW
COMPLETED
DEFERRED
CANCELLED
```

---

# 4. Phase 0: Repository Foundation

## TODO-001: Create Repository Structure

**Status:** COMPLETED

Create the initial project structure according to the approved architecture.

Expected logical areas include:

```text
apps/
packages/
research/
data/
scripts/
tests/
docs/
```

The exact internal structure should follow the implementation needs without creating unnecessary abstractions.

### Acceptance Criteria

* Repository structure exists.
* Domain boundaries are clear.
* Research code is separated from production trading code.
* Documentation remains under `/docs`.
* No live trading capability exists by default.

---

## TODO-002: Initialize TypeScript Application

**Status:** COMPLETED

Initialize the primary TypeScript application using the approved runtime direction.

Requirements:

* Node.js >= 24
* pnpm >= 10
* Strict TypeScript configuration
* Deterministic dependency installation
* Environment-aware configuration

### Acceptance Criteria

* Application builds successfully.
* Type checking passes.
* Tests can execute.
* Configuration loads safely.
* No credentials are required for basic startup.

---

## TODO-003: Initialize Python Research Environment

**Status:** COMPLETED

Create the isolated Python environment for research and quantitative analysis.

### Acceptance Criteria

* Research environment is reproducible.
* Dependencies are versioned.
* Research scripts cannot submit live orders.
* Research datasets can be accessed independently of the trading runtime.

---

## TODO-004: Initialize Testing Infrastructure

**Status:** COMPLETED

Establish the test structure before significant trading logic is implemented.

Include appropriate support for:

* Unit tests
* Integration tests
* Contract tests
* State-machine tests
* Data validation tests
* Financial calculations
* Research validation

### Acceptance Criteria

* Tests run locally.
* Tests run in CI.
* Failure prevents inappropriate deployment.
* Live credentials are unavailable to ordinary test execution.

---

# 5. Phase 1: Configuration and Environment Isolation

## TODO-005: Implement Environment Configuration

**Status:** COMPLETED

Implement explicit configuration for:

```text
research
paper
live
```

Configuration must not silently fall back to live behavior.

### Acceptance Criteria

* Research is the safest default.
* Paper mode cannot submit live orders.
* Live mode requires explicit activation.
* Invalid configuration fails closed.

---

## TODO-006: Implement Secret Management

**Status:** COMPLETED

Create secure handling for:

* API credentials
* Wallet signing material
* Database credentials
* Deployment secrets
* External data credentials where required

Private keys must never be committed to Git.

### Acceptance Criteria

* Secrets are loaded through approved mechanisms.
* Secrets are excluded from logs.
* Secrets are excluded from test fixtures.
* CI cannot accidentally expose live credentials.

---

## TODO-007: Implement Configuration Validation

**Status:** COMPLETED

Validate configuration before application startup.

Validation must identify:

* Missing required configuration
* Invalid values
* Environment mismatches
* Live-mode safety violations
* Unsupported settings

---

# 6. Phase 2: Polymarket Market Discovery

## TODO-008: Implement Gamma Market Discovery

**Status:** COMPLETED

Integrate the approved Gamma market discovery interface.

**Implementation notes (2026-09-13):** Use official `@polymarket/client` `createPublicClient()`. Verified sources: [docs.polymarket.com/market-data/discover-markets](https://docs.polymarket.com/market-data/discover-markets), [docs.polymarket.com/market-data/market-details](https://docs.polymarket.com/market-data/market-details), [Polymarket/ts-sdk packages/client](https://github.com/Polymarket/ts-sdk). Public Gamma base URL: `https://gamma-api.polymarket.com`. Do not construct a SecureClient. Do not add order APIs. Normalize SDK events/markets into internal identity types (TODO-009). Unit tests must mock the client; live network tests must be opt-in.

**Completed (2026-09-13):** `packages/polymarket` wraps `createPublicClient()` only. `packages/market-models` holds identity types. Live HTTP test is opt-in via `POLYMARKET_BOT_LIVE_NETWORK_TESTS=true`.

The system should discover relevant markets without assuming a fixed market identifier.

---

## TODO-009: Implement Market Identity

**Status:** COMPLETED

Create the canonical internal representation of a Polymarket market.

It should preserve the information required to uniquely identify and reason about the market.

**Completed (2026-09-13):** `packages/market-models` defines `MarketIdentity`, `EventIdentity`, outcome token ids, Gamma lifecycle status, and discovery records. Identity is not tradability. Full market state (orderbook, CLOB constraints) remains TODO-027. Resolution-rule extraction remains TODO-010.

---

## TODO-010: Implement Resolution Metadata Extraction

**Status:** COMPLETED

Extract and normalize the market's resolution information.

For relevant markets, identify:

* Resolution source
* Resolution condition
* Outcome semantics
* Relevant reference asset
* Relevant timestamps

### Acceptance Criteria

The system must be able to answer:

> What exactly determines the outcome of this market?

before a strategy treats the market as eligible.

**Completed (2026-09-13):** `extractMarketResolution()` records stated Gamma/SDK source, description-as-rule-text, YES/NO labels, timing, UMA status, and evidence field paths. Missing or conflicting sources stay unknown. Title/slug are not used as substitutes. `referenceAsset` is always null until an official field exists. Gamma `closed` is not mapped to resolved. Resolution validation does not imply tradability.

---

## TODO-011: Implement Market Family Validation

**Status:** COMPLETED

Create the market-family validation layer.

It must verify compatibility before comparing markets for structural relationships.

**Completed (2026-09-13):** `validateMarketFamily()` in `packages/market-models` compares a requested `same-contract` or `distinct-contract` relationship, required event id, authoritative normalized underlying/reference asset facts, resolution mechanism/source/rule text/end timestamp, and YES/NO labels. Each field reports `match`, `mismatch`, or `unknown`; the aggregate result is `compatible`, `incompatible`, or `unknown`. The validator does not use title, slug, category, or ticker-like text and does not mutate either market identity. Gamma's absent reference-asset field remains explicitly unknown unless a caller supplies facts from an approved authoritative source.

---

# 7. Phase 3: CLOB Market Data

## TODO-012: Implement CLOB REST Adapter

**Status:** COMPLETED

Implement the read-only market-data integration required for:

* Orderbooks
* Prices
* Market information
* Dynamic trading parameters

**Completed (2026-09-13):** `createClobMarketData()` uses the existing official `@polymarket/client` public client to call only `fetchOrderBook`, `fetchMidpoint`, and `fetchSpread`. It normalizes token-keyed order books, optional midpoint/spread, and book-provided minimum order size, tick size, and negative-risk status into internal adapter types. Invalid CLOB responses fail as `MarketDataError`; unavailable optional price fields remain null. No authenticated client, orders, or streaming support was added.

---

## TODO-013: Implement Market WebSocket Adapter

**Status:** NOT STARTED

Implement the market WebSocket integration.

Support the required market events including:

* Book updates
* Price changes
* Last trade price
* Tick-size changes
* Best bid/ask
* New market events
* Market resolution events

---

## TODO-014: Implement Snapshot + Stream Recovery

**Status:** NOT STARTED

The market-state system must be able to:

```text
REST Snapshot
→ WebSocket Updates
→ Detect Gap
→ Recover
```

---

## TODO-015: Implement Market Data Freshness

**Status:** NOT STARTED

Track freshness for all strategy-critical data.

The system must distinguish:

```text
Fresh
Stale
Missing
Invalid
Unknown
```

---

## TODO-016: Implement Orderbook Reconstruction

**Status:** NOT STARTED

Build an internal orderbook representation capable of supporting:

* Best bid
* Best ask
* Spread
* Depth
* VWAP
* Available liquidity

---

## TODO-017: Implement Tick-Size and Minimum-Order Updates

**Status:** NOT STARTED

Ensure that changing market parameters are reflected in the current market state.

Stale parameters must not be used for order submission.

---

# 8. Phase 4: External BTC Data

## TODO-018: Implement External BTC Feed

**Status:** NOT STARTED

Integrate the selected external BTC market feed for research.

The feed must preserve event timestamps and receipt timestamps.

---

## TODO-019: Implement Resolution-Source Data

**Status:** NOT STARTED

Integrate the appropriate resolution-source data required for BTC market research.

The implementation must not assume that the external predictive feed is the same as the market's resolution source.

---

## TODO-020: Build BTC Lead-Lag Dataset

**Status:** NOT STARTED

Create the dataset required to investigate:

```text
External BTC movement
vs
Polymarket BTC pricing
vs
Resolution reference
```

Measure the relationship rather than assuming it.

---

## TODO-021: Measure Lead-Lag Stability

**Status:** NOT STARTED

Evaluate lead-lag across:

* Different markets
* Different time periods
* Different volatility regimes
* Different liquidity conditions
* Different times to resolution

---

## TODO-022: Evaluate Candidate BTC Windows

**Status:** NOT STARTED

Research the candidate windows:

```text
180–60s
60–20s
20–5s
```

Determine whether any demonstrate statistically and economically meaningful behavior.

These remain hypotheses until validated.

---

# 9. Phase 5: Data Storage

## TODO-023: Implement PostgreSQL Schema

**Status:** NOT STARTED

Create the initial relational schema for:

* Markets
* Market metadata
* Wallets
* Signals
* Opportunities
* Orders
* Fills
* Positions
* Balances
* PnL
* Strategy state
* Experiments

---

## TODO-024: Implement Research Dataset Storage

**Status:** NOT STARTED

Implement Parquet-based storage for high-frequency research data.

---

## TODO-025: Configure DuckDB Research Access

**Status:** NOT STARTED

Provide reproducible analytical access to research datasets through DuckDB.

---

## TODO-026: Implement Data Lineage

**Status:** NOT STARTED

Track enough information to identify:

```text
Source
→ Dataset
→ Transformation
→ Feature
→ Signal
→ Decision
→ Result
```

---

# 10. Phase 6: Truth Layer and Market State

## TODO-027: Implement Canonical Market State

**Status:** NOT STARTED

Create the internal market-state representation used by strategies and execution.

---

## TODO-028: Implement Data Quality Checks

**Status:** NOT STARTED

Detect:

* Missing data
* Duplicate events
* Out-of-order events
* Stale data
* Invalid prices
* Invalid market state

---

## TODO-029: Implement Event-Time Handling

**Status:** NOT STARTED

Preserve:

* Event time
* Receipt time
* Processing time

Additional execution timestamps will be added when the order lifecycle is implemented.

---

# 11. Phase 7: Research Framework

## TODO-030: Implement Experiment Framework

**Status:** NOT STARTED

Create a standard experiment structure containing:

* Hypothesis
* Dataset
* Dataset version
* Features
* Parameters
* Method
* Results
* Conclusion

---

## TODO-031: Implement Research Dataset Versioning

**Status:** NOT STARTED

Ensure that research results can be reproduced against the dataset version used to generate them.

---

## TODO-032: Implement No-Trade Research

**Status:** NOT STARTED

Record opportunities that were observed but intentionally not traded.

Classify why:

* Insufficient edge
* Insufficient liquidity
* Excessive spread
* Stale data
* Excessive latency risk
* Risk rejection
* Expired opportunity
* Invalid market
* Other approved reason

---

# 12. Phase 8: BTC Strategy Research

## TODO-033: Implement BTC Feature Pipeline

**Status:** NOT STARTED

Candidate features include:

* External BTC price movement
* Short-term momentum
* Short-term reversal
* Realized volatility
* Orderbook imbalance
* Spread
* Depth
* Time to resolution
* Opening/reference price
* Lead-lag relationship

Features must be validated before strategy use.

---

## TODO-034: Research BTC Fair Probability

**Status:** NOT STARTED

Develop and test methods for estimating the probability of the relevant BTC market outcome.

The method must be evaluated against historical outcomes.

---

## TODO-035: Research BTC Net Edge

**Status:** NOT STARTED

Estimate:

```text
Fair Probability
→ Market Price
→ Execution Cost
→ Net Expected Edge
```

---

## TODO-036: Test BTC Regimes

**Status:** NOT STARTED

Evaluate whether the observed BTC relationship changes under different market conditions.

---

## TODO-037: Test BTC Execution Sensitivity

**Status:** NOT STARTED

Measure whether the observed BTC edge survives realistic:

* Latency
* Slippage
* Fees
* Fill probability
* Opportunity decay

---

# 13. Phase 9: Wallet Intelligence

## TODO-038: Implement Wallet Activity Ingestion

**Status:** NOT STARTED

Collect relevant wallet activity using approved Polymarket data sources.

---

## TODO-039: Implement Address Classification

**Status:** NOT STARTED

Classify observed addresses where sufficient evidence exists.

---

## TODO-040: Implement FIFO Position Reconstruction

**Status:** NOT STARTED

Build wallet-level historical position reconstruction.

---

## TODO-041: Implement Wallet Performance Analysis

**Status:** NOT STARTED

Calculate relevant historical metrics including:

* Realized PnL
* Holding time
* Trade count
* Profit factor
* Drawdown
* Entry quality
* Exit quality

---

## TODO-042: Implement Copyability Analysis

**Status:** NOT STARTED

Evaluate whether wallet behavior remains profitable after accounting for:

* Delay
* Liquidity
* Spread
* Slippage
* Execution availability

---

## TODO-043: Implement Behavioral Classification

**Status:** NOT STARTED

Investigate whether wallet behavior resembles:

* Directional trading
* Market making
* Hedging
* Arbitrage
* Averaging
* Structural strategies
* Unknown

---

# 14. Phase 10: Market Dislocation Research

## TODO-044: Implement Market-Family Comparison

**Status:** NOT STARTED

Build tools to compare compatible markets within validated market families.

---

## TODO-045: Detect Structural Dislocations

**Status:** NOT STARTED

Identify potentially inconsistent prices or relationships.

---

## TODO-046: Distinguish Theoretical and Executable Dislocation

**Status:** NOT STARTED

Every detected dislocation must be evaluated against:

* Liquidity
* Depth
* Fees
* Slippage
* Timing
* Multi-leg execution
* Opportunity decay

---

## TODO-047: Research Maker-Side Pair Patterns

**Status:** NOT STARTED

Investigate repeated same-maker activity across complementary outcomes.

Do not interpret the behavior as directional without evidence.

---

# 15. Phase 11: Competition Intelligence

## TODO-048: Implement Execution Density Analysis

**Status:** NOT STARTED

Measure how concentrated execution activity is around identified opportunities.

---

## TODO-049: Implement Repeat-Taker Analysis

**Status:** NOT STARTED

Identify recurring execution patterns while respecting address classification.

---

## TODO-050: Implement Competition Metrics

**Status:** NOT STARTED

Research metrics including:

* Taker concentration
* HHI
* Maker activity
* Repeat participants
* Execution density
* Market crowding

---

## TODO-051: Implement Opportunity Capture Probability

**Status:** NOT STARTED

Estimate the probability that a detected opportunity can actually be captured.

---

# 16. Phase 12: Signal Framework

## TODO-052: Implement Signal Contract

**Status:** NOT STARTED

Standardize signal output across strategies.

Signals should contain enough information to identify:

* Strategy
* Market
* Direction
* Signal timestamp
* Freshness
* Strength
* Confidence
* Fair value/probability
* Expiration
* Invalidation
* Evidence

---

## TODO-053: Implement Signal Normalization

**Status:** NOT STARTED

Normalize heterogeneous strategy outputs into a common representation.

---

## TODO-054: Implement Signal Expiration

**Status:** NOT STARTED

Signals must become invalid when their underlying information is no longer fresh.

---

# 17. Phase 13: Signal Fusion and Edge

## TODO-055: Implement Fair Value Layer

**Status:** NOT STARTED

Create the common layer through which strategies can express estimated fair probability or fair value.

---

## TODO-056: Implement Theoretical Edge

**Status:** NOT STARTED

Calculate the difference between estimated fair value and market value before execution costs.

---

## TODO-057: Implement Execution-Aware Edge

**Status:** NOT STARTED

Adjust theoretical edge for:

* Fees
* Spread
* Slippage
* Fill probability
* Latency
* Opportunity decay

---

## TODO-058: Implement Signal Fusion

**Status:** NOT STARTED

Combine validated signals while avoiding double-counting correlated information.

---

## TODO-059: Implement Edge Attribution

**Status:** NOT STARTED

Track which signal or alpha component contributed to the final trading decision and eventual outcome.

---

# 18. Phase 14: Execution Engine

## TODO-060: Implement Execution Intent

**Status:** NOT STARTED

Strategies must produce execution intent rather than directly submitting orders.

---

## TODO-061: Implement Risk Approval Interface

**Status:** NOT STARTED

Every live execution intent must pass through the risk boundary.

---

## TODO-062: Implement Dynamic Market Validation

**Status:** NOT STARTED

Validate current:

* Market status
* Tick size
* Minimum order size
* Fees
* Resolution state
* Liquidity

before execution.

---

## TODO-063: Implement Price Protection

**Status:** NOT STARTED

Every order must have an explicit maximum acceptable execution price or equivalent protection.

---

## TODO-064: Implement Order Types

**Status:** NOT STARTED

Support the required execution behavior for:

* GTC
* GTD
* FOK
* FAK
* Post-only

Only order types required by validated strategies need to be activated.

---

## TODO-065: Implement Order State Machine

**Status:** NOT STARTED

Track the complete lifecycle of orders.

---

## TODO-066: Implement User Trade Lifecycle

**Status:** NOT STARTED

Support relevant states including:

```text
MATCHED
MINED
CONFIRMED
RETRYING
FAILED
```

---

## TODO-067: Implement Cancellation

**Status:** NOT STARTED

Implement controlled order cancellation and verification.

---

## TODO-068: Implement Unknown-State Reconciliation

**Status:** NOT STARTED

If an order's final state is uncertain, reconcile against authoritative exchange data before taking further action.

---

# 19. Phase 15: Execution Simulation

## TODO-069: Implement Historical Orderbook Replay

**Status:** NOT STARTED

Replay historical orderbook states for execution research.

---

## TODO-070: Implement Latency Model

**Status:** NOT STARTED

Model:

* Signal generation delay
* Processing delay
* Network delay
* Exchange arrival timing

Latency distributions must be measured or explicitly modeled rather than invented.

---

## TODO-071: Implement Queue Model

**Status:** NOT STARTED

For passive execution research, model queue position and uncertainty where sufficient data exists.

---

## TODO-072: Implement Partial-Fill Simulation

**Status:** NOT STARTED

Support partial fills and remaining order behavior.

---

## TODO-073: Implement Sequential and Parallel Multi-Leg Simulation

**Status:** NOT STARTED

Compare both execution approaches under realistic conditions.

---

## TODO-074: Implement Opportunity Decay Simulation

**Status:** NOT STARTED

Measure whether opportunities survive the simulated execution path.

---

## TODO-075: Implement Capture Probability

**Status:** NOT STARTED

Estimate:

```text
Detected Opportunities
vs
Executable Opportunities
vs
Actually Captured Opportunities
```

---

# 20. Phase 16: Portfolio and PnL

## TODO-076: Implement Position Ledger

**Status:** NOT STARTED

Maintain authoritative internal position state.

---

## TODO-077: Implement Balance Tracking

**Status:** NOT STARTED

Track available and committed capital.

---

## TODO-078: Implement Fill-Based PnL

**Status:** NOT STARTED

Calculate PnL from authoritative fills rather than strategy estimates.

---

## TODO-079: Implement Fee Accounting

**Status:** NOT STARTED

Record applicable execution fees separately and incorporate them into net PnL.

---

## TODO-080: Implement PnL Reconciliation

**Status:** NOT STARTED

Reconcile internal PnL against available authoritative account information.

---

# 21. Phase 17: Risk Engine

## TODO-081: Implement Hierarchical Risk Engine

**Status:** NOT STARTED

Implement the approved hierarchy:

```text
Global
→ Strategy
→ Market
→ Trade
→ Order
```

---

## TODO-082: Implement Capital and Exposure Checks

**Status:** NOT STARTED

Validate:

* Available capital
* Existing exposure
* Outstanding orders
* Position concentration

---

## TODO-083: Implement Liquidity and Slippage Checks

**Status:** NOT STARTED

Reject trades where execution conditions do not satisfy the approved requirements.

---

## TODO-084: Implement Stale-Data Protection

**Status:** NOT STARTED

Reject or suspend execution when strategy-critical data is stale or invalid.

---

## TODO-085: Implement Resolution-Proximity Protection

**Status:** NOT STARTED

Prevent inappropriate execution near resolution when the strategy's validated operating conditions are no longer satisfied.

---

## TODO-086: Implement Global Kill Switch

**Status:** NOT STARTED

Implement a mechanism capable of stopping new trading activity.

---

## TODO-087: Implement Strategy-Level Disable

**Status:** NOT STARTED

Allow an unhealthy strategy to be disabled without necessarily stopping the entire system.

---

# 22. Phase 18: Paper Trading

## TODO-088: Implement Paper Execution

**Status:** NOT STARTED

Paper mode must simulate execution without submitting live orders.

---

## TODO-089: Implement Paper Portfolio

**Status:** NOT STARTED

Track:

* Simulated positions
* Simulated fills
* Simulated fees
* Simulated PnL
* Drawdown
* Exposure

---

## TODO-090: Compare Paper vs Simulation

**Status:** NOT STARTED

Measure the difference between:

```text
Historical Simulation
vs
Live Market Paper Execution
```

---

# 23. Phase 19: Strategy Validation

## TODO-091: Define Strategy Promotion Evidence

**Status:** NOT STARTED

Establish evidence requirements for moving a strategy between:

```text
Research
→ Paper
→ Controlled Live
```

The thresholds must be approved based on evidence rather than invented.

---

## TODO-092: Validate Out-of-Sample Performance

**Status:** NOT STARTED

Ensure strategy results are not based solely on data used to develop the strategy.

---

## TODO-093: Validate Regime Robustness

**Status:** NOT STARTED

Test performance across different market conditions.

---

## TODO-094: Validate Execution Robustness

**Status:** NOT STARTED

Test whether the strategy remains viable under realistic execution degradation.

---

## TODO-095: Validate Cost-Adjusted Profitability

**Status:** NOT STARTED

Evaluate performance after:

* Fees
* Slippage
* Latency
* Partial fills
* Missed opportunities

---

# 24. Phase 20: Monitoring

## TODO-096: Implement Health Checks

**Status:** NOT STARTED

Implement:

```text
Liveness
Readiness
Trading Readiness
```

---

## TODO-097: Implement Market Data Monitoring

**Status:** NOT STARTED

Monitor:

* WebSocket connectivity
* Data freshness
* Missing events
* Book consistency
* External feed health

---

## TODO-098: Implement Execution Monitoring

**Status:** NOT STARTED

Monitor:

* Order latency
* Fill rate
* Partial fills
* Rejections
* Cancellation
* Unknown states

---

## TODO-099: Implement Risk Monitoring

**Status:** NOT STARTED

Monitor:

* Exposure
* Concentration
* Strategy status
* Kill switch state
* Risk rejections

---

## TODO-100: Implement Portfolio Monitoring

**Status:** NOT STARTED

Monitor:

* Positions
* Balances
* PnL
* Reconciliation
* Drawdown

---

# 25. Phase 21: Audit and Operations

## TODO-101: Implement Structured Logging

**Status:** NOT STARTED

Logs must contain sufficient context to reconstruct important decisions and failures.

---

## TODO-102: Implement Correlation IDs

**Status:** NOT STARTED

Trace:

```text
Signal
→ Opportunity
→ Risk Decision
→ Order
→ Fill
→ Position
→ PnL
```

---

## TODO-103: Implement Incident Recording

**Status:** NOT STARTED

Record operational incidents including:

* Data outages
* Execution failures
* Risk events
* Reconciliation failures
* Infrastructure failures

---

## TODO-104: Create Operational Runbooks

**Status:** NOT STARTED

Document responses to common failures.

---

# 26. Phase 22: Deployment

## TODO-105: Create Docker Deployment

**Status:** NOT STARTED

Containerize the runtime components.

---

## TODO-106: Configure CI/CD

**Status:** NOT STARTED

Implement:

```text
Commit
→ Tests
→ Build
→ Security Checks
→ Deployment
→ Health Verification
```

---

## TODO-107: Deploy Paper Environment

**Status:** NOT STARTED

Deploy the system in paper mode.

---

## TODO-108: Establish Persistent Runtime

**Status:** NOT STARTED

When paper validation requires continuous execution, deploy to the approved long-running infrastructure.

Current candidate:

```text
Oracle Always Free
```

---

## TODO-109: Implement Restart Recovery

**Status:** NOT STARTED

The system must recover safely from:

* Process restart
* Container restart
* VM restart
* WebSocket disconnect
* Network interruption

---

# 27. Phase 23: Controlled Live Readiness

## TODO-110: Complete Live Readiness Review

**Status:** NOT STARTED

Review:

* Strategy evidence
* Execution evidence
* Risk controls
* Monitoring
* Reconciliation
* Infrastructure
* Security
* Recovery
* Agent restrictions

---

## TODO-111: Verify Kill Switch

**Status:** NOT STARTED

Demonstrate that the kill switch prevents new trading activity as designed.

---

## TODO-112: Verify Reconciliation

**Status:** NOT STARTED

Demonstrate reliable reconciliation of:

```text
Orders
Fills
Positions
Balances
PnL
```

---

## TODO-113: Verify Failure Recovery

**Status:** NOT STARTED

Test recovery from relevant operational failures before live activation.

---

## TODO-114: Human Live-Trading Approval

**Status:** NOT STARTED

Live trading must remain disabled until explicit human approval is provided.

---

# 28. Phase 24: Controlled Live Trading

## TODO-115: Activate Live Mode

**Status:** NOT STARTED

Only after all required readiness conditions have been satisfied.

---

## TODO-116: Start With Research Capital

**Status:** NOT STARTED

Use only explicitly approved research capital.

The previously established reference range is:

```text
$20–$50
```

This is not an automatic funding instruction.

---

## TODO-117: Monitor Initial Live Performance

**Status:** NOT STARTED

Monitor:

* Execution
* Slippage
* Fees
* Latency
* PnL
* Risk
* Strategy health
* Reconciliation

---

## TODO-118: Compare Live vs Research Expectations

**Status:** NOT STARTED

Compare:

```text
Backtest
vs
Execution Simulation
vs
Paper Trading
vs
Live Trading
```

Identify where assumptions failed.

---

# 29. Phase 25: Continuous Research

## TODO-119: Maintain Strategy Health

**Status:** NOT STARTED

Continuously evaluate active strategies.

---

## TODO-120: Maintain Edge Attribution

**Status:** NOT STARTED

Determine whether the original source of edge remains responsible for performance.

---

## TODO-121: Monitor Edge Decay

**Status:** NOT STARTED

Measure whether competitors or market changes reduce the available opportunity.

---

## TODO-122: Maintain Research Log

**Status:** NOT STARTED

Every meaningful experiment should produce a reproducible record.

---

## TODO-123: Preserve Failed Strategies

**Status:** NOT STARTED

Record rejected strategies and the evidence supporting their rejection.

---

# 30. Deferred Work

The following areas are intentionally deferred until there is a demonstrated requirement.

## TODO-124: Additional Distributed Infrastructure

**Status:** DEFERRED

Do not introduce distributed infrastructure solely for architectural completeness.

---

## TODO-125: Kubernetes

**Status:** DEFERRED

No current requirement.

---

## TODO-126: Kafka

**Status:** DEFERRED

No current requirement.

---

## TODO-127: Advanced Relayer / Gasless Trading

**Status:** DEFERRED

Use only if a validated product or execution requirement emerges.

---

## TODO-128: Builder Infrastructure

**Status:** DEFERRED

Not part of the initial core trading path unless required.

---

## TODO-129: Additional Rust Services

**Status:** DEFERRED

Introduce only when measured requirements justify specialized Rust components.

---

# 31. Research-Dependent Backlog

The following items cannot be marked complete merely because the code exists.

They require empirical validation.

* BTC lead-lag persistence
* Optimal BTC research window
* External feed selection
* Latency advantage
* Opportunity decay
* Capture probability
* Whale copyability
* Wallet behavioral classification
* Market dislocation profitability
* Maker-side structural strategies
* Tail-entry strategies
* Signal weighting
* Strategy parameter selection
* Cost-adjusted profitability
* Regime stability
* Execution model accuracy

---

# 32. Live Trading Gate

Live trading must not begin merely because implementation is complete.

The following must be satisfied:

```text
Architecture
      ↓
Implementation
      ↓
Testing
      ↓
Historical Research
      ↓
Execution Simulation
      ↓
Paper Trading
      ↓
Risk Validation
      ↓
Operational Validation
      ↓
Human Approval
      ↓
Controlled Live
```

Failure at any critical stage may block promotion.

---

# 33. Development Priority

The immediate implementation order is:

```text
1. Repository foundation
2. Configuration and environment isolation
3. Market discovery
4. Market identity and resolution
5. CLOB market data
6. WebSocket streaming
7. Truth layer
8. PostgreSQL
9. Research data pipeline
10. External BTC data
11. BTC research
12. Backtesting
13. Execution simulation
14. Risk engine
15. Paper trading
16. Portfolio/PnL reconciliation
17. Monitoring
18. Strategy validation
19. Deployment
20. Controlled live readiness
21. Human approval
22. Controlled live trading
```

This order may change only when a documented dependency or research finding justifies the change.

---

# 34. Definition of Done

A TODO item is considered complete only when:

1. Implementation exists where required.
2. Relevant tests pass.
3. Acceptance criteria are satisfied.
4. Documentation is synchronized.
5. No known critical safety issue remains.
6. The current state has been updated.
7. Any important decision has been recorded.
8. The change is traceable to its requirement or approved decision.

---

# 35. Agent Rules for TODO Management

The AI agent must:

* Read the relevant specifications before implementation.
* Confirm dependencies before starting a task.
* Avoid silently skipping blocked prerequisites.
* Mark uncertain work as blocked or research-dependent.
* Update task status honestly.
* Never mark research as complete because code was written.
* Never mark a strategy profitable without evidence.
* Never activate live trading autonomously.
* Never remove a TODO simply because it is inconvenient.
* Update `CURRENT-STATE.md` when project state materially changes.
* Update `CHANGELOG.md` for meaningful completed changes.
* Update `DECISIONS.md` when a new material decision is approved.

---

# 36. Final Backlog Principle

The backlog exists to move the project from:

```text
Research
```

to:

```text
Validated Execution System
```

It does not exist to force the project into live trading.

If research demonstrates that an expected edge does not exist, the correct outcome is to document the result and redirect development.

A completed backlog is not the objective.

A **validated, safe, observable, and executable trading system** is the objective.

---

# 37. Next Document

The final project-state document is:

```text
docs/project-state/CHANGELOG.md
```

It will record the historical evolution of the project, including the transition from research and architecture into implementation and future controlled trading.
