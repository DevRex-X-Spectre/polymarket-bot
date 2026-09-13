# Polymarket Trading Bot

## Trading and Execution

**Document:** `docs/polymarket/12-trading-and-execution.md`
**Status:** Approved
**Document Type:** Trading and Execution Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/11-market-data-and-streaming.md`

---

# 1. Purpose

This document defines how the bot converts an approved trading decision into an actual Polymarket order and how the resulting execution is tracked.

It covers:

* Execution responsibilities
* Order construction
* Price protection
* Marketable limit orders
* GTC
* GTD
* FOK
* FAK
* Post-only execution
* Slippage
* Fees
* Partial fills
* Sequential execution
* Parallel execution
* Order lifecycle
* Fill lifecycle
* Cancellation
* Execution failures
* Reconciliation
* Execution metrics
* Live trading safety

This document does not define individual trading strategies.

Strategies determine **what should be traded**.

The execution system determines **how the approved trade is executed safely**.

---

# 2. Execution Principle

The bot must never treat a trading signal as an order.

The required flow is:

```text
Strategy Signal
      ↓
Opportunity
      ↓
Expected Net Edge
      ↓
Risk Validation
      ↓
Execution Plan
      ↓
Order Construction
      ↓
Price Protection
      ↓
Order Submission
      ↓
Exchange State
      ↓
Fills
      ↓
Position
      ↓
PnL
```

Execution must be independent from strategy logic.

---

# 3. Execution Responsibilities

The execution engine is responsible for:

1. Validating the execution request.
2. Validating current market state.
3. Fetching or confirming dynamic market parameters.
4. Calculating executable pricing.
5. Applying price protection.
6. Applying execution constraints.
7. Selecting order type.
8. Constructing the order.
9. Submitting the order.
10. Tracking the order.
11. Processing fills.
12. Handling partial fills.
13. Cancelling when required.
14. Reconciling exchange state.
15. Reporting execution metrics.

---

# 4. Strategy Boundary

Strategies may request an execution.

They must not directly:

* Sign orders
* Call the CLOB
* Cancel orders
* Bypass risk
* Modify account balances
* Override price protection

A strategy produces an execution intent.

Example:

```text id="q7n2bx"
Strategy
    ↓
BUY YES
Quantity: Q
Maximum Price: P
Time-in-force: FOK
Reason: Strategy Signal
```

The execution engine determines whether and how that intent can actually be submitted.

---

# 5. Execution Intent

An execution intent should contain enough information to define the desired trade.

Conceptually:

```text id="r8m4kp"
Execution Intent
├── Strategy
├── Strategy Version
├── Market
├── Token
├── Side
├── Desired Quantity
├── Maximum / Minimum Acceptable Price
├── Time-in-force
├── Execution Mode
├── Signal ID
├── Opportunity ID
└── Expiration / Validity
```

The final structure is implementation-specific.

---

# 6. Risk Before Execution

No live order may reach the exchange before risk approval.

Required flow:

```text id="b3x8q5"
Execution Intent
      ↓
Risk Engine
      ↓
Approved?
   ┌──┴──┐
   │     │
  YES    NO
   │     │
   ▼     ▼
Execution  Reject
```

The execution engine must not interpret a rejected risk decision as permission to continue.

---

# 7. Market Validation

Immediately before order construction, the execution engine must validate the relevant market state.

At minimum:

```text id="n6c2v9"
Market exists
Market is tradable
Correct token
Current tick size
Current minimum order size
Current fee information
Current orderbook
Fresh data
Risk approved
```

If required information is unavailable, the order must not be submitted.

---

# 8. Dynamic Market Parameters

The execution engine must not hardcode:

* Tick size
* Minimum order size
* Applicable fee
* Fee curve
* Other dynamic market constraints

These values must be obtained from current Polymarket market information where required.

---

# 9. Price Protection

Every live order must have an explicit acceptable price boundary.

For a buy:

```text id="v4x7r2"
Maximum Acceptable Price
```

For a sell:

```text id="h2p8s4"
Minimum Acceptable Price
```

If the orderbook moves outside the acceptable range, the execution engine must refuse the execution.

---

# 10. Marketable Limit Orders

Polymarket orders are limit orders.

A strategy that wants immediate execution must therefore use a marketable limit order with an explicit price boundary.

Conceptually:

```text id="k5w9m1"
Current Ask
    ↓
Maximum Acceptable Buy Price
    ↓
