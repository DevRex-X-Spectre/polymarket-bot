# Polymarket Trading Bot

## Research and Backtesting

**Document:** `docs/research/30-research-and-backtesting.md`
**Status:** Approved
**Document Type:** Research and Backtesting Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/strategies/20-strategy-framework.md`
* `docs/strategies/21-alpha-strategies.md`
* `docs/strategies/22-signal-fusion-and-edge.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`

---

# 1. Purpose

This document defines how the project conducts quantitative research and historical backtesting.

The objective is to determine whether a strategy hypothesis has evidence of repeatable edge before exposing capital to it.

The research system must answer two separate questions:

```text
1. Did the strategy identify a potentially profitable condition?

2. Could that condition actually have been traded profitably?
```

The second question requires execution-aware analysis.

---

# 2. Research Principle

Research must be evidence-driven.

The system must not optimize for:

```text
Best historical PnL
```

as its only objective.

A valid research process must consider:

* Data quality
* Market selection
* Strategy logic
* Execution
* Fees
* Slippage
* Latency
* Liquidity
* Drawdown
* Competition
* Robustness
* Out-of-sample performance

---

# 3. Research Lifecycle

The standard research lifecycle is:

```text
Hypothesis
    ↓
Data Requirements
    ↓
Dataset Construction
    ↓
Data Validation
    ↓
Feature Construction
    ↓
Historical Replay
    ↓
Backtest
    ↓
Cost Adjustment
    ↓
Robustness Testing
    ↓
Out-of-Sample Testing
    ↓
Execution Simulation
    ↓
Paper Trading
    ↓
Decision
```

Every stage must be reproducible.

---

# 4. Research Hypothesis

Every experiment must begin with a clearly stated hypothesis.

A hypothesis must define:

* Expected behavior
* Why it may exist
* Required data
* Expected mechanism
* Measurement method
* Failure conditions

Example:

```text
Hypothesis:
External BTC price movement may temporarily precede repricing
in selected Polymarket BTC short-duration markets.

Required evidence:
Timestamped external BTC data, Polymarket market data,
resolution information, orderbook data, and execution data.

Failure condition:
The relationship disappears after realistic latency,
fees, slippage, and execution constraints.
```

---

# 5. Research Questions

Research should answer explicit questions.

Examples:

* Does the signal predict direction?
* How large is the observed edge?
* How often does the opportunity occur?
* How long does it remain executable?
* How much liquidity is available?
* What happens after fees?
* What happens after realistic latency?
* Does the relationship survive different market regimes?
* Does the relationship remain outside the research sample?

---

# 6. Research Dataset

Every experiment must identify the exact dataset used.

A dataset should include:

```text id="f8q3m7"
Dataset ID
Sources
Collection Period
Markets
Market Families
Resolution
Data Version
Processing Version
Feature Version
Created At
```

The same dataset must be reproducible where practical.

---

# 7. Raw Data Preservation

Raw source data should be preserved where legally, technically, and operationally practical.

Derived datasets must not replace the original evidence.

The preferred structure is:

```text id="x4m8p2"
Raw Data
   ↓
Normalized Data
   ↓
Derived Features
   ↓
Research Dataset
   ↓
