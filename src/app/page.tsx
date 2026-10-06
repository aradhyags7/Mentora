'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Sidebar, RecentLessonItem } from '../components/layout/Sidebar';
import { RightContextPanel } from '../components/layout/RightContextPanel';
import { HomeDashboard } from '../components/dashboard/HomeDashboard';
import { ChatContainer, ChatMessage } from '../components/chat/ChatContainer';
import { FullscreenLessonModal } from '../components/dashboard/FullscreenLessonModal';
import { ApiKeyModal } from '../components/chat/ApiKeyModal';
import { ArtifactRegistry, RegisteredArtifact } from '../lib/artifacts/registry';
import { AiProvider } from '../types/ai';
import { KineticTimeline } from '../types/kinetic';
import '../styles/globals.css';
import '../styles/player.css';

export default function MentoraAppPage() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Shell Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeView, setActiveView] = useState<'home' | 'conversation'>('home');

  // AI & API Key state
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Voice mode state
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Fullscreen expanded lesson modal
  const [fullscreenTimeline, setFullscreenTimeline] = useState<KineticTimeline | null>(null);

  // Active Lesson Context
  const [activeArtifact, setActiveArtifact] = useState<RegisteredArtifact | undefined>(() => 
    ArtifactRegistry.get('cs.binary_search')
  );

  // Recent Lessons list from ArtifactRegistry
  const recentLessons: RecentLessonItem[] = [
    { id: '1', semanticKey: 'cs.binary_search', title: 'Binary Search', domain: 'Algorithms' },
    { id: '2', semanticKey: 'math.derivative', title: 'Calculus: Derivatives', domain: 'Calculus' },
    { id: '3', semanticKey: 'cs.binary_search', title: 'Operating Systems & Memory', domain: 'Systems' },
    { id: '4', semanticKey: 'math.derivative', title: 'Physics: Rate of Change', domain: 'Physics' },
  ];

  // Conversation Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeKey = provider === 'gemini' ? geminiKey : openaiKey;

  // Handle starting a new lesson
  const handleNewLesson = () => {
    setActiveView('home');
    setActiveNav('home');
    setMessages([]);
  };

  // Handle selecting a recent or continue lesson
  const handleSelectLesson = (semanticKey: string) => {
    const art = ArtifactRegistry.get(semanticKey) || ArtifactRegistry.get('cs.binary_search');
    if (!art) return;

    setActiveArtifact(art);
    setActiveView('conversation');
    setActiveNav('explore');

    // Create introductory message with the inline lesson artifact
    setMessages([
      {
        id: `msg_lesson_${Date.now()}`,
        role: 'assistant',
        content: `Let's understand **${art.title}** from first principles. Watch how the core invariants evolve step-by-step:`,
        timeline: art.timeline,
      },
    ]);
  };

  // Handle sending a conversational message
  const handleSendMessage = async (userPrompt: string, teachMeMode: boolean) => {
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

    // Check if query matches a registered artifact
    const matchedArtifact = ArtifactRegistry.findByQuery(query);
    if (matchedArtifact) {
      setActiveArtifact(matchedArtifact);
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-provider': provider,
      };

      if (activeKey) {
        headers['x-api-key'] = activeKey;
      }

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          concept: query,
          userContext: teachMeMode ? 'Teach me conceptually from first principles rather than simply giving the answer.' : undefined,
          provider,
          apiKey: activeKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Fallback: If no API key is configured but user asked about one of our topics
        if (matchedArtifact) {
          setMessages(prev => [
            ...prev,
            {
              id: `a_${Date.now()}`,
              role: 'assistant',
              content: `Here is the visual lesson for **${matchedArtifact.title}**:`,
              timeline: matchedArtifact.timeline,
            },
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `a_${Date.now()}`,
              role: 'assistant',
              content: 'Could not generate visual timeline for this concept.',
              error: data.error || 'Request failed. Click the Connect Key button above to add your Gemini or OpenAI API key.',
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
          },
        ]);
      }
    } catch (err: any) {
      // Offline fallback for demo topics
      if (matchedArtifact) {
        setMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: `Here is the visual lesson for **${matchedArtifact.title}**:`,
            timeline: matchedArtifact.timeline,
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
      {/* Top Bar */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen(prev => !prev)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        activeTopic={activeArtifact?.title}
        hasActiveArtifact={hasActiveArtifact}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeProvider={provider}
        hasKeyConfigured={Boolean(activeKey)}
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
          onOpenSettings={() => setIsSettingsOpen(true)}
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
            />
          )}
        </main>

        {/* Right Context Panel (Variables & Outline) */}
        <RightContextPanel
          isOpen={rightPanelOpen}
          onClose={() => setRightPanelOpen(false)}
          title={activeArtifact?.title || 'Lesson Context'}
          variables={activeArtifact?.variables || []}
          outline={activeArtifact?.outline || []}
        />
      </div>

      {/* Fullscreen Expanded Lesson Modal */}
      <FullscreenLessonModal
        timeline={fullscreenTimeline}
        onClose={() => setFullscreenTimeline(null)}
      />

      {/* Ephemeral Per-Session API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeProvider={provider}
        geminiKey={geminiKey}
        openaiKey={openaiKey}
        onSaveKeys={(p, g, o) => {
          setProvider(p);
          setGeminiKey(g);
          setOpenaiKey(o);
        }}
      />
    </div>
  );
}
