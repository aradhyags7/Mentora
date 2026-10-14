/**
 * MENTORA KINETIC EXPLAINER ENGINE - CORE TYPES
 * 
 * Declarative Kinetic Timeline & Scene Graph DSL.
 * Primitives are driven by stable IDs (not bespoke components).
 * Scene state is a pure function of time: SceneFrameState = f(timeline, timeMs).
 * Specialized for Programming, Data Structures & Algorithms (DSA), System Design, and Math.
 */

export type PrimitiveType = 
  | 'array' 
  | 'equation' 
  | 'graph' 
  | 'callout' 
  | 'card'
  | 'tree'
  | 'code'
  | 'investigation_node'
  | 'causal_connector'
  | 'code_trace'
  | 'tree_graph'
  | 'stack_hashmap';

export type EntityItemState = 
  | 'default' 
  | 'highlight' 
  | 'active' 
  | 'dimmed' 
  | 'eliminated' 
  | 'found'
  | 'comparing'
  | 'swapping'
  | 'sorted';

/* -------------------------------------------------------------------------- */
/*                               DSA PRIMITIVES                               */
/* -------------------------------------------------------------------------- */

export interface ArrayItem {
  id: string;
  value: string | number;
  state: EntityItemState;
  index: number;
}

export interface ArrayElement {
  value: number | string;
  id?: string;
  state?: EntityItemState;
}

export interface ArrayPointer {
  id?: string;
  name?: string;
  label?: string;
  index?: number;
  targetIndex?: number;
  color?: string;
  position?: 'top' | 'bottom';
}

export interface ArrayNamedPointer {
  name: string;
  index: number;
  color?: string;
  position?: 'top' | 'bottom';
}

export interface ArrayHighlightRange {
  start: number;
  end: number;
  color?: string;
  label?: string;
}

export interface ArrayPrimitive {
  id: string;
  type: 'array';
  title?: string;
  items?: ArrayItem[];
  elements?: ArrayElement[];
  pointers?: ArrayPointer[];
  namedPointers?: ArrayNamedPointer[];
  highlightRange?: ArrayHighlightRange;
  swapIndices?: [number, number];
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  isDimmed?: boolean;
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

export interface CodeTracePrimitive {
  id: string;
  type: 'code_trace';
  title?: string;
  language?: string;
  codeLines: string[];
  activeLine?: number;
  highlightedLines?: number[];
  variableWatch?: Record<string, string | number>;
  complexityBadge?: { time: string; space: string };
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  isDimmed?: boolean;
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

export interface TreeGraphNode {
  id: string;
  label: string;
  subLabel?: string;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  state?: 'default' | 'visiting' | 'visited' | 'target' | 'backtracked';
  color?: string;
}

export interface TreeGraphEdge {
  from: string;
  to: string;
  label?: string;
  directed?: boolean;
  state?: 'default' | 'active' | 'traversed';
}

export interface TreeGraphPrimitive {
  id: string;
  type: 'tree_graph';
  title?: string;
  variant: 'binary_tree' | 'linked_list' | 'directed_graph' | 'recursion_tree';
  nodes: TreeGraphNode[];
  edges: TreeGraphEdge[];
  activePointer?: { nodeId: string; label: string; color?: string };
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  isDimmed?: boolean;
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

export interface StackHashMapEntry {
  key: string;
  value: string;
  state?: 'default' | 'pushed' | 'popping' | 'lookup_hit' | 'lookup_miss';
  color?: string;
}

export interface StackHashMapPrimitive {
  id: string;
  type: 'stack_hashmap';
  title: string;
  variant: 'call_stack' | 'monotonic_stack' | 'queue' | 'hashmap';
  entries: StackHashMapEntry[];
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  isDimmed?: boolean;
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

/* -------------------------------------------------------------------------- */
/*                               MATH & DIAGRAMS                              */
/* -------------------------------------------------------------------------- */

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
  colorMap?: Record<string, string>;
  position?: { x: number; y: number };
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
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
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
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
  targetEntityId?: string;
  targetIndex?: number;
  fromPoint?: { x: number; y: number };
  toPoint?: { x: number; y: number };
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
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
  drawProgress?: number;
}

export interface InvestigationNodePrimitive {
  id: string;
  type: 'investigation_node';
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  metricLabel?: string;
  metricValue?: string;
  accentColor?: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
  drawProgress?: number;
  isFocused?: boolean;
  isDimmed?: boolean;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

export interface CausalConnectorPrimitive {
  id: string;
  type: 'causal_connector';
  fromEntityId?: string;
  toEntityId?: string;
  fromPoint?: { x: number; y: number };
  toPoint?: { x: number; y: number };
  label?: string;
  color?: string;
  curveOffset?: number;
  drawProgress?: number;
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
}

export type VisualPrimitive = 
  | ArrayPrimitive 
  | CodeTracePrimitive
  | TreeGraphPrimitive
  | StackHashMapPrimitive
  | MathEquationPrimitive 
  | CoordinateGraphPrimitive 
  | RoughCalloutPrimitive 
  | CardContainerPrimitive
  | InvestigationNodePrimitive
  | CausalConnectorPrimitive;

/* -------------------------------------------------------------------------- */
/*                               CAMERA ACTIONS                               */
/* -------------------------------------------------------------------------- */

export interface CameraState {
  x: number;      // Pan offset X in px
  y: number;      // Pan offset Y in px
  zoom: number;   // 1.0 = normal, 1.5 = zoomed in
  focusEntityIds?: string[];
  spotlightIntensity?: number;
}

export interface CameraKeyframe {
  timestampMs: number;
  panX: number;
  panY: number;
  zoom: number;
  durationMs?: number;
  focusEntityIds?: string[];
  spotlightIntensity?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'elastic' | 'cinema' | 'manim';
}

export interface CameraAction {
  type: 'camera';
  panX?: number;
  panY?: number;
  zoom?: number;
  durationMs?: number;
  focusEntityIds?: string[];
  spotlightIntensity?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut' | 'elastic' | 'cinema' | 'manim';
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
      targetId?: string;
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
  timestampMs: number;
  durationMs?: number;
  narration: string;
  words?: WordTiming[];
  actions: KineticAction[];
  triggerPhrase?: string;
  triggerWordIndex?: number;
  drawDurationMs?: number;
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

/* -------------------------------------------------------------------------- */
/*                         SESSION & CONTEXT TYPES                            */
/* -------------------------------------------------------------------------- */

export interface LessonVariable {
  name: string;
  value: string | number;
  description: string;
  badge?: string;
}

export interface LessonOutlineItem {
  id: string;
  title: string;
  timestampMs: number;
  summary: string;
}

export interface RegisteredArtifact {
  id: string;
  semanticKey: string;
  title: string;
  domain: 'Algorithms' | 'Calculus' | 'Physics' | 'Systems' | 'Chemistry' | 'Computer Science' | 'General';
  timeline: KineticTimeline;
  outline: LessonOutlineItem[];
  variables: LessonVariable[];
  suggestedPrompts: string[];
}
