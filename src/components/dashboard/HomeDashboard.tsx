'use client';

import React from 'react';
import { MessageComposer } from '../composer/MessageComposer';
import { InteractiveConceptCard, ConceptCardData } from './InteractiveConceptCard';
import { KnowledgeTopology } from './KnowledgeTopology';
import { 
  Lightbulb, 
  BarChart2, 
  TrendingDown, 
  ArrowRight,
  Clock,
  Sparkles,
  GraduationCap
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
      id: 'derivative',
      icon: TrendingDown,
      label: 'Teach me Derivatives',
      prompt: 'Teach me derivatives from first principles',
    },
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
  ];

  // Interactive Concept Cards with live micro-canvas previews
  const conceptCards: ConceptCardData[] = [
    {
      id: 'card_derivative',
      title: 'Derivatives & Rates of Change',
      domain: 'Calculus',
      tagline: 'Instantaneous Slope as Δx → 0',
      description: 'Watch the secant line continuously collapse into the tangent line to discover instantaneous rates of change.',
      prompt: 'Teach me derivatives from first principles',
      beatsCount: 4,
      previewType: 'derivative',
    },
    {
      id: 'card_binary_search',
      title: 'Binary Search Algorithm',
      domain: 'Algorithms',
      tagline: 'O(log n) Invariant Partitioning',
      description: 'Observe dynamic low, mid, and high pointers halve search intervals with strict loop invariants.',
      prompt: 'Teach me Binary Search visually from first principles',
      beatsCount: 6,
      previewType: 'binary_search',
    },
    {
      id: 'card_euler',
      title: 'Euler’s Identity: e^(iπ) + 1 = 0',
      domain: 'Complex Analysis',
      tagline: 'Unit Circle Continuous Rotation',
      description: 'Explore the fundamental bridge between exponential growth, trigonometry, and imaginary rotation.',
      prompt: 'Explain Euler\'s Identity visually and why e^(i*pi) = -1',
      beatsCount: 5,
      previewType: 'euler',
    },
    {
      id: 'card_gradient_descent',
      title: 'Gradient Descent & Loss',
      domain: 'Machine Learning',
      tagline: 'First-Order Optimization',
      description: 'Follow the ball roll down convex loss valleys governed by learning rate step vectors.',
      prompt: 'Explain Gradient Descent and learning rate with a visual loss curve',
      beatsCount: 5,
      previewType: 'gradient_descent',
    },
  ];

  const recentLessons = [
    {
      key: 'math.derivative',
      title: 'Derivatives & Tangent Slopes',
      domain: 'Calculus',
      time: 'Featured',
    },
    {
      key: 'cs.binary_search',
      title: 'Binary Search Algorithm',
      domain: 'Algorithms',
      time: 'Recent',
    },
  ];

  return (
    <div className="home-dashboard-scroll">
      <div className="home-dashboard-center-wrapper">
        {/* ChatGPT Style Clean Heading & Mission Pill */}
        <div className="home-greeting-section">
          <div className="mentora-thesis-pill">
            <GraduationCap size={13} className="thesis-icon" />
            <span>AI answers questions. Mentora teaches.</span>
          </div>
          <h1 className="home-greeting-heading">
            What would you like to learn?
          </h1>
          <p className="home-greeting-subtext">
            Experience real-time interactive pedagogy with dynamic visualizations, animated whiteboards, and Socratic evaluation.
          </p>
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

        {/* Interactive Curriculum Modules */}
        <div className="dashboard-section-wrapper">
          <div className="section-title-row">
            <div className="section-title-group">
              <Sparkles size={15} className="section-icon" />
              <h2 className="section-heading">Interactive Learning Modules</h2>
            </div>
            <span className="section-subheading">
              Select any concept to enter an adaptive AI teaching session
            </span>
          </div>

          <div className="concept-cards-grid">
            {conceptCards.map(concept => (
              <InteractiveConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => onSelectPrompt(concept.prompt)}
              />
            ))}
          </div>
        </div>

        {/* Knowledge Topology Pathways */}
        <div className="dashboard-section-wrapper">
          <KnowledgeTopology onSelectLesson={onSelectContinueLesson} />
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
