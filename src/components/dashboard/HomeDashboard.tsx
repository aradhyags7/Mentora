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

export interface DashboardRecentLesson {
  id: string;
  semanticKey: string;
  title: string;
  domain: string;
}

interface Props {
  onSendMessage: (text: string, teachMeMode: boolean) => void;
  isLoading: boolean;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onSelectPrompt: (promptText: string) => void;
  onSelectContinueLesson?: (semanticKey: string) => void;
  recentLessons?: DashboardRecentLesson[];
}

export const HomeDashboard: React.FC<Props> = ({
  onSendMessage,
  isLoading,
  isVoiceActive,
  onToggleVoice,
  onSelectPrompt,
  onSelectContinueLesson,
  recentLessons = [],
}) => {
  // ChatGPT-style clean suggestion prompt pills
  const promptSuggestions = [
    {
      id: 'binary_search',
      icon: BarChart2,
      label: 'Binary Search (O(log n))',
      prompt: 'Teach me Binary Search visually with array space halving and two pointers',
    },
    {
      id: 'two_sum',
      icon: Sparkles,
      label: 'Two Sum: HashMap vs 2-Pointers',
      prompt: 'Explain Two Sum and 3Sum comparing HashMap lookup with sorted Two Pointers',
    },
    {
      id: 'sliding_window',
      icon: Lightbulb,
      label: 'Sliding Window Maximum',
      prompt: 'Teach me the Sliding Window Maximum technique with monotonic queue',
    },
    {
      id: 'tree_dfs',
      icon: ArrowRight,
      label: 'Binary Tree DFS & Call Stack',
      prompt: 'Visualize Binary Tree DFS traversal and recursion call stack',
    },
    {
      id: 'derivative',
      icon: TrendingDown,
      label: 'Derivatives & Tangent Slopes',
      prompt: 'Teach me derivatives from first principles with an interactive tangent curve',
    },
  ];

  // Concept Cards for dynamic interactive exploration
  const conceptCards: ConceptCardData[] = [
    {
      id: 'card_binary_search',
      title: 'Binary Search (O(log n) Two Pointers)',
      domain: 'Data Structures & Algorithms',
      tagline: 'Logarithmic Search Invariant',
      description: 'Halve the search space every single comparison using low, high, and mid memory pointers.',
      prompt: 'Teach me Binary Search visually with array space halving and two pointers',
      beatsCount: 4,
      previewType: 'binary_search',
    },
    {
      id: 'card_two_sum',
      title: 'Two Sum / 3Sum (HashMap vs Two Pointers)',
      domain: 'Algorithm Design',
      tagline: 'Space-Time Tradeoff',
      description: 'Trade O(n) auxiliary space for O(1) hash lookups, then compare against sorted two-pointer convergence.',
      prompt: 'Explain Two Sum and 3Sum comparing HashMap lookup with sorted Two Pointers',
      beatsCount: 4,
      previewType: 'two_sum',
    },
    {
      id: 'card_sliding_window',
      title: 'Sliding Window Maximum',
      domain: 'Advanced Algorithms',
      tagline: 'Monotonic Queue Invariant',
      description: 'Maintain optimal window bounds and animate monotonic queue transitions in O(n) linear time.',
      prompt: 'Teach me the Sliding Window Maximum technique with monotonic queue',
      beatsCount: 4,
      previewType: 'sliding_window',
    },
    {
      id: 'card_tree_dfs',
      title: 'Binary Tree DFS & Recursion Stack',
      domain: 'Data Structures',
      tagline: 'Call Stack & Backtracking',
      description: 'Trace recursive call frames pushing and popping as the teacher walks pre-order and in-order tree paths.',
      prompt: 'Visualize Binary Tree DFS traversal and recursion call stack',
      beatsCount: 4,
      previewType: 'tree_dfs',
    },
    {
      id: 'card_derivatives',
      title: 'Derivatives & Gradient Descent',
      domain: 'Calculus & Optimization',
      tagline: 'Instantaneous Rate of Change',
      description: 'Watch secant lines collapse into instantaneous tangent lines as Δx approaches 0, guiding gradient steps.',
      prompt: 'Teach me derivatives from first principles with an interactive tangent curve',
      beatsCount: 4,
      previewType: 'derivative',
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
          <KnowledgeTopology onSelectTopic={onSelectPrompt} />
        </div>

        {/* Dynamic Jump Back In (rendered ONLY if user has real previous sessions) */}
        {recentLessons.length > 0 && (
          <div className="home-recents-compact">
            <div className="recents-compact-label">
              <Clock size={12} />
              <span>Continue learning</span>
            </div>
            <div className="recents-compact-list">
              {recentLessons.map(lesson => (
                <button
                  key={lesson.id}
                  type="button"
                  className="recent-compact-chip"
                  onClick={() => onSelectContinueLesson?.(lesson.semanticKey)}
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
