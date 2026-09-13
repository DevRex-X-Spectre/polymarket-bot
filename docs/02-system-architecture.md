# Polymarket Trading Bot

## System Architecture

**Document:** `docs/02-system-architecture.md`
**Status:** Approved
**Document Type:** System Architecture
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`

---

# 1. Purpose

This document defines the logical architecture of the Polymarket Trading Bot.

It establishes:

* Major system components
* Component responsibilities
* Data flows
* System boundaries
* Runtime boundaries
* Research boundaries
* Trading boundaries
* External integrations
* Internal interfaces
* State ownership
* Failure boundaries

This document defines **how the system is organized**.

It does not define detailed database schemas, individual strategy parameters, deployment configuration, or implementation-level code structure. Those are defined in their respective documents.

---

# 2. Architectural Principles

The system architecture is based on the following principles.

## 2.1 Research Before Execution

The architecture must allow strategies to be researched and tested without requiring live trading infrastructure.

```text
Research
   ↓
Simulation
   ↓
Paper Trading
   ↓
Live Trading
```

The research environment must therefore remain independent from live execution.

---

## 2.2 Event-Driven Where Latency Matters

High-frequency market and trading components should use event-driven data flows where appropriate.

The system should not depend on unnecessary polling for information that is available through real-time streams.

REST APIs remain important for:

* Initialization
* Historical data
* Metadata
* Reconciliation
* Recovery
* Non-real-time queries

---

## 2.3 One Truth Layer

Different external sources may describe different parts of the same market.

The system must normalize these sources into an internal market state before strategies consume them.

The logical flow is:

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

Strategies should consume normalized internal state rather than independently interpreting raw external APIs.

---

## 2.4 Strategies Must Not Own Execution

A strategy identifies and evaluates an opportunity.

It must not directly control low-level order submission.

The intended boundary is:

```text
Strategy
   ↓
Signal
   ↓
Edge Evaluation
   ↓
Risk
   ↓
Execution
   ↓
Order
```

This prevents individual strategies from bypassing centralized risk and execution controls.

---

## 2.5 Risk Must Be Independent

Risk management must be a separate system boundary.

A strategy may request a trade, but the risk engine must have authority to reject it.

```text
Strategy
   ↓
Trade Intent
   ↓
Risk Engine
   ├── Reject
   └── Approve
          ↓
      Execution
```

---

## 2.6 Execution Must Be State-Aware

An order is not a single event.

The execution system must track the lifecycle of an order and its relationship with:

* Market state
* Strategy state
* Position state
* Account state
* Risk state

---

## 2.7 Observability Is Part of the Architecture

Important decisions and state transitions must be observable.

The system should be able to answer:

> Why did the bot trade?

and:

> Why did the bot not trade?

The architecture therefore treats logging, metrics, opportunity records, order records, and strategy state as first-class system concerns.

---

# 3. High-Level Architecture

The system is organized into the following major layers:

```text
                         POLYMARKET TRADING BOT
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
  POLYMARKET DATA           WALLET / ON-CHAIN         EXTERNAL DATA
        │                         │                         │
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  ▼
                           DATA INGESTION
                                  │
                                  ▼
                         NORMALIZATION LAYER
                                  │
                                  ▼
                            TRUTH LAYER
                                  │
                                  ▼
                           MARKET STATE
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        BTC ENGINE         WHALE ENGINE         ANOMALY ENGINE
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  ▼
                         INFORMATION / REGIME
                                  │
                                  ▼
                           SIGNAL FUSION
                                  │
                                  ▼
                          EDGE CALCULATOR
                                  │
                                  ▼
                       EXECUTION COST MODEL
                                  │
                                  ▼
                            RISK ENGINE
                                  │
                                  ▼
                        EXECUTION ENGINE
                                  │
                                  ▼
                       ORDER STATE MACHINE
                                  │
                                  ▼
                         PORTFOLIO / PnL
                                  │
                                  ▼
                        RECONCILIATION LAYER
                                  │
                                  ▼
                     PERFORMANCE / ATTRIBUTION