Experiment
```

---

# 8. Data Sources

Research may use:

### Polymarket

* Gamma API
* CLOB REST
* CLOB market WebSocket
* CLOB user WebSocket where relevant
* Data API
* Relevant official subgraphs
* Resolution subgraph

### External Markets

* External BTC market feeds
* Other external feeds where explicitly justified

The exact source must be recorded for each experiment.

---

# 9. Event-Time Research

Historical analysis must preserve event time separately from ingestion time.

At minimum, the system should distinguish:

```text id="q6v2m9"
Event Time
Receipt Time
Processing Time
Order Submission Time
Exchange Arrival Time
Fill Time
```

This is essential for latency-sensitive strategies.

---

# 10. No Future Information

Backtests must only use information available at the simulated decision time.

The system must prevent look-ahead bias.

Incorrect:

```text id="m3q8v7"
Use future price
→
Generate earlier signal
```

Correct:

```text id="w5n2x9"
Available Historical Data
→
Generate Signal
→
Simulate Decision
```

---

# 11. Resolution Data

A backtest must only use resolution information when that information would actually have been available at the simulated point in time.

Final market outcomes must not leak into pre-resolution features.

---

# 12. Market Identity

Historical data must preserve market identity.

A backtest must not accidentally combine:

* Different events
* Different assets
* Different resolution rules
* Different market families
* Different outcomes

Market identity must be validated before analysis.

---

# 13. Market Family Validation

For cross-market research, validate:

```text id="r8m4q2"
Same Event
Same Underlying
Same Resolution
Same Timestamp
Same Asset
Same Outcome Semantics
```

A matching market name is not sufficient.

---

# 14. Data Quality Validation

Before a dataset is used for research, it should be checked for:

* Missing records
* Duplicate records
* Invalid timestamps
* Out-of-order events
* Stale data
* Impossible prices
* Invalid market mappings
* Missing orderbook levels
* Feed interruptions

The dataset should have a recorded quality status.

---

# 15. Missing Data

Missing data must not automatically be treated as:

```text
No price movement
```

or:

```text
No opportunity
```

The research system should identify missing intervals explicitly.

---

# 16. Duplicate Data

Duplicate events must be detected and handled deterministically.

The system must not allow duplicate market events to artificially increase:

* Volume
* Trade count
* Signal count
* Opportunity frequency

---

# 17. Out-of-Order Events

Streaming data may arrive out of order.

Historical reconstruction should preserve event timestamps and use an explicit ordering policy.

The policy must be documented.

---

# 18. Stale Data

Backtests must identify when an input would have been stale at decision time.

A strategy must not receive information that was technically recorded later but appears earlier due to processing errors.

---

# 19. Orderbook Reconstruction

Where strategy performance depends on orderbook execution, the research dataset should reconstruct the book as accurately as practical.

The reconstruction should support:

* Bids
* Asks
* Price levels
* Available quantity
* Spread
* Depth
* VWAP

---

# 20. Top-of-Book Limitation

A backtest that uses only:

```text
Best Bid
Best Ask
```

must not claim to simulate execution of arbitrary order sizes.

For larger trades, the simulation should walk available depth.

---

# 21. Depth-Aware Execution

For a requested quantity:

```text id="n7m3x8"
Requested Quantity
      ↓
Book Levels
      ↓
Consume Available Liquidity
      ↓
Calculate VWAP
      ↓
Calculate Slippage
```

This provides a more realistic execution estimate.

---

# 22. Historical Fees

Backtests must use the applicable fee model for the simulated period where reliable fee information is available.

The research must not assume that current fees were identical throughout history.

Where historical fee information cannot be established confidently, the limitation must be recorded.

---

# 23. Slippage

Backtests must distinguish:

```text id="v2q8m5"
Market Price
```

from:

```text id="j7m4x9"
Simulated Execution Price
```

Slippage should be calculated from actual or reconstructed orderbook conditions.

---

# 24. Latency Simulation

For latency-sensitive strategies, the backtest should model realistic delays.

The simulation should conceptually include:

```text id="p5n8r3"
Signal Detection
 ↓
Processing Delay
 ↓
Network Delay
 ↓
Exchange Arrival
 ↓
Orderbook State
 ↓
