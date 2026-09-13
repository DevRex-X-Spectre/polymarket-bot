# Polymarket Bot Development Continuation Prompt

You are continuing implementation of the existing Polymarket Trading System.

Do **not** restart the project.

Do **not** redo completed work unless a concrete defect is discovered.

The current Gamma discovery implementation has been reviewed and accepted.

---

# 1. Current Project State

The following work is complete:

* TODO-008: Gamma Market Discovery
* TODO-009: Market Identity
* Public Polymarket TypeScript SDK integration
* `createPublicClient()` integration
* Gamma market discovery
* Gamma event discovery
* Market/event normalization
* Market identity preservation
* Event identity preservation
* YES/NO token identity preservation
* Condition ID preservation
* Slug preservation
* Gamma lifecycle normalization
* Discovery/tradability separation
* No `SecureClient`
* No order-placement APIs
* Opt-in live Gamma network test
* Existing typecheck/build/tests passing

The next approved task is:

```text
TODO-010: Resolution Metadata Extraction
```

The project must continue in dependency order.

---

# 2. Critical Requirement: Official Polymarket Agent Skills

The official Polymarket Agent Skills repository is:

```text
https://github.com/Polymarket/agent-skills
```

This is the official Polymarket repository for agent-specific integration knowledge.

It contains:

```text
SKILL.md
authentication.md
bridge.md
ctf-operations.md
gasless.md
market-data.md
order-patterns.md
websocket.md
```

The official repository describes `SKILL.md` as the entry point and the remaining files as reference material that should be loaded when deeper functionality is required.

Reference:

```text
https://github.com/Polymarket/agent-skills
```

The skill repository is part of the implementation knowledge layer for this project.

---

# 3. Do Not Guess Polymarket Behavior

This is a non-negotiable requirement.

When implementing anything involving Polymarket, do not rely on:

* model memory
* assumptions
* old tutorials
* random GitHub repositories
* outdated SDK examples
* copied code
* historical Polymarket behavior

when the official Agent Skill or official current documentation provides the information.

The rule is:

```text
Official Agent Skill
        +
Current Official Polymarket Documentation
        +
Current Official SDK/API
        ↓
Implementation Decision
```

Not:

```text
Model Memory
        ↓
Implementation
```

If the applicable official skill is unavailable, **do not guess**.

---

# 4. How to Use the Official Skill Repository

Before implementing Polymarket functionality, determine which skill applies.

Use the repository progressively.

## Step 1 — Read SKILL.md first

Start with:

```text
Polymarket/agent-skills/SKILL.md
```

This is the entry point.

Do not immediately load every reference file into context.

The official repository intentionally uses progressive disclosure.

---

# 5. Skill Selection Rules

Use the following mapping.

### General Polymarket integration

Read:

```text
SKILL.md
```

### Authentication

Read:

```text
authentication.md
```

Required for:

* L1 authentication
* L2 authentication
* API credentials
* EIP-712
* HMAC-SHA256
* builder authentication
* credential lifecycle

---

### Market discovery and data

Read:

```text
market-data.md
```

Required for:

* Gamma
* market discovery
* event discovery
* market metadata
* CLOB orderbook data
* Data API
* subgraphs
* price history
* market-data interpretation

---

### WebSockets

Read:

```text
websocket.md
```

Required for:

* market WebSocket
* user WebSocket
* subscriptions
* orderbook streaming
* trade notifications
* heartbeat
* reconnect behavior
* event schemas

---

### Orders and execution

Read:

```text
order-patterns.md
```

Required for:

* GTC
* GTD
* FOK
* FAK
* post-only
* cancellation
* batch orders
* tick sizes
* order validation
* heartbeat
* execution errors

---

### CTF operations

Read:

```text
ctf-operations.md
```

Required for:

* split
* merge
* redeem
* token operations
* negative-risk mechanics
* token IDs
* CTF interactions

---

### Bridging

Read:

```text
bridge.md
```

Required for:

* deposits
* withdrawals
* supported chains
* supported assets
* bridge status
* bridge-related operations

---

### Gasless / relayer

Read:

```text
gasless.md
```

Required for:

* relayer
* gasless operations
* wallet deployment
* builder configuration

---

# 6. Skill Usage Must Be Traceable

Whenever an implementation depends on a Polymarket Agent Skill, record which skill was consulted.

For example:

```text
Research:
- Polymarket Agent Skill: market-data.md
- Official TypeScript SDK
- Official Polymarket documentation
```

This should appear in the task completion report.

For significant architectural decisions, record the relevant skill in:

```text
docs/project-state/DECISIONS.md
```

where appropriate.

---

# 7. Official Skill Repository vs Project Documentation

Do not confuse these two layers.

## Project documentation

```text
docs/
```

defines:

* our architecture
* our requirements
* our strategy research
* our engineering standards
* our risk model
* our implementation order
* our agent governance

