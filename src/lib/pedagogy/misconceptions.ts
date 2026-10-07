/**
 * MENTORA MISCONCEPTION TAXONOMY & CLASSIFICATION (Phase 7)
 * 
 * Diagnostic catalog and pattern matcher for identifying cognitive bugs,
 * mental model errors, and targeted pedagogical remediation.
 */

import { Misconception, EvaluationResult } from '../../types/pedagogy';
import { GlobalStudentModel } from './studentModel';

export const MISCONCEPTION_CATALOG: Misconception[] = [
  {
    id: 'confuses_derivative_with_function_value',
    concept: 'math.derivative',
    pattern: 'function value instead of slope',
    title: 'Confusing Function Value with Instantaneous Slope',
    explanation: 'The student evaluates f(x) instead of the rate of change f\'(x). For example, claiming the derivative of x² at 3 is 9 because 3² = 9.',
    severity: 'medium',
    remediationAction: 'VISUALIZE',
    remediationGuidance: 'Distinguish altitude (height on the y-axis) from steepness (speedometer reading or slope of the tangent line).',
  },
  {
    id: 'confuses_secant_with_tangent',
    concept: 'math.derivative',
    pattern: 'secant average instead of instantaneous limit',
    title: 'Treating Average Rate as Instantaneous Rate',
    explanation: 'The student computes Δy/Δx over a finite interval without taking the limit as Δx approaches zero.',
    severity: 'medium',
    remediationAction: 'DEMONSTRATE',
    remediationGuidance: 'Show the secant line morphing continuously into the tangent line as Δx shrinks toward 0.',
  },
  {
    id: 'omitted_power_rule_coefficient',
    concept: 'math.derivative',
    pattern: 'derivative of x^2 is x',
    title: 'Omitted Power Rule Exponent Coefficient',
    explanation: 'The student decreases the power but forgets to multiply by the original exponent (e.g. d/dx(x²) = x instead of 2x).',
    severity: 'low',
    remediationAction: 'WORKED_EXAMPLE',
    remediationGuidance: 'Step through the geometric expansion (x + dx)² = x² + 2x·dx + dx² to show why the factor of 2 emerges naturally.',
  },
  {
    id: 'binary_search_unsorted_assumption',
    concept: 'cs.binary_search',
    pattern: 'works on unsorted arrays',
    title: 'Assuming Binary Search Operates on Unsorted Data',
    explanation: 'The student believes binary search can eliminate partitions without requiring monotonicity or sorted order.',
    severity: 'high',
    remediationAction: 'REMEDIATE',
    remediationGuidance: 'Show a counterexample where an unsorted array discards the half that actually contains the target value.',
  },
  {
    id: 'binary_search_off_by_one_mid',
    concept: 'cs.binary_search',
    pattern: 'mid without + 1 or - 1',
    title: 'Boundary Pointer Infinite Loop (Off-by-One)',
    explanation: 'The student updates low = mid instead of mid + 1, causing an infinite loop when high - low = 1.',
    severity: 'medium',
    remediationAction: 'DEBUGGING' as any,
    remediationGuidance: 'Step through a 2-element array [10, 20] hunting for 20 to demonstrate how low = mid halts convergence.',
  },
];

export function diagnoseStudentResponse(
  concept: string,
  questionPrompt: string,
  studentAnswer: string
): EvaluationResult {
  const answerLower = studentAnswer.toLowerCase().trim();
  const detected: Misconception[] = [];

  // 1. Calculus: Derivative Misconception Detection
  if (concept === 'math.derivative' || concept.includes('derivative')) {
    // Check if student confused f(x) value with f'(x)
    // E.g. "9", "it is 9", "because 3 squared is 9", "it is the height", "the y coordinate"
    if (
      answerLower.includes('9') || 
      answerLower.includes('y value') || 
      answerLower.includes('height') ||
      answerLower.includes('squared is') ||
      (answerLower.includes('value of the function') && !answerLower.includes('rate'))
    ) {
      const misc = MISCONCEPTION_CATALOG.find(m => m.id === 'confuses_derivative_with_function_value')!;
      detected.push(misc);
      GlobalStudentModel.addMisconception(misc.id);
      GlobalStudentModel.recordError('Confused function height with tangent steepness');

      const { before, after } = GlobalStudentModel.updateMastery('math.derivative', false);

      return {
        isCorrect: false,
        score: 0.25,
        reasoning: "You're looking at the height on the curve (f(3) = 9), but the derivative measures steepness (the instantaneous speed or slope). At x = 3, the tangent line slope is f'(3) = 2(3) = 6.",
        detectedMisconceptions: detected,
        concept: 'math.derivative',
        masteryBefore: before,
        masteryAfter: after,
        recommendedAction: 'VISUALIZE',
        recommendedMode: 'visual',
      };
    }

    // Check if student correctly identifies slope / rate of change / steepness / speed
    if (
      answerLower.includes('slope') ||
      answerLower.includes('rate of change') ||
      answerLower.includes('steepness') ||
      answerLower.includes('speed') ||
      answerLower.includes('tangent') ||
      answerLower.includes('velocity')
    ) {
      const { before, after } = GlobalStudentModel.updateMastery('math.derivative', true);
      GlobalStudentModel.clearMisconception('confuses_derivative_with_function_value');

      return {
        isCorrect: true,
        score: 1.0,
        reasoning: "Spot on! The derivative represents the instantaneous slope of the tangent line—the exact rate of change at that point.",
        detectedMisconceptions: [],
        concept: 'math.derivative',
        masteryBefore: before,
        masteryAfter: after,
        recommendedAction: 'ADVANCE',
        recommendedMode: 'socratic',
      };
    }
  }

  // 2. CS: Binary Search Check
  if (concept === 'cs.binary_search' || concept.includes('binary')) {
    if (answerLower.includes('unsorted') || answerLower.includes('random order')) {
      const misc = MISCONCEPTION_CATALOG.find(m => m.id === 'binary_search_unsorted_assumption')!;
      detected.push(misc);
      const { before, after } = GlobalStudentModel.updateMastery('cs.binary_search', false);
      return {
        isCorrect: false,
        score: 0.2,
        reasoning: "Binary search strictly requires a sorted collection. Without sorted order, discarding half the elements might discard our target!",
        detectedMisconceptions: detected,
        concept: 'cs.binary_search',
        masteryBefore: before,
        masteryAfter: after,
        recommendedAction: 'REMEDIATE',
        recommendedMode: 'demonstration',
      };
    }

    if (answerLower.includes('half') || answerLower.includes('log') || answerLower.includes('sorted') || answerLower.includes('divide')) {
      const { before, after } = GlobalStudentModel.updateMastery('cs.binary_search', true);
      return {
        isCorrect: true,
        score: 0.95,
        reasoning: "Exactly right! Halving the candidate search space at every step yields logarithmic O(log n) time complexity.",
        detectedMisconceptions: [],
        concept: 'cs.binary_search',
        masteryBefore: before,
        masteryAfter: after,
        recommendedAction: 'ADVANCE',
        recommendedMode: 'guided_practice',
      };
    }
  }

  // Generic fallback evaluation
  const { before, after } = GlobalStudentModel.updateMastery(concept, true);
  return {
    isCorrect: true,
    score: 0.85,
    reasoning: "Thoughtful observation! Let's examine how this connects to our visual model.",
    detectedMisconceptions: [],
    concept,
    masteryBefore: before,
    masteryAfter: after,
    recommendedAction: 'EXPLAIN',
    recommendedMode: 'explanation',
  };
}
