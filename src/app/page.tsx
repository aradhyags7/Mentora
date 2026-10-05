'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardView } from '@/components/BoardView';
import { SubjectId, DialogueMessage } from '@/types/classroom';
import { LESSONS } from '@/data/mockLessons';
import { 
  Plus, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowUp, 
  Mic, 
  MicOff, 
  PenTool, 
  Square,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VirtualClassroomPage() {
  const [currentSubject, setCurrentSubject] = useState<SubjectId>('calculus');
  const activeLesson = LESSONS[currentSubject];

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isInkMode, setIsInkMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted so it doesn't sound robotic unless requested
  const [inputText, setInputText] = useState<string>('');

  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: 'm1',
      sender: 'teacher',
      text: activeLesson.initialTeacherSpeech,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Natural Speech Synthesis (only when unmuted)
  const speakText = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const handleSelectLesson = (subjectId: SubjectId) => {
    setCurrentSubject(subjectId);
    const newLesson = LESSONS[subjectId];
    setMessages([
      {
        id: `m_${Date.now()}`,
        sender: 'teacher',
        text: newLesson.initialTeacherSpeech,
        timestamp: 'Just now'
      }
    ]);
    speakText(newLesson.initialTeacherSpeech);
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSubmitMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: DialogueMessage = {
      id: `u_${Date.now()}`,
      sender: 'student',
      text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = "";

      if (text.toLowerCase().includes('delta x = 0') || text.toLowerCase().includes("can't we simply set")) {
        reply = "If we directly set Δx = 0, the fraction becomes 0/0, which has no mathematical meaning. That is why we take the limit: Δx gets closer and closer to 0, allowing us to find the exact slope without ever dividing by zero.";
      } else if (text.toLowerCase().includes('visual') || text.toLowerCase().includes('steepen')) {
        reply = "Take a look at the graph on the right. When you slide Δx down toward zero, point Q moves along the curve until it coincides with point P. The secant line transforms directly into the tangent line with slope m = 2.";
      } else if (text.toLowerCase().includes('step') || text.toLowerCase().includes('solve') || text.toLowerCase().includes('algebra')) {
        reply = "Let's expand the algebra: (x+Δx)² becomes x² + 2xΔx + (Δx)². Subtracting x² leaves 2xΔx + (Δx)². Dividing by Δx gives 2x + Δx. As Δx approaches zero, the result is simply 2x.";
      } else if (text.toLowerCase().includes('sorted') || text.toLowerCase().includes('binary')) {
        reply = "Binary search requires order because that's what guarantees the answer is in one half. If the middle number is smaller than the target, every number before it is also smaller, so we can discard the entire first half.";
      } else if (text.toLowerCase().includes('45') || text.toLowerCase().includes('angle')) {
        reply = "In physics, range depends on sin(2θ). The sine function reaches its maximum at 90°, so 2θ = 90° means 45° produces the greatest horizontal travel.";
      } else {
        reply = `That's a thoughtful question on ${activeLesson.title}. Watch how the interactive board on the right responds as we test this.`;
      }

      const teacherMsg: DialogueMessage = {
        id: `t_${Date.now()}`,
        sender: 'teacher',
        text: reply,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, teacherMsg]);
      speakText(reply);
    }, 700);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSubmitMessage("Why does the slope approach 2 as delta x shrinks to zero?");
      }, 3000);
    }
  };

  return (
    <div className="mentora-container">
      {/* 1. Natural Left Sidebar (Claude / ChatGPT style) */}
      <aside className="mentora-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-brand-name">Mentora</span>
        </div>

        <button 
          className="new-session-btn"
          onClick={() => handleSelectLesson('calculus')}
        >
          <span>New lesson</span>
          <Plus size={15} />
        </button>

        <div className="sidebar-section-title">Topics</div>
        <div className="sidebar-lessons-list">
          {Object.values(LESSONS).map((item) => {
            const isActive = item.id === currentSubject;
            return (
              <button
                key={item.id}
                className={`sidebar-lesson-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectLesson(item.id as SubjectId)}
              >
                <span>{item.title.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <span>Active Session</span>
        </div>
      </aside>

      {/* 2. Main Area: Topbar + Split Content */}
      <main className="mentora-main">
        {/* Minimal Natural Topbar */}
        <header className="topbar-simple">
          <div className="topbar-breadcrumb">
            <span className="topbar-topic-parent">{activeLesson.category}</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="topbar-topic-current">{activeLesson.title}</span>
          </div>

          <div className="topbar-controls-right">
            {isSpeaking && (
              <button 
                className="topbar-icon-button"
                onClick={handleStopSpeaking}
                title="Pause speaking"
                style={{ color: '#E11D48' }}
              >
                <Square size={14} fill="#E11D48" />
              </button>
            )}

            <button 
              className="topbar-icon-button"
              onClick={() => {
                if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Turn on voice" : "Turn off voice"}
              style={{ color: isMuted ? 'var(--text-muted)' : '#2563EB' }}
            >
              {isMuted ? <VolumeX size={15} /> : <Headphones size={15} />}
            </button>

            <button 
              className="topbar-icon-button"
              onClick={() => handleSelectLesson(currentSubject)}
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </header>

        {/* Split Screen: Conversational Chat (Left 45%), Interactive Board (Right 55%) */}
        <div className="split-content">
          {/* Chat Stream */}
          <div className="chat-column">
            <div className="chat-messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'student' ? 'user' : 'teacher'}`}>
                  <div className={`chat-avatar ${msg.sender === 'student' ? 'user' : 'teacher'}`}>
                    {msg.sender === 'student' ? 'Y' : 'M'}
                  </div>

                  <div className="chat-bubble-content">
                    <span className="chat-sender-name">
                      {msg.sender === 'student' ? 'You' : 'Mentora'}
                    </span>
                    <div className="chat-message-text">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="chat-input-wrapper">
              <div className="suggestion-chips-row">
                {activeLesson.socraticSuggestions.slice(0, 3).map((chip, idx) => (
                  <button
                    key={idx}
                    className="clean-chip"
                    onClick={() => handleSubmitMessage(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="chat-input-box">
                <input
                  type="text"
                  placeholder={isRecording ? "Listening..." : "Message Mentora..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitMessage(inputText);
                  }}
                />

                <div className="chat-tools-group">
                  <button
                    className={`tool-icon-btn ${isInkMode ? 'active' : ''}`}
                    onClick={() => setIsInkMode(!isInkMode)}
                    title="Write on the board"
                  >
                    <PenTool size={15} />
                  </button>

                  <button
                    className={`tool-icon-btn ${isRecording ? 'active' : ''}`}
                    onClick={toggleRecording}
                    title="Voice input"
                  >
                    {isRecording ? <MicOff size={15} color="#E11D48" /> : <Mic size={15} />}
                  </button>

                  <button
                    className="send-arrow-btn"
                    onClick={() => handleSubmitMessage(inputText)}
                    disabled={!inputText.trim()}
                  >
                    <ArrowUp size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Interactive Board (Natural notebook/canvas feel) */}
          <BoardView
            currentSubject={currentSubject}
            lesson={activeLesson}
            isInkMode={isInkMode}
            onToggleInkMode={() => setIsInkMode(!isInkMode)}
            onStudentWorkEvaluated={(isCorrect, feedback) => {
              const msg: DialogueMessage = {
                id: `eval_${Date.now()}`,
                sender: 'teacher',
                text: feedback,
                timestamp: 'Just now'
              };
              setMessages(prev => [...prev, msg]);
            }}
          />
        </div>
      </main>
    </div>
  );
}
