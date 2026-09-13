# Polymarket Trading Bot

## Market Data and Streaming

**Document:** `docs/polymarket/11-market-data-and-streaming.md`
**Status:** Approved
**Document Type:** Market Data and Streaming Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`

---

# 1. Purpose

This document defines how the bot discovers, receives, normalizes, stores, validates, and consumes real-time market data.

It covers:

* Market discovery
* Market metadata
* CLOB market data
* WebSocket streams
* Orderbook state
* Price events
* Trade events
* Market lifecycle events
* Tick-size changes
* Market resolution events
* External BTC data
* Chainlink-related data
* Event timestamps
* Data freshness
* Sequencing
* Reconnection
* Recovery
* Market-state construction

This document defines the data path.

It does not define strategy logic or order execution policy.

---

# 2. Market Data Principle

The trading system must operate on current, validated market state.

The system must not make trading decisions from stale, incomplete, or ambiguous data.

The primary flow is:

```text
External Sources
      ↓
Ingestion
      ↓
Validation
      ↓
Normalization
      ↓
State Reconstruction
      ↓
Freshness Check
      ↓
Strategy
```

---

# 3. Data Sources

The initial system uses multiple data sources.

```text id="z4qf1p"
                    MARKET DATA
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
      Gamma            CLOB          CLOB WebSocket
        │               │                │
   Discovery        REST Data       Real-Time Data
        │               │                │
        └───────────────┼────────────────┘
                        │
                        ▼
                  Market State
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       External BTC           Resolution Data
       Market Data            / On-Chain Data
```

---

# 4. Gamma API

Gamma is used primarily for market and event discovery and metadata.

The discovery layer may use Gamma to obtain:

* Events
* Markets
* Market status
* Market questions
* Market identifiers
* Token information
* Start/end information
* Categories
* Tags
* Other available metadata

Gamma is not treated as the real-time orderbook source.

---

# 5. CLOB REST

The CLOB provides current market information and orderbook data.

REST access is useful for:

* Initial state
* Recovery
* Snapshot retrieval
* Market configuration
* Historical reads
* Reconciliation

REST polling must not be used as an uncontrolled replacement for WebSocket streaming when real-time data is available.

---

# 6. CLOB Market WebSocket

The market WebSocket is the primary real-time source for relevant CLOB market events.

The current market WebSocket endpoint is:

```text id="c6o3r8"
wss://ws-subscriptions-clob.polymarket.com/ws/market
```

The system should subscribe only to markets required by the active research or trading scope.

---

# 7. CLOB User WebSocket

The user WebSocket provides authenticated account-level events.

The current endpoint is:

```text id="0x9s7q"
wss://ws-subscriptions-clob.polymarket.com/ws/user
```

It is used for relevant private order and trade lifecycle information.

User streaming is separate from public market streaming.

---

# 8. Sports WebSocket

Polymarket provides a separate sports WebSocket interface.

The sports stream is outside the initial BTC-focused strategy scope unless sports strategies are explicitly added later.

The architecture should keep the data-source boundary extensible without adding unnecessary sports infrastructure now.

---

# 9. Market WebSocket Events

The market stream may provide events including:

* `book`
* `price_change`
* `last_trade_price`
* `tick_size_change`
* `best_bid_ask`
* `new_market`
* `market_resolved`

The implementation must use the current official event schema rather than relying on assumptions from older client versions.

---

# 10. Custom Market Features

Where required, the market subscription can enable custom features for events such as:

* Best bid/ask
* New market
* Market resolved

The application should only enable additional event types that provide actual value to the current system.

---

# 11. Market Subscription Lifecycle

Market subscriptions follow:

```text id="b4v9mk"
Market Identified
      ↓
Subscription Requested
      ↓
Subscription Confirmed
      ↓
Events Received
      ↓
State Updated
      ↓
Market Removed / Resolved
      ↓
