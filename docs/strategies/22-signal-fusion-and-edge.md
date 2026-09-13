# Polymarket Trading Bot

## Signal Fusion and Edge

**Document:** `docs/strategies/22-signal-fusion-and-edge.md`
**Status:** Approved
**Document Type:** Signal Fusion and Edge Calculation Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/strategies/20-strategy-framework.md`
* `docs/strategies/21-alpha-strategies.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`

---

# 1. Purpose

This document defines how the bot transforms individual strategy signals into a unified view of expected edge.

It establishes the distinction between:

```text
Raw Signal
↓
Normalized Signal
↓
Fused Signal
↓
Fair Value / Probability
↓
Theoretical Edge
↓
Executable Edge
↓
Net Expected Edge
↓
Risk Decision
```

The purpose is to prevent the system from treating a large number of signals as automatically equivalent to a profitable trading opportunity.

---

# 2. Core Principle

The system must distinguish:

* What a strategy observes.
* What the system believes the market is worth.
* What the market currently offers.
* What can actually be executed.
* What remains profitable after execution costs.

The fundamental rule is:

> A signal is not an edge, and an edge is not automatically executable.

---

# 3. Signal Hierarchy

The signal pipeline is:

```text
Strategy Signals
      ↓
Signal Validation
      ↓
Signal Normalization
      ↓
Signal Fusion
      ↓
Fair Value Estimation
      ↓
Market Comparison
      ↓
Theoretical Edge
      ↓
Execution Adjustment
      ↓
Net Expected Edge
```

Each stage must have a defined responsibility.

---

# 4. Raw Strategy Signal

Each strategy may generate its own raw signal representation.

Examples:

```text
BTC Strategy
→ External BTC moved rapidly

Whale Strategy
→ Historically profitable wallet entered

Dislocation Strategy
→ Related markets violate expected relationship

Regime Strategy
→ Volatility regime changed
```

Raw signals are not directly comparable.

---

# 5. Signal Validation

Before normalization, each signal must be checked for:

* Correct market
* Correct token/outcome
* Valid timestamp
* Fresh input data
* Valid strategy version
* Required features present
* Valid market state
* Non-expired signal
* Consistent resolution information

Invalid signals must be rejected or marked accordingly.

---

# 6. Signal Timestamp

Every signal must preserve its timestamp.

For latency-sensitive signals, the system should distinguish:

```text
Event Time
Detection Time
Processing Time
Signal Time
```

This allows the system to determine whether an apparent edge existed before the bot could realistically act.

---

# 7. Signal Freshness

Signal freshness is strategy-specific.

A signal that was valid one second ago may no longer be valid.

Therefore:

```text
Signal Age
=
Current Time - Signal Timestamp
```

must be available to the fusion and execution layers.

---

# 8. Signal Expiration

A signal may define a validity period.

Once expired:

```text
Signal
 ↓
EXPIRED
```

It must not automatically remain eligible for execution.

---

# 9. Signal Normalization

Signals from different strategies must be converted into a common representation.

Conceptually:

```text
Raw Signal
    ↓
Direction
Strength
Confidence
Expected Impact
Time Horizon
Freshness
    ↓
