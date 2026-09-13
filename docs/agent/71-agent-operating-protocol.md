# Polymarket Trading Bot

## AI Agent Operating Protocol

**Document:** `docs/agent/71-agent-operating-protocol.md`
**Status:** Approved
**Document Type:** AI Agent Operating Procedure
**Depends On:**

* `docs/00-project-charter.md`
* `docs/01-project-requirements.md`
* `docs/02-system-architecture.md`
* `docs/03-technical-stack.md`
* `docs/04-data-architecture.md`
* `docs/agent/70-agent-contract.md`
* `docs/engineering/60-engineering-standards.md`
* `docs/engineering/61-testing-and-ci-cd.md`

---

# 1. Purpose

This document defines the operating procedure an AI engineering or research agent must follow when working on the Polymarket trading bot.

The contract in `70-agent-contract.md` defines **what the agent is allowed to do**.

This document defines **how the agent should do it**.

The objective is to make agent-assisted development:

* Consistent
* Auditable
* Reproducible
* Safe
* Evidence-driven
* Aligned with the approved architecture

---

# 2. Operating Principle

The agent must never begin implementation by immediately writing code.

The default workflow is:

```text
Understand
    ↓
Inspect
    ↓
Verify
    ↓
Plan
    ↓
Implement
    ↓
Test
    ↓
Review
    ↓
Document
    ↓
Report
```

---

# 3. Source-of-Truth Hierarchy

When deciding how the system should behave, use:

```text
Human Approval
      ↓
Project Charter
      ↓
Approved Architecture
      ↓
Requirements
      ↓
Technical Specifications
      ↓
Agent Contract
      ↓
Agent Operating Protocol
      ↓
Agent Skills
      ↓
Current Implementation
```

The implementation is not automatically the source of truth.

If code contradicts an approved specification, the discrepancy must be identified.

---

# 4. Project State Files

The agent must treat the following files as operational state:

```text
docs/project-state/CURRENT-STATE.md
docs/project-state/DECISIONS.md
docs/project-state/TODO.md
docs/project-state/CHANGELOG.md
```

Their roles are different.

---

# 5. CURRENT-STATE.md

`CURRENT-STATE.md` describes what is currently true about the project.

It should capture:

* Current implementation state
* Completed systems
* Active systems
* Known limitations
* Current environment
* Current strategy status
* Current deployment status
* Current blockers

It should not become a historical log.

---

# 6. DECISIONS.md

`DECISIONS.md` records important decisions.

Examples:

* Technology decisions
* Architecture decisions
* Strategy decisions
* Risk decisions
* Deployment decisions
* Data-model decisions

Decisions should include enough context to understand why they were made.

---

# 7. TODO.md

`TODO.md` records remaining work.

Tasks should distinguish between:

* Required
* Research
* Blocked
* Deferred
* Optional

---

# 8. CHANGELOG.md

`CHANGELOG.md` records meaningful changes.

It should focus on:

* New capabilities
* Behavioral changes
* Important fixes
* Strategy changes
* Infrastructure changes
* Breaking changes

---

# 9. Task Classification

Before beginning work, classify the task.

Primary categories:

```text
Research
Strategy
Market Data
Polymarket Integration
Execution
Risk
Portfolio
Data
Infrastructure
Monitoring
Testing
Security
Documentation
Bug Fix
Refactor
```

A task may belong to multiple categories.

---

# 10. Task Classification Determines Documentation

The category determines which specifications must be read.

For example:

### Research

```text
30-research-and-backtesting
31-execution-simulation
```

### Strategy

```text
20-strategy-framework
21-alpha-strategies
22-signal-fusion-and-edge
40-risk-and-safety
```

### Execution

```text
10-polymarket-integration
12-trading-and-execution
40-risk-and-safety
31-execution-simulation
```

### Infrastructure

```text
02-system-architecture
03-technical-stack
50-development-and-deployment
51-monitoring-and-operations
```

---

# 11. Initial Task Context

Before implementation, the agent should establish:

* What is being requested?
* Why is it being requested?
* Which subsystem is affected?
* Which documents govern it?
* What already exists?
* What constraints apply?
* What is unknown?

---

# 12. Requirement Verification

The agent should identify relevant requirement IDs where available.

Example:

```text
FR-xxx
SR-xxx
ER-xxx
RR-xxx
OR-xxx
NFR-xxx
```

This allows implementation to remain traceable to the requirements.

---

# 13. Existing Code Inspection

Before changing code, inspect:

* Directory structure
* Relevant modules
* Interfaces
* Tests
* Configuration
* Database models
* Existing integrations
* Callers
* Monitoring
* Documentation

