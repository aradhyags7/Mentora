import { describe, it, expect } from 'vitest';
import { compileTimeline, estimateWordTimings } from '../../src/lib/engine/compiler';
import { KineticTimeline } from '../../src/types/kinetic';

describe('Timeline Compiler', () => {
  it('estimates word timings proportionally across cue duration', () => {
    const timings = estimateWordTimings('Binary Search in Array', 1000);
    expect(timings.length).toBe(4);
    expect(timings[0].word).toBe('Binary');
    expect(timings[0].startOffsetMs).toBe(0);
    expect(timings[3].endOffsetMs).toBe(1000);
  });

  it('sorts unsorted cues by timestampMs', () => {
    const raw: KineticTimeline = {
      id: 'test_sort',
      title: 'Sort Test',
      concept: 'Testing',
      totalDurationMs: 0,
      initialEntities: [],
      cues: [
        { id: 'cue_2', timestampMs: 5000, narration: 'Second', actions: [] },
        { id: 'cue_1', timestampMs: 1000, narration: 'First', actions: [] },
      ],
    };

    const compiled = compileTimeline(raw);
    expect(compiled.cues[0].id).toBe('cue_1');
    expect(compiled.cues[1].id).toBe('cue_2');
    expect(compiled.totalDurationMs).toBeGreaterThan(5000);
  });
});
