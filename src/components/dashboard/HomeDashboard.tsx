'use client';

import React from 'react';
import { MessageComposer } from '../composer/MessageComposer';

interface Props {
  onSendMessage: (text: string, teachMeMode: boolean) => void;
  isLoading: boolean;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onSelectPrompt?: (promptText: string) => void;
  onSelectContinueLesson?: (semanticKey: string) => void;
  recentLessons?: any[];
}

export const HomeDashboard: React.FC<Props> = ({
  onSendMessage,
  isLoading,
  isVoiceActive,
  onToggleVoice,
}) => {
  return (
    <div className="w-full flex-1 h-full flex flex-col items-center justify-center px-6 relative overflow-hidden select-none">
      {/* Subtle Architectural Radial Backdrop */}
      <div 
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] bg-white/[0.02] blur-[110px] rounded-full" 
        aria-hidden="true" 
      />

      {/* Centered Command Column */}
      <div 
        className="w-full max-w-[720px] mx-auto flex flex-col items-center justify-center text-center relative z-10 -mt-6"
        style={{ width: '100%', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        
        {/* Minimal Engine Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono tracking-[0.06em] text-[#8E909E] mb-6 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90" />
          <span>MENTORA SPATIAL ENGINE</span>
        </div>

        {/* Editorial Greeting Headline */}
        <h1 className="text-[32px] sm:text-[38px] font-medium tracking-[-0.035em] text-[#F4F4F6] text-center leading-[1.15] mb-3">
          What do you want to master today?
        </h1>

        {/* Restrained Subtitle */}
        <p className="text-[14px] text-[#7E808F] text-center max-w-[480px] leading-relaxed mb-8 font-normal">
          Ask any question. Mentora explains and draws it live on an interactive whiteboard you can interrupt at any word.
        </p>

        {/* The Hero Message Composer */}
        <div className="w-full">
          <MessageComposer
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            isVoiceActive={isVoiceActive}
            onToggleVoice={onToggleVoice}
          />
        </div>

        {/* Whisper-Quiet Capability Footer */}
        <div className="mt-4 flex items-center justify-center gap-5 text-[11px] font-mono text-[#525462]">
          <span>↵ Enter to synthesize</span>
          <span>•</span>
          <span>🎙️ Say &quot;Stop&quot; or &quot;I have a doubt&quot; anytime</span>
          <span>•</span>
          <span>⌘N New session</span>
        </div>

      </div>
    </div>
  );
};
