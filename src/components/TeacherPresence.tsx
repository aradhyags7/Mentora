'use client';

import React from 'react';
import { PedagogicalMode, TeacherState, ConceptNode, DialogueMessage } from '@/types/classroom';
import { 
  Bot, 
  HelpCircle, 
  Eye, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';

interface TeacherPresenceProps {
  teacherState: TeacherState;
  currentMode: PedagogicalMode;
  onChangeMode: (mode: PedagogicalMode) => void;
  concepts: ConceptNode[];
  messages: DialogueMessage[];
  onTriggerAction?: (actionName: string) => void;
}

const MODE_LABELS: Record<PedagogicalMode, { label: string; desc: string; color: string }> = {
  explanation: { label: 'Direct Explanation', desc: 'Synthesizing conceptual foundation', color: '#8B5CF6' },
  socratic: { label: 'Socratic Inquiry', desc: 'Guiding through probing questions', color: '#06B6D4' },
  visual: { label: 'Visual Geometry', desc: 'Intuition through spatial graphs', color: '#F59E0B' },
  demonstration: { label: 'Live Simulation', desc: 'Parametric physics experiment', color: '#10B981' },
  worked_example: { label: 'Worked Example', desc: 'Collaborative derivation step-by-step', color: '#EC4899' },
  guided_practice: { label: 'Guided Practice', desc: 'Student active solving with scaffolds', color: '#6366F1' },
  debugging: { label: 'Misconception Debug', desc: 'Isolating specific flawed reasoning', color: '#EF4444' },
  assessment: { label: 'Mastery Assessment', desc: 'Validating independent understanding', color: '#14B8A6' }
};

export const TeacherPresence: React.FC<TeacherPresenceProps> = ({
  teacherState,
  currentMode,
  onChangeMode,
  concepts,
  messages,
  onTriggerAction
}) => {
  const currentModeInfo = MODE_LABELS[currentMode];

  return (
    <aside className="teacher-presence-panel">
      {/* Teacher Avatar Card */}
      <div className="teacher-avatar-card">
        <div className="avatar-orb-wrapper">
          {teacherState === 'speaking' && <div className="avatar-wave-ring" />}
          <div className={`avatar-orb ${teacherState === 'speaking' ? 'speaking' : ''}`}>
            <Bot size={26} />
          </div>
        </div>

        <div className="teacher-details">
          <div className="teacher-name-row">
            <span className="teacher-name">Mentora AI</span>
            <span 
              className="pedagogy-mode-tag"
              style={{ borderColor: currentModeInfo.color, color: currentModeInfo.color }}
            >
              {currentModeInfo.label}
            </span>
          </div>
          <div className="teacher-pedagogy-sub">{currentModeInfo.desc}</div>
        </div>
      </div>

      {/* Pedagogical State Machine Card */}
      <div className="pedagogy-state-card">
        <div className="pedagogy-card-header">
          <span>Concept Trajectory</span>
          <BookOpen size={13} color="var(--text-tertiary)" />
        </div>
        <div className="concept-chain">
          {concepts.map((concept, idx) => (
            <React.Fragment key={concept.id}>
              <div 
                className={`concept-node ${concept.status}`}
                title={concept.description}
              >
                {concept.status === 'mastered' && '✓ '}
                {concept.name}
              </div>
              {idx < concepts.length - 1 && (
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Strategy Switcher Dropdown / Quick Select */}
      <div style={{ padding: '0 16px', marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '6px',
          fontSize: '0.68rem',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}>
          <span>Adaptive Strategy</span>
          <Zap size={12} color="#F59E0B" />
        </div>
        <select
          value={currentMode}
          onChange={(e) => onChangeMode(e.target.value as PedagogicalMode)}
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            fontSize: '0.78rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {Object.entries(MODE_LABELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      {/* Live Dialogue Stream */}
      <div className="dialogue-stream-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`dialogue-bubble ${msg.sender}`}>
            <div className={`dialogue-role-label ${msg.sender}`}>
              {msg.sender === 'teacher' ? (
                <>
                  <Sparkles size={11} />
                  <span>Teacher</span>
                </>
              ) : (
                <span>Student</span>
              )}
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {msg.timestamp}
              </span>
            </div>

            <p>{msg.text}</p>

            {msg.actionTrigger && (
              <div 
                className="dialogue-action-trigger"
                onClick={() => onTriggerAction && onTriggerAction(msg.actionTrigger!)}
                style={{ cursor: 'pointer' }}
                title="Click to execute this action on the board"
              >
                <ArrowRight size={12} />
                <span>Action: {msg.actionTrigger}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};
