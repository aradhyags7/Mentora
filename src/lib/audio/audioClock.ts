/**
 * MENTORA HIGH-PRECISION AUDIO CLOCK
 * 
 * Drives timeline playback strictly from Web Audio API (AudioContext.currentTime),
 * eliminating browser interval/setTimeout drift.
 */

import { MasterClock } from '../../types/audio';

export class WebAudioClock implements MasterClock {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private startCtxTime = 0;
  private offsetMs = 0;
  private playbackRate = 1.0;
  private listeners: Set<(timeMs: number) => void> = new Set();
  private rafId: number | null = null;

  constructor() {
    // Lazily initialized on first user gesture
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getCurrentTimeMs(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.offsetMs;
    }
    const elapsedSec = (this.ctx.currentTime - this.startCtxTime) * this.playbackRate;
    return Math.max(0, this.offsetMs + elapsedSec * 1000);
  }

  play(): void {
    if (this.isPlaying) return;
    const ctx = this.ensureContext();
    this.isPlaying = true;
    this.startCtxTime = ctx.currentTime;
    this.startLoop();
  }

  pause(): void {
    if (!this.isPlaying) return;
    this.offsetMs = this.getCurrentTimeMs();
    this.isPlaying = false;
    this.stopLoop();
  }

  seek(targetMs: number): void {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }
    this.offsetMs = Math.max(0, targetMs);
    if (wasPlaying) {
      this.play();
    } else {
      this.notifyListeners();
    }
  }

  setRate(rate: number): void {
    if (rate <= 0) return;
    if (this.isPlaying) {
      this.offsetMs = this.getCurrentTimeMs();
      if (this.ctx) {
        this.startCtxTime = this.ctx.currentTime;
      }
    }
    this.playbackRate = rate;
  }

  subscribe(listener: (timeMs: number) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentTime = this.getCurrentTimeMs();
    this.listeners.forEach(fn => fn(currentTime));
  }

  private startLoop(): void {
    const tick = () => {
      if (!this.isPlaying) return;
      this.notifyListeners();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose(): void {
    this.pause();
    this.listeners.clear();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
  }
}