Do not assume the repository is empty or matches the intended architecture.

---

# 14. Existing Test Inspection

Before modifying behavior, inspect existing tests.

Determine:

* What is already covered?
* What behavior is considered stable?
* What regressions are already protected?
* What tests must change?

---

# 15. Conflict Check

Before implementation, compare:

```text
Requirement
vs
Specification
vs
Existing Code
vs
Tests
```

If they disagree materially, stop and identify the conflict.

---

# 16. Unknowns

Create an explicit list of unknowns when necessary.

Example:

```text
Known:
Current market API behavior.

Unknown:
Exact behavior under a particular failure condition.
```

Unknowns affecting correctness must be resolved or explicitly accepted before implementation.

---

# 17. Research Before Guessing

If the answer is available through:

* Official documentation
* Official source code
* Project data
* Controlled experiment

the agent should research it instead of guessing.

---

# 18. Research Source Priority

For Polymarket-specific behavior:

```text
Official Documentation
        ↓
Official SDK
        ↓
Official Protocol Repository
        ↓
Verified Runtime Behavior
        ↓
Community Evidence
        ↓
Hypothesis
```

---

# 19. External Repository Research

When using a third-party repository, the agent must identify:

* What was actually implemented?
* What evidence exists?
* What is merely claimed?
* What can be reused?
* What weaknesses exist?

The repository must not become authoritative simply because it contains working code.

---

# 20. Planning

Before significant implementation, produce an internal implementation plan containing:

```text
Goal
Files affected
Dependencies
Behavior changes
Safety implications
Tests
Acceptance criteria
```

---

# 21. Small Tasks

For small, low-risk changes, the planning process may be lightweight.

The same principles still apply.

---

# 22. Large Tasks

For larger changes, break the work into explicit stages.

Example:

```text
Schema
→ Data Layer
→ Business Logic
→ Integration
→ Tests
→ Monitoring
→ Documentation
```

---

# 23. Implementation Order

Prefer dependency order.

For example:

```text
Data Model
    ↓
Repository
    ↓
Domain Logic
    ↓
Strategy
    ↓
Execution
    ↓
API
    ↓
Dashboard
```

---

# 24. Avoid Premature Abstraction

Do not create abstractions merely because they may become useful later.

Abstractions should be justified by:

* Reuse
* Complexity
* Testing
* Clear domain boundaries

---

# 25. Avoid Premature Infrastructure

Do not introduce additional infrastructure merely because the project may eventually need it.

Examples:

* Kafka
* Kubernetes
* Additional databases
* Additional service boundaries

must have demonstrated justification.

---

# 26. Implementation Safety

When modifying trading-related code, identify:

* Can this submit an order?
* Can this change order quantity?
* Can this change price?
* Can this bypass risk?
* Can this change position state?
* Can this affect reconciliation?

If yes, apply elevated validation.

---

# 27. Research Code Safety

Research code must remain isolated from live trading.

A research script must not unexpectedly acquire the ability to submit live orders.

---

# 28. Mode Awareness

The system must explicitly distinguish:

```text
Research
Paper
Live
```

The agent must preserve this separation.

---

# 29. Default Safety

When mode information is missing or invalid, the safer non-live behavior should be preferred.

The exact configuration mechanism is defined elsewhere.

---

# 30. Testing During Implementation

Do not wait until the end of a large implementation to discover basic failures.

Run relevant checks incrementally.

---

# 31. Unit Testing

For deterministic logic, add unit tests alongside implementation.

Priority:

* Financial calculations
* State transitions
* Risk decisions
* Signal calculations
* Market validation
* Data transformations

---

# 32. Integration Testing

Use integration tests for system boundaries.

Examples:

```text
Database
Polymarket adapter
WebSocket processing
Execution adapter
Reconciliation
```

---

# 33. Simulation Testing

Execution-sensitive behavior should be validated through simulation.

The simulation must account for relevant:

* Latency
* Depth
* Slippage
* Fees
* Fill behavior
* Partial fills

---

# 34. Backtest Validation

Strategy changes should trigger appropriate historical validation.

The agent must not assume a code change preserves previous strategy behavior.

---

# 35. Paper Validation

Material strategy or execution changes should be observed in paper mode before controlled live use.

---

# 36. Live Validation

The agent does not decide when paper validation is sufficient for live trading.

Live activation remains a human-controlled decision.

---

# 37. Test Result Classification

Test results should be classified as:

```text
PASS
FAIL
BLOCKED
NOT RUN
NOT APPLICABLE
```

