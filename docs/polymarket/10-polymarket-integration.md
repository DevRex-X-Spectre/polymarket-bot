# Polymarket Trading Bot

## Polymarket Integration

**Document:** `docs/polymarket/10-polymarket-integration.md`
**Status:** Approved
**Document Type:** Polymarket Integration Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`

---

# 1. Purpose

This document defines how the trading bot integrates with Polymarket.

It establishes:

* Supported Polymarket interfaces
* Integration boundaries
* Authentication responsibilities
* Market discovery
* Market metadata
* CLOB interaction
* Account interaction
* Order interaction
* WebSocket responsibilities
* Dynamic market configuration
* Error handling
* Reconciliation
* Version compatibility
* Integration safety rules

This document is intentionally focused on the integration boundary.

Detailed market streaming is defined in:

```text
docs/polymarket/11-market-data-and-streaming.md
```

Detailed trading and execution behavior is defined in:

```text
docs/polymarket/12-trading-and-execution.md
```

---

# 2. Integration Principle

The bot must integrate with Polymarket using current supported interfaces.

The system must prefer:

```text
Official Polymarket Interface
        ↓
Official SDK
        ↓
Low-Level Official Utility
        ↓
Direct Protocol Interaction
```

The higher-level supported interface should be preferred unless it cannot satisfy a documented requirement.

The bot must not unnecessarily reimplement Polymarket protocol behavior.

---

# 3. Current Polymarket Architecture

The integration boundary recognizes the following major Polymarket systems:

```text
                    POLYMARKET
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
      Gamma            CLOB           Data API
        │               │                │
   Discovery         Trading        Activity /
   Metadata          Orderbook       Positions
        │               │
        │        ┌──────┴──────┐
        │        ▼             ▼
        │      REST         WebSocket
        │
        ▼
  Market / Event Data
```

Additional sources may be required for:

* Resolution information
* On-chain state
* Historical activity
* Blockchain operations

---

# 4. Production CLOB Version

The production trading integration targets **CLOB V2**.

The production CLOB endpoint is:

```text
https://clob.polymarket.com
```

The system must not use obsolete CLOB V1 behavior as the production trading foundation.

CLOB V2 compatibility is mandatory for live trading.

---

# 5. Official TypeScript SDK

The official Polymarket TypeScript SDK is the primary integration library for the TypeScript production application.

The SDK should be used for supported operations including:

* Client interaction
* Market-related operations
* Trading workflows
* Account workflows
* Supported Polymarket functionality

The project should pin the SDK version through the project's dependency lockfile and upgrade deliberately.

---

# 6. SDK-First Rule

When the official SDK exposes the required functionality:

```text
Use SDK
```

rather than:

```text
Implement direct HTTP / protocol behavior independently
```

Direct interaction may be used when:

* The SDK does not expose a required operation.
* The SDK intentionally leaves a protocol surface low-level.
* A specific performance requirement is demonstrated.
* A verified Polymarket interface is required for a capability unavailable through the SDK.

Any such exception must be documented.

---

# 7. Official Python SDK

The official Polymarket Python SDK may be used for research and Python-specific workflows.

It must not create a second uncontrolled production trading implementation.

The project should avoid situations where:

```text
TypeScript says one thing
Python says another
```

for the same production trading state.

Production state must have a single authoritative application model.

---

# 8. Legacy SDK Restriction

The following legacy Polymarket integrations must not be used as the foundation of production trading:

* Archived CLOB V1 clients
* Archived Python CLOB clients
* Archived Rust CLOB clients
* Archived V1 exchange integrations

Historical repositories may be consulted for research or migration understanding but must not be treated as current production interfaces.

---

# 9. Integration Layers

The application should separate Polymarket integration into logical layers.

```text
Polymarket Adapter
        │
        ├── Discovery
        ├── Market Metadata
        ├── Market Data
        ├── Account
        ├── Authentication
        ├── Orders
        ├── Trades
        ├── Positions
        └── Reconciliation