## Official Polymarket Agent Skills

```text
Polymarket/agent-skills
```

defines:

* Polymarket integration knowledge
* API patterns
* authentication
* order behavior
* market data
* WebSockets
* CTF operations
* bridge
* gasless functionality

The relationship is:

```text
                OUR PROJECT
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Project Docs        Polymarket Skills
          │                     │
          │                     │
          ▼                     ▼
    How OUR SYSTEM        How POLYMARKET
       operates              operates
          │                     │
          └──────────┬──────────┘
                     ▼
              Implementation
```

Neither layer should silently override the other.

If a conflict appears, stop and investigate it.

---

# 8. Current Skill Repository Must Be Verified

Before relying on a skill for implementation, verify that the source is actually the official repository:

```text
https://github.com/Polymarket/agent-skills
```

Do not use:

* forks
* unofficial copies
* random gists
* generated summaries
* third-party rewrites

unless explicitly required for comparison.

If a local copy is used, preserve provenance.

For example:

```text
Source:
Polymarket/agent-skills

Repository:
https://github.com/Polymarket/agent-skills

Local snapshot:
<commit/tag/hash>

Retrieved:
<date>
```

Do not silently modify official skill content.

---

# 9. Local Skill Availability

If the coding environment supports local agent skills, make the official skills available to the agent using the environment's supported skill mechanism.

A suitable repository structure may be:

```text
.agents/
└── skills/
    └── polymarket/
        ├── SKILL.md
        ├── authentication.md
        ├── bridge.md
        ├── ctf-operations.md
        ├── gasless.md
        ├── market-data.md
        ├── order-patterns.md
        └── websocket.md
```

However:

**Do not invent an agent-runtime-specific convention if the current coding environment uses another supported skill directory.**

First inspect the environment's actual agent skill mechanism.

The important requirement is that the agent can reliably access the official Polymarket skill set.

---

# 10. Do Not Copy the Skill Repository Blindly

Do not simply paste the entire Polymarket repository into the project as arbitrary documentation.

If a local snapshot is needed:

1. obtain it from the official repository;
2. preserve the original filenames;
3. preserve provenance;
4. avoid modifying the official skill text;
5. document the snapshot/version;
6. use it as an external domain reference layer.

Our own project instructions remain authoritative for project-specific behavior.

---

# 11. Skill Loading Must Be Task-Specific

Do not load every Polymarket skill for every task.

Use progressive disclosure.

Example:

### Current TODO-010

Likely relevant:

```text
SKILL.md
market-data.md
```

Potentially relevant official Polymarket documentation should also be checked.

Do not load:

```text
bridge.md
gasless.md
```

unless the task actually requires them.

---

# 12. Current Task: TODO-010

After establishing access to the official skill repository, continue with:

```text
TODO-010
Resolution Metadata Extraction
```

Do not jump ahead to:

* authenticated trading
* order placement
* live execution
* wallet operations
* CLOB order submission

yet.

---

# 13. Resolution Metadata Objective

The purpose of TODO-010 is to establish **how a market actually resolves**.

The implementation must not assume:

```text
BTC market
=
Binance BTC/USD
```

or any other resolution source.

The actual market resolution mechanism must be extracted from authoritative market information.

---

# 14. Resolution Metadata Must Preserve Evidence

The implementation must preserve enough information to answer:

```text
What is the resolution source?

What reference asset is used?

What exactly determines the outcome?

What determines YES?

What determines NO?

What timestamp or time interval matters?

What resolution rule was observed?

Where did the information come from?

When was it extracted?

Is any part of the interpretation unknown?

How confident is the interpretation?
```

Do not invent unsupported resolution semantics.

If the market does not expose enough information to confidently determine the resolution mechanism:

```text
resolution = UNKNOWN
```

or the equivalent existing internal representation.

Do not infer the answer from:

* market title alone
* URL slug alone
* asset ticker alone
* common Polymarket conventions
* previous markets
* Binance
* CoinMarketCap
* external assumptions

---

# 15. Resolution Metadata Is Not Tradability

Maintain the project's existing state separation:

```text
Discovered
    ↓
Identity Validated
    ↓
Resolution Validated
    ↓
Tradability Validated
    ↓
Execution Validated
```

Resolution metadata must not automatically make a market tradable.

Likewise:

```text
isDiscoveredAsTradable()
```

must not be changed merely because resolution metadata was successfully extracted.

---

# 16. Resolution Sources Must Be Explicit

Where the market identifies a source, preserve the actual source semantics.

Examples could include:

```text
Chainlink
Binance
Other oracle/reference source
```

but these are examples only.

Do not hardcode this list unless supported by the current official data model.

The system should remain extensible.

---

# 17. Resolution Data Should Be Auditable

Where possible, preserve:

```text
raw/source evidence
normalized interpretation
extraction timestamp
source field/path
```

This allows future researchers to answer:

