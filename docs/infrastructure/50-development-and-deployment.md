# Polymarket Trading Bot

## Development and Deployment

**Document:** `docs/infrastructure/50-development-and-deployment.md`
**Status:** Approved
**Document Type:** Development and Deployment Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/polymarket/10-polymarket-integration.md`
* `docs/polymarket/12-trading-and-execution.md`
* `docs/risk/40-risk-and-safety.md`

---

# 1. Purpose

This document defines how the Polymarket trading bot is developed, packaged, deployed, promoted, and operated across environments.

The primary goals are:

* Reproducible development
* Safe deployment
* Clear environment separation
* Low infrastructure cost
* Controlled transition from research to paper trading
* Controlled transition from paper trading to live trading
* Reliable recovery
* Explicit live-trading authorization

The infrastructure must support the research-first philosophy of the project.

---

# 2. Infrastructure Principles

The project follows these principles:

1. Start with the simplest architecture that satisfies the requirements.
2. Prefer free infrastructure during development and validation.
3. Do not introduce infrastructure complexity without demonstrated need.
4. Keep research separate from live trading.
5. Keep live trading behind explicit controls.
6. Treat deployment as a controlled engineering process.
7. Make deployments reproducible.
8. Never treat infrastructure availability as a substitute for risk controls.
9. Preserve operational state across restarts where required.
10. Prefer observable failure over silent failure.

---

# 3. Environment Model

The project has three primary operating modes:

```text
RESEARCH
PAPER
LIVE
```

These are logical operating modes, not merely environment variable values.

---

# 4. Research Environment

The research environment is used for:

* Data analysis
* Dataset construction
* Feature development
* Backtesting
* Execution simulation
* Strategy experimentation

It must not have live trading permissions.

---

# 5. Paper Environment

The paper environment uses live or recent market data while executing simulated orders.

It is used to validate:

* Signal generation
* Market data handling
* Execution logic
* Risk decisions
* Monitoring
* Strategy behavior

No real capital is deployed.

---

# 6. Live Environment

The live environment can submit real orders.

Live mode requires:

* Explicit activation
* Correct credentials
* Valid wallet configuration
* Valid strategy configuration
* Working market data
* Working risk controls
* Working monitoring
* Verified kill switch

Live mode must never be the default.

---

# 7. Environment Separation

Research, paper, and live environments must have clear boundaries.

At minimum:

```text id="h1v6c9"
Research
   X
   ↓
Live Trading

Paper
   X
   ↓
