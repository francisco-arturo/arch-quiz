import { ARCHETYPES } from './archetypes';
import { rankedArchetypes } from './scoring';
import type { Answer, ScoreMap } from './types';

export const SYSTEM_PROMPT = `You are an expert sales performance coach. You turn a salesperson's quiz answers into a precise, encouraging, and honest personalized profile.

Rules:
- Return a single valid JSON object and nothing else. No markdown fences, no commentary.
- Personalize every section to the person's actual answers; never write generic filler.
- Be specific and constructive about weaknesses — frame them as growth edges, not insults.
- Keep array lengths between 3 and 5 items unless a section explicitly asks otherwise.`;

// Build the user message that carries the quiz data into the model.
export function buildAssessmentPrompt(answers: Answer[], scores: ScoreMap): string {
  const archetypeLines = ARCHETYPES.map(
    (a) => `- ${a.name}: ${a.description}`
  ).join('\n');

  const breakdown = rankedArchetypes(scores)
    .map(({ id, score }) => {
      const name = ARCHETYPES.find((a) => a.id === id)?.name ?? id;
      return `- ${name}: ${score}`;
    })
    .join('\n');

  const answerLines = answers
    .map((a, i) => `${i + 1}. ${a.question}\n   → ${a.selectedText}`)
    .join('\n');

  return `Here is a completed sales archetype assessment. Produce this person's personalized profile.

The six archetypes:
${archetypeLines}

Their computed score breakdown (percentages, summing to about 100):
${breakdown}

Their answers:
${answerLines}

Return ONE JSON object with EXACTLY these keys:
{
  "archetype": "<primary archetype name>",
  "archetypeId": "<primary archetype id>",
  "headline": "<one short, memorable line>",
  "summary": "<2-3 sentences that are personal to their answers>",
  "strengths": ["<3-5 natural strengths>"],
  "weaknesses": ["<3-5 blind spots or growth edges>"],
  "communicationStyle": "<1-2 sentences describing how they communicate>",
  "bestFitRoles": ["<3-5 roles or markets where they thrive>"],
  "improvementAreas": ["<3-5 concrete areas to work on>"],
  "recommendations": ["<3-5 actionable, specific recommendations>"],
  "breakdown": [{"name": "<archetype name>", "score": <number>}, ... all six]
}

Let the score breakdown decide the primary archetype, but write the narrative so it
clearly reflects the person's actual answers.`;
}
