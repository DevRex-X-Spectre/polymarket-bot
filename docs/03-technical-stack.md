# Polymarket Trading Bot

## Technical Stack

**Document:** `docs/03-technical-stack.md`
**Status:** Approved
**Document Type:** Technical Stack Specification
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`

---

# 1. Purpose

This document defines the technology stack and technology-selection rules for the Polymarket Trading Bot.

The purpose is to prevent inconsistent technology choices during implementation and to ensure that AI coding agents use the technologies already selected for the project rather than introducing alternatives without justification.

This document defines:

* Primary programming languages
* Runtime environments
* Polymarket integration technologies
* Data storage technologies
* Research tooling
* Application tooling
* Testing technologies
* Deployment direction
* Technology-selection rules

This document does not define detailed application architecture or database schemas.

---

# 2. Technology Selection Principles

The project follows these principles:

1. Prefer official Polymarket interfaces over unofficial implementations.
2. Prefer currently supported interfaces over archived implementations.
3. Use the simplest technology that satisfies the requirement.
4. Avoid infrastructure complexity that is not justified by the current system.
5. Separate trading runtime requirements from research requirements.
6. Keep high-frequency research data separate from normal application state.
7. Do not introduce a technology merely because it is popular.
8. Do not replace an approved technology without documenting the reason.
9. Avoid dependencies that create unnecessary operational risk.
10. Technology decisions must be based on verified project requirements.

---

# 3. Primary Application Language

## 3.1 TypeScript

**Status:** Primary

TypeScript is the primary language for the trading application and core system.

It is intended for:

* Market ingestion
* Market state
* Strategy orchestration
* Signal processing
* Risk engine
* Execution engine
* Portfolio management
* API services
* Trading runtime
* Dashboard integration
* Operational tooling

The primary application architecture should therefore be designed around TypeScript.

---

# 4. TypeScript Runtime

## 4.1 Node.js

**Status:** Required

Node.js is the runtime for the TypeScript application.

The project should use a current supported Node.js version compatible with the selected Polymarket TypeScript SDK.

The current official Polymarket TypeScript SDK requires:

* Node.js `>=24`
* pnpm `>=10`

The project should therefore standardize on a Node.js version compatible with the current official SDK requirements rather than selecting an older runtime for convenience.

---

# 5. Package Manager

## 5.1 pnpm

**Status:** Required

The project will use pnpm as its JavaScript/TypeScript package manager.

Reasons:

* Compatible with the official Polymarket TypeScript SDK
* Efficient dependency management
* Workspace support
* Suitable for the planned modular repository structure

The project should use a pnpm workspace where multiple internal packages are required.

---

# 6. Python

## 6.1 Python Research Environment

**Status:** Supported

Python is the secondary language for quantitative research and data analysis.

Python may be used for:

* Statistical analysis
* Research notebooks
* Data exploration
* Backtesting experiments
* Quantitative analysis
* Model experimentation
* Dataset preparation
* Research visualization

Python must not become an unnecessary second implementation of the production trading runtime.

The production trading path should remain clearly separated from Python research code unless a specific requirement justifies integration.

---

# 7. Python and TypeScript Boundary

The architecture should maintain a clear distinction:

```text
TypeScript
    ↓
Production Trading System

Python
    ↓
Research / Quantitative Analysis
```

Research results may inform production strategies, but research code must not automatically become production trading code.

A strategy promoted from research to production must be explicitly implemented and tested within the production architecture.

---

# 8. Polymarket Integration

The project must use current supported Polymarket interfaces.

The preferred TypeScript integration is the official Polymarket TypeScript SDK.

The official TypeScript SDK is the primary production integration path.

The official Python SDK may be used where appropriate for research and Python-based workflows.

---

# 9. Official TypeScript SDK

## 9.1 `@polymarket/client`

**Status:** Primary Polymarket TypeScript integration

The official TypeScript SDK repository is `Polymarket/ts-sdk`. The published npm package used by the application is `@polymarket/client` (see D-064).

The official TypeScript SDK provides the primary TypeScript interface for Polymarket functionality.

The project should use the SDK rather than implementing low-level Polymarket protocol behavior unnecessarily.

The SDK currently provides packages for:

* Client functionality (`@polymarket/client`)
* Types
* Internal generated bindings

Internal generated bindings should not be treated as the preferred direct application interface when a supported higher-level client API exists.

Public discovery uses `createPublicClient()`. A `SecureClient` is not constructed until authenticated work is explicitly authorized.

---

# 10. Official Python SDK

## 10.1 `polymarket/py-sdk`

**Status:** Research / Python integration

The official Polymarket Python SDK may be used for:

* Research workflows
* Public data access
* Authenticated account workflows
* Trading-related experiments
* Wallet workflows where appropriate

Production application logic should not be duplicated across TypeScript and Python without a documented reason.

---

# 11. Polymarket API Interfaces

The project will use the appropriate Polymarket interface for each responsibility.

Conceptually:

```text
Gamma API
    ↓