Live Trading
```

The ability to submit live orders must exist only in the controlled live execution boundary.

---

# 8. Local Development

Local development is the primary environment during initial implementation.

The developer machine should support:

* Node.js
* pnpm
* Python
* PostgreSQL
* Redis where required
* DuckDB
* Docker where useful
* Git

The exact installation method is environment-specific.

---

# 9. Runtime Requirements

The current TypeScript runtime direction is:

* Node.js `>=24`
* pnpm `>=10`

These versions follow the current official Polymarket TypeScript SDK requirements.

Version upgrades must be validated before changing the project's supported versions.

---

# 10. Python Environment

Python is primarily used for:

* Research
* Statistical analysis
* Backtesting
* Dataset processing
* Execution simulation

Python dependencies must be isolated from the TypeScript runtime.

A reproducible Python environment should be maintained.

---

# 11. TypeScript Application

The main trading/application layer uses TypeScript.

Responsibilities include:

* Polymarket integration
* Market data ingestion
* Strategy runtime
* Signal processing
* Risk
* Execution
* Portfolio state
* Monitoring/API integration

The implementation should remain modular without prematurely becoming a distributed microservice system.

---

# 12. Rust Components

Rust is an available option for specialized components where evidence justifies it.

Potential use cases include:

* Performance-sensitive execution
* Specialized data processing
* Low-level market-data components
* Other measured bottlenecks

Rust must not be introduced simply because it is technically capable of solving a problem.

---

# 13. Initial Runtime Architecture

The initial system should favor:

```text id="r4c8n2"
TypeScript Application
+
Python Research
+
PostgreSQL
+
Redis where justified
+
Parquet
+
DuckDB
```

rather than multiple independent production services.

---

# 14. Initial Process Boundary

The initial deployment may use a small number of processes.

Conceptually:

```text id="m7q3x8"
Trading Engine
API / Dashboard
Database
Redis
Research Environment
```

The exact process arrangement may evolve after operational requirements are demonstrated.

---

# 15. No Premature Microservices

The project should not initially introduce:

* Kubernetes
* Kafka
* Complex service meshes
* Large distributed infrastructure
* Multiple independently deployed strategy services

unless the system demonstrates a concrete need.

---

# 16. Docker

Docker should be used where it improves reproducibility and deployment consistency.

Potential containers include:

```text id="x6m2q9"
Bot
API
PostgreSQL
Redis
```

Research tooling may use a separate environment.

---

# 17. Container Principle

A container must have:

* Explicit dependencies
* Explicit configuration
* Predictable startup behavior
* Health checks where appropriate
* No embedded secrets
* No reliance on ephemeral local state for critical persistence

---

# 18. Persistent Data

Critical state must not depend on an ephemeral application filesystem.

Important persistent information includes:

* Database state
* Orders
* Fills
* Positions
* PnL
* Strategy state
* Experiment metadata
* Audit records

---

# 19. Research Storage

High-frequency research data should primarily use:

```text id="k9m4x7"
Parquet
+
DuckDB
```

PostgreSQL should remain focused on structured application and metadata state.

---

# 20. PostgreSQL

PostgreSQL is the primary structured database.

It should store, where applicable:

* Markets
* Market families
* Wallets
* Trades
* Positions
* Signals
* Opportunities
* Orders
* Fills
* Fees
* PnL
* Strategy metadata
* Experiment metadata
* Risk events
* Operational state

---

# 21. Redis

Redis may be used for:

* Short-lived state
* Caching
* Coordination
* Fast transient data

Redis must not become the authoritative source for critical portfolio state unless explicitly designed and justified.

---

# 22. Environment Configuration

Configuration must be separated from source code.

Examples include:

* Runtime mode
* API endpoints
* Database connection
* Redis connection
* Strategy configuration
* Risk configuration
* Logging configuration

Secrets must be handled separately.

---

# 23. Secrets

Secrets include:

* Private keys
* Polymarket API credentials
* Builder credentials where applicable
* Database credentials
* Other authentication secrets

Secrets must not be committed to Git.

---

# 24. Secret Storage

Local development may use a secure local secret mechanism appropriate to the environment.

Hosted environments must use the hosting provider's protected secret/configuration mechanism where available.

The exact provider implementation must not be hardcoded into application logic.

---

# 25. Secret Exposure

Secrets must never be:

* Printed in logs
* Included in exceptions
* Returned through API responses
* Stored in research datasets
* Included in screenshots or reports
* Sent to AI agents unnecessarily
* Committed to repositories

---

# 26. Wallet Protection

The trading wallet is a privileged security boundary.

The live wallet must be explicitly configured.

The application must not silently switch wallets based on environment or strategy configuration.

---

# 27. Development Wallet

Development and testing should use an appropriate non-production wallet where wallet interaction is required.

Production credentials must not be used for routine local experimentation.

---

# 28. Git Workflow

Git is the source-control system.

The repository should preserve:

* Source code
* Documentation
* Configuration templates
* Tests
* Research code
* Migration files
* Infrastructure definitions

Secrets and generated sensitive artifacts must remain excluded.

---

# 29. Branching

The project should use a simple branching model appropriate to its size.

The initial workflow may be:

```text id="v2p8m4"
main
  ↑
feature / fix
```

More complex branching should only be introduced if development scale requires it.

---

# 30. Pull Requests

Changes affecting important system behavior should be reviewable.

Particularly important changes include:

* Risk
* Execution
* Wallet handling
* Market-data interpretation
* Strategy logic
* Database schema
* Deployment
* Security

---

# 31. Documentation Changes

Code changes that materially change system behavior must update the relevant documentation.

Examples:

```text id="q4m8z2"
Execution Change
→
12-trading-and-execution.md

