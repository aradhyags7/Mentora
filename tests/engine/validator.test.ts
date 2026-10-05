import { describe, it, expect } from 'vitest';
import { validateAndCompileTimeline } from '../../src/lib/engine/validator';

describe('Timeline Validator', () => {
  it('rejects timelines missing mandatory fields like cues or title', () => {
    expect(() => validateAndCompileTimeline({ concept: 'Test' })).toThrowError(/Validation Failed/);
  });

  it('validates a minimal correct timeline', () => {
    const valid = {
      id: 'tl_min',
      title: 'Minimal',
      concept: 'Math',
      cues: [
        {
          id: 'c1',
          timestampMs: 0,
          narration: 'Hello world',
          actions: [],
        },
      ],
    };

    const compiled = validateAndCompileTimeline(valid);
    expect(compiled.title).toBe('Minimal');
    expect(compiled.cues.length).toBe(1);
  });
});