Market Metadata / Discovery

CLOB
    ↓
Trading / Orderbook

CLOB WebSocket
    ↓
Real-Time Market Events

Data API
    ↓
Trades / Positions / Activity

Resolution / Subgraph Data
    ↓
Historical / Resolution / Verification Information
```

The detailed integration rules are defined in:

```text
docs/polymarket/10-polymarket-integration.md
docs/polymarket/11-market-data-and-streaming.md
docs/polymarket/12-trading-and-execution.md
```

---

# 12. Polymarket CLOB

The production trading system must use the current Polymarket CLOB interface.

The production CLOB endpoint is:

```text
https://clob.polymarket.com
```

The project must not build its production trading system around the archived V1 CLOB infrastructure.

The current production environment uses CLOB V2.

---

# 13. Polymarket WebSockets

Real-time market and user events should use the current Polymarket WebSocket infrastructure where appropriate.

The architecture supports:

```text
Market WebSocket
    ↓
Real-Time Market State

User WebSocket
    ↓
Order / Trade State
```

The system should use WebSockets for latency-sensitive event processing rather than relying exclusively on REST polling.

REST remains necessary for initialization, historical data, reconciliation, and recovery.

---

# 14. Real-Time Data

The project may use Polymarket's real-time data infrastructure where appropriate.

The official Rust CLOB client currently provides support for real-time data streams including relevant crypto feeds through its supported feature set.

However, the project must not introduce a second production integration merely because another client exposes similar functionality.

The selected production implementation must be based on the final runtime requirements.

---

# 15. External BTC Data

The BTC strategy requires external BTC market information.

The initial research architecture supports Binance data as an external BTC reference source.

The system must distinguish:

```text
External BTC Market Data
```

from:

```text
Polymarket Resolution Data
```

The external BTC source must not be assumed to be the same source used to resolve a specific Polymarket market.

---

# 16. Chainlink Data

Chainlink-related information is relevant to BTC market research because some Polymarket BTC markets use Chainlink-based resolution mechanisms.

The project must therefore support obtaining the relevant Chainlink data or resolution information where required by the market being analyzed.

The exact integration must be determined by the market's actual resolution specification.

The system must not assume that every BTC market uses the same Chainlink mechanism.

---

# 17. Rust

## 17.1 Rust Status

**Status:** Supported for specialized components

Rust is not the default language for the entire system.

Rust may be used where it provides a demonstrated benefit for:

* High-performance components
* Low-latency processing
* Specialized Polymarket integrations
* Performance-sensitive market-data processing

The current official Polymarket Rust CLOB client is a relevant reference for this capability.

---

# 18. Rust CLOB Client

The official `rs-clob-client-v2` provides a strongly typed asynchronous Rust client for Polymarket's CLOB V2 infrastructure.

It supports functionality including:

* CLOB operations
* WebSockets
* Real-time data
* Heartbeats
* Market data
* Other Polymarket functionality through feature flags

The project should not automatically adopt Rust simply because the client exists.

TypeScript remains the primary production application language unless research or implementation requirements demonstrate that Rust is necessary.

---

# 19. Database

## 19.1 PostgreSQL

**Status:** Primary operational database

PostgreSQL is the primary relational database.

It is intended for:

* Market metadata
* Markets
* Wallets
* Trades
* Orders
* Fills
* Positions
* Signals
* Opportunities
* PnL
* Strategy configuration
* Experiment metadata
* Operational state

PostgreSQL is not intended to be the primary storage format for all high-frequency raw market events.

---

# 20. High-Frequency Research Storage

## 20.1 Parquet

**Status:** Required research format where appropriate

Parquet should be used for high-volume historical and event-level research data where columnar analytical storage is advantageous.

Potential datasets include:

* Orderbook events
* Price changes
* BTC market data
* Chainlink-related data
* Polymarket real-time events
* Backtesting datasets

---

# 21. Analytical Query Engine

## 21.1 DuckDB

**Status:** Research / analytical tooling

DuckDB should be used for analytical workloads over research datasets, particularly Parquet datasets.

It is intended for:

* Dataset exploration
* Historical analysis
* Backtesting support
* Aggregation
* Research queries
* Experiment preparation

DuckDB should not replace PostgreSQL as the operational application database.

---

# 22. Redis

## 22.1 Redis

**Status:** Optional, justified use only

Redis may be used for:

* Short-lived state
* Caching
* Coordination
* Fast lookup
* Transient runtime data

Redis must not become the authoritative source for persistent trading state.

Persistent state that must survive restarts belongs in the appropriate durable storage system.

---

# 23. Application Framework

The production API and application layer may use a lightweight TypeScript framework compatible with the project's runtime.

The specific framework must be selected based on actual application requirements and documented before implementation.

The project should not introduce a heavy application framework where a smaller runtime layer is sufficient.

---

# 24. Dashboard

The dashboard may use a modern TypeScript-based web application framework.

The dashboard is an observability and control surface, not the trading engine.

The dashboard must not contain critical trading logic that is unavailable to the trading runtime.

If the dashboard is unavailable, the trading engine must still enforce its own safety and risk controls.

---

# 25. Monorepo Structure

The project will use a workspace-oriented repository structure.

The current logical structure is:

```text
polymarket-alpha/
├── apps/
│   ├── trader/
│   ├── researcher/
│   ├── dashboard/
│   └── api/
│
├── services/
│   ├── market-ingestion/
│   ├── wallet-ingestion/
│   ├── whale-engine/
│   ├── btc-engine/
│   ├── anomaly-engine/
│   ├── news-engine/
│   ├── strategy-engine/
│   ├── risk-engine/
│   ├── execution-engine/
│   └── portfolio-engine/
│
├── packages/
│   ├── polymarket/
│   ├── market-models/
│   ├── trading-models/
│   ├── strategy-sdk/
│   └── shared/
│
├── research/
│   ├── notebooks/
│   ├── backtests/
│   ├── datasets/
│   └── experiments/
│
├── docs/
│
└── ...
```

This is a logical organization.

It does **not** mean that every directory must become an independently deployed service.

---

# 26. Initial Deployment Model

The initial implementation should avoid premature microservice deployment.

The logical modules may initially run within a smaller number of application processes.

The project should prioritize:

* Correctness
* Reliability
* Testability
* Observability
* Research velocity

before introducing distributed infrastructure.

---

# 27. Containerization

## Docker

**Status:** Recommended

Docker should be used where containerization simplifies:

* Local environment setup
* Database setup
* Redis setup
* Reproducible environments
* Deployment

The project should not use containers merely for abstraction.

---

# 28. Orchestration

## Kubernetes

**Status:** Not part of initial architecture

Kubernetes must not be introduced during the initial development phase.

It adds operational complexity that is not currently justified by the project's scale.

If the system eventually requires Kubernetes, that decision must be supported by a documented scalability or reliability requirement.

---

# 29. Kafka and Distributed Event Streaming

## Kafka

**Status:** Not part of initial architecture

Kafka must not be introduced by default.

The initial system can use direct event processing and appropriate internal queues or streams.

A distributed event platform may be considered later if actual throughput, reliability, or architectural requirements justify it.

---

# 30. CI/CD

The project must use automated testing and build validation before deployment.

The intended pipeline is:

```text
Git Push
    ↓
