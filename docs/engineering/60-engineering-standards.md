# Polymarket Trading Bot

## Engineering Standards

**Document:** `docs/engineering/60-engineering-standards.md`
**Status:** Approved
**Document Type:** Engineering Standards
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/infrastructure/50-development-and-deployment.md`
* `docs/infrastructure/51-monitoring-and-operations.md`

---

# 1. Purpose

This document defines the engineering standards for the Polymarket trading bot.

The goal is to ensure that implementation remains:

* Correct
* Testable
* Observable
* Maintainable
* Reproducible
* Secure
* Research-driven
* Consistent with the approved architecture

The bot is a trading system. Engineering mistakes can become financial mistakes.

---

# 2. Core Engineering Principle

The system must prioritize correctness over cleverness.

A simple implementation that is:

* understandable,
* testable,
* observable,
* and correct

is preferred over a more sophisticated implementation whose behavior cannot be confidently verified.

---

# 3. Source of Truth

The project documentation is the architectural and behavioral source of truth.

The hierarchy is:

```text
Project Charter
      ↓
Architecture Decisions
      ↓
Requirements
      ↓
Technical Specifications
      ↓
Implementation
      ↓
Current State
```

Code must not silently redefine approved requirements.

If implementation and documentation conflict:

1. Identify the conflict.
2. Determine whether the documentation or implementation is outdated.
3. Update the appropriate source deliberately.
4. Record significant architectural decisions.

---

# 4. Engineering Priorities

Engineering decisions should generally follow this order:

```text
Correctness
    ↓
Safety
    ↓
Observability
    ↓
Testability
    ↓
Maintainability
    ↓
Performance
    ↓
Optimization
```

Performance optimization must not compromise trading correctness or safety without explicit justification.

---

# 5. Modularity

The initial system should be modular without being unnecessarily distributed.

Logical boundaries should exist between:

```text
Market Data
Truth Layer
Market State
Strategies
Signal Fusion
Edge
Risk
Execution
Portfolio
Research
Monitoring
```

These boundaries do not require separate services.

---

# 6. Avoid Premature Microservices

The project should not introduce microservices merely because the system contains multiple logical components.

Initial implementation should prefer a modular application.

Additional services should only be introduced when there is demonstrated justification such as:

* Resource isolation
* Reliability isolation
* Scaling requirements
* Deployment independence
* Security boundary
* Measurable performance requirement

---

# 7. Domain Ownership

Each subsystem should have clear ownership of its state.

Examples:

```text
Market Data
→ Market data state

Strategy
→ Strategy state and signals

Risk
→ Risk decisions

Execution
→ Orders and execution state

Portfolio
→ Positions and PnL state

Research
→ Experiments and research artifacts
```

One subsystem should not silently mutate another subsystem's authoritative state.

---

# 8. Dependency Direction

Dependencies should generally flow toward lower-level capabilities.

For example:

```text
Strategy
    ↓
Signal / Edge
    ↓
Risk
    ↓
Execution
    ↓
