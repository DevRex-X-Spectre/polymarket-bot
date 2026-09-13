# Polymarket Trading Bot

## Project Requirements

**Document:** `docs/01-project-requirements.md`
**Status:** Approved
**Document Type:** System Requirements
**Depends On:** `docs/00-project-charter.md`

---

## 1. Purpose

This document defines the functional and non-functional requirements for the Polymarket Trading Bot.

The requirements translate the project charter into concrete capabilities that the system must provide.

These requirements define **what the system must do**.

They do not define every implementation detail. Technology choices, internal architecture, data models, and deployment details are specified in the relevant technical documents.

---

# 2. Requirement Classification

Requirements are classified as follows:

| ID Prefix | Category                     |
| --------- | ---------------------------- |
| FR        | Functional Requirement       |
| NFR       | Non-Functional Requirement   |
| DR        | Data Requirement             |
| MR        | Market Research Requirement  |
| SR        | Strategy Requirement         |
| ER        | Execution Requirement        |
| RR        | Risk Requirement             |
| OR        | Operations Requirement       |
| AR        | Agent/Automation Requirement |

Priority levels:

| Priority | Meaning                                                          |
| -------- | ---------------------------------------------------------------- |
| MUST     | Required for the system to satisfy the specification             |
| SHOULD   | Required unless there is a documented reason not to implement it |
| MAY      | Optional capability                                              |

---

# 3. System Scope

The system must support the complete lifecycle:

```text
Data Collection
      ↓
Data Normalization
      ↓
Market State
      ↓
Research
      ↓
Signal Generation
      ↓
Opportunity Evaluation
      ↓
Execution Analysis
      ↓
Risk Evaluation
      ↓
Order Execution
      ↓
Portfolio Tracking
      ↓
PnL Reconciliation
      ↓
Performance Analysis
```

The system must support this lifecycle in a way that allows research and live trading components to remain independently testable.

---

# 4. Operating Modes

## FR-001: Research Mode

**Priority:** MUST

The system must support a research mode that does not submit live orders.

Research mode must support:

* Historical datasets
* Strategy experiments
* Backtesting
* Statistical analysis
* Execution simulation
* Parameter experiments
* Result recording

No research process may accidentally submit live orders.

---

## FR-002: Paper Trading Mode

**Priority:** MUST

The system must support real-time paper trading.

Paper trading must be capable of:

* Receiving live market data
* Generating live signals
* Simulating orders
* Simulating fills
* Recording simulated positions
* Recording simulated PnL
* Measuring execution conditions

Paper trading must not expose real capital.

---

## FR-003: Live Trading Mode

**Priority:** MUST

The system must support controlled live trading.

Live mode must require explicit activation.

Live mode must not be the default operating mode.

The system must not automatically transition from paper mode to live mode.

---

## FR-004: Mode Isolation

**Priority:** MUST

Research, paper, and live environments must be distinguishable through configuration and runtime state.

The system must prevent accidental use of live credentials or live order submission from research and paper processes.

---

# 5. Market Discovery and Metadata

## FR-005: Market Discovery

**Priority:** MUST

The system must be capable of discovering relevant Polymarket markets through supported market-data interfaces.

The system must store sufficient metadata to identify and analyze a market.

---

## FR-006: Market Identity

**Priority:** MUST

Every tracked market must have a stable internal identity linked to the relevant Polymarket identifiers.

The system must not rely exclusively on human-readable market names or slugs for internal identity.

---

## FR-007: Market Resolution Information

**Priority:** MUST

For every market considered for trading, the system must obtain and retain the relevant resolution information available from Polymarket.

This must include the information required to understand:

* What determines the outcome
* Which source is relevant
* What conditions determine resolution
* Relevant resolution timing

The system must not assume that markets with similar names necessarily have identical resolution rules.

---

## FR-008: Market Family Classification

**Priority:** MUST

The system must support grouping related markets into market families.

Before comparing two markets for structural relationships, the system must evaluate whether they actually represent:

* The same event
* The same underlying
* Compatible resolution conditions
* Compatible timing
* The same asset where relevant
* Compatible outcome semantics

A shared keyword or similar slug is insufficient proof of equivalence.

---

# 6. Market Data

## FR-009: Orderbook Data

