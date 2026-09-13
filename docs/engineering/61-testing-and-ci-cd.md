# Polymarket Trading Bot

## Testing and CI/CD

**Document:** `docs/engineering/61-testing-and-ci-cd.md`
**Status:** Approved
**Document Type:** Testing and Continuous Integration / Continuous Deployment Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/11-market-data-and-streaming.md`
* `docs/polymarket/12-trading-and-execution.md`
* `docs/research/30-research-and-backtesting.md`
* `docs/research/31-execution-simulation.md`
* `docs/risk/40-risk-and-safety.md`
* `docs/infrastructure/50-development-and-deployment.md`
* `docs/infrastructure/51-monitoring-and-operations.md`
* `docs/engineering/60-engineering-standards.md`

---

# 1. Purpose

This document defines the testing and CI/CD standards for the Polymarket trading bot.

The objective is to ensure that changes can be:

* Tested before integration
* Validated before deployment
* Reproduced
* Audited
* Rolled back
* Safely promoted between environments

The CI/CD system must reduce the probability that an engineering change becomes a trading incident.

---

# 2. Core Principle

A passing build is not equivalent to a safe trading system.

The project requires multiple layers of validation:

```text
Code Validation
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Simulation Tests
    ↓
End-to-End Tests
    ↓
Paper Trading
    ↓
Controlled Live Activation
```

Each layer answers different questions.

---

# 3. Testing Philosophy

Testing should prioritize:

1. Correctness
2. Safety
3. Determinism
4. Reproducibility
5. Regression prevention
6. Operational reliability
7. Performance

Testing must not be designed merely to achieve a high coverage percentage.

---

# 4. Test Pyramid

The system should use multiple test layers.

```text
                 E2E
              Simulation
            Integration
             Unit Tests
