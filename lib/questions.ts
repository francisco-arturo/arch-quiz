import type { Question } from './types';

// 12 multiple-choice questions. Each option carries weights toward one or more
// sales archetypes. The client sums weights into a score per archetype, which is
// sent to the model together with the raw answers.
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    prompt: 'A brand-new prospect just agreed to a first meeting. What do you do first?',
    options: [
      { text: 'Research their world and form a hypothesis about their biggest hidden problem', weights: { consultant: 3, analyst: 1 } },
      { text: 'Find common ground and focus on building rapport before anything else', weights: { relationship: 3 } },
      { text: 'Clarify exactly what they want and what it will take to close fast', weights: { closer: 3 } },
      { text: 'Prepare a story about what working together could look like', weights: { storyteller: 3 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'A deal has gone quiet for two weeks. What is your move?',
    options: [
      { text: 'Send a warm, no-pressure check-in to see how they are doing', weights: { relationship: 2, consultant: 1 } },
      { text: 'Reach out with a new insight that changes how they see the problem', weights: { challenger: 3 } },
      { text: 'Pick up the phone and ask directly where things stand and what is blocking a decision', weights: { closer: 3 } },
      { text: 'Re-engage with fresh data showing the ROI they are leaving on the table', weights: { analyst: 3 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'A prospect says: "Your competitor is cheaper." How do you respond?',
    options: [
      { text: 'Acknowledge it, then explore what "cheaper" really costs them over time', weights: { consultant: 3, analyst: 1 } },
      { text: 'Challenge whether price is the real issue — usually something else is going on', weights: { challenger: 3 } },
      { text: 'Reassure them and lean on the trust we have built; price should not end a good partnership', weights: { relationship: 2 } },
      { text: 'Reframe the value with a vision of the outcome, so price stops being the focus', weights: { storyteller: 3 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'What do you enjoy most about selling?',
    options: [
      { text: 'The moment a customer trusts me enough to stay for years', weights: { relationship: 3 } },
      { text: 'Teaching someone something new about their own business', weights: { challenger: 3 } },
      { text: 'Solving a genuinely hard problem for someone', weights: { consultant: 3 } },
      { text: 'Winning — the close, the number, the momentum', weights: { closer: 3 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'Before a big pitch, you spend the most time on…',
    options: [
      { text: 'The story and the flow — how it will feel', weights: { storyteller: 3 } },
      { text: 'The numbers — proof points, ROI, and case studies', weights: { analyst: 3 } },
      { text: 'The questions I will ask to uncover what really matters', weights: { consultant: 3 } },
      { text: 'The close plan — objections I expect and how I will ask for the business', weights: { closer: 3 } },
    ],
  },
  {
    id: 'q6',
    prompt: 'How do you usually handle a tough objection?',
    options: [
      { text: 'Dig into it until I understand the real concern underneath', weights: { consultant: 3 } },
      { text: 'Turn it into a new insight they had not considered', weights: { challenger: 3 } },
      { text: 'Defuse the tension and keep the relationship warm while I work through it', weights: { relationship: 2 } },
      { text: 'Answer it head-on with facts and a clear, direct response', weights: { analyst: 2, closer: 1 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'Your team is brainstorming a new pitch. You are naturally the one who…',
    options: [
      { text: 'Makes sure we do not lose the human connection with the customer', weights: { relationship: 3 } },
      { text: 'Sharpens the narrative so it lands emotionally', weights: { storyteller: 3 } },
      { text: 'Stress-tests the logic and the numbers', weights: { analyst: 3 } },
      { text: 'Keeps us focused on what actually moves the deal forward', weights: { closer: 2, consultant: 1 } },
    ],
  },
  {
    id: 'q8',
    prompt: 'A customer you love is about to churn. Your first instinct is to…',
    options: [
      { text: 'Find out what changed in their world and fix the root problem', weights: { consultant: 3 } },
      { text: 'Show them the data on what they would lose by leaving', weights: { analyst: 2, challenger: 1 } },
      { text: 'Remind them how far we have come together and how much I value them', weights: { relationship: 3 } },
      { text: 'Re-sell them on the vision of where we are heading', weights: { storyteller: 3 } },
    ],
  },
  {
    id: 'q9',
    prompt: 'What does a successful quarter look like to you?',
    options: [
      { text: 'Happy customers who renew and refer', weights: { relationship: 3 } },
      { text: 'Closed-won deals and a clean pipeline', weights: { closer: 3 } },
      { text: 'Customers whose problems I measurably solved', weights: { consultant: 2, analyst: 1 } },
      { text: 'A new idea or category that is now impossible to ignore', weights: { challenger: 2, storyteller: 1 } },
    ],
  },
  {
    id: 'q10',
    prompt: 'How do you feel about data, dashboards, and CRM hygiene?',
    options: [
      { text: 'I love them — they are how I know what is real', weights: { analyst: 3 } },
      { text: 'Useful, but I would rather be in front of customers', weights: { closer: 1, storyteller: 1 } },
      { text: 'I use them when needed, but I trust my read of people more', weights: { relationship: 2, challenger: 1 } },
      { text: 'I keep them clean enough, but that is not where the magic happens', weights: { storyteller: 2, relationship: 1 } },
    ],
  },
  {
    id: 'q11',
    prompt: 'A prospect asks for a steep discount. You…',
    options: [
      { text: 'Hold the line and prove the value is worth more', weights: { challenger: 2, analyst: 1 } },
      { text: 'Explore what is really driving the ask before responding', weights: { consultant: 3 } },
      { text: 'Find a middle ground that protects the relationship', weights: { relationship: 2 } },
      { text: 'Trade the discount for something — longer term, bigger scope, faster close', weights: { closer: 3 } },
    ],
  },
  {
    id: 'q12',
    prompt: 'What is the hardest part of selling for you?',
    options: [
      { text: 'Slowing down and listening instead of pushing my point', weights: { challenger: 2, closer: 1 } },
      { text: 'Asking for the close and talking about money', weights: { relationship: 3 } },
      { text: 'Making a call when I do not have all the data', weights: { analyst: 3 } },
      { text: 'The details and follow-through after the excitement fades', weights: { storyteller: 3 } },
    ],
  },
];
