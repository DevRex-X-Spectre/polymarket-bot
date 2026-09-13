# Tests

| Layer | Location | Runner |
| --- | --- | --- |
| Unit | `packages/*/tests`, `apps/*/tests` | Vitest |
| Contract | `tests/contract` | Vitest |
| Research | `research/tests` | pytest |

Ordinary tests must never require live credentials. CI fails if live trading secrets are present.