```

The majority of deterministic logic should be covered by unit tests.

Integration and end-to-end tests should focus on system boundaries.

---

# 5. Test Categories

The project should support:

* Static analysis
* Type checking
* Unit tests
* Integration tests
* Contract tests
* State-machine tests
* Property tests where useful
* Execution simulation
* Historical replay
* End-to-end tests
* Regression tests
* Security checks
* Build verification
* Deployment verification

---

# 6. Static Validation

Every relevant code change should be checked for:

* Formatting
* Type errors
* Lint errors
* Invalid imports
* Build failures
* Configuration errors

Static validation should occur before more expensive tests where practical.

---

# 7. TypeScript Validation

The TypeScript application should validate:

* Type correctness
* Build correctness
* Module resolution
* Generated artifacts where applicable
* Dependency compatibility

The exact tooling may evolve, but type checking must remain part of CI.

---

# 8. Python Validation

The research environment should validate:

* Python syntax
* Type correctness where configured
* Formatting
* Linting
* Test execution
* Dependency consistency

Research code must meet the same basic engineering quality standards as production code.

---

# 9. Rust Validation

Rust components, if introduced, must use the standard Rust compilation and test checks appropriate to the component.

Rust should remain conditional rather than becoming a mandatory part of every application change.

---

# 10. Unit Tests

Unit tests should cover deterministic business logic.

Priority areas include:

* Fee calculations
* Price calculations
* VWAP
* Slippage
* PnL
* Signal normalization
* Edge calculations
* Position calculations
* Risk decisions
* Market validation
* Data normalization
* State transitions

---

# 11. Financial Calculation Tests

Financial calculations require explicit test coverage.

Examples:

```text id="m9xv5f"
Fee
Slippage
VWAP
Expected Value
Realized PnL
Unrealized PnL
Position Cost
Average Entry
```

Tests should include boundary and precision-sensitive cases.

---

# 12. Financial Precision Tests

Tests should verify that calculations behave correctly when values are close to:

* Tick boundaries
* Minimum order sizes
* Fee precision boundaries
* Zero values
* Very small quantities
* Large quantities

---

# 13. Market Parameter Tests

Tests should verify that dynamic market information is correctly applied.

Examples:

* Tick size
* Minimum order size
* Fees
* Market status
* Resolution state

The implementation must not accidentally fall back to obsolete hardcoded values.

---

# 14. Market Identity Tests

Market identity logic should verify:

* Market ID
* Condition ID
* Token ID
* Outcome
* Resolution source
* Resolution timing
* Market family

This is critical for avoiding comparisons between unrelated markets.

---

# 15. Market Family Tests

Cross-market strategies must verify:

```text id="7pld4x"
Same Event
Same Underlying
Same Resolution
Same Timestamp
Same Asset
Same Outcome Semantics
```

A failed identity check must prevent invalid cross-market comparisons.

---

# 16. Data Normalization Tests

Tests should verify normalization of:

* Prices
* Quantities
* Timestamps
* Market identifiers
* Wallet addresses
* Trade records
* Orderbook events

---

# 17. Event Processing Tests

Event processors should be tested for:

* Valid events
* Duplicate events
* Out-of-order events
* Missing fields
* Invalid values
* Stale events
* Replayed events

---

# 18. Idempotency Tests

Processing the same event more than once should not create duplicate state.

For example:

```text id="i7c6y4"
Same Fill Event
→
Processed once
→
Processed again
→
Same final position
```

---

# 19. State Machine Tests

State machines should have tests for valid and invalid transitions.

Examples:

```text id="yknv4o"
Order
Trade
Strategy
Trading Readiness
Risk
Incident
```

Invalid transitions should fail explicitly.

---

# 20. Order State Tests

Tests should cover transitions such as:

```text id="z8v2ps"
PENDING
→ OPEN
→ PARTIALLY_FILLED
→ FILLED
```

and failure paths such as:

```text id="g3z7ab"
PENDING
→ REJECTED
```

Unknown states must also be tested.

---

# 21. Unknown Order State Tests

A timeout or ambiguous response must not automatically become a failed order.

Tests should verify:

```text id="4e7vbc"
Unknown response
→ UNKNOWN
→ Reconciliation
→ Final authoritative state
```

---

# 22. Cancellation Tests

Tests should distinguish:

```text id="q4yr9v"
Cancellation Requested
```

from:

```text id="2gcx9k"
Cancellation Confirmed
```

---

# 23. Retry Tests

Retry logic should be tested against:

* Retryable network failures
* Non-retryable validation errors
* Authentication errors
* Rate limits
* Exchange rejection
* Unknown order state

Retries must not create duplicate orders.

---

# 24. Risk Tests

Risk tests should verify:

* Approved trades
* Rejected trades
* Invalid inputs
* Exposure checks
* Capital checks
* Market checks
* Strategy checks
* Stale-data rejection
* Kill-switch behavior
* Reconciliation-related blocking

---

# 25. Risk Boundary Tests

A strategy must not be able to bypass risk.

Tests should verify that:

```text id="w2w4de"
Strategy
→ Execution
```

is not a valid live path.

The valid path remains:

```text id="qv7y5u"
Strategy
→ Edge
→ Risk
→ Execution
```

---

# 26. Kill-Switch Tests

The kill switch must be tested for:

* Triggering
* Blocking new orders
* Handling existing orders
* Persistence of triggered state
* Explicit reset
* Recovery behavior

---

# 27. Strategy Tests

Each strategy should have tests for:

* Valid input
* Missing input
* Stale input
* Invalid market
* Signal generation
* Signal expiration
* No-signal conditions
* Boundary conditions

---

# 28. BTC Strategy Tests

BTC 5m strategy tests should cover:

* External BTC data
* Resolution-source data
* Time-to-resolution
* Lead-lag calculation
* Market-state inputs
* Orderbook inputs
* Volatility inputs
* Signal timing
* Signal expiration

The system must not assume a permanent fixed lead-lag relationship.

---

# 29. Wallet Intelligence Tests

Wallet-analysis tests should cover:

* Wallet classification
* Trade normalization
* FIFO reconstruction
* Realized PnL
* Holding time
* Entry quality
* Copyability metrics

---

# 30. Address Classification Tests

Tests should distinguish:

```text id="s7p2yn"
EOA
Contract
CTF Exchange
Known Protocol
Market Maker
Bot
Human
Unknown
```

Classification must not automatically equate activity with intelligence.

---

# 31. Copyability Tests

Copyability scoring should be tested against:

* Historical profitability
* Consistency
* Drawdown
* Trade count
* Holding time
* Entry edge
* Liquidity
* Spread
* Execution delay
* Maker/taker behavior
* Simulated copy performance

---

# 32. Market Dislocation Tests

Structural strategies should test:

* Market-family validation
* Price relationships
* Combined cost
* Depth
* Fees
* Slippage
* Partial fills
* Legging risk
* Completion conditions

---

# 33. Opportunity Classification Tests

The system should distinguish:

```text id="m0zv2h"
THEORETICAL
EXECUTABLE
EXPIRED
MISSED
REJECTED
EXECUTED
```

This distinction must survive through research and production telemetry.

---

# 34. Edge Tests

Edge calculations should test:

* Fair probability
* Market price
* Depth-aware price
* Fees
* Slippage
* Execution latency
* Fill probability
* Opportunity decay

---

# 35. No-Trade Tests

The system must test situations where the correct decision is:

```text id="7b4j3m"
DO NOTHING
```

Examples:

* Insufficient edge
* Stale data
* Poor liquidity
* Excessive slippage
* Invalid market
* Risk rejection
* Expired opportunity

---

# 36. Execution Simulation

Execution-sensitive strategies must be tested through simulation.

The simulator should model:

```text id="psj8f3"
Signal
→ Processing Delay
→ Network Delay
→ Exchange Arrival
→ Book State
→ Execution
→ Partial Fill
→ Remaining Order
```

---

# 37. Depth-Aware Simulation Tests

Simulation tests should use actual or historically reconstructed orderbook depth where available.

Tests should verify:

* Best price
* Available quantity
* VWAP
* Partial fills
* Slippage
* Price protection

---

# 38. Order-Type Simulation

Execution simulation should cover:

* GTC
* GTD
* FOK
* FAK
* Post-only

Each order type must behave according to its defined execution semantics.

---

# 39. Passive Execution Tests

Passive execution tests should account for:

* Queue uncertainty
* Fill probability
* Cancellation
* Opportunity decay
* Partial fills

A passive order must not be treated as guaranteed to fill.

---

# 40. Multi-Leg Tests

Multi-leg strategies should test:

* Sequential execution
* Parallel execution
* First-leg fill
* Second-leg failure
* Partial completion
* Hedge failure
* Timeout
* Completion

---

# 41. Execution Race Tests

Tests should simulate:

```text id="pjf3v1"
Order Submitted
+
Market Moves
+
Liquidity Changes
+
Order Cancels
+
Another Fill Arrives
```

This helps expose race conditions.

---

# 42. Opportunity Decay Tests

The simulator should test how opportunity quality changes over time.

Research should measure execution viability across multiple time intervals rather than assuming an opportunity remains available.

---

# 43. Capture Probability Tests

Capture probability should be tested against historical opportunities.

The objective is to distinguish:

```text id="t4lqps"
Observed Edge
```

from:

```text id="nd7qgb"
Actually Capturable Edge
```

---

# 44. Latency Sensitivity Tests

Strategies dependent on timing should be tested under different latency assumptions.

Latency values must come from observed or experimentally defined distributions.

The system must not invent a latency advantage.

---

# 45. Historical Replay

Historical replay should reconstruct relevant market conditions at the appropriate event times.

The replay system must avoid future information leakage.

---

# 46. Replay Determinism

Where deterministic inputs are provided, replay should produce deterministic results.

If stochastic execution models are used, the random seed and simulation configuration must be recorded.

---

# 47. Backtest Tests

Backtesting infrastructure itself must be tested.

Test for:

* Correct time ordering
* No look-ahead
* Correct market selection
* Correct resolution
* Correct fees
* Correct position accounting
* Correct PnL
* Correct capital handling

---

# 48. Backtest Regression

Important historical experiments should be reproducible.

Changes to backtesting logic should identify whether previously reported results change.

Unexpected changes must be investigated.

---

# 49. Research Validation

A strategy should not move directly from a successful unit test to live trading.

The validation path is:

```text id="4u2a1q"
Hypothesis
→ Data Validation
→ Backtest
→ Execution Simulation
→ Out-of-Sample Testing
→ Paper Trading
→ Controlled Live
```

---

# 50. Paper Trading

Paper trading should test:

* Real-time data
* Signal generation
* Opportunity detection
* Risk decisions
* Execution simulation
* Portfolio accounting
* Monitoring
* Strategy health

No real order should be submitted.

---

# 51. Paper-to-Live Validation

Before live activation, compare:

```text id="j2o9c5"
Expected
vs
Observed Paper Behavior
```

Relevant comparisons include:

* Signal frequency
* Opportunity frequency
* Fill assumptions
* Latency
* Slippage
* Fees
* PnL
* Drawdown

---

# 52. End-to-End Tests

End-to-end tests should validate the complete logical flow without requiring live capital.

Example:

```text id="7bdb2f"
Market Event
→ Market State
→ Strategy
→ Signal
→ Opportunity
→ Edge
→ Risk
→ Simulated Execution
→ Position
→ PnL
```

---

# 53. External API Testing

External API tests should avoid unnecessary dependence on live production services.

Where appropriate, use:

* Recorded fixtures
* Mock servers
* Controlled test environments
* Deterministic responses

---

# 54. Polymarket Integration Tests

The Polymarket adapter should be tested for:

* Market discovery
* Market metadata
* Orderbook retrieval
* Dynamic market information
* Authentication
* Order construction
* Order submission
* Cancellation
* User events
* Reconciliation

The exact test environment depends on available official infrastructure.

---

# 55. WebSocket Integration Tests

Test:

* Connection
* Subscription
* Event parsing
* Reconnection
* Snapshot recovery
* Duplicate events
* State restoration

---

# 56. Authentication Tests

Authentication-related tests must verify:

* L1 authentication flow
* L2 API credential handling
* Signature handling
* Credential failure
* Invalid authentication
* Credential absence

Secrets must never be embedded in fixtures.

---

# 57. Security Testing

CI should check for accidental exposure of:

* Private keys
* API secrets
* Authentication credentials
* Environment secrets

Secret-scanning mechanisms should be used where available.

---

# 58. Dependency Security

Dependencies should be checked for known security issues where tooling supports it.

A dependency update should not be accepted solely because it is newer.

Compatibility must also be tested.

---

# 59. Database Tests

Database tests should cover:

* Schema validity
* Migrations
* Constraints
* Repository behavior
* Transaction behavior
* Persistence
* Recovery-sensitive state

---

# 60. Migration Testing

Every schema migration should be tested against an appropriate database environment before deployment.

Migration tests should verify:

```text id="v4d3wq"
Current Schema
→ Migration
→ Expected Schema
```

---

# 61. Data Integrity Tests

Tests should detect:

* Duplicate fills
* Orphan orders
* Invalid positions
* Impossible PnL
* Missing market relationships
* Broken foreign-key relationships
* Inconsistent state transitions

---

# 62. Reconciliation Tests

Reconciliation logic should be tested against scenarios such as:

* Exact match
* Missing local fill
* Missing remote fill
* Different quantity
* Different order state
* Unknown order
* Delayed update

---

# 63. Monitoring Tests

Monitoring itself should be tested.

Examples:

* Health state transitions
* Alert generation
* Alert recovery
* Kill-switch alerts
* Data-staleness alerts
* Reconciliation alerts
* Execution-failure alerts

---

# 64. Deployment Tests

Before deployment, CI should verify:

* Build succeeds
* Required artifacts exist
* Configuration is valid
* Database migrations are valid
* Containers start
* Health checks work

---

# 65. Docker Tests

Docker images should be tested for:

* Successful build
* Successful startup
* Correct environment handling
* Correct application health
* No required secrets embedded in the image

---

# 66. CI Pipeline

The initial CI pipeline should follow approximately:

```text id="4c2x1u"
Checkout
   ↓
