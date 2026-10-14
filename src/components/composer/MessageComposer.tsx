'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Mic, 
  MicOff, 
  Loader2,
  Paperclip,
  Activity
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
      {/* Precision Voice Waveform Status Banner */}
      {isVoiceActive && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121318] border border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-1.5 h-4 rounded-full bg-emerald-400 animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-2.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:300ms]" />
            </div>
            <span className="text-xs font-mono text-[#9496A1]">
              {isSpeaking 
                ? 'Mentora voice synthesis streaming...' 
                : 'Real-time microphone open — interrupt teacher anytime'}
            </span>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            BARGE-IN ARMED
          </span>
        </div>
      )}

      {/* Frontier Lab Tactile Command Bar */}
      <div className="w-full rounded-2xl bg-[#121318] border border-white/[0.09] focus-within:border-white/[0.22] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-200 p-3.5 flex flex-col gap-2.5">
        {/* Dynamic Contextual Textarea */}
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent border-0 outline-none resize-none text-[15px] leading-relaxed text-[#F4F4F6] placeholder-[#5E606E] min-h-[48px] max-h-[180px] p-0 font-normal"
          placeholder={
            visualMode
              ? "Ask any coding, algorithm, or math question to synthesize a live 4-zone whiteboard..."
              : "Ask a quick question in standard chat mode..."
          }
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />

        {/* Bottom Control Bar inside Composer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          {/* Left Side: Segmented Mode Switch + Capability Tag */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#090A0D] border border-white/[0.06]">
              {/* Live Whiteboard Tab */}
              <button
                type="button"
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  visualMode
                    ? 'bg-[#F4F4F6] text-[#09090B] shadow-xs'
                    : 'text-[#9496A1] hover:text-[#F4F4F6]'
                }`}
                onClick={() => setVisualMode(true)}
                title="Synthesize dynamic 4-zone live whiteboard visual lessons"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${visualMode ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                <span>Live Whiteboard</span>
              </button>

              {/* Standard Chat Tab */}
              <button
                type="button"
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  !visualMode
                    ? 'bg-[#F4F4F6] text-[#09090B] shadow-xs'
                    : 'text-[#5E606E] hover:text-[#9496A1]'
                }`}
                onClick={() => setVisualMode(false)}
                title="Standard conversational chat mode"
              >
                <span>Standard Chat</span>
              </button>
            </div>

            {/* Desktop Capability Tag */}
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-[#5E606E] tracking-tight">
              4-Zone Spatial • Voice Sync
            </span>
          </div>

          {/* Right Side: Voice Mic + Submit Button */}
          <div className="flex items-center gap-2">
            {/* Voice Mic Button */}
            <button
              type="button"
              className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                isVoiceActive
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'border-white/[0.07] hover:bg-white/[0.05] text-[#9496A1] hover:text-[#F4F4F6]'
              }`}
              onClick={onToggleVoice}
              title={isVoiceActive ? 'Disable voice barge-in' : 'Enable voice & real-time speech'}
              aria-label="Toggle voice microphone"
            >
              {isVoiceActive ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* High-Contrast Submit Button */}
            <button
              type="button"
              className={`h-8 w-8 rounded-lg bg-[#F4F4F6] text-[#09090B] hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-30 disabled:cursor-not-allowed`}
              disabled={!hasText || isLoading}
              onClick={handleSubmit}
              title="Execute prompt (Enter)"
              aria-label="Submit prompt"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin text-[#09090B]" />
              ) : (
                <ArrowUp size={16} strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
