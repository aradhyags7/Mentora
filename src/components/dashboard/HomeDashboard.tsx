'use client';

import React from 'react';
import { MessageComposer } from '../composer/MessageComposer';
import { 
  Lightbulb, 
  BarChart2, 
  TrendingDown, 
  Cpu, 
  ArrowRight,
  Clock
} from 'lucide-react';

interface Props {
  onSendMessage: (text: string, teachMeMode: boolean) => void;
  isLoading: boolean;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onSelectPrompt: (promptText: string) => void;
  onSelectContinueLesson: (semanticKey: string) => void;
}

export const HomeDashboard: React.FC<Props> = ({
  onSendMessage,
  isLoading,
  isVoiceActive,
  onToggleVoice,
  onSelectPrompt,
  onSelectContinueLesson,
}) => {
  // ChatGPT-style clean suggestion prompt pills
  const promptSuggestions = [
    {
      id: 'binary_search',
      icon: BarChart2,
      label: 'Visualize Binary Search',
      prompt: 'Teach me Binary Search visually from first principles',
    },
    {
      id: 'euler',
      icon: Lightbulb,
      label: 'Explain Euler’s Identity',
      prompt: 'Explain Euler\'s Identity visually and why e^(i*pi) = -1',
    },
    {
      id: 'gradient_descent',
      icon: TrendingDown,
      label: 'How Gradient Descent works',
      prompt: 'Explain Gradient Descent and learning rate with a visual loss curve',
    },
    {
      id: 'virtual_memory',
      icon: Cpu,
      label: 'Explain Virtual Memory',
      prompt: 'Explain Virtual Memory and page tables visually',
    },
  ];

  const recentLessons = [
    {
      key: 'cs.binary_search',
      title: 'Binary Search Algorithm',
      domain: 'Algorithms',
      time: 'Recent',
    },
    {
      key: 'math.derivative',
      title: 'Derivatives & Tangent Slopes',
      domain: 'Calculus',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="home-dashboard-scroll">
      <div className="home-dashboard-center-wrapper">
        {/* ChatGPT Style Clean Heading */}
        <div className="home-greeting-section">
          <h1 className="home-greeting-heading">
            What would you like to learn?
          </h1>
        </div>

        {/* Primary ChatGPT Input Capsule */}
        <MessageComposer
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          isVoiceActive={isVoiceActive}
          onToggleVoice={onToggleVoice}
        />

        {/* ChatGPT Style Suggestion Action Pills */}
        <div className="chatgpt-suggestions-wrapper">
          {promptSuggestions.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="chatgpt-suggestion-pill"
                onClick={() => onSelectPrompt(item.prompt)}
              >
                <Icon size={14} className="suggestion-pill-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subtle Jump Back In */}
        {recentLessons.length > 0 && (
          <div className="home-recents-compact">
            <div className="recents-compact-label">
              <Clock size={12} />
              <span>Continue learning</span>
            </div>
            <div className="recents-compact-list">
              {recentLessons.map(lesson => (
                <button
                  key={lesson.key}
                  type="button"
                  className="recent-compact-chip"
                  onClick={() => onSelectContinueLesson(lesson.key)}
                >
                  <span className="recent-chip-title">{lesson.title}</span>
                  <span className="recent-chip-domain">{lesson.domain}</span>
                  <ArrowRight size={12} className="recent-chip-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
