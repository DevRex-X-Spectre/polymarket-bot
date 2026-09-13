# Polymarket Trading Bot

## Monitoring and Operations

**Document:** `docs/infrastructure/51-monitoring-and-operations.md`
**Status:** Approved
**Document Type:** Monitoring and Operations Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`
* `docs/research/31-execution-simulation.md`
* `docs/risk/40-risk-and-safety.md`
* `docs/infrastructure/50-development-and-deployment.md`

---

# 1. Purpose

This document defines the observability and operational framework for the Polymarket trading bot.

The system must make it possible to answer:

* Is the bot running?
* Is market data healthy?
* Is external data healthy?
* Is the strategy producing signals?
* Are signals becoming executable opportunities?
* Are orders being submitted correctly?
* Are orders filling as expected?
* Is portfolio state correct?
* Is risk operating correctly?
* Is the strategy still producing edge?
* Has execution quality deteriorated?
* Is the infrastructure healthy?
* Is intervention required?

---

# 2. Core Principle

A trading system must be observable at every important boundary.

The architecture should make the following chain traceable:

```text
Market Data
    ↓
Market State
    ↓
Signal
    ↓
Opportunity
    ↓
Edge
    ↓
Risk Decision
    ↓
Order Intent
    ↓
Order
    ↓
Fill
    ↓
Position
    ↓
PnL
    ↓
Strategy Health
```

If a stage cannot be observed, diagnosing failures becomes unnecessarily difficult.

---

# 3. Observability Layers

Monitoring is divided into:

```text
SYSTEM
DATA
STRATEGY
EXECUTION
RISK
PORTFOLIO
INFRASTRUCTURE
SECURITY
```

Each layer should have its own health indicators.

---

# 4. System Health

System health should answer:

```text
Is the application functioning?
```

Monitor:

* Process status
* Startup status
* Runtime mode
* Application errors
* Restart count
* Internal health state
* Dependency availability

---

# 5. Liveness

Liveness answers:

> Is the process still running?

A failed liveness check indicates that the application may be unavailable.

Liveness must not be interpreted as trading readiness.

---

# 6. Readiness

Readiness answers:

> Is the system sufficiently healthy to perform its configured function?

For live trading, readiness should depend on relevant:

* Data health
* Risk health
* Execution health
* Portfolio reconciliation
* Configuration validity
* Required dependency availability

---

# 7. Trading Readiness

Trading readiness should be explicit.

Possible states:

```text
STARTING
READY
DEGRADED
PAUSED
STOPPED
FAILED
```

A system can be:

```text
RUNNING
```

while simultaneously being:

```text
NOT READY TO TRADE
```

---

# 8. Runtime Mode

Monitoring must always expose the current mode:

```text
RESEARCH
PAPER
LIVE
```

This is especially important for preventing confusion between simulated and real activity.

---

# 9. Data Monitoring

The market-data layer should monitor:

* WebSocket connection
* Subscription status
* Last event received
* Event processing
* Orderbook state
* Data freshness
* Missing events
* Reconnection count
* Recovery status

---

# 10. Market WebSocket Health

For the CLOB market WebSocket, monitor:

* Connection state
* Subscription state
* Last received event
* Last processed event
* Reconnection attempts
* Successful reconnects
* Recovery completion

---

# 11. User WebSocket Health

Where authenticated user streams are used, monitor:

* Connection state
* Authentication state
* Last event
* Order updates
* Trade updates
* Reconnection state

User-stream health is important for accurate execution and portfolio reconciliation.

---

# 12. Data Freshness

Freshness should be measured independently for each important data source.

Examples:

```text
CLOB
External BTC Feed
Chainlink-related Data
Gamma
Data API
Subgraphs
```

The system should not use one global freshness value for unrelated sources.

---

# 13. Stale Data

When data becomes stale, the system should identify:

* Source
* Market
* Strategy
* Last valid timestamp
* Last received timestamp
* Current state

Strategies requiring that data should stop producing live orders when their validated freshness conditions are no longer satisfied.

---

# 14. Missing Data

Missing data should be observable.

The system should distinguish:

```text
No Event Expected
```

from:

```text
Expected Event Missing
```

This prevents normal inactivity from being confused with data failure.

---

# 15. Orderbook Monitoring

The system should monitor:

* Best bid
* Best ask
* Spread
* Depth
* Last trade
* Book update frequency
* Tick size
* Minimum order size

Abnormal or invalid book states should be flagged.

---

# 16. Orderbook Consistency

The reconstructed local book should be validated against available authoritative state where practical.

Potential issues include:

* Negative quantities
* Invalid prices
* Missing levels
* Invalid tick size
* Unexpected state transitions

---

# 17. External BTC Feed Monitoring

BTC-dependent strategies should monitor the external feed independently.

Metrics may include:

* Connection state
* Last update
* Update frequency
* Price
* Timestamp quality
* Reconnection state

---

# 18. Resolution Data Monitoring

Markets approaching resolution require reliable resolution information.

The system should monitor:

* Market status
* Resolution metadata
* Resolution source
* Resolution state
* Relevant updates

The bot must not infer resolution from unrelated data.

---

# 19. Data Recovery

When a streaming connection is interrupted:

```text
Disconnect
   ↓