Polymarket Adapter
```

The execution layer must not depend on a specific strategy.

The risk layer must not depend on one strategy's implementation details.

---

# 9. Strategies Must Not Own Execution

A strategy produces an intent or opportunity.

It does not directly submit exchange orders.

The boundary should remain:

```text
Strategy
→ Signal
→ Opportunity
→ Edge
→ Risk
→ Execution
→ Order
```

This prevents strategy code from bypassing risk and execution controls.

---

# 10. Risk Must Be Independent

Risk checks must not be optional because a strategy is trusted.

All live execution requests must pass through the risk boundary.

A strategy cannot:

* Disable risk
* Modify global risk controls
* Bypass position limits
* Submit directly to the exchange

---

# 11. Execution Must Be Centralized

Exchange interaction should be centralized through the execution layer and Polymarket adapter.

This prevents different strategies from implementing incompatible:

* Authentication
* Order validation
* Price protection
* Fee handling
* Retry behavior
* Cancellation logic
* Reconciliation

---

# 12. Unknown State Is a First-Class State

The system must not assume success when an operation's final state is unknown.

Examples:

```text
Order submission timed out
→ UNKNOWN
```

not:

```text
Order submission timed out
→ FAILED
```

The system should reconcile authoritative state before deciding what happened.

---

# 13. Fail Closed

Where uncertainty could result in unsafe live trading, the system should fail closed.

Examples:

* Missing required market data
* Invalid configuration
* Unresolved order state
* Failed risk check
* Portfolio mismatch
* Stale strategy input

The correct behavior is generally to prevent unsafe execution rather than guess.

---

# 14. Explicitness Over Implicit Behavior

Important trading behavior should be explicit.

Avoid hidden:

* Order submission
* Retries
* Position changes
* Risk overrides
* Configuration defaults
* Strategy activation
* Live-mode activation

---

# 15. Configuration

Configuration should be separated from application logic.

Configuration includes:

* Runtime mode
* API endpoints
* Credentials references
* Strategy configuration
* Risk configuration
* Database configuration
* Monitoring configuration

Secrets must not be stored directly in source code.

---

# 16. No Hardcoded Dynamic Market Parameters

The application must not hardcode dynamic market properties such as:

* Minimum order size
* Tick size
* Current fees
* Market status
* Market-specific execution constraints

These must be obtained from authoritative market information.

---

# 17. Constants

Hardcoded constants are acceptable when they represent genuine application invariants.

They should not be used to hide research assumptions.

For example, a value should not be hardcoded merely because it worked in one backtest.

---

# 18. Research Parameters

Strategy parameters must be distinguishable from engineering constants.

Examples include:

* Signal windows
* Entry conditions
* Exit conditions
* Edge requirements
* Volatility filters
* Timing windows

These values must be versioned and traceable to research.

---

# 19. No Magic Numbers

Avoid unexplained numeric literals in strategy and execution code.

Instead of:

```text
if spread > 0.05
```

the implementation should make the meaning and provenance of the value clear.

Where a threshold is research-derived, its experiment or configuration should be identifiable.

---

# 20. Type Safety

TypeScript should use strong typing.

Avoid unnecessary:

```text
any
```

Types should represent domain concepts rather than relying on unstructured objects.

---

# 21. Domain Types

Important concepts should have explicit representations.

Examples:

```text
MarketId
TokenId
ConditionId
OrderId
TradeId
SignalId
OpportunityId
StrategyId
WalletAddress
Price
Quantity
Timestamp
```

The implementation may use branded types or equivalent mechanisms where useful.

---

# 22. Units Must Be Explicit

Values with different units must not be confused.

Examples:

```text
Price
Quantity
Probability
Percentage
USDC
Milliseconds
Seconds
Unix Timestamp
```

Time-related values are especially important.

A millisecond timestamp must not silently be interpreted as seconds.

---

# 23. Decimal Precision

Financial calculations must use appropriate decimal handling.

Do not rely on binary floating-point behavior where precision can materially affect:

* Order prices
* Quantities
* Fees
* PnL
* Probability calculations
* Tick-size validation

---

# 24. Price and Tick Validation

Prices must be validated against the current market tick size.

The implementation should not assume a universal tick size.

Market-specific information must be used.

---

# 25. Minimum Order Validation

Orders must respect the current market minimum order requirements.

Validation must occur before submission.

---

# 26. Financial Calculations

Financial calculations should be isolated from transport and infrastructure logic.

Examples:

```text
Fee Calculation
Slippage Calculation
VWAP
Expected Value
PnL
Position Cost
Realized PnL
Unrealized PnL
```

This makes them easier to test independently.

---

# 27. Deterministic Calculations

Where calculations should be deterministic, they must produce the same result from the same inputs.

This is particularly important for:

* Backtesting
* PnL
* Fee calculations
* Signal normalization
* Edge calculation
* Execution simulation

---

# 28. Time Handling

The system must preserve multiple timestamps where relevant:

```text
Event Time
Receipt Time
Processing Time
Decision Time
Submission Time
Exchange Arrival Time
Fill Time
Confirmation Time
```

Do not overwrite these timestamps with a single generic timestamp.

---

# 29. Clock Synchronization

Runtime environments should maintain accurate system time.

Timestamp-sensitive strategies and execution analysis depend on meaningful timing data.

---

# 30. Event-Driven Boundaries

Streaming events should be treated as events rather than arbitrary state mutations.

For example:

```text
BOOK_UPDATE
PRICE_CHANGE
TRADE
TICK_SIZE_CHANGE
MARKET_RESOLVED
ORDER_UPDATE
USER_TRADE_UPDATE
```

Events should be validated before changing internal state.

---

# 31. Idempotency

Repeated delivery of the same event must not create duplicate state changes.

This is particularly important for:

* WebSocket reconnects
* Order updates
* Trade updates
* Database retries
* API retries

---

# 32. Duplicate Detection

Important event and transaction identifiers should be used to detect duplicates.

Duplicate data should not create:

* Duplicate fills
* Duplicate positions
* Duplicate PnL
* Duplicate orders

---

# 33. Ordering

The system must account for out-of-order events.

Where event ordering matters, the implementation should use the appropriate:

* Event timestamp
* Sequence information
* State version
* Reconciliation mechanism

---

# 34. Stale Events

An event that arrives after its useful state window may need to be rejected or reconciled.

The system must not blindly apply stale state.

---

# 35. Error Handling

Errors must be classified rather than swallowed.

Useful categories include:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NETWORK_ERROR
RATE_LIMIT_ERROR
EXCHANGE_ERROR
DATA_ERROR
STATE_ERROR
CONFIGURATION_ERROR
DATABASE_ERROR
RISK_REJECTION
UNKNOWN_ERROR
```