Subscription Closed
```

The subscription manager must track active subscriptions explicitly.

---

# 12. Subscription Manager

A dedicated subscription manager should maintain:

* Active market subscriptions
* Subscription state
* Connection state
* Last event time
* Last successful message
* Reconnection status
* Resubscription requirements

Strategies should not manage WebSocket subscriptions directly.

---

# 13. Initial Market State

A WebSocket stream alone may not provide enough information to safely reconstruct state after startup or reconnect.

The system should therefore use:

```text id="x2b3d8"
REST Snapshot
      ↓
Initialize State
      ↓
WebSocket Events
      ↓
Maintain State
```

This avoids assuming that the first received event represents a complete market state.

---

# 14. Orderbook State

The orderbook engine maintains the current internal representation of:

```text id="q9u4c8"
Bids
Asks
Best Bid
Best Ask
Spread
Depth
Tick Size
Minimum Order Size
Timestamp
```

The orderbook state must be associated with the exact market/token.

---

# 15. Orderbook Normalization

External orderbook responses must be converted into an internal normalized representation.

Conceptually:

```text id="j7t0sn"
Polymarket Event
      ↓
Schema Validation
      ↓
Normalization
      ↓
Orderbook State
```

Raw exchange fields should be preserved where they are necessary for audit or debugging.

---

# 16. Orderbook Prices

The system must preserve the distinction between:

```text id="a3xq1v"
Best Bid
Best Ask
Midpoint
Last Trade
Reference Price
```

They must not be treated as interchangeable.

---

# 17. Spread

The orderbook engine should calculate:

```text id="2c4g8m"
Spread = Best Ask - Best Bid
```

The spread may be stored as a derived metric.

Strategies may use spread as an input, but the spread itself is not an alpha signal.

---

# 18. Depth

The system should preserve available orderbook depth.

Depth is required for realistic execution analysis.

A displayed best price is not necessarily an executable price for the entire intended order quantity.

The execution model must therefore support:

```text id="x9r1ce"
Requested Quantity
      ↓
Walk Orderbook
      ↓
Available Depth
      ↓
VWAP
      ↓
Expected Execution Price
```

---

# 19. VWAP

For execution and research, the system should support depth-aware VWAP calculation.

VWAP should be calculated using the actual available levels required to fill the requested quantity.

This prevents the system from treating:

```text id="e1q8rz"
Best Ask
```

as if it were available for unlimited size.

---

# 20. Price Changes

`price_change` events should update internal market state without discarding relevant previous state.

Each event should preserve:

* Market
* Token
* Price
* Side where applicable
* Size where applicable
* Timestamp
* Receipt time
* Source event information

---

# 21. Last Trade Price

Last trade price is an observed transaction price.

It must not be treated as equivalent to the current executable ask or bid.

It is useful for:

* Market activity
* Momentum analysis
* Historical research
* Trade-flow analysis

---

# 22. Best Bid / Ask

Best bid and ask represent current top-of-book conditions.

Where the dedicated best bid/ask event is available, it may be used to maintain low-latency top-of-book state.

The system must still maintain sufficient state to detect stale or inconsistent updates.

---

# 23. Tick Size Changes

Tick size is dynamic market information.

The system must process tick-size changes as state changes.

When a tick-size change occurs:

```text id="5njq8a"
Old Tick Size
      ↓
Tick Size Change Event
      ↓
New Tick Size
      ↓
Update Market State
      ↓
Revalidate Pending Order Construction
```

A stale tick size may result in order rejection.

---

# 24. Minimum Order Size

The market-state layer must retain the applicable minimum order size.

The execution layer must validate intended order quantity against the current value.

Strategies must not hardcode a universal minimum order size.

---

# 25. Market Resolution Events

Market resolution events are important for short-duration strategies.

When a market resolution event is received:

```text id="f6x8va"
Market Resolved
      ↓
Stop New Strategy Signals
      ↓
Stop New Orders
      ↓
Update Market State
      ↓
