# Polymarket Trading Bot

## Strategy Framework

**Document:** `docs/strategies/20-strategy-framework.md`
**Status:** Approved
**Document Type:** Strategy Architecture and Development Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`

---

# 1. Purpose

This document defines the common framework that every trading strategy in the bot must follow.

The goal is to prevent individual strategies from becoming isolated systems with their own:

* Data models
* Execution logic
* Risk logic
* Signal formats
* Position tracking
* Performance metrics
* Research standards

Every strategy must operate through the same system contracts.

---

# 2. Strategy Principle

A strategy is a research-backed mechanism for identifying situations where the expected value of a trade may be positive.

A strategy is **not**:

* An order executor
* A risk engine
* A wallet manager
* A portfolio manager
* A source of truth for market state
* A replacement for research
* A guarantee of profitability

The strategy produces an opportunity and signal.

The rest of the system determines whether that opportunity can safely become a trade.

---

# 3. Strategy Lifecycle

Every strategy follows:

```text id="q8m3v7"
Idea
 ↓
Hypothesis
 ↓
Data Collection
 ↓
Feature Development
 ↓
Historical Research
 ↓
Backtesting
 ↓
Execution Simulation
 ↓
Paper Trading
 ↓
Validation
 ↓
Controlled Live Testing
 ↓
Production
 ↓
Continuous Monitoring
```

A strategy may stop at any stage.

A promising idea is not automatically promoted.

---

# 4. Strategy Hypothesis

Every strategy must begin with a clearly stated hypothesis.

The hypothesis must explain:

1. What inefficiency is believed to exist.
2. Why the inefficiency may exist.
3. What observable data should reveal it.
4. When the opportunity should occur.
5. What would invalidate the hypothesis.
6. How the hypothesis will be tested.

Example:

```text id="m4p9x2"
Hypothesis:
An external BTC price feed may contain information that reaches
the Polymarket BTC short-duration market later than the external
market during some market conditions.

Test:
Measure timestamped lead/lag relationships and determine whether
the relationship survives fees, spread, slippage, latency, and
execution constraints.
```

This is a hypothesis, not a fact.

---

# 5. Strategy Identity

Each strategy must have a stable identity.

Conceptually:

```text id="r6k2n8"
Strategy ID
Strategy Name
Strategy Version
Description
Owner
Status
Created At
Updated At
```

Example:

```text
btc-lead-lag
```

Version changes must be traceable.

---

# 6. Strategy Status

A strategy should have an explicit lifecycle status.

Possible states:

```text id="w5q8m3"
DRAFT
RESEARCH
BACKTESTING
SIMULATION
PAPER
VALIDATING
LIVE
PAUSED
DEGRADED
RETIRED
```

The exact state transition rules are controlled by the strategy promotion process.

---

# 7. Strategy Isolation

Each strategy must operate independently.

One strategy must not silently modify:

* Another strategy's parameters
* Another strategy's positions
* Another strategy's risk limits
* Another strategy's execution state
* Another strategy's performance records

Shared infrastructure is allowed.

Shared mutable strategy state must be controlled.

---

# 8. Strategy Input Contract

A strategy receives normalized information rather than directly querying arbitrary external APIs.

Potential inputs include:

* Market state
* Orderbook state
* Price history
* Trade flow
* Resolution information
* External market data
* Wallet intelligence
* Competition information
* Time-to-resolution
* Market family information
* Derived features

The strategy should consume the normalized truth layer.

---

# 9. Strategy Output Contract

A strategy should produce one of:

```text id="x3m7v9"
NO_SIGNAL
SIGNAL
OPPORTUNITY
```

A signal must contain enough information to explain why it exists.

Conceptually:

```text id="p5r8k2"
Signal
├── Strategy ID
├── Strategy Version
├── Market
├── Token / Outcome
├── Direction
├── Signal Timestamp
├── Expected Probability / Value
├── Confidence
├── Signal Features
├── Expected Horizon
├── Invalidation Conditions
└── Evidence References
```

The exact implementation schema is defined by the application layer.

---

# 10. No Direct Orders

A strategy must never directly submit a Polymarket order.

Incorrect:

```text
Strategy
   ↓
CLOB
```

Correct:

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
CLOB
```

This separation is mandatory.

---

# 11. Strategy Signal

A signal represents an observed condition that may justify further evaluation.

A signal does not mean:

```text
BUY NOW
```

It means:

```text
A potentially actionable condition has been detected.
```

