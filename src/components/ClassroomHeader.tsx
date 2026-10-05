'use client';

import React from 'react';
import { SubjectId, TeacherState } from '@/types/classroom';
import { LESSONS } from '@/data/mockLessons';
import { Sparkles, Volume2, VolumeX, RotateCcw, CheckCircle2, Award } from 'lucide-react';

interface ClassroomHeaderProps {
  currentSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
  teacherState: TeacherState;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetSession: () => void;
  masteryPercentage: number;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  currentSubject,
  onSelectSubject,
  teacherState,
  isMuted,
  onToggleMute,
  onResetSession,
  masteryPercentage
}) => {
  return (
    <header className="classroom-header">
      {/* Brand Group */}
      <div className="brand-wrapper">
        <div className="brand-logo-badge">
          <Sparkles size={20} />
        </div>
        <div className="brand-title-group">
          <h1>MENTORA</h1>
          <div className="brand-tagline">Adaptive Multimodal Virtual Classroom</div>
        </div>
      </div>

      {/* Subject Switcher */}
      <div className="subject-selector-wrapper">
        {Object.values(LESSONS).map((lesson) => {
          const isActive = lesson.id === currentSubject;
          return (
            <button
              key={lesson.id}
              className={`subject-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSubject(lesson.id as SubjectId)}
            >
              <span>{lesson.title.split(':')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Mastery Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.74rem'
        }}>
          <Award size={14} color="#8B5CF6" />
          <span style={{ color: 'var(--text-secondary)' }}>Mastery:</span>
          <span style={{ fontWeight: 700, color: '#A78BFA' }}>{masteryPercentage}%</span>
        </div>

        {/* Live Teacher State */}
        <div className="teacher-status-indicator">
          <div className="status-pulse-dot" />
          <span>
            {teacherState === 'speaking' && 'Teacher Speaking'}
            {teacherState === 'listening' && 'Listening to Student...'}
            {teacherState === 'writing' && 'Drawing on Board'}
            {teacherState === 'evaluating' && 'Analyzing Reasoning'}
            {teacherState === 'observing' && 'Observing Workspace'}
          </span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          className="header-icon-btn"
          title={isMuted ? 'Unmute Teacher Audio' : 'Mute Teacher Audio'}
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Reset Session */}
        <button
          className="header-icon-btn"
          title="Reset Lesson State"
          onClick={onResetSession}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
};
