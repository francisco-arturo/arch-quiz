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

---

## D-005 — Next.js 14 + a server-side DeepSeek route, not a client SDK

**Date:** 2026-09-26
**Status:** accepted

**Decision.** The product is a Next.js 14 (App Router) app. The model call lives
in a single server route (`app/api/assess/route.ts`) that calls the DeepSeek API
directly (OpenAI-compatible, `https://api.deepseek.com/chat/completions`) with
`response_format: json_object`. The key is read from `DEEPSEEK_API_KEY` in
`.env.local` and is never exposed to the browser.

**Context.** The request said "use the Claude API", but this project runs inside
the DeepSeek harness, so the model is DeepSeek instead. The available model names
are `deepseek-v4-pro` (reasoning, the harness default) and `deepseek-chat`
(which currently resolves to `deepseek-flash`). Both accept JSON mode. Measured
on the full 12-answer assessment: `deepseek-chat` returned a complete, highly
personalized JSON profile in ~6s; `deepseek-v4-pro` took ~28s and, with the
initial `max_tokens: 2000`, truncated its JSON mid-stream (fixed by raising it to
8000, but the latency remains).

**Alternatives considered.**

- Client-side SDK with the key in the bundle. Rejected outright: the key would
  ship to every visitor.
- A separate backend service. Rejected: "no complex backend" is an explicit
  requirement; a Next.js API route deploys as a serverless function with nothing
  extra to run.
- `deepseek-v4-pro` as the default for quality. Rejected as default: "fast
  loading" is an explicit requirement, and the reasoning model measured ~28s on
  the full prompt (and needed a large `max_tokens` to avoid truncation).
  `deepseek-chat` is the default; `deepseek-v4-pro` remains a one-line config
  upgrade for higher-quality analysis.

**Consequence.** Deploying on Vercel requires setting `DEEPSEEK_API_KEY` (and
optionally `DEEPSEEK_MODEL`) as environment variables. The model name is an
env var, so upgrading to `deepseek-v4-pro` later is a config change, not a code
change. Next is pinned to `14.2.35` (the patched 14.x) to avoid a known
vulnerability in `14.2.15` without moving to a new major.