The edge and risk layers determine whether it becomes executable.

---

# 12. Opportunity

An opportunity is a more complete representation of a potentially tradable situation.

Conceptually:

```text id="g8q4m1"
Signal
 ↓
Market Context
 ↓
Expected Outcome
 ↓
Expected Price
 ↓
Current Executable Price
 ↓
Costs
 ↓
Execution Constraints
 ↓
Opportunity
```

An opportunity must be evaluated against current market conditions.

---

# 13. Signal vs Opportunity

The system must distinguish:

### Signal

A potentially meaningful observation.

### Opportunity

A signal that has been evaluated against market state and economics.

### Executable Opportunity

An opportunity that remains actionable after:

* Liquidity
* Slippage
* Fees
* Latency
* Risk
* Execution constraints

have been considered.

---

# 14. Strategy Features

Features are measurable inputs used by the strategy.

Examples include:

* Price change
* Return
* Volatility
* Spread
* Depth
* Orderbook imbalance
* Trade volume
* Time to resolution
* External price movement
* Lead/lag measurements
* Wallet activity
* Market dislocation
* Competition intensity

Features must have:

* Definition
* Source
* Timestamp
* Calculation method
* Units
* Validity conditions

---

# 15. Feature Freshness

A strategy must know how old its inputs are.

For time-sensitive strategies:

```text id="n7v3m8"
Feature Timestamp
+
Current Time
=
Feature Age
```

If a feature is stale beyond the strategy's validated tolerance, the strategy must not treat it as current.

The tolerance must be research-driven.

---

# 16. Feature Lineage

Every important derived feature must be traceable to its source data.

Conceptually:

```text id="c4m8q6"
Raw Event
 ↓
Normalized Event
 ↓
Derived Feature
 ↓
Signal
 ↓
Opportunity
 ↓
Trade
```

This allows post-trade investigation.

---

# 17. Feature Validation

A strategy must not silently use invalid data.

Invalid conditions may include:

* Missing value
* Stale value
* Out-of-order event
* Duplicate event
* Impossible value
* Wrong market
* Wrong token
* Wrong timestamp
* Wrong resolution source

The appropriate behavior is strategy-specific but must be explicit.

---

# 18. Probability Estimation

Strategies that estimate probabilities must distinguish:

```text id="f8k2m5"
Observed Market Price
```

from:

```text
Estimated Fair Probability
```

The estimated probability must come from a defined model or methodology.

The system must preserve both values.

---

# 19. Fair Value

A strategy may calculate an estimated fair probability or fair value.

Conceptually:

```text id="s6q9m2"
Fair Value
-
Executable Market Price
=
Raw Edge
```

The raw edge is not yet the final trade edge.

---

# 20. Net Edge

The final expected edge must consider execution costs.

Conceptually:

```text id="v3m7q8"
Raw Edge
- Fees
- Expected Slippage
- Execution Costs
- Other Validated Costs
=
Net Expected Edge
```

Only net economics should be used for trade decisions.

---

# 21. Confidence

Confidence must not be treated as a substitute for expected value.

A strategy may have:

```text
High Confidence + Negative EV
```

or:

```text
Lower Confidence + Positive EV
```

depending on how the model is defined.

Confidence must therefore have an explicit mathematical or statistical meaning where it is used.

---

# 22. Signal Normalization

Different strategies may produce different raw signals.

The system must normalize them into a common representation.

Example:

```text id="p8n4m6"
Strategy A
Raw Score
   ↓
Normalized Signal

Strategy B
Raw Score
   ↓
Normalized Signal

Strategy C
Raw Score
   ↓
Normalized Signal
```

This enables signal fusion.

---

# 23. Signal Direction

A signal should explicitly identify its intended direction where applicable.

Examples:

```text
BUY_YES
BUY_NO
SELL_YES
SELL_NO
NEUTRAL
```

The valid set depends on the strategy and market structure.

The strategy must not assume that every market supports identical execution semantics.

---

# 24. Time Horizon

Every time-sensitive strategy must identify its expected horizon.

Examples:

```text
Milliseconds
Seconds
Minutes
Hours
Until Resolution
```

The strategy must not use a time horizon that conflicts with the market's resolution structure.

---

# 25. Invalidation Conditions

Every strategy should define when its signal is no longer valid.

Examples:

* External price reverses
* Spread widens
* Orderbook liquidity disappears
* Resolution window changes
* Market resolves
* Data becomes stale
* Expected edge falls below required level
* Execution latency becomes unacceptable