Begin Resolution / Position Handling
```

The exact post-resolution behavior belongs to the execution and portfolio specifications.

---

# 26. New Market Events

New-market events may be used to reduce discovery latency.

When a new market is detected:

```text id="q5f3p0"
New Market
      ↓
Fetch Full Metadata
      ↓
Validate Identity
      ↓
Validate Resolution
      ↓
Classify Market
      ↓
Subscribe if Relevant
```

The bot must not trade immediately merely because a new-market event was received.

---

# 27. Market Eligibility

A market becomes eligible for strategy processing only after:

1. Market identity is validated.
2. Market metadata is available.
3. Outcome/token information is known.
4. Resolution information is sufficiently understood.
5. Current trading state is known.
6. Required real-time data is available.

If any required condition is unknown, the market should remain non-tradable to the affected strategy.

---

# 28. Market State Object

The internal market state should conceptually contain:

```text id="w5u7f3"
Market Identity
├── Event ID
├── Market ID
├── Condition ID
└── Token IDs

Market Metadata
├── Question
├── Outcomes
├── Status
├── Start Time
└── End Time

Resolution
├── Resolution Source
├── Resolution Rules
└── Resolution Status

Trading State
├── Tick Size
├── Minimum Order Size
├── Fees
└── Other Market Constraints

Orderbook
├── Bids
├── Asks
├── Best Bid
├── Best Ask
└── Depth

Timing
├── Event Time
├── Receipt Time
└── State Updated Time
```

This is a logical model, not a final database schema.

---

# 29. Event Time

Where available, the original source event timestamp must be preserved.

Event time answers:

> When did the market event occur?

This is distinct from when the bot received it.

---

# 30. Receipt Time

The bot must record when an event reached the local process.

This enables:

```text id="u7h2i9"
Receipt Latency
=
Receipt Time - Event Time
```

where the source timestamps are comparable.

---

# 31. Processing Time

The system should also record relevant processing timestamps.

This enables analysis of:

```text id="v2b0d8"
Event
 ↓
Receipt
 ↓
Processing
 ↓
Signal
 ↓
Order Submission
```

This is critical for latency-sensitive research.

---

# 32. Clock Synchronization

Latency measurements are meaningful only if system clocks are reasonably synchronized.

The deployment environment must maintain reliable system time.

The exact clock synchronization implementation is an infrastructure concern, but latency analysis must not assume that unsynchronized clocks produce accurate measurements.

---

# 33. Data Freshness

Every latency-sensitive market state should have a freshness value.

Conceptually:

```text id="d3k9g7"
now - last_valid_update
```

The strategy can then classify:

```text id="b7h2qx"
Fresh
Aging
Stale
Invalid
```

Thresholds are strategy-specific.

---

# 34. Stale Data Rule

If required data becomes stale:

```text id="6b8h9p"
Strategy
    ↓
NO TRADE
```

unless the specific strategy explicitly supports stale-data behavior and that behavior has been validated.

The default behavior for unknown or stale market state is safety.

---

# 35. Missing Data

Missing data must not be silently substituted with:

* Zero
* Previous value
* Estimated value
* Random value
* Model prediction

unless the strategy explicitly defines and validates such behavior.

Unknown must remain unknown.

---

# 36. Out-of-Order Events

Network delivery does not guarantee that event arrival order equals source event order.

The system should use available:

* Event timestamps
* Sequence information
* Event identifiers

to detect or mitigate ordering problems.

If ordering cannot be established, the system should prefer safe state handling over false precision.

---

# 37. Duplicate Events

Duplicate events may occur during reconnection or normal stream behavior.

The ingestion layer must prevent duplicate processing from causing:

* Duplicate trades
* Duplicate volume
* Incorrect orderbook state
* Duplicate PnL
* Duplicate strategy signals

---

# 38. WebSocket Disconnect

When a market WebSocket disconnects:

```text id="4x7j2v"
Disconnect
    ↓
Mark Stream Unhealthy
    ↓
Stop Affected Trading
    ↓