Reconnect
   ↓
Restore Subscription
   ↓
Refresh Snapshot
   ↓
Rebuild State
   ↓
Validate
   ↓
Resume
```

The monitoring system should expose the recovery state.

---

# 20. Signal Monitoring

Monitor:

* Signal count
* Signal frequency
* Signal direction
* Signal strength
* Signal confidence
* Signal expiration
* Signal rejection
* Signal-to-opportunity conversion

---

# 21. Signal Anomalies

Unexpected changes in signal behavior should be detectable.

Examples:

* Sudden signal spike
* Zero signals for an unexpectedly long period
* Unusual directional bias
* Unexpected confidence distribution
* Repeated identical signals

These observations should trigger investigation rather than automatic conclusions.

---

# 22. Opportunity Monitoring

Monitor:

* Opportunity count
* Theoretical edge
* Executable edge
* Opportunity duration
* Opportunity decay
* Capture rate
* Missed opportunity rate
* Reason for non-execution

---

# 23. Opportunity Lifecycle

Each opportunity should be traceable through:

```text
DETECTED
   ↓
VALIDATED
   ↓
EXECUTABLE
   ↓
RISK CHECK
   ↓
EXECUTED
```

or:

```text
DETECTED
   ↓
REJECTED / EXPIRED / MISSED
```

---

# 24. Execution Monitoring

Monitor:

* Order submissions
* Accepted orders
* Rejected orders
* Cancellations
* Fills
* Partial fills
* Failed orders
* Unknown orders
* Execution latency
* Fill latency

---

# 25. Order State Monitoring

The system should expose order state clearly.

Relevant states include:

```text
PENDING
OPEN
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELLED
REJECTED
EXPIRED
UNKNOWN
```

The exact implementation may use the Polymarket order lifecycle while preserving these operational distinctions.

---

# 26. Trade Lifecycle Monitoring

Authenticated trade lifecycle events should be monitored where applicable:

```text
MATCHED
MINED
CONFIRMED
RETRYING
FAILED
```

This provides visibility from matching through settlement-related progression.

---

# 27. Execution Latency

Measure latency between relevant timestamps:

```text
Signal
→ Decision
→ Submission
→ Exchange Arrival
→ Match
→ Confirmation
```

The exact available timestamps depend on the integration and data source.

---

# 28. Latency Distribution

Average latency alone is insufficient.

Monitor:

* Median
* Distribution
* High-latency events
* Variance
* Time-series changes

The exact statistical measures can evolve with the implementation.

---

# 29. Execution Quality

Monitor:

* Expected execution price
* Actual execution price
* Slippage
* Fees
* Fill quantity
* Requested quantity
* VWAP
* Price improvement or deterioration

---

# 30. Fill Rate

Fill rate should be tracked by:

* Strategy
* Market
* Order type
* Side
* Execution mode

This helps determine whether a strategy's assumed execution model remains valid.

---

# 31. Partial Fill Rate

Partial fills should be monitored separately from complete fills.

A high partial-fill rate may indicate:

* Insufficient liquidity
* Incorrect sizing
* Increased competition
* Faster opportunity decay

The system should measure the behavior rather than automatically assuming its cause.

---

# 32. Risk Monitoring

Monitor:

* Risk approvals
* Risk rejections
* Exposure
* Capital
* Open orders
* Strategy limits
* Market limits
* Global limits
* Kill-switch state

---

# 33. Risk Rejection Analysis

Every rejected trade should have an observable reason.

This enables analysis of whether the system is rejecting:

* Bad opportunities
* Stale opportunities
* Unsafe opportunities
* Operationally impossible opportunities

---

# 34. Kill Switch Monitoring

The kill switch must have a clearly visible state:

```text
ARMED
TRIGGERED
RESET_PENDING
READY
```

The exact state model may evolve.

A triggered kill switch must not silently reset.

---

# 35. Portfolio Monitoring

Monitor:

* Total capital
* Available capital
* Reserved capital
* Open positions
* Outstanding orders
* Realized PnL
* Unrealized PnL
* Net PnL
* Exposure

---

# 36. Position Reconciliation

The system should continuously or periodically compare:

```text
Local Position
vs
Authoritative Account Position
```

The appropriate frequency depends on implementation and operational requirements.

---

# 37. Reconciliation Status

Possible states:

```text
RECONCILED
PENDING
MISMATCH
FAILED
UNKNOWN
```

A material reconciliation failure should affect live trading readiness.

---

# 38. PnL Monitoring

PnL must be derived from actual fills and portfolio state.

Monitor:

* Realized PnL
* Unrealized PnL
* Fees
* Slippage
* Strategy PnL
* Market PnL
* Portfolio PnL

---

# 39. PnL Reconciliation

PnL should be reconciled against:

```text
Fills
+
Fees
+
Position Changes
+
Account State
```

Unexpected differences must be investigated.

---

# 40. Strategy Health

Each strategy should have a health record.

Relevant metrics include:

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
* Expected vs realized PnL

---

# 41. Strategy Health States

Strategies may be represented as:

```text
HEALTHY
DEGRADED
PAUSED
DISABLED
```

State transitions must follow explicit rules.

---

# 42. Strategy Degradation

Monitoring should identify deterioration in:

* Edge
* Fill rate
* Opportunity duration
* Execution quality
* Slippage
* Latency
* Market liquidity

No automatic degradation threshold is defined in this document.

Such thresholds must be established through research and risk review.

---

# 43. Edge Monitoring

Monitor:

```text
Expected Edge
vs
Realized Edge
```

A persistent gap may indicate:

* Model error
* Execution error
* Data issue
* Competition
* Market regime change

---

# 44. Edge Attribution

Where implemented, PnL should be attributed to sources such as:

* BTC lead-lag
* Orderbook imbalance
* Whale intelligence
* Market dislocation
* Timing
* Information/regime

Execution effects should be tracked separately.

---

# 45. Competition Monitoring

The system should monitor market conditions that may indicate increased competition.

Relevant signals include:

* Taker concentration
* Repeated takers
* Maker activity
* Execution density
* Opportunity duration
* Spread compression
* Capture-rate changes

---

# 46. Wallet Intelligence Monitoring

Wallet intelligence should monitor:

* Wallet activity
* Trade frequency
* Historical performance
* Holding time
* Entry edge
* Copyability
* Stale trades
* Simulated copy performance

A wallet should not be treated as reliable solely because it has historical profits.

---

# 47. Address Classification

Monitoring should preserve address classification where available:

```text
EOA
CONTRACT
CTF_EXCHANGE
KNOWN_PROTOCOL
MARKET_MAKER
BOT
HUMAN
UNKNOWN
```

This prevents infrastructure addresses from being misinterpreted as individual traders.

---

# 48. Infrastructure Monitoring

Monitor:

* CPU
* Memory
* Disk
* Network
* Database health
* Redis health
* Container health
* Process restarts

---

# 49. Resource Pressure

Resource pressure should be detected before it causes application failure.

Potential indicators include:

* Memory growth
* High CPU utilization
* Disk exhaustion
* Database connection exhaustion
* Increasing processing delay

Exact operational thresholds must be determined from the deployed environment.

---

# 50. Database Monitoring

Monitor:

* Connection health
* Query failures
* Query latency
* Storage usage
* Migration status
* Backup status
* Recovery status

---

# 51. Redis Monitoring

Where Redis is used, monitor:

* Connection health
* Memory usage
* Errors
* Availability
* Key expiration behavior where relevant

Redis failure must not silently invalidate authoritative portfolio state.

---

# 52. Disk Monitoring

Disk usage is especially important for:

* Logs
* PostgreSQL
* Research datasets
* Temporary files
* Docker storage

The system should prevent uncontrolled disk growth.

---

# 53. Log Management

Logs should be:

* Structured
* Timestamped
* Searchable
* Redacted
* Retained according to operational requirements

High-frequency event data should not necessarily be written as verbose application logs.

---

# 54. Sensitive Data in Logs

The following must never appear in logs:

* Private keys
* API secrets
* Authentication signatures
* Sensitive credentials

Identifiers should be redacted where necessary.

---

# 55. Alerting

Alerts should focus on actionable failures.

Potential alert categories:

```text
CRITICAL
HIGH
MEDIUM
INFO
```

The exact classification should be refined during implementation.

---

# 56. Critical Alerts

Potential critical conditions include:

* Kill switch triggered
* Portfolio reconciliation failure
* Unknown live order state
* Wallet mismatch
* Risk engine failure
* Live execution boundary failure
* Corrupted market state
* Database failure affecting trading state

---

# 57. High-Priority Alerts

Potential high-priority conditions include:

* Market-data disconnection
* External BTC feed failure
* Repeated order failures
* Significant execution degradation
* Unexpected strategy behavior
* Persistent high latency

---

# 58. Medium Alerts

Examples:

* Increased partial fills
* Reduced opportunity capture
* Increasing slippage
* Strategy degradation
* Resource pressure

---

# 59. Informational Events

Examples:

* Deployment completed
* Strategy paused manually
* Reconnection succeeded
* Backtest completed
* Paper-trading session started

---

# 60. Alert Fatigue

The system should not generate alerts for every ordinary event.

Alerts should represent conditions requiring attention.

Repeated occurrences should be aggregated where appropriate.

---

# 61. Alert Deduplication

The monitoring system should avoid sending repeated identical alerts indefinitely.

An alert should have enough context to identify:

* Component
* Market
* Strategy
* Severity
* First occurrence
* Current state

---

# 62. Alert Recovery

Alerts should distinguish:

```text
TRIGGERED
```

from:

```text
RECOVERED
```

This allows operators to know whether an issue is ongoing or resolved.

---

# 63. Incident Management

Operational incidents should follow:

```text
Detect
 ↓