**Priority:** MUST

The system must collect and process Polymarket orderbook information required for strategy evaluation and execution.

Where available, the system must retain:

* Best bid
* Best ask
* Bid depth
* Ask depth
* Spread
* Price changes
* Relevant orderbook updates

---

## FR-010: Real-Time Market Events

**Priority:** MUST

The system must support real-time market events required by the trading engine.

The system should use event-driven market updates where appropriate rather than repeatedly polling for high-frequency information.

---

## FR-011: Historical Market Data

**Priority:** MUST

The research system must support historical market data sufficient for backtesting and analysis.

Historical data must preserve timestamps and market identity.

---

## FR-012: External Market Data

**Priority:** MUST

The system must support external market data where required by a strategy.

The initial BTC research scope requires external BTC market information.

The system must maintain a clear distinction between:

```text
Polymarket Data
External Market Data
Derived Data
```

---

## FR-013: Data Freshness

**Priority:** MUST

The system must track the freshness of data used by trading decisions.

Critical trading decisions must not rely on data that exceeds the acceptable freshness requirements of the strategy.

---

## FR-014: Stale Data Protection

**Priority:** MUST

The trading system must be able to prevent execution when required market data is stale or unavailable.

---

# 7. Data Integrity

## DR-001: Timestamp Integrity

**Priority:** MUST

Market events must have timestamps with sufficient precision for the relevant research and execution analysis.

The system must preserve event ordering where required.

---

## DR-002: Raw Data Preservation

**Priority:** SHOULD

Raw or minimally transformed market events should be retained for research datasets where practical.

Derived datasets must not replace the ability to reproduce important calculations from source data.

---

## DR-003: Data Provenance

**Priority:** MUST

Derived data must identify its source.

The system should be able to determine whether a value originated from:

* Polymarket
* External market data
* On-chain data
* A calculation
* A strategy
* A simulation

---

## DR-004: Data Quality Checks

**Priority:** MUST

The ingestion system must detect relevant data-quality problems, including:

* Missing events
* Invalid timestamps
* Duplicate events
* Impossible prices
* Invalid market identifiers
* Broken sequences
* Unexpected gaps

---

# 8. Wallet Intelligence

## FR-015: Wallet Activity Collection

**Priority:** MUST

The system must support collection and analysis of relevant wallet activity.

---

## FR-016: Wallet Trade Reconstruction

**Priority:** MUST

The system must reconstruct wallet trading activity into analyzable positions and round trips where the available data permits.

The initial reconstruction model should use FIFO lot accounting for wallet, market, token, and side.

---

## FR-017: Wallet PnL

**Priority:** MUST

The system must calculate realized wallet performance where sufficient data exists.

Performance analysis should include:

* Realized PnL
* Profit factor
* Win rate
* Drawdown
* Trade count
* Holding time

---

## FR-018: Wallet Classification

**Priority:** MUST

The system must classify wallet or address behavior where sufficient evidence exists.

Possible classifications include:

* EOA
* Contract
* Protocol
* Exchange infrastructure
* Market maker
* Automated trader
* Human-like trader
* Unknown

Classification must not be treated as certain when evidence is insufficient.

---

## FR-019: Protocol Exclusion

**Priority:** MUST

Known protocol or exchange infrastructure must not automatically be interpreted as a smart-money or whale trading signal.

---

# 9. Whale Intelligence

## SR-001: Copyability Analysis

**Priority:** MUST

The system must evaluate whether a wallet's behavior is realistically copyable.

The system must not determine copyability solely from historical wallet profitability.

Copyability analysis should consider:

* Historical profitability
* Consistency
* Drawdown
* Trade frequency
* Trade size
* Entry quality
* Holding time
* Stale trade percentage
* Copyable trade percentage
* Market liquidity
* Spread
* Execution delay sensitivity
* Maker/taker behavior
* Averaging behavior
* Split/merge behavior
* Simulated copy performance

---

## SR-002: Simulated Copy Trading

**Priority:** SHOULD

The system should support simulation of copying selected wallet activity.

The simulation must account for realistic timing and execution conditions.

---

## SR-003: Whale Signal Filtering

**Priority:** MUST

A wallet transaction must not automatically become a trading signal.

