# AGENTS.md

Archetype Quiz is a sales archetype assessment tool: a short quiz whose answers
are analyzed by a model into a personalized sales profile. The product is a
Next.js app; the model call is a server-side route that talks to the DeepSeek
API (the same model this harness runs on) — never from the browser.

This file is the entry point for coding agents working in this repository. It is
a router, not a manual: it states the invariants and points at deeper documents.
Read it completely before writing code.

- Harness design and conventions: [docs/HARNESS.md](docs/HARNESS.md)
- Current state and next action: [PROGRESS.md](PROGRESS.md)
- Decisions and their rationale: [DECISIONS.md](DECISIONS.md)

## Current Status

The MVP is built: quiz content, scoring, the DeepSeek-backed result route, and a
mobile-first UI. The feature list in `feature_list.json` reflects the real
product (not a placeholder). Remaining work is tracked there.

## Startup Workflow (Clock In)

Before writing code:

1. **Confirm working directory** with `pwd`
2. **Read this file** completely
3. **Read [docs/HARNESS.md](docs/HARNESS.md)** and `docs/ARCHITECTURE.md` once it exists
4. **Run `./init.sh`** to confirm the baseline is healthy
5. **Read `PROGRESS.md`** for current state and `feature_list.json` for the next feature
6. **Review recent commits** with `git log --oneline -5`

If the baseline is failing, repair that first. Adding scope on a broken baseline
makes the failure harder to attribute.

## Constraints

Each rule carries a `why:`. Delete a rule only when its `why:` has stopped being true.

- MUST work on exactly one feature at a time (WIP=1). <!-- why: parallel half-finished features are the main source of unreviewable sessions -->
- MUST NOT mark a feature `done` without a verification command that actually exited 0. <!-- why: confidence is not evidence; see Definition of Done -->
- MUST NOT weaken, skip, or delete a check to make it pass. <!-- why: a disabled check is worse than no check, because it still looks green -->
- MUST stay in scope: do not modify files unrelated to the active feature. <!-- why: unrelated edits make the diff unreviewable and rollback unsafe -->
- MUST NOT commit unless the repository is in a consistent state. <!-- why: the next session's baseline is whatever the last commit left behind -->
- MUST update documentation in the same commit as the code it describes. <!-- why: stale docs actively mislead the next agent session -->
- MUST keep this file short and push detail into `docs/`. <!-- why: long instruction files get skimmed rather than followed -->

## Working Rules

- **One feature at a time**: pick exactly one unfinished feature from `feature_list.json`
- **Verification required**: never claim done without running the verification commands below
- **Record evidence**: a completed feature names the command and its result in `evidence`
- **Stay in scope**: leave adjacent problems for their own feature
- **Leave a clean state**: the next session must be able to run `./init.sh` immediately

## Feature List Rules

- Never edit feature state by hand to mark a feature passing — run the
  verification command, record its result in `evidence`, then update `status`.
- State machine: `not-started` → `in-progress` → `done` (or `blocked`). Do not
  skip states, and do not activate a new feature while one is `in-progress`.
- Granularity: each feature must be completable in one session. If it cannot be,
  split it.
- `dependencies` are hard gates: do not start a feature whose dependencies are
  not `done`.

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] Verification actually ran and exited 0 (tests / type-check / lint / smoke run)
- [ ] Evidence recorded in `feature_list.json` (`evidence`: command + result)
- [ ] `PROGRESS.md` updated with the new state and next action
- [ ] Repository still restartable: `./init.sh` exits 0 from a clean checkout

Writing code is not completion. Being confident is not completion. Passing
runtime evidence is completion.

### Verification Layers

Work through the layers in order. Do not proceed to the next layer if the current
one fails.

- **Layer 1 — syntax and static checks**: the code parses, type-checks, and lints
- **Layer 2 — runtime behavior**: the feature does what it claims when run
- **Layer 3 — system confirmation**: end-to-end behavior, including side effects

Layer 3 is required whenever a change crosses a component or module boundary.

Runtime signals worth checking: the app starts and reaches a ready state, side
effects (files written, state persisted) are correct, and no debug artifacts
remain in the tree.

## Verification Commands

```bash
# Full baseline check (recommended)
./init.sh
```

Required checks:

- `./init.sh` — harness integrity, plus product checks once the stack is chosen

> `init.sh` runs the real product checks: `tsc --noEmit` (type-check) and
> `next build`. Both must exit 0. The model call itself is proven by a live
> request recorded as `feat-004`'s evidence.

## Architecture Boundaries

The layer model and dependency direction are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
The invariant: quiz content (`lib/questions.ts`) is data, scoring (`lib/scoring.ts`)
is logic, the model call lives only in the server route (`app/api/assess/route.ts`),
and the API key never reaches the browser.

## Observability

- Before starting a feature, write in `PROGRESS.md` what "done" will look like.
- During verification, keep the real command output — that is the evidence.
- After finishing, update `PROGRESS.md` with the resulting state and next action.

## End of Session (Clock Out)

Before ending a session:

1. Update `PROGRESS.md` with current state, next steps, and blockers
2. Update `feature_list.json` with the new `status` and `evidence`
3. Record any unresolved risks or blockers
4. Confirm no debug artifacts are left behind
5. Commit with a message that explains **why**, not just what changed
6. Leave the repo clean enough for the next session to run `./init.sh` immediately

One logical change per commit. **If you are running low on context, do not rush
to finish** — stop, update `PROGRESS.md`, and commit a clean checkpoint. A clean
partial state is worth more than a broken "finished" one.

## Escalation

- **Architecture decisions**: record them in `DECISIONS.md`; ask the user when the choice is product-facing
- **Unclear requirements**: check `PROGRESS.md`, then ask the user — do not invent scope
- **Repeated verification failures**: update `PROGRESS.md`, set the feature to `blocked`, flag for human review
- **Scope ambiguity**: re-read `feature_list.json` for that feature's definition of done
