# Polymarket Trading Bot

## Data Architecture

**Document:** `docs/04-data-architecture.md`
**Status:** Approved
**Document Type:** Data Architecture Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`

---

# 1. Purpose

This document defines the data architecture of the Polymarket Trading Bot.

It establishes:

* What data the system collects
* Where each type of data is stored
* Which data is authoritative
* Which data is derived
* How market data is normalized
* How trading state is persisted
* How research data is separated from operational data
* How historical data is retained
* How data quality is enforced
* How data is used for backtesting and execution analysis

The objective is to ensure that the trading system can reconstruct what happened, explain why a trade was taken, and distinguish observed facts from derived assumptions.

---

# 2. Core Data Principle

The system must preserve the distinction between:

```text
OBSERVED DATA
      ↓
NORMALIZED DATA
      ↓
DERIVED DATA
      ↓
SIGNALS
      ↓
DECISIONS
      ↓
EXECUTION
      ↓
OUTCOMES
```

The system must never treat a derived value as if it were an original observation.

For example:

```text
Observed:
BTC price = X

Derived:
BTC 10-second return = Y

Derived:
BTC momentum signal = Z

Decision:
Trade probability = P

Execution:
Order submitted at price Q

Outcome:
Filled quantity = N
```

Each layer must remain traceable.

---

# 3. Data Architecture Principles

The data architecture follows these principles:

1. Store raw information where it has research or audit value.
2. Normalize external data before using it in strategies.
3. Preserve timestamps and source information.
4. Never overwrite historical observations merely because newer data exists.
5. Separate operational state from research datasets.
6. Treat market identity and resolution rules as first-class data.
7. Record enough information to reproduce a trading decision.
8. Store execution events independently from strategy signals.
9. Reconcile internal state against external sources.
10. Prefer explicit data lineage over hidden transformations.

---

# 4. Data Domains

The system is divided into the following data domains:

```text id="8i1j4m"
Market Data
    │
    ├── Market Metadata
    ├── Orderbook
    ├── Prices
    ├── Trades
    └── Resolution

External Market Data
    │
    ├── BTC
    ├── Chainlink-related data
    └── Other approved sources

Wallet Intelligence
    │
    ├── Wallets
    ├── Transactions
    ├── Fills
    ├── Positions
    └── Behavioral Features

Strategy Data
    │
    ├── Features
    ├── Signals
    ├── Opportunities
    ├── Strategy Decisions
    └── Experiments

Execution Data
    │
    ├── Orders
    ├── Order Events
    ├── Fills
    ├── Fees
    └── Execution Metrics

Portfolio Data
    │
    ├── Positions
    ├── Balances
    ├── Realized PnL
    ├── Unrealized PnL
    └── Exposure

Operational Data
    │
    ├── Health
    ├── Errors
    ├── Configuration
    └── Audit Events
```

---

# 5. Data Storage Architecture

The initial storage architecture is:

```text id="z6j3rq"
                    DATA SOURCES
                         │
                         ▼
                  INGESTION LAYER
                         │
                         ▼
                  NORMALIZATION
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       PostgreSQL              Parquet
       Operational Data        Historical Data
              │                     │
              │                     ▼
              │                   DuckDB
              │                     │
              │                     ▼
              │                Research / Analysis
              │
              ▼
        Runtime / Trading
```

---

# 6. PostgreSQL

PostgreSQL is the primary operational database.

It stores durable structured information required by the application.

Examples include:

* Markets
* Market identities
* Resolution information
* Wallets
* Orders
* Fills
* Positions
* Signals
* Opportunities
* Strategy decisions
* PnL
* Risk events
* Configuration metadata
* Experiment metadata
* Audit records

---

# 7. Parquet

Parquet is used for high-volume analytical datasets.

It is particularly appropriate for:

* Orderbook events
* High-frequency price data
* BTC market data
* Chainlink-related datasets
* WebSocket events
* Historical snapshots
* Backtest datasets
* Research experiments

Parquet datasets should be partitioned in a way that supports efficient historical analysis.

Possible partition dimensions include:

```text
date
market
asset
source
dataset type
```

The exact partitioning should be determined by actual query patterns.

---

# 8. DuckDB

DuckDB provides the analytical query layer over research data.

Typical workflow:

```text id="j4v4tg"
Raw Historical Data
        ↓
Parquet
        ↓
DuckDB
        ↓