```

---

# 4. External System Boundary

The bot does not control external systems.

External systems provide information, accept orders, resolve markets, or provide supporting data.

The primary external data boundaries are:

```text
Polymarket
├── Gamma API
├── CLOB
├── CLOB WebSockets
├── Data API
└── Resolution / on-chain data

External Market Data
├── Binance
└── Chainlink-related data where required

External Information
└── News / social / information sources
```

The exact integration details are defined in:

```text
docs/polymarket/10-polymarket-integration.md
docs/polymarket/11-market-data-and-streaming.md
```

---

# 5. Data Ingestion Layer

The ingestion layer is responsible for receiving external information.

It must not make trading decisions.

Its responsibilities include:

* Connecting to external sources
* Receiving data
* Timestamping events
* Validating basic structure
* Detecting malformed data
* Handling reconnects
* Passing normalized events downstream
* Persisting appropriate raw data

The ingestion layer must not:

* Decide whether to trade
* Set strategy parameters
* Override risk limits
* Submit live orders

---

# 6. Market Data Sources

The system will use different Polymarket interfaces for different purposes.

Conceptually:

```text
Gamma API
    ↓
Market Metadata

CLOB
    ↓
Orderbook / Trading State

CLOB WebSockets
    ↓
Real-Time Market Events

Data API
    ↓
Trades / Positions / Activity

Subgraphs / On-Chain Sources
    ↓
Historical and Verification Data

Resolution Data
    ↓
Resolution State
```

The system must not treat every source as interchangeable.

Each source has a defined responsibility.

---

# 7. External BTC Data

The BTC strategy requires external market information.

The architecture therefore supports external BTC data feeds independently from Polymarket data.

Conceptually:

```text
External BTC Feed
       │
       ▼
BTC Data Adapter
       │
       ▼
Normalized BTC State
       │
       ├──────────────┐
       │              │
       ▼              ▼
BTC Strategy     Research Dataset
```

The external BTC price must not automatically be treated as the authoritative resolution price for a Polymarket market.

The market's actual resolution rules remain authoritative.

---

# 8. Wallet and On-Chain Data Layer

Wallet analysis requires data beyond the live orderbook.

The wallet data layer is responsible for collecting and normalizing relevant:

* Trades
* Positions
* Activity
* On-chain events
* Wallet state
* Market relationships

The flow is:

```text
Wallet / Activity Sources
          ↓
Wallet Ingestion
          ↓
Normalization
          ↓
Address Classification
          ↓
Wallet History
          ↓
FIFO Reconstruction
          ↓
Wallet Analytics
```

---

# 9. Address Classification

Address classification is an explicit architectural component.

This is necessary because an address observed in trading activity may represent:

* An individual trader
* An automated trader
* A market maker
* A protocol
* An exchange-related contract
* Other infrastructure
* Unknown behavior

The architecture must therefore prevent raw address activity from being directly interpreted as smart-money activity.

```text
Raw Address
     ↓
Classification
     ↓
Behavior Analysis
     ↓
Whale Intelligence
```

Classification may be uncertain.

Unknown must remain a valid classification.

---

# 10. Truth Layer

The truth layer is responsible for constructing a consistent internal representation of relevant external state.

It is not a single external data source.

It is the internal layer where information from multiple sources is:

* Normalized
* Validated
* Associated
* Timestamped
* Classified
* Cross-referenced

The truth layer should make it possible to answer:

* What market is this?
* What are its current prices?
* What is its orderbook state?
* What are its resolution conditions?
* What is its current lifecycle state?
* What external data is relevant?
* How fresh is the data?
* Which values are observed?
* Which values are derived?

---

# 11. Market State

The truth layer produces normalized market state.

Conceptually:

```text
Market State
├── Market Identity
├── Market Metadata
├── Resolution Information
├── Market Status
├── Token / Outcome Information
├── Best Bid
├── Best Ask
├── Spread
├── Orderbook Depth
├── Recent Trades
├── Time to Resolution
├── External Reference Data
├── Data Freshness
└── Derived Market Features
```

Strategies consume this state rather than directly consuming arbitrary raw API responses.

---

# 12. Market State Freshness

Every market state must have freshness information.

A strategy must be able to determine whether the state it is using is current enough for its decision.

Conceptually:

```text
Market State
     │
     ▼
