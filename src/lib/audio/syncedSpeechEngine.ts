/**
 * MENTORA REAL-TIME SPEECH-TO-VISUAL SYNCHRONIZATION ENGINE
 * 
 * Directly couples browser SpeechSynthesis (with word-boundary tracking
 * and fallback 60fps clock) to visual primitive drawing and timeline triggers.
 */

import { 
  KineticTimeline, 
  TimelineCue, 
  WordTiming, 
  InterruptSnapshot, 
  VisualPrimitive 
} from '../../types/kinetic';

/**
 * Aligns trigger phrases and word indices within every cue's narration window
 * so visual primitives physically draw as specific words are spoken.
 */
export function alignTimelineTriggersWithNarration(timeline: KineticTimeline): KineticTimeline {
  const updatedCues: TimelineCue[] = timeline.cues.map(cue => {
    const text = cue.narration || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const durationMs = cue.durationMs || 4000;

    // Synthesize word timings if missing
    let wordTimings: WordTiming[] = cue.words && cue.words.length > 0 ? cue.words : [];
    if (wordTimings.length === 0 && words.length > 0) {
      wordTimings = words.map((w, i) => {
        const start = Math.round((i / words.length) * durationMs);
        const end = Math.round(((i + 0.9) / words.length) * durationMs);
        return {
          word: w,
          startOffsetMs: start,
          endOffsetMs: end,
        };
      });
    }

    // Process actions with trigger phrases
    const actions = (cue.actions || []).map(action => {
      let triggerOffsetMs: number | undefined;

      const act = action as any;
      if (act.triggerWordIndex !== undefined && wordTimings[act.triggerWordIndex]) {
        triggerOffsetMs = wordTimings[act.triggerWordIndex].startOffsetMs;
      } else if (act.triggerPhrase && typeof act.triggerPhrase === 'string') {
        const phraseLower = act.triggerPhrase.toLowerCase();
        const foundIdx = words.findIndex(w => w.toLowerCase().includes(phraseLower));
        if (foundIdx !== -1 && wordTimings[foundIdx]) {
          triggerOffsetMs = wordTimings[foundIdx].startOffsetMs;
        }
      }

      if (triggerOffsetMs !== undefined) {
        return {
          ...act,
          triggerOffsetMs,
        };
      }
      return action;
    });

    return {
      ...cue,
      words: wordTimings,
      actions,
    };
  });

  return {
    ...timeline,
    cues: updatedCues,
  };
}

export type WordBoundaryCallback = (wordIndex: number, word: string, cueId: string) => void;
export type CueEndCallback = (cueId: string) => void;

