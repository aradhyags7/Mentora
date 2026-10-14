'use client';

import React, { useState, useEffect } from 'react';
import { 
  TutorRuntimeState, 
  InterruptSnapshot 
} from '../../types/kinetic';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Play, 
  Sparkles, 
  Loader2, 
  Volume2, 
  PauseCircle 
} from 'lucide-react';

interface Props {
  tutorState: TutorRuntimeState;
  snapshot: InterruptSnapshot | null;
  liveTranscript: string;
  voiceBargeInEnabled: boolean;
  onToggleVoiceBargeIn: () => void;
  onTriggerInterrupt: () => void;
  onSubmitDoubt: (doubtText: string) => void;
  onResume: () => void;
  isResolving?: boolean;
}

export const DoubtInterruptBar: React.FC<Props> = ({
  tutorState,
  snapshot,
  liveTranscript,
  voiceBargeInEnabled,
  onToggleVoiceBargeIn,
  onTriggerInterrupt,
  onSubmitDoubt,
  onResume,
  isResolving = false,
}) => {
  const [typedDoubt, setTypedDoubt] = useState('');

  // Sync live voice transcript into typed text field if active
  useEffect(() => {
    if (liveTranscript) {
      setTypedDoubt(liveTranscript);
    }
  }, [liveTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedDoubt.trim() && !isResolving) {
      onSubmitDoubt(typedDoubt.trim());
      setTypedDoubt('');
    }
  };

  // STATE 3: Replanning / Visual Splicing in progress
  if (tutorState === 'REPLANNING_DOUBT' || isResolving) {
    return (
      <div className="relative z-30 flex items-center justify-between rounded-xl border border-cyan-500/50 bg-[#0B0F19]/95 px-4 py-3 shadow-[0_0_30px_rgba(56,189,248,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-cyan-300">
              ⚡ Mentora is drawing visual clarification & updating lesson plan...
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Splicing resolution into whiteboard timeline without losing prior context
            </span>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: Paused for Doubt (Frozen mid-stroke)
  if (tutorState === 'PAUSED_FOR_DOUBT' || tutorState === 'LISTENING_VOICE_DOUBT') {
    const previewText = snapshot?.spokenTextSoFar
      ? snapshot.spokenTextSoFar.slice(-48)
      : 'Mid-stroke';

    return (
      <div className="relative z-30 flex flex-col gap-2.5 rounded-xl border border-amber-500/50 bg-[#0B0F19]/95 p-3.5 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-xl transition-all duration-300">
        {/* Banner with freeze context */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle size={15} className="text-amber-400" />
            <span className="font-mono text-xs font-semibold text-amber-300">
              Whiteboard Frozen at: &ldquo;...{previewText}&rdquo;
            </span>
          </div>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400 border border-amber-500/20">
            {snapshot ? `t = ${snapshot.interruptedAtTime.toFixed(1)}s` : 'Paused'}
          </span>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={typedDoubt}
            onChange={e => setTypedDoubt(e.target.value)}
            placeholder='Ask your doubt (e.g., Why did we move the left pointer here?)...'
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            autoFocus
          />

          <button
            type="submit"
            disabled={!typedDoubt.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed px-3.5 py-2 font-mono text-xs font-bold text-slate-950 transition-colors shadow-md"
          >
            <Sparkles size={13} />
            <span>Explain Doubt on Board</span>
          </button>

          <button
            type="button"
            onClick={onResume}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 font-mono text-xs font-semibold text-slate-300 transition-colors"
          >
            <Play size={12} />
            <span>Resume</span>
          </button>
        </form>
      </div>
    );
  }

  // STATE 1: Normal Live Teaching (Speaking & Drawing)
  return (
    <div className="relative z-30 flex items-center justify-between rounded-xl border border-slate-800 bg-[#0B0F19]/80 px-3.5 py-2 backdrop-blur-md shadow-lg">
      {/* Audio Wave Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Volume2 size={14} className="text-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold text-emerald-300">
            Live AI Tutor Speaking & Drawing
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Voice Barge-in Toggle */}
        <button
          type="button"
          onClick={onToggleVoiceBargeIn}
          title={voiceBargeInEnabled ? 'Voice barge-in active: say "stop" or "i have a doubt"' : 'Click to enable voice barge-in'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] font-medium border transition-colors ${
            voiceBargeInEnabled
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-slate-700 bg-slate-800/50 text-slate-400'
          }`}
        >
          {voiceBargeInEnabled ? <Mic size={12} className="text-emerald-400" /> : <MicOff size={12} />}
          <span>{voiceBargeInEnabled ? 'Voice Interrupt: ON' : 'Voice Interrupt: OFF'}</span>
        </button>

        {/* Prominent Barge-in Stop Button */}
        <button
          type="button"
          onClick={onTriggerInterrupt}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/60 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1 font-mono text-xs font-bold text-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        >
          <Hand size={13} className="text-amber-400" />
          <span>✋ Stop / I have a doubt</span>
        </button>
      </div>
    </div>
  );
};