Freshness Check
     │
 ┌───┴────┐
 ▼        ▼
Fresh    Stale
 │        │
 ▼        ▼
Continue  Reject
```

The acceptable freshness threshold is strategy-specific and must be explicitly defined.

---

# 13. Strategy Layer

The strategy layer is responsible for generating trade ideas.

The initial logical strategy engines are:

```text
BTC Microstructure Engine
Whale Intelligence Engine
Market Dislocation Engine
Information / Regime Engine
```

Each engine should operate independently.

A strategy should produce a standardized signal or trade intent rather than directly submitting an order.

---

# 14. BTC Microstructure Engine

The BTC engine analyzes short-duration BTC markets.

Its inputs may include:

```text
External BTC State
Polymarket Market State
Orderbook State
Time to Resolution
Volatility
Momentum
Reversal
Market Imbalance
```

Its output is a standardized signal.

It must not directly submit orders.

---

# 15. Whale Intelligence Engine

The whale engine analyzes wallet behavior.

Its logical pipeline is:

```text
Wallet Activity
      ↓
Normalization
      ↓
Address Classification
      ↓
FIFO Reconstruction
      ↓
Performance Analysis
      ↓
Behavioral Analysis
      ↓
Copyability Analysis
      ↓
Whale Signal
```

A whale signal must represent information about observed behavior.

It must not automatically become a copy trade.

---

# 16. Market Dislocation Engine

The anomaly engine identifies potential market inconsistencies.

Its pipeline is:

```text
Market State
     ↓
Market Relationship
     ↓
Dislocation Detection
     ↓
Depth Analysis
     ↓
Execution Cost
     ↓
Opportunity Decay
     ↓
Executable Opportunity
```

The engine must distinguish between an observed discrepancy and a tradeable opportunity.

---

# 17. Information and Regime Engine

The information/regime engine processes external information and broader market conditions.

Its primary architectural purpose is to provide:

* Context
* Regime classification
* Event awareness
* Volatility context
* Market condition information

It must not assume that external information is automatically predictive.

---

# 18. Signal Standardization

Different strategies must produce a common internal signal format.

Conceptually:

```text
Strategy Signal
├── Signal ID
├── Strategy ID
├── Market ID
├── Timestamp
├── Direction
├── Fair Value / Probability
├── Current Market Price
├── Estimated Edge
├── Confidence / Strength
├── Validity
└── Reason
```

The exact schema belongs in the data architecture and strategy framework specifications.

---

# 19. Signal Fusion

Signal fusion combines or compares signals from different strategy engines.

```text
BTC Signal
     │
Whale Signal
     │
Anomaly Signal
     │
Regime Signal
     │
     ▼
Signal Fusion
```

Signal fusion must not assume that more signals means greater confidence.

It must be measurable and testable.

---

# 20. Edge Calculation Layer

The edge calculation layer determines whether a signal represents a sufficiently attractive opportunity.

Conceptually:

```text
Signal
   ↓
Fair Value
   ↓
Market Price
   ↓
Gross Edge
   ↓
Execution Cost
   ↓
Net Expected Edge
```

The layer should consider applicable:

* Fees
* Spread
* Slippage
* Liquidity
* Fill probability
* Latency
* Opportunity decay

---

# 21. Theoretical Opportunity

A theoretical opportunity is a situation where the model identifies a positive apparent edge without yet proving that the opportunity can be executed.

Example:

```text
Estimated Fair Value
        >
Current Market Price
```

This alone is not sufficient for trading.

---

# 22. Executable Opportunity

An opportunity becomes executable only after considering real execution conditions.

Conceptually:

```text
Theoretical Edge
       ↓
Orderbook
       ↓
Liquidity
       ↓
Spread
       ↓
Slippage
       ↓
Fees
       ↓
Latency
       ↓
Opportunity Decay
       ↓
Execution Probability
       ↓
Executable Edge
```

Only executable opportunities should proceed toward risk evaluation.

---

# 23. Opportunity Decay Component

The architecture includes a dedicated opportunity-decay analysis component.

Its responsibility is to measure how quickly an opportunity disappears.

Conceptually:

```text
Opportunity Detected
        ↓
