You are taking over development of an existing Polymarket trading bot.

Repository:
https://github.com/DevRex-X-Spectre/polymarket-bot

IMPORTANT:
This is an existing project. Do NOT restart, redesign, or rebuild it from scratch.

Another AI model (Grok) previously worked on this repository but its usage limit has now been reached. You are the new implementation model taking over the project.

Your job is to continue the existing development exactly from the repository's current state.

# 1. FIRST: UNDERSTAND THE EXISTING STATE

Before writing code, inspect the repository and read only the files necessary to establish the current state.

Start with:

* `README.md`
* `memory.md`
* `docs/project-state/CURRENT-STATE.md`
* `docs/project-state/TODO.md`
* `docs/project-state/SESSION-PROGRESS.md`
* `docs/project-state/DECISIONS.md`
* `docs/project-state/CHANGELOG.md`

Then inspect the relevant implementation and tests.

Do NOT read every documentation file in the repository unless necessary.

The repository already contains project-state documentation specifically designed for AI continuation. Use it instead of rediscovering the entire project.

# 2. CURRENT KNOWN STATE

The previous implementation completed:

* TODO-001 Repository Foundation
* TODO-002 TypeScript Application
* TODO-003 Python Research Environment
* TODO-004 Testing Infrastructure
* TODO-005 Environment Configuration
* TODO-006 Secret Management
* TODO-007 Configuration Validation
* TODO-008 Gamma Market Discovery
* TODO-009 Market Identity
* TODO-010 Resolution Metadata Extraction

The latest documented next task is:

TODO-011: Market Family Validation

The project is currently in:

RESEARCH / FOUNDATION IMPLEMENTATION

Live trading is NOT enabled.

Do not assume the documentation is perfect. Verify the relevant parts against the actual source code.

# 3. IMPORTANT ARCHITECTURAL DECISIONS

Preserve the existing architecture unless you find a concrete defect.

Current Polymarket direction:

* `@polymarket/client`
* `createPublicClient()`
* Gamma public market discovery
* internal market identity models
* resolution metadata extraction
* official Polymarket Agent Skills snapshot

The repository deliberately does NOT currently use:

* `SecureClient`
* live order submission
* autonomous trading
* capital allocation
* live strategy execution

Do not introduce these prematurely.

The project must remain research-first.

# 4. OFFICIAL POLYMARKET KNOWLEDGE

The repository contains a snapshot of the official Polymarket Agent Skills.

Relevant locations include:

* `vendor/polymarket-agent-skills/`
* `.grok/skills/web3-polymarket/`

Use these as reference material when implementing Polymarket-specific behavior.

Do not blindly copy old Polymarket examples.

When Polymarket behavior matters, prefer:

1. current official Polymarket documentation
2. official Polymarket SDK/API
3. the repository's verified skill snapshot
4. existing project decisions

Do not rely on model memory when the behavior can be verified.

Only load the specific skill/document needed for the current task.

# 5. YOUR FIRST IMPLEMENTATION TASK

After understanding the current repository state, continue with:

TODO-011: Market Family Validation

Do NOT jump ahead to:

* CLOB trading
* order placement
* wallet funding
* autonomous execution
* live strategy activation

TODO-011 must be implemented according to the project's existing dependency order.

# 6. TODO-011 OBJECTIVE

Implement the market-family validation layer.

The purpose is to determine whether markets are actually compatible before the system compares them for structural relationships, arbitrage, dislocation research, or other cross-market analysis.

Validation should consider the project's existing market identity and resolution metadata.

At minimum, investigate compatibility across:

* event identity
* underlying / subject
* reference asset where known
* resolution mechanism
* resolution source
* resolution condition
* relevant timestamps
* outcome semantics
* YES/NO meaning
* market relationship

Do not invent information that is unavailable.

If an important field is unknown, the validation system must represent that uncertainty explicitly rather than silently treating unknown as compatible.

# 7. IMPORTANT SAFETY RULE

Do NOT assume two markets are compatible simply because:

* their titles look similar
* their slugs look similar
* they mention the same ticker
* they belong to the same event category
* they appear to concern the same asset

The system must use authoritative normalized information where available.

For example:

BTC market A + BTC market B

does NOT automatically mean:

same underlying
+
same resolution source
+
same resolution condition
+
same timestamp
+
same outcome semantics

Compatibility must be established, not guessed.

# 8. FOLLOW EXISTING DOMAIN BOUNDARIES