Execution
```

Latency assumptions must be documented.

---

# 25. Latency Distributions

A single fixed latency value may produce misleading results.

Where sufficient data exists, research should use observed latency distributions.

The system should preserve:

* Typical latency
* Variation
* Outliers
* Network failures

---

# 26. Opportunity Decay

Backtesting should measure how long opportunities remain available.

Candidate observation points may include:

```text id="x8m2q7"
100ms
250ms
500ms
1s
2s
5s
```

These are measurement intervals rather than assumed thresholds.

---

# 27. Capture Probability

The research system should estimate:

```text id="c5r9m3"
Probability of Capturing
Detected Opportunity
```

after accounting for:

* Processing
* Latency
* Price movement
* Liquidity
* Execution constraints

---

# 28. Theoretical Backtest

A theoretical backtest evaluates the strategy's prediction or pricing logic without fully modeling execution.

It can answer:

```text id="h4q7m2"
Was there a predictive relationship?
```

It cannot by itself answer:

```text id="k8m3x5"
Could the bot have captured the profit?
```

---

# 29. Execution-Aware Backtest

An execution-aware backtest incorporates:

* Actual orderbook conditions
* Quantity
* Fees
* Slippage
* Latency
* Order type
* Fill assumptions

This should be the preferred basis for evaluating strategies intended for live trading.

---

# 30. Fill Models

The research environment may use different fill models depending on available data.

Potential models include:

```text id="v7n4q8"
Top-of-Book Fill
Depth-Aware Fill
FOK
FAK
Passive / Maker
Queue-Aware
```

Each model must document its assumptions.

---

# 31. Passive Execution

Maker strategies require additional assumptions.

The simulator should eventually consider:

* Order placement
* Existing orders ahead
* Cancellations ahead
* Incoming aggressive flow
* Time in book
* Price movement

If queue position cannot be reconstructed accurately, the limitation must be explicit.

---

# 32. Partial Fills

Backtests must support partial execution where the live strategy would permit it.

Example:

```text id="m2q8v6"
Requested: 100
Simulated Fill: 65
Remaining: 35
```

The remaining quantity must not automatically be treated as filled.

---

# 33. FOK Simulation

For FOK strategies:

```text id="x7p4m9"
Required Quantity Available?
       ↓
   YES     NO
    ↓       ↓
  Fill    No Fill
```

The simulation must evaluate actual available depth rather than assuming sufficient liquidity.

---

# 34. FAK Simulation

For FAK:

```text id="q5m8r2"
Available Quantity
        ↓
Partial Fill
        ↓
Remaining Quantity Cancelled
```

The simulated result must preserve the actual filled quantity.

---

# 35. GTC / GTD Simulation

For resting orders, simulation must account for:

* Time in market
* Price movement
* Order cancellation
* Expiration
* Partial fills
* Opportunity expiration

A resting order cannot be assumed to fill simply because the market later traded through its price.

---

# 36. Strategy Transaction Costs

Backtests must include applicable costs.

At minimum where relevant:

* Trading fees
* Slippage
* Execution loss
* Other validated transaction costs

If a cost is excluded, the report must state why.

---

# 37. PnL Calculation

PnL must be calculated from simulated fills rather than signal prices.

Conceptually:

```text id="r3v7m8"
Simulated Orders
 ↓
Simulated Fills
 ↓
Positions
 ↓
Realized PnL
 ↓
Unrealized PnL
 ↓
Net PnL
```

---

# 38. Position Accounting

The research engine must maintain position state.

Where appropriate, it should support:

* Quantity
* Entry price
* Exit price
* Holding time
* Realized PnL
* Unrealized PnL

FIFO accounting should be supported where needed for wallet and trade analysis.

---

# 39. Capital Accounting

Backtests must track capital usage.

A strategy should not appear profitable because it implicitly uses unlimited capital.

The simulation should account for:

* Available capital
* Position exposure
* Reserved capital
* Concurrent positions

---

# 40. Concurrent Opportunities

If multiple opportunities occur simultaneously, the backtest must account for capital competition.

Example:

```text id="q6m2x9"
Opportunity A
Opportunity B
Opportunity C
        ↓
Limited Capital
        ↓
