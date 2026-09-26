import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT, buildAssessmentPrompt } from '@/lib/prompt';
import { scoreAnswers, normalizeScores, rankedArchetypes } from '@/lib/scoring';
import { archetypeById } from '@/lib/archetypes';
import type { Answer, AssessmentResult } from '@/lib/types';

export const runtime = 'nodejs';

const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const TIMEOUT_MS = 60_000;

export async function POST(request: Request) {
  let body: { answers?: Answer[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const answers = Array.isArray(body?.answers) ? body.answers : [];
  if (answers.length < 5) {
    return NextResponse.json(
      { error: 'Please answer at least 5 questions before submitting.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server is not configured with a DEEPSEEK_API_KEY.' },
      { status: 500 }
    );
  }

  const scores = normalizeScores(scoreAnswers(answers));
  const userPrompt = buildAssessmentPrompt(answers, scores);

  let raw = '';
  let finishReason = '';
  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Model API responded with status ${upstream.status}.` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    raw = data?.choices?.[0]?.message?.content ?? '';
    finishReason = data?.choices?.[0]?.finish_reason ?? '';
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the model API. Please try again.' },
      { status: 502 }
    );
  }

  const parsed = parseResultJson(raw);
  if (!parsed) {
    console.error(
      `[assess] unparseable model output (finish=${finishReason}, len=${raw.length}):`,
      raw.slice(0, 400)
    );
    return NextResponse.json(
      { error: 'The model returned an unreadable result. Please try again.' },
      { status: 502 }
    );
  }

  // Ground the result in the computed scores if the model omitted or drifted.
  const primary = rankedArchetypes(scores)[0];
  const result: AssessmentResult = {
    ...parsed,
    archetype: parsed.archetype || archetypeById(primary.id)?.name || 'Challenger',
    archetypeId: parsed.archetypeId || primary.id,
    breakdown:
      Array.isArray(parsed.breakdown) && parsed.breakdown.length > 0
        ? parsed.breakdown
        : rankedArchetypes(scores).map(({ id, score }) => ({
            name: archetypeById(id)?.name ?? id,
            score,
          })),
  };

  return NextResponse.json({ result });
}

function parseResultJson(raw: string): AssessmentResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