Marketable Limit Order
```

This provides immediate execution intent while preserving price protection.

---

# 11. No Unlimited Execution

The bot must never implement:

```text id="p8q2w4"
Buy at any available price.
```

Every execution must have an explicit price constraint.

This protects against:

* Thin liquidity
* Sudden book movement
* Stale signals
* Unexpected spreads
* Market manipulation
* Data errors

---

# 12. Depth-Aware Execution

Execution must account for actual orderbook depth.

The system should calculate the expected execution price for the requested quantity.

Example:

```text id="s5m7c9"
Requested Quantity
       ↓
Available Ask Levels
       ↓
Walk Book
       ↓
Expected VWAP
       ↓
Estimated Slippage
       ↓
Net Expected Value
```

The best ask alone is insufficient for larger orders.

---

# 13. Slippage

Slippage is the difference between expected execution and actual execution.

The system should measure:

```text id="c8v3n6"
Expected Price
vs
Actual Average Fill Price
```

Slippage should be tracked separately from:

* Fees
* Signal error
* Market movement

---

# 14. Pre-Trade Slippage Estimate

Before an order is submitted, the execution engine should estimate expected slippage from current orderbook depth.

The estimate should consider:

* Quantity
* Available liquidity
* Price levels
* Spread
* Current market conditions

If expected slippage destroys the strategy's expected edge, the trade should be rejected.

---

# 15. Post-Trade Slippage

After execution, actual slippage should be calculated and stored.

This allows:

```text id="m4q8s7"
Estimated Slippage
vs
Realized Slippage
```

to be compared over time.

---

# 16. Fee Calculation

Fees must be included in expected execution economics.

The system must not calculate:

```text id="y7r3q1"
Expected Profit
```

without accounting for applicable fees.

The execution layer should obtain the current applicable fee configuration from Polymarket.

---

# 17. Net Execution Value

The execution engine should work with net economics.

Conceptually:

```text id="w6p2m8"
Gross Edge
- Fees
- Expected Slippage
- Execution Costs
- Other Validated Costs
=
Net Expected Edge
```

A trade should only proceed when the resulting expected edge satisfies the strategy and risk requirements.

---

# 18. Minimum Edge

There is no universal project-wide edge threshold.

Different strategies may require different minimum edges.

A strategy-specific threshold must be supported by research.

The execution engine should receive an already-approved economic constraint rather than inventing a strategy threshold.

---

# 19. GTC

GTC means the order remains active according to the exchange's supported good-til-cancelled behavior.

GTC is appropriate when:

* Immediate execution is not required.
* Waiting for a fill is acceptable.
* The strategy has validated the risk of remaining exposed to a changing market.

The system must monitor outstanding GTC orders.

---

# 20. GTD

GTD provides an explicit expiration.

GTD is appropriate when:

* The opportunity is valid only for a defined period.
* The order should automatically expire.
* Waiting indefinitely would be harmful.

The expiration must comply with current Polymarket requirements.

The current exchange rules include a security threshold around expiration time.

The bot must construct valid expiration timestamps.

---

# 21. FOK

FOK means the requested quantity must be filled immediately or the order does not execute.

FOK is useful when partial exposure would invalidate the strategy.

Example:

```text id="h8q4m1"
Arbitrage Requires Full Quantity
        ↓
FOK
        ↓
Full Fill
OR
No Fill
```

FOK failure must not be treated as a strategy loss.

It is an execution result.

---

# 22. FAK

FAK allows an order to execute available quantity while leaving the remainder unfilled.

FAK is useful when:

* Partial execution is acceptable.
* Liquidity may be fragmented.
* The strategy can manage residual exposure.

The system must record the requested quantity and actual filled quantity separately.

---

# 23. Post-Only

Post-only execution is used when the order must provide liquidity rather than immediately take existing liquidity.

Potential benefits:

* Maker execution
* Potentially different fee economics
* Potential maker rewards where applicable

Potential disadvantage:

* The order may not fill.

Therefore:

```text id="x2m7v9"
Post-Only
≠
Guaranteed Better Execution
```

The strategy must account for fill probability.

---

# 24. Maker vs Taker

Execution records must distinguish maker and taker behavior where available.

This matters because:

* Fees may differ.
* Rewards may differ.
* Fill probability differs.
* Latency requirements differ.
* Strategy economics differ.

The bot must not assume that maker execution is always preferable.

---

# 25. Fill Probability

For passive execution, the system should eventually estimate:

```text id="b5n9k3"
Probability of Fill
```

based on historical evidence such as:

* Queue position
* Orderbook depth
* Cancellation rate
* Market activity
* Time available
* Price movement

The first implementation may use simpler models, but assumptions must be explicit.

---

# 26. Queue Position

Queue position matters for realistic maker execution.

A future execution simulator should consider:

```text id="s8k2m4"
Order Placement
      ↓
