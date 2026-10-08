import { describe, it, expect } from 'vitest';
import { KineticTimelineSchema } from '../../src/lib/ai/schema';
import { mockBinarySearchTimeline, mockCalculusTimeline } from '../mocks/mockTimeline';

describe('AI Gateway Schema', () => {
  it('strictly validates golden binary search timeline', () => {
    const parsed = KineticTimelineSchema.safeParse(mockBinarySearchTimeline);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cues.length).toBe(6);
      expect(parsed.data.concept).toBe('Binary Search Algorithm');
    }

    const parsedDeriv = KineticTimelineSchema.safeParse(mockCalculusTimeline);
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
