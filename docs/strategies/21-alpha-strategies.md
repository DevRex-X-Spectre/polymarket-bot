# Polymarket Trading Bot

## Alpha Strategies

**Document:** `docs/strategies/21-alpha-strategies.md`
**Status:** Approved
**Document Type:** Alpha Research Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/strategies/20-strategy-framework.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`

---

# 1. Purpose

This document defines the initial alpha research areas for the Polymarket bot.

It does **not** claim that any of these strategies are profitable.

Each area is a research hypothesis that must be tested against historical data, execution constraints, competition, and risk.

The initial alpha research areas are:

1. BTC microstructure and lead-lag
2. Whale intelligence
3. Market dislocation and structural relationships
4. Information and market regime
5. Competition intelligence
6. Short-term anomaly and momentum/reversal behavior

---

# 2. Alpha Principle

The bot should not search for strategies simply because they are popular.

The objective is to identify measurable and executable sources of edge.

The research process is:

```text id="m7q2v9"
Market Behavior
      ↓
Hypothesis
      ↓
Observable Data
      ↓
Feature
      ↓
Signal
      ↓
Historical Test
      ↓
Execution Test
      ↓
Paper Test
      ↓
Validation
```

A hypothesis that fails testing is not a failed project.

It is a completed research result.

---

# 3. Alpha Definition

For this project, alpha means a repeatable source of expected advantage that remains positive after relevant costs and execution constraints.

Conceptually:

```text id="p8m4x6"
Gross Edge
- Fees
- Slippage
- Latency Effects
- Execution Losses
- Other Validated Costs
=
Net Edge
```

A strategy must demonstrate net edge rather than merely theoretical price discrepancy.

---

# 4. Alpha Categories

The initial research framework contains four primary alpha engines and supporting intelligence layers.

```text id="v5n8q2"
PRIMARY ALPHA
├── BTC Microstructure
├── Whale Intelligence
├── Market Dislocation
└── Information / Regime

SUPPORTING INTELLIGENCE
├── Competition
├── Execution
└── Market Anomalies
```

Supporting intelligence may improve or invalidate primary signals without necessarily becoming an independent strategy.

---

# 5. Alpha Engine A: BTC Microstructure

## 5.1 Hypothesis

Short-duration BTC prediction markets may temporarily reflect external BTC market movements with measurable timing differences.

The initial research question is:

> Can external BTC market information improve prediction of Polymarket BTC short-duration market prices or outcomes after accounting for resolution rules, fees, slippage, latency, and execution constraints?

This is a hypothesis.

---

# 6. BTC Data Inputs

Research may use:

* External BTC price
* External BTC trades
* External BTC orderbook where available
* Polymarket BTC price
* Polymarket orderbook
* Polymarket trades
* Time to resolution
* Market opening/reference price
* Actual resolution source
* Short-term volatility
* Spread
* Depth
* Orderbook imbalance
* Price momentum
* Price reversal
* Market state

---

# 7. BTC Resolution Source

The bot must identify the actual resolution mechanism for each market.

It must not assume that an external BTC exchange is the settlement source.

For each market:

```text id="k4q8m2"
Market
 ↓
Resolution Rules
 ↓
Resolution Source
 ↓
Resolution Timestamp
```

The external BTC feed is a predictive input unless it is explicitly the market's resolution source.

---

# 8. BTC Lead-Lag Research

The system should measure whether movement in an external BTC market precedes movement in the relevant Polymarket market.

Conceptually:

```text id="n7m3x9"
External BTC Movement
        ↓
Time Δ
        ↓
