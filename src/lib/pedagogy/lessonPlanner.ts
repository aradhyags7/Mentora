/**
 * MENTORA DYNAMIC LESSON PLANNER & STATE MACHINE (Phase 8, 9)
 * 
 * Orchestrates pedagogical state transitions between the 8 teaching modes:
 * Goal -> Prerequisite Check -> Introduction -> Visualization -> Question -> Evaluate -> [Remediate | Advance] -> Practice -> Mastery
 */

import { TeachingMode, TeachingActionType, TeachingDslLesson } from '../../types/teachingDsl';
import { GlobalStudentModel } from './studentModel';
import { ArtifactRegistry, RegisteredArtifact } from '../artifacts/registry';

export type LessonPhase =
  | 'PREREQUISITE_CHECK'
  | 'INTRODUCTION'
  | 'VISUALIZATION'
  | 'QUESTION'
  | 'EVALUATION'
  | 'REMEDIATION'
  | 'PRACTICE'
  | 'MASTERY';

export interface LessonPlanState {
  lessonId: string;
  concept: string;
  objective: string;
  currentPhase: LessonPhase;
  currentMode: TeachingMode;
  currentAction: TeachingActionType;
  artifactKey: string;
  activeQuestion?: {
    prompt: string;
    expectedConcept: string;
    hints: string[];
  };
  stepIndex: number;
}

export class LessonPlanner {
  /**
   * Plans an initial interactive teaching session based on user request and student state
   */
  static planInitialLesson(topicRequest: string): {
    planState: LessonPlanState;
    dsl: TeachingDslLesson;
    artifact?: RegisteredArtifact;
  } {
    const cleanTopic = topicRequest.trim() || 'Interactive Concept';
    const concept = cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 32) || 'concept';
    const artifactKey = concept;
    const objective = `Understand ${cleanTopic} from first principles`;

    const currentMastery = GlobalStudentModel.getMastery(concept);
    const preferredMode: TeachingMode = currentMastery < 0.4 ? 'visual' : 'socratic';
    const artifact = ArtifactRegistry.get(artifactKey);

    const planState: LessonPlanState = {
      lessonId: `lesson_${Date.now()}`,
      concept,
      objective,
      currentPhase: 'VISUALIZATION',
      currentMode: preferredMode,
      currentAction: 'VISUALIZE',
      artifactKey,
      activeQuestion: {
        prompt: `In your own words, what is the core mechanism or intuition governing ${cleanTopic}?`,
        expectedConcept: cleanTopic,
        hints: [
          `Think about what invariant or fundamental property holds true in ${cleanTopic}.`,
          `Consider what happens when the primary inputs change.`,
        ],
      },
      stepIndex: 0,
    };

    // Synthesize Phase 1 Teaching DSL
    const dsl: TeachingDslLesson = {
      lesson_id: planState.lessonId,
      mode: planState.currentMode,
      objective: planState.objective,
      action: planState.currentAction,
      timeline: [
        {
          t: 0,
          type: 'speak',
          text: `Welcome to Mentora. Let's explore ${artifact?.title || 'this concept'} through first principles.`,
        },
        {
          t: 2,
          type: 'artifact.create',
          artifact: artifactKey,
          props: {
            title: artifact?.title || 'Visual Model',
          },
        },
        {
          t: 6,
          type: 'camera',
          panX: 0,
          panY: -10,
          zoom: 1.1,
          durationMs: 800,
        },
        {
          t: 12,
          type: 'ask',
          question: planState.activeQuestion!.prompt,
          expectedConcept: planState.activeQuestion!.expectedConcept,
          hints: planState.activeQuestion!.hints,
        },
      ],
      meta: {
        concept,
        estimatedDifficulty: 'introductory',
        studentLevel: 'undergraduate',
      },
    };

    return { planState, dsl, artifact };
  }

  /**
   * Transitions lesson state machine following student response evaluation
   */
  static transitionAfterEvaluation(
    currentState: LessonPlanState,
    isCorrect: boolean
  ): {
    nextPhase: LessonPhase;
    nextAction: TeachingActionType;
    nextMode: TeachingMode;
    pedagogicalGuidance: string;
  } {
    if (!isCorrect) {
      return {
        nextPhase: 'REMEDIATION',
        nextAction: 'REMEDIATE',
        nextMode: 'demonstration',
        pedagogicalGuidance: 'Isolate the identified cognitive misconception and demonstrate concrete visual counterexamples.',
      };
    }

    const newMastery = GlobalStudentModel.getMastery(currentState.concept);
    if (newMastery >= 0.8) {
      return {
        nextPhase: 'MASTERY',
        nextAction: 'CHALLENGE',
        nextMode: 'assessment',
        pedagogicalGuidance: 'Student has demonstrated robust conceptual mastery. Advance to advanced boundary conditions and edge cases.',
      };
    }

    return {
      nextPhase: 'PRACTICE',
      nextAction: 'PRACTICE',
      nextMode: 'guided_practice',
      pedagogicalGuidance: 'Reinforce intuition with another active example before assessing mastery.',
    };
  }
}