Never describe `NOT RUN` as `PASS`.

---

# 38. Failure Investigation

When a test fails:

1. Reproduce the failure.
2. Identify the affected component.
3. Determine whether the failure is expected.
4. Fix the root cause where possible.
5. Re-run the test.
6. Add regression coverage if appropriate.

---

# 39. Flaky Test Handling

If a test fails intermittently:

* Do not repeatedly rerun it until it passes.
* Record the flakiness.
* Investigate the cause.
* Fix the underlying issue.

---

# 40. Regression Protection

Every significant bug should be considered for regression coverage.

The goal is:

```text
Bug
→ Fix
→ Test
→ Permanent Protection
```

---

# 41. Execution State Verification

After execution-related changes, verify:

```text
Order
→ Fill
→ Position
→ PnL
→ Reconciliation
```

The entire chain should remain internally consistent.

---

# 42. Risk Verification

After risk-related changes, verify:

```text
Signal
→ Edge
→ Risk Decision
→ Execution Permission
```

A risk change should never silently permit an order that was previously blocked.

---

# 43. Data Verification

After data changes, verify:

* Identity
* Timestamps
* Ordering
* Duplicates
* Missing data
* Persistence
* Recovery

---

# 44. Monitoring Verification

New operational behavior should expose appropriate observability where required.

Examples:

* New error states
* New execution states
* New strategy states
* New reconciliation states

---

# 45. Documentation Synchronization

After implementation, determine whether the following changed:

```text
Architecture
Requirements
Technical Stack
Data Model
Strategy
Risk
Deployment
Operations
```

Update the relevant document if necessary.

---

# 46. State Synchronization

At the end of significant work:

### CURRENT-STATE

Update what is now true.

### DECISIONS

Record new approved decisions.

### TODO

Remove completed work and add discovered work.

### CHANGELOG

Record meaningful changes.

---

# 47. Do Not Rewrite History

The agent must not rewrite previous decisions simply because a newer implementation is preferred.

If a decision changes, record:

```text
Previous Decision
New Decision
Reason
Impact
```

---

# 48. Decision Change Protocol

A material decision change should follow:

```text
Old Decision
    ↓
Reason for Reconsideration
    ↓
Evidence
    ↓
Alternative
    ↓
New Decision
    ↓
Impact
```

---

# 49. Research Workflow

For research tasks:

```text
Question
 ↓
Hypothesis
 ↓
Dataset
 ↓
Data Validation
 ↓
Method
 ↓
Experiment
 ↓
Result
 ↓
Interpretation
 ↓
Decision
```

---

# 50. Research Question

The research question should be specific enough to test.

Bad:

```text
Can we make money on BTC markets?
```

Better:

```text
Does movement in an external BTC feed contain predictive information about the market's specified resolution source during a defined pre-resolution window?
```

---

# 51. Hypothesis

The hypothesis must state what relationship is being tested.

It should not contain the conclusion.

---

# 52. Dataset

Record:

* Data source
* Time range
* Markets
* Resolution rules
* Sampling/event structure
* Data version

---

# 53. Data Validation

Before analysis, validate:

* Missing events
* Duplicate events
* Timestamp ordering
* Resolution data
* Market identity
* Feed integrity

---

# 54. Experiment

Record:

* Method
* Parameters
* Version
* Execution assumptions
* Cost assumptions

---

# 55. Result

Report:

* Observed behavior
* Sample size
* Performance
* Costs
* Limitations

Avoid unsupported conclusions.

---

# 56. Interpretation

Distinguish:

```text
Observed
```

from:

```text
Inferred
```

and:

```text
Hypothesized
```

---

# 57. Research Decision

Possible conclusions include:

```text
Supported
Partially Supported
Unsupported
Inconclusive
Requires More Data
```

---

# 58. Strategy Development Workflow

Strategy work follows:

```text
Idea
 ↓
Hypothesis
 ↓
Data
 ↓
Feature
 ↓
Backtest
 ↓
Execution Simulation
 ↓
Out-of-Sample
 ↓
Paper
 ↓
Human Review
 ↓
Controlled Live
```

---

# 59. Strategy Versioning

Every meaningful strategy change should identify:

* Strategy name
* Version
* Parameters
* Code version
* Research basis

---

# 60. Parameter Changes

Do not silently modify production parameters during unrelated code changes.

Parameters should be explicit and versioned where appropriate.

---

# 61. Execution Workflow

Execution-related changes follow:

```text
Intent
 ↓
Validation
 ↓
Risk
 ↓
Order
 ↓
Exchange
 ↓
Order State
 ↓
Fill
 ↓
Position
 ↓
PnL
 ↓
Reconciliation
```