Polymarket Movement
```

The research must measure the relationship rather than assume a fixed delay.

---

# 9. Lead-Lag Variables

Potential variables include:

* Price change
* Return
* Direction
* Magnitude
* Volatility
* Orderbook imbalance
* Trade intensity
* Spread
* Time to resolution

The relationship may differ across market conditions.

---

# 10. Lead-Lag Time Windows

Initial research may examine multiple windows around the observed market movement.

Candidate windows include:

```text id="x5p8m4"
180–60 seconds
60–20 seconds
20–5 seconds
```

These are research buckets, not production thresholds.

Additional windows should be tested where evidence supports them.

---

# 11. BTC Market Regimes

Lead-lag behavior should be evaluated under different conditions:

* Low volatility
* High volatility
* Rapid movement
* Mean reversion
* News-driven movement
* Near-resolution conditions
* Thin liquidity
* High liquidity

A strategy that only works in one regime must identify that limitation explicitly.

---

# 12. BTC Signal

A BTC strategy signal may eventually contain:

```text id="q8v3m6"
External Direction
External Magnitude
Polymarket Price
Estimated Fair Probability
Time to Resolution
Observed Lead/Lag
Spread
Depth
Expected Edge
Signal Expiration
```

The exact model is determined through research.

---

# 13. BTC Execution Requirement

A BTC signal is highly sensitive to latency.

The research must preserve:

```text id="m6q9r2"
External Event Time
↓
Detection Time
↓
Processing Time
↓
Order Submission Time
↓
Exchange Arrival
↓
Fill Time
```

Without these timestamps, a backtest may overstate the achievable edge.

---

# 14. BTC Edge Validation

A positive historical relationship is insufficient.

The research must determine whether:

```text id="v4m7x8"
Observed Lead
>
Fees
+
Spread
+
Slippage
+
Latency Impact
```

for a sufficiently meaningful portion of opportunities.

---

# 15. Alpha Engine B: Whale Intelligence

## 15.1 Hypothesis

Some wallets may demonstrate persistent, measurable trading behavior that contains useful information.

The research question is:

> Can wallet behavior provide predictive information that remains useful after accounting for timing, liquidity, market selection, and execution delay?

This is not an assumption that copying profitable wallets will work.

---

# 16. Wallet Intelligence Inputs

Potential inputs include:

* Wallet address
* Market
* Token
* Trade timestamp
* Trade price
* Trade size
* Side
* Holding period
* Realized PnL
* Unrealized PnL
* Historical consistency
* Market preference
* Entry quality
* Exit quality
* Trade frequency
* Position sizing behavior

---

# 17. Wallet Classification

Addresses must be classified where possible.

Potential classes include:

```text id="s5q9m3"
EOA
Contract
CTF Exchange
Known Protocol
Market Maker
Bot
Human
Unknown
```

An active address must not automatically be considered a whale or intelligent trader.

---

# 18. Wallet Performance

Wallet evaluation should include:

* Realized PnL
* Profit factor
* Win rate
* Drawdown
* Trade count
* Holding time
* Median entry edge
* Trade size
* Market selection
* Consistency

Raw profit alone is insufficient.

---

# 19. FIFO Reconstruction

Wallet performance should use normalized trade data and FIFO position reconstruction where appropriate.

Conceptually:

```text id="r8m4q2"
Raw Fills
 ↓
Normalized Fills
 ↓
Market / Token
 ↓
FIFO Lots
 ↓
Realized PnL
 ↓