CI
    ↓
Lint
    ↓
Type Check
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Build
    ↓
Deployment
```

The live trading environment must have an explicit human-controlled activation step.

---

# 31. Version Control

## Git

**Status:** Required

Git is the project's version-control system.

All source code and project documentation should be version controlled.

---

# 32. GitHub

GitHub is the expected repository and collaboration platform.

The repository must contain:

* Source code
* Documentation
* Tests
* Configuration templates
* Research code
* Appropriate project-state files

Secrets must not be committed.

---

# 33. Environment Configuration

Environment-specific configuration must be separated from source code.

At minimum, the system must distinguish:

```text
research
paper
live
```

Configuration must be explicit.

The application must not infer that it should enter live mode merely because live credentials exist.

---

# 34. Secret Management

Sensitive information includes:

* Private keys
* Polymarket API credentials
* Authentication secrets
* Builder credentials where applicable
* Database credentials
* Infrastructure credentials

Secrets must:

* Never be committed to Git
* Never be hardcoded
* Never be written to ordinary logs
* Never be included in documentation
* Never be exposed to research code unnecessarily

---

# 35. Testing Stack

The project must support multiple testing levels.

```text
Unit Tests
    ↓
Integration Tests
    ↓
Simulation Tests
    ↓
Backtests
    ↓