---

# 62. Execution Failure Workflow

When execution fails:

```text
Detect
 ↓
Classify
 ↓
Protect
 ↓
Reconcile
 ↓
Recover
 ↓
Record
```

---

# 63. Unknown Execution State

If exchange state is uncertain:

```text
UNKNOWN
```

must remain a first-class state.

The agent must not convert uncertainty into a convenient assumption.

---

# 64. Reconciliation

After relevant execution failures, reconciliation should determine the authoritative state.

---

# 65. Deployment Workflow

Deployment follows:

```text
Code
 ↓
CI
 ↓
Build
 ↓
Paper Deployment
 ↓
Health Validation
 ↓
Monitoring
 ↓
Production Deployment
 ↓
Human Live Authorization
```

---

# 66. Deployment Verification

After deployment, verify:

* Process health
* Data connections
* Database
* Monitoring
* Strategy state
* Risk state
* Reconciliation

---

# 67. Live Deployment Restrictions

The agent must not treat successful deployment as permission to trade.

---

# 68. Incident Workflow

During incidents:

```text
Detect
 ↓
Contain
 ↓
Investigate
 ↓
Recover
 ↓
Reconcile
 ↓
Verify
 ↓
Document
 ↓
Prevent Recurrence
```

---

# 69. Incident Containment

The first priority is preventing further damage.

Potential actions may include:

* Stop new trading
* Trigger approved kill switch
* Disconnect execution
* Preserve logs
* Preserve state

The agent must operate within approved controls.

---

# 70. Incident Investigation

Investigate:

* Timeline
* Inputs
* Decisions
* Orders
* Fills
* Position changes
* PnL
* Infrastructure
* External dependencies

---

# 71. Root Cause

Classify the root cause where possible:

```text
Code
Data
Strategy
Execution
Risk
Infrastructure
External Dependency
Configuration
Human Action
Unknown
```

---

# 72. Recovery

Recovery must not skip reconciliation.

A process restart does not automatically mean the system is safe to trade.

---

# 73. Post-Incident Update

Important incidents should result in:

* Root-cause record
* Regression test
* Documentation update
* Monitoring improvement
* TODO item if unresolved

---

# 74. Task Completion Protocol

Before completion, verify:

### Requirements

* Relevant requirements satisfied.

### Implementation

* Correct behavior implemented.

### Tests

* Relevant tests executed.

### Safety

* No risk bypass introduced.

### Documentation

* Relevant docs updated.

### State

* Project-state files synchronized.

---

# 75. Final Self-Review

Before reporting completion, the agent should ask:

```text
Did I guess anything?
Did I introduce unsupported assumptions?
Did I change behavior unintentionally?
Did I bypass a safety boundary?
Did I test the important paths?
Did I update the relevant documentation?
Did I report failures honestly?
```

---

# 76. Completion Report

For significant work, report:

```text
Task
Status
Implementation
Files Changed
Tests Run
Results
Research Evidence
Known Limitations
Safety Impact
Documentation Updated
Remaining Work
```

---

# 77. Blocked Task Report

If blocked:

```text
Status: BLOCKED

Blocker:
<description>

Why it matters:
<impact>

Required information:
<missing information>

Next action:
<recommended action>
```

---

# 78. No-Guessing Protocol

If a required value is unknown:

```text
Unknown
```

is a valid result.

The agent should not invent:

* Thresholds
* Fees
* Latency
* API behavior
* Profitability
* Strategy parameters
* Infrastructure guarantees

---

# 79. Evidence Protocol

Every material claim should have an identifiable basis:

```text
Official Source
Project Data
Experiment
Test
Historical Dataset
Approved Decision
```

If no evidence exists, state that clearly.

---

# 80. Strategy Evidence Protocol

Before recommending a strategy for further promotion, the agent should be able to identify:

* Hypothesis
* Data
* Backtest
* Execution assumptions
* Simulation
* Costs
* Risk
* Out-of-sample behavior
* Paper behavior

---

# 81. Capital Safety Protocol

The agent should always assume that capital is scarce research capital.

The objective is not to maximize trade count.

The objective is to maximize the quality of validated opportunities while preserving capital.

---

# 82. No-Trade Preference Under Uncertainty

When required information is missing and the system is expected to make a live trading decision, the safe state is:

```text
NO TRADE
```

unless an approved rule explicitly defines another behavior.

---

# 83. Agent Communication

The agent should communicate:

* Directly
* Precisely
* Honestly
* Without unnecessary confidence