Research Query
        ↓
Backtest / Analysis
```

DuckDB should not be used as the authoritative operational state store for live trading.

---

# 9. Redis

Redis may be used for transient runtime state.

Potential uses include:

* Cached market state
* Temporary coordination
* Short-lived locks
* Rate-control state
* Fast lookup data
* Runtime coordination

Redis must not become the only location containing information required to recover trading state after a restart.

---

# 10. Source-of-Truth Hierarchy

Different information has different authoritative sources.

The system must maintain an explicit hierarchy.

Conceptually:

```text id="jv5x5m"
External Source
      ↓
Raw Observation
      ↓
Normalized Record
      ↓
Derived State
      ↓
Strategy Interpretation
```

For Polymarket information, the relevant official source depends on the data being requested.

Examples:

```text
Market metadata
→ Gamma / CLOB

Orderbook
→ CLOB

Real-time market events
→ CLOB WebSocket

User order/trade events
→ User WebSocket

Account / activity information
→ Data API / authenticated interfaces

On-chain state
→ Blockchain / appropriate subgraph

Resolution information
→ Market resolution source / resolution data
```

No single endpoint should be assumed to be authoritative for every data domain.

---

# 11. Market Identity

Market identity is one of the most important data structures in the system.

Every market record must preserve enough information to identify the exact market being traded or analyzed.

Relevant identity fields may include:

* Market identifier
* Condition identifier
* Event identifier
* Token identifiers
* Outcome
* Question
* Slug where applicable
* Market family
* Resolution mechanism
* Resolution source
* Status
* Creation time
* Resolution time

The exact identifiers available from the current Polymarket interfaces must be preserved rather than replaced with internally invented identifiers.

---

# 12. Market Resolution Data

Resolution information must be stored explicitly.

Relevant information includes:

* Resolution mechanism
* Resolution source
* Resolution criteria
* Resolution timestamp
* Reference asset
* Reference price where applicable
* Resolution status
* Final outcome
* Resolution updates

This is particularly important for short-duration BTC markets.

The system must never assume that two markets with similar questions have identical resolution rules.

---

# 13. Market Family

A market family groups markets that may be logically related.

Before two markets are compared, the system must validate:

```text id="5g3q6b"
Same event
Same underlying
Same resolution
Same relevant timestamp
Same asset
Same outcome semantics
```

Similarity of market titles is insufficient.

A market-family relationship must be supported by actual market metadata and resolution semantics.

---

# 14. Orderbook Data

Orderbook records may include:

* Market
* Token
* Timestamp
* Sequence information where available
* Bids
* Asks
* Best bid
* Best ask
* Spread
* Depth
* Tick size
* Minimum order size

For research-grade replay, the system should preserve sufficiently detailed orderbook information to reconstruct executable conditions.

---

# 15. Orderbook Snapshots vs Events

The system must distinguish:

```text
Orderbook Snapshot
```

from:

```text
Orderbook Event
```

A snapshot describes the state at a point in time.

An event describes a change.

Both may be useful.

Snapshots support:

* State recovery
* Periodic analysis
* Simpler historical research

Events support:

* Fine-grained replay
* Opportunity decay analysis
* Execution simulation
* Microstructure research

The storage strategy should preserve whichever level of detail is required by the research objective.

---

# 16. Price Data

Price data must preserve:

* Timestamp
* Source
* Market
* Token
* Price
* Price type

Price type must distinguish values such as:

* Best bid
* Best ask
* Midpoint
* Last trade
* Reference price
* External market price

The system must not treat these values as interchangeable.

---

# 17. Trade Data

Observed trades must preserve sufficient information to reconstruct the event.

Relevant fields include:

* Market
* Token
* Timestamp
* Price
* Quantity
* Side where available
* Maker/taker information where available
* Transaction identifier where available
* Source

Observed trade data must remain separate from the bot's own executed trades.

---

# 18. External BTC Data

BTC data must include:

* Source
* Asset
* Timestamp
* Price
* Bid/ask where available
* Trade information where available
* Market state where relevant

The system should preserve the original source timestamp where available.

It should also record the time at which the bot received the data.

This distinction is critical for latency analysis.

---

# 19. Event Time vs Processing Time

Every latency-sensitive event should distinguish between:

```text id="i1b7s7"
Event Time
```

and:

```text
Receipt Time
```

Where relevant, the system should also record:

```text
Processing Time
Decision Time
Submission Time
Exchange Arrival Time
Fill Time
```

This enables analysis such as:

```text
Market Event
    ↓
