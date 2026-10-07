/**
 * MENTORA TEACHING DSL (Phase 1 Contract)
 * 
 * Strict protocol between the AI reasoning layer and the deterministic classroom runtime.
 * Guarantees model never generates arbitrary frontend code.
 */

import { z } from 'zod';

export type TeachingMode = 
  | 'explanation'
  | 'socratic'
  | 'visual'
  | 'demonstration'
  | 'worked_example'
  | 'guided_practice'
  | 'debugging'
  | 'assessment';

export type TeachingActionType =
  | 'EXPLAIN'
  | 'ASK'
  | 'HINT'
  | 'DEMONSTRATE'
  | 'VISUALIZE'
  | 'WORKED_EXAMPLE'
  | 'PRACTICE'
  | 'CHALLENGE'
  | 'REMEDIATE'
  | 'ADVANCE'
  | 'ASSESS';

export interface DslSpeakStep {
  t: number;
  type: 'speak';
  text: string;
  words?: Array<{ word: string; startOffsetMs: number; endOffsetMs: number }>;
}

export interface DslArtifactCreateStep {
  t: number;
  type: 'artifact.create';
  artifact: string;
  props: Record<string, any>;
}

export interface DslArtifactAnimateStep {
  t: number;
  type: 'artifact.animate';
  target: string;
  animation: string;
  params?: Record<string, any>;
  durationMs?: number;
}

export interface DslCameraStep {
  t: number;
  type: 'camera';
  panX?: number;
  panY?: number;
  zoom?: number;
  durationMs?: number;
}

export interface DslAskStep {
  t: number;
  type: 'ask';
  question: string;
  expectedConcept?: string;
  hints?: string[];
}

export type DslTimelineStep = 
  | DslSpeakStep 
  | DslArtifactCreateStep 
  | DslArtifactAnimateStep 
  | DslCameraStep 
  | DslAskStep;

export interface TeachingDslLesson {
  lesson_id: string;
  mode: TeachingMode;
  objective: string;
  action: TeachingActionType;
  timeline: DslTimelineStep[];
  meta?: {
    concept: string;
    targetPrerequisites?: string[];
    estimatedDifficulty?: 'introductory' | 'intermediate' | 'advanced';
    studentLevel?: string;
  };
}

// Zod Schemas for Runtime Validation
export const DslSpeakStepSchema = z.object({
  t: z.number(),
  type: z.literal('speak'),
  text: z.string(),
  words: z.array(z.object({
    word: z.string(),
    startOffsetMs: z.number(),
    endOffsetMs: z.number(),
  })).optional(),
});

export const DslArtifactCreateStepSchema = z.object({
  t: z.number(),
  type: z.literal('artifact.create'),
  artifact: z.string(),
  props: z.record(z.string(), z.any()).default({}),
});

export const DslArtifactAnimateStepSchema = z.object({
  t: z.number(),
  type: z.literal('artifact.animate'),
  target: z.string(),
  animation: z.string(),
  params: z.record(z.string(), z.any()).optional(),
  durationMs: z.number().optional(),
});

export const DslCameraStepSchema = z.object({
  t: z.number(),
  type: z.literal('camera'),
  panX: z.number().optional(),
  panY: z.number().optional(),
  zoom: z.number().optional(),
  durationMs: z.number().optional(),
});

export const DslAskStepSchema = z.object({
  t: z.number(),
  type: z.literal('ask'),
  question: z.string(),
  expectedConcept: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

export const DslTimelineStepSchema = z.union([
  DslSpeakStepSchema,
  DslArtifactCreateStepSchema,
  DslArtifactAnimateStepSchema,
  DslCameraStepSchema,
  DslAskStepSchema,
]);

export const TeachingDslLessonSchema = z.object({
  lesson_id: z.string().default(() => `lesson_${Date.now()}`),
  mode: z.enum([
    'explanation',
    'socratic',
    'visual',
    'demonstration',
    'worked_example',
    'guided_practice',
    'debugging',
    'assessment',
  ]).default('visual'),
  objective: z.string(),
  action: z.enum([
    'EXPLAIN',
    'ASK',
    'HINT',
    'DEMONSTRATE',
    'VISUALIZE',
    'WORKED_EXAMPLE',
    'PRACTICE',
    'CHALLENGE',
    'REMEDIATE',
    'ADVANCE',
    'ASSESS',
  ]).default('VISUALIZE'),
  timeline: z.array(DslTimelineStepSchema),
  meta: z.object({
    concept: z.string().optional(),
    targetPrerequisites: z.array(z.string()).optional(),
    estimatedDifficulty: z.enum(['introductory', 'intermediate', 'advanced']).optional(),
    studentLevel: z.string().optional(),
  }).optional(),
});
