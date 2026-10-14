'use client';

import React, { useState } from 'react';
import { MessageComposer } from '../composer/MessageComposer';
import { InteractiveConceptCard, ConceptCardData } from './InteractiveConceptCard';
import { KnowledgeTopology } from './KnowledgeTopology';

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
  // Domain Filter Tabs for Zone 2
  const [activeDomainFilter, setActiveDomainFilter] = useState<'all' | 'dsa' | 'calculus' | 'systems'>('all');

  // Quick-Launch 5 Technical Prompts
  const quickLaunchPrompts = [
    {
      id: '01',
      label: '[01] Binary Search O(log n)',
      prompt: 'Teach me Binary Search visually with array space halving and two pointers',
    },
    {
      id: '02',
      label: '[02] Two Sum: HashMap vs 2-Pointers',
      prompt: 'Explain Two Sum and 3Sum comparing HashMap lookup with sorted Two Pointers',
    },
    {
      id: '03',
      label: '[03] Reverse Linked List In-Place',
      prompt: 'Teach in-place linked list reversal with pointer tracing',
    },
    {
      id: '04',
      label: '[04] Sliding Window Maximum',
      prompt: 'Teach me the Sliding Window Maximum technique with monotonic queue',
    },
    {
      id: '05',
      label: '[05] First-Principles Derivatives',
      prompt: 'Teach me derivatives from first principles with an interactive tangent curve',
    },
  ];

  // Concept Cards data for Zone 2
  const allConceptCards: ConceptCardData[] = [
    {
      id: 'card_binary_search',
      title: 'Binary Search (O(log n) Two Pointers)',
      domain: 'Data Structures & Algorithms',
      domainTag: 'ALGORITHMS • ARRAY / POINTERS',
      category: 'dsa',
      tagline: 'Logarithmic Search Invariant',
      description: 'Halve the search space every comparison using low, high, and mid memory pointers while maintaining loop invariants.',
      prompt: 'Teach me Binary Search visually with array space halving and two pointers',
      beatsCount: 4,
      previewType: 'binary_search',
    },
    {
      id: 'card_two_sum',
      title: 'Two Sum & 3Sum (HashMap vs Two Pointers)',
      domain: 'Algorithm Design',
      domainTag: 'HASH TABLE • O(1) LOOKUP',
      category: 'dsa',
      tagline: 'Space-Time Tradeoff',
      description: 'Trade O(n) auxiliary memory for instantaneous complement lookups, then compare against sorted two-pointer convergence.',
      prompt: 'Explain Two Sum and 3Sum comparing HashMap lookup with sorted Two Pointers',
      beatsCount: 4,
      previewType: 'two_sum',
    },
    {
      id: 'card_sliding_window',
      title: 'Sliding Window Maximum (Monotonic Queue)',
      domain: 'Advanced Algorithms',
      domainTag: 'SLIDING WINDOW • O(N) LINEAR',
      category: 'dsa',
      tagline: 'Monotonic Queue Invariant',
      description: 'Maintain optimal window bounds and animate monotonic queue transitions in strict linear O(n) runtime.',
      prompt: 'Teach me the Sliding Window Maximum technique with monotonic queue',
      beatsCount: 4,
      previewType: 'sliding_window',
    },
    {
      id: 'card_linked_list',
      title: 'Reverse Linked List In-Place',
      domain: 'Data Structures',
      domainTag: 'LINKED LIST • IN-PLACE',
      category: 'dsa',
      tagline: 'In-Place Pointer Mutation',
      description: 'Rewire singly linked list next pointers in-place with three pointers (prev, curr, next) using zero auxiliary memory.',
      prompt: 'Teach in-place linked list reversal with pointer tracing',
      beatsCount: 4,
      previewType: 'linked_list',
    },
    {
      id: 'card_derivatives',
      title: 'Derivatives & Tangent Slopes (lim Δx → 0)',
      domain: 'Calculus & Optimization',
      domainTag: 'CALCULUS • LIMIT Δx → 0',
      category: 'calculus',
      tagline: 'Instantaneous Rate of Change',
      description: 'Watch secant lines collapse into instantaneous tangent lines as Δx approaches 0, proving the derivative from first principles.',
      prompt: 'Teach me derivatives from first principles with an interactive tangent curve',
      beatsCount: 4,
      previewType: 'derivative',
    },
    {
      id: 'card_gradient_descent',
      title: 'Multivariable Gradients & Gradient Descent',
      domain: 'Machine Learning & Calculus',
      domainTag: 'OPTIMIZATION • GRADIENTS',
      category: 'calculus',
      tagline: 'Loss Surface Minimization',
      description: 'Step down convex cost surfaces using the negative gradient vector to iteratively update model weights.',
      prompt: 'Teach partial derivatives, the gradient vector, and Gradient Descent optimization visually',
      beatsCount: 4,
      previewType: 'gradient_descent',
    },
  ];

  // Filtered Cards based on selected domain
  const filteredCards = allConceptCards.filter(card => {
    if (activeDomainFilter === 'all') return true;
    if (activeDomainFilter === 'dsa') return card.category === 'dsa';
    if (activeDomainFilter === 'calculus') return card.category === 'calculus';
    if (activeDomainFilter === 'systems') return card.category === 'systems';
    return true;
  });

  return (
    <div className="home-dashboard-scroll">
      <div className="home-dashboard-center-wrapper py-7 gap-8">
        
        {/* ================================================================= */}
        {/* ZONE 1: Hero Command Stage (Top Center)                           */}
        {/* ================================================================= */}
        <section className="flex flex-col items-center text-center w-full">
          {/* System Telemetry Pill */}
          <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-[#121318] rounded-full px-3 py-1 text-[11px] font-mono text-[#9496A1] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MENTORA SPATIAL ENGINE v2.0 • REAL-TIME VOICE &amp; WHITEBOARD TUTOR</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-[#F4F4F6] text-center mt-3.5">
            What do you want to master on the board today?
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-[#9496A1] text-center max-w-xl mx-auto mt-2 mb-4 leading-relaxed">
            Mentora compiles algorithms, system architectures, and mathematics into a live, voice-synchronized whiteboard you can interrupt at any word.
          </p>

          {/* Embedded Hero Message Composer */}
          <div className="w-full">
            <MessageComposer
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              isVoiceActive={isVoiceActive}
              onToggleVoice={onToggleVoice}
            />
          </div>

          {/* Quick-Launch Technical Prompts Row */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-3.5 w-full max-w-3xl">
            {quickLaunchPrompts.map(item => (
              <button
                key={item.id}
                type="button"
                className="h-8 px-3 rounded-lg bg-[#121318] hover:bg-[#181A20] border border-white/[0.07] hover:border-white/[0.15] text-xs text-[#9496A1] hover:text-[#F4F4F6] font-mono transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                onClick={() => onSelectPrompt(item.prompt)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* ZONE 2: Interactive Workbench Modules (Asymmetric Bento Grid)    */}
        {/* ================================================================= */}
        <section className="w-full min-w-0 flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full border-b border-white/[0.05] pb-3">
            <div>
              <div className="text-[11px] font-mono tracking-[0.08em] text-[#5E606E] uppercase">
                01 / INTERACTIVE WORKBENCH MODULES
              </div>
              <h2 className="text-base font-medium text-[#F4F4F6] mt-0.5">
                Live 4-Zone Whiteboard Simulations
              </h2>
            </div>

            {/* Domain Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0C0D10] border border-white/[0.06] flex-wrap">
              {[
                { id: 'all', label: 'All Domains' },
                { id: 'dsa', label: 'Algorithms & DSA' },
                { id: 'calculus', label: 'Calculus & ML' },
                { id: 'systems', label: 'System Design' },
              ].map(tab => {
                const isActive = activeDomainFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`text-xs font-mono px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#181A20] text-[#F4F4F6] font-medium border border-white/[0.1] shadow-xs'
                        : 'text-[#9496A1] hover:text-[#F4F4F6] border border-transparent'
                    }`}
                    onClick={() => setActiveDomainFilter(tab.id as any)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Responsive Precision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
            {filteredCards.map(concept => (
              <InteractiveConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => onSelectPrompt(concept.prompt)}
              />
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* ZONE 3: Cognitive Topology DAG & BKT Mastery Matrix               */}
        {/* ================================================================= */}
        <section className="w-full flex flex-col gap-4">
          {/* Section Header */}
          <div className="border-b border-white/[0.05] pb-3">
            <div className="text-[11px] font-mono tracking-[0.08em] text-[#5E606E] uppercase">
              02 / COGNITIVE TOPOLOGY &amp; PREREQUISITE GRAPH
            </div>
            <h2 className="text-base font-medium text-[#F4F4F6] mt-0.5">
              Concept Dependency DAG &amp; BKT Mastery
            </h2>
          </div>

          {/* 2D SVG Directed Acyclic Graph */}
          <KnowledgeTopology onSelectTopic={onSelectPrompt} />
        </section>

      </div>
    </div>
  );
};
