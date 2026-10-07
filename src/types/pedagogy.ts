/**
 * MENTORA PEDAGOGY & STUDENT MODELING (Phase 0, 5, 6, 7)
 * 
 * Bayesian Knowledge Tracing (BKT), Student State Representation,
 * and Misconception Detection Taxonomies.
 */

import { TeachingMode, TeachingActionType } from './teachingDsl';

export interface BktParameters {
  p_l0: number; // Prior probability of initial mastery
  p_t: number;  // Probability of transitioning from unmastered to mastered
  p_g: number;  // Probability of guessing correctly while unmastered
  p_s: number;  // Probability of slipping (answering incorrectly while mastered)
}

export interface StudentState {
  id: string;
  concepts: Record<string, number>; // Probability of mastery P(L) in [0, 1]
  misconceptions: string[];          // Active identified misconceptions
  recent_errors: string[];
  preferred_modes: TeachingMode[];
  confidence: number;                // Self-assessed or derived confidence [0, 1]
  totalInteractions: number;
  lastUpdated: string;
}

export interface Misconception {
  id: string;
  concept: string;
  pattern: string;                   // Diagnostic pattern or keyword
  title: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  remediationAction: TeachingActionType;
  remediationGuidance: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;                     // [0, 1]
  reasoning: string;
  detectedMisconceptions: Misconception[];
  concept: string;
  masteryBefore: number;
  masteryAfter: number;
  recommendedAction: TeachingActionType;
  recommendedMode: TeachingMode;
}
