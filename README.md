# archetype-quiz

A **sales archetype assessment tool** — a Typeform-style, mobile-first quiz that
turns a salesperson's answers into a personalized, AI-generated profile.

Answer 12 questions → the answers are analyzed by a model → you get your sales
archetype, strengths, growth edges, communication style, best-fit roles, and
recommendations.

## Stack

- **Next.js 14** (App Router) — one framework, front end + one serverless API route
- **React 18** — the quiz and results UI
- **DeepSeek API** (OpenAI-compatible) — the model that generates the result
- Plain CSS — no UI framework, fast load

## Run it locally

```bash
npm install
cp .env.example .env.local   # then put a real key in .env.local
npm run dev                  # http://localhost:3000
```

`DEEPSEEK_API_KEY` is read **server-side only** in `app/api/assess/route.ts` and
is never sent to the browser.

## Verify

```bash
./init.sh                    # harness + product checks (tsc --noEmit + next build)
npm run typecheck
npm run build
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel — framework auto-detected as Next.js.
3. Add the environment variable `DEEPSEEK_API_KEY` (and optionally
   `DEEPSEEK_MODEL`) in **Project → Settings → Environment Variables**.
4. Deploy. The API route becomes a serverless function; no other backend needed.

## How it works

```
Browser                       Server route                    DeepSeek API
───────                       ─────────────                   ───────────
12 answers ──POST /api/assess──> builds prompt ──HTTP──────> generates profile
result page <────── JSON ─────── parses + grounds <──JSON────── (JSON out)
```

The client scores the answers into a per-archetype breakdown; the server sends
both the raw answers and the breakdown to the model and asks for a structured,
personalized profile. See `docs/ARCHITECTURE.md`.

## Repo map

| Path | Purpose |
|---|---|
| `app/page.tsx` | Quiz flow + results UI (intro → questions → result) |
| `app/api/assess/route.ts` | Server-side model call (keeps the key private) |
| `lib/questions.ts` | 12 assessment questions with archetype weights |
| `lib/archetypes.ts` | The six sales archetypes and their descriptions |
| `lib/scoring.ts` | Turns answers into a score breakdown |
| `lib/prompt.ts` | The prompt that produces the personalized profile |
| `AGENTS.md` | Instructions for coding agents (this repo is agent-harnessed) |
| `feature_list.json` | Feature state — what's done, what's next |