Normalized Signal
```

Normalization must preserve the original strategy information.

---

# 10. Common Signal Representation

A normalized signal should conceptually contain:

```text
Signal ID
Strategy ID
Strategy Version
Market ID
Token ID
Direction
Timestamp
Signal Strength
Confidence
Expected Horizon
Validity
Feature References
```

Additional fields may be added where justified.

---

# 11. Direction

Signals must explicitly identify direction where appropriate.

Possible representations include:

```text
BUY_YES
BUY_NO
SELL_YES
SELL_NO
NEUTRAL
```

The valid direction depends on the market structure.

The system must not infer direction from an ambiguous score.

---

# 12. Signal Strength

Signal strength represents the magnitude of the strategy's observed condition.

It must have a defined meaning.

For example, it may represent:

* Statistical deviation
* Model score
* Expected return
* Probability difference
* Orderbook imbalance

A generic score such as `0.85` has no meaning unless the strategy defines what it represents.

---

# 13. Confidence

Confidence represents the reliability of the signal according to the strategy's methodology.

Confidence must not be confused with probability of market outcome.

For example:

```text
Confidence = reliability of model estimate
```

is different from:

```text
Probability = estimated chance of YES resolving
```

Both may exist simultaneously.

---

# 14. Fair Probability

For binary markets, a strategy may estimate:

```text
P(YES)
```

and therefore:

```text
P(NO) = 1 - P(YES)
```

where the market structure and resolution semantics support this relationship.

The probability estimate must be produced by a defined methodology.

---

# 15. Fair Value

For a binary outcome, fair value may be represented by the strategy's estimated probability.

Conceptually:

```text
Fair YES Price ≈ Estimated P(YES)
```

The implementation must preserve the distinction between:

* Model estimate
* Market price
* Executable price

---

# 16. Market Price

The system should distinguish between:

```text
Mid Price
Best Bid
Best Ask
Executable Buy Price
Executable Sell Price
```

The mid price must not automatically be treated as executable.

---

# 17. Theoretical Edge

Theoretical edge compares estimated fair value with the market price before detailed execution effects.

For a buy:

```text
Theoretical Edge
=
Fair Value - Market Price
```

For a sell:

```text
Theoretical Edge
=
Market Price - Fair Value
```

The exact formulation depends on the position and market structure.

---

# 18. Executable Price

For an actual trade, the system must use an executable price.

For a buy, this generally means evaluating the relevant ask-side liquidity.

For a sell, this generally means evaluating the relevant bid-side liquidity.

The system must account for quantity.

---

# 19. Depth-Aware Edge

If the requested quantity consumes multiple price levels, edge must be calculated against the expected execution price rather than the top-of-book price.

Conceptually:

```text
Requested Quantity
↓
Orderbook Depth
↓
Expected VWAP
↓
Executable Edge
```

---

# 20. Execution Adjustment

Theoretical edge must be adjusted for:

* Spread
* Depth
* Slippage
* Fees
* Latency
* Fill probability
* Partial fills
* Order type
* Opportunity decay

The relevant factors depend on the strategy.

---

# 21. Net Expected Edge

The final economic quantity should represent expected value after known execution effects.

Conceptually:

```text
Theoretical Edge
- Expected Slippage
- Fees
- Expected Execution Loss
- Other Validated Costs
=
Net Expected Edge
```

The exact mathematical model must be strategy-appropriate.

---

# 22. Opportunity Survival

An opportunity may disappear before execution.

The system should estimate:

```text
P(Opportunity remains executable
  until order arrival)
```

where sufficient historical data exists.

This is especially important for short-lived opportunities.

---

# 23. Opportunity Decay

The system should measure how quickly edge disappears after detection.

Conceptually:

```text
Edge at Detection
        ↓
Edge after Processing
        ↓
Edge after Network Delay
        ↓
Edge at Exchange Arrival
        ↓
Realized Edge
```

This allows the system to distinguish signal quality from execution quality.

---

# 24. Latency Adjustment

For latency-sensitive strategies, expected edge should account for the delay between signal detection and actual order arrival.

Relevant timestamps include:

```text
External Event
Signal
Order Creation
Order Submission
Exchange Arrival
Match
```

Historical latency distributions should be used where available.

The system must not assume a fixed latency value without evidence.

---

# 25. Fill Probability

A passive order may have positive expected edge but low probability of execution.

Therefore:

```text
Expected Value
```

should not automatically equal:

```text
Expected Captured Value
```

where fill probability is material.

---

# 26. Partial Fill Adjustment

For strategies where partial fills are possible, the expected result should account for:

```text
Probability of Full Fill
Probability of Partial Fill
Probability of No Fill
```

The exact model depends on available execution data.

---

# 27. Signal Fusion

Signal fusion combines independent or partially independent strategy information.

Conceptually:

```text
BTC Signal
       │
Whale Signal
       │
Dislocation Signal ──→ Fusion Layer
       │
Regime Signal
       │