100ms
        ↓
250ms
        ↓
500ms
        ↓
1s
        ↓
2s
        ↓
5s
```

For each interval, the research system may record whether the opportunity:

* Still exists
* Has weakened
* Has disappeared
* Became more attractive
* Became unexecutable

This information feeds execution analysis.

---

# 24. Competition Intelligence

Competition analysis sits alongside opportunity analysis.

```text
Market Activity
      ↓
Participant Analysis
      ↓
Competition Metrics
      ↓
Execution Environment
```

The component may evaluate:

* Participant concentration
* Repeat participants
* Maker activity
* Taker activity
* Execution density
* Bot-like behavior
* Market crowding

Its output is contextual information for strategy and execution analysis.

---

# 25. Risk Engine

The risk engine is the final authority before live order submission.

```text
Trade Intent
      ↓
Risk Engine
      │
 ┌────┴─────┐
 ▼          ▼
Reject     Approve
             │
             ▼
         Execution
```

Risk checks may include:

* Global exposure
* Strategy exposure
* Market exposure
* Correlated exposure
* Daily loss
* Position count
* Order size
* Stale data
* Market state
* Price protection
* System health

The exact rules belong in `docs/risk/40-risk-and-safety.md`.

---

# 26. Execution Engine

The execution engine converts an approved trade intent into an order-management process.

Its responsibilities include:

* Selecting the approved order type
* Validating market state
* Validating price
* Validating liquidity
* Submitting orders
* Monitoring order state
* Handling fills
* Handling partial fills
* Handling cancellations
* Handling failures
* Reporting execution results

The execution engine must not bypass risk controls.

---

# 27. Order State Machine

Orders must have explicit state.

A simplified lifecycle is:

```text
Created
   ↓
Validated
   ↓
Submitted
   ↓
Open
   ├── Matched
   ├── Partially Filled
   ├── Cancelled
   └── Failed
          │
          ▼
       Completed
```

The exact state mappings must follow the supported Polymarket trading interface.

The system must distinguish between:

* Internal order state
* External exchange/order state
* Position state

---

# 28. Execution Protection

Before submitting an order, the execution layer must validate:

```text
Current Market State
       ↓
Order Parameters
       ↓
Maximum Acceptable Price
       ↓
Available Liquidity
       ↓
Risk Limits
       ↓
System Health
```

If any required condition fails, the order must not be submitted.

---

# 29. Portfolio Layer

The portfolio layer maintains the internal representation of:

* Positions
* Orders
* Fills
* Exposure
* Realized PnL
* Unrealized PnL where applicable
* Fees

The portfolio layer must consume execution results.

It must not infer fills merely because an order was submitted.

---

# 30. Reconciliation Layer

The reconciliation layer compares internal state with authoritative external state.

Conceptually:

```text
Internal State
      │
      ├──────────────┐
      │              │
      ▼              ▼
Orders            Positions
      │              │
      └──────┬───────┘
             ▼
      External State
             │
             ▼
       Reconciliation
             │
       ┌─────┴─────┐
       ▼           ▼
    Matched     Mismatch
                   │
                   ▼
              Halt / Alert
```

The exact response to mismatches will be defined by the risk and operations specifications.

---

# 31. PnL Layer

PnL must be derived from actual or simulated execution records.

The logical chain is:

```text
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

Performance calculations must account for applicable fees and execution costs.

---

# 32. Opportunity Journal

The opportunity journal is a cross-cutting system component.

It records both:

```text
Trade
```

and:

```text
No Trade
```

The journal allows research to compare:

```text
Opportunity
    ↓
Decision
    ↓
Expected Outcome
    ↓
Actual Outcome
```

This is necessary for evaluating whether the decision system is correctly rejecting poor opportunities.

---

# 33. Research Architecture

Research must be able to operate without the live trading engine.

Conceptually:

```text
Historical Data
      ↓
Research Dataset
      ↓
Strategy
      ↓
Backtest
      ↓
Execution Simulation
      ↓
Results
      ↓
Experiment Record
```

