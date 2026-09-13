# Polymarket Trading Bot

## Risk and Safety

**Document:** `docs/risk/40-risk-and-safety.md`
**Status:** Approved
**Document Type:** Risk and Safety Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/12-trading-and-execution.md`
* `docs/strategies/20-strategy-framework.md`
* `docs/strategies/22-signal-fusion-and-edge.md`
* `docs/research/30-research-and-backtesting.md`
* `docs/research/31-execution-simulation.md`

---

# 1. Purpose

This document defines the risk-management and safety framework for the Polymarket trading bot.

The risk system exists to prevent the bot from turning:

```text
Strategy Error
Data Error
Execution Error
Infrastructure Failure
Configuration Error
Market Risk
```

into uncontrolled capital loss.

Risk controls are part of the trading system itself.

They are not optional monitoring features.

---

# 2. Core Risk Principle

The bot must never trade simply because a strategy produces a signal.

The required flow is:

```text
Signal
  ↓
Edge Evaluation
  ↓
Risk Evaluation
  ↓
Execution Approval
  ↓
Order Submission
```

If risk approval fails:

```text
NO TRADE
```

---

# 3. Risk Hierarchy

Risk is hierarchical:

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

A lower-level approval must never override a higher-level restriction.

---

# 4. Global Risk

Global risk controls protect the entire account and trading system.

Global controls may consider:

* Total exposure
* Available capital
* Total open positions
* Total outstanding orders
* Aggregate loss
* System health
* Data health
* Execution health
* Infrastructure health
* Market-wide conditions

---

# 5. Strategy Risk

Each strategy must have independent risk state.

A strategy may be:

```text
ACTIVE
DEGRADED
PAUSED
DISABLED
```

A strategy-level failure must not automatically imply that every other strategy is invalid.

---

# 6. Market Risk

Market-level controls protect against excessive concentration in one market.

Relevant factors include:

* Position size
* Available liquidity
* Spread
* Time to resolution
* Market status
* Resolution uncertainty
* Market-specific execution conditions

---

# 7. Trade Risk

Each trade opportunity must be evaluated independently.

Trade-level evaluation should consider:

* Expected edge
* Execution quality
* Position impact
* Capital requirement
* Market exposure
* Strategy exposure
* Existing position
* Correlated exposure

---

# 8. Order Risk

Every individual order must pass order-level checks before submission.

Checks should include:

* Valid market
* Valid token
* Valid side
* Valid quantity
* Valid price
* Tick size
* Minimum order size
* Price protection
* Available capital
* Strategy authorization
* Risk authorization

---

# 9. Risk as an Independent Boundary

Strategies must not directly bypass the risk engine.

The intended architecture is:

```text
Strategy
   ↓
Execution Intent
   ↓
Risk Engine
   ↓
Approved / Rejected
   ↓
Execution Engine
```

A strategy must not be able to submit a live order directly.

---

# 10. Risk Decision

A risk decision should produce an explicit result.

Conceptually:

```text
APPROVED
REJECTED
DEFERRED
```

Where useful, the result should contain a reason.

---

# 11. Rejection Reasons

Risk rejection should be explainable.

Examples:

```text
INSUFFICIENT_CAPITAL
EXPOSURE_LIMIT
STRATEGY_PAUSED
MARKET_LIMIT
ORDER_LIMIT
STALE_DATA
STALE_SIGNAL
INVALID_MARKET
PRICE_PROTECTION
INSUFFICIENT_EDGE
EXECUTION_UNCERTAINTY
SYSTEM_UNHEALTHY
MANUAL_KILL_SWITCH
```

The exact set may evolve as implementation progresses.

---

# 12. Capital Protection

The bot must never assume unlimited capital.

Before submitting an order, it must determine whether the required capital is available under the current portfolio state.

Capital calculations must account for relevant:

* Existing positions
* Open orders
* Reserved funds
* Pending execution
* Fees
* Other approved exposure

---

# 13. Available Capital

The concept of available capital must be explicit.

The system should distinguish between:

```text
Total Capital
Reserved Capital
Committed Capital
Available Capital
```

These values must reconcile with portfolio state.

---

# 14. Position Exposure

Risk calculations must consider current positions before approving additional trades.

A new order can increase exposure even when the order itself appears small.

---

# 15. Outstanding Orders

Unfilled orders represent potential future exposure.

Risk calculations must therefore consider outstanding orders rather than only filled positions.

---

# 16. Concentration Risk

The bot should identify excessive concentration.

Concentration may occur across:

* One market
* One event
* One asset
* One strategy
* One market family
* One direction

Specific concentration limits must be established through research and risk review rather than invented here.

---

# 17. Correlated Exposure

Different markets may expose the portfolio to the same underlying risk.

Example:

```text
Market A
Market B
Market C
   ↓
