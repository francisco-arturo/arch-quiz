import { QUESTIONS } from './questions';
import { ARCHETYPES } from './archetypes';
import type { Answer, ArchetypeId, ScoreMap } from './types';

const ZERO: ScoreMap = {
  challenger: 0,
  relationship: 0,
  consultant: 0,
  closer: 0,
  storyteller: 0,
  analyst: 0,
};

// Sum the option weights for each answer into a raw point score per archetype.
export function scoreAnswers(answers: Answer[]): ScoreMap {
  const scores: ScoreMap = { ...ZERO };
  for (const answer of answers) {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    const option = question?.options.find((o) => o.text === answer.selectedText);
    if (!option) continue;
    for (const [key, value] of Object.entries(option.weights)) {
      scores[key as ArchetypeId] += value ?? 0;
    }
  }
  return scores;
}

// Scale raw points to percentages that sum to ~100 (for UI bars and the prompt).
export function normalizeScores(scores: ScoreMap): ScoreMap {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
  if (total === 0) return { ...ZERO };
  const out = { ...ZERO };
  for (const key of Object.keys(scores) as ArchetypeId[]) {
    out[key] = Math.round((scores[key] / total) * 100);
  }
  return out;
}

// Sort archetypes by score descending; ties broken by catalog order.
export function rankedArchetypes(scores: ScoreMap): { id: ArchetypeId; score: number }[] {
  return ARCHETYPES.map((a) => ({ id: a.id, score: scores[a.id] })).sort(
    (a, b) => b.score - a.score || ARCHETYPES.findIndex((x) => x.id === a.id) - ARCHETYPES.findIndex((x) => x.id === b.id)
  );
}