Data Receipt
    ↓
Signal
    ↓
Order Submission
    ↓
Exchange Arrival
    ↓
Fill
```

Without these timestamps, execution research becomes unreliable.

---

# 20. Wallet Data

Wallet intelligence requires multiple data layers.

```text id="a1g6i8"
Wallet
  ↓
Observed Activity
  ↓
Trades / Fills
  ↓
Positions
  ↓
Reconstructed Lots
  ↓
Behavioral Features
  ↓
Copyability Analysis
```

The system must preserve the distinction between observed wallet behavior and conclusions about that wallet.

---

# 21. Wallet Classification

Wallets should support classification.

Potential classifications include:

* EOA
* Contract
* CTF Exchange
* Known protocol
* Market maker
* Bot
* Human
* Unknown

Classification must not be treated as certain unless supported by evidence.

Unknown remains a valid classification.

---

# 22. Wallet Activity

Observed wallet activity may include:

* Trades
* Fills
* Transfers
* Position changes
* Split operations
* Merge operations
* Redeem operations
* Other relevant on-chain activity

Only activity relevant to the project's research requirements should be collected.

---

# 23. FIFO Position Reconstruction

Where sufficient fill data exists, the system should support FIFO lot reconstruction.

Conceptually:

```text id="2k3m0r"
Raw Fills
    ↓
Normalize
    ↓
Group by Market / Token
    ↓
FIFO Lots
    ↓
Open Lots
    ↓
Closed Lots
    ↓
Realized PnL
```

This enables:

* Realized PnL
* Holding time
* Entry quality
* Exit quality
* Behavioral analysis

FIFO reconstruction is a derived analytical model and must not be confused with raw exchange records.

---

# 24. Strategy Feature Data

Features are derived observations used by strategies.

Examples include:

* Momentum
* Reversal
* Orderbook imbalance
* Spread
* Depth
* Volatility
* Time to resolution
* External-to-Polymarket price difference
* Lead-lag measurements
* Wallet activity
* Market competition
* Opportunity duration

Every feature must identify:

* Source data
* Calculation method
* Calculation timestamp
* Relevant market
* Feature version where necessary

---

# 25. Signal Data

Signals represent strategy interpretations.

A signal should contain enough information to explain:

* Strategy
* Market
* Direction
* Signal timestamp
* Input features
* Confidence or score where applicable
* Expected probability or fair value
* Expected edge
* Validity period
* Signal status

A signal must not automatically produce an order.

---

# 26. Opportunity Data

An opportunity represents a potentially executable trading condition.

The system must distinguish:

```text id="5sgq7m"
THEORETICAL OPPORTUNITY
```

from:

```text id="3j9c2f"
EXECUTABLE OPPORTUNITY
```

An opportunity may include:

* Detection time
* Market
* Strategy
* Theoretical edge
* Executable edge
* Available liquidity
* Spread
* Estimated slippage
* Fees
* Expected latency
* Opportunity duration
* Competition
* Execution constraints

---

# 27. Opportunity Journal

Every meaningful detected opportunity should be journaled when appropriate.

The journal should allow later analysis of:

* Why the opportunity existed
* Whether it was executable
* Whether the bot acted
* Why it acted or did not act
* What happened afterward
* Whether the estimated edge was correct

This creates a feedback loop between research and production.

---

# 28. Execution Data

Execution data is separate from signal data.

An order record should preserve information such as:

* Internal order ID
* Exchange order ID
* Market
* Token
* Side
* Price
* Quantity
* Order type
* Time-in-force
* Submission timestamp
* Status
* Cancellation status
* Fill status
* Related strategy
* Related signal

---

# 29. Order Lifecycle

The system must preserve order lifecycle events.

Conceptually:

```text id="6n5h0j"
Intent
  ↓
Risk Approved
  ↓
Order Created
  ↓
Submitted
  ↓
Accepted / Rejected
  ↓
Matched / Partially Filled
  ↓