Research must not depend on real capital.

---

# 34. Backtesting Architecture

The backtesting system consumes historical state.

```text
Historical Events
      ↓
Market Replay
      ↓
Strategy
      ↓
Signal
      ↓
Execution Simulator
      ↓
Risk Simulator
      ↓
Portfolio Simulator
      ↓
PnL
```

The backtester must not provide future information to the strategy.

---

# 35. Execution Simulation

The execution simulator should model relevant execution conditions.

Conceptually:

```text
Signal Timestamp
      ↓
Processing Delay
      ↓
Network / Execution Delay
      ↓
Book State at Execution
      ↓
Available Liquidity
      ↓
Queue / Fill Assumptions
      ↓
Partial Fill
      ↓
Final Execution
```

Not every element will be available in the first implementation.

Where an execution factor cannot be modeled accurately, the assumption must be explicitly documented rather than silently treated as reality.

---

# 36. Research Data Architecture Boundary

High-frequency event data and operational application state have different requirements.

The architecture therefore separates:

```text
Operational State
        ↓
PostgreSQL

Research / High-Frequency Data
        ↓
Parquet + DuckDB
```

PostgreSQL is intended for structured application state.

Parquet and DuckDB are intended for analytical and high-frequency research workloads.

The detailed schema is defined in:

```text
docs/04-data-architecture.md
```

---

# 37. Monitoring Architecture

Monitoring must observe all critical layers.

```text
Data Ingestion
      ↓
Market State
      ↓
Strategies
      ↓
Signals
      ↓
Risk
      ↓
Execution
      ↓
Portfolio
      ↓
PnL
```

Important metrics include:

* Data freshness
* Connection status
* Signal count
* Opportunity count
* Order count
* Fill rate
* Rejection rate
* Latency
* Slippage
* Fees
* PnL
* Drawdown
* Risk-limit events
* Reconciliation mismatches

---

# 38. Failure Boundaries

The architecture must distinguish between different failure classes.

## 38.1 Data Failure

Examples:

* WebSocket disconnect
* Missing market updates
* Stale data
* Invalid event

Expected response:

```text
Stop affected decisions
        ↓
Attempt recovery
        ↓
Revalidate state
        ↓
Resume only when healthy
```

---

## 38.2 Strategy Failure

A strategy may fail independently of the rest of the system.

Examples:

* Calculation error
* Invalid signal
* Unexpected strategy state

The failure should not bypass centralized risk or compromise unrelated strategies.

---

## 38.3 Execution Failure

Examples:

* Order rejection
* Cancellation failure
* Connectivity problem
* Unexpected order state

The system must reconcile external state before continuing.

---

## 38.4 Portfolio Failure

If internal portfolio state cannot be reconciled with external state, the system must not blindly continue trading.

A mismatch should trigger the appropriate safety response.

---

## 38.5 Infrastructure Failure

Examples:

* Process restart
* Machine restart
* Database failure
* Network failure

The system must recover from persistent state rather than assuming memory state survived.

---

# 39. Runtime Architecture

The initial implementation should use a modular application architecture rather than immediately deploying many independent microservices.

The logical modules may include:

```text
Market Ingestion
Wallet Ingestion
Market State
Whale Engine
BTC Engine
Anomaly Engine
Information Engine
Signal Fusion
Edge Calculator
Risk Engine
Execution Engine
Portfolio Engine
Research Engine
Monitoring
```

These modules may initially run within a smaller number of deployable processes.

Logical modularity does not require physical service separation.

---

# 40. Initial Runtime Direction

The initial runtime architecture should favor:

```text
Trading Application
       │
       ├── Market Data
       ├── Wallet Data
       ├── Strategy Engines
       ├── Signal Fusion
       ├── Risk
       ├── Execution
       └── Portfolio
              │
              ▼
         PostgreSQL
              │
              ▼
      Research Data Store
```

Redis may be used where appropriate for transient state, coordination, caching, or low-latency application needs.

The exact usage must be justified by implementation requirements.

The system should not introduce Kafka, Kubernetes, or a large microservice infrastructure without demonstrated need.