Install Dependencies
   ↓
Static Checks
   ↓
Type Checks
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Build
   ↓
Security Checks
   ↓
Artifact Validation
```

More expensive research or environment-specific tests may run separately.

---

# 67. Pull Request Gate

A pull request affecting application code should not merge if required CI checks fail.

The exact mandatory check set may evolve as the repository grows.

---

# 68. Strategy Pull Request Gate

Changes to strategy logic should additionally identify:

* Strategy affected
* Research basis
* Expected behavioral change
* Tests affected
* Backtest impact
* Simulation impact

---

# 69. Risk Pull Request Gate

Risk changes require elevated scrutiny.

The PR should identify:

* Risk behavior changed
* Existing tests
* New tests
* Potential live impact
* Rollback plan

---

# 70. Execution Pull Request Gate

Execution changes should identify:

* Order lifecycle impact
* Retry behavior
* Cancellation impact
* Price protection impact
* Fill accounting impact
* Reconciliation impact

---

# 71. Database Pull Request Gate

Database changes should identify:

* Schema changes
* Migration
* Backward compatibility
* Historical-data impact
* Rollback considerations

---

# 72. CI Environment Separation

CI must not have unrestricted access to live trading credentials.

Ordinary CI jobs should operate without live order submission capability.

---

# 73. Live Credentials

Live credentials must never be required for ordinary:

* Unit tests
* Integration tests
* Pull requests
* Build jobs
* Static analysis

---

# 74. Live Deployment Gate

Deployment and live activation must remain separate.

A successful CI pipeline means:

```text id="8o6k8s"
Code Passed Validation
```

It does not mean:

```text id="v5yk8g"
Live Trading Authorized
```

---

# 75. Deployment Promotion

The promotion model should be:

```text id="h2yn8v"
Development
    ↓