Reconnect
    ↓
Resubscribe
    ↓
Refresh State
    ↓
Validate Freshness
    ↓
Resume Only if Healthy
```

The bot must not immediately resume trading merely because the socket reconnects.

---

# 39. Reconnection

The reconnect process must account for:

* Connection retry
* Backoff
* Subscription restoration
* State refresh
* Missed events
* Duplicate events
* Freshness
* Market eligibility

The implementation should avoid creating uncontrolled reconnect loops.

---

# 40. REST Recovery

After reconnecting, the system should use REST or another authoritative source to rebuild state where necessary.

Conceptually:

```text id="k3m8y1"
Disconnect
    ↓
Reconnect
    ↓
REST Snapshot
    ↓
Rebuild State
    ↓
Resume Stream
```

The exact recovery sequence must account for event ordering to avoid creating gaps between the snapshot and subsequent events.

---

# 41. Recovery Safety

If the system cannot determine the current market state with sufficient confidence:

```text id="n9h4c2"
Trading Disabled
```

The system may continue collecting data while recovery occurs.

---

# 42. User Stream

The user stream is responsible for private execution state.

It should provide relevant events for:

* Orders
* Trades
* Order updates
* Cancellations
* Trade lifecycle

User-stream state must be reconciled against REST/API state periodically.

---

# 43. User Stream Failure

If the private user stream becomes unavailable while live orders or positions exist:

```text id="x4b6j7"
Detect Failure
      ↓
Determine Risk
      ↓
Reconcile
      ↓
Restrict New Orders if Necessary
```

The trading engine must not assume private execution state is current when the private stream is unhealthy.

---

# 44. Market Data and Strategy Boundary

Strategies consume normalized market state.

Strategies should not:

* Parse raw WebSocket messages
* Maintain exchange subscriptions
* Handle reconnects
* Manage authentication
* Directly call Polymarket endpoints

This keeps strategy logic independent of transport details.

---

# 45. Market Data and Execution Boundary

The execution engine consumes validated market state.

It requires:

* Current orderbook
* Current tick size
* Current minimum order size
* Current market status
* Applicable fee information
* Data freshness

Execution must reject orders when required market information is unavailable.

---

# 46. External BTC Feed

The BTC strategy requires an external reference feed.

The initial research direction includes Binance market data.

The external feed should provide, where available:

* BTC price
* Timestamp
* Bid
* Ask
* Trades
* Relevant market events

The exact feed implementation should be chosen according to the research requirements.

---

# 47. BTC Feed Timing

BTC strategy research must preserve:

```text id="q3p8l0"
External Event Time
External Receipt Time
Polymarket Event Time
Polymarket Receipt Time
Signal Time
```

This enables lead-lag analysis.

The system must not infer latency relationships from timestamps that were recorded at different stages without accounting for the difference.

---

# 48. Chainlink Resolution Data

The BTC strategy must identify the actual resolution mechanism of each market.

Where a market uses Chainlink-based resolution, the system must collect or reconstruct the relevant reference information required for research.

The system must not assume:

```text id="a6c8z2"
Binance price
=
Polymarket resolution price
```

The relationship must be validated for each market type.

---

# 49. Resolution Source Validation

Before enabling a resolution-sensitive strategy:

```text id="p5r7w1"
Market
    ↓
Resolution Rules
    ↓
Resolution Source
    ↓
Reference Asset
    ↓
Reference Time / Method
    ↓
Strategy Compatibility
```

If the strategy cannot establish how the market resolves, it must not treat the market as valid for that strategy.

---

# 50. Lead-Lag Dataset

For BTC lead-lag research, the dataset should align:

```text id="d6m9r2"
BTC External Events
+
Polymarket Market Events
+
Polymarket Resolution Information
```

The alignment must preserve original timestamps and source identifiers.

This allows the system to test whether an observed external movement actually precedes a tradable Polymarket response.

---

# 51. Lead-Lag Measurement

The system should support measuring:

```text id="v9s2c5"
External Movement
        ↓
