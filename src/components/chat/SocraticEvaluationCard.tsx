'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  HelpCircle, 
  TrendingUp, 
  Brain, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { EvaluationResult } from '../../types/pedagogy';
import { diagnoseStudentResponse } from '../../lib/pedagogy/misconceptions';

interface Props {
  concept: string;
  question: string;
  hints?: string[];
  onEvaluated: (result: EvaluationResult, adaptiveBeat?: any, studentState?: any) => void;
}

export const SocraticEvaluationCard: React.FC<Props> = ({
  concept,
  question,
  hints = [],
  onEvaluated,
}) => {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isEvaluating) return;

    setIsEvaluating(true);

    try {
      // 1. Call Mentora /api/evaluate endpoint (FastAPI Nemotron + Corbett-Anderson BKT)
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          question,
          answer: answer.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
          onEvaluated(data.evaluation, data.adaptiveBeat, data.studentState);
          return;
        }
      }
    } catch (err) {
      console.warn('API /api/evaluate call failed, using local diagnostic:', err);
    } finally {
      setIsEvaluating(false);
    }

    // 2. Synchronous local diagnostic fallback
    const result = diagnoseStudentResponse(concept, question, answer);
    setEvaluation(result);
    onEvaluated(result);
  };

  return (
    <div className="socratic-evaluation-card">
      <div className="socratic-card-header">
        <div className="socratic-badge">
          <HelpCircle size={13} className="badge-icon" />
          <span>Socratic Checkpoint</span>
        </div>
        <div className="socratic-concept-pill">
          {concept}
        </div>
      </div>

      <p className="socratic-question-text">{question}</p>

      {hints.length > 0 && (
        <div className="socratic-hint-zone">
          <button
            type="button"
            className="socratic-hint-toggle"
            onClick={() => setShowHint(prev => !prev)}
          >
            {showHint ? 'Hide Hint' : '💡 Need a hint?'}
          </button>
          {showHint && (
            <div className="socratic-hint-content">
              {hints.map((hint, idx) => (
                <p key={idx} className="hint-line">{hint}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {!evaluation ? (
        <form onSubmit={handleSubmit} className="socratic-input-form">
          <input
            type="text"
            className="socratic-answer-input"
            placeholder="Type your intuition or answer here..."
            value={answer}
            disabled={isEvaluating}
            onChange={e => setAnswer(e.target.value)}
          />
          <button
            type="submit"
            className="socratic-submit-btn"
            disabled={!answer.trim() || isEvaluating}
          >
            {isEvaluating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Check</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className={`evaluation-result-box ${evaluation.isCorrect ? 'correct' : 'remediate'}`}>
          <div className="evaluation-status-row">
            {evaluation.isCorrect ? (
              <div className="status-label success">
                <CheckCircle2 size={16} />
                <span>Concept Understood</span>
              </div>
            ) : (
              <div className="status-label warning">
                <AlertTriangle size={16} />
                <span>Misconception Detected</span>
              </div>
            )}
            <div className="mastery-gain-badge">
              <TrendingUp size={12} />
              <span>
                BKT Mastery: {(evaluation.masteryBefore * 100).toFixed(0)}% → {(evaluation.masteryAfter * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <p className="evaluation-reasoning">{evaluation.reasoning}</p>

          {evaluation.detectedMisconceptions.length > 0 && (
            <div className="misconception-callout">
              <div className="misconception-title">
                <Brain size={14} />
                <span>Cognitive Diagnosis: {evaluation.detectedMisconceptions[0].title}</span>
              </div>
              <p className="misconception-desc">
                {evaluation.detectedMisconceptions[0].explanation}
              </p>
              <div className="remediation-guidance">
                <strong>Pedagogical Adjustment:</strong> {evaluation.detectedMisconceptions[0].remediationGuidance}
              </div>
            </div>
          )}

          <div className="evaluation-action-row">
            <span className="pedagogical-action-pill">
              Next Action: {evaluation.recommendedAction} ({evaluation.recommendedMode} mode)
            </span>
            <button
              type="button"
              className="continue-lesson-btn"
              onClick={() => {
                setEvaluation(null);
                setAnswer('');
              }}
            >
              <span>Continue Lesson</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