Completed / Cancelled
```

Actual Polymarket order and trade lifecycle events must be mapped into the internal model without losing the original exchange state.

---

# 30. Fill Data

Each fill must be stored independently from the order where possible.

Relevant fields include:

* Order
* Market
* Token
* Price
* Quantity
* Timestamp
* Fee
* Side
* Execution source
* Transaction information where available

Multiple fills may belong to a single order.

---

# 31. Fee Data

Fees must be stored explicitly.

The system must not assume a universal fee rate.

Current Polymarket fee behavior varies by market/category and is determined by the applicable market configuration.

The system must obtain current fee information rather than hardcoding fee assumptions.

---

# 32. Position Data

A position represents current exposure.

Relevant information includes:

* Market
* Token
* Quantity
* Average entry
* Current valuation
* Realized PnL
* Unrealized PnL
* Strategy attribution
* Entry time
* Exposure duration

Position state must be reconstructable from execution history.

---

# 33. Balance Data

Balances should be tracked separately from positions.

The system must distinguish:

```text id="t4m9yy"
Available Balance
Reserved Balance
Position Value
Total Equity
```

The exact balance representation must follow the relevant Polymarket account and collateral model.

---

# 34. PnL Architecture

PnL must be derived from authoritative execution and position data.

The system should distinguish:

* Gross PnL
* Fees
* Slippage
* Net PnL
* Realized PnL
* Unrealized PnL

Where applicable, other execution costs must also be included.

The system must never report gross trading gains as final profitability when fees and execution costs have not been accounted for.

---

# 35. Strategy Attribution

Every production trade should be attributable to:

```text id="f5f8ye"
Strategy
    ↓
Signal
    ↓
Opportunity
    ↓
Order
    ↓
Fill
    ↓
Position
    ↓
PnL
```

This enables measurement of which strategy actually generated the resulting PnL.

---

# 36. Edge Attribution

The system should eventually attribute realized performance to contributing signals.

Potential categories include:

* BTC lead-lag
* Orderbook imbalance
* Whale intelligence
* Market dislocation
* Timing
* Regime
* Competition
* Other approved signal classes

Attribution must be evidence-based.

If multiple signals contributed to a trade, the system must not falsely assign 100% of the outcome to one signal.

---

# 37. Competition Data

Competition intelligence may include:

* Repeat takers
* Maker activity
* Taker concentration
* Fill concentration
* Execution density
* Opportunity survival time
* Market crowding
* Repeat participant behavior

The system must distinguish protocol addresses from actual competitors.

For example, an exchange contract appearing repeatedly in transaction data must not automatically be classified as a competing trading bot.

---

# 38. Copyability Data

A wallet or trader can only be considered potentially copyable after measurable analysis.

Potential metrics include:

* Historical PnL
* Profit factor
* Consistency
* Drawdown
* Trade count
* Holding time
* Entry edge
* Trade size
* Market liquidity
* Spread
* Execution delay sensitivity
* Maker/taker behavior
* Stale trade percentage
* Copyable trade percentage
* Simulated copy PnL

Copyability is a derived research result, not raw wallet data.

---

# 39. Maker Pair Analysis

The system should support research into cases where a participant repeatedly acquires both sides of a market.

Potential analysis includes:

* YES acquisition
* NO acquisition
* Combined VWAP
* Timing
* Liquidity
* Split/merge/redeem behavior

A participant buying both sides must not automatically be interpreted as having directional conviction.

Such behavior may indicate structural or settlement-oriented strategies.

---

# 40. Research Dataset Structure

Research datasets should preserve reproducibility.

A dataset should identify:

* Dataset name
* Source
* Collection period
* Markets included
* Data version
* Transformation version
* Generation timestamp
* Relevant configuration
* Known limitations

Research results must be reproducible from documented inputs wherever practical.

---

# 41. Backtest Data

Backtests must use historical information that would have been available at the simulated decision time.

The system must prevent look-ahead bias.

For example:

```text id="f9l6l8"
Decision at T
```

must not use information that only became available after:

```text
T
```

---

# 42. Execution Replay Data

Execution simulation should preserve enough information to model:

```text id="p4k7e1"
Signal Timestamp
    ↓
Processing Delay
    ↓
Network Delay
    ↓
Exchange Arrival
    ↓
Book State
    ↓
Queue Position
    ↓
Matching
    ↓
Partial Fill
    ↓