Same Underlying Event
```

These positions should not automatically be treated as independent.

The portfolio risk model should eventually support grouped exposure.

---

# 18. Market Resolution Risk

Polymarket markets resolve according to their specified resolution mechanism.

Risk analysis must therefore consider:

* Resolution source
* Resolution conditions
* Resolution timing
* Potential ambiguity
* Market status

The bot must not assume that the price alone determines settlement.

---

# 19. Resolution Uncertainty

If resolution information is incomplete, ambiguous, or inconsistent with the bot's validated market identity, the system should avoid treating the market as normal trading inventory.

This may result in:

```text
REJECT
PAUSE
MANUAL REVIEW
```

depending on severity.

---

# 20. Data Risk

Incorrect market data can produce incorrect trades.

The risk engine must consider data health.

Potential failures include:

* Missing updates
* Stale orderbook
* WebSocket disconnect
* Invalid market state
* Delayed external feed
* Timestamp inconsistency
* Market identity mismatch

---

# 21. Data Freshness

Latency-sensitive strategies require fresh data.

If required inputs become stale beyond the strategy's validated operating conditions, the trade should be rejected.

No universal stale-data threshold is defined here.

The appropriate threshold must be established by strategy research and execution testing.

---

# 22. Signal Freshness

Signals must have an explicit validity period.

A signal that was valid at:

```text
T0
```

must not automatically remain valid at:

```text
T1
```

after market conditions have changed.

---

# 23. Edge Recalculation

Where execution conditions materially change, the expected edge should be recalculated before order submission.

Examples:

* Price changed
* Spread changed
* Depth changed
* External feed changed
* Time-to-resolution changed
* Fees changed
* Opportunity decayed

---

# 24. Price Protection

Every aggressive execution should have a maximum acceptable execution price.

Conceptually:

```text
Observed Ask
     ↓
Maximum Acceptable Price
     ↓
Within Protection?
   /          \
 YES          NO
 ↓             ↓
