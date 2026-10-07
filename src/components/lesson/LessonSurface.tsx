'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  HelpCircle, 
  Send, 
  Loader2, 
  Brain, 
  TrendingUp, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { TeacherStateStatus, SemanticInteractionEvent } from '../../types/lessonSurface';
import { ArtifactRenderer } from '../artifacts/ArtifactRenderer';
import { EvaluationResult } from '../../types/pedagogy';

interface Props {
  concept: string;
  title: string;
  objective?: string;
  status?: TeacherStateStatus;
  socraticQuestion?: {
    prompt: string;
    concept: string;
    hints?: string[];
  };
  onSocraticEvaluation?: (result: EvaluationResult, adaptiveBeat?: any, studentState?: any) => void;
  onExpandFullscreen?: () => void;
  initialCollapsed?: boolean;
}

export const LessonSurface: React.FC<Props> = ({
  concept,
  title,
  objective,
  status = 'teaching',
  socraticQuestion,
  onSocraticEvaluation,
  onExpandFullscreen,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lastStudentAction, setLastStudentAction] = useState<string | null>(null);

  // Status mapping for subtle teacher status indicator
  const statusLabels: Record<TeacherStateStatus, { label: string; color: string }> = {
    thinking: { label: 'Teacher is reasoning...', color: 'var(--text-tertiary)' },
    building: { label: 'Synthesizing live environment...', color: 'var(--accent-amber)' },
    teaching: { label: 'Live Interactive Classroom', color: 'var(--accent-primary)' },
    waiting: { label: 'Awaiting your exploration...', color: 'var(--accent-cyan)' },
    evaluating: { label: 'Diagnosing conceptual response...', color: 'var(--accent-amber)' },
    adapting: { label: 'Adapting pedagogical strategy...', color: 'var(--accent-primary)' },
    completed: { label: 'Concept Mastered', color: 'var(--accent-primary)' },
    paused: { label: 'Paused', color: 'var(--text-tertiary)' },
  };

  const currentStatusInfo = statusLabels[status] || statusLabels.teaching;

  // Handle student interactive manipulation event
  const handleArtifactInteraction = (event: SemanticInteractionEvent) => {
    setLastStudentAction(`${event.action} (${JSON.stringify(event.value)})`);
  };

  // Submit student intuition / answer for real-time BKT & misconception evaluation
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: socraticQuestion?.concept || concept,
          question: socraticQuestion?.prompt || '',
          answer: studentAnswer.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
          if (data.evaluation.isCorrect) {
            setIsCompleted(true);
          }
          if (onSocraticEvaluation) {
            onSocraticEvaluation(data.evaluation, data.adaptiveBeat, data.studentState);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Evaluation call error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 1. COLLAPSED VIEW: Minimal tranquil card that stays clean in the conversation
  if (isCollapsed) {
    return (
      <div 
        className="lesson-surface-collapsed"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => setIsCollapsed(false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            {title || concept}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {isCompleted ? '— Concept understood' : '— Interactive lesson paused'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span>Reopen</span>
          <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  // 2. ACTIVE LIVE INTERACTIVE ENVIRONMENT
  return (
    <div 
      className="lesson-surface-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Editorial Header with Teacher Presence Indicator */}
      <div 
        className="lesson-surface-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span 
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-text)',
            }}
          >
            {concept}
          </span>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>

        {/* Action Controls & Teacher Presence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status pill with pulsing light */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 500,
              color: currentStatusInfo.color,
              background: 'var(--bg-card)',
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span 
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: currentStatusInfo.color,
                display: 'inline-block',
              }}
            />
            <span>{currentStatusInfo.label}</span>
          </div>

          {/* Fullscreen Expand Button */}
          {onExpandFullscreen && (
            <button
              type="button"
              onClick={onExpandFullscreen}
              title="Expand focused workspace"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Maximize2 size={13} />
            </button>
          )}

          {/* Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            title="Minimize lesson surface"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Minimize2 size={13} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {objective && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {objective}
          </p>
        )}

        {/* Live Domain Interactive Artifact with Shared Control */}
        <ArtifactRenderer
          id={`artifact_${concept}`}
          concept={concept}
          artifactKey={concept}
          onInteraction={handleArtifactInteraction}
          isTeacherActive={status === 'teaching' || status === 'building'}
        />

        {/* Integrated Socratic Checkpoint & Dialogue */}
        {socraticQuestion && (
          <div 
            className="socratic-checkpoint-zone"
            style={{
              marginTop: 6,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>
                <HelpCircle size={14} />
                <span>Socratic Exploration Checkpoint</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                Shared Control Active
              </span>
            </div>

            {/* Question Text */}
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
              {socraticQuestion.prompt}
            </p>

            {/* Hint Zone */}
            {socraticQuestion.hints && socraticQuestion.hints.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHint(prev => !prev)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: 12,
                    color: 'var(--accent-amber)',
                    cursor: 'pointer',
                  }}
                >
                  {showHint ? 'Hide Hint' : '💡 Need a conceptual hint?'}
                </button>
                {showHint && (
                  <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-xs)' }}>
                    {socraticQuestion.hints[0]}
                  </div>
                )}
              </div>
            )}

            {/* Input Form or Evaluation Diagnosis */}
            {!evaluation ? (
              <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Share your intuition or answer based on the simulation..."
                  value={studentAnswer}
                  disabled={isEvaluating}
                  onChange={e => setStudentAnswer(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!studentAnswer.trim() || isEvaluating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: !studentAnswer.trim() || isEvaluating ? 'default' : 'pointer',
                    opacity: !studentAnswer.trim() || isEvaluating ? 0.6 : 1.0,
                  }}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Check</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Evaluation Diagnosis & Corbett-Anderson BKT Update Callout */
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: evaluation.isCorrect ? 'var(--success-bg)' : 'rgba(217, 119, 6, 0.08)',
                  border: `1px solid ${evaluation.isCorrect ? 'var(--accent-primary)' : 'var(--accent-amber)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {evaluation.isCorrect ? (
                      <CheckCircle2 size={16} color="var(--accent-primary)" />
                    ) : (
                      <AlertTriangle size={16} color="var(--accent-amber)" />
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: evaluation.isCorrect ? 'var(--accent-primary)' : 'var(--accent-amber)' }}>
                      {evaluation.isCorrect ? 'Concept Understood' : 'Misconception Identified'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <TrendingUp size={12} />
                    <span>BKT Mastery: {(evaluation.masteryBefore * 100).toFixed(0)}% → {(evaluation.masteryAfter * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {evaluation.reasoning}
                </p>

                {evaluation.detectedMisconceptions.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 'var(--radius-xs)' }}>
                    <strong>Cognitive Diagnosis:</strong> {evaluation.detectedMisconceptions[0].title}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluation(null);
                      setStudentAnswer('');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      fontSize: 12.5,
                      fontWeight: 500,
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Continue Next Exploration</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