```

Strategies must interact with internal normalized models rather than directly depending on Polymarket-specific response shapes wherever practical.

---

# 10. Market Discovery

Market discovery is responsible for identifying available markets and events.

The Gamma API is the primary Polymarket discovery interface.

Gamma does not require authentication for public market discovery.

The discovery layer should collect relevant information including:

* Events
* Markets
* Market status
* Market identifiers
* Conditions
* Outcomes
* Token identifiers
* Start/end times
* Resolution-related metadata
* Market categories
* Tags where useful

---

# 11. Market Discovery Responsibilities

Market discovery must:

1. Identify relevant markets.
2. Detect new markets.
3. Update market metadata.
4. Identify market status changes.
5. Associate markets with events.
6. Build market-family relationships where justified.
7. Pass valid market identities to downstream systems.

Market discovery must not decide whether a market is profitable.

---

# 12. Market Identity

The integration layer must preserve Polymarket identifiers.

Important identifiers may include:

* Event ID
* Market ID
* Condition ID
* Token ID
* Outcome
* Slug where available

Internal identifiers may be generated for application purposes, but they must not replace the original Polymarket identifiers.

---

# 13. Market Status

The system must track the current state of a market.

Examples include:

```text
OPEN
CLOSED
RESOLVED
INACTIVE
UNKNOWN
```

The exact internal state model must map carefully to the current Polymarket state.

Unknown must remain a valid state.

The system must not infer that a market is tradable merely because it exists in discovery data.

---

# 14. Market Tradability

Before an order can be submitted, the execution layer must verify that the market is currently tradable.

The verification should consider:

* Market status
* Token availability
* Current market configuration
* Tick size
* Minimum order size
* Current liquidity
* Risk state
* Account state
* Execution restrictions

A market discovered earlier may no longer be executable.

---

# 15. Dynamic Market Information

The bot must not hardcode market-specific trading parameters.

Relevant dynamic information includes:

* Minimum order size
* Minimum tick size
* Fee information
* Fee curve
* Maker/taker configuration
* RFQ availability
* Taker order delay
* Other current market constraints

The current CLOB market information interface must be consulted where applicable.

---

# 16. Dynamic Fee Rule

The system must not assume one universal Polymarket fee rate.

Fees can vary depending on the market/category and current configuration.

The trading engine must obtain the applicable market fee information before calculating executable expected value where required.

The fee model must therefore be data-driven.

---

# 17. Fee Calculation

The current Polymarket fee model uses the applicable market fee configuration.

The system must treat the exchange-provided fee configuration as authoritative rather than embedding assumptions into strategy code.

A simplified fee representation may be expressed as:

```text
fee = C × feeRate × p × (1 - p)
```

where:

```text
C       = matched quantity / relevant trade amount
feeRate = applicable fee rate
p       = execution price
```

The implementation must follow the current Polymarket specification and precision rules rather than independently approximating the exchange calculation.

---

# 18. Authentication Architecture

Polymarket authentication must be treated as two distinct layers.

Conceptually:

```text
L1
Wallet Signature / EIP-712
        ↓
API Credential Creation / Derivation

L2
API Credentials
        ↓
Authenticated Trading Requests
```

The system must not treat API credentials as a replacement for wallet-level authentication.

---

# 19. L1 Authentication

L1 authentication establishes control of the relevant wallet through cryptographic signing.

The project must use the supported Polymarket signing flow.

The private key must never be exposed to:

* Strategy code unnecessarily
* Research notebooks
* Logs
* Dashboard clients
* Frontend code
* AI agents

---

# 20. L2 Authentication

L2 authentication uses Polymarket API credentials for authenticated trading operations.

The bot must keep L2 credentials separate from the wallet private key.

Credentials must be stored securely and injected through the runtime environment.

---

# 21. Signature Types

The integration must support the signature configuration appropriate to the wallet/account being used.

Polymarket currently distinguishes signature types including:

```text
0 → EOA
1 → POLY_PROXY
2 → GNOSIS_SAFE
```

The implementation must not assume that every account uses the EOA signature type.

The selected signature type must match the actual account architecture.

---

# 22. Builder Authentication

Builder-related authentication is separate from normal trading authentication.

Builder headers and credentials must only be used when the project explicitly adopts builder functionality.

Builder infrastructure is not required for the initial core trading architecture.

---

# 23. Private Key Handling

The private key is one of the highest-risk secrets in the system.

Rules:

1. Never commit it to Git.
2. Never place it in source code.
3. Never place it in frontend code.
4. Never print it.
5. Never store it in logs.
6. Never expose it to an AI agent unnecessarily.
7. Never include it in issue reports.
8. Never include it in research datasets.

---

# 24. Wallet Boundary

The trading engine must have a clearly defined wallet boundary.

Only the component responsible for authenticated trading should have access to credentials required for live order signing.

The architecture should minimize the number of processes with access to those credentials.

---

# 25. Public vs Private Interfaces

The integration layer must distinguish between public and authenticated operations.

```text
Public
├── Market discovery
├── Public market data
├── Orderbook reads
├── Public trades
└── Public historical information