An invalidated signal must not remain executable merely because it was profitable when originally detected.

---

# 26. Strategy Expiration

Signals should have an explicit validity window when appropriate.

Conceptually:

```text id="k7q2m9"
Signal Created
      ↓
Valid Window
      ↓
Expired
```

Expired signals must not automatically become trades.

---

# 27. Strategy Versioning

Every research and production strategy must have a version.

A version change may occur when:

* Feature definitions change
* Model changes
* Entry logic changes
* Exit logic changes
* Execution assumptions change
* Signal normalization changes
* Important parameters change

Strategy performance must remain attributable to the correct version.

---

# 28. Parameter Management

Parameters must be configuration-driven.

They must not be scattered through source code.

Examples:

```text id="m9x4q7"
Lookback Window
Entry Threshold
Exit Threshold
Minimum Edge
Maximum Holding Time
Feature Window
```

These are examples only.

Actual values must come from research.

---

# 29. Parameter Provenance

Every production parameter must have a reason for existing.

Possible sources:

* Research experiment
* Backtest
* Execution simulation
* Paper trading
* Statistical analysis
* Risk requirement

Parameters must not be selected solely because they produced the best historical result.

---

# 30. Parameter Overfitting

The strategy framework must explicitly guard against overfitting.

A strategy should not be considered validated simply because:

```text
Parameter X
+
Parameter Y
+
Parameter Z
```

produced excellent historical performance.

The system should test whether performance survives:

* Different periods
* Different market conditions
* Different parameter values
* Execution costs
* Data perturbations
* Out-of-sample data

---

# 31. Strategy Research Dataset

A strategy must identify the dataset used for evaluation.

The dataset should preserve:

* Source
* Collection period
* Markets
* Resolution
* Data version
* Feature version
* Processing version

This allows results to be reproduced.

---

# 32. Backtesting Contract

A strategy backtest must define:

```text id="q3m8v5"
Dataset
+
Strategy Version
+
Parameters
+
Execution Assumptions
+
Costs
+
Evaluation Period
```

The result must be reproducible from those inputs.

---

# 33. Backtesting Requirements

Backtests should measure more than gross profit.

Relevant metrics include:

* Net PnL
* Return
* Win rate
* Profit factor
* Maximum drawdown
* Trade count
* Average edge
* Realized edge
* Average holding time
* Slippage
* Fees
* Exposure
* Opportunity count

The exact metric set depends on strategy type.

---

# 34. Execution Simulation Requirement

A strategy that depends on fast execution must undergo execution simulation before live promotion.

The simulation should account for:

* Orderbook depth
* Price movement
* Latency
* Order arrival
* Fill probability
* Partial fills
* Fees
* Slippage
* Cancellation behavior

The purpose is to determine whether theoretical edge can realistically be captured.

---

# 35. Paper Trading

A strategy should enter paper trading only after sufficient research evidence exists.

Paper trading evaluates:

* Live signal generation
* Data quality
* Signal freshness
* Execution assumptions
* Opportunity frequency
* Expected vs simulated execution
* Strategy operational stability

Paper trading is not proof of future profitability.

---

# 36. Live Promotion

A strategy may only move toward live trading after meeting documented promotion criteria.

Promotion should consider:

```text id="x8m4r6"
Research Evidence
+
Backtest Evidence
+
Execution Simulation
+
Paper Trading
+
Risk Review
+
Operational Readiness
```

No single metric is sufficient.

---

# 37. Strategy Degradation

A live strategy may become less effective.

Possible causes:

* Market structure changes
* Competition
* Reduced opportunity frequency
* Higher latency
* Higher costs
* Changed resolution behavior
* External market changes
* Signal decay

The system must monitor strategy health continuously.

---

# 38. Strategy Health Metrics

At minimum, the framework should support:

* Signal count
* Opportunity count
* Execution count
* Fill rate
* Win rate
* Profit factor
* Net PnL
* Maximum drawdown
* Average edge
* Realized edge
* Slippage
* Fees
* Latency
* Opportunity survival
* Expected vs realized PnL

---

# 39. Strategy Disable Conditions

A strategy may be paused or degraded when explicitly defined conditions are met.

Possible triggers include:

* Data integrity failure
* Excessive stale data
* Execution failures
* Reconciliation failures
* Significant unexplained performance deterioration
* Risk limit breach
* Market structure invalidation

Disable rules must be explicit.

