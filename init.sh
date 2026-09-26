#!/bin/bash
#
# init.sh — standard startup and verification path for archetype-quiz.
#
# Read AGENTS.md first. This is the single command that answers:
# "is this repository in a healthy, restartable state?"
#
#   exit 0    -> baseline healthy; safe to start work
#   exit != 0 -> repair the baseline before adding scope
#
# It checks two things, in order:
#   1. Harness integrity — the state files exist and are machine-readable.
#   2. Product verification — whatever the chosen stack provides.
#      Not configured yet: see feat-001 in feature_list.json.

set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Harness Initialization: archetype-quiz ==="

# ── 1. Required harness artifacts ─────────────────────────────────────────────
echo
echo "--- 1. Harness artifacts ---"

REQUIRED_FILES=(
  AGENTS.md
  feature_list.json
  PROGRESS.md
  DECISIONS.md
  init.sh
  session-handoff.md
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "  ok    $file"
  else
    echo "  FAIL  $file is missing" >&2
    exit 1
  fi
done

# ── 2. Feature list integrity (shape, state machine, WIP=1) ───────────────────
echo
echo "--- 2. Feature list integrity ---"

if command -v node >/dev/null 2>&1; then
  node -e '
    const fs = require("node:fs");
    const fail = (message) => { console.error("  FAIL  " + message); process.exit(1); };
    try {
      var data = JSON.parse(fs.readFileSync("feature_list.json", "utf8"));
    } catch (error) {
      fail("feature_list.json is not valid JSON: " + error.message);
    }
    const features = data.features;
    if (!Array.isArray(features) || features.length === 0) fail("feature_list.json has no non-empty features array");
    const allowed = new Set(["not-started", "in-progress", "blocked", "done"]);
    const ids = new Set();
    for (const feature of features) {
      for (const field of ["id", "name", "description", "status"]) {
        if (typeof feature[field] !== "string" || !feature[field]) {
          fail("feature " + (feature.id || "?") + " is missing required field: " + field);
        }
      }
      if (!allowed.has(feature.status)) fail("feature " + feature.id + " has invalid status: " + feature.status);
      if (ids.has(feature.id)) fail("duplicate feature id: " + feature.id);
      ids.add(feature.id);
    }
    for (const feature of features) {
      for (const dependency of feature.dependencies || []) {
        if (!ids.has(dependency)) fail("feature " + feature.id + " depends on unknown feature: " + dependency);
      }
    }
    const active = features.filter((feature) => feature.status === "in-progress");
    if (active.length > 1) {
      fail("WIP=1 violated: " + active.length + " features are in-progress (" + active.map((f) => f.id).join(", ") + ")");
    }
    console.log("  ok    " + features.length + " features valid; in-progress: " + (active.length ? active[0].id : "none"));
  '
elif command -v python3 >/dev/null 2>&1; then
  python3 - <<'PY'
import json
import sys

def fail(message):
    print("  FAIL  " + message, file=sys.stderr)
    sys.exit(1)

try:
    with open("feature_list.json") as handle:
        data = json.load(handle)
except (OSError, ValueError) as error:
    fail("feature_list.json could not be parsed: %s" % error)

features = data.get("features")
if not isinstance(features, list) or not features:
    fail("feature_list.json has no non-empty features array")

allowed = {"not-started", "in-progress", "blocked", "done"}
ids = set()
for feature in features:
    for field in ("id", "name", "description", "status"):
        if not isinstance(feature.get(field), str) or not feature[field]:
            fail("feature %s is missing required field: %s" % (feature.get("id", "?"), field))
    if feature["status"] not in allowed:
        fail("feature %s has invalid status: %s" % (feature["id"], feature["status"]))
    if feature["id"] in ids:
        fail("duplicate feature id: %s" % feature["id"])
    ids.add(feature["id"])

for feature in features:
    for dependency in feature.get("dependencies") or []:
        if dependency not in ids:
            fail("feature %s depends on unknown feature: %s" % (feature["id"], dependency))

active = [feature for feature in features if feature["status"] == "in-progress"]
if len(active) > 1:
    fail("WIP=1 violated: %d features are in-progress (%s)" % (len(active), ", ".join(f["id"] for f in active)))
print("  ok    %d features valid; in-progress: %s" % (len(features), active[0]["id"] if active else "none"))
PY
else
  echo "  skip  neither node nor python3 is available to validate feature_list.json"
fi

# ── 3. Product verification ───────────────────────────────────────────────────
echo
echo "--- 3. Product verification ---"

if [[ -f package.json ]]; then
  PM="npm"
  if [[ -f pnpm-lock.yaml ]]; then PM="pnpm"; fi
  if [[ -f yarn.lock ]]; then PM="yarn"; fi
  if [[ -f bun.lockb || -f bun.lock ]]; then PM="bun"; fi
  echo "  detected node project (package manager: $PM)"

  case "$PM" in
    yarn) INSTALL_CMD="yarn install" ;;
    pnpm) INSTALL_CMD="pnpm install" ;;
    bun)  INSTALL_CMD="bun install" ;;
    *)    INSTALL_CMD="npm install" ;;
  esac
  echo "  running: $INSTALL_CMD"
  $INSTALL_CMD

  RAN=0
  for script in check typecheck type-check lint test build; do
    if grep -qE "\"${script}\"[[:space:]]*:" package.json; then
      echo "  running: $PM run $script"
      $PM run "$script"
      RAN=1
    fi
  done

  if [[ "$RAN" -eq 0 ]]; then
    echo "  FAIL  package.json defines no check/typecheck/lint/test/build script" >&2
    echo "        A manifest without verification is not a verified baseline." >&2
    exit 1
  fi
else
  echo "  WARN  PRODUCT VERIFICATION IS NOT CONFIGURED."
  echo "        No package.json was found, so nothing about the product is verified here."
  echo "        This baseline proves the harness is intact. It does NOT prove the app works."
  echo "        Closing this gap is feat-001 in feature_list.json."
  echo "        Until then no feature may be marked done (AGENTS.md > Definition of Done)."
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo
echo "=== Baseline check complete ==="
echo
echo "Next steps:"
echo "  1. Read PROGRESS.md for current state"
echo "  2. Read feature_list.json and pick exactly ONE unfinished feature"
echo "  3. Implement only that feature"
echo "  4. Re-run ./init.sh before claiming done"
echo "  5. Update PROGRESS.md and feature_list.json, then commit"
