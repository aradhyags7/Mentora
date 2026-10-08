import { describe, it, expect } from 'vitest';
import { LessonPlanner } from '../../src/lib/pedagogy/lessonPlanner';
import { TeachingDslCompiler } from '../../src/lib/dsl/dslCompiler';
import { ArtifactRegistry } from '../../src/lib/artifacts/registry';

describe('Dynamic Lesson Engine (Zero Fixtures)', () => {
  it('dynamically plans and compiles a lesson on-the-fly for any topic', () => {
    const topic = 'Quantum Entanglement';
    const { planState, dsl } = LessonPlanner.planInitialLesson(topic);

    expect(planState.concept).toBe('quantum_entanglement');
    expect(planState.objective).toContain('Quantum Entanglement');
    expect(dsl.timeline.length).toBeGreaterThan(0);

    const timeline = TeachingDslCompiler.compileToTimeline(dsl);
    expect(timeline.cues.length).toBeGreaterThan(0);
    expect(timeline.totalDurationMs).toBeGreaterThan(0);
  });

  it('verifies ArtifactRegistry starts clean without hardcoded fixtures', () => {
    // ArtifactRegistry has no preloaded artifacts until registered dynamically
    expect(ArtifactRegistry.get('cs.binary_search')).toBeUndefined();
    expect(ArtifactRegistry.get('math.derivative')).toBeUndefined();
  });
});
