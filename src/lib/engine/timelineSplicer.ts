/**
 * MENTORA DETERMINISTIC TIMELINE SPLICER
 * 
 * Slices and splices live visual doubt resolutions into an ongoing KineticTimeline
 * without ever wiping existing whiteboard primitives or camera state.
 */

import { 
  KineticTimeline, 
  TimelineCue, 
  InterruptSnapshot, 
  DoubtResolutionResponse, 
  KineticAction,
  VisualPrimitive 
} from '../../types/kinetic';

export function spliceDoubtIntoTimeline(
  timeline: KineticTimeline,
  snapshot: InterruptSnapshot,
  resolution: DoubtResolutionResponse
): { updatedTimeline: KineticTimeline; resumeTime: number } {
  const interruptTimeSeconds = snapshot.interruptedAtTime;
  const interruptTimeMs = Math.round(interruptTimeSeconds * 1000);

  // 1. Separate prior cues and post-interruption cues
  const priorCues: TimelineCue[] = [];
  const futureCues: TimelineCue[] = [];

  let foundActiveCue = false;

  for (const cue of timeline.cues) {
    if (cue.id === snapshot.activeCueId) {
      foundActiveCue = true;
      // Truncate active cue up to interrupted moment if it had spoken words
      const truncatedCue: TimelineCue = {
        ...cue,
        narration: snapshot.spokenTextSoFar || cue.narration,
        durationMs: Math.max(1000, interruptTimeMs - (cue.timestampMs || 0)),
      };
      priorCues.push(truncatedCue);
    } else if (!foundActiveCue) {
      // Cue occurred before interruption
      if ((cue.timestampMs || 0) < interruptTimeMs) {
        priorCues.push(cue);
      } else {
        futureCues.push(cue);
      }
    } else {
      // Cue was scheduled after the active cue
      futureCues.push(cue);
    }
  }

  // 2. Build the Live Doubt Resolution Beat
  const wordCount = resolution.teacherVoiceResponse.trim().split(/\s+/).filter(Boolean).length;
  const doubtDurationMs = Math.max(4500, wordCount * 360);

  // Actions for drawing new clarification primitives + camera adjustment
  const doubtActions: KineticAction[] = [];

  // Spawn new primitives
  (resolution.newPrimitives || []).forEach(prim => {
    doubtActions.push({
      type: 'entity:spawn',
      entity: prim,
    });
  });

  // Append resolution actions
  (resolution.newActions || []).forEach(act => {
    doubtActions.push(act);
  });

  // Position camera on the new clarification region
  if (resolution.cameraTarget) {
    doubtActions.push({
      type: 'camera',
      panX: resolution.cameraTarget.panX,
      panY: resolution.cameraTarget.panY,
      zoom: resolution.cameraTarget.zoom,
      focusEntityIds:
        resolution.cameraTarget.focusEntityIds ||
        (resolution.newPrimitives || []).map(p => p.id),
      durationMs: 1200,
      easing: 'cinema',
      spotlightIntensity: 0.85,
    });
  } else if ((resolution.newPrimitives || []).length > 0) {
    const firstPrim = resolution.newPrimitives[0] as any;
    const px = firstPrim.position?.x ?? firstPrim.x ?? 0;
    const py = firstPrim.position?.y ?? firstPrim.y ?? 0;
    doubtActions.push({
      type: 'camera',
      panX: -px,
      panY: -py,
      zoom: 1.25,
      focusEntityIds: resolution.newPrimitives.map(p => p.id),
      durationMs: 1200,
      easing: 'cinema',
      spotlightIntensity: 0.85,
    });
  }

  const doubtCue: TimelineCue = {
    id: `doubt-resolution-${Date.now()}`,
    timestampMs: interruptTimeMs,
    durationMs: doubtDurationMs,
    narration: resolution.teacherVoiceResponse,
    actions: doubtActions,
  };

  let nextTimestampMs = interruptTimeMs + doubtDurationMs;
  const assembledCues: TimelineCue[] = [...priorCues, doubtCue];

  // 3. Handle Strategy Branching
  if (resolution.strategy === 'CLARIFY_AND_RESUME') {
    const unspokenWords = (snapshot.unspokenTextInCue || '').trim().split(/\s+/).filter(Boolean);

    // If active cue was cut off with meaningful remaining speech, insert continuation cue
    if (unspokenWords.length > 3) {
      const continuationText = `Now, continuing from where we paused: ${snapshot.unspokenTextInCue}`;
      const continuationDurationMs = Math.max(3000, unspokenWords.length * 360);

      assembledCues.push({
        id: `cue-resume-${Date.now()}`,
        timestampMs: nextTimestampMs,
        durationMs: continuationDurationMs,
        narration: continuationText,
        actions: [
          {
            type: 'camera',
            panX: snapshot.cameraStateAtInterrupt.panX,
            panY: snapshot.cameraStateAtInterrupt.panY,
            zoom: snapshot.cameraStateAtInterrupt.zoom,
            durationMs: 1000,
            easing: 'cinema',
          },
        ],
      });

      nextTimestampMs += continuationDurationMs;
    }

    // Shift all subsequent original cues forward in time
    for (const cue of futureCues) {
      const dur = cue.durationMs || 4000;
      assembledCues.push({
        ...cue,
        timestampMs: nextTimestampMs,
      });
      nextTimestampMs += dur;
    }
  } else if (resolution.strategy === 'REWRITE_REMAINING_PLAN') {
    // Replace future cues with rewritten plan
    const rewrittenCues = resolution.rewrittenRemainingCues || [];
    for (const cue of rewrittenCues) {
      const dur = cue.durationMs || 4000;
      assembledCues.push({
        ...cue,
        timestampMs: nextTimestampMs,
      });
      nextTimestampMs += dur;
    }

    // Always conclude rewritten plans with signature zoom-out reveal
    assembledCues.push({
      id: `cue_rewrite_finale_zoomout_${Date.now()}`,
      timestampMs: nextTimestampMs,
      durationMs: 2500,
      narration: 'Observe how our revised understanding integrates cleanly with the complete system.',
      actions: [
        {
          type: 'camera',
          panX: 0,
          panY: 0,
          zoom: 0.68,
          durationMs: 2500,
          easing: 'cinema',
          focusEntityIds: [],
          spotlightIntensity: 0,
        },
      ],
    });
    nextTimestampMs += 2500;
  }

  // Preserve initial entities plus newly registered primitives
  const updatedInitialEntities = [...(timeline.initialEntities || [])];

  const updatedTimeline: KineticTimeline = {
    ...timeline,
    totalDurationMs: Math.max(nextTimestampMs, timeline.totalDurationMs + doubtDurationMs),
    initialEntities: updatedInitialEntities,
    cues: assembledCues,
  };

  return {
    updatedTimeline,
    resumeTime: interruptTimeSeconds,
  };
}
