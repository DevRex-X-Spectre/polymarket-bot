# Polymarket Trading Bot

## Project Charter

**Document:** `docs/00-project-charter.md`
**Status:** Approved
**Document Type:** Project Foundation
**Authority:** Project Source of Truth

---

## 1. Purpose

This project is a research-driven automated trading system for Polymarket.

The system is designed to identify, evaluate, and potentially execute trading opportunities across Polymarket prediction markets using a combination of:

* Market microstructure
* External market data
* Wallet and trading behavior
* Market dislocations
* Information and regime signals
* Statistical analysis
* Execution analysis
* Risk management

The system must not assume that any individual signal, wallet, strategy, or market inefficiency is profitable.

Every proposed source of alpha must be treated as a hypothesis until it has been validated through realistic historical analysis, simulation, paper trading, and, where appropriate, controlled live trading.

The primary objective is to build a system capable of **measuring whether a genuine, executable, net-of-cost trading edge exists**.

Profit is an outcome of validated edge and disciplined execution. It is not a project assumption.

---

## 2. Project Vision

Build a reliable personal trading research and execution platform that can:

1. Continuously collect relevant Polymarket and external market data.
2. Construct an accurate representation of current and historical market state.
3. Identify potential trading opportunities.
4. Quantify the theoretical edge of each opportunity.
5. Determine whether the opportunity is actually executable.
6. Account for fees, spread, liquidity, slippage, latency, partial fills, and other execution constraints.
7. Apply strict risk controls before capital is exposed.
8. Execute trades only when all required conditions are satisfied.
9. Reconcile execution and portfolio state.
10. Measure realized performance.
11. Attribute performance to individual signals and strategies.
12. Detect when a strategy's performance deteriorates.
13. Maintain a complete research and operational record.

---

## 3. Core Project Principle

The system must follow this principle:

> **Do not trade because an opportunity looks profitable. Trade only when the expected net edge has been demonstrated to be executable and the trade passes the risk and execution requirements.**

This distinction is fundamental.

A theoretical opportunity is not necessarily an executable opportunity.

A profitable wallet is not necessarily a copyable wallet.

A predictive signal is not necessarily a profitable trading strategy.

A backtest is not necessarily evidence of live profitability.

A market price discrepancy is not necessarily an arbitrage opportunity.

---

## 4. Problem Definition

Polymarket provides continuously changing prediction markets with varying:

* Prices
* Liquidity
* Spreads
* Orderbook depth
* Market conditions
* Resolution timelines
* Trading activity
* Participant behavior
* Fees
* Execution conditions

The project must therefore solve two separate problems.

### 4.1 Research Problem

Determine whether observable market behavior contains repeatable statistical relationships that can produce positive expected returns after realistic trading costs.

### 4.2 Execution Problem

Determine whether identified opportunities can actually be captured under real market conditions.

Execution analysis must consider, where applicable:

* Orderbook state
* Available liquidity
* Spread
* Market depth
* Slippage
* Order type
* Partial fills
* Fill probability
* Signal-to-order latency
* Network latency
* Opportunity decay
* Rejected orders
* Stale market data
* Market resolution
* Trading fees

The project is successful only if both problems are addressed.

---

## 5. Initial Trading Scope

The project will initially focus on research and controlled trading rather than attempting to trade every Polymarket market.

The primary research areas are:

### 5.1 BTC Short-Duration Markets

Particular attention will be given to short-duration BTC Up/Down markets, including five-minute markets.

The initial hypothesis is that these markets may contain exploitable relationships involving:

* External BTC price movement
* Lead-lag relationships
* Polymarket orderbook behavior
* Time remaining until resolution
* Short-term volatility
* Momentum
* Reversal
* Liquidity
* Market imbalance
* Resolution-source behavior

These are research hypotheses.

No specific threshold, timing window, indicator, or model is considered validated until supported by data.

The system must read and respect the actual resolution rules of each market rather than assuming that every BTC market resolves using the same mechanism.

