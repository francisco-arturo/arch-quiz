# archetype-quiz

A quiz app that maps a user's answers onto a named archetype, then explains the
result.

**Status:** greenfield. The agent harness is set up; the product is not written yet.

## Working in this repository

This repo is built to be developed by coding agents as well as people. Start with
[`AGENTS.md`](AGENTS.md) — it defines the startup workflow, the working rules, and
the definition of done.

```bash
./init.sh          # single verification entrypoint; must exit 0 before you start
```

Key files:

| File | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents (entry point) |
| [`feature_list.json`](feature_list.json) | Feature state — the source of truth for what's next |
| [`PROGRESS.md`](PROGRESS.md) | Cross-session progress log |
| [`DECISIONS.md`](DECISIONS.md) | Decisions and their rationale |
| [`docs/HARNESS.md`](docs/HARNESS.md) | How the harness works and how to extend it |
| [`session-handoff.md`](session-handoff.md) | Template for handing work to the next session |

## Next step

`feat-001` in `feature_list.json`: choose the stack and configure real product
verification. Until that is done, no feature can satisfy the definition of done.

> Note: `feature_list.json` currently holds a **proposed** decomposition of the
> product. Confirm or edit it before implementing.
