# Decisions

Architectural and harness-level decisions, with the reasoning that produced them.
Record a decision here when a future session would otherwise have to re-derive it.

---

## D-001 — Adopt the `harness-creator` conventions for the harness

**Date:** 2026-09-26
**Status:** accepted

**Decision.** The repository uses the five-subsystem harness from
`skills/harness-creator/`: instructions (`AGENTS.md`), state
(`feature_list.json`, `PROGRESS.md`), verification (`init.sh`), scope
(feature dependencies + Definition of Done), and lifecycle
(`session-handoff.md`). Feature entries use `id`, `name`, `description`,
`dependencies`, `status`, `evidence` — with `status` drawn from
`not-started | in-progress | blocked | done`.

**Context.** The course ships two tools that do not fully agree on the feature
schema. `skills/harness-creator/scripts/validate-harness.mjs` expects the fields
above; `tools/audit-harness.sh` (a community contribution from a different
template repo) looks for `behavior` / `verification` / `state`, with states
`planned | active | passing`.

**Alternatives considered.**

- Adopt the audit script's schema instead. Rejected: the creator schema ships
  with a formal JSON Schema and is the documented scaffold path, and
  `not-started` → `in-progress` → `done` describes the gate more precisely.
- Carry both `status` and `state` fields. Rejected: two fields encoding the same
  fact is a second source of truth, and the audit's keyword checks would then
  pass for the wrong reason.

**Consequence.** `tools/audit-harness.sh` reports a small number of
RECOMMENDED items as failing purely because of this naming difference. Those
failures are expected and should not be "fixed" by adding redundant fields.

---

## D-002 — `PROGRESS.md` is canonical; `progress.md` is a symlink

**Date:** 2026-09-26
**Status:** accepted

**Decision.** The session log lives in `PROGRESS.md`. `progress.md` exists only
as a symlink to it.

**Context.** The two tools disagree on casing: `validate-harness.mjs` reads
`progress.md` while `audit-harness.sh` requires `PROGRESS.md`. On a
case-sensitive filesystem, satisfying one by default breaks the other.

**Alternatives considered.**

- Two separate files. Rejected: duplicated state, which is exactly the failure
  the harness exists to prevent.
- Pick one name and accept the other tool's failure. Rejected: a symlink costs
  nothing and keeps a single source of truth.

**Consequence.** The symlink depends on filesystem support. If this repository
is ever moved to a system without symlinks, keep `PROGRESS.md` and update the
validator's expectations rather than reintroducing a second file.

---

## D-003 — `init.sh` exits 0 on a harness-only baseline, with a loud warning

**Date:** 2026-09-26
**Status:** accepted

**Decision.** On a greenfield repo with no product code, `init.sh` verifies
harness integrity and exits 0, while printing an unmissable
`PRODUCT VERIFICATION IS NOT CONFIGURED` warning.

**Context.** The course requires a green, restartable baseline before work
starts. It also warns that a check which passes while proving nothing is worse
than no check. With no stack chosen there is nothing product-level to verify.

**Alternatives considered.**

- Exit non-zero until real tests exist. Rejected: it makes the standard startup
  path red for structural reasons, which trains agents to ignore it.
- Exit 0 silently. Rejected: that is the "declares victory too early" failure
  mode in its purest form.

**Consequence.** The warning is load-bearing, not decoration. Any change that
lets `init.sh` exit 0 without either real product verification or that warning
defeats the point of the harness.

---

## D-004 — Vendor the harness tooling into this repository

**Date:** 2026-09-26
**Status:** accepted

**Decision.** `skills/harness-creator/` and `tools/audit-harness.sh` are copied
into this repository rather than fetched from upstream on demand.

**Context.** Upstream is `walkinglabs/learn-harness-engineering` at commit
`77e7a3e21469dcbece2558086c8d91657abeaa40`. The tooling is small and
dependency-free, and the audit is only useful if it can be run offline and in CI.

**Consequence.** Vendored copies drift from upstream. Re-vendor deliberately
when the upstream tooling changes, and update the commit reference here.