Selection / Rejection
```

This becomes important when evaluating portfolio-level performance.

---

# 41. Portfolio Backtesting

Individual strategy performance should be separated from portfolio performance.

The system should be able to answer:

```text id="n8v4m3"
How does Strategy A perform alone?
```

and:

```text id="x5q7m2"
How does A + B + C perform together?
```

---

# 42. Risk in Backtests

Backtests must apply the intended risk framework where practical.

A strategy should not be judged from trades that would have violated production constraints.

Risk assumptions must be documented.

---

# 43. Drawdown

Research must measure maximum drawdown.

A high-return strategy with unacceptable drawdown may not be suitable for live trading.

Drawdown should be calculated from the simulated equity curve.

---

# 44. Performance Metrics

Depending on strategy type, backtests should report:

* Net PnL
* Return
* Maximum drawdown
* Win rate
* Profit factor
* Trade count
* Average trade
* Median trade
* Average edge
* Realized edge
* Fees
* Slippage
* Average holding time
* Fill rate
* Partial fill rate
* Opportunity count
* Capture rate

---

# 45. Profit Factor

Profit factor should be calculated consistently:

```text id="p4m8x2"
Gross Profits
----------------
Gross Losses
```

The definition must be applied consistently across experiments.

---

# 46. Win Rate

Win rate alone must not be used as evidence of strategy quality.

A strategy can have:

```text id="c7q2m9"
High Win Rate
+
Negative Expected Value
```

or:

```text id="x4m8p6"
Low Win Rate
+
Positive Expected Value
```

depending on payoff distribution.

---

# 47. Edge Distribution

Research should examine the distribution of trade-level expected and realized edge.

This can reveal whether performance comes from:

* Many small edges
* Few large opportunities
* Rare outliers
* One specific market regime

---

# 48. Parameter Testing

Parameters may be tested across ranges.

Example:

```text id="r8m3q5"
Parameter
   ↓
Candidate Range
   ↓
Backtests
   ↓
Robustness Analysis
```

The purpose is not to find the single best historical value.

It is to determine whether the strategy remains effective across a reasonable range.

---

# 49. Parameter Sensitivity

A strategy should be tested for sensitivity to important parameters.

If tiny changes cause large performance changes:

```text id="f6q9m2"
Parameter
± Small Change
→
Large Performance Change
```

the strategy requires additional scrutiny.

---

# 50. Optimization Risk

Optimization can overfit historical noise.

The research system must preserve:

* Original hypothesis
* Original parameter set
* Tested parameter ranges
* Number of experiments
* Selection method
* Final chosen parameters

This prevents hidden optimization.

---

# 51. Multiple Testing

Testing many variants increases the probability of finding apparently successful results by chance.

Research reports should therefore record the breadth of experimentation.

A strong result after thousands of unreported variants is not equivalent to a strong result from a pre-defined test.

---

# 52. In-Sample and Out-of-Sample

Where appropriate, data should be divided into:

```text id="m7x2q8"
Research / In-Sample
        ↓
Validation
        ↓
Out-of-Sample
```

The final performance assessment must prioritize unseen data.

---

# 53. Walk-Forward Testing

For time-dependent strategies, walk-forward evaluation may be appropriate.

Conceptually:

```text id="q8m4v2"
Train
 ↓
Validate
 ↓
Test
 ↓
Move Forward
 ↓
