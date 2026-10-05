'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardView } from '@/components/BoardView';
import { SubjectId, PedagogicalMode, TeacherState, DialogueMessage } from '@/types/classroom';
import { LESSONS } from '@/data/mockLessons';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  PenTool, 
  ArrowUp, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Plus, 
  Compass, 
  Sigma, 
  Binary, 
  Bot, 
  StopCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VirtualClassroomPage() {
  const [currentSubject, setCurrentSubject] = useState<SubjectId>('calculus');
  const activeLesson = LESSONS[currentSubject];

  const [teacherState, setTeacherState] = useState<TeacherState>('speaking');
  const [pedagogicalMode, setPedagogicalMode] = useState<PedagogicalMode>(activeLesson.initialMode);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isInkMode, setIsInkMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masteryScore, setMasteryScore] = useState<number>(50);
  const [inputText, setInputText] = useState<string>('');

  const [messages, setMessages] = useState<DialogueMessage[]>([
    {
      id: 'm1',
      sender: 'teacher',
      text: activeLesson.initialTeacherSpeech,
      timestamp: 'Just now',
      actionTrigger: 'Dynamic Board Initialized'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Synthesis
  const speakText = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setTeacherState('speaking');
    utterance.onend = () => setTeacherState('observing');
    utterance.onerror = () => setTeacherState('observing');

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Handle Lesson Switching
  const handleSelectLesson = (subjectId: SubjectId) => {
    setCurrentSubject(subjectId);
    const newLesson = LESSONS[subjectId];
    setPedagogicalMode(newLesson.initialMode);
    setMessages([
      {
        id: `m_${Date.now()}`,
        sender: 'teacher',
        text: newLesson.initialTeacherSpeech,
        timestamp: 'Just now',
        actionTrigger: `${newLesson.title} loaded on canvas`
      }
    ]);
    speakText(newLesson.initialTeacherSpeech);
  };

  // Barge-In / Interrupt
  const handleBargeIn = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTeacherState('listening');
    setMessages(prev => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        sender: 'teacher',
        text: "I stopped speaking. What part should we clarify together?",
        timestamp: 'Just now'
      }
    ]);
  };

  // Submit Student Response
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
    setTeacherState('evaluating');

    setTimeout(() => {
      let reply = "";
      let newMode: PedagogicalMode = pedagogicalMode;

      if (text.toLowerCase().includes('delta x = 0') || text.toLowerCase().includes("can't we simply set")) {
        reply = "Directly setting Δx = 0 gives 0/0, which is undefined! That is why we take the limit: Δx approaches 0 as closely as we want without dividing by zero.";
        newMode = 'socratic';
      } else if (text.toLowerCase().includes('visual') || text.toLowerCase().includes('steepen')) {
        reply = "Observe the interactive canvas on the right! As you drag the Δx scrubber down to zero, Point Q slides along the curve right onto Point P. The secant line becomes the tangent line with slope m = 2.";
        newMode = 'visual';
      } else if (text.toLowerCase().includes('step') || text.toLowerCase().includes('solve') || text.toLowerCase().includes('algebra')) {
        reply = "Algebraically: (x+Δx)² - x² = 2xΔx + (Δx)². Dividing by Δx leaves 2x + Δx. As Δx reaches zero, only 2x remains!";
        newMode = 'worked_example';
      } else if (text.toLowerCase().includes('sorted') || text.toLowerCase().includes('binary')) {
        reply = "Because binary search requires order to make decisions! If mid is smaller than our target, the sorted guarantee lets us discard the entire left half of the array at once.";
        newMode = 'explanation';
      } else if (text.toLowerCase().includes('45') || text.toLowerCase().includes('angle')) {
        reply = "In a vacuum, Range = (v₀² sin(2θ)) / g. The sine function peaks at 90°, which happens when launch angle θ is exactly 45°!";
        newMode = 'demonstration';
      } else {
        reply = `That is a great inquiry on ${activeLesson.title}. Look at how the canvas updates on the right as we analyze this concept step-by-step.`;
      }

      setPedagogicalMode(newMode);
      setTeacherState('speaking');

      const teacherMsg: DialogueMessage = {
        id: `t_${Date.now()}`,
        sender: 'teacher',
        text: reply,
        timestamp: 'Just now',
        actionTrigger: 'Canvas Live Synchronized'
      };

      setMessages(prev => [...prev, teacherMsg]);
      speakText(reply);

      setMasteryScore(prev => {
        const nextScore = Math.min(100, prev + 15);
        if (nextScore >= 90 && prev < 90) {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.55 } });
        }
        return nextScore;
      });
    }, 850);
  };

  // Simulated / Browser Speech
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTeacherState('observing');
    } else {
      setIsRecording(true);
      setTeacherState('listening');
      setTimeout(() => {
        setIsRecording(false);
        handleSubmitMessage("Why does the secant line slope approach 2 as delta x shrinks to zero?");
      }, 3000);
    }
  };

  return (
    <div className="mentora-container">
      {/* 1. Slim Left Sidebar (ChatGPT / Claude style) */}
      <aside className="mentora-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Sparkles size={16} />
            </div>
            <span className="sidebar-brand-name">Mentora</span>
          </div>
        </div>

        <button 
          className="new-session-btn"
          onClick={() => handleSelectLesson('calculus')}
        >
          <span>New Session</span>
          <Plus size={16} />
        </button>

        <div className="sidebar-section-title">Curriculum Topics</div>
        <div className="sidebar-lessons-list">
          {Object.values(LESSONS).map((item) => {
            const isActive = item.id === currentSubject;
            return (
              <button
                key={item.id}
                className={`sidebar-lesson-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectLesson(item.id as SubjectId)}
              >
                {item.id === 'calculus' && <Sigma size={15} color="#4F46E5" />}
                {item.id === 'binary_search' && <Binary size={15} color="#059669" />}
                {item.id === 'physics_projectile' && <Compass size={15} color="#2563EB" />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title.split(':')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <span>Mastery: <strong>{masteryScore}%</strong></span>
          <span style={{ color: '#059669', fontWeight: 600 }}>● Live Teacher</span>
        </div>
      </aside>

      {/* 2. Main Stage (Single Screen Split: Chat on Left, Canvas on Right) */}
      <main className="mentora-main">
        {/* Top bar over the main section */}
        <div className="topbar-simple">
          <div className="topbar-lesson-title">
            <span>{activeLesson.title}</span>
            <span className="pedagogy-badge">
              {pedagogicalMode.toUpperCase()} MODE
            </span>
          </div>

          <div className="topbar-right-controls">
            {teacherState === 'speaking' && (
              <button className="topbar-btn" onClick={handleBargeIn} style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                <StopCircle size={13} />
                <span>Interrupt ("Wait!")</span>
              </button>
            )}

            <button 
              className="topbar-btn"
              onClick={() => {
                if (!isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Unmute voice" : "Mute voice"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            <button 
              className="topbar-btn"
              onClick={() => handleSelectLesson(currentSubject)}
              title="Reset session"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Unified Split Content: Left Chat (44%), Right Live Interactive Canvas (56%) */}
        <div className="split-content">
          {/* Chat Column */}
          <div className="chat-column">
            <div className="chat-messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'student' ? 'user' : 'teacher'}`}>
                  <div className={`chat-avatar ${msg.sender === 'student' ? 'user' : 'teacher'}`}>
                    {msg.sender === 'student' ? 'You' : <Bot size={16} />}
                  </div>

                  <div className="chat-bubble-content">
                    <span className="chat-sender-name">
                      {msg.sender === 'student' ? 'You' : 'Mentora AI'}
                    </span>
                    <div className="chat-message-text">
                      {msg.text}
                    </div>
                    {msg.actionTrigger && (
                      <div className="canvas-preview-chip">
                        <span>✨ Updated Live Canvas: {msg.actionTrigger}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Capsule Dock */}
            <div className="chat-input-wrapper">
              {/* Socratic Suggestions Chips */}
              <div className="socratic-pill-row">
                {activeLesson.socraticSuggestions.slice(0, 3).map((chip, idx) => (
                  <button
                    key={idx}
                    className="socratic-chip-simple"
                    onClick={() => handleSubmitMessage(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Capsule */}
              <div className="input-capsule">
                <input
                  type="text"
                  placeholder={isRecording ? "Listening to your voice..." : "Ask your teacher anything, explore a formula, or request a hint..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitMessage(inputText);
                  }}
                />

                <div className="input-actions-group">
                  <button
                    className={`input-action-icon ${isInkMode ? 'active' : ''}`}
                    onClick={() => setIsInkMode(!isInkMode)}
                    title="Toggle Whiteboard Ink Drawing"
                    style={{ color: isInkMode ? '#4F46E5' : 'var(--text-muted)' }}
                  >
                    <PenTool size={16} />
                  </button>

                  <button
                    className={`input-action-icon ${isRecording ? 'mic-active' : ''}`}
                    onClick={toggleRecording}
                    title={isRecording ? "Stop listening" : "Speak to Mentora"}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  <button
                    className="send-round-btn"
                    onClick={() => handleSubmitMessage(inputText)}
                    disabled={!inputText.trim()}
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Canvas Column (No Tabs, Single Unified View) */}
          <BoardView
            currentSubject={currentSubject}
            lesson={activeLesson}
            isInkMode={isInkMode}
            onToggleInkMode={() => setIsInkMode(!isInkMode)}
            onStudentWorkEvaluated={(isCorrect, feedback) => {
              const msg: DialogueMessage = {
                id: `eval_${Date.now()}`,
                sender: 'teacher',
                text: `I analyzed your handwriting on the board: ${feedback}`,
                timestamp: 'Just now'
              };
              setMessages(prev => [...prev, msg]);
              speakText(`I analyzed your handwriting on the board: ${feedback}`);
              setMasteryScore(prev => Math.min(100, prev + 20));
            }}
          />
        </div>
      </main>
    </div>
  );
}