CI
    ↓
Paper Deployment
    ↓
Paper Validation
    ↓
Controlled Production Deployment
    ↓
Manual Live Activation
```

---

# 76. Paper Deployment

The paper environment should be the primary deployment validation environment before live activation.

It should validate:

* Application startup
* Data connections
* Strategy operation
* Monitoring
* Execution simulation
* Persistence
* Recovery

---

# 77. Production Deployment

Production deployment must verify:

* Correct version
* Correct configuration
* Correct environment
* Database compatibility
* Monitoring
* Health
* Reconciliation

---

# 78. Live Activation

Live activation requires explicit human authorization.

The agent or CI system must not independently decide to begin live trading.

---

# 79. Post-Deployment Checks

After deployment:

```text id="0s5cgy"
Process Health
→ Data Health
→ Database Health
→ Strategy Health
→ Risk Health
→ Execution Health
→ Reconciliation
```

must be verified before live activation.

---

# 80. Deployment During Live Trading

Changes during active live trading require additional care.

Where a change can affect:

* Execution
* Risk
* Position accounting
* Authentication
* Market data
* Strategy behavior

live trading should be paused or otherwise protected according to the deployment runbook.

---

# 81. Rollback Testing

Rollback should itself be tested.

A rollback plan that has never been exercised should not be treated as fully validated.

---

# 82. Database Rollback

Database rollback requires special caution.

Not every migration can safely be reversed.

Where destructive or irreversible migrations exist, the recovery plan must rely on an appropriate backup or forward migration strategy.

---

# 83. CI Artifacts

CI should preserve relevant artifacts where useful:

* Test reports
* Build artifacts
* Coverage reports
* Research reports
* Simulation outputs
* Deployment metadata

---

# 84. Test Reports

Test failures should identify:

* Test
* Component
* Expected result
* Actual result
* Relevant input
* Relevant version

---

# 85. Coverage

Code coverage should be treated as a quality signal rather than the sole quality metric.

High coverage does not guarantee:

* Correct strategy behavior
* Correct execution
* Safe risk handling
* Realistic simulation

---

# 86. Regression Suite

The project should maintain a regression suite covering previously discovered failures.

Every significant production bug should be evaluated for addition to the regression suite.

---

# 87. Production Incident to Test

When an incident is resolved:

```text id="h2e7s0"
Incident
→ Root Cause
→ Fix
→ Regression Test
```

where practical.

---

# 88. Performance Testing

Performance testing should focus on real bottlenecks.

Relevant scenarios include:

* High market-event rates
* Multiple simultaneous markets
* Multiple active strategies
* High orderbook update frequency
* Concurrent orders

Performance tests should be based on observed or realistic workloads.

---

# 89. Load Testing

Load testing must not accidentally submit real orders.

Production-like load should use:

* Replay
* Simulation
* Mock execution
* Paper environment

---

# 90. Failure Injection

The project should eventually test failures such as:

* WebSocket disconnect
* External feed disconnect
* Database unavailable
* Redis unavailable
* API timeout
* Order timeout
* Reconciliation mismatch
* Process restart

The objective is to verify safe failure behavior.

---

# 91. Recovery Testing

Recovery tests should verify:

```text id="9ph2jp"
Failure
→ Detection
→ Safe State
→ Recovery
→ Reconciliation
→ Readiness
```

---

# 92. Test Environment Reproducibility

Test environments should be reproducible from repository configuration.

Environment-specific behavior should be documented.

---

# 93. Test Fixture Standards

Fixtures should be:

* Small where possible
* Deterministic
* Representative
* Versioned where necessary
* Clearly named
* Independent of live secrets

---

# 94. Historical Dataset Tests

Research datasets used in tests should record:

* Dataset identity
* Source
* Time range
* Market universe
* Transformation version

---

# 95. No Hidden Test Assumptions

Tests must not encode unsupported assumptions as facts.

For example, a test should not assume a permanent BTC lead-lag relationship merely because a strategy currently investigates one.

---

# 96. Testing Hypotheses

Research hypotheses should be tested through experiments rather than converted directly into production rules.

Example:

```text id="f0c5de"
Hypothesis:
External BTC movement leads resolution-source movement.