---

# 41. Process Boundaries

The system should conceptually separate at least:

```text
Research
```

from:

```text
Trading
```

and:

```text
Dashboard / API
```

The exact deployment arrangement may evolve.

The important requirement is that research workloads cannot accidentally submit live orders.

---

# 42. Configuration Boundary

Configuration must be separated from application logic.

Configuration categories include:

```text
Environment Configuration
Strategy Configuration
Risk Configuration
Execution Configuration
Market Configuration
Research Configuration
```

Sensitive credentials must remain outside source code.

---

# 43. Live Trading Boundary

Live trading is a privileged system boundary.

The flow must be:

```text
Research
   ↓
Paper
   ↓
Human Approval
   ↓
Live Configuration
   ↓
Risk Validation
   ↓
Live Execution
```

An AI coding agent must not independently cross this boundary.

---

# 44. Dashboard Boundary

The dashboard is an observability and control interface.

It may expose:

* System health
* Market state
* Signals
* Opportunities
* Orders
* Positions
* PnL
* Strategy health
* Risk state
* Research results

The dashboard must not bypass the trading engine's risk controls.

If administrative controls are exposed through the dashboard, they must follow the same authorization and safety requirements as other control paths.

---

# 45. API Boundary

If an API layer is implemented, it must act as an interface to application state and approved operations.

The API must not provide a path that bypasses:

* Risk validation
* Execution validation
* Authentication
* Authorization
* State reconciliation

---

# 46. Security Boundary

Security-sensitive components include:

* Private keys
* API credentials
* Wallet configuration
* Trading permissions
* Environment secrets

These must remain outside ordinary application source code.

The architecture must prevent research or dashboard components from unnecessarily accessing trading credentials.

---

# 47. State Ownership

Each major state category should have a clear owner.

| State                         | Primary Owner         |
| ----------------------------- | --------------------- |
| Market metadata               | Market data layer     |
| Normalized market state       | Truth layer           |
| Strategy state                | Strategy engine       |
| Signal state                  | Signal layer          |
| Risk state                    | Risk engine           |
| Order state                   | Execution engine      |
| Position state                | Portfolio layer       |
| External reconciliation state | Reconciliation layer  |
| Research experiments          | Research system       |
| Project decisions             | Project documentation |

No component should silently become the authority for state owned by another component.

---

# 48. Data Flow Summary

The primary trading data flow is:

```text
Polymarket / External Sources
            ↓
      Data Ingestion
            ↓
       Normalization
            ↓
        Truth Layer
            ↓
       Market State
            ↓
       Strategy Engines
            ↓
       Signal Fusion
            ↓
       Edge Calculation
            ↓
    Execution Cost Model
            ↓
         Risk Engine
            ↓
      Execution Engine
            ↓
       Order Lifecycle
            ↓
       Portfolio State
            ↓
      Reconciliation
            ↓
          PnL
            ↓
     Performance Analysis
```

---

# 49. Research Data Flow

The primary research flow is:

```text
Raw Historical Data
        ↓
Data Validation
        ↓
Normalized Dataset
        ↓
Market Replay
        ↓
Strategy
        ↓
Execution Simulator
        ↓
Risk Simulator
        ↓
Portfolio Simulator
        ↓
Performance Metrics
        ↓
Experiment Record
```

---

# 50. Wallet Intelligence Data Flow

```text
Wallet Activity
       ↓
Normalization
       ↓
Address Classification
       ↓
Market Association
       ↓
FIFO Reconstruction
       ↓
Realized PnL
       ↓
Behavioral Features
       ↓
Copyability Analysis
       ↓
Whale Signal
```

---

# 51. BTC Data Flow

```text
External BTC Feed
       │
       ▼
BTC Normalization
       │
       ├───────────────┐
       │               │
       ▼               ▼
BTC Research      BTC Strategy
                       │
Polymarket BTC Market ─┘
                       │
                       ▼
                Lead-Lag Analysis
                       │
                       ▼
                 Signal Generation
```

The BTC strategy must also consider the actual Polymarket market resolution mechanism.

---

# 52. Anomaly Data Flow

