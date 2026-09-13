# Polymarket Trading Bot

## Execution Simulation

**Document:** `docs/research/31-execution-simulation.md`
**Status:** Approved
**Document Type:** Execution Simulation Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`
* `docs/strategies/20-strategy-framework.md`
* `docs/strategies/22-signal-fusion-and-edge.md`
* `docs/research/30-research-and-backtesting.md`

---

# 1. Purpose

The execution simulator determines whether a strategy's theoretical opportunities could realistically have been captured through the Polymarket CLOB.

The simulator exists because:

```text
Theoretical Edge ≠ Executable Edge
```

A strategy may correctly identify a mispricing while still losing money because:

* The opportunity disappears before execution.
* Available liquidity is insufficient.
* The price moves before the order arrives.
* The order does not fill.
* Only part of the order fills.
* Fees remove the expected edge.
* Multiple legs execute at different prices.
* The strategy cannot obtain both sides of an intended trade.

The simulator must therefore model execution rather than simply apply historical prices to signals.

---

# 2. Core Principle

The simulator should answer:

> If the bot had detected this opportunity at this historical timestamp, what could it realistically have executed?

The answer must be based on the information and market state available at that time.

---

# 3. Execution Model

The conceptual execution pipeline is:

```text
Signal Timestamp
      ↓
Strategy Decision
      ↓
Processing Delay
      ↓
Network Delay
      ↓
Exchange Arrival
      ↓
Historical Orderbook State
      ↓
Price Protection
      ↓
Order Matching
      ↓
Partial / Full / No Fill
      ↓
Cancellation / Expiration
      ↓
Position Update
      ↓
Realized Execution Result
```

---

# 4. Simulation Inputs

The simulator should accept:

* Historical orderbook data
* Historical trade data where available
* Signal timestamp
* Signal direction
* Requested quantity
* Maximum acceptable price
* Order type
* Time-in-force
* Strategy parameters
* Fee model
* Latency assumptions
* Execution configuration
* Market metadata
* Market resolution state
* Capital state

---

# 5. Simulation Outputs

Each simulated order should produce an execution record containing, where applicable:

```text
Simulation ID
Strategy ID
Market ID
Signal Time
Order Decision Time
Estimated Arrival Time
Order Type
Side
Requested Quantity
Price Limit
Available Quantity
Filled Quantity
Average Fill Price
Remaining Quantity
Fees
Slippage
Execution Status
Cancellation Reason
Execution Latency
```

---

# 6. Execution States

The simulator should distinguish:

```text
NO_OPPORTUNITY
SIGNAL_GENERATED
ORDER_DECIDED
ORDER_SUBMITTED
ORDER_ARRIVED
PARTIALLY_FILLED
FILLED
CANCELLED
EXPIRED
REJECTED
MISSED
```

The exact implementation may use a smaller internal state machine, but the semantic distinctions must remain available.

---

# 7. Signal Timestamp

The signal timestamp represents the point at which the strategy could legitimately make its decision.

The simulator must not use information arriving after this timestamp when constructing the decision.

---

# 8. Decision Delay

After signal generation, the simulator should account for processing time.

Conceptually:

```text
Signal
→ Strategy Processing
→ Order Creation
```

The delay should be configurable and researchable.

It must not be treated as a universal fixed constant.

---

# 9. Network Delay

The simulator should separately model network transmission where sufficient information exists.

Conceptually:

```text
Order Created
→ Network
→ Exchange
```

Network delay may vary.

Research should therefore support distributions rather than requiring a single deterministic value.

---

# 10. Exchange Arrival

The exchange arrival timestamp determines which historical market state the order encounters.

This distinction is critical.

An order should not be matched against the book at signal time if the simulated order would only have reached the exchange later.

---

# 11. Historical Orderbook State

At simulated exchange arrival, the simulator should reconstruct the available orderbook.

The relevant state may include:

* Best bid
* Best ask
* Bid depth
* Ask depth
* Spread
* Multiple price levels
* Tick size
* Minimum order size

---

# 12. Orderbook Replay

Where high-frequency orderbook data is available, the simulator should replay book changes chronologically.

Conceptually:

```text
Initial Snapshot
      ↓
