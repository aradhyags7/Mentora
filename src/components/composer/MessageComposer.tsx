'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Plus, 
  Paperclip,
  Edit3,
  Mic, 
  MicOff, 
  Loader2,
  Sparkles
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
  const [visualMode, setVisualMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(180, textareaRef.current.scrollHeight)}px`;
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
    onSendMessage(text.trim(), visualMode);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const hasText = text.trim().length > 0;

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
              ? 'Mentora is speaking...' 
              : 'Listening to your question...'}
          </span>
        </div>
      )}

      {/* ChatGPT-style clean Input Capsule */}
      <div className="composer-capsule">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Message Mentora..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />

        {/* Bottom Toolbar */}
        <div className="composer-toolbar">
          <div className="composer-tools-left">
            {/* Attachment Button */}
            <button
              type="button"
              className="composer-plus-btn"
              title="Add attachment"
              onClick={() => alert('Attachments: Document, image, or problem set upload.')}
            >
              <Plus size={16} />
            </button>

            <button
              type="button"
              className="composer-plus-btn"
              title="Attach PDF or document"
              onClick={() => alert('Document attachment supported.')}
            >
              <Paperclip size={15} />
            </button>

            <button
              type="button"
              className="composer-plus-btn"
              title="Digital handwriting & math sketch"
              onClick={() => alert('Digital handwriting sketchpad active.')}
            >
              <Edit3 size={15} />
            </button>

            {/* Mentora Teaching Mode Toggle */}
            <button
              type="button"
              className={`composer-canvas-pill ${visualMode ? 'active' : ''}`}
              onClick={() => setVisualMode(prev => !prev)}
              title={visualMode ? 'Mentora Teaching Mode enabled' : 'Plain chat mode'}
            >
              <Sparkles size={13} />
              <span>Mentora Plugin</span>
            </button>
          </div>

          <div className="composer-tools-right">
            {/* Voice Mic Button */}
            <button
              type="button"
              className={`composer-tool-btn ${isVoiceActive ? 'active' : ''}`}
              onClick={onToggleVoice}
              title={isVoiceActive ? 'Mute microphone' : 'Voice input'}
            >
              {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* ChatGPT Circular Send Button with Up Arrow */}
            <button
              type="button"
              className={`send-btn ${hasText && !isLoading ? 'ready' : ''}`}
              disabled={!hasText || isLoading}
              onClick={handleSubmit}
              title="Send message (Enter)"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUp size={17} strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