---

### 5.2 Wallet and Whale Intelligence

The system will analyze wallet activity to determine whether certain participants demonstrate behavior that is both:

1. Historically profitable, and
2. Practically copyable.

The project must not equate wallet profitability with copyability.

Wallet analysis should eventually consider:

* Realized PnL
* Profit factor
* Consistency
* Drawdown
* Trade count
* Holding time
* Entry quality
* Trade size
* Market liquidity
* Stale trade percentage
* Copyable trade percentage
* Execution delay sensitivity
* Maker/taker behavior
* Averaging behavior
* Split/merge behavior
* Simulated copy performance

The purpose of wallet intelligence is to identify useful information and behavioral patterns, not blindly mirror every transaction.

---

### 5.3 Market Dislocations and Anomalies

The system will search for temporary market dislocations, structural inconsistencies, and unusual market conditions.

These may include:

* Cross-market inconsistencies
* Same-event pricing inconsistencies
* Orderbook imbalances
* Executable pricing discrepancies
* Temporary liquidity dislocations
* Unusual price movements
* Potential structural arbitrage

These opportunities must be distinguished between:

```text
Theoretical Opportunity
        ↓
Executable Opportunity
        ↓
Risk-Adjusted Opportunity
```

The existence of a mathematical discrepancy does not prove that the discrepancy can be traded profitably.

---

### 5.4 Information and Regime Signals

External information may be used to identify changes in:

* Market regime
* Volatility
* Event risk
* Momentum conditions
* Liquidity conditions
* Short-term market behavior

News, social activity, and broader information sources should initially be treated primarily as contextual or regime information unless research demonstrates that they provide a measurable and executable trading edge.

---

## 6. Research-First Development Model

The project will be developed through the following progression:

```text
Research
   ↓
Historical Data
   ↓
Backtesting
   ↓
Execution Simulation
   ↓
Out-of-Sample Testing
   ↓
Paper Trading
   ↓
Controlled Live Trading
   ↓
Continuous Monitoring
```

No strategy should progress directly from an idea to live capital.

A strategy must accumulate evidence at each stage.

---

## 7. Definition of a Validated Strategy

A strategy is not considered validated merely because it:

* Has profitable historical trades
* Has a high win rate
* Produces positive backtest PnL
* Follows profitable wallets
* Detects apparent arbitrage
* Performs well over a small sample
* Produces occasional large winners
* Works during one market regime

A strategy must be evaluated using appropriate statistical and execution metrics.

At minimum, evaluation should consider:

* Number of opportunities
* Number of executed trades
* Win rate
* Profit factor
* Net PnL
* Maximum drawdown
* Expected edge
* Realized edge
* Average slippage
* Fees
* Average latency
* Fill rate
* Opportunity survival
* Expected versus realized PnL
* Performance across different market conditions

The specific acceptance thresholds will be defined in the research, strategy, execution, and risk specifications.

---

## 8. Capital Philosophy

The initial bankroll is expected to be small, approximately **$20–$50**.

This capital must be treated as **research and validation capital**, not as guaranteed income-producing capital.

The initial objective is not to maximize nominal profit.

The initial objective is to determine whether the system can demonstrate a positive net edge while protecting capital.

Capital deployment must therefore progress gradually:

```text
$0 Live Capital
      ↓
Historical Research
      ↓
Paper Trading
      ↓
Tiny Live Allocation
      ↓
Validated Performance
      ↓
Controlled Scaling
```

No assumption should be made that the bot will generate consistent income.

---

## 9. Trading Modes

The system must support explicit operating modes.

### 9.1 Research Mode

Used for:

* Data collection
* Historical analysis
* Strategy development
* Backtesting
* Experimentation
* Model evaluation

No live orders may be submitted.

### 9.2 Paper Mode

Used for:

* Real-time signal generation
* Simulated execution
* Fill simulation
* Strategy monitoring
* Execution testing
* Operational testing