Before creating new types or abstractions, inspect the existing packages.

Prefer extending existing models and utilities rather than creating parallel representations.

Respect the current package boundaries.

Do not perform unrelated refactoring.

Do not rename working APIs without a concrete reason.

Do not replace working implementations simply because you prefer another approach.

# 9. TEST-DRIVEN IMPLEMENTATION

Add focused tests for TODO-011.

At minimum cover:

### Compatible markets

Two genuinely compatible markets should validate successfully.

### Different event

Markets belonging to different events should not be considered compatible when event identity is required.

### Different resolution

Markets with incompatible resolution mechanisms should fail validation.

### Different timestamps

Markets resolving at incompatible times should not be treated as the same market family.

### Different outcome semantics

YES/NO or equivalent outcomes that represent different meanings must not be treated as interchangeable.

### Unknown information

Missing or unknown resolution information must not silently become compatible.

### Similar titles but incompatible markets

Two markets that look similar from their titles/slugs but have incompatible authoritative metadata must be rejected.

### Identity preservation

Validation must not mutate the underlying market identity.

### Existing TODO-010 behavior

Do not break the existing resolution metadata extraction behavior.

# 10. VALIDATION

After implementation, run the appropriate existing checks.

At minimum:

`pnpm typecheck`

`pnpm test`

Run:

`pnpm build`

if appropriate for the repository.

Do not introduce mandatory live-network tests.

Existing live-network tests must remain opt-in.

# 11. DOCUMENTATION

If TODO-011 is genuinely completed, update the project's state documentation consistently.

At minimum inspect and update where appropriate:

* `docs/project-state/CURRENT-STATE.md`
* `docs/project-state/TODO.md`
* `docs/project-state/DECISIONS.md`
* `docs/project-state/CHANGELOG.md`
* `docs/project-state/SESSION-PROGRESS.md`

Do not mark TODO-011 complete merely because the code compiles.

It must satisfy its actual acceptance criteria and have tests.

# 12. DO NOT OVERENGINEER

This is extremely important.

Do not build the entire trading system now.

Do not implement future TODOs just because they appear related.

Do not add:

* PostgreSQL
* Redis
* CLOB execution
* WebSocket trading
* wallet intelligence
* copy trading
* BTC strategy
* autonomous execution

unless they are strictly required by TODO-011.

Implement the smallest clean foundation that satisfies the current task.

# 13. CODE QUALITY

The implementation should be:

* strongly typed
* deterministic
* testable
* easy for another AI model to understand
* explicit about unknown states
* consistent with existing project conventions
* free from unnecessary abstractions

Avoid clever implementations.

Prefer straightforward domain logic.

# 14. CONTINUATION REQUIREMENT

This project will continue through multiple AI coding sessions.

Therefore, after completing TODO-011, leave the repository in a state where another model can continue without reconstructing your reasoning.

Update the project-state documentation with:

* what was implemented
* why it was implemented
* files changed
* tests added
* validation performed
* remaining limitations
* exact next TODO
* unresolved questions

The next model should be able to determine the next action from the repository itself.

# 15. GIT / REPOSITORY SAFETY

Do not delete existing work.

Do not reset the repository.

Do not rewrite history.

Do not discard changes you did not create.

Before modifying files, inspect their current state.

Preserve existing completed work.

# 16. EFFICIENCY REQUIREMENT

Your context and usage are limited.

Do not waste usage on:

* reading every file
* repeating existing documentation
* explaining the entire architecture back to me
* speculative future design
* unrelated refactoring
* implementing future TODOs

Inspect strategically.

Implement the current task.

Test it.

Document it.

Stop.

# 17. FINAL RESPONSE

When finished, provide a concise report using exactly this structure:

TASK

* What was implemented.

FILES

* Files created/modified.

TESTS

* Commands executed.
* Results.

DOCUMENTATION

* Project-state files updated.

VALIDATION

* What was verified.

REMAINING

* What is still incomplete.
* Exact next TODO.

RISKS / UNCERTAINTIES

* Only genuine unresolved issues.

Do not give me a long tutorial or repeat the entire project architecture.

Most importantly:

CONTINUE THE EXISTING PROJECT.

DO NOT RESTART IT.

DO NOT REDO COMPLETED WORK.

DO NOT SKIP TODO-011.

DO NOT IMPLEMENT LIVE TRADING.

MAKE SMALL, VERIFIED, DOCUMENTED CHANGES.
