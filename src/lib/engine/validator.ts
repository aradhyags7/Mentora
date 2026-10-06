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

export function validateAndCompileTimeline(rawJson: unknown): KineticTimeline {
  const parsed = KineticTimelineSchema.safeParse(rawJson);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Timeline Validation Failed: ${errorDetails}`);
  }
  return compileTimeline(parsed.data as KineticTimeline);
}