Execute       Reject
```

The system must never use unrestricted execution logic.

---

# 25. Quantity Protection

Orders must respect:

* Strategy-defined quantity
* Available capital
* Market minimum order size
* Risk limits
* Portfolio exposure

An order should not increase size simply because additional liquidity is visible.

---

# 26. Slippage Risk

Expected profitability must account for realistic execution price.

A trade that is profitable at the displayed price but unprofitable after depth-aware execution should be rejected.

---

# 27. Fee Risk

Fees must be included when evaluating expected net edge.

Dynamic market fee information must be obtained from the applicable Polymarket market information rather than assumed globally.

---

# 28. Liquidity Risk

A market may display an attractive price but insufficient quantity.

The risk system should consider:

```text
Price
+
Available Depth
+
Requested Quantity
```

rather than price alone.

---

# 29. Spread Risk

A wide spread can make apparent opportunities misleading.

Strategies should account for the relevant side of the book rather than using a midpoint as though it were executable.

---

# 30. Execution Risk

Execution risk includes:

* Order rejection
* Partial fill
* No fill
* Delayed fill
* Price movement
* Cancellation failure
* Unknown order state
* Network failure

Execution outcomes must feed back into portfolio and risk state.

---

# 31. Multi-Leg Risk

Multi-leg strategies introduce additional risk.

Example:

```text
Leg A → Filled
Leg B → Failed
```

The result is exposure, not a completed arbitrage.

The risk engine must recognize incomplete structures.

---

# 32. Legging Risk

If one leg executes before another, the portfolio may temporarily or permanently hold unintended exposure.

Risk controls should account for:

* Maximum permitted imbalance
* Hedge availability
* Remaining liquidity
* Time-to-resolution
* Exit conditions

The exact limits are strategy-specific and must be validated.

---

# 33. Hedge Risk

A hedge is not guaranteed.

The system must never treat a planned hedge as an already completed hedge.

Risk state must update only from confirmed execution information.

---

# 34. Partial Fill Risk

Partial fills can create exposures smaller or larger than the intended final position structure.

Every partial fill must update:

* Position
* Remaining order quantity
* Capital
* Exposure
* Risk state

---

# 35. Order Cancellation Risk

Cancellation requests do not necessarily mean that an order has already disappeared from the exchange.

The system must distinguish:

```text
Cancellation Requested
```

from:

```text
Cancellation Confirmed
```

Risk calculations should remain conservative while cancellation state is uncertain.

---

# 36. Unknown Order State

If the bot cannot determine whether an order executed, it must not assume the safest-looking outcome.

The order should enter an explicit unknown/reconciliation state.

The system must reconcile against authoritative account/order data before continuing where necessary.

---

# 37. Duplicate Order Risk

Retries can accidentally create duplicate orders.

The execution layer must use deterministic order intent and state tracking to reduce duplicate submissions.

Risk checks should consider pending requests before approving another equivalent order.

---

# 38. Retry Risk

Retries must not blindly resubmit an order when the previous request may have succeeded.

The retry process must distinguish:

```text
Known Failure
```

from:

```text
Unknown Result
```

Unknown results require reconciliation.

---

# 39. Resolution Proximity

Short-duration markets become increasingly sensitive as resolution approaches.

The risk model should consider:

* Remaining time
* Liquidity
* Execution latency
* Signal decay
* Settlement conditions

No universal time cutoff is defined here.

---

# 40. BTC Short-Duration Risk

For BTC 5m strategies, risk must account for:

* External BTC feed timing
* Polymarket resolution source
* Time to resolution
* Market repricing speed
* Lead-lag decay
* Orderbook liquidity
* Execution latency

A historical lead-lag observation does not guarantee future execution advantage.

---

# 41. External Feed Risk

External feeds such as Binance may provide predictive information but are not necessarily the settlement source.

The system must distinguish:

```text
Predictive Feed
```

from:

```text
Resolution Source
```

A disagreement between feeds must not be silently resolved by assumption.

---

# 42. Oracle / Resolution Risk

The actual resolution mechanism must be verified from market metadata and applicable resolution information.

The bot must not hardcode a generic BTC, ETH, or other settlement source across all markets.

---

# 43. Whale Strategy Risk

Wallet intelligence can create false confidence.

The risk framework must assume:

* Wallet activity may be delayed.
* The observed trade may already be stale.
* Wallet identity may be misclassified.
* Historical profitability may not continue.
* Copy execution may occur at worse prices.
* The wallet may have information unavailable to the bot.

A wallet signal must therefore pass normal edge and execution validation.

---

# 44. Copyability Risk

A wallet may be profitable but not copyable.

Copyability must consider:

* Detection delay
* Trade size
* Liquidity
* Spread
* Entry edge
* Execution delay
* Market movement
* Trade frequency
* Stale trade percentage

---

# 45. Competition Risk

If many participants exploit the same opportunity, the opportunity may decay faster.

Risk monitoring should consider:

* Execution density
* Opportunity duration
* Market maker activity
* Repeated taker activity
* Spread compression

---

# 46. Strategy Crowding

A strategy may degrade when competition increases.

The system should monitor changes in:

```text
Opportunity Frequency
Opportunity Duration
Capture Rate
Realized Edge
Execution Quality
```

A material deterioration may trigger strategy degradation or pause according to approved policy.

---

# 47. Strategy Health

Each strategy should have measurable health.

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

# 48. Strategy Degradation

A strategy may enter:

```text
DEGRADED
```

when evidence shows deterioration.

Possible causes:

* Edge decay
* Higher latency
* Lower liquidity
* Increased competition
* Unexpected market behavior
* Data-quality problems

The exact automatic transition rules must be established through testing and approval.

---

# 49. Strategy Pause

A strategy should be pausable independently.

Pausing means:

```text
No New Orders
```

while preserving the ability to:

* Monitor positions
* Cancel orders
* Reconcile state
* Manage existing exposure

---

# 50. Global Kill Switch

The system must provide a global kill switch.

Activation should prevent new live orders.

It should not rely exclusively on the strategy layer.

---

# 51. Kill Switch Conditions

Potential triggers include:

* Severe data failure
* Execution-state inconsistency
* Unexpected loss
* Risk breach
* Authentication failure
* Wallet mismatch
* Market-data corruption
* Infrastructure instability
* Manual intervention

Specific automatic thresholds must be approved separately.

---

# 52. Manual Kill Switch

The operator must be able to manually disable live trading.

Manual intervention must take precedence over automated strategy execution.

---

# 53. Kill Switch Behavior

When activated:

```text
STOP NEW ORDERS
       ↓