Orders Ahead
      ↓
Cancellations Ahead
      ↓
Incoming Aggressive Flow
      ↓
Our Fill
```

Exact queue reconstruction may not always be possible.

When it is not possible, the simulator must document its approximation.

---

# 27. Sequential Execution

Sequential execution means executing one leg before attempting the next.

Example:

```text id="g7m2p4"
Leg A
 ↓
Fill
 ↓
Leg B
```

Advantages:

* Simpler state management
* Lower simultaneous exposure
* Easier failure handling

Disadvantage:

* Increased time between legs
* Greater exposure to price movement

---

# 28. Parallel Execution

Parallel execution means attempting multiple legs near-simultaneously.

Example:

```text id="d5q8n1"
       ┌── Leg A
Signal ┤
       └── Leg B
```

Advantages:

* Lower leg-to-leg delay
* Reduced time exposed to one-sided movement

Disadvantages:

* Partial-fill complexity
* Race conditions
* Greater coordination risk
* More difficult recovery

Parallel execution must only be used where research justifies it.

---

# 29. Strategy-Controlled Execution Mode

Different strategies may require different execution modes.

The execution engine should support:

```text id="w3r7k9"
Sequential
Parallel
Single-Leg
Passive
Aggressive
```

The strategy may specify the desired mode, but risk and execution safety remain authoritative.

---

# 30. Partial Fills

Partial fills must be treated as a distinct state.

Example:

```text id="n5v8c2"
Requested: 100
Filled: 60
Remaining: 40
```

The bot must know:

* What was filled
* What remains
* Whether remaining quantity should be cancelled
* Whether a hedge is required
* Whether the strategy remains valid

---

# 31. Partial-Fill Risk

Partial execution can change the economics of the original trade.

Therefore:

```text id="f4m9x7"
Original Edge
    ↓
Partial Fill
    ↓
New Exposure
    ↓
Recalculate Risk
```

The system must not blindly continue executing the original plan after a material partial fill.

---

# 32. Order Cancellation

Orders may need to be cancelled when:

* Opportunity expires
* Price protection is violated
* Risk state changes
* Market resolves
* Data becomes stale
* Strategy invalidates the order
* Emergency shutdown occurs

Cancellation must be recorded as an explicit event.

---

# 33. Cancellation Verification

A cancellation request does not necessarily mean the order is already cancelled.

The system must verify the exchange state where necessary.

Conceptually:

```text id="q8n3m5"
Cancel Requested
      ↓
Exchange State
      ↓
Cancelled?
   ┌──┴──┐
  YES    NO
   │      │
Done    Investigate
```

---

# 34. Order Timeout

An order timeout must not automatically be treated as a failed order.

Possible states include:

```text id="z6r1k8"
Submitted
Accepted
Matched
Partially Filled
Cancelled
Rejected
Unknown
```

If the local process cannot determine the final state, reconciliation is required.

---

# 35. Network Failure During Submission

A critical rule:

> A lost response does not prove that an order failed.

Example:

```text id="k2v7m9"
Submit Order
     ↓
Network Timeout
     ↓
Unknown
     ↓
Query Exchange
     ↓
Determine Actual State
```

The bot must avoid blindly submitting the same order again.

---

# 36. Duplicate Order Prevention

The execution engine must prevent accidental duplicate exposure.

Where supported, the system should use appropriate client-side identifiers, state checks, and exchange verification.

Before retrying an uncertain order submission:

```text id="c7n4x2"
Check Existing State
        ↓
Determine Whether Order Exists
        ↓
Only Then Decide Next Action
```

---

# 37. Order State Machine

The internal order lifecycle should conceptually support:

```text id="q5m8v3"
CREATED
   ↓
RISK_APPROVED
   ↓
SUBMITTING
   ↓
SUBMITTED
   ↓
ACCEPTED
   │
   ├──→ PARTIALLY_FILLED
   │          │
   │          └──→ FILLED
   │
   ├──→ CANCEL_REQUESTED
   │          ↓
   │       CANCELLED
   │
   └──→ REJECTED

UNKNOWN
   ↓
RECONCILIATION
```

The exact exchange-state mapping must preserve original Polymarket states.

---

# 38. Trade Lifecycle

A trade/fill should preserve its own lifecycle.

Current Polymarket user trade states include:

```text id="r7m3k5"
MATCHED
MINED
CONFIRMED
RETRYING
FAILED
```

The internal model must not collapse these into a generic `filled` state prematurely.

---

# 39. Position Update

A position should only be updated from verified execution information.

Conceptually:

```text id="s9x4n7"
Verified Fill
    ↓