Book Event
      ↓
Book Event
      ↓
Book Event
      ↓
Simulated Arrival
      ↓
Execute Against Current Book
```

---

# 13. Book Integrity

The simulator must detect invalid reconstructed states where possible.

Examples include:

* Negative quantity
* Invalid price
* Missing required levels
* Impossible transitions
* Corrupted snapshots

Invalid data must not silently produce execution results.

---

# 14. Marketable Limit Orders

Polymarket orders are limit orders.

A simulated marketable order should therefore be represented as:

```text
Side
+
Quantity
+
Maximum / Minimum Acceptable Price
```

depending on direction.

The simulator must not model an unlimited market order that ignores price protection.

---

# 15. Price Protection

Execution should respect the strategy's maximum acceptable execution price.

Conceptually:

```text
Current Ask
     ↓
Maximum Acceptable Price
     ↓
Within Limit?
   /       \
 YES       NO
 ↓         ↓
Execute   No Trade
```

This prevents unrealistic fills.

---

# 16. Depth-Aware Execution

For an aggressive buy, the simulator should consume available ask liquidity from the best price upward until:

* Requested quantity is filled.
* Price protection is reached.
* Available liquidity is exhausted.

For an aggressive sell, the reverse applies.

---

# 17. VWAP

For multi-level execution:

```text
VWAP =
Total Executed Notional
/
Total Executed Quantity
```

The simulator should preserve the individual price levels consumed as well as the resulting VWAP.

---

# 18. Slippage

Slippage should compare the simulated execution price against the reference price defined by the research methodology.

The reference must be consistent within an experiment.

Possible references include:

* Signal-time best ask
* Signal-time best bid
* Arrival-time best price
* Intended execution price

The chosen reference must be recorded.

---

# 19. Fees

The simulator must include applicable Polymarket fees where they can be determined for the simulated market and period.

Dynamic market information should be obtained from the appropriate source rather than hardcoded.

Fee assumptions must be recorded in the experiment configuration.

---

# 20. Minimum Order Size

The simulator must respect the market's minimum order size.

A simulated order below the applicable minimum must not be treated as valid execution.

---

# 21. Tick Size

The simulator must respect the applicable market tick size.

Research must account for tick-size changes where historical data supports them.

---

# 22. FOK

For Fill-or-Kill:

```text
Requested Quantity Available
at acceptable prices?
        ↓
      YES
        ↓
     Full Fill

        OR

       NO
        ↓
     No Fill
```

Partial execution must not be reported as an FOK fill.

---

# 23. FAK

For Fill-and-Kill:

```text
Available Quantity
      ↓
Execute Available Amount
      ↓
Cancel Remaining Quantity
```

The simulator must preserve both:

* Filled quantity
* Cancelled remainder

---

# 24. GTC

For Good-Til-Cancelled orders, the simulator must model the order remaining active until:

* Filled
* Cancelled
* Invalidated
* Market state changes
* Strategy-specific expiration

A later trade at the order price does not automatically prove that the simulated order would have filled.

---

# 25. GTD

For Good-Til-Date orders, the simulator must respect the configured expiration.

The simulation must not allow execution after the simulated expiration.

---

# 26. Passive / Maker Simulation

Passive execution is more difficult than aggressive execution.

A maker order may remain unfilled even when the market later trades at or through its price.

Therefore, a simple rule such as:

```text
Price touched order
→ Fill
```

is insufficient.

---

# 27. Queue Position

Where sufficient data exists, the simulator should model queue position.

Conceptually:

```text
Existing Quantity Ahead
        ↓
Incoming Marketable Flow
        ↓
Cancellations Ahead
        ↓
Simulated Queue Consumption
        ↓