PRESERVE STATE
       ↓
RECONCILE ORDERS
       ↓
ASSESS OPEN POSITIONS
       ↓
REQUIRE EXPLICIT RESTART
```

The system must not automatically resume live trading simply because the triggering condition disappears.

---

# 54. Emergency Order Handling

Existing orders require explicit handling during emergency shutdown.

Depending on the failure:

* Cancel open orders
* Freeze new orders
* Reconcile order state
* Preserve positions
* Require manual review

The correct action depends on the failure mode.

---

# 55. Startup Safety

The system must not start in live trading mode by accident.

The default runtime mode is:

```text
RESEARCH
```

or:

```text
PAPER
```

according to the deployment environment.

Live mode requires explicit activation.

---

# 56. Live Mode Activation

Live trading should require explicit configuration and verification.

At minimum:

* Correct wallet
* Correct environment
* Correct API credentials
* Correct strategy version
* Risk configuration loaded
* Market-data health
* Execution health
* Kill switch available

---

# 57. Wallet Safety

The bot must verify that the configured trading identity is the intended identity before live execution.

Wallet configuration must never be silently changed.

---

# 58. Credential Safety

Private keys and API credentials must not be:

* Hardcoded
* Committed to Git
* Printed in logs
* Included in research datasets
* Sent to AI agents unnecessarily
* Exposed through dashboard responses

---

# 59. API Credential Separation

Public data access should remain separate from authenticated trading access.

Research systems should not require live trading credentials unless explicitly necessary.

---

# 60. Agent Safety

The AI agent is not authorized to make autonomous capital decisions.

The agent may:

* Research
* Implement
* Test
* Benchmark
* Analyze
* Document

The agent may not independently:

* Allocate capital
* Enable live trading
* Change wallet identity
* Remove risk controls
* Increase approved limits
* Disable the kill switch
* Expose credentials
* Deploy live money

---

# 61. Configuration Protection

Risk configuration should be treated as controlled configuration.

Changes must be:

* Explicit
* Versioned
* Reviewable
* Auditable

Silent runtime modification is prohibited.

---

# 62. Risk Configuration vs Strategy Parameters

Strategy parameters and risk parameters must remain conceptually separate.

Example:

```text
Strategy:
Entry condition
Signal sensitivity
Holding logic

Risk:
Exposure limit
Capital allocation
Order protection
Emergency stop
```

An optimization process must not silently modify risk limits.

---

# 63. No Hidden Risk Bypass

No component may bypass risk by:

* Calling the CLOB directly
* Using a secondary SDK
* Using a CLI
* Using a private HTTP request
* Using a direct contract interaction

without passing through the approved live execution boundary.

---

# 64. Research Safety

Research code must not have production trading permissions.

This provides a hard separation:

```text
Research
   X
   ↓