No real capital may be exposed.

### 9.3 Live Mode

Used only after the relevant strategy and system controls have been approved.

Live mode may submit real orders and therefore requires:

* Explicit activation
* Valid credentials
* Risk controls
* Position limits
* Order protection
* Monitoring
* Kill switch
* Reconciliation
* Operational health checks

Live mode must never be the default mode.

---

## 10. Core System Principles

### 10.1 Data Before Decisions

Trading decisions must be based on recorded market state and validated data.

The system must distinguish between:

* Current data
* Historical data
* Delayed data
* Stale data
* Missing data
* Estimated data
* Derived data

---

### 10.2 Resolution Rules Are Authoritative

The system must not assume how a market resolves.

For every market being traded, the system should identify and store the relevant resolution information available from Polymarket's market data and resolution sources.

A strategy must not rely on an assumed resolution source when the actual market specifies another source or rule.

---

### 10.3 Execution Is Part of the Strategy

The expected profitability of a strategy must account for the conditions under which the trade can actually be executed.

The system must distinguish:

```text
Signal Edge
      ↓
Market Price
      ↓
Execution Cost
      ↓
Net Edge
```

Execution costs may include:

* Trading fees
* Spread
* Slippage
* Partial fills
* Missed fills
* Latency
* Adverse price movement

---

### 10.4 No Unlimited Price Execution

The execution engine must use price protection.

For a proposed trade:

```text
Current Book
     ↓
Maximum Acceptable Price
     ↓
Marketable Limit Order
```

If the available market price exceeds the strategy's acceptable execution price, the system must not execute the trade.

---

### 10.5 Opportunity Decay Must Be Measured

An opportunity may disappear before the bot can execute it.

The research system must therefore measure opportunity survival over relevant time intervals.

The project will track metrics such as:

* Opportunity survival at 100 ms
* 250 ms
* 500 ms
* 1 second
* 2 seconds
* 5 seconds

These intervals are research measurement points, not assumptions that an opportunity will remain available for those periods.

A key metric is:

```text
Capture Probability
```

This represents the probability that a detected opportunity can actually be captured under the system's measured execution conditions.

---

### 10.6 Competition Must Be Considered

The bot operates in a competitive market.

The system should therefore analyze execution competition where data permits, including:

* Taker concentration
* Maker concentration
* Repeat participants
* Participant concentration
* Bot-like behavior
* Execution density
* Market crowding
* Opportunity decay

The objective is to understand whether an apparent edge is likely to remain available long enough to execute.

---

### 10.7 Wallet Classification Must Be Careful

Not every frequently active address represents a human trader or a smart-money wallet.

The system must distinguish, where possible, between:

* Externally owned accounts
* Contracts
* Protocol contracts
* Exchange infrastructure
* Market makers
* Automated trading systems
* Individual traders
* Unknown addresses

Known protocol or exchange contracts must not automatically be interpreted as whale trading signals.

---

## 11. Core Alpha Engines

The initial architecture will support four primary research engines.

### A. BTC Microstructure Engine

Focuses on:

* BTC external price feeds
* Polymarket BTC markets
* Lead-lag behavior
* Orderbook imbalance
* Short-term momentum
* Short-term reversal
* Volatility
* Time to resolution
* Resolution-source relationship

---

### B. Whale Intelligence Engine

Focuses on:

* Wallet behavior
* Historical profitability
* Realized PnL
* Copyability
* Entry quality
* Trade timing
* Market selection
* Execution characteristics
* Behavioral fingerprints

---

### C. Market Dislocation Engine

Focuses on:

* Structural inconsistencies
* Cross-market relationships
* Orderbook discrepancies
* Executable arbitrage
* Temporary market dislocations
* Market-family relationships

Market relationships must be validated before being treated as equivalent.

The system should verify:

* Same event
* Same underlying
* Same resolution conditions
* Same relevant timestamp
* Same asset
* Same outcome semantics
* Same market family

---

### D. Information and Regime Engine

