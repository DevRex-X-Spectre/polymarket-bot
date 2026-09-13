Continue the existing `DevRex-X-Spectre/polymarket-bot` repository from its current state.

Do NOT restart the project.
Do NOT redo TODO-008, TODO-009, TODO-010, or TODO-011. They are completed and accepted.

## CURRENT STATE

* TODO-008 Gamma discovery: COMPLETE
* TODO-009 Market identity: COMPLETE
* TODO-010 Resolution metadata: COMPLETE
* TODO-011 Market-family validation: COMPLETE
* Next task: TODO-012 CLOB REST Adapter
* Runtime remains RESEARCH by default
* Live trading remains disabled
* No order submission
* No SecureClient
* No WebSocket implementation yet

## 1. FIRST: INSPECT CURRENT PROJECT STATE

Read only the minimum relevant project-state files:

* `docs/project-state/CURRENT-STATE.md`
* `docs/project-state/TODO.md`
* `docs/project-state/SESSION-PROGRESS.md`
* `docs/project-state/DECISIONS.md`
* `docs/project-state/CHANGELOG.md`

Then inspect the existing:

* `packages/polymarket`
* `packages/market-models`
* existing tests
* existing Polymarket client integration
* existing error/types/interfaces relevant to market data

Do not modify anything until you understand the existing architecture.

---

# 2. MANDATORY POLYMARKET AGENT SKILLS

The official Polymarket Agent Skills repository is:

`https://github.com/Polymarket/agent-skills`

This project already contains/snapshots the official skills.

**Agent Skills are a mandatory implementation reference for this task.**

Do NOT treat them as optional documentation.

Before implementing TODO-012:

### Required

Read:

* `SKILL.md`
* `market-data.md`

Use the official `market-data.md` guidance specifically when determining:

* CLOB market-data endpoints
* orderbook retrieval
* price/market-data retrieval
* market-data response semantics
* supported public/read-only operations
* relevant identifiers
* API usage patterns

Read additional Agent Skill files only if the implementation genuinely requires them.

For example:

* `websocket.md` is NOT required for TODO-012 unless the current implementation unexpectedly depends on WebSocket behavior.
* `order-patterns.md` must NOT be used to implement order submission because order submission is explicitly out of scope.
* `authentication.md` is NOT required unless the selected read-only endpoint officially requires authentication.

Use **progressive disclosure**. Do not load every skill unnecessarily.

## 3. AGENT SKILL PROVENANCE IS REQUIRED

The implementation must be traceable to the official Agent Skills.

Before coding, identify:

```text
Official Agent Skill:
- SKILL.md
- market-data.md

Relevant sections:
- <section names>

Implementation decisions informed by:
- <specific skill guidance>
```

At completion, include the exact Agent Skills consulted in the final report.

If an implementation decision differs from the Agent Skill guidance:

1. Do NOT silently override it.
2. Investigate the conflict.
3. Verify against current official Polymarket documentation/SDK/API.
4. Record the reason for the final decision in `DECISIONS.md` if architecturally significant.

Do not invent Polymarket behavior when the official Agent Skill or official documentation provides the answer.

---

# 4. VERIFY CURRENT OFFICIAL POLYMARKET BEHAVIOR

After reading the Agent Skills, verify the current official Polymarket CLOB REST API/SDK behavior using authoritative current sources.

Preferred authority order:

1. Official Polymarket Agent Skills
2. Current official Polymarket documentation
3. Current official Polymarket SDK/API
4. Existing project architecture

Do NOT rely on:

* model memory
* old tutorials
* random GitHub repositories
* unofficial SDK wrappers
* outdated examples
* assumptions based on historical Polymarket behavior

If the Agent Skill and current official documentation appear to disagree, investigate before implementing.

---

# 5. TASK

Implement ONLY:

**TODO-012: Read-only CLOB REST Adapter**

The adapter must provide the read-only market-data integration required for:

* orderbook retrieval
* current prices / market information where officially supported
* dynamic trading parameters exposed by the CLOB API

This is a MARKET-DATA task only.

---

# 6. ARCHITECTURAL REQUIREMENTS

The adapter must:

* remain isolated from execution/order submission
* use the project's existing Polymarket integration architecture
* preserve canonical market identity
* normalize external API/SDK responses into internal types where appropriate
* avoid leaking raw external API response shapes throughout the application
* fail safely on malformed or incomplete data
* distinguish unknown/unavailable values from valid zero/empty values
* preserve token/market identifiers exactly
* use the project's existing error-handling conventions
* remain testable without network access