Behavioral Metrics
```

This avoids incorrectly evaluating wallets from isolated fills.

---

# 20. Wallet Copyability

Copyability must be evaluated separately from profitability.

A wallet may be profitable but impossible to copy because:

* Trades happen too quickly.
* Liquidity is insufficient.
* Entry edge disappears.
* Execution delay destroys the edge.
* Trade sizes are too large.
* The wallet's strategy depends on private information unavailable to the bot.

---

# 21. Copyability Score

Potential inputs:

```text id="w6m3p9"
Historical Profitability
Consistency
Trade Count
Holding Time
Entry Edge
Trade Size
Stale Trade Rate
Copyable Trade Rate
Market Liquidity
Spread
Execution Delay Sensitivity
Maker/Taker Behavior
Averaging
Split/Merge Behavior
Simulated Copy PnL
```

The score must be validated rather than arbitrarily weighted.

---

# 22. Wallet Behavior

The system should identify behavioral patterns such as:

* Accumulation
* Distribution
* Averaging
* Rapid entries
* Rapid exits
* Repeated market participation
* Contrarian behavior
* Directional persistence
* Cross-market behavior

Behavioral classification is descriptive until predictive value is demonstrated.

---

# 23. Maker-Side Wallet Patterns

A wallet repeatedly buying both sides of a market may represent a structural strategy rather than directional intelligence.

Research should identify:

```text id="c8q2m7"
Same Maker
+
YES Purchase
+
NO Purchase
+
Time Window
+
Combined Cost
```

Potential structural explanations include:

* Split/merge activity
* Market making
* Arbitrage
* Liquidity management
* Other protocol behavior

The bot must not classify this automatically as a directional whale signal.

---

# 24. Alpha Engine C: Market Dislocation

## 24.1 Hypothesis

Related Polymarket markets may occasionally exhibit temporary pricing inconsistencies.

The research question is:

> Are there structurally valid pricing relationships that produce executable positive expected value after costs?

---

# 25. Market Family Requirement

Before comparing markets, the system must validate:

```text id="h4m8q5"
Same Event
Same Underlying
Same Resolution
Same Timestamp
Same Asset
Same Outcome Semantics
```

A similar market name is not sufficient.

---

# 26. Structural Relationships

Potential relationships to research include:

* Complementary outcomes
* Related event markets
* Mutually exclusive outcomes
* Negative-risk relationships
* Cross-market parity
* Related time windows

Each relationship must have a formally defined mathematical constraint.

---

# 27. Theoretical vs Executable Dislocation

The system must distinguish:

```text id="q9m3v6"
Theoretical Dislocation
```

from:

```text id="s4x8n2"
Executable Dislocation
```

A theoretical discrepancy may disappear when accounting for:

* Spread
* Depth
* Fees
* Slippage
* Latency
* Partial fills
* Execution order

---

# 28. Depth-Aware Dislocation

For each candidate opportunity:

```text id="m7p2q8"
Book A
+
Book B
+
Available Size
+
Execution Costs
```

must be evaluated together.

Top-of-book prices alone are insufficient.

---

# 29. Multi-Leg Risk

Cross-market opportunities may require multiple orders.

The system must account for:

* Leg ordering
* Parallel execution
* Sequential execution
* Partial fills
* Hedge requirements
* Cancellation
* Residual exposure

A mathematically profitable relationship is not automatically risk-free.

---

# 30. Negative-Risk Markets

Negative-risk markets may create structural opportunities involving:

* Split
* Merge
* Redeem
* Related outcome pricing

These operations must be researched separately from ordinary directional trading.

The bot must use current protocol mechanics rather than assumptions derived from older exchange implementations.

---

# 31. Alpha Engine D: Information and Regime

## 31.1 Hypothesis

External information may affect:

* Market volatility
* Liquidity
* Spread
* Trading activity
* Resolution probability

The initial research question is:

> Can external information improve market-regime detection or filter low-quality trades?

---

# 32. Information Sources

Potential sources include:

* News
* Macro events
* Social activity
* Market-wide volatility
* External asset movements
* Scheduled events

These sources must be evaluated independently.

---

# 33. Information as a Filter

The initial preferred use is:

```text id="n5x8m2"
Information
   ↓
Regime Classification
   ↓
Strategy Filter
```

rather than:

```text id="f7q3v9"
Headline
 ↓