Position Update
    ↓
Balance Update
    ↓
PnL Update
```

A strategy signal must never directly modify position state.

---

# 40. Execution Reconciliation

Execution reconciliation compares:

```text id="g4m8q2"
Internal Orders
vs
Exchange Orders

Internal Fills
vs
Exchange Fills

Internal Positions
vs
Exchange Positions
```

Discrepancies must be recorded.

---

# 41. Reconciliation Frequency

Reconciliation should occur:

* Periodically
* After reconnects
* After uncertain submissions
* After unexpected execution events
* Before resuming trading after serious failures

The exact frequency should be determined by operational requirements.

---

# 42. Reconciliation Failure

If reconciliation cannot establish trustworthy state:

```text id="w6k2r9"
Stop New Orders
```

The system may continue monitoring while attempting recovery.

The system must not continue trading from an unknown account state.

---

# 43. Execution Health

Execution health should track:

* Order submission latency
* Order rejection rate
* Fill rate
* Partial fill rate
* Cancellation rate
* Cancellation latency
* API error rate
* Network error rate
* Reconciliation discrepancies
* Average slippage
* Average fee
* Expected vs realized execution price

---

# 44. Execution Latency

The system should preserve:

```text id="v8q3m6"
Signal Time
↓
Order Construction Time
↓
Submission Time
↓
Exchange Arrival Time
↓
Match Time
↓
Confirmation Time
```

This allows the system to determine whether latency contributed to performance.

---

# 45. Expected vs Realized Execution

The system must compare:

```text id="f2m7k8"
Expected Price
Expected Quantity
Expected Fee
Expected Slippage
```

against:

```text id="n4c9r5"
Actual Price
Actual Quantity
Actual Fee
Actual Slippage
```

The difference should be recorded for execution analysis.

---

# 46. Execution Quality

Execution quality should eventually be measured using:

* Price improvement/deterioration
* Slippage
* Fill probability
* Fill rate
* Latency
* Fees
* Partial fills
* Opportunity decay

Execution quality is separate from strategy quality.

---

# 47. Opportunity Decay

The execution system must support research into how quickly an opportunity disappears.

Conceptually:

```text id="m3k8q7"
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

The actual useful time horizon must be measured rather than assumed.

---

# 48. Execution Simulation

Historical execution simulation should reproduce, as closely as practical:

```text id="x7p2m4"
Signal
 ↓
Processing Delay
 ↓
Network Delay
 ↓
Exchange Arrival
 ↓
Orderbook State
 ↓
Queue / Available Liquidity
 ↓
Matching
 ↓
Partial Fill
 ↓
Remaining Order
```

The simulator must document every simplification.

---

# 49. Simulation vs Backtest

These are separate concepts.

```text id="j4n8s6"
Backtest
→ Did the strategy have theoretical edge?

Execution Simulation
→ Could the strategy actually have captured that edge?
```

A strategy must not be promoted to production solely because its theoretical backtest is profitable.

---

# 50. Executable Opportunity

An opportunity should be considered executable only when:

```text id="h8q3m1"
Current Market State
+
Available Liquidity
+
Price Protection
+
Fees
+
Expected Slippage
+
Execution Constraints
+
Latency
+
Risk
```

all support the intended trade.

---

# 51. Theoretical Arbitrage

A mathematical relationship such as:

```text id="c5m9r7"
YES + NO < 1
```

does not automatically mean profitable arbitrage.

The system must additionally account for:

* Available size
* Orderbook depth
* Fees
* Slippage
* Execution timing
* Partial fills
* Leg risk
* Settlement mechanics

---

# 52. Arbitrage Execution

Where a strategy requires multiple legs:

```text id="p7x2m5"
Opportunity
      ↓
Validate Both Books
      ↓
Validate Size
      ↓
Validate Costs
      ↓
Choose Execution Mode
      ↓
Execute
      ↓
Monitor Legs
      ↓
Resolve Residual Exposure
```

The system must have explicit behavior for incomplete execution.

---

# 53. Residual Exposure

If a multi-leg trade only partially executes, the remaining exposure becomes a normal risk position.

The system must not assume that the second leg will automatically fill.

Possible actions include:

* Continue within validated constraints
* Cancel
* Hedge
* Exit
* Hold
* Require manual intervention

The action must be strategy- and risk-approved.

---

# 54. Execution Safety Limits

Execution must respect:

* Maximum order size
* Maximum market exposure
* Maximum strategy exposure
* Maximum total exposure
* Price limits
* Position limits
* Loss limits
* Data freshness
* Connectivity health
* Account health

