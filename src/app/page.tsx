'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Sidebar, RecentLessonItem } from '../components/layout/Sidebar';
import { RightContextPanel } from '../components/layout/RightContextPanel';
import { HomeDashboard } from '../components/dashboard/HomeDashboard';
import { ChatContainer, ChatMessage } from '../components/chat/ChatContainer';
import { FullscreenLessonModal } from '../components/dashboard/FullscreenLessonModal';
import { ArtifactRegistry, RegisteredArtifact } from '../lib/artifacts/registry';
import { KineticTimeline } from '../types/kinetic';
import { LessonPlanner } from '../lib/pedagogy/lessonPlanner';
import { GlobalStudentModel } from '../lib/pedagogy/studentModel';
import { PedagogicalPolicyEngine } from '../lib/pedagogy/pedagogicalPolicy';
import { AdaptiveLessonEngine } from '../lib/pedagogy/adaptiveLessonEngine';
import { EvaluationResult, StudentState } from '../types/pedagogy';
import { TeachingActionType, TeachingMode } from '../types/teachingDsl';
import '../styles/globals.css';
import '../styles/player.css';

export default function MentoraAppPage() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('mentora_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // Apply theme to document element and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mentora_theme', theme);
  }, [theme]);

  // Shell Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeView, setActiveView] = useState<'home' | 'conversation'>('home');
  const [isLoading, setIsLoading] = useState(false);

  // Student Model & Pedagogical State
  const [studentState, setStudentState] = useState<StudentState>(() => GlobalStudentModel.getState());
  const [activeConceptKey, setActiveConceptKey] = useState<string>('math.derivative');
  const [activeAction, setActiveAction] = useState<TeachingActionType>('VISUALIZE');
  const [activeMode, setActiveMode] = useState<TeachingMode>('visual');

  // Voice mode state
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Fullscreen expanded lesson modal
  const [fullscreenTimeline, setFullscreenTimeline] = useState<KineticTimeline | null>(null);

  // Active Lesson Context
  const [activeArtifact, setActiveArtifact] = useState<RegisteredArtifact | undefined>(() => 
    ArtifactRegistry.get('math.derivative') || ArtifactRegistry.get('cs.binary_search')
  );

  // Recent Lessons list from ArtifactRegistry
  const recentLessons: RecentLessonItem[] = [
    { id: '1', semanticKey: 'math.derivative', title: 'Calculus: Derivatives', domain: 'Calculus' },
    { id: '2', semanticKey: 'cs.binary_search', title: 'Binary Search', domain: 'Algorithms' },
    { id: '3', semanticKey: 'cs.binary_search', title: 'Operating Systems & Memory', domain: 'Systems' },
    { id: '4', semanticKey: 'math.derivative', title: 'Physics: Rate of Change', domain: 'Physics' },
  ];

  // Conversation Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Handle starting a new lesson
  const handleNewLesson = () => {
    setActiveView('home');
    setActiveNav('home');
    setMessages([]);
  };

  // Handle selecting a recent or continue lesson
  const handleSelectLesson = (semanticKey: string) => {
    const art = ArtifactRegistry.get(semanticKey) || ArtifactRegistry.get('math.derivative') || ArtifactRegistry.get('cs.binary_search');
    if (!art) return;

    setActiveArtifact(art);
    setActiveConceptKey(semanticKey);
    setActiveView('conversation');
    setActiveNav('explore');

    const { planState } = LessonPlanner.planInitialLesson(art.title);
    setActiveAction(planState.currentAction);
    setActiveMode(planState.currentMode);

    // Create introductory message with the inline lesson artifact and Socratic checkpoint
    setMessages([
      {
        id: `msg_lesson_${Date.now()}`,
        role: 'assistant',
        content: `Let's understand **${art.title}** from first principles. Watch how the core invariants evolve step-by-step:`,
        timeline: art.timeline,
        socraticQuestion: planState.activeQuestion ? {
          prompt: planState.activeQuestion.prompt,
          concept: planState.concept,
          hints: planState.activeQuestion.hints,
        } : undefined,
      },
    ]);
  };

  // Handle Socratic answer evaluation feedback & adaptive follow-up
  const handleSocraticEvaluation = (result: EvaluationResult) => {
    // 1. Update live cognitive model in student state
    const updatedState = GlobalStudentModel.getState();
    setStudentState(updatedState);

    // 2. Run Pedagogical Policy Engine
    const decision = PedagogicalPolicyEngine.selectNextAction({
      studentState: updatedState,
      concept: result.concept,
      consecutiveSuccesses: result.isCorrect ? 1 : 0,
      consecutiveFailures: result.isCorrect ? 0 : 1,
      currentMode: result.recommendedMode,
      lastAction: result.recommendedAction,
    });

    setActiveAction(decision.action);
    setActiveMode(decision.mode);

    // 3. Generate adaptive pedagogical beat (remediation or advancement)
    const adaptiveBeat = AdaptiveLessonEngine.generateNextBeat(result.concept, result, decision);

    // 4. Create assistant follow-up message with adaptive timeline and checkpoint
    const adaptiveMsg: ChatMessage = {
      id: `a_adaptive_${Date.now()}`,
      role: 'assistant',
      content: adaptiveBeat.messageContent,
      timeline: adaptiveBeat.timeline,
      socraticQuestion: adaptiveBeat.nextQuestion ? {
        prompt: adaptiveBeat.nextQuestion.prompt,
        concept: adaptiveBeat.nextQuestion.concept,
        hints: adaptiveBeat.nextQuestion.hints,
      } : undefined,
    };

    setMessages(prev => [...prev, adaptiveMsg]);
  };

  // Handle resetting student model to initial priors
  const handleResetStudentState = () => {
    const fresh = GlobalStudentModel.getState();
    fresh.concepts = {
      'math.algebra': 0.88,
      'math.functions': 0.79,
      'math.limits': 0.42,
      'math.derivative': 0.25,
      'cs.array': 0.90,
      'cs.binary_search': 0.40,
    };
    fresh.misconceptions = [];
    fresh.recent_errors = [];
    fresh.totalInteractions = 0;
    fresh.lastUpdated = new Date().toISOString();
    setStudentState({ ...fresh });
  };

  // Handle sending a conversational message
  const handleSendMessage = async (userPrompt: string, teachMeMode: boolean, lens?: string) => {
    const query = userPrompt.trim();
    if (!query || isLoading) return;

    setActiveView('conversation');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userPrompt,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Dynamic Pedagogical Lesson Plan
    const { planState, artifact: plannedArtifact } = LessonPlanner.planInitialLesson(query);
    const matchedArtifact = ArtifactRegistry.findByQuery(query) || plannedArtifact;
    if (matchedArtifact) {
      setActiveArtifact(matchedArtifact);
      setActiveConceptKey(matchedArtifact.semanticKey);
    }
    setActiveAction(planState.currentAction);
    setActiveMode(planState.currentMode);

    const lensInstructions: Record<string, string> = {
      visual: 'Synthesize interactive visual diagrams, spatial animations, and visual proofs directly on the whiteboard canvas.',
      first_principles: 'Teach strictly from first principles and foundational axioms, deriving mathematical invariants step-by-step.',
      socratic: 'Use Socratic dialogue: do not simply lecture; guide me step-by-step by checking intuition and asking targeted questions.',
      intuition: 'Focus on visceral geometric intuition and real-world physical analogies before introducing equations.',
    };

    const pedagogicalContext = lens && lensInstructions[lens]
      ? lensInstructions[lens]
      : (teachMeMode ? 'Teach me conceptually from first principles rather than simply giving the answer.' : undefined);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: query,
          userContext: pedagogicalContext,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Fallback to planned/reference artifact
        if (matchedArtifact) {
          setMessages(prev => [
            ...prev,
            {
              id: `a_${Date.now()}`,
              role: 'assistant',
              content: `Here is the visual lesson for **${matchedArtifact.title}**:`,
              timeline: matchedArtifact.timeline,
              socraticQuestion: planState.activeQuestion ? {
                prompt: planState.activeQuestion.prompt,
                concept: planState.concept,
                hints: planState.activeQuestion.hints,
              } : undefined,
            },
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `a_${Date.now()}`,
              role: 'assistant',
              content: 'Could not generate visual timeline for this concept.',
              error: data.error || 'Unable to synthesize visual explanation. Please try again.',
            },
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: data.summary || `Here is the visual explanation for "${userPrompt}".`,
            timeline: data.timeline,
            socraticQuestion: planState.activeQuestion ? {
              prompt: planState.activeQuestion.prompt,
              concept: planState.concept,
              hints: planState.activeQuestion.hints,
            } : undefined,
          },
        ]);
      }
    } catch (err: any) {
      if (matchedArtifact) {
        setMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: `Here is the visual lesson for **${matchedArtifact.title}**:`,
            timeline: matchedArtifact.timeline,
            socraticQuestion: planState.activeQuestion ? {
              prompt: planState.activeQuestion.prompt,
              concept: planState.concept,
              hints: planState.activeQuestion.hints,
            } : undefined,
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: 'Network error connecting to Mentora explainer service.',
            error: err?.message,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveArtifact = messages.some(m => Boolean(m.timeline));

  return (
    <div className="mentora-workspace">
      {/* Top Bar with Teacher Cognitive Brain Pill */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen(prev => !prev)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        activeTopic={activeArtifact?.title}
        hasActiveArtifact={hasActiveArtifact}
        studentMastery={studentState.concepts[activeConceptKey]}
        activeConcept={activeConceptKey}
        onExpandFullscreen={() => {
          const lastWithTimeline = [...messages].reverse().find(m => m.timeline);
          if (lastWithTimeline?.timeline) {
            setFullscreenTimeline(lastWithTimeline.timeline);
          } else if (activeArtifact?.timeline) {
            setFullscreenTimeline(activeArtifact.timeline);
          }
        }}
      />

      {/* Main Body (Sidebar + Content + Context Panel) */}
      <div className="mentora-body">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          onSelectNav={navId => {
            setActiveNav(navId);
            if (navId === 'home') setActiveView('home');
          }}
          recentLessons={recentLessons}
          activeLessonId={activeArtifact?.semanticKey}
          onSelectLesson={handleSelectLesson}
          onNewLesson={handleNewLesson}
        />

        {/* Center Main Stage */}
        <main className="mentora-main">
          {activeView === 'home' ? (
            <HomeDashboard
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isVoiceActive={isVoiceActive}
              onToggleVoice={() => setIsVoiceActive(prev => !prev)}
              onSelectPrompt={p => handleSendMessage(p, true)}
              onSelectContinueLesson={handleSelectLesson}
            />
          ) : (
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              isVoiceActive={isVoiceActive}
              onToggleVoice={() => setIsVoiceActive(prev => !prev)}
              onExpandArtifact={t => setFullscreenTimeline(t)}
              onToggleContextPanel={() => setRightPanelOpen(prev => !prev)}
              onSocraticEvaluation={handleSocraticEvaluation}
            />
          )}
        </main>

        {/* Right Context Panel (Teacher Brain & BKT + Variables + Outline) */}
        <RightContextPanel
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
          title={activeArtifact?.title || 'Lesson Context'}
          variables={activeArtifact?.variables || []}
          outline={activeArtifact?.outline || []}
          studentState={studentState}
          activeConcept={activeConceptKey}
          activeMode={activeMode}
          activeAction={activeAction}
          onResetStudentState={handleResetStudentState}
        />
      </div>

      {/* Fullscreen Expanded Lesson Modal */}
      <FullscreenLessonModal
        timeline={fullscreenTimeline}
        onClose={() => setFullscreenTimeline(null)}
      />
    </div>
  );
}