The system must not invent automatic disable thresholds.

---

# 40. Strategy Health vs Strategy Profit

A strategy can be operationally healthy while losing money.

Likewise, a strategy can make money while exhibiting serious operational problems.

Therefore:

```text id="n6q2v8"
Strategy Health
≠
Strategy Profitability
```

Both must be monitored independently.

---

# 41. Competition Awareness

A strategy should account for competition where competition affects its edge.

Relevant observations may include:

* Execution density
* Repeat takers
* Maker activity
* Opportunity decay
* Fill rates
* Market concentration
* Competitor behavior

Wallet activity must not automatically be interpreted as intelligent trading.

---

# 42. Wallet Intelligence as a Strategy Input

Wallet intelligence may provide features such as:

* Historical profitability
* Holding time
* Entry quality
* Trade frequency
* Market preference
* Copyability
* Behavioral consistency

The strategy must not assume that a profitable wallet is automatically profitable to copy.

---

# 43. Copyability

A wallet's historical performance is insufficient to establish copyability.

Copyability must consider:

```text id="r5m9x3"
Historical Performance
+
Execution Delay
+
Liquidity
+
Spread
+
Trade Size
+
Market Conditions
+
Timing
```

A strategy should measure simulated copy performance before considering live use.

---

# 44. BTC Microstructure Strategy

The initial BTC strategy framework may evaluate:

* External BTC price
* Polymarket market price
* Actual resolution source
* Time to resolution
* Opening/reference price
* Orderbook state
* Spread
* Depth
* Short-term volatility
* Momentum/reversal
* Lead/lag

These are candidate inputs, not proof that each produces alpha.

---

# 45. BTC Resolution Source

The strategy must read the actual resolution rules for each market.

It must not assume:

```text
Polymarket BTC market
=
Binance settlement
```

The external market may be used as a predictive input, while the actual resolution source determines the outcome.

---

# 46. Lead-Lag Research

Lead-lag strategies must measure:

```text id="c7m2v9"
External Price Timestamp
vs
Polymarket Price Timestamp
```

The research must determine whether the relationship is:

* Persistent
* Conditional
* Market-specific
* Time-specific
* Regime-dependent
* Executable after latency

Any observed historical lead must not be treated as a permanent fixed delay.

---

# 47. Market Dislocation Strategies

Market dislocation strategies may investigate:

* Related outcome pricing
* Cross-market relationships
* Complementary outcomes
* Structural parity
* Negative-risk relationships
* Temporary pricing inconsistencies

Before comparing markets, the system must validate that they belong to the correct market family.

---

# 48. Market Family Validation

Cross-market strategies must validate:

```text id="m8q4x6"
Same Event
Same Underlying
Same Resolution
Same Timestamp
Same Asset
Same Outcome Semantics
```

A numerical price relationship between unrelated markets is not automatically arbitrage.

---

# 49. Tail Entry Strategies

Tail strategies may investigate unusually large short-term movements.

Examples of candidate features:

* Rapid percentage move
* Volatility spike
* Orderbook imbalance
* Trade intensity
* Spread expansion
* External market movement

Thresholds must be experimentally validated.

They must not be hardcoded from another project or assumed to generalize.

---

# 50. Information and Regime Strategies

News, social activity, macro data, and other information sources may be used as:

* Regime indicators
* Volatility filters
* Event filters
* Market-condition classifiers

They should not automatically become directional trading signals.

The usefulness of each information source must be demonstrated through research.

---

# 51. Strategy Composition

Multiple strategies may operate simultaneously.

However, composition must occur through the signal-fusion layer.

```text id="v5n8q3"
Strategy A
     │
Strategy B ──→ Signal Fusion
     │              │
Strategy C         ▼
              Unified Signal
```

Strategies should not directly coordinate through hidden shared state.

---

# 52. Signal Fusion

Signal fusion may combine:

* Direction
* Expected edge
* Confidence
* Timing
* Market state
* Strategy agreement
* Execution quality
* Risk state

Fusion methodology must be explicitly defined and validated.

More signals do not automatically produce a better signal.

---

# 53. Conflicting Signals

If strategies disagree:

```text id="q9m3x7"
Strategy A → BUY
Strategy B → SELL
```

the system must not arbitrarily choose one.

Possible outcomes:

* Reduce confidence
* Reject opportunity
* Apply strategy weighting
* Treat as a separate regime
* Escalate for research

The selected behavior must be documented.

---