Authenticated
├── Account state
├── Orders
├── Cancellations
├── Private trade state
└── Other protected operations
```

A public-data process must not require live trading credentials unless necessary.

---

# 26. Orderbook Access

The CLOB provides orderbook information required by the trading system.

Orderbook data may include:

* Bids
* Asks
* Best bid
* Best ask
* Tick size
* Minimum order size
* Market configuration
* Depth

The trading engine must use current orderbook state when calculating executable prices.

---

# 27. Price Data

The integration must distinguish:

* Orderbook price
* Last trade price
* Midpoint
* External reference price
* Resolution/reference price

These values serve different purposes.

A strategy must explicitly identify which price type it uses.

---

# 28. WebSocket Integration

The project will use Polymarket WebSockets for latency-sensitive real-time information where applicable.

The relevant interfaces include:

```text
Market WebSocket
    ↓
Market events

User WebSocket
    ↓
Private order/trade events
```

The streaming implementation is specified in:

```text
docs/polymarket/11-market-data-and-streaming.md
```

---

# 29. REST and WebSocket Relationship

WebSockets do not eliminate the need for REST/API access.

The system should use:

```text
REST
→ Initialization
→ Recovery
→ Historical reads
→ Reconciliation

WebSocket
→ Real-time events
→ Low-latency state updates
```

A WebSocket connection must not be treated as the only source of truth.

---

# 30. Connection Recovery

The integration layer must handle:

* Connection loss
* Reconnection
* Authentication failure
* Subscription failure
* Duplicate events
* Missed events
* Stale state

After reconnecting, the system must determine whether its local state is still consistent.

If consistency cannot be established, the system must enter a safe state rather than continue trading blindly.

---

# 31. Market Data Freshness

Before strategy execution, market data must pass freshness validation.

A strategy must be able to determine:

```text
Current data?
       ↓
Yes → Continue

No → Do not trade
```

The exact freshness threshold belongs to the strategy and data specification.

There is no universal latency threshold that should be hardcoded across all strategies.

---

# 32. Order Submission Boundary

Strategies must never submit orders directly to Polymarket.

The correct flow is:

```text
Strategy
    ↓
Signal
    ↓
Opportunity
    ↓
Risk Engine
    ↓
Execution Engine
    ↓
Polymarket Adapter
    ↓
CLOB
```

This prevents individual strategies from bypassing:

* Risk limits
* Price protection
* Fee calculation
* Market validation
* Execution controls

---

# 33. Order Cancellation Boundary

Order cancellation must also pass through the execution layer.

Strategies may request:

```text
Cancel Order
```

but the execution layer remains responsible for carrying out and recording the cancellation.

---

# 34. Market Information Validation

Before order submission, the system must validate current market information.

At minimum:

```text
Market exists
        ↓
Market is tradable
        ↓
Token is valid
        ↓
Tick size is current
        ↓
Minimum size is satisfied
        ↓
Fee configuration is known
        ↓
Price protection passes
        ↓
Risk passes
        ↓
