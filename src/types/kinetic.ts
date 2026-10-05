/**
 * MENTORA KINETIC EXPLAINER ENGINE - CORE TYPES
 * 
 * Declarative Kinetic Timeline & Scene Graph DSL.
 * Primitives are driven by stable IDs (not bespoke components).
 * Scene state is a pure function of time: SceneFrameState = f(timeline, timeMs).
 */

export type PrimitiveType = 
  | 'array' 
  | 'equation' 
  | 'graph' 
  | 'callout' 
  | 'card'
  | 'tree'
  | 'code';

export type EntityItemState = 
  | 'default' 
  | 'highlight' 
  | 'active' 
  | 'dimmed' 
  | 'eliminated' 
  | 'found';

export interface ArrayItem {
  id: string;
  value: string | number;
  state: EntityItemState;
  index: number;
}

export interface ArrayPointer {
  id: string;
  label: string;
  targetIndex: number;
  color?: string;
  position: 'top' | 'bottom';
}

export interface ArrayPrimitive {
  id: string;
  type: 'array';
  title?: string;
  items: ArrayItem[];
  pointers: ArrayPointer[];
  position?: { x: number; y: number };
}

export interface MathSymbolHighlight {
  symbolId: string;
  color: string;
  label?: string;
}

export interface MathEquationPrimitive {
  id: string;
  type: 'equation';
  latex: string;
  explanation?: string;
  highlights?: MathSymbolHighlight[];
  position?: { x: number; y: number };
}

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface CoordinateGraphPrimitive {
  id: string;
  type: 'graph';
  title?: string;
  fnLatex: string;
  rangeX: [number, number];
  rangeY: [number, number];
  points?: GraphPoint[];
  tangentAtX?: number;
  secantBetween?: [number, number];
  position?: { x: number; y: number };
}

export type CalloutShape = 
  | 'circle' 
  | 'box' 
  | 'arrow' 
  | 'underline' 
  | 'bracket' 
  | 'strike';

export interface RoughCalloutPrimitive {
  id: string;
  type: 'callout';
  shape: CalloutShape;
  color: string;
  strokeWidth?: number;
  label?: string;
  targetEntityId?: string; // Stable ID of the entity being pointed to/circled
  targetIndex?: number;    // If targeting an item inside an array or tree
  fromPoint?: { x: number; y: number };
  toPoint?: { x: number; y: number };
}

export interface CardItem {
  label: string;
  value: string;
  badge?: string;
}

export interface CardContainerPrimitive {
  id: string;
  type: 'card';
  title: string;
  subtitle?: string;
  content?: string;
  items?: CardItem[];
  theme?: 'default' | 'accent' | 'warning' | 'success';
  position?: { x: number; y: number };
}

export type VisualPrimitive = 
  | ArrayPrimitive 
  | MathEquationPrimitive 
  | CoordinateGraphPrimitive 
  | RoughCalloutPrimitive 
  | CardContainerPrimitive;

/* -------------------------------------------------------------------------- */
/*                               CAMERA ACTIONS                               */
/* -------------------------------------------------------------------------- */

export interface CameraState {
  x: number;      // Pan offset X in px
  y: number;      // Pan offset Y in px
  zoom: number;   // 1.0 = normal, 1.5 = zoomed in
}

export interface CameraAction {
  type: 'camera';
  panX?: number;
  panY?: number;
  zoom?: number;
  durationMs?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'elastic';
}

/* -------------------------------------------------------------------------- */
/*                               ENTITY ACTIONS                              */
/* -------------------------------------------------------------------------- */

export type EntityAction =
  | {
      type: 'entity:spawn';
      entity: VisualPrimitive;
    }
  | {
      type: 'entity:destroy';
      targetId: string;
    }
  | {
      type: 'array:set_items';
      targetId: string;
      items: ArrayItem[];
    }
  | {
      type: 'array:move_pointer';
      targetId: string;
      pointerId: string;
      targetIndex: number;
    }
  | {
      type: 'array:highlight_range';
      targetId: string;
      startIndex: number;
      endIndex: number;
      state: EntityItemState;
    }
  | {
      type: 'array:mark_state';
      targetId: string;
      indices: number[];
      state: EntityItemState;
    }
  | {
      type: 'equation:update_latex';
      targetId: string;
      latex: string;
      highlights?: MathSymbolHighlight[];
    }
  | {
      type: 'graph:set_tangent';
      targetId: string;
      tangentAtX: number;
    }
  | {
      type: 'card:update';
      targetId: string;
      title?: string;
      content?: string;
      items?: CardItem[];
    }
  | {
      type: 'callout:show';
      callout: RoughCalloutPrimitive;
      durationMs?: number;
    }
  | {
      type: 'callout:clear';
      targetId?: string; // If omitted, clears all active callouts
    };

export type KineticAction = CameraAction | EntityAction;

/* -------------------------------------------------------------------------- */
/*                         WORD ALIGNMENT & CUES                             */
/* -------------------------------------------------------------------------- */

export interface WordTiming {
  word: string;
  startOffsetMs: number;
  endOffsetMs: number;
}

export interface TimelineCue {
  id: string;
  timestampMs: number; // Absolute offset from start in ms
  durationMs?: number; // How long this cue's narration or emphasis lasts
  narration: string;
  words?: WordTiming[];
  actions: KineticAction[];
}

/* -------------------------------------------------------------------------- */
/*                            COMPLETE TIMELINE                               */
/* -------------------------------------------------------------------------- */

export interface KineticTimeline {
  id: string;
  title: string;
  concept: string;
  totalDurationMs: number;
  initialCamera?: CameraState;
  initialEntities: VisualPrimitive[];
  cues: TimelineCue[];
  meta?: {
    author?: string;
    topic?: string;
    createdAt?: string;
  };
}
