/**
 * MENTORA DETERMINISTIC ENGINE - VALIDATOR & SCHEMA
 * 
 * Strict runtime validation using Zod with auto-repair fallbacks.
 * Ensures LLM-generated JSON conforms 100% to the Kinetic DSL contract.
 */

import { z } from 'zod';
import { KineticTimeline } from '../../types/kinetic';
import { compileTimeline } from './compiler';

export const ArrayItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number()]),
  state: z.enum(['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found']).default('default'),
  index: z.number(),
});

export const ArrayPointerSchema = z.object({
  id: z.string(),
  label: z.string(),
  targetIndex: z.number(),
  color: z.string().optional(),
  position: z.enum(['top', 'bottom']).default('top'),
});

export const ArrayPrimitiveSchema = z.object({
  id: z.string(),
  type: z.literal('array'),
  title: z.string().optional(),
  items: z.array(ArrayItemSchema),
  pointers: z.array(ArrayPointerSchema).default([]),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const MathSymbolHighlightSchema = z.object({
  symbolId: z.string(),
  color: z.string(),
  label: z.string().optional(),
});

export const MathEquationPrimitiveSchema = z.object({
  id: z.string(),
  type: z.literal('equation'),
  latex: z.string(),
  explanation: z.string().optional(),
  highlights: z.array(MathSymbolHighlightSchema).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const GraphPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  label: z.string().optional(),
  color: z.string().optional(),
});

export const CoordinateGraphPrimitiveSchema = z.object({
  id: z.string(),
  type: z.literal('graph'),
  title: z.string().optional(),
  fnLatex: z.string(),
  rangeX: z.array(z.number()).transform(arr => [arr[0] ?? -5, arr[1] ?? 5] as [number, number]).default([-5, 5]),
  rangeY: z.array(z.number()).transform(arr => [arr[0] ?? -5, arr[1] ?? 5] as [number, number]).default([-5, 5]),
  points: z.array(GraphPointSchema).optional(),
  tangentAtX: z.number().optional(),
  secantBetween: z.array(z.number()).transform(arr => (arr && arr.length >= 2 ? [arr[0], arr[1]] as [number, number] : undefined)).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const RoughCalloutPrimitiveSchema = z.object({
  id: z.string(),
  type: z.literal('callout'),
  shape: z.enum(['circle', 'box', 'arrow', 'underline', 'bracket', 'strike']),
  color: z.string().default('#3B82F6'),
  strokeWidth: z.number().optional(),
  label: z.string().optional(),
  targetEntityId: z.string().optional(),
  targetIndex: z.number().optional(),
  fromPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  toPoint: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const CardItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  badge: z.string().optional(),
});

export const CardContainerPrimitiveSchema = z.object({
  id: z.string(),
  type: z.literal('card'),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  items: z.array(CardItemSchema).optional(),
  theme: z.enum(['default', 'accent', 'warning', 'success']).default('default'),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const VisualPrimitiveSchema = z.discriminatedUnion('type', [
  ArrayPrimitiveSchema,
  MathEquationPrimitiveSchema,
  CoordinateGraphPrimitiveSchema,
  RoughCalloutPrimitiveSchema,
  CardContainerPrimitiveSchema,
]);

export const CameraActionSchema = z.object({
  type: z.literal('camera'),
  panX: z.number().optional(),
  panY: z.number().optional(),
  zoom: z.number().optional(),
  durationMs: z.number().optional(),
  easing: z.enum(['linear', 'easeOut', 'easeInOut', 'elastic']).optional(),
});

export const EntityActionSchema = z.union([
  z.object({ type: z.literal('entity:spawn'), entity: VisualPrimitiveSchema }),
  z.object({ type: z.literal('entity:destroy'), targetId: z.string() }),
  z.object({ type: z.literal('array:set_items'), targetId: z.string(), items: z.array(ArrayItemSchema) }),
  z.object({ type: z.literal('array:move_pointer'), targetId: z.string(), pointerId: z.string(), targetIndex: z.number() }),
  z.object({ type: z.literal('array:highlight_range'), targetId: z.string(), startIndex: z.number(), endIndex: z.number(), state: z.enum(['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found']) }),
  z.object({ type: z.literal('array:mark_state'), targetId: z.string(), indices: z.array(z.number()), state: z.enum(['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found']) }),
  z.object({ type: z.literal('equation:update_latex'), targetId: z.string(), latex: z.string(), highlights: z.array(MathSymbolHighlightSchema).optional() }),
  z.object({ type: z.literal('graph:set_tangent'), targetId: z.string(), tangentAtX: z.number() }),
  z.object({ type: z.literal('card:update'), targetId: z.string(), title: z.string().optional(), content: z.string().optional(), items: z.array(CardItemSchema).optional() }),
  z.object({ type: z.literal('callout:show'), callout: RoughCalloutPrimitiveSchema, durationMs: z.number().optional() }),
  z.object({ type: z.literal('callout:clear'), targetId: z.string().optional() }),
]);

export const KineticActionSchema = z.union([CameraActionSchema, EntityActionSchema]);

export const WordTimingSchema = z.object({
  word: z.string(),
  startOffsetMs: z.number(),
  endOffsetMs: z.number(),
});

export const TimelineCueSchema = z.object({
  id: z.string(),
  timestampMs: z.number(),
  durationMs: z.number().optional(),
  narration: z.string(),
  words: z.array(WordTimingSchema).optional(),
  actions: z.array(KineticActionSchema).default([]),
});

export const KineticTimelineSchema = z.object({
  id: z.string().default(() => `tl_${Date.now()}`),
  title: z.string(),
  concept: z.string(),
  totalDurationMs: z.number().default(10000),
  initialCamera: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    zoom: z.number().default(1.0),
  }).optional(),
  initialEntities: z.array(VisualPrimitiveSchema).default([]),
  cues: z.array(TimelineCueSchema),
  meta: z.record(z.string(), z.any()).optional(),
});

export function sanitizeEntity(raw: any, index: number = 0): any {
  if (!raw || typeof raw !== 'object') return null;

  // If already directly valid according to the schema, keep it as is
  const direct = VisualPrimitiveSchema.safeParse(raw);
  if (direct.success) {
    return direct.data;
  }

  const id = raw.id || `entity_${index}`;
  const validTypes = ['array', 'equation', 'graph', 'callout', 'card'];

  let type = raw.type;
  if (!validTypes.includes(type)) {
    if (type === 'text' || type === 'note' || type === 'message' || raw.content || raw.title) {
      type = 'card';
    } else if (raw.items && Array.isArray(raw.items)) {
      type = 'array';
    } else if (raw.latex || raw.equation || raw.fnLatex) {
      type = raw.fnLatex ? 'graph' : 'equation';
    } else {
      type = 'card';
    }
  }

  if (type === 'array') {
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    const items = rawItems.map((it: any, i: number) => {
      if (typeof it === 'number' || typeof it === 'string') {
        return { id: `item_${i}`, value: it, index: i, state: 'default' };
      }
      return {
        id: it?.id || `item_${i}`,
        value: it?.value !== undefined ? it.value : i,
        index: typeof it?.index === 'number' ? it.index : i,
        state: ['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found'].includes(it?.state) ? it.state : 'default',
      };
    });
    return {
      id,
      type: 'array',
      title: raw.title,
      items,
      pointers: Array.isArray(raw.pointers) ? raw.pointers : [],
      position: raw.position,
    };
  }

  if (type === 'card') {
    return {
      id,
      type: 'card',
      title: raw.title || 'Overview',
      content: raw.content || raw.text || raw.label || '',
      theme: ['default', 'accent', 'warning', 'success'].includes(raw.theme) ? raw.theme : 'default',
      items: Array.isArray(raw.items) ? raw.items : undefined,
      position: raw.position,
    };
  }

  if (type === 'equation') {
    return {
      id,
      type: 'equation',
      latex: raw.latex || raw.equation || 'E = mc^2',
      explanation: raw.explanation,
      highlights: Array.isArray(raw.highlights) ? raw.highlights : undefined,
      position: raw.position,
    };
  }

  // Normalize coordinate graph equations and ranges with defaults
  if (type === 'graph') {
    return {
      id,
      type: 'graph',
      title: raw.title,
      fnLatex: raw.fnLatex || raw.functionLatex || raw.latex || '0.5*x^2 - 2',
      rangeX: raw.rangeX || raw.xRange || [-5, 5],
      rangeY: raw.rangeY || raw.yRange || [-5, 5],
      points: Array.isArray(raw.points) ? raw.points : [],
      tangentAtX: typeof raw.tangentAtX === 'number' ? raw.tangentAtX : undefined,
      position: raw.position,
    };
  }

  if (type === 'callout') {
    return {
      id,
      type: 'callout',
      shape: ['circle', 'box', 'arrow', 'underline', 'bracket', 'strike'].includes(raw.shape) ? raw.shape : 'box',
      color: raw.color || raw.strokeColor || '#3B82F6',
      label: raw.label || raw.text || raw.content,
      targetEntityId: raw.targetEntityId || raw.targetId,
      targetIndex: typeof raw.targetIndex === 'number' ? raw.targetIndex : undefined,
    };
  }

  return null;
}

export function sanitizeAction(act: any): any {
  if (!act || typeof act !== 'object') return null;

  // If already directly valid according to the schema, keep it as is
  const direct = KineticActionSchema.safeParse(act);
  if (direct.success) {
    return direct.data;
  }

  if (act.type === 'camera') {
    return {
      type: 'camera',
      panX: typeof act.panX === 'number' ? act.panX : undefined,
      panY: typeof act.panY === 'number' ? act.panY : undefined,
      zoom: typeof act.zoom === 'number' ? act.zoom : undefined,
      durationMs: typeof act.durationMs === 'number' ? act.durationMs : undefined,
      easing: ['linear', 'easeOut', 'easeInOut', 'elastic'].includes(act.easing) ? act.easing : undefined,
    };
  }

  if (act.type === 'entity:spawn' && act.entity) {
    const cleanEntity = sanitizeEntity(act.entity, 0);
    const parsed = VisualPrimitiveSchema.safeParse(cleanEntity);
    if (parsed.success) {
      return { type: 'entity:spawn', entity: parsed.data };
    }
    return null;
  }

  if (act.type === 'entity:destroy') {
    return { type: 'entity:destroy', targetId: act.targetId || act.target || '' };
  }

  if (act.type === 'array:set_items' && (act.targetId || act.target)) {
    const rawItems = Array.isArray(act.items) ? act.items : [];
    return {
      type: 'array:set_items',
      targetId: act.targetId || act.target,
      items: rawItems.map((it: any, i: number) => ({
        id: it?.id || `item_${i}`,
        value: it?.value !== undefined ? it.value : i,
        index: typeof it?.index === 'number' ? it.index : i,
        state: ['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found'].includes(it?.state) ? it.state : 'default',
      })),
    };
  }

  if ((act.type === 'array:move_pointer' || act.type === 'pointer:move') && (act.targetId || act.target)) {
    return {
      type: 'array:move_pointer',
      targetId: act.targetId || act.target,
      pointerId: act.pointerId || act.id || 'p_main',
      targetIndex: typeof act.targetIndex === 'number' ? act.targetIndex : (typeof act.index === 'number' ? act.index : 0),
    };
  }

  if (act.type === 'array:highlight_range' && (act.targetId || act.target)) {
    const validState = ['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found'].includes(act.state) ? act.state : 'highlight';
    return {
      type: 'array:highlight_range',
      targetId: act.targetId || act.target,
      startIndex: typeof act.startIndex === 'number' ? act.startIndex : 0,
      endIndex: typeof act.endIndex === 'number' ? act.endIndex : 0,
      state: validState,
    };
  }

  if (act.type === 'array:mark_state' && (act.targetId || act.target)) {
    const validState = ['default', 'highlight', 'active', 'dimmed', 'eliminated', 'found'].includes(act.state) ? act.state : 'highlight';
    const rawIndices = Array.isArray(act.indices) ? act.indices : (typeof act.index === 'number' ? [act.index] : []);
    return {
      type: 'array:mark_state',
      targetId: act.targetId || act.target,
      indices: rawIndices.filter((n: any) => typeof n === 'number'),
      state: validState,
    };
  }

  if (act.type === 'card:update' && (act.targetId || act.target)) {
    return {
      type: 'card:update',
      targetId: act.targetId || act.target,
      title: act.title,
      content: act.content,
      items: Array.isArray(act.items) ? act.items : undefined,
    };
  }

  if (act.type === 'callout:show' && act.callout) {
    const cleanCallout = sanitizeEntity(act.callout, 0);
    const parsed = RoughCalloutPrimitiveSchema.safeParse(cleanCallout);
    if (parsed.success) {
      return {
        type: 'callout:show',
        callout: parsed.data,
        durationMs: act.durationMs,
      };
    }
    return null;
  }

  if (act.type === 'callout:clear') {
    return {
      type: 'callout:clear',
      targetId: act.targetId || act.target,
    };
  }

  const check = KineticActionSchema.safeParse(act);
  return check.success ? check.data : null;
}

export function normalizeRawTimeline(input: any): any {
  if (!input || typeof input !== 'object') return input;

  // Unwrap common wrapper keys
  let data = input;
  if (data.timeline && typeof data.timeline === 'object') {
    data = data.timeline;
  } else if (data.data?.timeline && typeof data.data.timeline === 'object') {
    data = data.data.timeline;
  } else if (data.kineticTimeline && typeof data.kineticTimeline === 'object') {
    data = data.kineticTimeline;
  } else if (data.result?.timeline && typeof data.result.timeline === 'object') {
    data = data.result.timeline;
  } else if (data.data && typeof data.data === 'object' && !data.cues && data.data.cues) {
    data = data.data;
  }

  const copy = { ...data };

  if (!copy.id) copy.id = `tl_${Date.now()}`;
  if (!copy.title) copy.title = copy.concept || copy.name || copy.topic || 'Visual Concept';
  if (!copy.concept) copy.concept = copy.title || copy.topic || 'Educational Concept';

  // Support cues under alternative LLM keys like steps, beats, scenes
  if (!Array.isArray(copy.cues)) {
    if (Array.isArray(copy.steps)) copy.cues = copy.steps;
    else if (Array.isArray(copy.beats)) copy.cues = copy.beats;
    else if (Array.isArray(copy.scenes)) copy.cues = copy.scenes;
    else copy.cues = [];
  }

  // Sanitize initial entities
  const rawEntities = Array.isArray(copy.initialEntities) ? copy.initialEntities : (Array.isArray(copy.entities) ? copy.entities : []);
  copy.initialEntities = rawEntities
    .map((ent: any, idx: number) => sanitizeEntity(ent, idx))
    .filter((ent: any) => ent !== null);

  // Ensure each cue has minimal required valid shape and safe actions
  copy.cues = copy.cues.map((cue: any, idx: number) => {
    if (!cue || typeof cue !== 'object') {
      return { id: `cue_${idx}`, timestampMs: idx * 3000, narration: '', actions: [] };
    }
    const rawActions = Array.isArray(cue.actions) ? cue.actions : [];
    const validActions = rawActions
      .map((a: any) => sanitizeAction(a))
      .filter((a: any) => a !== null);

    return {
      id: cue.id || `cue_${idx}`,
      timestampMs: typeof cue.timestampMs === 'number' ? cue.timestampMs : (cue.timestamp || cue.timeMs || idx * 3000),
      durationMs: typeof cue.durationMs === 'number' ? cue.durationMs : cue.duration,
      narration: cue.narration || cue.text || cue.speech || cue.description || '',
      words: Array.isArray(cue.words) ? cue.words : undefined,
      actions: validActions,
    };
  });

  return copy;
}

export function validateAndCompileTimeline(rawJson: unknown): KineticTimeline {
  const normalized = normalizeRawTimeline(rawJson);
  const parsed = KineticTimelineSchema.safeParse(normalized);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Timeline Validation Failed: ${errorDetails}`);
  }
  return compileTimeline(parsed.data as KineticTimeline);
}
