# Architecture

How the sales archetype assessment tool is put together, and the boundary that
keeps the model API key safe.

## Structure

```
app/
  layout.tsx            # root layout, metadata, viewport
  page.tsx              # single client component: intro → quiz → loading → result
  globals.css           # design system (no UI framework)
  api/assess/route.ts   # the ONLY place that talks to the model API
lib/
  types.ts              # shared types (ArchetypeId, Question, Result, …)
  archetypes.ts         # the six archetypes + descriptions
  questions.ts          # 12 questions; each option weighted toward archetypes
  scoring.ts            # answers → per-archetype score breakdown
  prompt.ts             # system + user prompt that drives the model output
```

## Data flow

1. The user answers questions one at a time in `app/page.tsx`.
2. On submit, the client computes a **score breakdown** (client-side, in
   `lib/scoring.ts`) and POSTs both the raw answers and the breakdown to
   `POST /api/assess`.
3. The route builds a prompt (`lib/prompt.ts`) that carries the answers, the
   breakdown, and the archetype definitions, then calls the DeepSeek API with
   `response_format: json_object`.
4. The route parses the JSON, grounds it against the computed scores (so the
   result can't drift from what the user actually answered), and returns it.
5. The client renders the result in place.

## The security boundary

- The API key lives in `.env.local` (gitignored) and is read only in
  `app/api/assess/route.ts`.
- No environment variable is exposed to the browser; the client only ever
  receives the parsed JSON result.
- On Vercel the key is set as an environment variable, and the route deploys as
  a serverless function.

## Design invariants

- **Content is data.** Questions and archetypes are plain TypeScript objects,
  not JSX, so they can be edited and extended without touching UI code.
- **Scoring is deterministic and client-safe.** It never needs the network, so
  the UI can stay instant even if the model call fails.
- **One model boundary.** Only `app/api/assess/route.ts` may construct a model
  request or read `DEEPSEEK_*` variables. Adding a second model call means
  extracting that logic into `lib/` first.
- **The model output is grounded.** If the model returns an archetype that
  contradicts the computed breakdown, the server falls back to the computed
  primary and attaches the computed breakdown.
