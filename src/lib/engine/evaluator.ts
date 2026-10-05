/**
 * MENTORA DETERMINISTIC ENGINE - SCENE EVALUATOR
 * 
 * Pure Function: SceneFrameState = evaluateSceneAtTime(timeline, timeMs)
 * 
 * Guarantees bit-exact deterministic scene reconstruction at any millisecond.
 * Scrubbing forward, backward, or jumping produces zero accumulated errors.
 */

import { SceneFrameState } from '../../types/engine';
import { CameraState, KineticTimeline, RoughCalloutPrimitive, TimelineCue, VisualPrimitive, WordTiming } from '../../types/kinetic';
import { clamp, interpolateCamera } from './interpolator';
import { applyActionToEntities, createInitialEntityMap } from './sceneGraph';

export function evaluateSceneAtTime(timeline: KineticTimeline, targetTimeMs: number): SceneFrameState {
  const totalDurationMs = Math.max(1, timeline.totalDurationMs);
  const timeMs = clamp(targetTimeMs, 0, totalDurationMs);
  const progress = timeMs / totalDurationMs;

  // 1. Identify active cue
  let activeCueIndex = -1;
  let activeCue: TimelineCue | null = null;

  for (let i = 0; i < timeline.cues.length; i++) {
    const cue = timeline.cues[i];
    if (cue.timestampMs <= timeMs) {
      activeCueIndex = i;
      activeCue = cue;
    } else {
      break;
    }
  }

  // 2. Identify active word in current cue
  let activeWordIndex = -1;
  let activeWord: WordTiming | null = null;
  let activeNarration = '';

  if (activeCue) {
    activeNarration = activeCue.narration || '';
    const offsetInCue = timeMs - activeCue.timestampMs;

    if (activeCue.words && activeCue.words.length > 0) {
      for (let w = 0; w < activeCue.words.length; w++) {
        const wt = activeCue.words[w];
        if (offsetInCue >= wt.startOffsetMs && offsetInCue <= wt.endOffsetMs) {
          activeWordIndex = w;
          activeWord = wt;
          break;
        }
      }
      // If past the last word but still in cue, highlight last word
      if (activeWordIndex === -1 && offsetInCue > (activeCue.words[activeCue.words.length - 1].endOffsetMs || 0)) {
        activeWordIndex = activeCue.words.length - 1;
        activeWord = activeCue.words[activeWordIndex];
      }
    }
  }

  // 3. Replay entity mutations up to timeMs
  let currentEntities = createInitialEntityMap(timeline.initialEntities || []);
  let activeCallouts: RoughCalloutPrimitive[] = [];

  // 4. Track camera transitions
  let currentCamera: CameraState = {
    x: timeline.initialCamera?.x ?? 0,
    y: timeline.initialCamera?.y ?? 0,
    zoom: timeline.initialCamera?.zoom ?? 1.0,
  };

  for (let i = 0; i <= activeCueIndex; i++) {
    const cue = timeline.cues[i];
    if (!cue || cue.timestampMs > timeMs) break;

    for (const action of cue.actions) {
      if (action.type === 'camera') {
        const duration = action.durationMs ?? 600;
        const targetCam: CameraState = {
          x: action.panX !== undefined ? action.panX : currentCamera.x,
          y: action.panY !== undefined ? action.panY : currentCamera.y,
          zoom: action.zoom !== undefined ? action.zoom : currentCamera.zoom,
        };

        const elapsed = timeMs - cue.timestampMs;
        if (elapsed < duration && duration > 0) {
          // Camera transition currently interpolating
          currentCamera = interpolateCamera(currentCamera, targetCam, elapsed / duration, action.easing);
        } else {
          // Camera transition completed
          currentCamera = targetCam;
        }
      } else {
        const result = applyActionToEntities(currentEntities, action);
        currentEntities = result.entities;

        if (result.clearCallouts) {
          activeCallouts = [];
        }
        if (result.newCallout) {
          // Avoid duplicate callout IDs
          activeCallouts = [
            ...activeCallouts.filter(c => c.id !== result.newCallout!.id),
            result.newCallout,
          ];
        }
      }
    }
  }

  return {
    timeMs,
    totalDurationMs,
    progress,
    activeCueIndex,
    activeCue,
    activeWordIndex,
    activeWord,
    activeNarration,
    camera: currentCamera,
    entities: currentEntities,
    activeCallouts,
  };
}