Assess
 ↓
Contain
 ↓
Reconcile
 ↓
Recover
 ↓
Review
```

---

# 64. Incident Severity

Severity should reflect potential impact.

Examples:

### Critical

Potential uncontrolled live trading or incorrect portfolio state.

### High

Trading degraded or major dependency unavailable.

### Medium

Important subsystem degraded without immediate capital danger.

### Low

Non-critical operational issue.

---

# 65. Incident Containment

Containment may include:

* Pause strategy
* Stop new orders
* Cancel open orders where appropriate
* Trigger global kill switch
* Disconnect strategy
* Disable live mode

The correct response depends on the incident.

---

# 66. Incident Investigation

Investigation should preserve:

* Logs
* Orders
* Fills
* Signals
* Risk decisions
* Market state
* Deployment version
* Configuration version

Evidence should not be deleted before investigation is complete.

---

# 67. Incident Review

After a significant incident, determine:

* What happened?
* When did it happen?
* What detected it?
* What failed?
* What prevented worse impact?
* What caused the failure?
* Was documentation correct?
* What should change?

---

# 68. Operational Runbooks

The project should maintain runbooks for:

```text
Startup
Shutdown
Deployment
Rollback
Kill Switch
Reconciliation
WebSocket Recovery
External Feed Recovery
Database Recovery
Credential Rotation
Strategy Pause
Strategy Resume
```

---

# 69. Startup Runbook

Startup should follow:

```text
Validate Configuration
        ↓