Paper Trading
```

Testing tools should be selected to work naturally with the TypeScript runtime and project structure.

The final testing framework selection belongs to the engineering/testing specification.

---

# 36. Research Tooling

The research environment should support:

* Python
* Jupyter where useful
* Pandas or equivalent analytical tooling
* NumPy or equivalent numerical tooling
* DuckDB
* Parquet
* Statistical libraries where justified
* Visualization tools

Research dependencies should not automatically become production dependencies.

---

# 37. Numerical and Statistical Libraries

Numerical or machine-learning libraries may be added when a documented research requirement exists.

The project must not add machine-learning frameworks simply because the project is described as AI-assisted.

The initial system should prioritize measurable market signals and statistical analysis.

---

# 38. AI in the Technology Stack

AI is an engineering accelerator and research tool.

It is not considered a substitute for:

* Market data
* Statistical validation
* Execution modeling
* Risk controls
* Testing
* Human approval

AI agents may assist with:

* Code generation
* Refactoring
* Research
* Documentation
* Test generation
* Data analysis
* Experiment implementation

AI agents must operate under the project agent contract.

---

# 39. Official vs Unofficial Dependencies

Where Polymarket provides an official supported interface, it should be preferred over an unofficial library.

Unofficial dependencies may only be introduced when:

1. The official interface does not satisfy a documented requirement.
2. The alternative provides a necessary capability.
3. Its maintenance and security risks have been evaluated.
4. The dependency is documented.
5. It does not conflict with the current Polymarket architecture.

---

# 40. Archived Polymarket Libraries

The project must not use archived Polymarket libraries as the foundation of production trading.

This includes legacy V1 integrations that are no longer the current production interface.

If an archived repository is consulted for historical behavior or implementation reference, it must not be interpreted as current production documentation.

---

# 41. Low-Level Protocol Libraries

Low-level Polymarket utilities may be used where required.

However:

```text
High-Level Official SDK
        ↓
Preferred

Low-Level Protocol Utility
        ↓
Only when required
```

The project should not reimplement signing, order encoding, authentication, or protocol behavior that is already correctly supported by official libraries.

---

# 42. Technology Upgrade Policy

A dependency must not be upgraded blindly.

Before upgrading a critical dependency, the agent must determine:

* Current version
* Target version
* Breaking changes
* API changes
* Runtime requirements
* Security implications
* Compatibility with Polymarket
* Test impact

Critical dependency upgrades must be recorded in the project state where appropriate.

---

# 43. Technology Replacement Policy

Replacing an approved technology requires a documented reason.

The decision must consider:

* Current limitations
* Replacement benefits
* Migration cost
* Operational impact
* Security
* Reliability
* Performance
* Compatibility
* Long-term maintenance

An AI agent must not replace a core technology simply because another technology appears newer or more convenient.

---

# 44. Performance Philosophy

Performance optimization must be evidence-driven.

The project must not prematurely optimize based on theoretical latency requirements.

Performance-sensitive areas should be measured.

Potential candidates include:

* Market data processing
* Orderbook processing
* Signal calculation
* Order submission
* Serialization
* Database operations

Only measured bottlenecks should drive significant architectural optimization.

---

# 45. Reliability Philosophy

Reliability is more important than unnecessary complexity.

The system should favor:

* Explicit state
* Durable records
* Reconciliation
* Clear failure handling
* Health checks
* Restart recovery
* Safe defaults

over:

* Excessive distributed services
* Unnecessary infrastructure
* Hidden automation
* Complex abstractions

---

# 46. Cost Philosophy

The project should initially minimize infrastructure cost.

The expected progression is:

```text
Local Development
      ↓
Free / Low-Cost Paper Trading
      ↓
Free / Low-Cost Live Infrastructure
      ↓
Paid Infrastructure Only When Justified
```

Infrastructure must be upgraded when reliability, latency, storage, or scaling requirements justify the cost.

The project must not assume that free infrastructure is suitable for every future stage.

---

# 47. Initial Hosting Direction

The researched deployment direction is:

```text
Development
    ↓
Local Machine

Paper Trading
    ↓
Render Free Tier where suitable

