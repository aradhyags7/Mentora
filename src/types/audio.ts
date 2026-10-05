/**
 * MENTORA AUDIO & CLOCK CONTRACTS
 * 
 * High-precision synchronization contracts.
 * The master clock drives the visual engine from AudioContext.currentTime,
 * eliminating browser interval drift.
 */

import { WordTiming } from './kinetic';

export interface AudioPlaybackState {
  currentTimeMs: number;
  durationMs: number;
  isPlaying: boolean;
  playbackRate: number;
}

export interface MasterClock {
  getCurrentTimeMs(): number;
  play(): void;
  pause(): void;
  seek(targetMs: number): void;
  setRate(rate: number): void;
  subscribe(listener: (timeMs: number) => void): () => void;
  dispose(): void;
}

export interface TtsGenerationRequest {
  text: string;
  voice?: string;
  rate?: number;
}

export interface TtsGenerationResult {
  audioBase64?: string;
  audioUrl?: string;
  durationMs: number;
  words: WordTiming[];
}