Start Dependencies
        ↓
Start Application
        ↓
Connect Data Sources
        ↓
Load State
        ↓
Reconcile
        ↓
Run Health Checks
        ↓
Enter Correct Mode
```

---

# 70. Shutdown Runbook

Normal shutdown should:

```text
Stop New Orders
        ↓
Handle Existing Orders
        ↓
Persist State
        ↓
Close Connections
        ↓
Stop Services
```

Live shutdown behavior must account for orders that remain on the exchange.

---

# 71. Kill-Switch Runbook

When the kill switch is triggered:

```text
Stop New Orders
        ↓
Assess Existing Orders
        ↓
Reconcile
        ↓
Assess Positions
        ↓
Investigate Cause
        ↓
Explicit Resume
```

---

# 72. Reconciliation Runbook

If state mismatch occurs:

```text
Stop Unsafe Trading
        ↓
Fetch Authoritative State
        ↓
Compare Local State
        ↓
Identify Difference
        ↓
Repair State
        ↓
Validate
        ↓
Resume Only When Safe
```

---

# 73. WebSocket Incident Runbook

For a streaming failure:

```text
Detect Disconnect
        ↓
Attempt Reconnect
        ↓
Restore Subscription
        ↓
Refresh State
        ↓
Validate Data
        ↓