Risk Change
→
40-risk-and-safety.md

Architecture Change
→
02-system-architecture.md
```

---

# 32. Source of Truth

Approved documentation defines intended behavior.

Code defines the current implementation.

If they disagree:

```text id="w7m3q9"
Code ≠ Approved Specification
```

the discrepancy must be identified and resolved.

The agent must not silently reinterpret the specification.

---

# 33. Build Process

A deployment build should:

1. Install dependencies.
2. Validate dependency resolution.
3. Run static checks.
4. Run tests.
5. Build the application.
6. Validate required configuration.
7. Produce the deployment artifact.

---

# 34. TypeScript Checks

The TypeScript application should run appropriate:

* Type checking
* Linting
* Unit tests
* Integration tests
* Build validation

before deployment.

---

# 35. Python Checks

Research code should run appropriate:

* Unit tests
* Data-validation tests
* Backtest regression tests
* Statistical validation checks

where applicable.

---

# 36. Database Migrations

Database schema changes must use versioned migrations.

The deployment process must not depend on manually editing production tables.

---

# 37. Migration Safety

Migrations affecting important production state must be reviewed before execution.

Destructive migrations require explicit attention to:

* Existing data
* Recovery
* Rollback strategy
* Compatibility

---

# 38. CI/CD

The project should use GitHub-based CI/CD.

The basic pipeline should validate changes before deployment.

Conceptually:

```text id="t5n9x3"
Git Push
   ↓
CI
   ↓
Tests
   ↓
Build
   ↓
Validation
   ↓
Deployment
```

---

# 39. Continuous Integration

CI should verify at minimum:

* Dependency installation
* Type checking
* Tests
* Build
* Relevant linting
* Documentation/configuration consistency where practical

---

# 40. Deployment Promotion

Deployment should progress through environments:

```text id="c8q4m7"
Development
   ↓
Paper
   ↓
Controlled Live
```

Live deployment must not be an automatic consequence of a successful development build.

---

# 41. Automatic Deployment

Automatic deployment may be used for non-live environments.

For example:

```text id="g6m2x9"
GitHub
  ↓
Render
  ↓
Paper / API
```

Live trading requires an explicit activation step.

---

# 42. Render

Render is part of the project's initial $0 infrastructure strategy.

It can provide:

* Free web services
* GitHub-based deployment
* API/dashboard hosting
* Development/paper infrastructure

---

# 43. Render Free-Tier Constraints

The current research identified important limitations:

* Free web services have limited compute.
* Free services may spin down after inactivity.
* Free services have ephemeral filesystems.
* Free PostgreSQL is temporary and limited.
* Free background workers are not available.
* Free instances may restart.

Therefore, Render free infrastructure must not be treated as guaranteed always-on trading infrastructure.

---

# 44. Render WebSocket Behavior

Current Render behavior allows free services to remain active while receiving inbound WebSocket messages.

This must not be treated as a guaranteed mechanism for keeping the trading engine continuously alive.

The bot must remain safe if the service restarts or sleeps.

---

# 45. Render Use

Render is appropriate for:

* Development
* Paper trading
* API
* Dashboard
* Non-critical services
* Early operational testing

It is not the preferred permanent home for a continuously running live trading engine.

---

# 46. Oracle Always Free

Oracle Cloud Always Free is the preferred candidate for a persistent $0 compute environment once live-like operation requires a continuously running process.

Current Always Free capacity includes:

* Ampere A1 compute allocation
* Up to the documented Always Free OCPU and memory allowance
* Block storage allocation
* Object storage allocation
* Significant outbound transfer allowance

Actual availability may depend on Oracle capacity and account/region conditions.

---

# 47. Oracle Always Free Constraints

Oracle Always Free has operational constraints.

The project must account for:

* Host capacity
* Possible resource reclamation under Oracle's idle-resource policy
* Region availability
* Account requirements
* Operational maintenance

The bot must therefore still have recovery and health mechanisms.

---

# 48. Oracle Deployment

The proposed live-oriented $0 deployment is:

```text id="h3q7m2"
Oracle Always Free VM
        │
        ├── Docker
        ├── Trading Engine
        ├── API
        ├── PostgreSQL
        ├── Redis
        └── Monitoring