The final taxonomy may evolve with implementation.

---

# 36. Error Context

Errors should contain sufficient context to diagnose the failure.

Where applicable:

* Component
* Market
* Strategy
* Order ID
* Request ID
* Event ID
* Error category
* Timestamp

Sensitive credentials must never be included.

---

# 37. Retry Policy

Retries must be deliberate.

Do not automatically retry every error.

Retries must consider:

* Idempotency
* Error type
* Current state
* Exchange behavior
* Risk
* Duplicate-order possibility

---

# 38. Exchange Order Retries

Order submission retries require special care.

A timeout does not prove that an order was not accepted.

Before retrying a potentially duplicated order, the system should determine the existing order state where possible.

---

# 39. Network Failure

Network failure must not automatically be interpreted as exchange failure.

The system should distinguish:

```text
Request Failed Before Sending
Request Sent but Response Unknown
Exchange Explicitly Rejected
Exchange Accepted
```

---

# 40. Cancellation

Cancellation must be treated as a state transition rather than an assumption.

A cancellation request does not necessarily mean the order is already cancelled.

Final state should be verified.

---

# 41. Logging Standards

Application logs should be structured.

Each important log should contain enough context to connect it to the relevant operation.

Examples:

```text
timestamp
level
component
event
strategy
market
order
request
message
```

---

# 42. Log Levels

Use appropriate levels such as:

```text
DEBUG
INFO
WARN
ERROR
```

The exact logging library is an implementation detail.

---

# 43. Debug Logging

Debug logs may contain detailed execution information but must still obey security rules.

Debug logging should not become the only source of operational state.

---

# 44. Error Logging

Errors should include:

* What failed
* Where it failed
* Relevant identifier
* Recoverability
* Current state

Avoid logs that only say:

```text
Something went wrong
```

---

# 45. Metrics vs Logs

Use metrics for repeated measurable behavior.

Use logs for event context.

Use persistent domain records for authoritative trading state.

The system should not use logs as the primary source of portfolio truth.

---

# 46. Correlation IDs

Related operations should be traceable.

A trade flow may share a correlation chain:

```text
Signal
→ Opportunity
→ Risk Decision
→ Order Intent
→ Order
→ Fill
```

This makes individual trade investigation possible.

---

# 47. Security Standards

Security-sensitive operations must be isolated.

Examples:

* Wallet access
* Private key usage
* API credentials
* Order signing
* Live order submission

---

# 48. Credential Handling

Credentials must:

* Remain outside source control
* Be injected through secure configuration
* Never appear in logs
* Never be committed to Git
* Be separated by environment where appropriate

---

# 49. Wallet Separation

Research and paper environments must not have unnecessary access to live trading credentials.

Live wallet access must remain within the live execution boundary.

---

# 50. Live Trading Boundary