Test:
Measure relationship historically.

Result:
Determine whether evidence supports the hypothesis.
```

---

# 97. No-Test Bypass

A feature should not bypass tests simply because it is:

* Experimental
* Small
* Internal
* Written by an AI agent
* Intended only for paper trading

The appropriate test level may differ, but important behavior must remain verifiable.

---

# 98. CI Failure Policy

A failed required CI check should block promotion.

Exceptions must be explicit and documented.

---

# 99. Flaky Tests

Flaky tests should not simply be retried indefinitely.

A flaky test should be:

1. Identified.
2. Investigated.
3. Fixed or isolated.
4. Restored to reliable CI coverage.

---

# 100. External Dependency Failures

CI should distinguish:

```text id="9xsl5v"
Project Failure
```

from:

```text id="b5b5ga"
External Dependency Failure
```

External-service instability should not result in false conclusions about application correctness.

---

# 101. Testing Documentation

Each major test suite should document:

* Purpose
* Scope
* Required environment
* Inputs
* Expected behavior
* Known limitations

---

# 102. Agent Testing Rules

AI agents must:

1. Read relevant specifications.
2. Inspect existing tests.
3. Add or update tests for behavioral changes.
4. Run appropriate checks.
5. Report failures honestly.
6. Never claim tests passed when they were not run.
7. Never fabricate test results.

---

# 103. Agent CI Restrictions

AI agents must not:

* Disable required CI checks
* Delete safety tests to make CI pass
* Remove risk tests
* Remove execution tests
* Bypass live-trading gates
* Insert secrets into CI
* Grant themselves live credentials

---

# 104. Research Result Integrity

AI agents must not modify a research result merely to make it look better.

Negative results must remain recorded.

---

# 105. Live Trading Protection

CI/CD must enforce the separation:

```text id="1f3y9x"
CI
≠
Live Trading Authorization
```

and:

```text id="0y2g5w"
Deployment
≠
Live Trading Authorization
```

---

# 106. Final CI/CD Safety Principle

The deployment pipeline must make the safe path easier than the unsafe path.

The default behavior should be:

```text id="8gc8dz"
Code Change
→ Validate
→ Test
→ Deploy to Paper
→ Observe
→ Human Review
→ Explicit Live Activation
```

---

# 107. Explicit Non-Assumptions

This testing and CI/CD system does not assume:

1. Passing tests prove profitability.
2. High code coverage proves correctness.
3. A successful build proves production readiness.
4. Paper trading exactly reproduces live execution.
5. Historical simulation perfectly predicts future fills.
6. Mock APIs behave exactly like production APIs.
7. Low latency is automatically beneficial.
8. A successful deployment authorizes live trading.
9. Automated rollback is always safe.
10. External services will always be available.
11. A strategy that passes tests is automatically validated.
12. CI can replace human authorization for live capital.

---

# 108. Completion Criteria

The testing and CI/CD system is complete when:

* Static validation runs automatically.
* Type checking runs automatically.
* Unit tests exist for critical deterministic logic.
* Integration tests cover important system boundaries.
* State machines are tested.
* Idempotency is tested.
* Risk boundaries are tested.
* Execution behavior is tested.
* Order lifecycle is tested.
* Reconciliation is tested.
* Execution simulation exists for execution-sensitive strategies.
* Historical replay can be tested without live capital.
* Backtest integrity is tested.
* Paper trading can validate the integrated system.
* Regression tests exist for important failures.
* Security checks exist.
* CI blocks invalid changes.
* CI has no unrestricted live trading credentials.
* Deployment is separated from live activation.
* Rollback procedures exist.
* Failure and recovery paths are tested.
* AI agents cannot bypass safety gates.
* Test and research results are reported honestly.

---

# 109. Next Document

The next document is:

```text id="7xq4kc"
docs/agent/70-agent-contract.md
```

That document will define the formal contract between the project and the AI coding agent, including authority boundaries, permitted actions, prohibited actions, evidence requirements, research rules, implementation workflow, live-trading restrictions, and escalation requirements.
