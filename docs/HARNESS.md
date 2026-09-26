# Harness Design

This document explains how this repository is set up to keep coding agents
reliable. `AGENTS.md` is the short entry point; this file is the detail behind it.

Source material: [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering).

## The Five Subsystems

A harness is the environment around the model, not the prompt. It has five parts,
and each one answers a different failure mode.

| Subsystem | Artifact here | Failure it prevents |
|---|---|---|
| Instructions | `AGENTS.md` | The agent does not know the rules or the startup path |
| State | `feature_list.json`, `PROGRESS.md`, `DECISIONS.md` | Work is lost between sessions; the same thing gets redone |
| Verification | `init.sh` | The agent claims success without running anything |
| Scope | `feature_list.json` dependencies + Definition of Done | Overreach and half-finished features |
| Lifecycle | `session-handoff.md`, clock-in/clock-out in `AGENTS.md` | The next session starts from an unknown state |

`docs/ARCHITECTURE.md` is the progressive-disclosure target for the product's
layer model and the model-call security boundary.

## Session Lifecycle

```
Clock in                                     Clock out
--------                                     ---------
pwd                                          update PROGRESS.md
read AGENTS.md                               update feature_list.json (+ evidence)
read docs/HARNESS.md                         confirm no debug artifacts
run ./init.sh          <- must be green      commit (one logical change, why not what)
read PROGRESS.md                             confirm ./init.sh still exits 0
read feature_list.json
git log --oneline -5
        |
        v
pick exactly ONE feature (WIP=1)
        |
        v
implement -> verify -> record evidence -> mark done
```

## State Files

### `feature_list.json`

The source of truth for what exists and what is next. Each feature carries:

- `id` — stable identifier, `feat-NNN`
- `name` — short label
- `description` — what it does and why
- `verification` — how to prove it works
- `dependencies` — feature ids that must be `done` first
- `status` — `not-started` | `in-progress` | `blocked` | `done`
- `evidence` — the command that ran and its result, once `done`

Rules: never hand-edit a feature to `done`, never skip a state, and never have
more than one feature `in-progress`. `./init.sh` enforces the shape, the state
vocabulary, unknown dependencies, and the WIP=1 rule.

### `PROGRESS.md`

The narrative memory. What was done, what is in progress, what is next, what is
blocked, and what the last verified baseline was. Read at clock-in, written at
clock-out. The next session's usefulness depends almost entirely on this file.

`progress.md` is a symlink to `PROGRESS.md` — see D-002 in `DECISIONS.md`.

### `DECISIONS.md`

Decisions plus the reasoning and the alternatives that were rejected. Without
this, a future session re-litigates settled questions or silently reverses them.

## Verification

`./init.sh` is the single command. It runs in two stages:

1. **Harness integrity** — required artifacts exist; `feature_list.json` parses,
   has the required fields, valid statuses, resolvable dependencies, and at most
   one `in-progress` feature. Failures here are real failures.
2. **Product verification** — for this Next.js app, `tsc --noEmit` (type-check)
   and `next build`. Both must exit 0.

When `package.json` is absent (e.g. a future non-Node project), stage 2 prints a
loud warning and exits 0 — that fallback is deliberate: see D-003 in
`DECISIONS.md`. A green harness baseline is not evidence that the product works,
and the Definition of Done in `AGENTS.md` reflects that distinction.

### Three verification layers

Do not advance a layer until the previous one passes.

1. **Syntax / static** — parses, type-checks, lints
2. **Runtime behavior** — the feature does what it claims when run
3. **System confirmation** — end-to-end, including side effects

Layer 3 is required when a change crosses a component boundary.

## Tooling

Both tools are vendored so they work offline and in CI.

```bash
# Canonical five-subsystem score (Node)
node skills/harness-creator/scripts/validate-harness.mjs --target .

# Zero-dependency shell audit against lectures L03-L12 (bash)
bash tools/audit-harness.sh .
```

`audit-harness.sh` is a community contribution that uses a slightly different
feature schema (`behavior` / `verification` / `state` with
`planned | active | passing`). This repository follows the `harness-creator`
schema, so a few of that script's RECOMMENDED items report as failing for purely
naming reasons. That is documented as D-001 in `DECISIONS.md` — do not add
duplicate fields to make them pass.

To re-scaffold a harness for a different project:

```bash
node skills/harness-creator/scripts/create-harness.mjs --target /path/to/project
```

## Extending the Harness

Add machinery only when a specific failure justifies it. Good candidates, in
rough order of value:

1. **Real product verification** (`feat-001`) — the highest-value gap right now
2. `docs/ARCHITECTURE.md` plus an enforced boundary check, once there are modules
3. Per-feature verification scripts, once features have multiple check layers
4. The full pipeline in CI, so verification does not depend on the agent remembering

Prefer a check that fails loudly over a rule that lives only in prose.