Live Orders
```

---

# 65. Paper Trading Safety

Paper trading should use real market data but simulated execution.

It must not require permission to submit live orders.

---

# 66. Monitoring

Risk monitoring should cover:

### Portfolio

* Capital
* Positions
* Exposure
* PnL

### Execution

* Orders
* Fills
* Rejections
* Latency
* Cancellation state

### Data

* Feed freshness
* Missing events
* WebSocket health
* External feed health

### Strategy

* Signal rate
* Edge
* Capture rate
* Strategy health

### Infrastructure

* Process health
* Resource usage
* Connectivity

---

# 67. Reconciliation

Risk depends on correct state.

The system must periodically reconcile:

```text
Local State
vs
Authoritative Exchange State
```

and where applicable:

```text
Local Position
vs
Account Position
```

Discrepancies must be recorded and investigated.

---

# 68. Reconciliation Failure

If reconciliation cannot establish a trustworthy portfolio state, the system should prevent new live trading until state integrity is restored.

---

# 69. Risk Events

Risk-relevant events should be logged.

Examples:

```text
ORDER_APPROVED
ORDER_REJECTED
RISK_LIMIT_REACHED
STRATEGY_PAUSED
STRATEGY_DISABLED
KILL_SWITCH_TRIGGERED
DATA_STALE
EXECUTION_UNKNOWN
RECONCILIATION_FAILURE
WALLET_MISMATCH
```

---

# 70. Risk Audit Trail

For every rejected or approved live order, the system should be able to determine:

```text
Which Strategy?
Which Signal?
Which Market?
Which Risk Rules?
Which Configuration?
Which Exposure?
Which Decision?
```

This is required for post-trade analysis.

---

# 71. Loss Analysis

A loss should be classified where possible.

Potential categories:

```text
SIGNAL_ERROR
MODEL_ERROR
EXECUTION_ERROR
LATENCY_ERROR
LIQUIDITY_ERROR
FEE_ERROR
RISK_ERROR
DATA_ERROR
MARKET_REGIME
UNEXPECTED_EVENT
```

This supports strategy improvement.

---

# 72. Expected vs Actual Risk

The system should compare expected risk with actual outcomes.

Examples:

```text
Expected Slippage
vs
Actual Slippage

Expected Fill
vs
Actual Fill

Expected Edge
vs
Realized Edge
```

Systematic deviations should trigger investigation.

---

# 73. Risk Stress Testing

Before live deployment, the risk system should be tested under failure scenarios.

Examples:

* WebSocket disconnect
* REST failure
* External feed failure
* Delayed order response
* Duplicate submission
* Partial fill
* Failed hedge
* Unknown order state
* Database failure
* Process restart
* Invalid configuration
* Wallet mismatch
* Kill switch activation

---

# 74. Recovery

Recovery should follow:

```text
Detect Failure
      ↓
Stop Unsafe Activity
      ↓
Preserve State
      ↓
Reconcile
      ↓
Validate System
      ↓
Manual / Approved Resume
```

The system must not assume that restarting a process automatically makes the trading state safe.

---

# 75. Infrastructure Failure

If the bot process crashes:

* New trading must stop.
* Existing exchange orders remain an independent concern.
* Recovery must reconcile exchange state.
* Local state must be restored.
* Trading must not automatically resume without passing safety checks.

---

# 76. Database Failure

If required persistent state cannot be read or written reliably, live trading should stop.

A trading engine should not continue blindly without reliable state persistence.

---

# 77. Redis Failure

Redis is not the authoritative source of portfolio state.

If Redis is used for transient state and becomes unavailable, the system must follow the documented degraded-mode behavior rather than silently treating missing state as empty state.

---

# 78. Network Partition

A network partition can produce uncertainty about order status.

The system must:

```text
Stop Unsafe Retries
→
Reconnect
→
Reconcile
→
Continue Only When State Is Known
```

---

# 79. Market Resolution During Failure

If a market resolves while the bot is disconnected, recovery must obtain the authoritative market and account state before determining the final position.

---

# 80. Risk Metrics and Thresholds

This document intentionally does not define arbitrary numerical risk thresholds.

Examples include:

* Maximum exposure
* Maximum drawdown
* Maximum position size
* Maximum daily loss
* Maximum latency
* Maximum stale-data duration
* Maximum hedge duration

These values must be determined through:

```text
Research
+
Execution Simulation
+
Paper Trading
+
Risk Review
```

and then explicitly approved.

---

# 81. Risk Limit Hierarchy

Once approved, risk limits should follow:

```text
Global Limit
    ↓
Strategy Limit
    ↓
Market Limit
    ↓