```

The exact process layout may change as the implementation evolves.

---

# 49. Render + Oracle

A later architecture may use both:

```text id="p8m4x7"
                 GitHub
                    │
              CI / Deployment
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
       Render             Oracle VM
          │                   │
    API / Dashboard      Trading Engine
                              │
                              ↓
                         Persistent DB
```

The division of responsibilities must remain explicit.

---

# 50. $0-First Deployment Path

The current deployment strategy is:

```text id="v4q9m2"
Phase 0
Local Development
$0
    ↓
Phase 1
Render Free
Paper Trading
$0
    ↓
Phase 2
Render Free
Extended Paper Trading
$0
    ↓
Phase 3
Oracle Always Free
Controlled Live Trading
$0
    ↓
Phase 4
Oracle + Render
Growing System
$0 where practical
    ↓
Phase 5
Paid Infrastructure
Only when justified
```

This is an infrastructure plan, not a guarantee that every free-tier service will remain available indefinitely.

---

# 51. Docker Compose

For local development, Docker Compose may be used to run:

* PostgreSQL
* Redis
* Supporting services

The trading application may run directly during development for faster iteration.

---

# 52. Production Containers

Production deployment should use immutable application artifacts where practical.

The runtime should not depend on manually modified files inside the server.

---

# 53. Process Restart

The production environment must restart failed processes automatically where the hosting environment supports it.

Restarting the process is not sufficient by itself.

After restart, the application must:

```text id="c4m8q2"
Load State
   ↓
Reconnect
   ↓
Reconcile
   ↓
Validate
   ↓
Resume Only If Safe
```

---

# 54. Startup Validation

On startup, the bot should validate:

* Environment
* Runtime configuration
* Database connectivity
* Required tables
* Market-data connectivity
* External feed connectivity
* Wallet identity where applicable
* Risk configuration
* Trading mode
* Credential availability
* System health

---

# 55. Startup Live Protection

A process restart must not automatically turn a previously running paper environment into live trading.

Live mode must remain explicitly configured.

---

# 56. Health Checks

The system should expose health information for:

* Process
* Database
* Redis
* Market data
* External data
* Execution
* Risk
* Portfolio reconciliation

---

# 57. Liveness vs Readiness

The deployment should distinguish:

### Liveness

Is the process running?

### Readiness

Is the system safe and sufficiently healthy to perform its configured function?

A running process is not necessarily ready to trade.

---

# 58. Trading Readiness

A live trading engine should only become ready after:

```text id="n9m4x7"
Data Healthy
+
Risk Healthy
+
Execution Healthy
+
Portfolio Reconciled
+
Configuration Valid
```

---

# 59. Monitoring

Monitoring must cover:

### Application

* Process health
* Errors
* Restarts

### Data

* Feed freshness
* WebSocket connection
* Missing events
* External feed status

### Trading

* Signals
* Orders
* Fills
* Rejections
* PnL

### Risk

* Exposure
* Risk decisions
* Kill switch state

### Infrastructure

* CPU
* Memory
* Disk
* Network
* Database health

---

# 60. Logging

Logs should be structured where practical.

Important events should include:

* Timestamp
* Component
* Event type
* Market
* Strategy
* Correlation ID
* Result
* Error category

Sensitive values must be redacted.

---

# 61. Correlation IDs

Trading-related operations should have traceable identifiers.

For example:

```text id="j6m8q2"
Signal ID
   ↓
Order Intent ID
   ↓
Order ID
   ↓
Fill ID
   ↓
