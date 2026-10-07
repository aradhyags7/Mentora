/**
 * MENTORA TEACHING DSL COMPILER (Phase 1 & 4)
 * 
 * Compiles high-level semantic Teaching DSL lessons into deterministic,
 * 60 FPS kinetic timeline representations executed by the Classroom Runtime.
 */

import { TeachingDslLesson } from '../../types/teachingDsl';
import { KineticTimeline, TimelineCue, VisualPrimitive } from '../../types/kinetic';
import { ArtifactRegistry } from '../artifacts/registry';
import { validateAndCompileTimeline } from '../engine/validator';

export class TeachingDslCompiler {
  /**
   * Compiles a Teaching DSL lesson into a runnable KineticTimeline.
   */
  static compileToTimeline(lesson: TeachingDslLesson): KineticTimeline {
    const rawEntities: VisualPrimitive[] = [];
    const cues: TimelineCue[] = [];
    let accumulatedTimeMs = 0;

    // Search for artifact creation steps to seed initial entities
    for (const step of lesson.timeline) {
      if (step.type === 'artifact.create') {
        const registered = ArtifactRegistry.get(step.artifact);
        if (registered && registered.timeline.initialEntities) {
          rawEntities.push(...registered.timeline.initialEntities);
        }
      }
    }

    // Default fallback entity if none created
    if (rawEntities.length === 0) {
      rawEntities.push({
        id: 'card_lesson_overview',
        type: 'card',
        title: lesson.objective || 'Lesson Overview',
        content: `Mode: ${lesson.mode.toUpperCase()} | Objective: ${lesson.objective}`,
        theme: 'default',
      });
    }

    // Translate DSL timeline steps into sequentially timed Kinetic Cues
    lesson.timeline.forEach((step, idx) => {
      const cueTimeMs = Math.max(step.t * 1000, accumulatedTimeMs);
      const cueDurationMs = 4000;

      if (step.type === 'speak') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: cueDurationMs,
          narration: step.text,
          words: step.words,
          actions: [],
        });
        accumulatedTimeMs = cueTimeMs + cueDurationMs;
      } else if (step.type === 'camera') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 1000,
          narration: '',
          actions: [
            {
              type: 'camera',
              panX: step.panX,
              panY: step.panY,
              zoom: step.zoom,
              durationMs: step.durationMs,
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 1000);
      } else if (step.type === 'artifact.animate') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: step.durationMs || 2500,
          narration: '',
          actions: [
            {
              type: 'card:update',
              targetId: step.target,
              content: `Animation: ${step.animation}`,
            },
          ],
        });
        accumulatedTimeMs = cueTimeMs + (step.durationMs || 2500);
      } else if (step.type === 'ask') {
        cues.push({
          id: `cue_${idx}`,
          timestampMs: cueTimeMs,
          durationMs: 5000,
          narration: `Question: ${step.question}`,
          actions: [],
        });
        accumulatedTimeMs = cueTimeMs + 5000;
      }
    });

    const rawTimeline = {
      id: lesson.lesson_id,
      title: lesson.objective || 'Interactive Lesson',
      concept: lesson.meta?.concept || 'Lesson',
      totalDurationMs: Math.max(accumulatedTimeMs + 2000, 10000),
      initialEntities: rawEntities,
      cues: cues.length > 0 ? cues : [
        {
          id: 'cue_default',
          timestampMs: 0,
          durationMs: 4000,
          narration: `Exploring ${lesson.objective}`,
          actions: [],
        },
      ],
    };

    return validateAndCompileTimeline(rawTimeline);
  }
}
