/**
 * DETERMINISTIC ENGINE TESTS
 * 
 * Verifies that the scene state is a pure function of time f(timeline, timeMs).
 * Verifies scrubbing forward, backward, and jumping preserves absolute correctness.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateAndCompileTimeline } from '../../src/lib/engine/validator';
import { evaluateSceneAtTime } from '../../src/lib/engine/evaluator';
import { ArrayPrimitive } from '../../src/types/kinetic';

describe('Deterministic Timeline Engine', () => {
  const fixturePath = resolve(__dirname, '../../fixtures/binary-search.timeline.json');
  const fixtureRaw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
  const timeline = validateAndCompileTimeline(fixtureRaw);

  it('compiles fixture correctly and ensures all cues are sorted', () => {
    expect(timeline.cues.length).toBe(6);
    expect(timeline.totalDurationMs).toBe(34000);
    for (let i = 0; i < timeline.cues.length - 1; i++) {
      expect(timeline.cues[i].timestampMs).toBeLessThanOrEqual(timeline.cues[i + 1].timestampMs);
    }
  });

  it('evaluates scene at t = 0ms (initial state)', () => {
    const frame = evaluateSceneAtTime(timeline, 0);
    expect(frame.timeMs).toBe(0);
    expect(frame.progress).toBe(0);
    expect(frame.activeCueIndex).toBe(0);
    expect(frame.camera.zoom).toBe(1.0);

    const arr = frame.entities['arr_main'] as ArrayPrimitive;
    expect(arr).toBeDefined();
    expect(arr.items[4].state).toBe('default');
    expect(arr.pointers.find(p => p.id === 'ptr_low')?.targetIndex).toBe(0);
    expect(arr.pointers.find(p => p.id === 'ptr_high')?.targetIndex).toBe(9);
    expect(arr.pointers.find(p => p.id === 'ptr_mid')?.targetIndex).toBe(4);
  });

  it('evaluates scene at t = 6000ms (cue 2: mid evaluated)', () => {
    const frame = evaluateSceneAtTime(timeline, 6000);
    expect(frame.activeCueIndex).toBe(1);
    expect(frame.camera.zoom).toBeGreaterThan(1.0);

    const arr = frame.entities['arr_main'] as ArrayPrimitive;
    expect(arr.items[4].state).toBe('active');
    expect(frame.activeCallouts.some(c => c.id === 'callout_mid_circle')).toBe(true);
  });

  it('evaluates scene at t = 13000ms (cue 3: left half eliminated)', () => {
    const frame = evaluateSceneAtTime(timeline, 13000);
    const arr = frame.entities['arr_main'] as ArrayPrimitive;
    
    // Indices 0..4 should be eliminated
    for (let i = 0; i <= 4; i++) {
      expect(arr.items[i].state).toBe('eliminated');
    }
    // Index 5 should remain default
    expect(arr.items[5].state).toBe('default');
  });

  it('evaluates scene at t = 30000ms (cue 6: target found at index 5)', () => {
    const frame = evaluateSceneAtTime(timeline, 30000);
    const arr = frame.entities['arr_main'] as ArrayPrimitive;
    
    expect(arr.items[5].state).toBe('found');
    expect(frame.activeCallouts.some(c => c.label === 'FOUND!')).toBe(true);
  });

  it('guarantees pure determinism when scrubbing backward and jumping', () => {
    // 1. Evaluate at 30000ms
    const stateAt30sFirst = evaluateSceneAtTime(timeline, 30000);
    const arrAt30s = stateAt30sFirst.entities['arr_main'] as ArrayPrimitive;
    expect(arrAt30s.items[5].state).toBe('found');

    // 2. Scrub back to 0ms
    const stateAt0s = evaluateSceneAtTime(timeline, 0);
    const arrAt0s = stateAt0s.entities['arr_main'] as ArrayPrimitive;
    expect(arrAt0s.items[5].state).toBe('default');
    expect(arrAt0s.items[0].state).toBe('default');

    // 3. Jump forward back to 30000ms
    const stateAt30sSecond = evaluateSceneAtTime(timeline, 30000);
    expect(JSON.stringify(stateAt30sFirst)).toBe(JSON.stringify(stateAt30sSecond));
  });
});