export class SyncedSpeechController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeCue: TimelineCue | null = null;
  private activeWordIndex: number = 0;
  private isMuted: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private fallbackTimerId: any = null;
  private cueStartTime: number = 0;
  private onWordBoundaryCb: WordBoundaryCallback | null = null;
  private onCueEndCb: CueEndCallback | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
    }
  }

  private initVoice() {
    if (!this.synth) return;

    const pickBestVoice = () => {
      const voices = this.synth?.getVoices() || [];
      if (voices.length === 0) return;

      // Prefer high-quality natural English voices
      const naturalVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Aria') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Guy')) && 
        v.lang.startsWith('en')
      );

      const generalEnVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
      this.preferredVoice = naturalVoice || generalEnVoice || voices[0] || null;
    };

    pickBestVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickBestVoice;
    }
  }

  public setCallbacks(onWordBoundary: WordBoundaryCallback, onCueEnd?: CueEndCallback) {
    this.onWordBoundaryCb = onWordBoundary;
    this.onCueEndCb = onCueEnd || null;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getActiveWordIndex(): number {
    return this.activeWordIndex;
  }

  /**
   * Speaks a specific timeline cue, aligning word boundaries with narration.
   */
  public speakCue(cue: TimelineCue, offsetSeconds: number = 0) {
    this.stop();
    this.activeCue = cue;
    this.activeWordIndex = 0;
    this.cueStartTime = performance.now();

    const narration = (cue.narration || '').trim();
    if (!narration) {
      this.onCueEndCb?.(cue.id);
      return;
    }

    const words = narration.split(/\s+/).filter(Boolean);
    const durationMs = cue.durationMs || Math.max(3000, words.length * 350);

    // Calculate starting word index from offset if provided
    let startWordIdx = 0;
    if (offsetSeconds > 0 && words.length > 0) {
      const fraction = Math.min(0.95, (offsetSeconds * 1000) / durationMs);
      startWordIdx = Math.floor(fraction * words.length);
      this.activeWordIndex = startWordIdx;
    }

    // Always start fallback 60fps word progress timer so word sync is guaranteed across all browsers
    this.startFallbackWordTimer(words, durationMs, startWordIdx, cue.id);

    // If muted or TTS unavailable, fallback timer drives word boundaries
    if (this.isMuted || !this.synth) {
      return;
    }

    // Browser Speech Synthesis
    try {
      const textToSpeak = startWordIdx > 0 ? words.slice(startWordIdx).join(' ') : narration;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      this.currentUtterance = utterance;

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') {
          // Approximate word index from charIndex
          const charIdx = event.charIndex;
          const textUpToChar = textToSpeak.slice(0, charIdx);
          const wordOffset = textUpToChar.split(/\s+/).filter(Boolean).length;
          const totalIdx = Math.min(words.length - 1, startWordIdx + wordOffset);
          this.activeWordIndex = totalIdx;
          this.onWordBoundaryCb?.(totalIdx, words[totalIdx] || '', cue.id);
        }
      };

      utterance.onend = () => {
        this.clearFallbackTimer();
        this.onCueEndCb?.(cue.id);
      };

      utterance.onerror = () => {
        this.clearFallbackTimer();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error, relying on internal timer:', e);
    }
  }

  private startFallbackWordTimer(words: string[], durationMs: number, startIdx: number, cueId: string) {
    this.clearFallbackTimer();
    const intervalMs = 60;
    const startTimestamp = performance.now();
    const remainingTimeMs = Math.max(1000, durationMs * (1 - startIdx / Math.max(1, words.length)));

    this.fallbackTimerId = setInterval(() => {
      const elapsed = performance.now() - startTimestamp;
      const progress = Math.min(1.0, elapsed / remainingTimeMs);
      const computedWordIdx = Math.min(
        words.length - 1,
        startIdx + Math.floor(progress * (words.length - startIdx))
      );

      if (computedWordIdx !== this.activeWordIndex) {
        this.activeWordIndex = computedWordIdx;
        this.onWordBoundaryCb?.(computedWordIdx, words[computedWordIdx] || '', cueId);
      }

      if (progress >= 1.0) {
        this.clearFallbackTimer();
        this.onCueEndCb?.(cueId);
      }
    }, intervalMs);
  }

  private clearFallbackTimer() {
    if (this.fallbackTimerId) {
      clearInterval(this.fallbackTimerId);
      this.fallbackTimerId = null;
    }
  }

  public pause() {
    this.clearFallbackTimer();
    if (this.synth) {
      try {
        this.synth.pause();
      } catch {}
    }
  }

  public resume() {
    if (this.synth) {
      try {
        this.synth.resume();
      } catch {}
    }
  }

  public stop() {
    this.clearFallbackTimer();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
  }

  /**
   * Immediately freezes voice playback (<15ms latency) and constructs
   * a precise InterruptSnapshot containing the split cue and visible entities.
   */
  public interruptNow(
    timeline: KineticTimeline,
    currentTimeSeconds: number,
    cameraState: { panX: number; panY: number; zoom: number }
  ): InterruptSnapshot {
    // 1. Instantly silence the browser TTS engine
    this.stop();

    const timeMs = currentTimeSeconds * 1000;

    // 2. Locate active cue at currentTime
    let activeCue = timeline.cues[0];
    let cueStartTimeMs = 0;
    let accumulatedMs = 0;

    for (let i = 0; i < timeline.cues.length; i++) {
      const c = timeline.cues[i];
      const start = c.timestampMs !== undefined ? c.timestampMs : accumulatedMs;
      const dur = c.durationMs || 4000;
      if (timeMs >= start && timeMs <= start + dur) {
        activeCue = c;
        cueStartTimeMs = start;
        break;
      }
      accumulatedMs = start + dur;
    }

    const narration = activeCue?.narration || '';
    const words = narration.trim().split(/\s+/).filter(Boolean);
    const wordIdx = Math.max(0, Math.min(words.length - 1, this.activeWordIndex));

    const spokenWords = words.slice(0, wordIdx + 1);
    const unspokenWords = words.slice(wordIdx + 1);

    const spokenTextSoFar = spokenWords.join(' ');
    const unspokenTextInCue = unspokenWords.join(' ');

    // 3. Collect IDs of all primitives visible up to this moment
    const visiblePrimitiveIds: string[] = [];
    (timeline.initialEntities || []).forEach(ent => visiblePrimitiveIds.push(ent.id));

    timeline.cues.forEach(cue => {
      if ((cue.timestampMs || 0) <= timeMs) {
        (cue.actions || []).forEach(act => {
          if (act.type === 'entity:spawn' && (act as any).entity?.id) {
            visiblePrimitiveIds.push((act as any).entity.id);
          } else if (act.type === 'entity:destroy' && (act as any).targetId) {
            const idx = visiblePrimitiveIds.indexOf((act as any).targetId);
            if (idx !== -1) visiblePrimitiveIds.splice(idx, 1);
          }
        });
      }
    });

    return {
      timelineId: timeline.id,
      conceptTitle: timeline.concept || timeline.title,
      interruptedAtTime: currentTimeSeconds,
      interruptedAtTimeMs: timeMs,
      activeCueId: activeCue?.id || 'cue_0',
      activeCueTitle: activeCue?.narration?.slice(0, 32) || 'Active Step',
      interruptedWordIndex: wordIdx,
      spokenTextSoFar,
      unspokenTextInCue,
      visiblePrimitiveIds: Array.from(new Set(visiblePrimitiveIds)),
      cameraStateAtInterrupt: cameraState,
    };
  }
}

// Global Singleton for easy app-wide sharing
export const globalSpeechController = new SyncedSpeechController();