Live order submission must be explicitly gated.

The application should not enter live trading simply because a deployment succeeded.

Live activation must be deliberate.

---

# 51. Environment Isolation

The project has three logical modes:

```text
RESEARCH
PAPER
LIVE
```

Code may be shared, but authority and execution capabilities must be separated.

---

# 52. Research Safety

Research code must not accidentally submit live orders.

Research environments should not require live trading credentials.

---

# 53. Paper Trading Safety

Paper trading should simulate execution without submitting real orders.

It should still use realistic:

* Fees
* Slippage
* Depth
* Execution delays
* Fill behavior

where supported by the simulation model.

---

# 54. Live Trading Safety

Live mode must require:

* Valid configuration
* Valid credentials
* Healthy data
* Healthy risk engine
* Healthy execution engine
* Valid portfolio state
* Successful reconciliation

---

# 55. Testing Principle

No important trading behavior should depend solely on manual testing.

The project requires automated tests for critical logic.

---

# 56. Unit Testing

Unit tests should cover deterministic components such as:

* Fee calculations
* PnL
* VWAP
* Slippage
* Signal normalization
* Edge calculations
* Risk rules
* State transitions
* Data validation

---

# 57. Integration Testing

Integration tests should validate boundaries such as:

* Polymarket adapter
* Database
* Market data processing
* Execution pipeline
* Portfolio updates
* Reconciliation

---

# 58. Simulation Testing

Execution-sensitive strategies should be tested through historical or controlled execution simulation.

This should account for:

* Market depth
* Latency
* Fees
* Slippage
* Partial fills
* Opportunity decay

---

# 59. End-to-End Testing

End-to-end testing should verify the complete path:

```text
Market Data
→ Strategy
→ Signal
→ Edge
→ Risk
→ Execution
→ Portfolio
```

Live credentials must not be required for ordinary end-to-end tests.

---

# 60. Regression Testing

Previously fixed bugs should receive regression tests where practical.

A bug should not repeatedly reappear because the original failure was never encoded into the test suite.

---

# 61. Property Testing

Property-based testing may be used where useful for:

* Financial calculations
* State machines
* Order validation
* Data normalization

The goal is to test behavioral invariants rather than only known examples.

---

# 62. Test Data

Test data should be:

* Reproducible
* Versioned where necessary
* Representative
* Free of live credentials
* Clearly identified as synthetic or historical

---

# 63. Research Reproducibility

Research results should record:

* Dataset version
* Code version
* Strategy version
* Parameters
* Date range
* Market universe
* Execution assumptions
* Fee assumptions
* Simulation assumptions

A result that cannot be reproduced should not be treated as strong evidence.

---

# 64. Backtest Integrity

Backtests must not use information unavailable at the simulated decision time.

The implementation must prevent:

* Look-ahead bias
* Future leakage
* Incorrect timestamp alignment
* Resolution leakage
* Survivorship bias where applicable

---

# 65. Execution Simulation Integrity

Execution simulation should model the path:

```text
Signal Timestamp
→ Processing Delay
→ Network Delay
→ Exchange Arrival
→ Book State
→ Queue / Fill Model
→ Partial Fill
→ Remaining Order
```

Where information is unavailable, the simulator must explicitly represent the uncertainty rather than fabricate precision.

---

# 66. Dependency Management

Dependencies should be added only when they provide meaningful value.

Before adding a dependency, consider:

* Maintenance
* Security
* Stability
* License
* Bundle/runtime impact
* Existing project capability
* Whether the functionality can be implemented more safely internally

---

# 67. Official Polymarket Dependencies

Where an official Polymarket library exists and meets project requirements, it should generally be preferred over an unofficial implementation.

The official TypeScript SDK remains the primary integration direction.

---

# 68. Archived Dependencies

Archived Polymarket libraries must not be adopted as the production foundation.

They may be inspected for historical/reference purposes where necessary.

---

# 69. Low-Level Utilities

Low-level Polymarket utilities should only be introduced where the official SDK does not adequately expose required functionality or where there is a documented reason to use them.

---

# 70. API Boundary

External APIs should be isolated behind project adapters.

Strategy code should not directly depend on raw HTTP/WebSocket implementation details.

