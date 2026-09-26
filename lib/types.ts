export type ArchetypeId =
  | 'challenger'
  | 'relationship'
  | 'consultant'
  | 'closer'
  | 'storyteller'
  | 'analyst';

export type ScoreMap = Record<ArchetypeId, number>;

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
}

export interface QuestionOption {
  text: string;
  weights: Partial<ScoreMap>;
}

export interface Question {
  id: string;
  prompt: string;
  options: QuestionOption[];
}

export interface Answer {
  questionId: string;
  question: string;
  selectedText: string;
}

export interface BreakdownItem {
  name: string;
  score: number;
}

export interface AssessmentResult {
  archetype: string;
  archetypeId?: string;
  headline?: string;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  communicationStyle?: string;
  bestFitRoles?: string[];
  improvementAreas?: string[];
  recommendations?: string[];
  breakdown?: BreakdownItem[];
}