The system must evaluate relevant contextual information before generating a whale-derived signal.

---

# 10. BTC Strategy Requirements

## SR-004: BTC Market Support

**Priority:** MUST

The strategy framework must support short-duration BTC markets, including five-minute markets.

---

## SR-005: BTC External Feed

**Priority:** MUST

The BTC strategy must support external BTC price data.

---

## SR-006: Resolution-Aware BTC Analysis

**Priority:** MUST

BTC strategies must account for the actual resolution mechanism of the specific market being traded.

The strategy must not assume that an external BTC price feed is identical to the source used for Polymarket resolution.

---

## SR-007: Lead-Lag Research

**Priority:** SHOULD

The system should support research into potential lead-lag relationships between external BTC markets and Polymarket BTC markets.

Lead-lag assumptions must be measured from data.

No fixed latency advantage may be assumed.

---

## SR-008: Time-to-Resolution

**Priority:** MUST

BTC strategy signals must have access to the remaining time until market resolution where the market provides sufficient information to calculate it.

---

## SR-009: Microstructure Inputs

**Priority:** SHOULD

BTC strategy research should support:

* Orderbook imbalance
* Spread
* Depth
* Short-term momentum
* Short-term reversal
* Volatility
* External price movement
* Time to resolution

---

# 11. Market Dislocation Requirements

## SR-010: Opportunity Detection

**Priority:** MUST

The system must support detection of candidate market dislocations.

---

## SR-011: Theoretical vs Executable Opportunity

**Priority:** MUST

The system must distinguish between:

```text
Theoretical Opportunity
```

and

```text
Executable Opportunity
```

A theoretical edge must not automatically become a trade.

---

## SR-012: Depth-Aware Evaluation

**Priority:** MUST

Potential opportunities must be evaluated against actual orderbook depth where the required data is available.

The system must support:

* Best price
* Available depth
* VWAP
* Expected slippage
* Partial-fill analysis

---

## SR-013: Opportunity Decay

**Priority:** MUST

The research system must measure how long detected opportunities remain executable.

The research framework must support evaluation at different elapsed intervals, including:

* 100 ms
* 250 ms
* 500 ms
* 1 second
* 2 seconds
* 5 seconds

These are measurement intervals and must not be treated as guaranteed opportunity lifetimes.

---

## SR-014: Capture Probability

**Priority:** MUST

The system must calculate or estimate the probability that a detected opportunity can actually be captured under the measured execution conditions.

---

# 12. Competition Intelligence

## SR-015: Competition Analysis

**Priority:** SHOULD

The system should analyze market participation patterns that may affect execution.

Where sufficient data is available, the system should measure:

* Taker concentration
* Maker concentration
* Repeat participants
* Concentration metrics
* Execution density
* Market crowding
* Bot-like behavior

---

## SR-016: Competitor Behavior

**Priority:** SHOULD

The system should support behavioral profiling of systematic market participants.

A competitor profile may include:

* Reaction time
* Market preference
* Typical order size
* Maker/taker behavior
* Holding time
* Trading frequency
* Response to market events

Participant behavior must be treated as observational data rather than assumed identity.

---

# 13. Signal Generation

## FR-020: Signal Standardization

**Priority:** MUST

Signals generated by different strategies must use a common representation.

A signal should identify at minimum:

* Strategy
* Market
* Timestamp
* Direction
* Estimated probability or fair value
* Current market price
* Estimated edge
* Confidence or signal strength where applicable
* Signal expiry or validity period where applicable

---

## FR-021: Signal Reason

**Priority:** MUST

Every actionable signal must contain an explainable reason.

The system must not generate unexplained trading decisions.

---

## FR-022: Signal Expiration

**Priority:** MUST

Signals must become invalid when the underlying market state changes sufficiently or the strategy-defined validity period expires.

---

# 14. Signal Fusion

## SR-017: Multi-Strategy Signal Fusion

**Priority:** SHOULD

The system should support combining signals from multiple alpha engines.

Potential sources include:

* BTC microstructure
* Whale intelligence
* Market dislocation
* Information/regime analysis

---

## SR-018: Independent Strategy Evaluation

**Priority:** MUST

Each strategy must be evaluated independently before its signal is treated as evidence that another strategy is effective.