For example:

```text
Strategy
   ↓
Market Data Interface
   ↓
Polymarket Adapter
   ↓
CLOB / Gamma / Data API / WebSocket
```

---

# 71. Database Standards

Database access should be centralized through clear repositories or data-access boundaries.

Business logic should not scatter raw database operations throughout the application.

---

# 72. Transactions

Database transactions should be used where multiple related state changes must remain consistent.

Examples:

```text
Fill
→ Position Update
→ PnL Update
```

The exact transaction boundary should be determined by the data model.

---

# 73. Migrations

Schema changes must be version-controlled.

Migrations should be:

* Reproducible
* Reviewable
* Tested
* Applied deliberately

---

# 74. Destructive Database Changes

Destructive schema changes require additional review.

Do not silently delete or rewrite historical trading data.

Historical execution records are important for:

* PnL
* Auditing
* Research
* Incident investigation

---

# 75. Data Integrity

The system must preserve relationships between:

```text
Market
Signal
Opportunity
Order
Fill
Position
PnL
```

Orphaned or inconsistent records should be detectable.

---

# 76. Immutability

Historical facts should generally be treated as immutable.

Examples:

* Executed fills
* Confirmed trades
* Historical market events
* Completed experiments

Corrections should preserve an audit trail rather than silently rewriting history.

---

# 77. Versioning

The following should be versioned where relevant:

* Strategies
* Strategy parameters
* Signal logic
* Edge logic
* Risk configuration
* Execution configuration
* Database schema
* Research datasets
* Experiments
* Deployments

---

# 78. Configuration Changes

Material configuration changes must be traceable.

The system should be able to determine which configuration produced a given trade.

---

# 79. Strategy Versioning

Every live strategy execution should be associated with a strategy version.

This allows PnL and behavior to be attributed to the correct implementation.

---

# 80. Experiment Versioning

Each experiment should record:

```text
Experiment ID
Hypothesis
Strategy Version
Dataset
Parameters
Results
Conclusion
```

Rejected experiments are valuable research artifacts and should not be discarded.

---

# 81. Documentation Standards

Technical documentation should be:

* Specific
* Current
* Consistent with implementation
* Free of unsupported assumptions

Documentation must distinguish:

```text
FACT
HYPOTHESIS
DECISION
EXPERIMENT
UNKNOWN
```

---

# 82. Research Language

Do not write:

> This strategy is profitable.

unless the evidence supports that claim under clearly defined conditions.

Prefer:

> Historical testing produced positive results under the specified dataset and execution assumptions.

---

# 83. No False Precision

Do not invent exact:

* Latency advantages
* Profitability percentages
* Optimal thresholds
* Risk limits
* Fill probabilities
* Strategy weights

unless they have been experimentally established.

---

# 84. Comments

Comments should explain why something exists when the reason is not obvious.

Avoid comments that merely restate the code.

Good comments explain:

* Constraint
* Research finding
* Safety requirement
* Non-obvious behavior
* External protocol requirement

---

# 85. TODO Standards

TODOs should be actionable.

Prefer:

```text
TODO: Validate passive-fill model against historical queue-position data.
```

over:

```text
TODO: Fix this.
```

---

# 86. Dead Code

Unused code should not accumulate.

Experimental code should either:

* Be isolated,
* Be clearly marked,
* Or be removed when no longer useful.

---

# 87. Feature Flags

Feature flags may be used for controlled activation of:

* New strategies
* Experimental execution logic
* New data sources
* New monitoring behavior

Feature flags must not become permanent undocumented configuration.

---

# 88. Live Feature Activation

A feature capable of affecting live capital must have:

* Explicit configuration
* Clear ownership
* Safe default
* Test coverage
* Monitoring
* Rollback path

---

# 89. Performance Engineering

Performance optimization should be evidence-driven.

Measure before optimizing.

Relevant measurements may include:

* Event processing latency
* Signal generation latency
* Execution decision latency
* Database latency
* Memory usage
* CPU usage

---

# 90. High-Frequency Data

High-frequency data should not unnecessarily pass through expensive application paths.

The architecture already separates:

```text
PostgreSQL
```

for structured application state from:

```text
Parquet + DuckDB
```

