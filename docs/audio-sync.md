# Audio Synchronization & Clock Contract

## High-Precision Master Clock

Mentora uses `WebAudioClock` (`src/lib/audio/audioClock.ts`) driven by the browser's hardware-timed `AudioContext.currentTime` rather than `setInterval` or `setTimeout`.

### Why AudioContext.currentTime?
Browser JavaScript timers (`setTimeout`, `setInterval`) suffer from variable throttling, thread latency, and background tab de-prioritization. `AudioContext.currentTime` is hardware clock-backed and increments continuously with sub-millisecond precision.

### Word-Level Alignment
Each cue can carry word timings:
```typescript
interface WordTiming {
  word: string;
  startOffsetMs: number;
  endOffsetMs: number;
}
```

The word aligner maps $(t_{\text{ms}} - \text{cue.timestampMs})$ to the active word in $O(1)$ to $O(W)$, illuminating words in the `SubtitleOverlay` in lockstep with speech.
