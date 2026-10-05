'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PenTool, Send, Sparkles, HelpCircle, StopCircle } from 'lucide-react';

interface MultimodalInputDockProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  isInkMode: boolean;
  onToggleInkMode: () => void;
  socraticSuggestions: string[];
  onSelectSuggestion: (text: string) => void;
  onSubmitText: (text: string) => void;
  onBargeIn: () => void;
  teacherIsSpeaking: boolean;
}

export const MultimodalInputDock: React.FC<MultimodalInputDockProps> = ({
  isRecording,
  onToggleRecording,
  isInkMode,
  onToggleInkMode,
  socraticSuggestions,
  onSelectSuggestion,
  onSubmitText,
  onBargeIn,
  teacherIsSpeaking
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitText(inputText);
    setInputText('');
  };

  return (
    <footer className="multimodal-input-dock">
      {/* Socratic Suggestions Chips Row */}
      <div className="socratic-prompts-bar">
        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={11} color="var(--accent-violet)" />
          <span>Try asking:</span>
        </span>
        {socraticSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            className="socratic-chip"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Dock Controls Row */}
      <div className="dock-controls-row">
        {/* Voice Input Button */}
        <button
          className={`voice-mic-btn ${isRecording ? 'active' : ''}`}
          onClick={onToggleRecording}
          title={isRecording ? 'Stop Voice Recording' : 'Hold or Click to Speak with Teacher'}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Digital Ink Toggle */}
        <button
          className={`ink-toggle-btn ${isInkMode ? 'active' : ''}`}
          onClick={onToggleInkMode}
          title="Toggle Digital Ink & Handwriting Canvas"
        >
          <PenTool size={16} />
          <span>{isInkMode ? 'Ink Active' : 'Draw / Ink'}</span>
        </button>

        {/* Barge-In / Interruption Button if Teacher is speaking */}
        {teacherIsSpeaking && (
          <button
            onClick={onBargeIn}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#FDA4AF',
              padding: '0 12px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Interrupt the teacher to ask a clarifying question"
          >
            <StopCircle size={15} />
            <span>Interrupt ("Wait!")</span>
          </button>
        )}

        {/* Text Input Field */}
        <form onSubmit={handleSubmit} className="dock-input-wrapper">
          <input
            type="text"
            className="dock-text-input"
            placeholder={isRecording ? "Listening to your voice..." : "Ask your AI teacher anything, type a step, or explore..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="dock-send-btn"
            disabled={!inputText.trim()}
            style={{ opacity: inputText.trim() ? 1 : 0.4 }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </footer>
  );
};