Position Update
```

This enables operational debugging.

---

# 62. Deployment Audit

Each deployment should record:

* Git commit
* Build version
* Deployment time
* Environment
* Configuration version
* Migration version

This allows operational events to be connected to the deployed code.

---

# 63. Rollback

The deployment process must support reverting to a known-good application version.

Rollback should be used when:

* Deployment introduces critical errors.
* Trading behavior changes unexpectedly.
* Data processing becomes invalid.
* Risk controls fail.
* Execution becomes unreliable.

---

# 64. Rollback and Trading State

Application rollback must not blindly roll back persistent trading state.

Database and exchange state are independent of application binaries.

After rollback:

```text id="q5m8v2"
Application Restored
   ↓
Exchange Reconciliation
   ↓
Database Validation
   ↓
Risk Validation
   ↓
Resume / Pause
```

---

# 65. Deployment During Live Trading

Code deployments should not assume that live orders disappear.

Before deployment, the operator must understand:

* Existing orders
* Existing positions
* Current execution state
* Reconciliation requirements

---

# 66. Safe Deployment Principle

If deployment changes:

* Order behavior
* Risk behavior
* Wallet handling
* Market interpretation
* Position accounting

the change should receive additional validation before live activation.

---

# 67. Database Backups

Persistent production data should have an appropriate backup strategy.

The strategy must account for:

* Database snapshots
* Recovery testing
* Retention
* Storage availability

The exact backup mechanism depends on the selected infrastructure.

---

# 68. Recovery Testing

A backup that has never been restored should not be treated as proven recovery capability.

Recovery procedures should be tested periodically once the production environment exists.

---

# 69. Data Retention

Structured operational data should be retained according to project requirements.

High-frequency research data may use separate retention policies from operational trading records.

The project should not delete research evidence merely because it is old.

---

# 70. Time Synchronization

Trading systems depend on accurate timestamps.

Production hosts should maintain reliable system time synchronization.

Timestamp errors can affect:

* Lead-lag analysis
* Latency measurement
* Opportunity detection
* Order timing
* Audit logs

---

# 71. Network Reliability

The trading engine must detect connectivity failures.

Failures should result in safe behavior rather than indefinite blind retries.

---

# 72. WebSocket Recovery

The market-data layer must support:

```text id="r7m3q8"
Disconnect
 ↓
Reconnect
 ↓
Restore Subscription
 ↓
Refresh State
 ↓
Validate
```

A reconnect without state validation is insufficient.

---

# 73. External Feed Recovery

External BTC feeds should have explicit health state.

If an external feed required by a strategy becomes unavailable, that strategy should stop generating live orders rather than guessing the missing data.

---

# 74. Deployment Modes

The deployment should explicitly identify:

```text id="z8m4q1"
RESEARCH
PAPER
LIVE
```

The application should fail safely if an invalid mode is configured.

---

# 75. Configuration Validation

Configuration validation should happen before runtime initialization.

Invalid values should cause startup failure rather than silent fallback.

---

# 76. No Silent Defaults for Safety

Safety-critical configuration must not silently fall back to arbitrary values.

If a required risk or execution configuration is missing:

```text id="x4m7q9"
FAIL CLOSED
```

where practical.

---

# 77. Development vs Production Configuration

Development configuration must not accidentally inherit production credentials.

Environment-specific secrets and configuration must remain separate.

---

# 78. Production Access

Production access should be limited to the necessary operators and services.

The bot should use the minimum permissions required for each integration.

---

# 79. Builder Infrastructure

Builder attribution or relayer infrastructure may be added later where required.

It is not part of the initial core runtime unless the project explicitly adopts it.

---

# 80. Gasless / Relayer Features

Gasless and relayer functionality remain optional infrastructure components.

They must not be introduced into the core deployment simply because the official ecosystem supports them.

---

# 81. Infrastructure Cost Principle

The project prioritizes:

```text id="m9q3x7"
$0
  ↓
Minimal Paid Resources
  ↓