BUY
```

Directional use requires separate evidence.

---

# 34. Regime Detection

Potential regimes:

```text id="v8m4q6"
Normal
High Volatility
Low Liquidity
News Event
Rapid External Movement
Near Resolution
Unusual Market Activity
```

The actual regime definitions must be measurable.

---

# 35. Anomaly and Short-Term Behavior

A supporting research area is short-term price anomalies.

Potential features:

* Sudden price movement
* Volume spike
* Orderbook imbalance
* Spread expansion
* Rapid external movement
* Unusual trade frequency
* Temporary price reversal

The purpose is to determine whether these conditions contain predictive information.

---

# 36. Dip / Shock Research

A rapid price decline may be tested as a potential entry condition.

The research should test multiple movement magnitudes and time windows rather than adopting thresholds from external implementations.

For example:

```text id="q2m7x5"
Movement Magnitude
×
Movement Window
×
Liquidity
×
Time to Resolution
```

must be evaluated together.

---

# 37. External Repository Strategies

Strategies found in third-party repositories may be used as research hypotheses.

They must not be treated as validated simply because:

* The repository is public.
* The code works.
* The repository reports profits.
* The strategy has many GitHub stars.
* Historical examples look profitable.

Every imported idea must undergo independent validation.

---

# 38. Competition Intelligence

Competition intelligence is primarily a supporting layer.

It should help answer:

* How crowded is the market?
* How quickly do opportunities disappear?
* Are repeat takers present?
* Are maker strategies active?
* Is execution becoming more difficult?

---

# 39. Opportunity Decay

The system should measure how long an opportunity remains executable.

Potential measurement points include:

```text id="b6q9m4"
100ms
250ms
500ms
1s
2s
5s
```

These are measurement intervals, not assumed execution advantages.

---

# 40. Capture Probability

For each opportunity type, the research should eventually estimate:

```text id="r4x7m2"
Probability Opportunity
Remains Executable
Until Our Order Arrives
```

This can be used to distinguish theoretical edge from practical edge.

---

# 41. Competition Metrics

Potential metrics include:

* Taker concentration
* Repeat taker frequency
* Maker concentration
* Execution density
* Opportunity survival
* Fill rate
* Market concentration
* Competition intensity

The purpose is to measure market structure, not identify individuals unnecessarily.

---

# 42. Alpha Interaction

Alpha engines may interact.

Example:

```text id="m8q3v6"
BTC Lead-Lag
      +
Orderbook Imbalance
      +
Time to Resolution
      ↓
Stronger / Weaker Signal
```

The system should test whether interactions improve prediction or merely overfit historical data.

---

# 43. Signal Fusion

Multiple alpha engines must eventually produce standardized signals.

Conceptually:

```text id="x5m9q2"
BTC Engine
      │
Whale Engine
      │
Dislocation Engine ──→ Signal Fusion
      │
Regime Engine
      │
Competition Engine
```

Fusion should only be introduced after individual signal quality is understood.

---

# 44. Avoiding Double Counting

Two signals may represent the same underlying information.

For example:

```text id="q7m4n8"
BTC Price Movement
+
BTC Lead-Lag
```

may be strongly correlated.

The system must determine whether combining them adds independent information.

More signals do not automatically mean more edge.

---

# 45. Alpha Attribution

After trading, the system should attempt to determine what contributed to the outcome.

Potential attribution:

```text id="v3q8m6"
BTC Lead-Lag
Orderbook
Whale Activity
Market Dislocation
Regime
Execution Timing
```

Attribution should distinguish:

* Expected contribution
* Realized contribution

---

# 46. Alpha Decay

An alpha may weaken over time.

Possible causes:

* Other traders discover it.
* Market makers adapt.
* Liquidity changes.
* External market structure changes.
* Polymarket mechanics change.
* Data latency changes.

Strategy performance must therefore be monitored over time.

---

# 47. Alpha Validation

An alpha candidate should pass progressively stronger tests:

```text id="m9q4x7"
Hypothesis
 ↓
Historical Relationship
 ↓
Backtest
 ↓
Cost-Adjusted Backtest
 ↓
Execution Simulation
 ↓
Paper Trading
 ↓