Mark Ready
```

If recovery fails, the affected strategy should not continue trading using stale data.

---

# 74. Database Incident Runbook

For database failure:

```text
Detect
 ↓
Stop Unsafe Trading
 ↓
Assess Database
 ↓
Restore / Repair
 ↓
Validate Data
 ↓
Reconcile Exchange State
 ↓
Resume
```

---

# 75. Deployment Incident Runbook

For a bad deployment:

```text
Identify Release
 ↓
Stop Unsafe Trading if Necessary
 ↓
Rollback Application
 ↓
Validate Database Compatibility
 ↓
Reconcile Exchange State
 ↓
Run Health Checks
 ↓
Resume Only After Approval
```

---

# 76. Monitoring Dashboard

The eventual dashboard should expose a high-level operational view.

Suggested sections:

```text
SYSTEM
DATA
STRATEGIES
OPPORTUNITIES
ORDERS
POSITIONS
PNL
RISK
INFRASTRUCTURE
ALERTS
```

---

# 77. System Dashboard

Display:

* Runtime mode
* Readiness
* Process state
* Version
* Uptime
* Last deployment
* Active incidents

---

# 78. Data Dashboard

Display:

* CLOB connection
* User stream connection
* External feed status
* Data freshness
* Reconnect count
* Active markets
* Invalid-data warnings

---

# 79. Strategy Dashboard

For each strategy:

* Status
* Signals
* Opportunities
* Executions
* Fill rate
* Edge
* PnL
* Drawdown
* Latency
* Strategy health

---

# 80. Execution Dashboard

Display:

* Open orders
* Recent fills
* Rejections
* Cancellations
* Partial fills
* Execution latency
* Slippage
* Fees
* Unknown orders

---

# 81. Portfolio Dashboard

Display:

* Capital
* Available capital
* Reserved capital
* Positions
* Exposure
* Realized PnL
* Unrealized PnL
* Net PnL
* Reconciliation state

---

# 82. Risk Dashboard

Display:

* Global risk state
* Strategy risk state
* Market exposure
* Risk rejections
* Active limits
* Kill-switch state
* Recent risk events

---

# 83. Infrastructure Dashboard

Display:

* CPU
* Memory
* Disk
* Network
* Database
* Redis
* Process restarts
* Deployment state

---

# 84. Research Monitoring

Research environments should also expose:

* Dataset status
* Experiment status
* Backtest progress
* Simulation progress
* Failed experiments
* Dataset quality

Research monitoring should remain separate from live operational alerts.

---

# 85. Auditability

The system should allow an operator to answer:

```text
Why did this order happen?
```

by tracing:

```text
Market State
→ Signal
→ Opportunity
→ Edge
→ Risk
→ Order
→ Fill
→ Position
→ PnL
```

---

# 86. Traceability IDs

Important entities should have stable identifiers.

Examples:

```text
Market ID
Signal ID
Opportunity ID
Order Intent ID
Order ID
Trade ID
Fill ID
Position ID
Experiment ID
Deployment ID
Incident ID
```

---

# 87. Strategy Health Automation

Automated health mechanisms may eventually:

* Pause degraded strategies
* Disable failed strategies
* Reduce operational activity
* Trigger alerts

However, automatic strategy controls must be explicitly defined and approved.

---

# 88. No Automatic Recovery to Live

The system must not automatically return a disabled live strategy to normal live trading solely because metrics improve.

A controlled resume path is required.

---

# 89. Operational Metrics

The project should maintain a core operational metric set.

### System

* Uptime
* Restart count
* Error rate

### Data

* Freshness
* Disconnects
* Recovery time

### Execution

* Fill rate
* Latency
* Slippage
* Rejection rate

### Strategy

* Signal count
* Opportunity count
* Capture rate
* Realized edge

### Risk

* Rejections
* Exposure
* Limit events
* Kill-switch events

---

# 90. Reliability Measurement

Reliability should be measured from actual operation rather than assumed.

The project should track:

* Failure frequency
* Recovery duration
* Data interruptions
* Execution failures
* Deployment failures

This evidence can guide later infrastructure decisions.

---

# 91. Operational Baselines

Initial observations should establish normal system behavior.

Examples:

* Normal event rate
* Normal processing latency
* Normal execution latency
* Normal resource consumption
* Normal signal frequency

These are observations, not hardcoded limits.

---

# 92. Baseline Drift

If system behavior changes materially from established baselines, monitoring should flag the change.

Examples:

```text
Normal latency
→
Increasing latency
```

or:

```text
Normal signal frequency
→
Unexpected signal spike
```

---

# 93. Monitoring Data Retention

Operational metrics and logs should be retained long enough to investigate incidents and analyze strategy behavior.

High-frequency raw market data should follow its separate research-data retention policy.

---

# 94. Monitoring Security

Monitoring interfaces must not expose:

* Private keys
* API credentials
* Sensitive authentication material

Authentication and access control must be applied to operational dashboards where required.

---

# 95. Monitoring and AI Agents

AI agents may use monitoring information for:

* Debugging
* Performance analysis
* Incident investigation
* Research
* Documentation

They must not interpret monitoring data as authorization to change live risk or capital settings.

---

# 96. Operational Source of Truth

For operational state:

```text
Authoritative Exchange State
        +