Focuses on external information and changing market conditions.

This engine is initially intended to provide contextual signals and regime classification rather than assume that news or social data alone produces a profitable trading edge.

---

## 12. Signal Fusion

The four alpha engines may produce independent signals.

These signals will eventually flow through a common decision process:

```text
BTC Engine
     │
Whale Engine
     │
Anomaly Engine
     │
Information Engine
     │
     ▼
Signal Fusion
     │
     ▼
Edge Calculation
     │
     ▼
Execution Cost Model
     │
     ▼
Risk Engine
     │
     ▼
Execution Engine
```

The system must not assume that combining more signals automatically improves performance.

Signal combinations must be tested independently and out of sample.

---

## 13. Risk Philosophy

Risk management is a mandatory system component.

Risk controls must operate at multiple levels:

```text
Global Risk
    ↓
Strategy Risk
    ↓
Market Risk
    ↓
Trade Risk
    ↓
Order Risk
```

The system must support controls such as:

* Maximum daily loss
* Maximum open positions
* Maximum market exposure
* Maximum correlated exposure
* Consecutive-loss protection
* Stale-data protection
* Maximum order size
* Price protection
* Strategy shutdown
* Emergency kill switch

Exact values must be defined in the dedicated risk specification and must not be guessed inside strategy code.

---

## 14. Portfolio and PnL Integrity

The system must maintain an auditable relationship between:

```text
Signal
   ↓
Decision
   ↓
Order
   ↓
Fill
   ↓
Position
   ↓
Exit
   ↓
Realized PnL
```

The system must reconcile its internal state with available Polymarket account and trading data.

A strategy must not be considered successful based solely on internal calculations if the resulting positions and PnL cannot be reconciled.

---

## 15. Opportunity Journal

Every meaningful strategy decision should be recorded, including **NO TRADE** decisions.

The opportunity journal should capture, where applicable:

* Opportunity ID
* Timestamp
* Market
* Strategy
* Market price
* Estimated fair probability
* Estimated fair price
* Best bid
* Best ask
* Spread
* Available liquidity
* Expected slippage
* Estimated fees
* Estimated latency
* Whale signal
* Anomaly score
* Decision
* Decision reason
* Actual fill
* Actual exit
* Realized PnL

This data is required for later analysis of why the system made or rejected a decision.

---

## 16. Strategy Health

Every deployed strategy must have measurable health indicators.

At minimum:

* Signal count
* Execution count
* Fill rate
* Win rate
* Profit factor
* Net PnL
* Maximum drawdown
* Average edge
* Realized edge
* Average slippage
* Average fee
* Average latency
* Opportunity survival
* Expected versus realized PnL

The system should be able to identify when strategy performance deteriorates.

Automatic strategy degradation or disabling may be implemented later, but such behavior must be governed by explicit risk rules rather than arbitrary agent decisions.

---

## 17. Edge Attribution

The system should eventually determine which components are responsible for realized performance.

For example, realized PnL may be attributed across:

```text
BTC Lead-Lag
Orderbook Imbalance
Whale Signal
Timing
Market Dislocation
Information/Regime
```

The example above is illustrative only.

Actual attribution must come from measured data.

The purpose of attribution is to prevent the system from continuing to rely on signals that appear useful but do not contribute meaningful net performance.

---

## 18. Data Architecture Principle

The project requires both relational and high-frequency research data.

The intended architecture is:

```text
PostgreSQL
    ↓
Metadata
Markets
Wallets
Trades
Positions
Signals
Orders
PnL
Experiments

Parquet + DuckDB
    ↓
High-Frequency Orderbook Events
External Market Feeds
BTC Data
Chainlink Data
Real-Time Market Events
Backtest Datasets
```

PostgreSQL is intended for structured application state.

Parquet and DuckDB are intended for high-volume research and historical analysis.

The exact implementation is defined in the data architecture document.

---

## 19. System Architecture Principle