Competition Signal
```

The fusion layer must preserve the source of each signal.

---

# 28. Signal Independence

Before combining signals, the system should determine whether they provide independent information.

For example:

```text
BTC Momentum
+
BTC Lead-Lag
```

may be strongly related.

Adding both at full weight may double-count the same information.

---

# 29. Correlated Signals

If two signals are correlated, the fusion model should account for that correlation.

Possible approaches include:

* Reduced weighting
* Feature aggregation
* Model-based combination
* Conditional weighting
* Removing redundant features

The method must be validated experimentally.

---

# 30. Signal Weighting

Signal weights may be based on evidence such as:

* Historical predictive power
* Stability
* Execution feasibility
* Market regime
* Recent performance
* Statistical independence

Weights must not be selected solely because they maximize one historical backtest.

---

# 31. Static vs Dynamic Weights

The system may eventually support:

```text
Static Weights
```

or:

```text
Dynamic Weights
```

Dynamic weighting must only be introduced after evidence shows that it improves out-of-sample performance without excessive overfitting.

---

# 32. Conflicting Signals

When signals conflict:

```text
BTC → BUY
Whale → SELL
```

the system must not arbitrarily choose one.

The fusion layer may:

* Reduce conviction
* Produce neutral output
* Select the better-supported signal
* Apply validated weighting
* Reject the opportunity

The selected behavior must be explicit.

---

# 33. Signal Agreement

Agreement between strategies may increase conviction only if research demonstrates that the signals provide useful independent information.

The system must not implement:

```text
3 strategies agree
=
3x confidence
```

without statistical justification.

---

# 34. Signal Quality

A signal should eventually be evaluated by:

* Predictive accuracy
* Expected value
* Stability
* Execution feasibility
* Opportunity frequency
* Decay rate
* Realized performance

A signal that predicts correctly but cannot be executed may have limited trading value.

---

# 35. Edge Decomposition

The system should distinguish different sources of edge.

Conceptually:

```text
Observed Edge
├── Information Edge
├── Pricing Edge
├── Timing Edge
├── Microstructure Edge
├── Structural Edge
└── Execution Edge
```

These categories are analytical labels and must not be treated as mutually exclusive without research.

---

# 36. Gross vs Net Edge

The system must preserve:

```text
Gross / Theoretical Edge
```

and:

```text
Net / Executable Edge
```

separately.

This prevents the system from hiding execution losses inside the signal model.

---

# 37. Edge Attribution

After execution, expected and realized edge should be compared.

Conceptually:

```text
Expected Edge
      ↓
Realized Edge
      ↓
Difference
```

The difference may be attributed to:

* Price movement
* Latency
* Slippage
* Fees
* Partial fill
* Model error
* Market regime
* Execution failure

---

# 38. Expected vs Realized PnL

The system should preserve:

```text
Expected PnL
```

and:

```text
Realized PnL
```

separately.

This allows the bot to determine whether losses came from:

```text
Bad Signal
```

or:

```text
Good Signal + Poor Execution
```

or:

```text
Correct Execution + Unfavorable Outcome
```

---

# 39. Edge Attribution Example

A trade may have:

```text
Positive Expected Edge
```

but lose money because:

```text
Opportunity Decayed
+
Execution Price Deteriorated
```

That should not automatically be classified as strategy failure.

The execution loss must be identified separately.

---

# 40. No-Trade Edge

The system should record opportunities that were detected but not executed.

Reasons include:

* Risk rejection
* Insufficient liquidity
* Price protection
* Stale data
* Opportunity expiration
* Execution unavailable
* Strategy disabled

This allows analysis of missed opportunities.

---

# 41. Missed Opportunity Analysis

For each significant missed opportunity, the system should eventually determine:

```text
Why was it not executed?
```

and:

```text
Would execution have remained profitable?
```

This prevents hindsight-based assumptions.

---

# 42. Edge Threshold

There is no universal project-wide edge threshold.

Each strategy may define its own required edge based on:

* Historical variance
* Fees
* Slippage
* Execution uncertainty
* Risk
* Opportunity frequency

Thresholds must be research-backed.

---

# 43. Safety Margin

Where execution estimates contain uncertainty, a strategy may require an additional safety margin.

Conceptually:

```text
Estimated Net Edge
-
Execution Uncertainty
>
Required Minimum
```

The size of this margin must be validated.

---

# 44. Edge Stability

A strategy should not be evaluated only on average edge.

Research should also examine:

* Edge distribution
* Median edge
* Tail outcomes
* Variance
* Edge decay
* Regime sensitivity
* Execution sensitivity

A high average edge with extreme instability requires additional scrutiny.

---

# 45. Edge Distribution

The system should preserve the distribution of observed opportunities.

Example:

```text
Small Edge
Medium Edge
Large Edge
Extreme Edge
```

The research should determine whether extreme observations are:

* Real opportunities
* Data errors
* Illiquid prices
* Stale quotes
* Rare but valid events

---

# 46. Outlier Handling

Outliers must not be silently removed.

An extreme opportunity should be investigated.

Possible causes:

* Genuine market dislocation
* Bad data
* Stale orderbook
* Market transition
* Incorrect market mapping
* Resolution event
* Feed interruption

The final treatment must be documented.

---

# 47. Market-State Dependency

The same signal may have different expected edge under different market states.

Examples:

```text
High Volatility
vs
Low Volatility