Do not introduce unnecessary abstractions.

Do not redesign completed architecture.

Do not create infrastructure for future TODOs unless it is strictly necessary for TODO-012.

---

# 7. EXPLICITLY OUT OF SCOPE

Do NOT implement:

* order creation
* order cancellation
* order modification
* authentication for trading
* wallet signing
* API credential generation
* SecureClient
* WebSockets
* streaming
* snapshot + stream recovery
* orderbook reconstruction beyond the minimum normalization required for the read-only adapter
* strategy logic
* signals
* trading decisions
* live trading
* execution simulation

Do NOT implement TODO-013 or any later TODO.

---

# 8. NO-GUESSING RULE

Do not invent:

* API endpoints
* request parameters
* response fields
* response semantics
* authentication requirements
* CLOB behavior
* market-data meanings

If an officially supported field or capability is unavailable:

```text
unknown / null
```

must be preferred over an inferred value.

Do not derive authoritative market information from:

* title
* slug
* ticker-like text
* category
* naming conventions

unless the official Polymarket documentation explicitly establishes that behavior.

---

# 9. TESTS

Add focused tests using the existing project test conventions.

Tests must cover, where applicable:

### Orderbook

* successful orderbook retrieval
* multiple price levels
* empty orderbook
* malformed orderbook response
* missing required fields
* invalid price/size values
* market/token not found
* API/network failure

### Market data

* successful supported market-data retrieval
* missing optional fields
* unsupported/unavailable fields remain unknown
* malformed response handling

### Identity

Verify preservation of:

* market ID
* condition ID
* token IDs
* event identity where applicable

Verify the adapter does not mutate canonical market identity.

### Errors

Verify external/API failures are converted into the project's existing error model rather than leaking arbitrary SDK/API errors throughout the application.

Tests must not require live credentials or live trading.

Use mocked HTTP/client responses according to the existing project architecture.

---

# 10. VALIDATION

Run:

```text
pnpm typecheck
pnpm test
pnpm build
```

Do not run unnecessary broad experiments.

If a live network test is useful, keep it opt-in and do not make ordinary tests depend on network availability.

---

# 11. DOCUMENTATION

If TODO-012 is genuinely complete, update only the relevant project-state records:

* `docs/project-state/CURRENT-STATE.md`
* `docs/project-state/TODO.md`
* `docs/project-state/SESSION-PROGRESS.md`
* `docs/project-state/CHANGELOG.md`

Update:

* `docs/project-state/DECISIONS.md`

only if a meaningful architectural decision was made.

The documentation must record the Agent Skills used for TODO-012.

At minimum, record:

```text
Polymarket Agent Skills consulted:
- SKILL.md
- market-data.md

Relevant guidance:
- <specific sections>

Official documentation/API sources:
- <sources actually used>

Implementation decision:
- <brief explanation>
```

Do not claim a skill or source was consulted if it was not actually used.

---

# 12. COMPLETION GATE

Do NOT mark TODO-012 as `COMPLETED` merely because code exists.

TODO-012 can only be marked complete if:

* the read-only CLOB adapter is implemented
* official Agent Skills were consulted
* current official API/SDK behavior was verified
* tests cover the important failure/success paths
* `pnpm typecheck` passes
* `pnpm test` passes
* `pnpm build` passes
* documentation is updated
* no live execution functionality was introduced

If any of these are not satisfied, leave TODO-012 as incomplete and report exactly what remains.

---

# 13. PRESERVE PROJECT CONTINUITY

Do not modify completed architecture without a concrete defect.

Do not redo previous TODOs.

Do not over-engineer.

Do not implement future TODOs.

Keep the implementation minimal, auditable, and ready for another AI agent to continue.

The next agent must be able to understand:

```text
What was implemented
Why it was implemented
Which official Polymarket Agent Skills were used
Which official API/SDK behavior was verified
What remains
What is intentionally out of scope
```

---

# 14. FINAL RESPONSE FORMAT

Return ONLY:

```text
TASK

FILES

AGENT SKILLS CONSULTED
- exact skill files
- relevant sections
- what each contributed

OFFICIAL SOURCES VERIFIED
- exact official sources actually consulted

TESTS

DOCUMENTATION

VALIDATION

REMAINING

RISKS / UNCERTAINTIES
```

Include the exact next TODO after completion.

If TODO-012 is not fully complete, explicitly state why it cannot yet be marked complete.
