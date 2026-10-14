import { describe, it, expect } from 'vitest';
import { 
  alignTimelineTriggersWithNarration 
} from '../../src/lib/audio/syncedSpeechEngine';
import { 
  spliceDoubtIntoTimeline 
} from '../../src/lib/engine/timelineSplicer';
import { 
  KineticTimeline, 
  InterruptSnapshot, 
  DoubtResolutionResponse 
} from '../../src/types/kinetic';

describe('Real-Time Speech Alignment & Timeline Splicer', () => {
  const sampleTimeline: KineticTimeline = {
    id: 'tl_sample_binary_search',
    title: 'Binary Search Invariant',
    concept: 'Binary Search',
    totalDurationMs: 16000,
    initialEntities: [
      {
        id: 'array_board',
        type: 'array',
        title: 'Memory Cells',
        elements: [
          { value: 2, state: 'default' },
          { value: 7, state: 'default' },
          { value: 12, state: 'default' },
          { value: 28, state: 'default' },
        ],
        position: { x: -200, y: 0 },
      },
    ],
    cues: [
      {
        id: 'cue_1',
        timestampMs: 0,
        durationMs: 4000,
        narration: 'We begin with a sorted array of memory cells.',
        actions: [],
      },
      {
        id: 'cue_2',
        timestampMs: 4000,
        durationMs: 6000,
        narration: 'Notice how the midpoint pivot divides our search space.',
        actions: [
          {
            type: 'array:move_pointer',
            targetId: 'array_board',
            pointerId: 'mid',
            targetIndex: 2,
            triggerPhrase: 'midpoint',
          } as any,
        ],
      },
      {
        id: 'cue_3',
        timestampMs: 10000,
        durationMs: 6000,
        narration: 'Because 28 is greater than 12, the left partition is eliminated.',
        actions: [],
      },
    ],
  };

  it('aligns trigger phrases accurately to millisecond word offsets within narration window', () => {
    const aligned = alignTimelineTriggersWithNarration(sampleTimeline);
    const cue2 = aligned.cues[1];
    expect(cue2.words).toBeDefined();
    expect(cue2.words!.length).toBeGreaterThan(0);

    const action = cue2.actions[0] as any;
    expect(action.triggerOffsetMs).toBeDefined();
    expect(action.triggerOffsetMs).toBeGreaterThanOrEqual(0);
    expect(action.triggerOffsetMs).toBeLessThan(cue2.durationMs!);
  });

  it('splices live doubt with CLARIFY_AND_RESUME without wiping prior context', () => {
    const snapshot: InterruptSnapshot = {
      timelineId: sampleTimeline.id,
      conceptTitle: 'Binary Search',
      interruptedAtTime: 6.5, // 6.5s (inside cue_2)
      interruptedAtTimeMs: 6500,
      activeCueId: 'cue_2',
      activeCueTitle: 'Midpoint Pivot',
      interruptedWordIndex: 4, // "Notice how the midpoint pivot"
      spokenTextSoFar: 'Notice how the midpoint pivot',
      unspokenTextInCue: 'divides our search space.',
      visiblePrimitiveIds: ['array_board'],
      cameraStateAtInterrupt: { panX: 100, panY: -20, zoom: 1.2 },
    };

    const resolution: DoubtResolutionResponse = {
      strategy: 'CLARIFY_AND_RESUME',
      teacherVoiceResponse: 'Great question. The midpoint is computed using integer division so we test the exact median element.',
      clarificationTitle: 'Clarification: Why midpoint?',
      newPrimitives: [
        {
          id: 'node_mid_formula',
          type: 'investigation_node',
          title: 'Midpoint Calculation',
          accentColor: '#F59E0B',
          position: { x: 100, y: 150 },
        },
      ],
      newActions: [],
      cameraTarget: {
        panX: -100,
        panY: -150,
        zoom: 1.25,
      },
    };

    const { updatedTimeline, resumeTime } = spliceDoubtIntoTimeline(
      sampleTimeline,
      snapshot,
      resolution
    );

    expect(resumeTime).toBe(6.5);
    expect(updatedTimeline.initialEntities.length).toBe(1);
    expect(updatedTimeline.initialEntities[0].id).toBe('array_board');

    // Verify doubt cue was inserted at 6500ms
    const doubtCue = updatedTimeline.cues.find(c => c.id.startsWith('doubt-resolution-'));
    expect(doubtCue).toBeDefined();
    expect(doubtCue?.timestampMs).toBe(6500);
    expect(doubtCue?.narration).toContain('Great question');

    // Verify continuation cue contains remaining words
    const continuationCue = updatedTimeline.cues.find(c => c.id.startsWith('cue-resume-'));
    expect(continuationCue).toBeDefined();
    expect(continuationCue?.narration).toContain('divides our search space.');

    // Verify original cue_3 was shifted forward without overlapping doubt cue
    const shiftedCue3 = updatedTimeline.cues.find(c => c.id === 'cue_3');
    expect(shiftedCue3).toBeDefined();
    expect(shiftedCue3!.timestampMs).toBeGreaterThan(doubtCue!.timestampMs + doubtCue!.durationMs!);

    // Total duration should be expanded
    expect(updatedTimeline.totalDurationMs).toBeGreaterThan(sampleTimeline.totalDurationMs);
  });

  it('splices live doubt with REWRITE_REMAINING_PLAN and appends finale zoom-out', () => {
    const snapshot: InterruptSnapshot = {
      timelineId: sampleTimeline.id,
      conceptTitle: 'Binary Search',
      interruptedAtTime: 5.0,
      interruptedAtTimeMs: 5000,
      activeCueId: 'cue_2',
      interruptedWordIndex: 2,
      spokenTextSoFar: 'Notice how the',
      unspokenTextInCue: 'midpoint pivot divides our search space.',
      visiblePrimitiveIds: ['array_board'],
      cameraStateAtInterrupt: { panX: 0, panY: 0, zoom: 1.0 },
    };

    const resolution: DoubtResolutionResponse = {
      strategy: 'REWRITE_REMAINING_PLAN',
      teacherVoiceResponse: 'Let us take an alternative approach and dry-run with two pointers from scratch.',
      clarificationTitle: 'Alternative Intuition',
      newPrimitives: [],
      newActions: [],
      rewrittenRemainingCues: [
        {
          id: 'cue_alt_1',
          timestampMs: 0,
          durationMs: 5000,
          narration: 'Here is the revised two-pointer invariant step-by-step.',
          actions: [],
        },
      ],
    };

    const { updatedTimeline } = spliceDoubtIntoTimeline(
      sampleTimeline,
      snapshot,
      resolution
    );

    // Old cue_3 should be replaced by rewritten cues
    expect(updatedTimeline.cues.some(c => c.id === 'cue_3')).toBe(false);
    expect(updatedTimeline.cues.some(c => c.id === 'cue_alt_1')).toBe(true);

    // Should include finale zoomout
    const lastCue = updatedTimeline.cues[updatedTimeline.cues.length - 1];
    expect(lastCue.id).toContain('cue_rewrite_finale_zoomout');
    const cameraAct = lastCue.actions.find(a => a.type === 'camera') as any;
    expect(cameraAct.zoom).toBe(0.68);
  });
});