Remaining Order
```

The first version may use simplified assumptions where necessary.

However, those assumptions must be explicitly documented.

---

# 43. Opportunity Decay Data

The system should measure how quickly an opportunity disappears.

Relevant measurements include:

* Opportunity detection time
* Best executable edge
* Edge after 100ms
* Edge after 250ms
* Edge after 500ms
* Edge after 1s
* Edge after 2s
* Edge after 5s
* Maximum opportunity duration
* Median opportunity duration

These are measurements, not guaranteed latency thresholds.

---

# 44. Data Quality

Every ingestion pipeline must account for:

* Missing data
* Duplicate events
* Out-of-order events
* Invalid timestamps
* Stale data
* Conflicting observations
* Connection interruptions
* Partial data
* Source downtime

Invalid data must not silently enter the strategy engine.

---

# 45. Data Freshness

Latency-sensitive data must have freshness metadata.

A strategy must be able to determine:

```text
How old is this observation?
```

The system should support freshness states such as:

```text
FRESH
AGING
STALE
INVALID
UNKNOWN
```

The exact thresholds depend on the strategy.

A stale signal must not automatically be treated as a current signal.

---

# 46. Duplicate Handling

External systems may produce duplicate or repeated events.

The ingestion layer should use appropriate identifiers or event characteristics to detect duplicates.

Duplicate processing must not:

* Double-count fills
* Double-count trades
* Inflate volume
* Create duplicate positions
* Create duplicate PnL

---

# 47. Ordering

Where event ordering matters, the system should preserve:

* Source sequence information where available
* Event timestamps
* Receipt timestamps
* Internal processing sequence

The system must not assume that network arrival order is always equivalent to market event order.

---

# 48. Data Lineage

Derived data should be traceable back to its source.

Conceptually:

```text id="g5j8u4"
Raw Event
   ↓
Normalized Event
   ↓
Feature
   ↓
Signal
   ↓
Opportunity
   ↓
Decision
   ↓
Order
   ↓
Fill
   ↓
PnL
```

This lineage is necessary for debugging and strategy validation.

---

# 49. Configuration Data

Configuration must be separated from observed market data.

Examples include:

* Strategy parameters
* Risk limits
* Execution settings
* Environment settings
* Data-source settings

Configuration changes must be versioned or auditable when they affect trading behavior.

---

# 50. Strategy Versioning

A signal must be associated with the strategy version that generated it.

This prevents historical performance from becoming ambiguous after a strategy changes.

Conceptually:

```text
Strategy
BTC-LEAD-LAG

Version
0.1.0

Parameters
...

Signal
...

Trade
...
```

---

# 51. Experiment Tracking

Every meaningful research experiment should preserve:

* Experiment ID
* Hypothesis
* Dataset
* Date range
* Strategy version
* Parameters
* Evaluation metrics
* Results
* Limitations
* Decision

An experiment that fails is still useful if its result is preserved.

---

# 52. Data Retention

Retention should be based on research value, storage cost, and operational requirements.

The system should prioritize preserving:

1. Trading records
2. Market identity
3. Resolution information
4. Orders
5. Fills
6. PnL
7. Signals
8. Opportunities
9. Strategy experiments
10. High-value historical market data

High-frequency raw datasets may be archived or compacted when appropriate.

---

# 53. Reconciliation

The system must periodically compare internal state against external sources.

Reconciliation should cover:

* Orders
* Fills
* Positions
* Balances
* Open orders
* Market state

If a discrepancy exists, the system must record it rather than silently correcting history.

---

# 54. Recovery

After a restart, the system must be capable of reconstructing critical state from durable data and current external state.

Recovery should not depend solely on:

* Memory
* Redis
* Process-local state
* Cached values

The system must be able to determine:

```text
What was open?
What was filled?
What is still active?
What is the current position?
What is the current balance?
What risk remains?
```

---

# 55. Data Security

Sensitive data must receive appropriate protection.

Private credentials must never be stored alongside ordinary analytical datasets.

Wallet addresses may be stored as research identifiers, but secrets associated with wallets must never enter research datasets.

---

# 56. Research vs Production Data Boundary

The system must maintain a clear boundary:

```text
Research Data
    ↓
Experiment
    ↓
Validated Strategy
    ↓