# 54. Strategy Attribution

Every executed trade must retain its originating strategy and version.

For multi-strategy signals, the system should preserve the contributing strategies.

This enables:

```text id="k4r8m2"
PnL
 ↓
Strategy
 ↓
Strategy Version
 ↓
Signal
 ↓
Features
```

---

# 55. Edge Attribution

The system should eventually attribute realized performance to contributing edge sources.

Possible categories:

* BTC lead-lag
* Orderbook imbalance
* Wallet intelligence
* Market dislocation
* Timing
* Regime
* Other validated signal

The attribution model must be evidence-based.

---

# 56. Strategy Experimentation

Research experiments must remain separate from production strategy state.

An experiment may change:

* Features
* Parameters
* Model
* Entry conditions
* Exit conditions
* Execution assumptions

without changing the live strategy.

Only an approved promotion may modify production behavior.

---

# 57. Experiment Identity

Each experiment should have:

```text id="x6m9q4"
Experiment ID
Strategy ID
Strategy Version
Dataset Version
Parameter Set
Hypothesis
Results
Conclusion
Decision
```

A failed experiment is still valuable research and should be preserved.

---

# 58. Negative Results

The system must preserve evidence that disproves a hypothesis.

Examples:

```text
BTC lead-lag not executable
Wallet copy strategy loses after latency
Arbitrage disappears before execution
Maker strategy has insufficient fill probability
```

Negative results must not be deleted simply because they are unprofitable.

---

# 59. No-Trade Research

The system should support measuring opportunities where no trade was taken.

Reasons may include:

* Risk rejection
* Insufficient edge
* Insufficient liquidity
* Stale data
* Price protection
* Opportunity expired
* Execution unavailable
* Strategy disabled

This enables comparison between:

```text
Opportunity
vs
Tradable Opportunity
vs
Executed Opportunity
```

---

# 60. Strategy Decision Record

Every strategy decision should be explainable.

At minimum:

```text id="p7m4n8"
Why was the signal generated?
Why was the opportunity considered valid?
Why was the trade accepted or rejected?
Why was the selected execution method used?
```

This is required for debugging and research.

---

# 61. Strategy Development Rules

Developers and AI agents must:

1. Start with a hypothesis.
2. Identify required data.
3. Validate data quality.
4. Define features.
5. Build reproducible research.
6. Backtest.
7. Simulate execution where necessary.
8. Paper trade.
9. Measure strategy health.
10. Document results.
11. Obtain explicit promotion approval.
12. Never silently move research logic into production.

---

# 62. Agent Restrictions

AI agents may:

* Implement strategy infrastructure.
* Build feature calculations.
* Build datasets.
* Run experiments.
* Build backtests.
* Build execution simulations.
* Analyze results.
* Identify potential weaknesses.
* Document findings.
* Refactor strategy code.

AI agents may not independently:

* Decide that a strategy is profitable.
* Promote a strategy to live.
* Change live risk limits.
* Allocate live capital.
* Enable live execution.
* Remove safety checks.
* Select production parameters solely from backtest optimization.

---

# 63. Strategy Source of Truth

The authoritative strategy definition consists of:

```text id="m5q8x2"
Strategy Specification
+
Strategy Version
+
Approved Parameters
+
Approved Research Evidence
+
Approved Execution Assumptions
```

Code implements this specification.

If implementation and approved documentation conflict, the discrepancy must be surfaced.

---

# 64. Strategy Completion Criteria

The strategy framework is complete when:

* Every strategy has an identity.
* Every strategy has a lifecycle.
* Strategies use normalized inputs.
* Strategies produce standardized signals.
* Signals are distinct from opportunities.
* Opportunities are distinct from executable opportunities.
* Strategies cannot directly submit orders.
* Strategy parameters are versioned.
* Parameter provenance is recorded.
* Feature lineage is available.
* Research datasets are identifiable.
* Backtests are reproducible.
* Execution simulation is supported where required.
* Paper trading is separated from live trading.
* Strategy health is measurable.
* Negative research results are preserved.
* Strategy attribution is supported.
* AI agents cannot independently promote strategies.
* Production strategy behavior is explicitly approved.

---

# 65. Next Document

The next document is:

```text
docs/strategies/21-alpha-strategies.md
```

That document will define the project's initial alpha research areas, including BTC microstructure, whale intelligence, market dislocation, information/regime signals, competition intelligence, and the distinction between research hypotheses and validated trading strategies.