Tiny Live Trading
    ↓
Oracle Cloud Always Free VM where suitable
```

Render's free environment has limitations that make it unsuitable as an unquestioned permanent live-trading runtime.

The Oracle Always Free VM is the preferred researched direction for a small continuously running live trading process, subject to actual availability and operational validation.

The deployment specification will define the exact architecture and limitations.

---

# 48. Free Infrastructure Constraints

The project must account for the limitations of free infrastructure.

Known constraints include:

* Compute limitations
* Memory limitations
* Instance restarts
* Service sleeping behavior
* Ephemeral storage
* Database retention limitations
* Availability constraints

Free infrastructure must therefore not be treated as equivalent to dedicated production infrastructure.

---

# 49. Production Runtime Principle

The live trading runtime must prioritize:

1. Persistent state
2. Reliable connectivity
3. Automatic recovery
4. Monitoring
5. Risk enforcement
6. Reconciliation
7. Safe restart behavior

The system must not depend on a developer's personal computer remaining powered on.

---

# 50. Technology Decision Matrix

| Area                          | Selected Direction    | Status                    |
| ----------------------------- | --------------------- | ------------------------- |
| Primary language              | TypeScript            | Approved                  |
| Production runtime            | Node.js               | Approved                  |
| Package manager               | pnpm                  | Approved                  |
| Research language             | Python                | Approved                  |
| Operational DB                | PostgreSQL            | Approved                  |
| Research storage              | Parquet               | Approved                  |
| Research analytics            | DuckDB                | Approved                  |
| Cache/transient state         | Redis                 | Conditional               |
| Containerization              | Docker                | Recommended               |
| Version control               | Git                   | Required                  |
| Repository                    | GitHub                | Approved                  |
| Polymarket TS integration     | Official TS SDK       | Primary                   |
| Polymarket Python integration | Official Python SDK   | Research                  |
| Polymarket trading            | Current CLOB V2       | Required                  |
| Real-time market data         | Polymarket WebSockets | Required where applicable |
| BTC external data             | External BTC feed     | Required for BTC strategy |
| Rust                          | Specialized use       | Conditional               |
| Kubernetes                    | Not initially         | Deferred                  |
| Kafka                         | Not initially         | Deferred                  |

---

# 51. Technology Decision Rules for Agents

Before introducing a new technology, an AI agent must answer:

1. Which requirement requires it?
2. Why can the existing stack not satisfy that requirement?
3. What complexity does it introduce?
4. Does it affect the trading path?
5. Does it introduce a new operational dependency?
6. Does it require additional credentials?
7. Does it affect system reliability?
8. Is it required now or only potentially useful later?
9. Can the requirement be solved more simply?
10. Does the change require a project decision?

If the answer is unclear, the agent must not introduce the technology autonomously.

---

# 52. Technology That Is Explicitly Deferred

The following technologies are not part of the initial stack unless later requirements justify them:

* Kubernetes
* Kafka
* Large distributed event platforms
* Complex service meshes
* Unnecessary cloud orchestration
* Multiple production databases
* Unnecessary machine-learning infrastructure
* GPU infrastructure
* Paid infrastructure without demonstrated need

---

# 53. Implementation Priority

Technology selection should follow this order:

```text
Correctness
    ↓
Reliability
    ↓
Testability
    ↓
Observability
    ↓
Execution Quality
    ↓
Performance
    ↓
Scalability
```

Scalability must not be optimized ahead of correctness and reliability for the initial system.

---

# 54. Technology Source of Truth

This document defines the approved technology direction.

If implementation code introduces a different technology, the agent must determine whether:

* The change is already approved elsewhere
* The change is a local implementation detail
* The change requires a documented decision

The agent must not silently replace the project's approved stack.

---

# 55. Completion Criteria

The technical stack specification is considered satisfied when:

* Primary languages are defined.
* Runtime requirements are defined.
* Polymarket integration direction is defined.
* Research tooling is defined.
* Operational storage is defined.
* High-frequency research storage is defined.
* Deployment direction is defined.
* Deferred infrastructure is identified.
* Secret handling requirements are defined.
* AI agent technology-selection rules are defined.
* No archived Polymarket V1 integration is treated as the production foundation.

---

# 56. Next Document

The next document is:

```text
docs/04-data-architecture.md
```

That document will define the project's data model, storage boundaries, entities, event structures, relationships, data lifecycle, historical datasets, research datasets, and persistence rules.