```text
Market A
    │
Market B
    │
Market Family
    │
Orderbook State
    │
    ▼
Relationship Validation
    ↓
Dislocation Detection
    ↓
Depth Analysis
    ↓
Execution Cost
    ↓
Opportunity Decay
    ↓
Executable Opportunity
```

---

# 53. Strategy-to-Execution Contract

A strategy must provide enough information for the execution and risk layers to evaluate its proposal.

At minimum, a trade intent should identify:

* Strategy
* Market
* Direction
* Desired quantity
* Maximum acceptable price
* Validity
* Expected edge
* Reason
* Relevant signal
* Required execution behavior

The strategy must not directly invoke low-level exchange operations.

---

# 54. Risk-to-Execution Contract

The risk engine must explicitly communicate whether a trade is:

```text
APPROVED
```

or:

```text
REJECTED
```

An approval must be associated with the relevant trade intent and risk evaluation.

An execution component must not reinterpret a rejected trade as approved.

---

# 55. Execution-to-Portfolio Contract

The execution engine reports actual order and fill events.

The portfolio layer uses these events to update position state.

```text
Execution Event
      ↓
Fill
      ↓
Portfolio Update
      ↓
PnL Update
```

An order submission alone must not create a filled position.

---

# 56. Architecture Constraints

The following constraints are mandatory.

### Constraint 1

Strategies cannot bypass the risk engine.

### Constraint 2

Risk cannot be bypassed by dashboard or API operations.

### Constraint 3

Research code cannot submit live orders.

### Constraint 4

Paper trading cannot use live execution credentials.

### Constraint 5

Live trading cannot be activated by an AI coding agent.

### Constraint 6

External data cannot be treated as authoritative without identifying its role.

### Constraint 7

A theoretical opportunity cannot automatically become an executable opportunity.

### Constraint 8

Internal position state cannot be considered authoritative when reconciliation shows a mismatch.

### Constraint 9

Unknown information must remain unknown until verified.

### Constraint 10

Logical modularity must come before physical service decomposition.

---

# 57. Architectural Evolution

The architecture is expected to evolve as the system produces evidence about its actual requirements.

Possible future changes include:

* Separating high-frequency trading processes
* Dedicated execution infrastructure
* Dedicated research workers
* More specialized data services
* Additional storage systems
* More advanced queue or event infrastructure

These changes must be justified by actual requirements.

The system must not adopt distributed infrastructure merely because it appears more sophisticated.

---

# 58. Architecture Decision Rules

When evaluating a new architectural component, the following questions must be answered:

1. What requirement does it satisfy?
2. What problem does it solve?
3. Can the existing architecture solve the problem?
4. What operational complexity does it introduce?
5. What failure modes does it introduce?
6. Does it improve reliability, latency, scalability, or correctness?
7. Is that improvement actually required?
8. Can the component be tested independently?
9. Does it create a new security boundary?
10. Does it affect live trading risk?

If these questions cannot be answered, the component should not be added by default.

---

# 59. Architecture and Evidence

Architecture decisions must distinguish between:

```text
Confirmed Requirement
```

```text
Current Design Decision
```

and:

```text
Future Research Hypothesis
```

A research hypothesis must not silently become a production dependency.

For example:

```text
"BTC lead-lag exists"
```

is a research hypothesis.

The architecture may support measuring it.

The architecture must not assume that it is profitable.

---

# 60. Architecture Completion Criteria

This architecture is considered sufficiently defined for the next planning stage when:

* Major system boundaries are defined.
* Data flows are defined.
* Strategy boundaries are defined.
* Risk boundaries are defined.
* Execution boundaries are defined.
* Portfolio and reconciliation responsibilities are defined.
* Research is separated from live trading.
* State ownership is defined.
* Failure boundaries are defined.
* AI agent restrictions are preserved.
* No unverified trading edge is embedded as an architectural assumption.

---

# 61. Next Document

The next document is:

```text
docs/03-technical-stack.md
```

That document will define the approved technology direction, language responsibilities, frameworks, libraries, storage technologies, development tooling, and integration approach.

Technology choices must remain consistent with the architecture and requirements defined in this document.