for high-frequency research datasets.

---

# 91. Caching

Caching should only be introduced where it improves measurable performance or reduces unnecessary external calls.

Cached values must have clear:

* Ownership
* Freshness
* Invalidation
* Failure behavior

---

# 92. Redis

Redis is an optional supporting component.

It must not silently become the authoritative source of:

* Positions
* Fills
* PnL
* Historical trading state

---

# 93. Concurrency

Concurrency must be designed explicitly.

Potential race conditions include:

* Multiple signals targeting the same market
* Simultaneous order submissions
* Order cancellation and fill occurring together
* Multiple strategy requests competing for capital
* Reconciliation during execution

---

# 94. State Machines

Stateful processes should use explicit state machines where useful.

Examples:

```text
Order Lifecycle
Trade Lifecycle
Strategy Lifecycle
Trading Readiness
Incident Lifecycle
```

---

# 95. Race Conditions

The implementation must account for state changes occurring between:

```text
Decision
→ Submission
→ Exchange Arrival
```

The current market state at decision time is not necessarily the state at execution time.

---

# 96. Concurrency and Risk

Risk must evaluate current relevant state rather than relying solely on stale strategy snapshots.

---

# 97. Code Review

Changes affecting live trading should receive review before activation.

Particular scrutiny is required for changes to:

* Risk
* Execution
* Wallet handling
* Authentication
* Position accounting
* PnL
* Market-data interpretation
* Strategy parameters

---

# 98. Pull Requests

Pull requests should explain:

* What changed
* Why it changed
* Which requirements are affected
* How it was tested
* Whether research evidence supports the change
* Whether deployment implications exist

---

# 99. Commit Standards

Commits should be focused.

Avoid combining unrelated changes such as:

```text
Strategy change
+
Database migration
+
UI redesign
+
Infrastructure change
```

unless there is a clear reason they must be coupled.

---

# 100. Refactoring

Refactoring should preserve behavior unless a behavioral change is explicitly intended.

When refactoring trading logic:

1. Capture current behavior.
2. Add or confirm tests.
3. Refactor.
4. Run regression tests.
5. Compare important outputs.
6. Document meaningful differences.

---

# 101. Breaking Changes

Breaking changes must be explicit.

Potential examples:

* Database schema changes
* API contract changes
* Strategy interface changes
* Execution interface changes
* Data model changes

---

# 102. API Contracts

Internal interfaces should be stable and explicit.

Important contracts include:

```text
MarketData → MarketState
Strategy → Signal
Signal → Opportunity
Opportunity → Edge
Edge → Risk
Risk → Execution
Execution → Portfolio
```

---

# 103. Strategy Contract

A strategy should declare:

* Required inputs
* Output signal
* Timestamp requirements
* Required freshness
* Market scope
* Strategy version
* Invalid conditions

---

# 104. Risk Contract

Risk should receive sufficient information to evaluate:

* Market
* Side
* Quantity
* Price
* Expected edge
* Current exposure
* Strategy
* Execution conditions

Risk should return an explicit decision.

---

# 105. Execution Contract

Execution should receive an approved intent rather than an unrestricted strategy command.

The execution layer should validate the current market conditions again before submission.

---

# 106. Portfolio Contract

Portfolio accounting should consume authoritative execution outcomes.

A signal must never create a position.

A requested order must never be treated as a fill.

Only confirmed execution information should update actual portfolio state.

---

# 107. Monitoring Contract

Every critical subsystem should expose enough information for monitoring.

At minimum:

```text
State
Health
Errors
Last Activity
Relevant Metrics
```

---

# 108. Operational Simplicity

The initial implementation should remain operationally simple.

Do not introduce:

* Kubernetes
* Kafka
* Complex service meshes
* Distributed orchestration

without demonstrated need.

---

# 109. Deployment Standards

Deployments must:

* Be reproducible
* Be versioned
* Be traceable
* Be testable
* Have rollback procedures

---

# 110. Deployment Safety

A successful deployment does not automatically authorize live trading.

Deployment and trading activation remain separate operations.

---

# 111. Rollback

Every production deployment should have a known rollback path.

Rollback must consider:

* Application version
* Database compatibility
* Active orders
* Portfolio state
* Strategy state