Order can be submitted
```

---

# 35. Tick Size

Tick size must be treated as dynamic market information.

The bot must not assume that a tick size observed earlier remains valid indefinitely.

If the current tick size changes, the execution layer must update its internal market state before submitting orders.

---

# 36. Minimum Order Size

Minimum order size must be obtained from current market information.

Strategies must not assume that every market accepts the same minimum order quantity.

An order below the applicable minimum must be rejected internally before reaching the exchange.

---

# 37. Price Protection

Every live order must have a defined maximum acceptable execution price.

Conceptually:

```text
Current Ask
    ↓
Maximum Acceptable Price
    ↓
Marketable Limit Order
```

If the available book moves beyond the acceptable price:

```text
Do Not Execute
```

The system must never send an unrestricted instruction equivalent to:

```text
Buy at whatever price is available.
```

---

# 38. Order Types

Polymarket CLOB orders are limit orders.

The system may use supported time-in-force behavior including:

* GTC
* GTD
* FOK
* FAK

The strategy and execution engine must explicitly choose the appropriate behavior.

A "market order" should be treated as a marketable limit order with an explicit price constraint rather than an unrestricted market instruction.

---

# 39. Post-Only

Post-only behavior may be used where the strategy requires maker-only execution.

The system must recognize the trade-off:

```text
Maker execution
    ↓
Potentially lower execution cost
    ↓
But lower fill certainty
```

Post-only is therefore an execution strategy, not a universal improvement.

---

# 40. FOK

FOK may be used when the strategy requires the full requested quantity to execute immediately or not at all.

FOK is particularly relevant to research involving executable arbitrage.

The simulator and live execution metrics should record:

* FOK attempts
* Successful FOK fills
* Failed FOK attempts
* Available depth
* Price at submission
* Price at exchange arrival

---

# 41. FAK

FAK may be used when partial execution is acceptable.

The execution engine must explicitly record:

* Requested quantity
* Filled quantity
* Remaining quantity
* Resulting exposure

Partial fills must not be treated as successful full execution.

---

# 42. GTD

GTD orders require an expiration.

The implementation must follow current Polymarket expiration requirements, including the security threshold around expiration time.

The system must not generate expiration timestamps that violate current exchange requirements.

---

# 43. Order State

Internal order state must preserve the difference between:

```text
Internal Intent
```

and:

```text
Exchange Order State
```

An internal order may exist before an exchange accepts it.

The system must not mark an order as active merely because an order request was created locally.

---

# 44. User Trade Lifecycle

The integration must preserve relevant user trade states.

Current CLOB V2 user trade lifecycle states include:

```text
MATCHED
MINED
CONFIRMED
RETRYING
FAILED
```

The internal state model must preserve enough information to distinguish these stages.

---

# 45. Order Lifecycle

Order lifecycle information must also be preserved.

Conceptually:

```text
PLACEMENT
    ↓
UPDATE
    ↓
CANCELLATION
```

The internal model must not collapse all order activity into a single final status.

---

# 46. Heartbeat and Safety

Where the selected client/integration supports heartbeat behavior, the bot should use it where appropriate.

Heartbeat-related safety is especially important for systems with open orders.

If the exchange/client supports automatic cancellation behavior following connectivity failure, the project should evaluate it as part of the execution safety design.

---

# 47. Reconciliation

The bot must periodically reconcile local state against Polymarket.

Reconciliation should verify:

* Open orders
* Order status
* Fills
* Positions
* Balances
* Recent trades

The purpose is to detect:

```text
Local State ≠ Exchange State
```

before that discrepancy causes incorrect trading decisions.

---

# 48. Reconciliation Failure

If reconciliation fails or produces an unexplained discrepancy, the trading system should move toward a safe state.

Depending on severity, this may mean:

```text
Continue observation
        ↓
Disable affected strategy
        ↓
Disable new orders
        ↓
Cancel orders
        ↓