Combining multiple weak signals must not be assumed to create a strong strategy.

---

# 15. Edge Calculation

## ER-001: Fair Value

**Priority:** MUST

The system must support calculation or estimation of fair probability or fair price for strategies that require it.

The method used must be recorded.

---

## ER-002: Gross Edge

**Priority:** MUST

The system must calculate the theoretical edge before execution costs.

---

## ER-003: Net Edge

**Priority:** MUST

The system must calculate execution-adjusted edge where sufficient information exists.

Net edge should account for applicable:

* Fees
* Spread
* Slippage
* Expected execution effects
* Other known trading costs

---

## ER-004: Trade Rejection

**Priority:** MUST

The system must reject opportunities when the expected net edge does not meet the strategy's approved requirements.

---

# 16. Execution Requirements

## ER-005: Price Protection

**Priority:** MUST

Every live order must have an acceptable execution price.

The system must not submit an unrestricted order that can execute at an uncontrolled price.

---

## ER-006: Orderbook Validation

**Priority:** MUST

Before execution, the system must validate the relevant current orderbook state.

---

## ER-007: Liquidity Validation

**Priority:** MUST

The system must verify that sufficient liquidity exists for the proposed order according to strategy and risk requirements.

---

## ER-008: Order Types

**Priority:** MUST

The execution layer must support the Polymarket order types required by approved strategies.

The initial execution specification must account for:

* GTC
* GTD
* FOK
* FAK
* Post-only behavior where supported and appropriate

---

## ER-009: Partial Fills

**Priority:** MUST

The execution engine must correctly handle partial fills.

---

## ER-010: Order Lifecycle

**Priority:** MUST

Orders must have explicit lifecycle states.

The system must track relevant transitions including:

```text
Created
   ↓
Submitted
   ↓
Matched
   ↓
Mined
   ↓
Confirmed
```

and failure or cancellation states where applicable.

The exact Polymarket event mappings will be defined in the execution specification.

---

## ER-011: Cancellation

**Priority:** MUST

The execution engine must support cancellation of open orders where applicable.

---

## ER-012: Stale Order Protection

**Priority:** MUST

The system must prevent orders from remaining active when their underlying strategy conditions are no longer valid, subject to the order type and strategy requirements.

---

## ER-013: Execution Latency

**Priority:** MUST

The system must measure relevant execution latency.

At minimum, research should distinguish between:

```text
Signal Timestamp
→ Decision
→ Order Submission
→ Exchange Arrival where measurable
→ Match
→ Fill
```

---

# 17. Sequential and Parallel Execution

## ER-014: Execution Mode

**Priority:** SHOULD

The execution engine should support both sequential and parallel execution where strategies require multiple legs.

### Sequential execution

Legs are executed one after another.

Advantages may include simpler state management.

Potential disadvantage:

* Increased exposure between legs

### Parallel execution

Multiple legs are submitted together or as close together as practical.

Potential advantage:

* Reduced timing difference

Potential disadvantages:

* Partial-fill races
* Increased execution complexity
* Greater coordination requirements

The strategy must explicitly choose its execution mode.

---

# 18. Portfolio Management

## FR-023: Position Tracking

**Priority:** MUST

The system must track open and closed positions.

---

## FR-024: Position Reconciliation

**Priority:** MUST

Internal position state must be reconciled against authoritative available account and trading data.

---

## FR-025: Realized PnL

**Priority:** MUST

The system must calculate realized PnL from actual or simulated executions.

---

## FR-026: Unrealized PnL

**Priority:** SHOULD

The system should support unrealized PnL calculation for open positions.

---

## FR-027: Fee Accounting

**Priority:** MUST

Applicable trading fees must be included in performance calculations.

Fees must not be assumed to be zero unless verified for the specific trade conditions.

---

# 19. Opportunity Journal

## FR-028: Opportunity Recording

**Priority:** MUST

The system must record detected opportunities.

---

## FR-029: No-Trade Recording

**Priority:** MUST

The system must record significant opportunities that were rejected or not executed.

The record must contain the reason for the decision where possible.

---

## FR-030: Opportunity Fields

**Priority:** MUST

The opportunity journal should support:

* Opportunity ID
* Timestamp
* Market
* Strategy
* Market price
* Fair probability
* Fair price
* Best bid
* Best ask
* Spread
* Available liquidity
* Expected slippage
* Estimated fee
* Latency
* Whale signal
* Anomaly score
* Decision
* Decision reason
* Actual fill
* Actual exit
* Realized PnL

---

# 20. Risk Requirements

## RR-001: Hierarchical Risk

**Priority:** MUST

Risk controls must operate across:

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

---

## RR-002: Maximum Daily Loss

**Priority:** MUST

The system must support a configurable maximum daily loss limit.

---

## RR-003: Maximum Open Positions

**Priority:** MUST

The system must support a configurable limit on simultaneous positions.

---

## RR-004: Maximum Market Exposure

**Priority:** MUST

The system must support limits on exposure to an individual market.

---

## RR-005: Correlated Exposure

**Priority:** SHOULD

The system should support limits on correlated exposure.

---

## RR-006: Consecutive Loss Protection

**Priority:** SHOULD

The system should support configurable protection after consecutive losses.

---

## RR-007: Kill Switch

**Priority:** MUST

The system must provide an emergency mechanism capable of stopping new trading activity.

---

## RR-008: Stale Data Shutdown

**Priority:** MUST

The trading system must stop opening new positions when critical data becomes stale beyond approved limits.

---

## RR-009: Risk Limit Enforcement

**Priority:** MUST

Risk limits must be enforced by the system rather than existing only as documentation.

---

## RR-010: No Autonomous Risk Expansion

**Priority:** MUST

The system and AI agents must not autonomously increase approved risk limits.

---

# 21. Monitoring and Observability

## OR-001: System Health

**Priority:** MUST

The system must expose enough information to determine whether critical components are operating correctly.

---

## OR-002: Data Health

**Priority:** MUST

The system must monitor data ingestion health.

---

## OR-003: Trading Health

**Priority:** MUST

The system must monitor:

* Orders
* Fills
* Open positions
* Rejections
* Cancellations
* Trading errors

---

## OR-004: Strategy Health

**Priority:** MUST

The system must monitor:

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
* Expected versus realized PnL

---

## OR-005: Operational Alerts

**Priority:** SHOULD

The system should generate alerts for important operational conditions, including:

* Trading engine failure
* Data feed failure
* Stale data
* Excessive losses
* Risk-limit activation
* Order failures
* Position mismatches
* Connectivity problems

---

# 22. Strategy Health and Degradation

## SR-019: Strategy Health Tracking

**Priority:** MUST

Every strategy used in paper or live environments must have measurable health metrics.

---

## SR-020: Strategy Degradation

**Priority:** SHOULD

The system should detect deterioration in strategy performance.

Examples include:

* Falling fill rate
* Falling realized edge
* Increasing slippage
* Increasing latency
* Increasing drawdown
* Divergence between expected and realized PnL

Automatic strategy disabling may be implemented only under explicit approved rules.

---

# 23. Edge Attribution

## SR-021: PnL Attribution

**Priority:** SHOULD

The system should attribute realized performance to contributing strategy components.

Potential attribution categories include:

* BTC lead-lag
* Orderbook imbalance
* Whale intelligence
* Market dislocation
* Timing
* Information/regime

The system must derive actual contribution from recorded data.

---

# 24. Research and Backtesting

## MR-001: Reproducible Experiments

**Priority:** MUST

Every significant research experiment must record:

* Dataset
* Time period
* Strategy version
* Parameters
* Assumptions
* Execution model
* Fee model
* Slippage model
* Latency assumptions
* Results
* Limitations

---

## MR-002: Out-of-Sample Testing

**Priority:** MUST

Strategies must be evaluated on data that was not used to design or tune them.

---

## MR-003: Look-Ahead Protection

**Priority:** MUST

Backtests must not use information that would not have been available at the simulated decision timestamp.

---

## MR-004: Execution Simulation

**Priority:** MUST

Backtesting must support realistic execution simulation.

The simulation should account for:

* Orderbook depth
* VWAP
* Slippage
* Fees
* Partial fills
* Latency
* Opportunity decay
* Order type
* Market conditions

---

## MR-005: Parameter Sensitivity

**Priority:** SHOULD