Persistent Application State
        +
Validated Data State
```

should be used together.

A dashboard alone is not authoritative.

---

# 97. Explicit Non-Assumptions

The monitoring system does not assume:

1. A running process is healthy.
2. A healthy process is ready to trade.
3. A WebSocket connection guarantees valid data.
4. A successful reconnect guarantees correct state.
5. Positive PnL means the strategy is healthy.
6. A high fill rate means execution is good.
7. Low CPU usage means the trading system is reliable.
8. A single metric is sufficient to evaluate strategy health.
9. Automated recovery is always safe.
10. An alert automatically identifies the root cause.
11. Dashboard state is authoritative exchange state.
12. Historical operational baselines remain permanently valid.

---

# 98. Completion Criteria

The monitoring and operations system is complete when:

* Liveness monitoring exists.
* Readiness monitoring exists.
* Trading readiness is explicit.
* Runtime mode is visible.
* Market-data health is observable.
* External feed health is observable.
* Orderbook health is observable.
* Signal health is observable.
* Opportunity health is observable.
* Execution health is observable.
* Order lifecycle is observable.
* Trade lifecycle is observable.
* Risk state is observable.
* Portfolio state is observable.
* Reconciliation state is observable.
* Strategy health is observable.
* Infrastructure health is observable.
* Alerts exist for critical operational failures.
* Alerts distinguish active and recovered conditions.
* Kill-switch state is visible.
* Incidents can be investigated from preserved evidence.
* Operational runbooks exist.
* Deployments are traceable.
* Monitoring does not expose secrets.
* Live trading does not automatically resume after failure.
* The system can explain why an order happened or did not happen.

---

# 99. Next Document

The next document is:

```text
docs/engineering/60-engineering-standards.md
```

That document will define the project's coding standards, architecture discipline, TypeScript/Python conventions, error handling, dependency management, logging standards, security practices, documentation rules, code review requirements, and engineering quality gates.
