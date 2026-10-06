'use client';

import React from 'react';
import { X, Sliders, ListOrdered, CheckCircle2 } from 'lucide-react';
import { LessonVariable, LessonOutlineItem } from '../../lib/artifacts/registry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  variables: LessonVariable[];
  outline: LessonOutlineItem[];
  onSeekStep?: (timestampMs: number) => void;
}

export const RightContextPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  variables,
  outline,
  onSeekStep,
}) => {
  return (
    <aside className={`mentora-right-panel ${isOpen ? '' : 'collapsed'}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={13} color="var(--text-tertiary)" />
          <span className="panel-title">Context & Variables</span>
        </div>
        <button
          className="topbar-icon-btn"
          onClick={onClose}
          title="Close panel"
          style={{ width: 24, height: 24 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Variables Inspector */}
      {variables && variables.length > 0 && (
        <div className="context-section">
          <div className="context-section-heading">State Variables</div>
          <div>
            {variables.map((v, idx) => (
              <div key={idx} className="variable-row">
                <span className="variable-name">{v.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {v.badge && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent-text)',
                    }}>
                      {v.badge}
                    </span>
                  )}
                  <span className="variable-val">{String(v.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Outline / Sequence */}
      {outline && outline.length > 0 && (
        <div className="context-section" style={{ borderBottom: 'none' }}>
          <div className="context-section-heading">Lesson Outline</div>
          <div>
            {outline.map((step, idx) => (
              <div
                key={step.id || idx}
                className="outline-step-item"
                onClick={() => onSeekStep && onSeekStep(step.timestampMs)}
                title={`Jump to ${step.title}`}
              >
                <div className="outline-step-num">{idx + 1}</div>
                <div>
                  <div className="outline-step-title">{step.title}</div>
                  <div className="outline-step-summary">{step.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