Polymarket Response
        ↓
Time Difference
        ↓
Executable Opportunity
```

The system must not assume that a previously observed latency relationship remains stable.

---

# 52. Opportunity Data from Streaming

The streaming layer may identify candidate opportunities, but it must not decide that they are profitable.

Example:

```text id="c2m7v8"
Orderbook Change
      ↓
Potential Dislocation
      ↓
Opportunity Candidate
      ↓
Edge Calculator
      ↓
Risk
```

The streaming layer is responsible for timely state, not final trading decisions.

---

# 53. Data Sampling

The system must preserve sufficiently detailed data for the research question being tested.

Sampling may be acceptable for:

* Long-term trend research
* Lower-frequency analysis

Sampling may be harmful for:

* Microstructure research
* Opportunity decay
* Execution replay
* Lead-lag research
* Queue-sensitive analysis

The retention level must therefore be strategy-aware.

---

# 54. Raw vs Derived Streaming Data

The system should distinguish:

```text id="m3c6k9"
Raw Event
```

from:

```text id="t5n7w2"
Derived State
```

and:

```text id="e8p4s1"
Derived Feature
```

This distinction allows research to be rerun using improved feature calculations without recollecting the original event data.

---

# 55. Streaming Persistence

Not every transient event must be persisted permanently in PostgreSQL.

High-volume data should follow:

```text id="r2j8w5"
Stream
   ↓
Runtime State
   ↓
Selected Persistence
   ↓
Parquet / Historical Dataset
```

Operational records required for trading and audit belong in PostgreSQL.

---

# 56. Market Data Storage Partitioning

Historical market data should be organized to allow efficient retrieval.

Possible partitioning dimensions include:

```text id="m8x3q1"
Date
Market
Token
Source
Data Type
```

The final partition structure must be based on actual research access patterns.

---

# 57. Market Data Monitoring

The system should monitor:

* Message rate
* Last message time
* Reconnection count
* Event processing latency
* Data freshness
* Missing data
* Duplicate events
* Parse errors
* Subscription failures
* State inconsistencies

---

# 58. Market Data Health

A market-data health state may be represented as:

```text id="c8r2v7"
HEALTHY
DEGRADED
STALE
DISCONNECTED
INVALID
UNKNOWN
```

Strategies should only trade when the required data state is healthy.

---

# 59. Data Health vs System Health

These are different.

```text id="z5h9q2"
System Healthy
+
Market Data Stale
=
Do Not Trade
```

Likewise:

```text id="r8f4k3"
System Degraded
+
Market Data Fresh
=
Trading May Still Be Disabled
```

Both system-level and market-level health must be evaluated.

---

# 60. Event Processing Failure

If an event cannot be parsed or validated:

1. Record the failure.
2. Preserve the raw event where safe and useful.
3. Do not silently discard it.
4. Do not inject guessed values.
5. Determine whether the affected market state remains trustworthy.
6. Disable affected trading if necessary.

---

# 61. Data Validation

Incoming data should be validated for:

* Required fields
* Identifier format
* Numeric ranges
* Timestamp validity
* Market association
* Token association
* Event type
* Expected structure

Invalid events must not silently enter the strategy layer.

---

# 62. Market-State Consistency

The market-state engine should detect impossible or suspicious states.

Examples include:

* Missing token
* Invalid price
* Invalid orderbook relationship
* Stale market configuration
* Unknown market status
* Conflicting resolution state
* Impossible timestamp ordering

The appropriate response is to mark the affected state as degraded or invalid rather than inventing a correction.

---

# 63. Event Journal

Important streaming events should be journaled when they have research, audit, or operational value.

Examples:

* Market creation
* Market resolution
* Tick-size change
* Significant orderbook event
* Data outage
* Reconnection
* State recovery
* Market-state invalidation

---

# 64. Streaming and Research

The streaming system must support the research loop:

```text id="h3k6m9"
Live Stream
    ↓
