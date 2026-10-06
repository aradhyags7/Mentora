'use client';

import React from 'react';
import { MessageComposer } from '../composer/MessageComposer';
import { ArrowRight, Sparkles } from 'lucide-react';

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
  const suggestions = [
    'Teach me binary search',
    'Explain quantum tunneling visually',
    'Help me understand derivatives',
    'Why does recursion work?',
  ];

  const continueItems = [
    {
      key: 'cs.binary_search',
      domain: 'Algorithms',
      title: 'Binary Search Algorithm',
      progress: '72% understood',
    },
    {
      key: 'math.derivative',
      domain: 'Calculus',
      title: 'Derivatives & Tangent Slopes',
      progress: '45% understood',
    },
    {
      key: 'cs.binary_search',
      domain: 'Computer Systems',
      title: 'Virtual Memory & Page Tables',
      progress: '20% understood',
    },
  ];

  const recentSummary = [
    { topic: 'Calculus', count: '4 lessons' },
    { topic: 'Algorithms', count: '7 lessons' },
    { topic: 'Physics', count: '3 lessons' },
    { topic: 'Computer Architecture', count: '2 lessons' },
  ];

  return (
    <div className="home-dashboard-scroll">
      <div className="home-dashboard-content">
        {/* Top Centered Hero Greeting */}
        <div className="home-greeting-section">
          <span className="home-greeting-label">Mentora AI Teacher</span>
          <h1 className="home-greeting-heading">
            Good morning.<br />
            What do you want to understand?
          </h1>
        </div>

        {/* Primary Conversational Message Composer */}
        <MessageComposer
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          isVoiceActive={isVoiceActive}
          onToggleVoice={onToggleVoice}
        />

        {/* Subtle Understated Suggestion Chips */}
        <div className="suggestion-chips-row">
          {suggestions.map((prompt, idx) => (
            <button
              key={idx}
              className="suggestion-chip"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Continue Learning Section */}
        <div>
          <div className="home-section-header">
            <span className="home-section-title">Continue learning</span>
          </div>
          <div className="continue-learning-grid">
            {continueItems.map(item => (
              <div
                key={item.title}
                className="continue-card"
                onClick={() => onSelectContinueLesson(item.key)}
              >
                <div>
                  <div className="continue-card-domain">{item.domain}</div>
                  <div className="continue-card-title">{item.title}</div>
                </div>
                <div className="continue-card-progress">
                  <span>{item.progress}</span>
                  <span className="continue-card-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Learning Minimal Summary */}
        <div>
          <div className="home-section-header">
            <span className="home-section-title">Recent learning</span>
          </div>
          <div className="recent-learning-box">
            {recentSummary.map(rec => (
              <div key={rec.topic} className="recent-learning-row">
                <span className="recent-learning-topic">{rec.topic}</span>
                <span className="recent-learning-count">{rec.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
