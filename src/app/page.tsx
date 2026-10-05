'use client';

import React, { useState } from 'react';
import { ChatContainer, ChatMessage } from '../components/chat/ChatContainer';
import { InputCapsule } from '../components/chat/InputCapsule';
import { ApiKeyModal } from '../components/chat/ApiKeyModal';
import { AiProvider } from '../types/ai';
import { KineticTimeline } from '../types/kinetic';
import { Sparkles, Key } from 'lucide-react';
import fixtureBinarySearch from '../../fixtures/binary-search.timeline.json';
import { validateAndCompileTimeline } from '../lib/engine/validator';

export default function MentoraPage() {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with the hand-authored golden reference lesson
  const initialLesson = validateAndCompileTimeline(fixtureBinarySearch as unknown as KineticTimeline);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: 'Welcome to Mentora. I turn abstract concepts into generative kinetic visual lessons with synchronized animations, camera zooms, and hand-drawn callouts. Below is a reference demonstration of Binary Search.',
      timeline: initialLesson,
    },
  ]);

  const activeKey = provider === 'gemini' ? geminiKey : openaiKey;

  const handleSendMessage = async (userPrompt: string) => {
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userPrompt,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

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
          concept: userPrompt,
          provider,
          apiKey: activeKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            content: 'Could not generate visual timeline for this concept.',
            error: data.error || 'Request failed. If you haven\'t added an API key, click the Key button below to add your Gemini or OpenAI API key.',
          },
        ]);
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
      setMessages(prev => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: 'Error connecting to the explainer service.',
          error: err?.message || 'Network error occurred.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
      color: '#0F172A',
    }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #F1F5F9',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: '#2563EB',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' }}>
              MENTORA
            </h1>
          </div>
          <span style={{
            fontSize: 11,
            color: '#64748B',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '2px 8px',
            borderRadius: 12,
            fontWeight: 500,
            marginLeft: 4,
          }}>
            Kinetic Engine v2.0
          </span>
        </div>

        {/* Top Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: activeKey ? '#059669' : '#475569',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Key size={14} />
            <span>{activeKey ? `${provider.toUpperCase()} (Connected)` : 'Connect API Key'}</span>
          </button>
        </div>
      </header>

      {/* Main Chat Thread with Inline Kinetic Explainer */}
      <ChatContainer messages={messages} isLoading={isLoading} />

      {/* Input Dock */}
      <InputCapsule
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeProvider={provider}
        hasKeyConfigured={Boolean(activeKey)}
      />

      {/* API Key Modal */}
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