Scale Only When Justified
```

Infrastructure spending must follow demonstrated operational need.

---

# 82. Scaling

Scaling decisions must be based on evidence such as:

* CPU saturation
* Memory pressure
* Database load
* WebSocket volume
* Market coverage
* Strategy count
* Execution latency
* Research workload

Scaling must not be based solely on anticipated future traffic.

---

# 83. No Premature Scaling

The project should not introduce:

* Kubernetes
* Kafka
* Distributed databases
* Complex autoscaling
* Multiple regions

until actual system requirements justify them.

---

# 84. Deployment Failure

If deployment fails:

```text id="x2m8q6"
Do Not Force Production
```

The deployment should remain in the previous known-good state where possible.

---

# 85. Live Deployment Gate

A live deployment should require verification of:

* Build
* Tests
* Configuration
* Risk
* Execution
* Data
* Database migrations
* Monitoring
* Wallet identity

---

# 86. Manual Live Activation

Even after deployment, live trading should require explicit activation.

Deployment and live trading are separate actions.

```text id="n7q4m2"
Deploy Code
    ≠
Activate Live Trading
```

---

# 87. Operational Runbook

The infrastructure should eventually include procedures for:

* Startup
* Shutdown
* Deployment
* Rollback
* Restart
* Reconciliation
* Kill switch
* Database recovery
* WebSocket recovery
* External feed recovery
* Credential rotation

These procedures belong in operational documentation as implementation matures.

---

# 88. Agent Deployment Rules

AI agents may:

* Modify Docker configuration.
* Improve CI pipelines.
* Fix deployment bugs.
* Add health checks.
* Update infrastructure documentation.
* Test deployment processes.

AI agents may not independently:

* Activate live trading.
* Change production wallet.
* Expose credentials.
* Disable safety checks.
* Increase risk limits.
* Deploy unreviewed live execution changes.

---

# 89. Infrastructure Decision Rules

When evaluating a new infrastructure component, ask:

1. What concrete problem does it solve?
2. Is the problem measurable?
3. Can the existing stack solve it?
4. What reliability does it add?
5. What failure modes does it introduce?
6. What does it cost?
7. Does it increase operational complexity?
8. Is it necessary now?

If the answer does not justify the additional complexity, defer the component.

---

# 90. Explicit Non-Assumptions

This deployment architecture does not assume:

1. Render free services are permanently always-on.
2. Render free PostgreSQL is suitable as permanent production storage.
3. Oracle Always Free capacity is guaranteed in every region.
4. Free infrastructure is equivalent to paid production infrastructure.
5. A process restart automatically restores safe trading state.
6. WebSocket reconnection automatically restores correct market state.
7. Deployment rollback automatically restores database state.
8. A running process is necessarily ready to trade.
9. More infrastructure automatically improves trading performance.
10. Kubernetes or Kafka are required for the initial system.
11. Live trading should automatically resume after deployment.
12. Free infrastructure will remain unchanged indefinitely.

---

# 91. Completion Criteria

The development and deployment system is complete when:

* Research, paper, and live modes are separated.
* Local development is reproducible.
* Node.js and pnpm versions are defined.
* Python research environment is isolated.
* Docker support exists where useful.
* PostgreSQL is persistent.
* Research data uses Parquet/DuckDB appropriately.
* Secrets are separated from source code.
* Git workflow is established.
* CI validates changes.
* Database migrations are versioned.
* Non-live deployment can be automated.
* Live activation is manual.
* Health checks exist.
* Liveness and readiness are distinguished.
* Trading readiness requires validated system state.
* Deployment versions are traceable.
* Rollback is possible.
* Persistent state is protected from application rollback.
* WebSocket recovery is implemented.
* External feed recovery is implemented.
* Kill-switch behavior is supported.
* Infrastructure monitoring exists.
* Recovery procedures are documented.
* No unnecessary distributed infrastructure is introduced.
* The system can begin with $0 infrastructure where practical.
* Live trading remains explicitly controlled.

---

# 92. Next Document

The next document is:

```text
docs/infrastructure/51-monitoring-and-operations.md
```

That document will define system observability, trading telemetry, strategy health monitoring, alerts, operational dashboards, incident handling, reconciliation monitoring, uptime/reliability tracking, and production runbooks.