Potential Fill
```

If queue position cannot be reconstructed, the simulation must clearly identify the limitation.

---

# 28. Queue Uncertainty

Queue position should not be represented as known when it is not observable.

The simulator may support multiple scenarios:

```text
Optimistic
Base
Conservative
```

only when those scenarios are explicitly defined and reported as assumptions.

---

# 29. Partial Fills

Partial fills must be first-class simulation outcomes.

Example:

```text
Requested: 100
Available / Executed: 60
Remaining: 40
```

The simulator must not silently assume the remaining 40 were executed.

---

# 30. Cancellation

Cancellation must be represented explicitly.

A simulated order may be cancelled because of:

* Strategy invalidation
* Opportunity decay
* Time limit
* GTD expiration
* Risk change
* Market resolution
* Execution timeout

---

# 31. Stale Opportunity

An opportunity is stale when the execution conditions that justified the trade no longer exist.

The simulator must be able to identify:

```text
Signal Valid
     ↓
Execution Delayed
     ↓
Edge Disappears
     ↓
No Trade
```

---

# 32. Opportunity Decay

The simulator should measure how quickly opportunities disappear.

Candidate observation points include:

* 100ms
* 250ms
* 500ms
* 1s
* 2s
* 5s

These are research measurement intervals, not production assumptions.

---

# 33. Capture Probability

For every eligible opportunity, research should eventually estimate:

```text
Capture Probability =
Captured Opportunities
/
Eligible Opportunities
```

The exact denominator must be clearly defined for each experiment.

---

# 34. Missed Opportunity Classification

A missed opportunity should have a reason where possible.

Examples:

```text
LATENCY
INSUFFICIENT_DEPTH
PRICE_MOVED
PRICE_PROTECTION
NO_FILL
PARTIAL_FILL
FOK_FAILURE
STALE_SIGNAL
MARKET_RESOLVED
RISK_REJECTION
CAPITAL_CONSTRAINT
SYSTEM_FAILURE
```

---

# 35. Sequential Execution

Multi-leg strategies may execute one leg after another.

Example:

```text
Leg A
 ↓
Fill
 ↓
Leg B
 ↓
Fill
```

Advantages:

* Simpler state management
* Lower simultaneous execution complexity

Disadvantages:

* Longer exposure
* Greater price movement risk
* Greater opportunity decay

---

# 36. Parallel Execution

Multi-leg strategies may submit multiple legs around the same decision point.

Example:

```text
       Signal
       /    \
    Leg A   Leg B