Research should test whether strategy performance depends excessively on a narrow parameter choice.

---

## MR-006: Walk-Forward Evaluation

**Priority:** SHOULD

Where appropriate, strategies should be evaluated using walk-forward methodology.

---

# 25. Data Storage Requirements

## DR-005: Relational Application Data

**Priority:** MUST

Structured operational data must be stored in a relational database.

Expected categories include:

* Markets
* Market metadata
* Wallets
* Trades
* Orders
* Fills
* Positions
* Signals
* Opportunities
* PnL
* Strategy configurations
* Experiments

---

## DR-006: High-Frequency Research Data

**Priority:** SHOULD

High-frequency event data should support efficient analytical storage suitable for backtesting.

The intended direction is Parquet with DuckDB for research workloads.

---

## DR-007: Historical Reproducibility

**Priority:** MUST

Research datasets must retain enough information to reproduce important results.

---

# 26. Engineering Requirements

## NFR-001: Modularity

**Priority:** MUST

The system must be divided into clearly defined modules with explicit responsibilities.

---

## NFR-002: Testability

**Priority:** MUST

Core trading logic must be testable without requiring live Polymarket connectivity.

---

## NFR-003: Deterministic Research

**Priority:** MUST

Research experiments should be reproducible using the same dataset, parameters, and strategy version.

---

## NFR-004: Configuration Safety

**Priority:** MUST

Sensitive and environment-specific configuration must not be hardcoded into source code.

---

## NFR-005: Credential Protection

**Priority:** MUST

Private keys, API credentials, signing secrets, and other sensitive credentials must not be committed to the repository.

---

## NFR-006: Failure Isolation

**Priority:** SHOULD

Failure of a non-critical research or analytical component should not automatically compromise the risk or execution layer.

---

## NFR-007: Observability

**Priority:** MUST

Important system behavior must be observable through structured logs, metrics, and persisted state where appropriate.

---

# 27. Deployment Requirements

## OR-006: Environment Separation

**Priority:** MUST

The project must support separate environments for:

* Local development
* Research
* Paper trading
* Live trading

---

## OR-007: Live Deployment Approval

**Priority:** MUST

Live trading deployment must require explicit human approval.

---

## OR-008: Restart Recovery

**Priority:** MUST

The live trading system must recover safely from process or machine restarts.

It must not assume that in-memory state survived a restart.

---

## OR-009: State Reconciliation

**Priority:** MUST

After restart or reconnect, the system must reconcile external account and order state before resuming trading.

---

## OR-010: Health Monitoring

**Priority:** MUST

The production trading environment must provide health monitoring sufficient to identify critical failures.

---

# 28. Security Requirements

## NFR-008: Secret Isolation

**Priority:** MUST

Credentials must be supplied through secure environment configuration or an appropriate secret-management mechanism.

---

## NFR-009: Minimal Permissions

**Priority:** SHOULD

The system should use the minimum permissions required for each component.

---

## NFR-010: Sensitive Logging Protection

**Priority:** MUST

Private keys, API secrets, authentication credentials, and other sensitive information must never be written to ordinary application logs.

---

# 29. AI Agent Requirements

## AR-001: Documentation First

**Priority:** MUST

AI coding agents must read the relevant project documentation before implementing changes.

---

## AR-002: No Guessing

**Priority:** MUST

If required information is unavailable or ambiguous, the agent must not invent an implementation assumption.

It must identify the uncertainty and request clarification or record the issue for human review.

---

## AR-003: Relevant Documentation

**Priority:** MUST

Agents do not need to read every document for every task.

They must read the documents relevant to the requested change according to the agent operating protocol.

---

## AR-004: State Tracking

**Priority:** MUST

Agents must update project-state documentation after meaningful implementation or architectural changes.

Relevant state files include:

```text
docs/project-state/CURRENT-STATE.md
docs/project-state/DECISIONS.md
docs/project-state/TODO.md
docs/project-state/CHANGELOG.md
```

---

## AR-005: No Autonomous Live Activation

**Priority:** MUST

An AI agent must never independently activate live trading.

---

## AR-006: No Autonomous Capital Allocation

**Priority:** MUST

An AI agent must not independently decide how much real capital to allocate.

---

## AR-007: No Autonomous Risk Changes

