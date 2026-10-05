/**
 * MENTORA DETERMINISTIC ENGINE - EVALUATION TYPES
 * 
 * SceneFrameState represents the exact, frozen state of the visual world
 * at millisecond T.
 * 
 * SceneFrameState = f(timeline, timeMs)
 * 
 * Scrubbing forward, backward, or jumping to any point in time produces
 * a bit-exact identical visual state with ZERO accumulation errors.
 */

import { 
  CameraState, 
  KineticTimeline, 
  RoughCalloutPrimitive, 
  TimelineCue, 
  VisualPrimitive, 
  WordTiming 
} from './kinetic';

export interface SceneFrameState {
  timeMs: number;
  totalDurationMs: number;
  progress: number; // 0.0 to 1.0
  
  // Active Cue & Narration
  activeCueIndex: number;
  activeCue: TimelineCue | null;
  activeWordIndex: number;
  activeWord: WordTiming | null;
  activeNarration: string;

  // Camera transform at timeMs
  camera: CameraState;

  // Scene entities mapped by stable ID (e.g. "arr_1", "eq_1")
  entities: Record<string, VisualPrimitive>;

  // Callouts currently rendered on the overlay (roughjs shapes)
  activeCallouts: RoughCalloutPrimitive[];
}

export interface EnginePlaybackControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (targetMs: number) => void;
  setSpeed: (speed: number) => void;
  restart: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}