Trade Limit
    ↓
Order Limit
```

A lower-level limit cannot exceed the applicable higher-level limit.

---

# 82. Risk Limit Changes

Risk-limit changes require:

* Explicit approval
* Version control
* Documentation
* Testing where appropriate
* Audit trail

The AI agent cannot independently increase limits.

---

# 83. Risk and Expected Value

Risk must not be evaluated separately from edge.

A trade may have positive expected value but still be rejected because:

* Execution is unreliable
* Exposure is too large
* Liquidity is insufficient
* Portfolio concentration is too high
* Resolution risk is unacceptable

---

# 84. Risk and Opportunity Decay

A trade that takes too long to execute may no longer satisfy its original risk/return profile.

Therefore:

```text
Signal
→ Delay
→ Recalculate Edge
→ Recalculate Risk
→ Execute or Reject
```

where the strategy requires it.

---

# 85. Risk and Competition

If competition reduces opportunity duration or increases execution uncertainty, risk should increase accordingly.

A strategy that was safe under one execution environment may become unsafe under another.

---

# 86. Risk and Strategy Health

Strategy health should feed into risk.

A strategy experiencing sustained degradation may be:

```text
DEGRADED
PAUSED
DISABLED
```

according to approved policy.

---

# 87. Risk and Edge Attribution

When PnL changes, the system should eventually attribute outcomes to:

* BTC lead-lag
* Orderbook imbalance
* Whale intelligence
* Market dislocation
* Timing
* Information/regime
* Execution
* Other validated components

This helps identify whether risk is coming from the intended source of edge.

---

# 88. Risk Review Before Live Trading

Before a strategy receives live capital, the review should verify:

```text
Strategy Validated
        ↓
Execution Simulated
        ↓
Out-of-Sample Tested
        ↓
Paper Tested
        ↓
Risk Controls Tested
        ↓
Monitoring Ready
        ↓
Kill Switch Verified
        ↓
Manual Approval
```

---

# 89. Live Trading Principle

Live trading is an operational privilege, not the default state of the software.

The bot should be designed so that:

```text
Research
Paper
Live
```

are explicit operating modes with clear boundaries.

---

# 90. Explicit Non-Assumptions

The risk system does not assume:

1. A profitable strategy is safe.
2. A small individual order is always low risk.
3. Diversification across markets eliminates correlated risk.
4. A planned hedge will execute.
5. Cancellation always succeeds immediately.
6. Network retries are harmless.
7. Exchange state is always known locally.
8. Market data is always fresh.
9. Historical liquidity will remain available.
10. A wallet signal is trustworthy merely because the wallet was profitable.
11. A kill switch alone guarantees capital safety.
12. Free infrastructure is sufficiently reliable for every production requirement.
13. Live trading should automatically resume after a failure.
14. Any specific risk threshold is universally appropriate.

---

# 91. Completion Criteria

The risk and safety system is complete when:

* Global risk exists.
* Strategy-level risk exists.
* Market-level risk exists.
* Trade-level risk exists.
* Order-level risk exists.
* Capital is explicitly tracked.
* Positions are explicitly tracked.
* Outstanding orders are included in exposure.
* Risk approval is independent of strategy logic.
* Price protection is mandatory.
* Dynamic fees are respected.
* Liquidity is considered.
* Data freshness affects risk.
* Multi-leg exposure is tracked.
* Partial fills are handled.
* Unknown order states are handled.
* Reconciliation is implemented.
* Global kill switch exists.
* Manual kill switch exists.
* Live mode requires explicit activation.
* Credentials are isolated.
* Research cannot submit live orders.
* Risk configuration is versioned.
* Risk decisions are auditable.
* Failure scenarios are tested.
* Recovery requires state reconciliation.
* Numerical thresholds are explicitly approved rather than guessed.
* AI agents cannot bypass risk controls.

---

# 92. Next Document

The next document is:

```text id="n7c4p1"
docs/infrastructure/50-development-and-deployment.md
```

That document will define the development environments, deployment architecture, Render and Oracle infrastructure strategy, Docker setup, CI/CD flow, runtime modes, secrets management, deployment promotion, rollback, and the project's $0-first infrastructure approach.
