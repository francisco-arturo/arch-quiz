import type { Archetype } from './types';

export const ARCHETYPES: Archetype[] = [
  {
    id: 'challenger',
    name: 'The Challenger',
    tagline: 'Teaches, reframes, and pushes the customer to think differently.',
    description:
      'Sells by teaching the prospect something new about their own business and challenging the status quo.',
    emoji: '⚡',
  },
  {
    id: 'relationship',
    name: 'The Relationship Builder',
    tagline: 'Trust first — wins loyalty, retention, and referrals.',
    description:
      'Sells by building deep, durable trust and putting the long-term relationship ahead of the transaction.',
    emoji: '🤝',
  },
  {
    id: 'consultant',
    name: 'The Consultant',
    tagline: 'Diagnoses the real problem, then tailors the solution.',
    description:
      'Sells by asking sharp questions, uncovering root causes, and prescribing a solution that fits.',
    emoji: '🧭',
  },
  {
    id: 'closer',
    name: 'The Closer',
    tagline: 'Urgency, momentum, and the will to ask for the business.',
    description:
      'Sells by driving deals to a decision quickly, handling objections head-on, and keeping velocity high.',
    emoji: '🎯',
  },
  {
    id: 'storyteller',
    name: 'The Storyteller',
    tagline: 'Paints the vision and makes the outcome feel inevitable.',
    description:
      'Sells by weaving a compelling narrative that makes people want the future being described.',
    emoji: '✨',
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    tagline: 'Proof over promises — ROI, data, and precision.',
    description:
      'Sells by building an airtight, evidence-based case that earns credibility through numbers.',
    emoji: '📊',
  },
];

export function archetypeById(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}

export function archetypeByName(name: string): Archetype | undefined {
  return ARCHETYPES.find(
    (a) => a.name.toLowerCase() === String(name).toLowerCase()
  );
}