Train Again
```

This better reflects how the strategy would evolve over time.

---

# 54. Regime Testing

Strategies should be tested across different market conditions.

Potential regimes:

* High volatility
* Low volatility
* High liquidity
* Low liquidity
* Near resolution
* Far from resolution
* Strong external movement
* Stable external market

---

# 55. Market Selection Bias

Research must avoid selecting only markets where the strategy happened to work.

The dataset should define market-selection rules before evaluation where practical.

If markets are filtered after seeing results, the selection process must be recorded.

---

# 56. Survivorship Bias

The research dataset should account for markets that existed during the evaluation period but later became inactive, resolved, or otherwise disappeared from current market listings.

Historical research must not use only currently visible successful markets.

---

# 57. Resolution Bias

Markets that resolve in favorable ways must not be overrepresented.

The dataset should preserve the complete relevant market population where practical.

---

# 58. Data Snooping

Research code must not silently inspect future data while generating historical signals.

Features must be generated according to information availability at the simulated timestamp.

---

# 59. Research Reproducibility

Every experiment should be reproducible from:

```text id="w4m9x7"
Experiment ID
+
Dataset Version
+
Code Version
+
Strategy Version
+
Parameters
+
Execution Model
```

The result should be attributable to these inputs.

---

# 60. Experiment Record

Each experiment should record:

```text id="p6q2m8"
Experiment ID
Hypothesis
Strategy
Strategy Version
Dataset
Date Range
Parameters
Execution Model
Costs
Metrics
Results
Limitations
Conclusion
Decision
```

---

# 61. Experiment Outcomes

An experiment should conclude with one of:

```text id="n3v8m5"
SUPPORTED
INCONCLUSIVE
REJECTED
NEEDS_MORE_DATA
```

A result must not be labeled supported solely because PnL was positive.

---

# 62. Rejected Hypotheses

Rejected hypotheses must remain available for historical reference.

This prevents repeatedly testing the same failed idea without knowing it was previously evaluated.

---

# 63. Research Notes

Important observations should be preserved, including:

* Unexpected behavior
* Data anomalies
* Execution anomalies
* Regime changes
* Strategy weaknesses
* Potential new hypotheses

Research notes are part of the project's knowledge base.

---

# 64. Backtest Report

A completed backtest report should contain:

### Summary

* Hypothesis
* Dataset
* Strategy version
* Evaluation period

### Method

* Features
* Entry logic
* Exit logic
* Execution model
* Costs
* Risk assumptions

### Results

* PnL
* Drawdown
* Edge
* Fill rate
* Slippage
* Fees
* Trade count

### Robustness

* Parameter sensitivity
* Regime performance
* Out-of-sample performance

### Limitations

* Missing data
* Execution assumptions
* Queue assumptions
* Latency assumptions

### Decision

* Continue
* Refine
* Reject
* Paper trade

---

# 65. Backtest Integrity

The research engine must never:

* Use future information.
* Assume every order fills.
* Ignore fees without disclosure.
* Ignore slippage without disclosure.
* Ignore liquidity.
* Ignore capital limits.
* Remove losing trades selectively.
* Change parameters silently.
* Report theoretical PnL as realized PnL.
* Treat incomplete execution as completed execution.

---

# 66. Theoretical Opportunity Journal

Even opportunities that are not executable should be recorded when useful.

The journal may contain:

```text id="x2m8q4"
Opportunity
Detected
Theoretical Edge
Executable Edge
Reason Not Executed
Subsequent Market Movement
```

This helps quantify how much apparent edge is actually captureable.

---

# 67. Missed Opportunity Research

The research system should distinguish:

```text id="q7m3v9"
Opportunity Missed
```

from:

```text id="r8m2x5"
Opportunity That Was Never Actually Executable
```

This distinction prevents hindsight bias.

---

# 68. Strategy Comparison

Strategies should be compared using more than PnL.

Comparison should consider:

* Net edge
* Drawdown
* Capital efficiency
* Opportunity frequency
* Execution difficulty
* Latency sensitivity
* Liquidity requirements
* Competition
* Stability
* Operational complexity

---

# 69. Strategy Promotion Evidence

Before a strategy enters paper trading, the research should establish sufficient evidence that:

```text id="m4q8x2"
Signal Exists
+
Edge Exists
+
Costs Are Included
+
Execution Is Plausible
```

Before live trading:

```text id="v7m3n8"
Research
+
Execution Simulation
+
Paper Trading
+
Risk Review
+
Operational Readiness
```

must support promotion.

---

# 70. Paper Trading Research

Paper trading should use live data while preventing real order submission.

The system should compare:

```text id="p5x9m4"
Predicted Execution
vs
Actual Market Conditions
```

This allows validation of live signal and execution assumptions.

---

# 71. Paper-to-Live Gap

Research must monitor the difference between:

```text id="c8m2q7"
Backtest
vs
Paper
vs
Live
```

A significant degradation may indicate:

* Backtest bias
* Latency assumptions
* Market changes
* Execution differences
* Data-quality issues
* Competition

---

# 72. Research Storage

Research datasets should primarily use:

* Parquet for high-frequency datasets.
* DuckDB for analytical querying.
* PostgreSQL for structured metadata and experiment records.

This follows the project's established data architecture.

---

# 73. Research Dataset Versioning

Dataset changes must produce identifiable versions.

A version may change because:

* New data was added.
* Historical corrections occurred.
* Processing logic changed.
* Source mapping changed.
* Data cleaning changed.

Backtest results must reference the dataset version used.

---

# 74. Research Code Versioning

Backtests must preserve the code version used to generate them.

A result without identifiable implementation state is not fully reproducible.

---

# 75. Research Environment

Research should remain separate from the live trading process.

```text id="w8m4q2"
Research
   │
   ├── Datasets
   ├── Features
   ├── Backtests
   └── Simulations
