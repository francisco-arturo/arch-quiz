'use client';

import { useState } from 'react';
import { QUESTIONS } from '@/lib/questions';
import { ARCHETYPES } from '@/lib/archetypes';
import type { Answer, AssessmentResult } from '@/lib/types';

type Phase = 'intro' | 'quiz' | 'loading' | 'results' | 'error';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[index];
  const progress = ((index + (selected ? 1 : 0)) / QUESTIONS.length) * 100;

  function start() {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setResult(null);
    setError(null);
    setPhase('quiz');
  }

  function choose(option: string) {
    setSelected(option);
  }

  function next() {
    if (!selected || !question) return;
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, question: question.prompt, selectedText: selected },
    ]);
    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      submit([
        ...answers,
        { questionId: question.id, question: question.prompt, selectedText: selected },
      ]);
    }
  }

  function back() {
    if (index === 0) return;
    setIndex(index - 1);
    setAnswers((prev) => prev.slice(0, -1));
    setSelected(answers[answers.length - 1]?.selectedText ?? null);
  }

  async function submit(finalAnswers: Answer[]) {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong.');
      }
      setResult(data.result as AssessmentResult);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPhase('error');
    }
  }

  return (
    <main className="shell">
      <div className="card">
        {phase === 'intro' && <Intro onStart={start} />}
        {phase === 'quiz' && question && (
          <Quiz
            question={question}
            index={index}
            total={QUESTIONS.length}
            progress={progress}
            selected={selected}
            onChoose={choose}
            onNext={next}
            onBack={back}
          />
        )}
        {phase === 'loading' && <Loading />}
        {phase === 'results' && result && <Results result={result} onRetake={start} />}
        {phase === 'error' && <ErrorView message={error} onRetry={() => setPhase('quiz')} />}
      </div>
    </main>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <h1>What kind of seller are you?</h1>
      <p className="lede">
        Answer twelve questions about how you actually sell, and get a profile of
        your natural strengths, blind spots, communication style, and the roles
        where you do your best work.
      </p>
      <p className="meta">12 questions · about 3 minutes</p>
      <button className="btn btn-primary btn-block" onClick={onStart}>
        Start the assessment
      </button>
      <p className="footer">
        {ARCHETYPES.map((a) => a.name).join(' · ')}
      </p>
    </>
  );
}

function Quiz({
  question,
  index,
  total,
  progress,
  selected,
  onChoose,
  onNext,
  onBack,
}: {
  question: { prompt: string; options: { text: string }[] };
  index: number;
  total: number;
  progress: number;
  selected: string | null;
  onChoose: (option: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-count">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className="question-label">Question {index + 1}</div>
      <h2 className="question-text">{question.prompt}</h2>

      <div className="options">
        {question.options.map((option) => (
          <button
            key={option.text}
            className={`option ${selected === option.text ? 'selected' : ''}`}
            onClick={() => onChoose(option.text)}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="nav-row">
        <button className="btn btn-ghost" onClick={onBack} disabled={index === 0}>
          Back
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={!selected}>
          {index + 1 === total ? 'See my result' : 'Next'}
        </button>
      </div>
    </>
  );
}

function Loading() {
  return (
    <div className="loading">
      <div className="dots">
        <span />
        <span />
        <span />
      </div>
      <h2 className="loading-title">Analyzing your answers</h2>
      <p className="loading-sub">Reading your instincts and drafting your profile.</p>
    </div>
  );
}

function Results({ result, onRetake }: { result: AssessmentResult; onRetake: () => void }) {
  const breakdown = Array.isArray(result.breakdown) ? result.breakdown : [];
  const maxScore = Math.max(...breakdown.map((b) => b.score), 1);

  return (
    <>
      <div className="result-hero">
        <div className="kicker">Your archetype</div>
        <h2 className="archetype-name">{result.archetype}</h2>
        {result.headline && <p className="headline">{result.headline}</p>}
        {result.summary && <p className="summary">{result.summary}</p>}
      </div>

      {result.strengths && result.strengths.length > 0 && (
        <Section title="Natural strengths">
          <ul className="list positive">
            {result.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.weaknesses && result.weaknesses.length > 0 && (
        <Section title="Growth edges">
          <ul className="list negative">
            {result.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.communicationStyle && (
        <Section title="Communication style">
          <p className="summary">{result.communicationStyle}</p>
        </Section>
      )}

      {result.bestFitRoles && result.bestFitRoles.length > 0 && (
        <Section title="Where you will thrive">
          <ul className="list">
            {result.bestFitRoles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.improvementAreas && result.improvementAreas.length > 0 && (
        <Section title="Areas to improve">
          <ul className="list">
            {result.improvementAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {result.recommendations && result.recommendations.length > 0 && (
        <Section title="Recommendations">
          <ul className="list">
            {result.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {breakdown.length > 0 && (
        <Section title="Your archetype mix">
          <div className="breakdown">
            {breakdown.map((item) => (
              <div className="bar-row" key={item.name}>
                <span className="bar-name">{item.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.round((item.score / maxScore) * 100)}%` }}
                  />
                </div>
                <span className="bar-value">{item.score}%</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="result-actions">
        <button className="btn btn-primary btn-block" onClick={onRetake}>
          Retake the assessment
        </button>
      </div>
      <p className="footer">Generated from your answers — a starting point, not a verdict.</p>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="error-box">
      <h2>Something went wrong</h2>
      <p>{message || 'Please try again.'}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