High Liquidity
vs
Low Liquidity

Near Resolution
vs
Far From Resolution
```

Where evidence supports it, the edge model should condition on market regime.

---

# 48. Resolution-Time Dependency

Short-duration markets may behave differently as resolution approaches.

The system should preserve:

```text
Time to Resolution
```

as an explicit variable where relevant.

It must not assume that an edge remains constant throughout the market lifetime.

---

# 49. Liquidity Dependency

Edge calculations should account for liquidity.

A price that appears attractive at very small size may not remain attractive at the desired position size.

Therefore:

```text
Edge(Q1)
```

may differ materially from:

```text
Edge(Q2)
```

where `Q2 > Q1`.

---

# 50. Position Size and Edge

The fusion layer must not assume that the largest theoretically profitable size is the optimal size.

Increasing size may cause:

* Worse execution price
* Greater slippage
* Lower fill probability
* Greater market impact
* Greater risk

Position sizing remains the responsibility of the risk layer.

---

# 51. Signal-to-Execution Contract

The signal/fusion layer should pass an execution candidate containing, conceptually:

```text
Strategy
Strategy Version
Signal ID
Opportunity ID
Market
Token
Direction
Estimated Fair Value
Current Executable Price
Theoretical Edge
Estimated Net Edge
Validity Window
Execution Constraints
```

The execution engine then independently validates current state.

---

# 52. Risk Boundary

The edge layer must not decide final capital allocation.

Correct architecture:

```text
Signal Fusion
      ↓
Edge Calculation
      ↓
Risk Engine
      ↓
Execution
```

The edge layer determines whether the economics may justify a trade.

The risk engine determines whether the account can safely take it.

---

# 53. Risk-Adjusted Edge

A positive edge may still be rejected because of:

* Existing exposure
* Correlated positions
* Market concentration
* Strategy limits
* Account limits
* Drawdown state
* Operational health

Therefore:

```text
Positive Edge
≠
Approved Trade
```

---

# 54. Edge Expiration

An edge estimate becomes invalid when material market inputs change.

Examples:

* Price moves
* Orderbook changes
* Spread changes
* Liquidity changes
* External market moves
* Time to resolution changes
* Market resolves
* Fee configuration changes

The system should recompute rather than reuse stale calculations.

---

# 55. Recalculation

For fast-moving opportunities:

```text
Signal
 ↓
Edge Calculation
 ↓
Market Change
 ↓
Recalculate
 ↓