```

Advantages:

* Reduced time between legs
* Lower opportunity decay

Disadvantages:

* Partial-fill risk
* Legging risk
* Race conditions
* Greater capital coordination complexity

---

# 37. Sequential vs Parallel Research

The simulator must support both models where strategy logic requires them.

The project must not assume that either approach is universally superior.

Performance must be measured experimentally.

---

# 38. Multi-Leg Completion

A multi-leg opportunity must distinguish:

```text
ALL LEGS FILLED
PARTIALLY COMPLETED
ONE LEG FILLED
NO LEGS FILLED
```

A theoretical arbitrage should not be counted as captured unless the required legs were actually executed according to the strategy definition.

---

# 39. Legging Risk

If one leg fills while another does not, the simulator must preserve the resulting exposure.

Example:

```text
Leg A: Filled
Leg B: Not Filled
```

This is not an arbitrage completion.

It is an execution-risk event.

---

# 40. Hedge Simulation

Where the strategy specifies a hedge, the simulator must model the hedge separately.

The hedge should have:

* Its own timestamp
* Its own orderbook state
* Its own price
* Its own liquidity
* Its own execution result

---

# 41. Hedge Timeout

A strategy may define a hedge timeout.

The simulator must treat the timeout as a strategy parameter rather than a universal project constant.

If the hedge does not execute before the timeout, the resulting exposure must be recorded.

---

# 42. Position Exposure

At every simulated point, the simulator should be able to determine:

```text
Current Position
+
Unfilled Orders
+
Partially Filled Orders
```

This is required for accurate risk analysis.

---

# 43. Capital Constraints

The simulator must prevent trades that require capital unavailable under the simulated portfolio state.

This prevents artificial returns created by assuming unlimited capital.

---

# 44. Concurrent Order Constraints

If two strategies attempt to use the same capital simultaneously, the simulator should account for the conflict.

The research environment should support portfolio-level capital allocation where required.

---

# 45. Strategy Isolation

Individual strategy research should first be evaluated independently.

Portfolio-level simulations should then evaluate interaction between strategies.

This separates:

```text
Strategy Quality
```

from:

```text
Portfolio Allocation
```

---

# 46. Execution Latency Sensitivity

Latency-sensitive strategies should be tested under multiple latency conditions.

The objective is to determine whether performance depends on an unrealistically favorable latency assumption.

---

# 47. Latency Robustness

A robust strategy should not depend exclusively on a single extremely precise latency assumption unless that latency has been independently demonstrated to be consistently achievable.

If performance collapses under modestly different latency assumptions, the strategy should be flagged as latency-sensitive.

---

# 48. Network Failure

Execution simulation should eventually support failed or delayed network scenarios.

Examples:

```text
Order Delayed
Order Lost
Order Response Delayed
WebSocket Disconnected
REST Response Delayed
```

The exact failure model should be based on observed operational behavior where possible.

---

# 49. Unknown Execution State

The simulator must distinguish:

```text
Definitely Filled
Definitely Not Filled
Unknown
```

Unknown should not automatically become filled.

This mirrors the live execution requirement.

---

# 50. Execution Reconciliation

Simulated execution should produce enough information to reconcile:

```text
Signal
→ Intended Order
→ Simulated Order
→ Simulated Fill
→ Position
→ PnL
```

Any discrepancy must be traceable.

---

# 51. Execution Quality Metrics

The simulator should calculate, where applicable:

* Fill rate
* Partial fill rate
* Average fill price
* VWAP
* Slippage
* Fees
* Latency
* Opportunity survival
* Capture rate
* Missed opportunity rate
* Execution-adjusted edge
* Expected vs realized execution

---

# 52. Expected vs Realized Execution

For every strategy, compare:

```text
Expected Execution
vs
Simulated Execution
```

This reveals execution assumptions that are systematically too optimistic.

---

# 53. Execution Edge

The simulator should transform theoretical edge into execution-aware edge.

Conceptually:

```text
Theoretical Edge
        ↓
Liquidity Adjustment
        ↓
Slippage Adjustment
        ↓
Fee Adjustment
        ↓
Latency Adjustment
        ↓
Fill Probability
        ↓
Execution-Adjusted Edge
```

The exact mathematical formulation belongs to the strategy and edge model, not this simulator document.

---

# 54. Net Expected Value

The simulator should provide inputs required to estimate:

```text
Net Expected Value
```

using:

* Expected execution price
* Fill probability
* Quantity
* Fees
* Slippage
* Probability of partial fill
* Opportunity decay
* Position consequences

---

# 55. Simulation Scenarios

Research should support scenario analysis.

Possible scenarios include:

```text
Optimistic Execution
Base Execution
Conservative Execution
```

Each scenario must explicitly document its assumptions.

These scenarios must not be presented as historical facts.

---

# 56. Stress Testing

Execution should be stress-tested against adverse conditions.

Examples:

* Wider spreads
* Lower depth
* Higher latency
* Faster opportunity decay
* Partial fills
* Failed hedge
* Higher slippage
* Increased competition

The exact stress parameters must be determined by research or observed operational data.

---

# 57. Competition

Execution simulation should eventually incorporate competition where data supports it.

Relevant observations include:

* Repeated taker activity
* Maker activity
* Execution density
* Opportunity decay
* Orderbook competition

The simulator should model market conditions rather than assuming a specific competitor identity.

---

# 58. Competition Classification

Wallets or addresses must not automatically be classified as competitors.

Research may distinguish:

* EOA
* Contract
* CTF Exchange
* Known protocol
* Market maker
* Bot
* Human
* Unknown

This prevents protocol infrastructure from being incorrectly interpreted as trading intelligence.

---

# 59. Copy Trading Simulation

If wallet intelligence is used, simulated copying must include:

* Detection delay
* Execution delay
* Market movement
* Available liquidity
* Trade size
* Entry edge
* Staleness
* Copyability

A profitable historical wallet does not automatically imply a profitable copy strategy.

---

# 60. Maker-Side Strategy Simulation

Where a maker repeatedly buys both sides of a market, the simulator may investigate:

```text
YES Acquisition
+
NO Acquisition
→
Combined Cost
```

Potential split/merge/redeem mechanics must be modeled only when relevant to the actual market structure.

The observation itself is not proof of profitability.

---

# 61. BTC Lead-Lag Simulation

For the BTC 5m strategy, execution simulation should compare:

```text
External BTC Signal Time
        ↓
