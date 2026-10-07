'use client';

import React from 'react';
import { ArrowLeft, Minimize2 } from 'lucide-react';
import { KineticTimeline } from '../../types/kinetic';
import { LessonSurface } from '../lesson/LessonSurface';

interface Props {
  timeline: KineticTimeline | null;
  onClose: () => void;
}

export const FullscreenLessonModal: React.FC<Props> = ({ timeline, onClose }) => {
  if (!timeline) return null;

  return (
    <div className="fullscreen-lesson-backdrop">
      <div className="fullscreen-lesson-container">
        {/* Fullscreen Header */}
        <div className="fullscreen-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to conversation</span>
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {timeline.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="topbar-icon-btn"
            title="Minimize fullscreen"
          >
            <Minimize2 size={16} />
          </button>
        </div>

        {/* Fullscreen Stage with Live Stateful Lesson Surface */}
        <div className="fullscreen-stage" style={{ overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 880 }}>
            <LessonSurface
              concept={timeline.concept || 'math.derivative'}
              title={timeline.title}
              objective={`Focused interactive laboratory for ${timeline.title}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