Require manual intervention
```

The exact response is defined by the risk specification.

---

# 49. API Error Handling

The integration must distinguish between:

* Authentication errors
* Validation errors
* Rate limits
* Market unavailable
* Order rejected
* Temporary network errors
* Exchange errors
* Unknown errors

Unknown errors must not be silently converted into successful states.

---

# 50. Retry Policy

Retries must be controlled.

The system must not blindly retry order submission.

A retry can create duplicate exposure if the original request succeeded but the response was lost.

Order submission retries therefore require idempotency and state verification where supported.

---

# 51. Network Failure

A network timeout does not automatically mean:

```text
Order failed.
```

It may mean:

```text
Outcome unknown.
```

The correct behavior is:

```text
Timeout
    ↓
Verify exchange state
    ↓
Determine actual order state
```

Only after verification should the system decide whether further action is appropriate.

---

# 52. Rate Limiting

The integration must respect Polymarket's current API and CLOB rate limits.

The application must not implement aggressive uncontrolled polling.

Where WebSockets provide the required real-time information, they should be preferred over excessive REST polling.

---

# 53. API Response Normalization

External responses must be converted into internal domain models before reaching strategies.

Conceptually:

```text
Polymarket Response
        ↓
Adapter
        ↓
Validation
        ↓
Normalization
        ↓
Internal Model
        ↓
Strategy
```

Strategies should not depend directly on raw SDK response objects wherever practical.

---

# 54. External Data vs Internal Data

The system must preserve the original external values where necessary for auditability.

For example:

```text
External Price
```

should not be silently replaced by:

```text
Normalized Price
```

Instead:

```text
Raw Value
+
Normalized Value
+
Transformation Metadata
```

should be preserved where the research value justifies it.

---

# 55. Resolution Verification

For short-duration markets, resolution rules must be verified before the strategy treats an external price relationship as meaningful.

For example:

```text
BTC external feed
        +
Polymarket market
        +
Actual resolution source
        ↓
Valid comparison
```

The bot must not assume that the BTC feed used for trading is the feed used for resolution.

---

# 56. Polymarket Subgraphs

Polymarket subgraphs may be used for historical or on-chain analysis where they provide relevant information.

Potential uses include:

* Wallet activity
* Historical positions
* PnL-related analysis
* Orderbook/on-chain data
* Protocol activity
* Resolution analysis

Subgraph data must be treated according to its own data semantics and freshness.

It should not automatically replace current CLOB state.

---

# 57. Resolution Subgraph

Where useful, the resolution subgraph may provide resolution-related information including:

* Resolution status
* Proposed prices
* Disputes
* Updates
* Resolution metadata

The system should use the appropriate resolution source for the specific market.

---

# 58. CTF and On-Chain Operations

The trading bot may eventually require protocol-level operations such as:

* Split
* Merge
* Redeem
* Negative-risk operations

These are not automatically part of the initial directional trading runtime.

If introduced, they must be isolated behind explicit protocol adapters and risk controls.

---

# 59. Negative-Risk Markets

Negative-risk markets require additional protocol understanding.

The bot must identify whether a market belongs to a negative-risk structure before applying strategies that depend on:

* Split
* Merge
* Redemption
* Cross-outcome relationships

The bot must not apply ordinary market assumptions to negative-risk markets without validation.

---

# 60. Data API

The Polymarket Data API may be used for public and account-related information where appropriate.

Potential uses include:

* Trades
* Positions
* User activity
* Historical account analysis

Data API responses must still pass through normalization and validation.

---

# 61. Integration Test Environment

Integration tests must not assume that production credentials can be used safely for automated testing.

The project should maintain clear separation between:

```text
Mock / Local
Paper
Production
```

Live credentials must not be required for ordinary unit tests.

---

# 62. Paper Trading

Paper trading should use the same integration and strategy interfaces as live trading where practical.

The key difference should be execution mode:

```text
Paper
    ↓
Simulated Execution

Live
    ↓
Real Execution
```

The strategy should not require a completely different code path merely to avoid placing real orders.

---

# 63. Live Trading Boundary

Live trading must be an explicitly privileged capability.

The system must require:

* Live environment
* Live credentials
* Risk configuration
* Explicit activation
* Valid market state
* Valid account state
* Healthy connectivity
* Passing safety checks

A developer running the application locally must not accidentally activate live trading.

---

# 64. Kill Switch

The integration architecture must support immediate prevention of new orders.

The kill switch must be independent of individual strategies.

When activated:

```text
New Orders
    ↓