Historical Dataset
    ↓
Research
    ↓
Strategy Hypothesis
    ↓
Backtest
    ↓
Paper Trading
    ↓
Production
```

Live observations must therefore be captured in a way that supports later analysis.

---

# 65. Streaming and Competition Research

The streaming layer may support competition analysis through:

* Trade activity
* Repeated participants
* Market activity
* Execution density
* Orderbook behavior

However, raw activity must be separated from classification.

For example:

```text id="v7q4m2"
Repeated Activity
    ≠
Confirmed Bot
```

Classification requires additional evidence.

---

# 66. Data Freshness and Trading

The following rule is mandatory:

> No strategy may assume data is current without checking its freshness.

A strategy may define its own maximum acceptable age.

For example:

```text id="n3k7p5"
Strategy A
Max data age = X

Strategy B
Max data age = Y
```

The values must come from research and strategy specifications.

They must not be copied between strategies without validation.

---

# 67. Streaming Security

The streaming layer must:

* Authenticate private streams securely
* Protect credentials
* Avoid logging secrets
* Validate incoming messages
* Prevent untrusted data from bypassing validation
* Keep private and public data boundaries clear

---

# 68. Agent Rules

AI agents working on market data must:

1. Read this document before changing ingestion.
2. Use current official event schemas.
3. Never invent WebSocket events.
4. Never assume event ordering.
5. Preserve event timestamps.
6. Preserve receipt timestamps.
7. Never hide parse failures.
8. Never silently substitute missing values.
9. Never disable freshness checks to make a strategy trade.
10. Never hardcode dynamic tick sizes.
11. Never hardcode dynamic minimum order sizes.
12. Never assume an external BTC source is the resolution source.
13. Never treat reconnect as automatic recovery.
14. Validate recovered state before trading.
15. Keep transport logic outside strategy logic.

---

# 69. Data Source Priority

For each data domain, the preferred source should be:

```text id="s8n3f2"
Current Official Polymarket Source
        ↓
Official SDK
        ↓
Verified On-Chain Source
        ↓
Approved External Source
        ↓
Historical / Community Source
```

Historical or community observations may guide research but must not silently become production data sources.

---

# 70. What This Document Does Not Assume

The market-data system does not assume:

1. WebSocket data is always complete.
2. REST data is always real-time.
3. Event arrival order equals event creation order.
4. External BTC data equals Polymarket resolution data.
5. A current tick size remains unchanged.
6. A market remains tradable after discovery.
7. A disconnected stream has no missed events.
8. A received event is automatically valid.
9. A best ask is executable for unlimited quantity.
10. A historical lead-lag relationship will persist.
11. A market title alone establishes market equivalence.
12. A repeated wallet is automatically a competitor.

---

# 71. Completion Criteria

The market-data system is considered complete when:

* Gamma discovery is implemented.
* CLOB REST access is implemented where required.
* Market WebSocket integration is implemented.
* User WebSocket integration is implemented where required.
* Market subscriptions are managed centrally.
* Orderbook state can be reconstructed.
* Price types are distinguished.
* Tick-size changes are handled.
* Market-resolution events are handled.
* Market creation events can be handled.
* Event timestamps are preserved.
* Receipt timestamps are preserved.
* Freshness is measurable.
* Duplicate handling exists.
* Reconnection exists.
* Recovery exists.
* Invalid data is rejected safely.
* Market state can be rebuilt after failure.
* External BTC data can be aligned with Polymarket data.
* Resolution-source validation exists.
* Market data can be persisted for research.
* Data health can prevent unsafe trading.

---

# 72. Next Document

The next document is:

```text id="n8k3w6"
docs/polymarket/12-trading-and-execution.md
```

That document will define order construction, execution policy, marketable limit orders, GTC/GTD/FOK/FAK, post-only behavior, sequential versus parallel execution, price protection, slippage, fees, partial fills, order state machines, reconciliation, and live execution safety.
