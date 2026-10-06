'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Paperclip, 
  Plus, 
  PenLine, 
  Mic, 
  MicOff, 
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Props {
  onSendMessage: (text: string, teachMeMode: boolean) => void;
  isLoading: boolean;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  isSpeaking?: boolean;
}

export const MessageComposer: React.FC<Props> = ({
  onSendMessage,
  isLoading,
  isVoiceActive,
  onToggleVoice,
  isSpeaking = false,
}) => {
  const [text, setText] = useState('');
  const [teachMeMode, setTeachMeMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim(), teachMeMode);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="composer-capsule-wrapper">
      {/* Voice status banner if active */}
      {isVoiceActive && (
        <div className="voice-wave-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="wave-dot" />
            <span className="wave-dot" />
            <span className="wave-dot" />
          </div>
          <span>
            {isSpeaking 
              ? 'Mentora is speaking ──────●──────' 
              : 'Listening to your question...'}
          </span>
        </div>
      )}

      {/* Main Composer Capsule */}
      <div className="composer-capsule">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Ask Mentora anything you want to learn..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />

        {/* Toolbar */}
        <div className="composer-toolbar">
          <div className="composer-tools-left">
            <button
              type="button"
              className="composer-tool-btn"
              title="Add attachment"
              onClick={() => alert('Attachments: PDF, Image, Code reference supported.')}
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              className="composer-tool-btn"
              title="Attach document or screenshot"
              onClick={() => alert('Document attachment supported.')}
            >
              <Paperclip size={14} />
            </button>
            <button
              type="button"
              className="composer-tool-btn"
              title="Handwriting & math sketching canvas"
              onClick={() => alert('Handwriting canvas supported.')}
            >
              <PenLine size={14} />
            </button>

            {/* "Don't give me the answer. Teach me." Pedagogical Toggle */}
            <button
              type="button"
              className={`teach-me-toggle ${teachMeMode ? 'active' : ''}`}
              onClick={() => setTeachMeMode(prev => !prev)}
              title={teachMeMode ? 'Pedagogical Socratic teaching mode active' : 'Direct answer mode'}
            >
              <BookOpen size={12} />
              <span>{teachMeMode ? 'Teach me' : 'Direct answer'}</span>
            </button>
          </div>

          <div className="composer-tools-right">
            {/* Subtle Voice Toggle */}
            <button
              type="button"
              className={`voice-btn ${isVoiceActive ? 'active' : ''}`}
              onClick={onToggleVoice}
              title={isVoiceActive ? 'Mute microphone' : 'Start voice conversation'}
            >
              {isVoiceActive ? <MicOff size={13} /> : <Mic size={13} />}
              <span>{isVoiceActive ? 'Active' : 'Voice'}</span>
            </button>

            {/* Send Button */}
            <button
              type="button"
              className="send-btn"
              disabled={!text.trim() || isLoading}
              onClick={handleSubmit}
              title="Send message (Enter)"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ArrowUp size={16} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