**Priority:** MUST

An AI agent must not independently remove, weaken, or increase approved risk limits.

---

## AR-008: No Profitability Claims Without Evidence

**Priority:** MUST

An AI agent must not describe a strategy as profitable based solely on:

* A theoretical argument
* A small sample
* A single backtest
* A high win rate
* A GitHub project
* Another trader's reported results
* Its own generated reasoning

Profitability claims must be supported by documented evidence.

---

# 30. Auditability Requirements

## NFR-011: Decision Traceability

**Priority:** MUST

The system must allow an important trading decision to be traced through:

```text
Market State
    ↓
Signal
    ↓
Edge Calculation
    ↓
Execution Evaluation
    ↓
Risk Evaluation
    ↓
Order
    ↓
Fill
    ↓
Position
    ↓
PnL
```

---

## NFR-012: Configuration Traceability

**Priority:** MUST

Important strategy and risk configuration changes must be traceable to a documented version or decision.

---

## NFR-013: Experiment Traceability

**Priority:** MUST

Research results must be associated with the strategy version and experiment configuration that produced them.

---

# 31. Requirements for No-Trade Decisions

## MR-007: No-Trade Analysis

**Priority:** SHOULD

The research system should analyze rejected opportunities.

Examples of rejection reasons include:

* Insufficient edge
* Excessive spread
* Insufficient liquidity
* Excessive slippage
* Opportunity expired
* Stale data
* Risk limit
* Price outside acceptable range
* Insufficient confidence
* Market resolution uncertainty
* Execution delay

Understanding why trades were rejected is necessary to distinguish a bad strategy from a conservative execution system.

---

# 32. Acceptance Criteria

The initial system should not be considered ready for live trading until the following conditions are satisfied.

### Data

* Required Polymarket data can be collected reliably.
* Required external data can be collected.
* Market metadata and resolution information are available.
* Data freshness can be measured.
* Historical datasets can be reproduced.

### Research

* Strategies can be backtested.
* Look-ahead bias is controlled.
* Execution costs are modeled.
* Out-of-sample testing is possible.
* Opportunity decay can be measured.
* Theoretical and executable opportunities are separated.

### Execution

* Orders have price protection.
* Order lifecycle is tracked.
* Partial fills are handled.
* Failed orders are handled.
* Position state is reconciled.
* Fees are accounted for.

### Risk

* Risk limits are enforced.
* Stale-data protection exists.
* Kill switch exists.
* Maximum exposure can be enforced.
* Live mode requires explicit activation.

### Operations

* System health can be monitored.
* Failures are observable.
* Restart recovery exists.
* External state can be reconciled.
* Important events are logged.

### Governance

* AI agents cannot activate live trading.
* AI agents cannot independently change risk limits.
* AI agents cannot independently allocate capital.
* Strategy decisions are documented.
* Project state is maintained in Markdown.

---

# 33. Requirements That Must Not Be Assumed

The following are explicitly **not** established facts or guarantees:

1. That whale copying will be profitable.
2. That every profitable wallet is copyable.
3. That BTC five-minute markets contain a persistent exploitable edge.
4. That Binance will always lead Polymarket by a specific amount.
5. That any specific latency threshold produces an advantage.
6. That any arbitrage opportunity will be executable.
7. That any specific strategy parameter is optimal.
8. That AI can determine the best trading algorithm without experimentation.
9. That historical profitability guarantees future profitability.
10. That free infrastructure is sufficient for every production requirement.
11. That a market price discrepancy represents risk-free profit.
12. That increasing the number of signals automatically improves performance.

These statements require evidence before they can become system assumptions.

---

# 34. Requirement Governance

Requirements may be changed only through an explicit documented decision.

A change must identify:

* Requirement being changed
* Reason for change
* Evidence supporting the change
* Impact on architecture
* Impact on implementation
* Impact on risk
* Impact on existing strategies
* Approval status

The decision must be recorded in:

```text
docs/project-state/DECISIONS.md
```

where appropriate.

---

# 35. Next Document

The next document is:

```text
docs/02-system-architecture.md
```

That document will define how these requirements are organized into system components, data flows, boundaries, interfaces, and runtime responsibilities.

It must not introduce functionality that is not justified by this requirements specification.