Polymarket State
        ↓
Detection
        ↓
Order Arrival
        ↓
Available Book
        ↓
Execution
```

The market's actual resolution source must be used when evaluating the strategy.

---

# 62. Resolution Source

The simulator must not assume that Binance is the final settlement source.

For each market, it must use the market's documented resolution mechanism.

External BTC feeds may provide predictive information, while the actual market resolution mechanism determines settlement.

---

# 63. Short-Duration Market Simulation

For short-duration markets, time-to-resolution must be part of the simulated state.

Potential research buckets such as:

```text
180–60 seconds
60–20 seconds
20–5 seconds
```

are candidate research buckets only.

They must not be treated as proven optimal execution windows.

---

# 64. Tail Entry Simulation

Tail-entry strategies should be evaluated using actual historical prices and execution conditions.

The simulator must account for:

* Entry price
* Remaining time
* Liquidity
* Price movement
* Resolution
* Fees
* Slippage

It must not assume that an extreme price is automatically mispriced.

---

# 65. Structural Arbitrage Simulation

For structural relationships:

```text
Market A
+
Market B
```

the simulator must validate:

* Same event
* Same outcome semantics
* Same resolution
* Same market family

before calculating arbitrage.

---

# 66. Arbitrage Completion

An arbitrage should only be recorded as captured when all required execution conditions are satisfied.

A visible price discrepancy is not sufficient.

The system should distinguish:

```text
THEORETICAL_ARBITRAGE
EXECUTABLE_ARBITRAGE
CAPTURED_ARBITRAGE
FAILED_ARBITRAGE
```

---

# 67. Simulation Determinism

Given the same:

```text
Dataset
Strategy Version
Parameters
Execution Model
Random Seed, if applicable
```

the simulator should produce the same result.

Any intentional randomness must be controlled and recorded.

---

# 68. Monte Carlo / Stochastic Execution

Where execution uncertainty cannot be represented deterministically, stochastic simulation may be used.

Examples:

* Latency distributions
* Fill probabilities
* Queue uncertainty

The random seed and simulation configuration must be recorded.

---

# 69. Simulation Reproducibility

Every simulation run should be identifiable by:

```text
Simulation ID
Dataset Version
Strategy Version
Code Version
Execution Model Version
Configuration
Random Seed
```

where applicable.

---

# 70. Simulation Audit Trail

A simulation must be traceable from:

```text
Signal
→ Decision
→ Arrival
→ Orderbook
→ Matching
→ Fill
→ Position
→ PnL
```

The audit trail should allow researchers to investigate individual trades.

---

# 71. Single-Trade Replay

The research environment should eventually support replaying one historical opportunity.

Example:

```text
Opportunity ID
      ↓
Load Historical State
      ↓
Replay Events
      ↓
Simulate Order
      ↓
Inspect Result
```

This is especially useful for debugging unexpected backtest results.

---

# 72. Execution Failure Analysis

Execution failures should be categorized.

Examples:

```text
SIGNAL_ERROR
LATENCY_ERROR
LIQUIDITY_ERROR
PRICE_ERROR
FILL_ERROR
RISK_ERROR
CAPITAL_ERROR
DATA_ERROR
SYSTEM_ERROR
```

The categories should be refined as evidence accumulates.

---

# 73. Backtest vs Execution Simulator

The two systems have different responsibilities.

### Backtest

Answers:

> Does the strategy show evidence of predictive or pricing edge?

### Execution Simulator

Answers:

> Could that edge have been captured under realistic execution conditions?

Both are required for strategy validation.

---

# 74. Research Pipeline

The complete research flow is:

```text
Historical Sources
      ↓
