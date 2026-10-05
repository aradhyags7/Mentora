'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TeachingArtifactSpec } from '@/types/artifacts';
import { ArtifactRenderer } from '@/components/artifacts/ArtifactRenderer';
import { 
  Plus, 
  ArrowUp, 
  Mic, 
  MicOff, 
  Headphones, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function MentoraConversationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (promptText: string) => {
    const query = promptText.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: 'Just now',
        artifact: data.artifact
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(data.text);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an issue processing that concept. Let's try rephrasing or asking another question.",
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setInputText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Native Speech Recognition if available
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsRecording(false);
          handleSendMessage(transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => {
          setIsRecording(false);
        }, 2000);
      }
    }
  };

  return (
    <div className="mentora-app">
      {/* 1. Left Sidebar */}
      <aside className="mentora-sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#111827',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={14} />
            </div>
            <span className="sidebar-brand">Mentora</span>
          </div>
        </div>

        <button className="sidebar-new-btn" onClick={handleNewChat}>
          <span>New session</span>
          <Plus size={15} />
        </button>

        <div className="sidebar-history-list">
          <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>
            Active Session
          </div>
          {messages.length > 0 ? (
            <div style={{ padding: '8px 10px', fontSize: '0.8rem', color: '#374151', lineHeight: 1.4 }}>
              Current discussion: {messages[0].text.slice(0, 36)}...
            </div>
          ) : (
            <div style={{ padding: '8px 10px', fontSize: '0.76rem', color: '#9CA3AF' }}>
              No previous messages
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <span>Mentora AI</span>
        </div>
      </aside>

      {/* 2. Main Conversational Column */}
      <main className="mentora-chat-main">
        {/* Topbar */}
        <header className="chat-topbar">
          <div className="topbar-brand-title">
            Mentora
          </div>

          <div className="topbar-actions">
            <button 
              className="topbar-action-icon"
              onClick={() => {
                if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Turn on voice" : "Turn off voice"}
              style={{ color: isMuted ? '#9CA3AF' : '#2563EB' }}
            >
              {isMuted ? <VolumeX size={15} /> : <Headphones size={15} />}
            </button>

            <button 
              className="topbar-action-icon"
              onClick={handleNewChat}
              title="Reset conversation"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div className="chat-scroll-area">
          <div className="chat-inner-container">
            {/* Clean Open Home State without canned prompt cards */}
            {messages.length === 0 ? (
              <div className="welcome-hero" style={{ marginTop: '80px' }}>
                <h1 className="welcome-title">What would you like to understand?</h1>
                <p className="welcome-subtitle">
                  Ask any concept in mathematics, computer science, physics, or engineering. Mentora materializes interactive visual models directly inside the explanation.
                </p>
              </div>
            ) : (
              /* Real Message Stream with Live Interactive Visualizations */
              messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'user' : 'assistant'}`}>
                  <div className={`message-avatar ${msg.sender === 'user' ? 'user' : 'teacher'}`}>
                    {msg.sender === 'user' ? 'Y' : 'M'}
                  </div>

                  <div className="message-body">
                    <span className="message-sender-name">
                      {msg.sender === 'user' ? 'You' : 'Mentora'}
                    </span>
                    <div className="message-text">
                      {msg.text}
                    </div>

                    {/* DYNAMIC ARTIFACT EMBEDDED INLINE */}
                    {msg.artifact && (
                      <ArtifactRenderer artifact={msg.artifact} />
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="message-row assistant">
                <div className="message-avatar teacher">M</div>
                <div className="message-body">
                  <span className="message-sender-name">Mentora</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '0.88rem' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing concept and constructing visual model...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Bottom Input Capsule (ChatGPT / Claude style) */}
        <div className="input-dock-container">
          <div className="input-dock-inner">
            <div className="floating-input-capsule">
              <input
                type="text"
                placeholder={isRecording ? "Listening to your voice..." : "Ask any concept... (e.g. 'Why is binary search O(log n)?', 'Explain CPU pipeline', 'How do derivatives work?')..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputText);
                }}
              />

              <div className="input-buttons-group">
                <button
                  className={`capsule-icon-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  title="Voice input"
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <button
                  className="capsule-send-btn"
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isLoading}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