Risk controls remain authoritative.

---

# 55. Emergency Stop

The execution engine must support emergency shutdown.

When triggered:

```text id="e6k3p8"
Emergency Stop
      ↓
Block New Orders
      ↓
Evaluate Existing Orders
      ↓
Cancel Where Required
      ↓
Reconcile
      ↓
Remain Disabled
```

The system must not automatically resume live trading after an emergency stop unless explicitly authorized.

---

# 56. Paper Execution

Paper execution should model the same concepts as live execution:

* Order construction
* Price protection
* Fees
* Slippage
* Partial fills
* Order lifecycle
* Cancellation
* Reconciliation

The difference is that no real order reaches Polymarket.

---

# 57. Paper vs Live

The system must clearly identify execution mode:

```text id="x9c4m7"
RESEARCH
PAPER
LIVE
```

The default development mode must not be live.

---

# 58. Live Activation

Live trading requires explicit activation.

The system must not automatically transition:

```text id="q2m8v5"
Paper
  ↓
Live
```

because:

* Live credentials exist
* Environment variables exist
* A deployment occurred
* A strategy was enabled

Activation must be an intentional operation.

---

# 59. Execution Logs

Every important execution action should be logged.

Examples:

* Execution requested
* Risk approved
* Risk rejected
* Order constructed
* Order submitted
* Order accepted
* Order rejected
* Fill received
* Partial fill
* Cancellation requested
* Cancellation confirmed
* Reconciliation discrepancy
* Emergency stop

Sensitive credentials must never appear in logs.

---

# 60. Execution Audit Record

A trade should eventually be auditable from:

```text id="s5v9q2"
Strategy
    ↓
Signal
    ↓
Opportunity
    ↓
Risk Decision
    ↓
Execution Plan
    ↓
Order
    ↓
Fill
    ↓
Position
    ↓
PnL
```

This chain is mandatory for reliable post-trade analysis.

---

# 61. Agent Rules

AI agents working on execution must:

1. Never bypass the risk engine.
2. Never submit unrestricted prices.
3. Never assume a timeout means failure.
4. Never blindly retry uncertain orders.
5. Never hardcode fees.
6. Never hardcode tick sizes.
7. Never hardcode minimum order sizes.
8. Never treat partial fills as full fills.
9. Never modify positions directly.
10. Never activate live trading autonomously.
11. Never remove price protection to increase fill rate.
12. Never disable reconciliation to simplify development.
13. Never change execution thresholds without documentation.
14. Preserve exchange lifecycle states.
15. Treat unknown execution state as unknown until verified.

---

# 62. What This Document Does Not Assume

The execution system does not assume:

1. Best ask is executable for unlimited quantity.
2. Every signal should be executed immediately.
3. Every opportunity survives until order arrival.
4. Maker execution is always superior.
5. Taker execution is always superior.
6. FOK always provides better execution.
7. Parallel execution is always faster in a useful way.
8. Sequential execution is always safer.
9. A network timeout means an order failed.
10. A successful order submission means a fill occurred.
11. Theoretical arbitrage is executable arbitrage.
12. Historical slippage will remain constant.
13. Historical latency will remain constant.
14. A partial fill will resolve itself.
15. An exchange state can be inferred from local state alone.

---

# 63. Completion Criteria

The trading and execution system is considered complete when:

* Strategy-to-execution boundaries are enforced.
* Risk approval is required before live submission.
* Current market parameters are validated.
* Dynamic fees are supported.
* Dynamic tick sizes are supported.
* Dynamic minimum order sizes are supported.
* Price protection exists.
* Depth-aware execution exists.
* Slippage is estimated and measured.
* GTC is supported where required.
* GTD is supported where required.
* FOK is supported where required.
* FAK is supported where required.
* Post-only behavior is supported where required.
* Partial fills are handled.
* Sequential execution is supported.
* Parallel execution can be supported where justified.
* Order lifecycle is persisted.
* Fill lifecycle is persisted.
* Cancellation is verified.
* Unknown execution state triggers reconciliation.
* Execution metrics are recorded.
* Paper and live execution are separated.
* Live activation is explicitly controlled.
* Emergency stop exists.
* Execution decisions are auditable.

---

# 64. Next Document

The next document is:

```text id="v7m2q8"
docs/strategies/20-strategy-framework.md
```

That document will define the common framework every strategy must follow, including strategy lifecycle, inputs, outputs, feature contracts, signal normalization, opportunity creation, validation, strategy versioning, backtesting requirements, promotion criteria, and strategy isolation.