The initial system should remain modular without prematurely becoming a distributed microservice architecture.

The project will begin with clear logical modules for:

* Market ingestion
* Wallet ingestion
* Whale intelligence
* BTC analysis
* Anomaly detection
* News and information analysis
* Strategy evaluation
* Signal fusion
* Risk management
* Execution
* Portfolio management
* Research
* Monitoring

These logical boundaries do not require each module to become an independently deployed service.

The initial implementation should prioritize:

* Reliability
* Observability
* Testability
* Simplicity
* Research velocity
* Correctness

over unnecessary infrastructure complexity.

---

## 20. Technology Direction

The project will use a TypeScript-first trading/application layer with Python available for quantitative research and analysis.

The architecture will use Polymarket's current supported interfaces rather than archived integrations.

The current Polymarket integration direction includes:

* Official TypeScript SDK
* Official Python SDK where appropriate for research
* Polymarket CLOB
* Polymarket WebSockets
* Gamma API
* Data API
* Resolution data
* Relevant official Polymarket infrastructure

The exact versions, packages, APIs, and implementation decisions are defined in the dedicated Polymarket and technical-stack specifications.

The project must not build around archived Polymarket V1 integrations.

---

## 21. Infrastructure Philosophy

The project must initially prioritize free or minimal-cost infrastructure.

Development and research should be possible with:

* Local development
* Free-tier services where suitable
* Free or low-cost compute
* Efficient storage
* Open-source research tooling

The system must not assume that free infrastructure provides production-grade reliability.

Trading infrastructure requirements must be evaluated separately from research infrastructure requirements.

The transition from local development to hosted paper trading and eventually controlled live trading must be explicit.

---

## 22. Development Lifecycle

The project will follow this lifecycle:

```text
Research
    ↓
Specification
    ↓
Implementation
    ↓
Unit Testing
    ↓
Integration Testing
    ↓
Historical Backtesting
    ↓
Execution Simulation
    ↓
Out-of-Sample Validation
    ↓
Paper Trading
    ↓
Operational Validation
    ↓
Manual Live Approval
    ↓
Controlled Live Trading
```

No stage should be silently skipped because a strategy appears promising.

---

## 23. AI Agent Governance

AI coding agents will be used to accelerate research and development.

However, the agent is an implementation and research assistant, not the project owner.

The human project owner remains the final authority over:

* Strategy approval
* Capital allocation
* Risk limits
* Live trading activation
* Wallet configuration
* Credentials
* Deployment to live trading
* Safety controls
* Major architecture decisions

An AI agent must not independently:

* Activate live trading
* Allocate real capital
* Increase trading limits
* Remove risk controls
* Expose credentials
* Change wallet ownership
* Disable safety systems
* Declare a strategy profitable
* Deploy an unapproved live strategy

The complete agent operating rules will be defined in:

```text
docs/agent/70-agent-contract.md
docs/agent/71-agent-operating-protocol.md
docs/agent/72-agent-skills.md
```

---

## 24. Source of Truth

The project documentation is the authoritative record of approved architectural and product decisions.

The hierarchy is:

```text
Project Charter
      ↓
Requirements
      ↓
Architecture
      ↓
Technical Specifications
      ↓
Implementation
      ↓
Project State
```

Code must not silently override an approved architectural or product decision.

If an agent discovers a conflict between:

* Documentation and code
* Two specifications
* Current implementation and intended behavior
* Research assumptions and measured results

the conflict must be identified and documented.

The agent must not invent a resolution.

---

## 25. Evidence Standard

The project will distinguish between three categories of information.

### Confirmed

Supported by authoritative documentation, measured data, or verified implementation behavior.

### Hypothesis

A proposed explanation, strategy, relationship, or mechanism that requires testing.

### Unknown

Information for which sufficient evidence is not currently available.

Agents must not convert:

```text
Hypothesis → Fact
Unknown → Assumption
Backtest → Guarantee
```

Any uncertainty that can materially affect implementation must be surfaced rather than guessed.

