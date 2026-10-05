/**
 * MENTORA TTS SERVICE
 * 
 * Contract for speech synthesis with word timestamps.
 */

import { TtsGenerationRequest, TtsGenerationResult } from '../../types/audio';
import { estimateWordTimings } from '../engine/compiler';

export async function synthesizeSpeech(request: TtsGenerationRequest): Promise<TtsGenerationResult> {
  const { text } = request;
  
  // Try server endpoint if available
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Graceful fallback to synthesized timing model
  }

  // Fallback: estimate timings based on ~150 words per minute (400ms per word)
  const wordCount = text.trim().split(/\s+/).length;
  const durationMs = Math.max(2500, wordCount * 400);
  const words = estimateWordTimings(text, durationMs);

  return {
    durationMs,
    words,
  };
}