```

must not have direct permission to submit live orders.

---

# 76. Live Boundary

The research environment must never contain an implicit path such as:

```text id="n5q8m3"
Backtest
 ↓
Live Order
```

Promotion must pass through explicit strategy and risk controls.

---

# 77. Agent Research Rules

AI agents may:

* Build research datasets.
* Write backtests.
* Run experiments.
* Compare parameter ranges.
* Analyze results.
* Identify data problems.
* Build execution simulations.
* Produce research reports.

AI agents must not:

* Hide failed experiments.
* Delete inconvenient results.
* Change the hypothesis after seeing results without recording the change.
* Declare a strategy production-ready without approval.
* Enable live trading.
* Treat optimized historical performance as proof of future profitability.

---

# 78. Research Integrity Rule

The project follows:

> If the result cannot be reproduced and explained, it cannot be treated as established evidence.

---

# 79. Explicit Non-Assumptions

This research framework does not assume:

1. Historical profitability predicts future profitability.
2. A profitable backtest is executable.
3. Top-of-book prices represent available size.
4. Historical latency equals future latency.
5. Historical fees remain unchanged.
6. Historical competition remains unchanged.
7. Optimized parameters are optimal.
8. One market regime represents all regimes.
9. Positive paper trading guarantees live profitability.
10. A high win rate proves strategy quality.
11. The best historical strategy is the best live strategy.
12. Missing data can safely be ignored.
13. A theoretical arbitrage is automatically executable.
14. A public strategy implementation is independently validated.

---

# 80. Completion Criteria

The research and backtesting system is complete when:

* Hypotheses are explicitly defined.
* Datasets are versioned.
* Raw data can be preserved.
* Event time is distinguished from processing time.
* Look-ahead bias is prevented.
* Market identity is validated.
* Data quality is measured.
* Orderbook depth can be reconstructed where required.
* Fees can be included.
* Slippage can be modeled.
* Latency can be modeled.
* Partial fills are supported.
* Multiple order types can be simulated where relevant.
* Capital constraints are represented.
* Risk assumptions are represented.
* Out-of-sample testing is supported.
* Parameter sensitivity can be evaluated.
* Opportunity decay can be measured.
* Capture probability can be evaluated.
* Expected and realized results are separated.
* Experiments are reproducible.
* Negative results are preserved.
* Research cannot directly activate live trading.

---

# 81. Next Document

The next document is:

```text
docs/research/31-execution-simulation.md
```

That document will define the dedicated execution simulator, including orderbook replay, latency modeling, queue assumptions, FOK/FAK/GTC/GTD behavior, partial fills, sequential and parallel execution, opportunity decay, and realistic capture probability.
