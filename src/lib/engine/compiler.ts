/**
 * MENTORA DETERMINISTIC ENGINE - TIMELINE COMPILER
 * 
 * Normalizes and compiles raw/unresolved timeline JSON into an optimized,
 * deterministically indexable timeline structure.
 */

import { KineticTimeline, TimelineCue, WordTiming } from '../../types/kinetic';

/**
 * Synthesizes approximate word-level timestamps for narration text
 * when high-precision TTS word-boundary data is not yet available.
 */
export function estimateWordTimings(narration: string, cueDurationMs: number): WordTiming[] {
  if (!narration || narration.trim().length === 0) return [];
  
  const words = narration.trim().split(/\s+/);
  if (words.length === 0) return [];

  const timePerWord = cueDurationMs / words.length;
  return words.map((word, i) => ({
    word,
    startOffsetMs: Math.round(i * timePerWord),
    endOffsetMs: Math.round((i + 1) * timePerWord),
  }));
}

/**
 * Compiles a raw kinetic timeline into a canonical, sorted, normalized timeline.
 */
export function compileTimeline(raw: KineticTimeline): KineticTimeline {
  if (!raw) {
    throw new Error('Cannot compile null or undefined timeline');
  }

  // Ensure initial camera
  const initialCamera = raw.initialCamera || { x: 0, y: 0, zoom: 1.0 };

  // Sort cues deterministically by timestamp
  const sortedCues: TimelineCue[] = [...(raw.cues || [])].sort(
    (a, b) => (a.timestampMs || 0) - (b.timestampMs || 0)
  );

  // Normalize cue durations and word timings
  const compiledCues: TimelineCue[] = sortedCues.map((cue, idx) => {
    let duration = cue.durationMs;
    if (!duration || duration <= 0) {
      if (idx < sortedCues.length - 1) {
        duration = sortedCues[idx + 1].timestampMs - cue.timestampMs;
      } else {
        // Fallback for last cue based on word count (approx 350ms per word, min 3000ms)
        const wordCount = cue.narration ? cue.narration.split(/\s+/).length : 5;
        duration = Math.max(3000, wordCount * 350);
      }
    }

    const words = (cue.words && cue.words.length > 0)
      ? cue.words
      : estimateWordTimings(cue.narration, duration);

    return {
      ...cue,
      timestampMs: cue.timestampMs || 0,
      durationMs: duration,
      actions: cue.actions || [],
      words,
    };
  });

  // Calculate total duration
  let totalDurationMs = raw.totalDurationMs || 0;
  if (compiledCues.length > 0) {
    const lastCue = compiledCues[compiledCues.length - 1];
    const calculatedEnd = lastCue.timestampMs + (lastCue.durationMs || 3000);
    totalDurationMs = Math.max(totalDurationMs, calculatedEnd);
  }

  return {
    ...raw,
    initialCamera,
    initialEntities: raw.initialEntities || [],
    cues: compiledCues,
    totalDurationMs: Math.max(totalDurationMs, 1000),
  };
}