BLOCKED
```

Existing orders must be handled according to the approved emergency procedure.

---

# 65. Integration Logging

Logs should record integration events such as:

* Connection status
* Authentication status
* Market discovery
* Subscription status
* Order submission
* Order rejection
* Order cancellation
* Fill events
* Reconciliation
* API failures

Logs must not expose:

* Private keys
* API secrets
* Sensitive authentication material

---

# 66. Integration Metrics

The integration layer should expose metrics such as:

* API latency
* WebSocket latency
* Connection uptime
* Reconnection count
* Order submission latency
* Order rejection rate
* Fill rate
* Cancellation latency
* Reconciliation discrepancies
* Stale-data events

These metrics are important for determining whether an apparent strategy failure is actually an integration failure.

---

# 67. Integration Failure Classification

Failures should be classified as:

```text
DATA FAILURE
AUTH FAILURE
NETWORK FAILURE
EXCHANGE FAILURE
VALIDATION FAILURE
EXECUTION FAILURE
STATE FAILURE
UNKNOWN FAILURE
```

The system should not automatically blame the strategy for an integration failure.

---

# 68. Security Requirements

The Polymarket integration must satisfy:

* No secrets in source control
* No private keys in logs
* No credentials in frontend code
* Least-privilege credential access
* Explicit live-mode activation
* Secure environment configuration
* No secret exposure to research tooling
* No secret exposure to AI agents unless explicitly required

---

# 69. Agent Rules

AI agents working on Polymarket integration must:

1. Read this document first.
2. Use current official Polymarket documentation and SDK interfaces.
3. Verify the current API behavior before implementing undocumented assumptions.
4. Never revive archived V1 integration code as production code.
5. Never invent API fields.
6. Never invent endpoints.
7. Never assume fees.
8. Never assume tick sizes.
9. Never assume minimum order sizes.
10. Never assume resolution sources.
11. Never expose credentials.
12. Never activate live trading independently.
13. Preserve existing reconciliation behavior.
14. Test order-state transitions.
15. Flag uncertainty instead of guessing.

---

# 70. Integration Decision Rules

When an integration question arises, use this order:

```text
Current Official Polymarket Documentation
                ↓
Current Official SDK
                ↓
Official Polymarket Repository
                ↓
Verified Current API Behavior
                ↓
Historical / Community Information
```

Historical or community information must not override current official behavior without strong evidence.

---

# 71. What This Integration Does Not Assume

The integration does not assume:

1. Every market uses the same fee.
2. Every market uses the same tick size.
3. Every market uses the same minimum order size.
4. Every BTC market uses the same resolution mechanism.
5. Every wallet is an EOA.
6. Every repeat trader is a competitor.
7. Every order timeout means failure.
8. Every WebSocket disconnect means orders failed.
9. Every external BTC price is relevant to resolution.
10. Every apparent price discrepancy is executable.
11. Every market discovered through Gamma is immediately tradable.
12. Every API response should be trusted without validation.

---

# 72. Integration Completion Criteria

The integration layer is considered complete when:

* Current CLOB V2 integration is established.
* Official SDK integration is established.
* Market discovery works.
* Market identity is preserved.
* Dynamic market information is retrieved.
* Authentication is implemented securely.
* Public and private data boundaries are established.
* WebSocket integration is established where required.
* Order interaction is isolated behind the execution boundary.
* Order state is persisted.
* Fill state is persisted.
* Reconciliation is implemented.
* Network failure behavior is defined.
* Authentication failure behavior is defined.
* Live trading is explicitly gated.
* Kill-switch behavior exists.
* Integration metrics exist.
* No archived V1 client is used as the production foundation.

---

# 73. Next Document

The next document is:

```text
docs/polymarket/11-market-data-and-streaming.md
```

That document will define the market-data pipeline in detail, including Gamma discovery, CLOB orderbooks, WebSocket subscriptions, event normalization, freshness, sequencing, reconnection, BTC/Chainlink data synchronization, and the real-time market-state engine.
