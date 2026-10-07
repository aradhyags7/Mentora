'use client';

import React from 'react';
import { KineticTimeline } from '../../types/kinetic';
import { Sparkles, AlertCircle } from 'lucide-react';
import { MessageComposer } from '../composer/MessageComposer';
import { LessonSurface } from '../lesson/LessonSurface';
import { SocraticEvaluationCard } from './SocraticEvaluationCard';
import { EvaluationResult } from '../../types/pedagogy';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timeline?: KineticTimeline;
  error?: string;
  socraticQuestion?: {
    prompt: string;
    concept: string;
    hints?: string[];
  };
}

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, teachMeMode: boolean) => void;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onExpandArtifact: (timeline: KineticTimeline) => void;
  onToggleContextPanel: () => void;
  onSocraticEvaluation?: (result: EvaluationResult, adaptiveBeat?: any, studentState?: any) => void;
}

export const ChatContainer: React.FC<Props> = ({
  messages,
  isLoading,
  onSendMessage,
  isVoiceActive,
  onToggleVoice,
  onExpandArtifact,
  onToggleContextPanel,
  onSocraticEvaluation,
}) => {
  return (
    <div className="conversation-scroll-view">
      <div className="conversation-thread">
        {messages.map(msg => (
          <div key={msg.id} className="message-block">
            {/* Author identification */}
            <div className="message-author-row">
              <div className={`author-mark ${msg.role === 'user' ? 'user' : 'mentora'}`}>
                {msg.role === 'user' ? 'U' : 'M'}
              </div>
              <span>{msg.role === 'user' ? 'You' : 'Mentora'}</span>
            </div>

            {/* Message Text */}
            {msg.content && (
              <div className="message-text">
                {msg.content}
              </div>
            )}

            {/* Error Notification */}
            {msg.error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                color: '#DC2626',
                marginTop: 8,
              }}>
                <AlertCircle size={16} />
                <span>{msg.error}</span>
              </div>
            )}

            {/* Live Stateful Lesson Surface with Shared Control */}
            {msg.timeline && (
              <div style={{ marginTop: 12 }}>
                <LessonSurface
                  concept={msg.timeline.concept || 'math.derivative'}
                  title={msg.timeline.title || 'Interactive Lesson'}
                  objective={`Interactive first-principles laboratory for ${msg.timeline.concept || 'this concept'}`}
                  socraticQuestion={msg.socraticQuestion}
                  onSocraticEvaluation={onSocraticEvaluation}
                  onExpandFullscreen={() => onExpandArtifact(msg.timeline!)}
                />
              </div>
            )}

            {/* Standalone Socratic Interactive Question if no visual timeline */}
            {!msg.timeline && msg.socraticQuestion && (
              <SocraticEvaluationCard
                concept={msg.socraticQuestion.concept}
                question={msg.socraticQuestion.prompt}
                hints={msg.socraticQuestion.hints}
                onEvaluated={(res, beat, state) => onSocraticEvaluation && onSocraticEvaluation(res, beat, state)}
              />
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--text-tertiary)',
            fontSize: 13.5,
          }}>
            <div className="author-mark mentora">
              <Sparkles size={12} />
            </div>
            <span>Mentora is constructing the interactive lesson environment...</span>
          </div>
        )}

        {/* Bottom Composer in Conversation View */}
        <div style={{ paddingTop: 16 }}>
          <MessageComposer
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            isVoiceActive={isVoiceActive}
            onToggleVoice={onToggleVoice}
          />
        </div>
      </div>
    </div>
  );
};