> Why did the bot believe this market resolved using this source?

This is important because resolution-source correctness will later directly affect BTC lead-lag research.

---

# 18. BTC Research Dependency

The future BTC 5-minute strategy depends on correct resolution metadata.

The intended research relationship is:

```text
External BTC Data
        │
        ▼
Actual Resolution Reference
        │
        ▼
Polymarket Market
        │
        ▼
CLOB State
        │
        ▼
Signal
```

Do not reverse this into:

```text
Binance
   ↓
assume Polymarket follows Binance
```

The resolution layer must establish the actual relationship first.

---

# 19. Required Research Before Implementation

Before writing the resolution extractor:

1. Read `SKILL.md`.
2. Read `market-data.md`.
3. Read the current project resolution/market-model documentation.
4. Inspect the current Gamma adapter.
5. Inspect the normalized market identity types.
6. Inspect the current tests.
7. Inspect the actual Gamma response shape available through the official SDK.
8. Determine which fields can reliably establish resolution semantics.
9. Determine which fields may be missing.
10. Document uncertainty rather than guessing.

Only then implement.

---

# 20. Required Tests

Add tests covering at minimum:

### Known resolution

A market with sufficient metadata produces the expected normalized resolution information.

### Missing resolution

A market without sufficient metadata remains explicitly unknown.

### Ambiguous resolution

Ambiguous information does not get converted into a false certainty.

### Non-Binance source

The implementation correctly handles a valid source that is not Binance.

### Identity preservation

Resolution extraction does not modify:

* market ID
* event ID
* condition ID
* token IDs
* slug

### Lifecycle preservation

Resolution extraction does not incorrectly map:

```text
closed
```

to:

```text
resolved
```

unless authoritative evidence establishes resolution.

### No tradability side effects

Resolution extraction must not activate trading or mark a market executable.

### Malformed data

Unexpected or malformed Gamma metadata must fail safely.

---

# 21. Validation

Before marking TODO-010 complete:

```bash
pnpm typecheck
pnpm build
pnpm test
```

If live network validation is useful:

```text
Use the project's existing opt-in mechanism.
```

Do not make live network tests mandatory for ordinary unit-test execution.

---

# 22. Documentation Updates

When TODO-010 is genuinely complete, update:

```text
docs/project-state/CURRENT-STATE.md
docs/project-state/TODO.md
docs/project-state/DECISIONS.md
docs/project-state/CHANGELOG.md
docs/project-state/SESSION-PROGRESS.md
```

Do not mark TODO-010 complete simply because the code compiles.

---

# 23. Required Completion Report

At the end of the task, report:

```text
TASK

What was implemented.


POLYMARKET SKILLS USED

List the official skill files consulted.


OFFICIAL SOURCES

List the official Polymarket documentation/SDK sources consulted.


FILES

Created/modified files.


IMPLEMENTATION

What changed.


TESTS

Commands and results.


VALIDATION

What was verified.


DOCUMENTATION

What project-state documentation changed.


REMAINING

What is still incomplete.


RISKS / UNCERTAINTIES

Any unresolved behavior or assumptions.
```

---

# 24. Mandatory No-Guessing Rule

If you cannot establish a fact from:

```text
Official Polymarket Agent Skills
+
Official Polymarket documentation
+
Official current SDK/API
+
Existing project documentation
+
Controlled experiment
```

then do not invent the answer.

Report:

```text
UNKNOWN
```

or stop and request clarification.

---

# 25. Do Not Change Completed Architecture

Do not unnecessarily change:

* package boundaries
* market model structure
* public-client architecture
* discovery behavior
* tests
* project-state conventions

unless the implementation reveals a concrete defect.

If a change is required:

```text
Explain
→ justify
→ implement
→ test
→ document
```

---

# 26. Do Not Implement Live Trading

The following remain explicitly out of scope for this task:

```text
SecureClient
Order placement
Live order submission
Capital allocation
Live strategy activation
Autonomous trading
Wallet funding
Credential generation
```

The project remains:

```text
RESEARCH MODE
```

---

# 27. Final Instruction

Continue from the current repository state.

Do not restart.

Do not guess.

Do not skip the official Polymarket Agent Skills.

Use the official skill repository as the authoritative Polymarket agent-domain reference:

```text
https://github.com/Polymarket/agent-skills
```

Use progressive disclosure:

```text
SKILL.md
    ↓
relevant reference skill
    ↓
official Polymarket documentation
    ↓
current SDK/API
    ↓
project documentation
    ↓
implementation
```

For the current task:

```text
Official Polymarket Skills
        ↓
TODO-010
Resolution Metadata
        ↓
Validation
        ↓
TODO-011
Market Family Validation
        ↓
CLOB implementation
```

Do not jump ahead.

The goal is not to implement as much code as possible.

The goal is to build a **correct, auditable, research-driven trading system without guessing about Polymarket behavior**.