Live Validation
```

Failure at any stage must be documented.

---

# 48. Alpha Research Metrics

Depending on the strategy, research should measure:

* Signal frequency
* Opportunity frequency
* Hit rate
* Expected value
* Net PnL
* Profit factor
* Drawdown
* Average edge
* Realized edge
* Slippage
* Fees
* Latency
* Fill rate
* Opportunity decay
* Capture probability

---

# 49. Alpha Quality

A strong alpha should ideally demonstrate:

```text id="f5n8q2"
Repeatability
+
Statistical Evidence
+
Economic Meaning
+
Execution Feasibility
+
Risk Compatibility
```

A single profitable period is insufficient.

---

# 50. Research Integrity

Alpha research must not:

* Remove losing trades selectively.
* Ignore fees.
* Ignore slippage.
* Ignore failed fills.
* Ignore latency.
* Change parameters after seeing test results without recording the change.
* Treat missing data as successful execution.
* Treat theoretical opportunities as captured trades.

---

# 51. Out-of-Sample Testing

Where sufficient data exists, strategy evaluation should distinguish:

```text id="w7m2p5"
Training / Research Period
vs
Validation Period
vs
Out-of-Sample Period
```

The exact split should depend on the strategy and dataset.

---

# 52. Robustness Testing

Strategies should be tested against reasonable changes in:

* Entry thresholds
* Timing windows
* Execution delay
* Slippage
* Fees
* Liquidity
* Market selection
* Market regimes

A strategy that only works at one exact parameter value requires additional scrutiny.

---

# 53. No Strategy Is Permanent

Every strategy must be treated as a hypothesis under continuous evaluation.

Production status means:

```text id="k8q4m6"
Currently Supported by Evidence
```

It does not mean:

```text id="x3m7v9"
Guaranteed to Remain Profitable
```

---

# 54. Initial Research Priority

The initial research order should prioritize areas where:

1. Required data is obtainable.
2. Market mechanics are understood.
3. Execution can be simulated.
4. Edge can be measured.
5. The strategy does not require excessive infrastructure.

The initial focus is therefore expected to begin with:

```text id="p4n8m2"
BTC Microstructure
        ↓
Execution Validation
        ↓
Market Dislocation
        ↓
Wallet Intelligence
        ↓
Information / Regime
```

This ordering is a research priority, not a claim about which strategy will ultimately be most profitable.

---

# 55. Research Decision Rule

For every alpha hypothesis:

```text id="r6x2q8"
Evidence Strong
      ↓
Continue

Evidence Weak
      ↓
Refine / Collect More Data

Evidence Negative
      ↓
Reject or Archive
```

No hypothesis receives production status based solely on intuition.

---

# 56. Agent Rules

AI agents may:

* Research alpha hypotheses.
* Implement indicators.
* Build datasets.
* Run backtests.
* Run execution simulations.
* Compare strategy variants.
* Identify correlations.
* Analyze competition.
* Document findings.

AI agents may not:

* Declare profitability without evidence.
* Select live parameters solely from optimization.
* Promote a strategy to live.
* Allocate capital.
* Disable risk controls.
* Remove losing observations.
* Manufacture missing data.
* Treat assumptions as facts.

---

# 57. Explicit Non-Assumptions

This document does not assume:

1. BTC lead-lag is persistent.
2. Binance will always lead Polymarket by a fixed amount.
3. Any particular latency threshold guarantees profitability.
4. Whale copying is profitable.
5. A profitable wallet is copyable.
6. Cross-market discrepancies are risk-free.
7. Arbitrage is always executable.
8. Short-term dips predict future movement.
9. News provides reliable directional signals.
10. More signals improve performance.
11. Historical alpha will survive competition.
12. A public bot repository is profitable simply because it reports profits.
13. Any specific parameter is optimal.
14. Any alpha strategy is production-ready before validation.

---

# 58. Completion Criteria

This alpha strategy specification is complete when:

* Initial alpha research areas are defined.
* Each alpha area has an explicit hypothesis.
* Required data is identified.
* The distinction between signal and opportunity is preserved.
* Execution feasibility is included in validation.
* Competition is considered.
* Opportunity decay is measurable.
* Wallet intelligence is separated from copyability.
* Market-family validation is required.
* BTC resolution-source validation is required.
* Negative results are preserved.
* Parameter overfitting is addressed.
* Alpha attribution is supported.
* Strategy promotion requires evidence.
* AI agents cannot independently promote strategies.

---

# 59. Next Document

The next document is:

```text id="z8m4q2"
docs/strategies/22-signal-fusion-and-edge.md
```

That document will define how signals from different alpha engines are normalized, combined, scored, converted into fair value and expected edge, and separated into theoretical edge versus executable net edge.