---

# 112. Backward Compatibility

Where practical, application updates should remain compatible with existing persisted state.

If compatibility cannot be maintained, migration must be explicit.

---

# 113. AI-Assisted Development

AI agents are permitted to:

* Research
* Implement
* Test
* Refactor
* Benchmark
* Document
* Debug

AI agents must follow the project documentation and agent operating protocol.

---

# 114. AI Agent Restrictions

The AI agent must not independently:

* Allocate capital
* Activate live trading
* Change risk limits
* Replace the wallet
* Expose credentials
* Remove safety controls
* Modify approved strategy assumptions without approval
* Deploy live money without explicit authorization

---

# 115. Agent Uncertainty Rule

If the agent lacks sufficient information to make a safe implementation decision, it must not guess.

It should:

1. Identify the missing information.
2. Explain why it matters.
3. Ask for clarification or mark the task as blocked.

---

# 116. Agent Documentation Rule

When implementation changes an approved architectural decision, the agent must not silently modify the architecture.

It should flag the conflict and request a decision.

---

# 117. Agent Verification

After implementation, the agent should verify:

```text
Requirements
↓
Implementation
↓
Tests
↓
Acceptance Criteria
↓
Documentation
```

---

# 118. Engineering Quality Gate

A change should not be considered complete merely because the code compiles.

The relevant quality gates are:

```text
Correctness
Safety
Tests
Observability
Documentation
Reproducibility
```

---

# 119. Definition of Done

For a normal implementation task, completion should generally require:

* Requirement identified
* Relevant specification read
* Implementation completed
* Tests added or updated
* Existing tests pass
* Relevant edge cases considered
* Logging/observability updated where necessary
* Documentation updated where necessary
* Current state updated where appropriate

---

# 120. Production Readiness

A component should not be considered production-ready merely because it works in a local environment.

Production readiness requires evidence across:

```text
Functionality
Reliability
Security
Observability
Recovery
Testing
Operational Procedures
```

---

# 121. Engineering Decision Records

Significant architectural decisions should be recorded in:

```text
docs/project-state/DECISIONS.md
```

Examples:

* Technology selection
* Architecture changes
* Strategy activation decisions
* Database architecture changes
* Deployment architecture changes
* Risk model changes

---

# 122. Change Log

Meaningful project changes should be recorded in:

```text
docs/project-state/CHANGELOG.md
```

The changelog should describe what changed, not merely list commit hashes.

---

# 123. Current State

The current implementation state should be maintained in:

```text
docs/project-state/CURRENT-STATE.md
```

This should identify:

* Implemented components
* Active strategies
* Deployment state
* Known limitations
* Current blockers
* Outstanding risks

---

# 124. TODO Management

Outstanding work belongs in:

```text
docs/project-state/TODO.md
```

Tasks should be specific enough to execute.

---

# 125. Engineering Integrity

The project must never present:

* Backtests as live performance
* Simulations as real fills
* Theoretical arbitrage as executable arbitrage
* Historical wallet profitability as guaranteed future profitability
* A strategy hypothesis as a validated strategy

Evidence must always be represented accurately.

---

# 126. Final Engineering Rule

The system is being built to trade real capital.

Therefore:

> **If the behavior cannot be explained, tested, observed, and safely controlled, it is not ready for live trading.**

---

# 127. Completion Criteria

This engineering standards document is considered complete when the implementation process follows:

* Clear architecture boundaries
* Strong typing
* Explicit state
* Explicit units
* Safe financial calculations
* Controlled configuration
* Structured logging
* Observable execution
* Idempotent event handling
* Explicit error handling
* Safe retries
* Secure credential handling
* Automated testing
* Reproducible research
* Versioned strategies
* Versioned configuration
* Controlled deployments
* Documented decisions
* AI agent restrictions
* Fail-closed behavior
* Explicit live-trading boundaries

---

# 128. Next Document

The next document is:

```text
docs/engineering/61-testing-and-ci-cd.md
```

That document will define the project's testing architecture, test layers, fixtures, mocks, integration testing, execution simulation testing, research validation, regression testing, CI pipelines, quality gates, deployment promotion, and live-trading protection within CI/CD.