Execution Decision
```

The execution engine must perform its own final validation.

---

# 56. Edge Journal

Every significant opportunity should be journaled.

The journal should preserve:

```text
Opportunity ID
Signal IDs
Strategy Versions
Market State
Fair Value
Market Price
Executable Price
Expected Edge
Expected Costs
Execution Decision
Outcome
Realized PnL
```

This becomes a core research dataset.

---

# 57. Opportunity Classification

An opportunity should be classifiable as:

```text
THEORETICAL
EXECUTABLE
RISK_REJECTED
EXPIRED
EXECUTED
PARTIALLY_EXECUTED
FAILED_EXECUTION
```

This prevents all detected opportunities from being counted as trades.

---

# 58. Edge Failure Classification

When an expected edge does not result in profit, the system should attempt to classify the reason:

```text
Signal Error
Market Move
Execution Delay
Slippage
Fee
Partial Fill
Liquidity
Data Error
Risk Constraint
Other
```

Classification should be evidence-based.

---

# 59. Strategy Health Integration

Edge metrics should feed into strategy health.

For example:

```text
Expected Edge
vs
Realized Edge
```

If the gap systematically widens, the strategy may have an execution-model problem even if its predictions remain accurate.

---

# 60. Edge Decay Monitoring

The system should monitor whether:

```text
Detection → Execution
```

time is increasing relative to the opportunity's survival time.

If opportunities increasingly disappear before execution, the strategy may have lost practical edge.

---

# 61. Alpha Attribution

The system should eventually answer:

> Where did this trade's expected edge come from?

Possible attribution:

```text
BTC Lead-Lag
Orderbook Imbalance
Wallet Activity
Market Dislocation
Regime
Timing
Other
```

Attribution must preserve uncertainty where attribution cannot be established reliably.

---

# 62. Research Requirements

Every new edge model should document:

1. Definition
2. Inputs
3. Formula or methodology
4. Assumptions
5. Data source
6. Timestamp requirements
7. Cost assumptions
8. Execution assumptions
9. Validation method
10. Failure conditions

---

# 63. Agent Rules

AI agents may:

* Implement signal normalization.
* Implement feature calculations.
* Build fusion experiments.
* Test weighting methods.
* Analyze correlations.
* Calculate theoretical edge.
* Build execution-adjusted models.
* Analyze expected vs realized edge.
* Produce research reports.

AI agents may not independently:

* Declare an edge validated.
* Select production thresholds without approval.
* Override risk.
* Bypass execution validation.
* Activate live trading.
* Remove unfavorable observations.
* Modify production signal weights without an approved decision.

---

# 64. Explicit Non-Assumptions

This document does not assume:

1. More signals produce better predictions.
2. Higher confidence means higher profitability.
3. The market midpoint is executable.
4. Top-of-book prices represent full available liquidity.
5. Theoretical edge equals executable edge.
6. Positive edge guarantees positive realized PnL.
7. Historical latency remains constant.
8. Historical slippage remains constant.
9. Signal agreement guarantees stronger edge.
10. A high backtest edge survives execution.
11. A profitable strategy remains profitable after competition.
12. A large observed discrepancy is necessarily a real opportunity.
13. All signals are independent.
14. Every opportunity should be traded.
15. Every missed opportunity was actually executable.

---

# 65. Completion Criteria

The signal fusion and edge system is complete when:

* Raw signals are validated.
* Signals have timestamps and freshness.
* Signals are normalized.
* Strategy identity and version are preserved.
* Fair value can be represented.
* Market price and executable price are distinguished.
* Theoretical edge is calculated.
* Execution-adjusted edge is calculated.
* Fees are included.
* Slippage is included.
* Depth is considered.
* Opportunity decay can be measured.
* Fill probability can be represented where required.
* Partial fills can be modeled.
* Conflicting signals are handled explicitly.
* Correlated signals are considered.
* Edge attribution is supported.
* Expected vs realized performance is tracked.
* No-trade opportunities are recorded.
* Risk remains independent.
* Agents cannot independently alter production edge logic.

---

# 66. Next Document

The next document is:

```text
docs/research/30-research-and-backtesting.md
```

That document will define the research environment, dataset construction, experiment lifecycle, historical replay, backtesting methodology, statistical validation, out-of-sample testing, parameter evaluation, and research integrity requirements.