Avoid presenting uncertain claims as facts.

---

# 84. Confidence Language

Prefer:

```text
Confirmed
Supported by evidence
Observed
Likely
Possible
Hypothesis
Unknown
```

Do not use absolute language when the evidence does not justify it.

---

# 85. Operational Simplicity

The agent should prefer solutions that are:

* Simple
* Observable
* Testable
* Reversible
* Maintainable

over solutions that merely appear sophisticated.

---

# 86. Architecture Evolution

Architecture should evolve when evidence demonstrates a need.

The agent should not create:

```text
Microservice
Queue
Cache
Database
Worker
```

without a demonstrated requirement.

---

# 87. Performance Optimization

Optimization follows:

```text
Measure
 ↓
Identify Bottleneck
 ↓
Change
 ↓
Benchmark
 ↓
Verify
```

Do not optimize based solely on intuition.

---

# 88. Dependency Evolution

Dependency upgrades should be handled as engineering changes.

Verify:

* Compatibility
* Tests
* Build
* Runtime behavior
* API changes

---

# 89. External API Evolution

When an external API changes:

1. Verify current behavior.
2. Identify affected components.
3. Update adapter.
4. Update tests.
5. Update documentation.
6. Validate paper environment.
7. Review live impact.

---

# 90. Data Migration Workflow

Data migrations should follow:

```text
Schema Change
 ↓
Migration
 ↓
Test
 ↓
Backup/Recovery Validation
 ↓
Paper Validation
 ↓
Production
```

---

# 91. Security Change Workflow

Security-sensitive changes require:

* Threat consideration
* Test coverage
* Secret handling review
* Deployment impact review

---

# 92. Live Trading Change Workflow

Changes affecting live execution should follow:

```text
Specification
 ↓
Implementation
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Simulation
 ↓
Paper
 ↓
Review
 ↓
Controlled Live
```

---

# 93. Agent Stop Conditions

The agent should stop implementation and request clarification when:

* Requirements conflict.
* A critical API behavior is unknown.
* A security boundary must be weakened.
* A risk limit must change.
* A wallet must change.
* Live capital behavior is unclear.
* A material architecture decision is required.
* Required data does not exist.
* Testing cannot establish correctness.

---

# 94. Agent Escalation Levels

### Level 1: Continue

Minor uncertainty that does not affect correctness or safety.

### Level 2: Research

Information can be verified through available evidence.

### Level 3: Request Decision

A human decision is required.

### Level 4: Stop

Continuing could create material financial, security, or architectural risk.

---

# 95. Operating State Model

The agent's task state should conceptually be:

```text id="2b6f4p"
READY
 ↓
UNDERSTANDING
 ↓
INSPECTING
 ↓
PLANNING
 ↓
IMPLEMENTING
 ↓
TESTING
 ↓
VERIFYING
 ↓
DOCUMENTING
 ↓
COMPLETE
```

Alternative states:

```text
BLOCKED
FAILED
ESCALATED
```

---

# 96. Completion Definition

A task is not complete because code was written.

It is complete when:

```text
Implementation
+
Tests
+
Verification
+
Documentation
+
State Synchronization
```

are appropriately satisfied.

---

# 97. Final Operating Principle

The agent must optimize for **correctness before speed**.

The preferred behavior is:

```text
Know
 ↓
Verify
 ↓
Build
 ↓
Test
 ↓
Measure
 ↓
Document
```

rather than:

```text
Guess
 ↓
Build
 ↓
Hope
```

The agent's purpose is to accelerate the project without weakening its research integrity, financial safety, architectural discipline, or human control.

---

# 98. Completion Criteria

This operating protocol is complete when:

* Task classification is defined.
* Document-reading order is defined.
* Source-of-truth hierarchy is defined.
* Research workflow is defined.
* Implementation workflow is defined.
* Testing workflow is defined.
* Deployment workflow is defined.
* Incident workflow is defined.
* Escalation rules are defined.
* Unknowns are handled explicitly.
* Project-state synchronization is defined.
* Strategy development is evidence-driven.
* Execution changes receive elevated validation.
* Live activation remains human-controlled.
* The agent cannot silently change project authority.
* No-guessing behavior is explicit.
* Completion requires implementation, testing, verification, documentation, and state synchronization.

---

# 99. Next Document

The next document is:

```text
docs/agent/72-agent-skills.md
```

That document will define the reusable skill set the AI agent should use across research, Polymarket integration, market-data analysis, strategy development, backtesting, execution simulation, risk, testing, deployment, monitoring, incident response, and documentation.
