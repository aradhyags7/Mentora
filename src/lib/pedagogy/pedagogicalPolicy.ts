/**
 * MENTORA PEDAGOGICAL POLICY (Phase 8)
 * 
 * Determines the optimal next pedagogical action and teaching mode based on:
 * - Current concept mastery P(L) from BKT
 * - Active misconceptions detected
 * - Error frequency & consecutive successes
 * - Cognitive depth requirements
 */

import { TeachingActionType, TeachingMode } from '../../types/teachingDsl';
import { StudentState } from '../../types/pedagogy';

export interface PedagogicalDecisionInput {
  studentState: StudentState;
  concept: string;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  currentMode: TeachingMode;
  lastAction?: TeachingActionType;
}

export interface PedagogicalDecision {
  action: TeachingActionType;
  mode: TeachingMode;
  cognitiveTarget: 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis';
  rationale: string;
}

export class PedagogicalPolicyEngine {
  /**
   * Decides next optimal pedagogical action
   */
  static selectNextAction(input: PedagogicalDecisionInput): PedagogicalDecision {
    const { 
      studentState, 
      concept, 
      consecutiveSuccesses, 
      consecutiveFailures, 
      lastAction 
    } = input;

    const mastery = studentState.concepts[concept] ?? 0.25;
    const hasActiveMisconceptions = studentState.misconceptions.some(m => m.includes(concept) || concept.includes('derivative'));

    // Rule 1: High severity misconception detected -> IMMEDIATE VISUAL REMEDIATION
    if (hasActiveMisconceptions && consecutiveFailures > 0) {
      return {
        action: 'REMEDIATE',
        mode: 'demonstration',
        cognitiveTarget: 'comprehension',
        rationale: 'Active misconception detected in cognitive model. Immediate targeted demonstration required to clear intuitive block.',
      };
    }

    // Rule 2: Repeated struggle (2+ failures) -> HINT or WORKED EXAMPLE
    if (consecutiveFailures >= 2) {
      return {
        action: 'HINT',
        mode: 'worked_example',
        cognitiveTarget: 'comprehension',
        rationale: 'Student struggling with abstract formulation. Providing step-by-step worked example with structural scaffolding.',
      };
    }

    // Rule 3: High Mastery (>= 0.85) + repeated success -> CHALLENGE / ASSESSMENT
    if (mastery >= 0.85 && consecutiveSuccesses >= 2) {
      return {
        action: 'CHALLENGE',
        mode: 'assessment',
        cognitiveTarget: 'analysis',
        rationale: 'Student exhibits mastery (P(L) >= 0.85). Challenging with boundary conditions and edge cases to test generalization.',
      };
    }

    // Rule 4: Moderate Mastery (0.6 - 0.85) -> GUIDED PRACTICE
    if (mastery >= 0.6) {
      return {
        action: 'PRACTICE',
        mode: 'guided_practice',
        cognitiveTarget: 'application',
        rationale: 'Intermediate mastery established. Engaging student in guided practice to build fluency.',
      };
    }

    // Rule 5: Low Mastery (< 0.4) -> VISUALIZE & SOCRATIC EXPLORATION
    if (mastery < 0.4) {
      return {
        action: lastAction === 'VISUALIZE' ? 'ASK' : 'VISUALIZE',
        mode: lastAction === 'VISUALIZE' ? 'socratic' : 'visual',
        cognitiveTarget: 'comprehension',
        rationale: 'Initial conceptualization phase. Visualizing geometric/structural invariants and probing intuition with targeted Socratic questions.',
      };
    }

    // Default Action: EXPLAIN
    return {
      action: 'EXPLAIN',
      mode: 'explanation',
      cognitiveTarget: 'comprehension',
      rationale: 'Clarifying core principles and connecting foundational axioms.',
    };
  }
}
