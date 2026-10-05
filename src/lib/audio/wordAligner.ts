/**
 * MENTORA WORD ALIGNER
 * 
 * Determines active word indices from audio millisecond offsets.
 */

import { WordTiming } from '../../types/kinetic';

export function findActiveWordIndex(words: WordTiming[], offsetInCueMs: number): number {
  if (!words || words.length === 0 || offsetInCueMs < 0) return -1;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (offsetInCueMs >= w.startOffsetMs && offsetInCueMs <= w.endOffsetMs) {
      return i;
    }
  }

  // If past the end of the last word, stay on last word until cue completes
  const last = words[words.length - 1];
  if (offsetInCueMs > last.endOffsetMs) {
    return words.length - 1;
  }

  return -1;
}