Raw Dataset
      ↓
Validation
      ↓
Normalization
      ↓
Feature Construction
      ↓
Strategy Signal
      ↓
Theoretical Backtest
      ↓
Execution Simulation
      ↓
Cost Adjustment
      ↓
Risk Evaluation
      ↓
Out-of-Sample Testing
      ↓
Research Decision
```

---

# 75. Promotion Gate

A strategy should not advance solely because the theoretical backtest is profitable.

The evidence should progress through:

```text
Hypothesis
   ↓
Historical Evidence
   ↓
Execution Evidence
   ↓
Out-of-Sample Evidence
   ↓
Paper Trading
   ↓
Controlled Live Evaluation
```

Each stage requires explicit review.

---

# 76. No-Trade Research

The simulator must preserve opportunities where the correct action was:

```text
DO NOT TRADE
```

Examples:

* Edge too small after costs
* Insufficient liquidity
* Excessive latency sensitivity
* Price protection violated
* Risk rejection
* Uncertain execution

A successful no-trade decision is part of strategy performance.

---

# 77. Execution Simulator Integrity Rules

The simulator must never:

* Assume fills without evidence.
* Ignore orderbook depth.
* Ignore transaction costs.
* Use future orderbook states.
* Treat theoretical arbitrage as captured arbitrage.
* Ignore partial fills.
* Ignore latency for latency-sensitive strategies.
* Assume passive orders fill whenever price touches.
* Assume unlimited capital.
* Hide execution failures.
* Change execution assumptions without recording them.

---

# 78. Agent Rules

AI agents may:

* Implement simulation components.
* Construct replay datasets.
* Build orderbook replay logic.
* Add execution models.
* Run simulations.
* Compare execution scenarios.
* Identify unrealistic assumptions.
* Improve test coverage.
* Document simulation results.

AI agents may not independently:

* Select live execution parameters.
* Remove execution protections.
* Mark a strategy as production-ready.
* Enable live trading.
* Relax risk constraints.
* Treat favorable simulation assumptions as established facts.

---

# 79. Explicit Non-Assumptions

This simulator does not assume:

1. Every visible order is still available when the simulated order arrives.
2. Every market touch produces a fill.
3. Historical best bid/ask equals executable size.
4. A fixed latency accurately represents production latency.
5. Queue position can always be reconstructed.
6. A profitable theoretical arbitrage is executable.
7. Partial fills are equivalent to full fills.
8. A successful simulation guarantees live execution.
9. Historical liquidity remains available in future markets.
10. Competition remains constant.
11. External BTC lead-lag remains permanent.
12. Any specific latency or execution threshold is universally optimal.

---

# 80. Completion Criteria

The execution simulator is complete when it can:

* Replay historical market state.
* Preserve event timing.
* Model processing delay.
* Model network delay.
* Determine exchange arrival state.
* Reconstruct relevant orderbook depth.
* Simulate marketable limit execution.
* Apply price protection.
* Apply applicable fees.
* Apply slippage.
* Respect tick size.
* Respect minimum order size.
* Simulate FOK.
* Simulate FAK.
* Simulate GTC.
* Simulate GTD.
* Support partial fills.
* Represent passive execution limitations.
* Represent queue uncertainty where possible.
* Simulate sequential execution.
* Simulate parallel execution.
* Model multi-leg exposure.
* Model hedge execution.
* Track capital constraints.
* Measure opportunity decay.
* Calculate capture probability.
* Classify missed opportunities.
* Produce an execution audit trail.
* Reproduce individual historical executions.
* Compare expected vs realized execution.
* Operate independently from live trading permissions.

---

# 81. Next Document

The next document is:

```text
docs/risk/40-risk-and-safety.md
```

That document will define the bot's risk hierarchy, capital protection, strategy and market exposure controls, order-level protection, kill switches, failure handling, live-trading boundaries, and safety requirements.
