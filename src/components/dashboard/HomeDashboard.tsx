'use client';

import React, { useMemo } from 'react';
import { MessageComposer } from '../composer/MessageComposer';
import { ArrowUpRight } from 'lucide-react';

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
  // Dynamic time-of-day greeting (morning / afternoon / evening)
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }, []);

  const starterPrompts = [
    {
      title: 'Euler’s Identity',
      description: 'Why e^(iπ) + 1 = 0 connects five fundamental constants in the complex plane',
      domain: 'Mathematics',
      prompt: 'Explain Euler\'s Identity visually and why rotation in the complex plane causes e^(i*pi) = -1',
    },
    {
      title: 'Binary Search',
      description: 'How logarithmic partitioning halves search spaces in O(log n) time',
      domain: 'Algorithms',
      prompt: 'Teach me Binary Search visually from first principles',
    },
    {
      title: 'Gradient Descent',
      description: 'How optimizers navigate high-dimensional loss surfaces to find minima',
      domain: 'Deep Learning',
      prompt: 'Explain Gradient Descent and learning rate with a visual loss curve',
    },
    {
      title: 'Virtual Memory',
      description: 'How page tables and TLBs map virtual addresses to physical RAM',
      domain: 'Systems',
      prompt: 'Explain Virtual Memory and page tables visually',
    },
  ];

  const continueItems = [
    {
      key: 'cs.binary_search',
      domain: 'Algorithms',
      title: 'Binary Search Algorithm',
      progress: '72% completed',
      beats: '6 beats',
    },
    {
      key: 'math.derivative',
      domain: 'Calculus',
      title: 'Derivatives & Tangent Slopes',
      progress: '45% completed',
      beats: '5 beats',
    },
  ];

  return (
    <div className="home-dashboard-scroll">
      <div className="home-dashboard-content">
        {/* Top Centered Hero Greeting (Claude / OpenAI Editorial Style) */}
        <div className="home-greeting-section">
          <h1 className="home-greeting-heading">
            Good {timeOfDay}.<br />
            <span className="home-greeting-subheading">Where shall we begin?</span>
          </h1>
          <p className="home-greeting-tagline">
            Ask any question to generate an interactive, step-by-step visual lesson.
          </p>
        </div>

        {/* Primary Conversational Message Composer */}
        <MessageComposer
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          isVoiceActive={isVoiceActive}
          onToggleVoice={onToggleVoice}
        />

        {/* Curated Editorial Starter Prompt Cards */}
        <div className="starter-prompts-section">
          <div className="starter-prompts-grid">
            {starterPrompts.map((item, idx) => (
              <div
                key={idx}
                className="starter-prompt-card"
                onClick={() => onSelectPrompt(item.prompt)}
              >
                <div className="starter-card-header">
                  <span className="starter-card-domain">{item.domain}</span>
                  <ArrowUpRight size={14} className="starter-card-arrow" />
                </div>
                <h3 className="starter-card-title">{item.title}</h3>
                <p className="starter-card-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="home-secondary-section">
          <div className="home-section-header">
            <span className="home-section-title">Jump back in</span>
          </div>
          <div className="continue-learning-grid">
            {continueItems.map(item => (
              <div
                key={item.title}
                className="continue-card"
                onClick={() => onSelectContinueLesson(item.key)}
              >
                <div className="continue-card-top">
                  <span className="continue-card-domain">{item.domain}</span>
                  <span className="continue-card-beats">{item.beats}</span>
                </div>
                <div className="continue-card-title">{item.title}</div>
                <div className="continue-card-footer">
                  <div className="continue-progress-track">
                    <div 
                      className="continue-progress-fill" 
                      style={{ width: item.progress.includes('72') ? '72%' : '45%' }} 
                    />
                  </div>
                  <span className="continue-card-progress">{item.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