Production Configuration
```

Research data must not directly alter production configuration.

Promotion into production requires explicit approval.

---

# 57. No-Trade Data

The system should record meaningful situations where the bot deliberately did not trade.

Examples:

* Edge below threshold
* Stale data
* Insufficient liquidity
* Risk limit
* Price protection
* Opportunity expired
* Execution uncertainty
* Market identity uncertainty
* Resolution uncertainty

No-trade decisions are valuable research data.

---

# 58. Data Required to Explain a Trade

The system should eventually be able to answer:

> Why did the bot enter this trade?

The answer should be reconstructable from:

```text
Market
+
Market State
+
External Data
+
Features
+
Strategy
+
Signal
+
Expected Edge
+
Execution Conditions
+
Risk Decision
+
Order
```

---

# 59. Data Required to Explain a Loss

The system should also be able to answer:

> Why did this trade lose money?

Possible explanations should be traceable to measurable factors such as:

* Incorrect signal
* Incorrect fair value
* Market movement
* Slippage
* Fees
* Latency
* Partial fill
* Liquidity loss
* Resolution outcome
* Execution error
* Model assumption failure

The system must not classify losses as strategy failures without sufficient evidence.

---

# 60. Data Architecture Constraints

The following constraints are mandatory:

1. Operational state belongs in durable storage.
2. High-frequency research data should not unnecessarily overload PostgreSQL.
3. Raw observations should remain distinguishable from derived values.
4. Signals must not be confused with execution.
5. Internal positions must be reconcilable.
6. PnL must be derived from actual execution information.
7. Market resolution rules must be stored.
8. Dynamic Polymarket market information must not be hardcoded.
9. Data freshness must be measurable.
10. Historical research must avoid look-ahead bias.
11. Unknown classifications must remain possible.
12. Data transformations must be reproducible where practical.

---

# 61. Initial Core Entities

The initial system is expected to require entities representing at least:

```text id="c4k8n1"
Market
Event
MarketFamily
OutcomeToken
ResolutionRule

MarketSnapshot
OrderbookSnapshot
OrderbookEvent
MarketTrade

ExternalPrice
ExternalMarketEvent

Wallet
WalletActivity
WalletClassification
WalletPosition
WalletFill

Feature
Signal
Opportunity
StrategyDecision

Order
OrderEvent
Fill
Fee

Position
Balance
PnL

RiskEvent
ExecutionMetric
HealthEvent

Experiment
BacktestRun
Dataset
AuditEvent
```

This is a logical entity list.

The exact relational schema will be defined during implementation and must preserve the boundaries defined in this document.

---

# 62. Data Flow

The primary data flow is:

```text id="3q6r4j"
External Sources
      ↓
Ingestion
      ↓
Raw / Normalized Data
      ↓
Market State
      ↓
Feature Calculation
      ↓
Strategy Signals
      ↓
Opportunity Evaluation
      ↓
Risk Evaluation
      ↓
Execution
      ↓
Orders / Fills
      ↓
Positions
      ↓
PnL
      ↓
Strategy Attribution
      ↓
Research Feedback
```

---

# 63. Data Architecture and AI Agents

AI agents must follow these rules when working with data:

1. Do not invent database fields without identifying their purpose.
2. Do not delete historical data merely to simplify implementation.
3. Do not overwrite observed data with derived values.
4. Do not change schema semantics silently.
5. Do not treat mock data as production data.
6. Do not use future information in backtests.
7. Do not remove timestamps from latency-sensitive records.
8. Do not remove source information from external observations.
9. Do not change PnL calculations without documenting the change.
10. Do not change authoritative-source rules without approval.

---

# 64. Completion Criteria

The data architecture is considered satisfied when:

* Operational data boundaries are defined.
* Research data boundaries are defined.
* PostgreSQL responsibilities are defined.
* Parquet responsibilities are defined.
* DuckDB responsibilities are defined.
* Market identity is explicitly modeled.
* Resolution information is explicitly modeled.
* External BTC data is separated from Polymarket data.
* Wallet intelligence is separated from raw wallet observations.
* Signals are separated from opportunities.
* Orders are separated from fills.
* Positions and PnL are derived from execution records.
* Data freshness is measurable.
* Data lineage is preserved.
* Reconciliation is defined.
* Backtesting data can avoid look-ahead bias.
* AI agents have explicit data-handling constraints.

---

# 65. Next Document

The next document is:

```text id="y5q2m8"
docs/polymarket/10-polymarket-integration.md
```

That document will define the actual Polymarket integration boundary, including authentication, official SDK usage, API responsibilities, CLOB V2 integration, market discovery, account access, order interaction, and the rules for interacting with Polymarket without relying on obsolete V1 infrastructure.
