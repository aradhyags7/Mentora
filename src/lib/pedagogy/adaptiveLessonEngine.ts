/**
 * MENTORA ADAPTIVE LESSON ENGINE (Phase 4, 8, 9, 12)
 * 
 * Bridges Pedagogical Policy decisions, Deterministic Domain Engines (Math/CS),
 * and the Teaching DSL Compiler to dynamically generate remedial, advancement,
 * or practice lessons tailored to the student's cognitive state.
 */

import { TeachingDslLesson } from '../../types/teachingDsl';
import { EvaluationResult } from '../../types/pedagogy';
import { PedagogicalDecision } from './pedagogicalPolicy';
import { MathDomainEngine } from '../domain/mathEngine';
import { CsDomainEngine } from '../domain/csEngine';
import { TeachingDslCompiler } from '../dsl/dslCompiler';
import { KineticTimeline } from '../../types/kinetic';

export interface AdaptiveStepResult {
  messageContent: string;
  timeline?: KineticTimeline;
  dsl?: TeachingDslLesson;
  nextQuestion?: {
    prompt: string;
    concept: string;
    hints: string[];
  };
}

export class AdaptiveLessonEngine {
  /**
   * Generates next pedagogical lesson beat based on evaluation and policy decision.
   */
  static generateNextBeat(
    concept: string,
    evaluation: EvaluationResult,
    decision: PedagogicalDecision
  ): AdaptiveStepResult {
    // 1. CALCULUS / DERIVATIVES
    if (concept === 'math.derivative' || concept.includes('derivative')) {
      if (!evaluation.isCorrect) {
        // Remediation Beat: Distinguish Altitude from Slope
        const limitTrace = MathDomainEngine.traceDerivativeLimit(2.0, [2.0, 1.0, 0.5, 0.1, 0.001]);
        const tangentEq = MathDomainEngine.getTangentLineEquation(2.0);

        const dsl: TeachingDslLesson = {
          lesson_id: `remediation_${Date.now()}`,
          mode: 'demonstration',
          action: 'REMEDIATE',
          objective: 'Distinguish Altitude f(x) from Instantaneous Slope f\'(x)',
          timeline: [
            {
              t: 0,
              type: 'speak',
              text: "Let's clear up an important distinction: the height of a point on the curve is not its steepness.",
            },
            {
              t: 4,
              type: 'artifact.create',
              artifact: 'math.derivative',
              props: {
                title: 'Altitude vs. Instantaneous Slope',
                focusPoint: 2.0,
              },
            },
            {
              t: 9,
              type: 'speak',
              text: `At x = 2, the altitude f(2) is exactly 0.0, but the tangent line has steepness ${tangentEq.slope}!`,
            },
            {
              t: 14,
              type: 'ask',
              question: "If a curve bottoms out at a trough (minimum) where the curve is momentarily flat, what is its derivative at that lowest point?",
              expectedConcept: "zero slope",
              hints: [
                "A horizontal tangent line has no rise: rise / run = 0.",
                "Imagine a ball at the very bottom of a bowl for a split second before rolling up.",
              ],
            },
          ],
          meta: {
            concept: 'math.derivative',
            studentLevel: 'undergraduate',
            estimatedDifficulty: 'introductory',
          },
        };

        const timeline = TeachingDslCompiler.compileToTimeline(dsl);

        return {
          messageContent: `💡 **Targeted Pedagogical Remediation: Altitude vs. Steepness**\n\n` +
            `Notice how easy it is to confuse **where you are** with **how fast you are changing**:\n\n` +
            `- **Function Value $f(x)$:** Tells you the **altitude** (height on the y-axis).\n` +
            `- **Derivative $f'(x)$:** Tells you the **instantaneous slope** (the speedometer reading at that exact millisecond).\n\n` +
            `At $x = 2$, $f(2) = 0.5(2)^2 - 2 = 0.0$ (the curve touches the x-axis). But the tangent line is tilted sharply upwards with a slope of **$m = 2.0$**!`,
          timeline,
          dsl,
          nextQuestion: {
            prompt: "If a curve bottoms out at a trough (minimum) where the curve is momentarily flat, what is its derivative at that lowest point?",
            concept: 'math.derivative',
            hints: [
              "A horizontal line has zero vertical rise over horizontal run.",
              "Think about the speedometer reading at the exact instant an elevator changes direction from down to up.",
            ],
          },
        };
      } else {
        // Advancement Beat: Computing the Tangent Limit
        const limitTrace = MathDomainEngine.traceDerivativeLimit(2.0, [2.0, 1.0, 0.5, 0.1, 0.01, 0.001]);

        const dsl: TeachingDslLesson = {
          lesson_id: `advance_${Date.now()}`,
          mode: 'guided_practice',
          action: 'ADVANCE',
          objective: 'Secant Convergence to Tangent Limit as Δx → 0',
          timeline: [
            {
              t: 0,
              type: 'speak',
              text: "Superb intuition! Now let's see how the secant line morphs into the exact tangent limit.",
            },
            {
              t: 4,
              type: 'artifact.create',
              artifact: 'math.derivative',
              props: {
                title: 'Secant to Tangent Limit',
                deltas: [2.0, 1.0, 0.5, 0.1, 0.001],
              },
            },
            {
              t: 8,
              type: 'speak',
              text: "As Δx drops from 2.0 to 0.001, the average slope converges smoothly to exactly 2.0.",
            },
            {
              t: 13,
              type: 'ask',
              question: "Why can't we simply plug in Δx = 0 directly into the slope formula Δy / Δx without using a limit?",
              expectedConcept: "division by zero indeterminate form 0/0",
              hints: [
                "What is 0 divided by 0?",
                "Plugging in Δx = 0 gives f(x) - f(x) over 0, which is undefined.",
              ],
            },
          ],
          meta: {
            concept: 'math.derivative',
            studentLevel: 'undergraduate',
            estimatedDifficulty: 'intermediate',
          },
        };

        const timeline = TeachingDslCompiler.compileToTimeline(dsl);

        return {
          messageContent: `🎯 **Excellent Understanding! Advancing to Phase 2: The Limit Process**\n\n` +
            `Your mastery of **${concept}** has updated via Bayesian Knowledge Tracing to **${(evaluation.masteryAfter * 100).toFixed(0)}%**.\n\n` +
            `Let's look at the mathematical engine's deterministic calculation as $\\Delta x \\to 0$:\n\n` +
            `| $\\Delta x$ | Secant Slope $\\frac{\\Delta y}{\\Delta x}$ | Geometry |\n` +
            `|---|---|---|\n` +
            limitTrace.steps.map(s => `| ${s.deltaX} | **${s.secantSlope}** | ${s.isTangentLimit ? '✅ Tangent limit' : 'Secant chord'} |`).join('\n') +
            `\n\nNotice how the secant slope converges directly to **${limitTrace.exactDerivative}**!`,
          timeline,
          dsl,
          nextQuestion: {
            prompt: "Why can't we simply plug in Δx = 0 directly into the average slope formula Δy / Δx without using a limit?",
            concept: 'math.derivative',
            hints: [
              "What happens when you divide any quantity by zero?",
              "At Δx = 0, the two points collide into one single point, yielding the indeterminate form 0/0.",
            ],
          },
        };
      }
    }

    // 2. COMPUTER SCIENCE / BINARY SEARCH
    if (concept === 'cs.binary_search' || concept.includes('binary')) {
      const trace = CsDomainEngine.traceBinarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);

      if (!evaluation.isCorrect) {
        return {
          messageContent: `⚠️ **Diagnostic Remediation: Why Binary Search Requires Sorted Data**\n\n` +
            `If an array is unsorted (e.g. $[15, 3, 42, 8, 1, 99]$ hunting for $42$):\n` +
            `- You check the midpoint $8$.\n` +
            `- Since $42 > 8$, binary search assumes all elements before $8$ are smaller and discards them.\n` +
            `- But $42$ could easily have been in the discarded left half!\n\n` +
            `**Invariant:** Binary search relies on the **monotonic order property** to safely discard $50\\%$ of the elements in $O(1)$ operations per step.`,
          nextQuestion: {
            prompt: "If an array has 1,024 sorted elements, how many comparisons at most does binary search take to locate any item or prove it's absent?",
            concept: 'cs.binary_search',
            hints: [
              "Recall 2^10 = 1024.",
              "Logarithmic time complexity O(log₂ n).",
            ],
          },
        };
      } else {
        return {
          messageContent: `🚀 **Mastery Confirmed! Advancing to Algorithmic Analysis**\n\n` +
            `BKT mastery updated to **${(evaluation.masteryAfter * 100).toFixed(0)}%**.\n\n` +
            `Here is the exact algorithmic trace computed by the CS engine:\n\n` +
            trace.steps.map(s => `- **Step ${s.step}:** low=${s.low}, high=${s.high}, mid=${s.mid} (val=${s.midValue}). ${s.explanation}`).join('\n') +
            `\n\nTarget located in only **${trace.stepsCount} iterations** across 10 elements!`,
          nextQuestion: {
            prompt: "What condition in the while loop guarantees that binary search terminates if the target element does not exist in the array?",
            concept: 'cs.binary_search',
            hints: [
              "Look at what happens to the low and high pointers when they cross.",
              "The search space is empty when low > high.",
            ],
          },
        };
      }
    }

    // Generic fallback
    return {
      messageContent: `✨ **Pedagogical Update:** Progressing lesson based on your response. Let's explore the next facet of this concept.`,
    };
  }
}
