import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { KineticTimelineSchema } from '../../src/lib/ai/schema';

describe('AI Gateway Schema', () => {
  it('strictly validates golden binary search fixture', () => {
    const fixturePath = resolve(__dirname, '../../fixtures/binary-search.timeline.json');
    const rawJson = JSON.parse(readFileSync(fixturePath, 'utf-8'));

    const parsed = KineticTimelineSchema.safeParse(rawJson);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cues.length).toBe(6);
      expect(parsed.data.concept).toBe('Binary Search Algorithm');
    }

    const derivPath = resolve(__dirname, '../../fixtures/derivative-calculus.timeline.json');
    const derivRaw = JSON.parse(readFileSync(derivPath, 'utf-8'));
    const parsedDeriv = KineticTimelineSchema.safeParse(derivRaw);
    expect(parsedDeriv.success).toBe(true);
  });

  it('rejects cue without narration', () => {
    const invalidCue = {
      id: 'bad_tl',
      title: 'Bad',
      concept: 'Math',
      cues: [
        {
          id: 'c1',
          timestampMs: 0,
          // narration is missing
          actions: [],
        },
      ],
    };

    const parsed = KineticTimelineSchema.safeParse(invalidCue);
    expect(parsed.success).toBe(false);
  });
});