---

## 26. Research Integrity

Research results must be reproducible.

Experiments should record:

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

A strategy result without its assumptions is incomplete.

Historical results must not be presented as evidence of future profitability.

---

## 27. Backtesting Requirements

Backtests must model realistic execution.

Where applicable, the simulator should account for:

* Orderbook depth
* Bid/ask spread
* VWAP
* Slippage
* Fees
* Partial fills
* Order types
* Opportunity decay
* Latency
* Stale quotes
* Rejected orders
* Market resolution
* Position constraints

Simple directional prediction accuracy is not sufficient to establish trading profitability.

---

## 28. Competition and Market Reality

The project assumes that other automated and human participants may be operating in the same markets.

Therefore, the system must not assume that an identified opportunity will remain available.

The research process should measure:

* How quickly opportunities disappear
* How frequently opportunities are captured
* How concentrated trading activity is
* How execution conditions change
* Whether the strategy remains profitable after realistic delays

This is particularly important for short-duration markets.

---

## 29. Safety and Failure Philosophy

The bot must fail safely.

Examples of conditions that should prevent trading include:

* Missing critical market data
* Stale market data
* Invalid market state
* Unknown resolution conditions
* Excessive spread
* Insufficient liquidity
* Price outside acceptable bounds
* Risk limit exceeded
* Account state mismatch
* Execution state mismatch
* Unhealthy system state
* Loss of required market connectivity

The exact conditions and thresholds will be defined in the risk and operations specifications.

---

## 30. What This Project Is Not

This project is not:

* A guaranteed money-making system
* A guaranteed arbitrage system
* A guaranteed whale-copying system
* A generic AI prediction bot
* A system that blindly follows profitable wallets
* A system that assumes every price discrepancy is exploitable
* A system that trades every signal
* A system that relies on backtest results alone
* A system that automatically increases risk after profitable periods
* A system that gives an AI agent unrestricted control over real capital

---

## 31. Initial Success Criteria

The first definition of success is not a specific dollar profit.

The project succeeds initially when it can demonstrate that it can:

1. Collect reliable market data.
2. Reconstruct historical market state.
3. Identify candidate opportunities.
4. Calculate theoretical edge.
5. Calculate execution-adjusted edge.
6. Model realistic execution.
7. Backtest strategies without look-ahead bias.
8. Validate strategies out of sample.
9. Paper trade strategies in real time.
10. Reconcile simulated results.
11. Enforce risk controls.
12. Produce auditable trade and decision records.
13. Identify which signals actually contribute to performance.
14. Determine whether any strategy has a repeatable positive net edge.

Only after these capabilities are demonstrated should controlled live trading become a project objective.

---

## 32. Long-Term Objective

The long-term objective is to develop a personal, research-driven Polymarket trading system that continuously improves through:

```text
Data
 ↓
Research
 ↓
Experimentation
 ↓
Validation
 ↓
Execution
 ↓
Measurement
 ↓
Attribution
 ↓
Improvement
```

The system should become better at distinguishing:

```text
Signal
from
Noise

Opportunity
from
Illusion

Profitability
from
Randomness

Theoretical Edge
from
Executable Edge

Profitable Wallet
from
Copyable Wallet

Backtest Success
from
Real Trading Edge
```

The project will prioritize correctness, evidence, execution quality, risk control, and reproducibility over speed of deployment.

---

## 33. Charter Authority

This document establishes the high-level purpose, boundaries, principles, and success criteria for the Polymarket trading bot.

Lower-level documents may define implementation details, but they must remain consistent with this charter.

If a future proposal materially changes the purpose, risk philosophy, trading scope, or authority model defined here, the change must be recorded as an explicit project decision rather than silently modifying this document.

---

## 34. Document Status

**Status:** Approved for implementation planning

**Next authoritative document:**

```text
docs/01-project-requirements.md
```

The next document will translate this charter into explicit functional and non-functional requirements that the system must satisfy.
