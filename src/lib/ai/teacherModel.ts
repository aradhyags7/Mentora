/**
 * MENTORA TEACHER MODEL INTERFACE & MODEL GATEWAY (Phase 0, 3, 18)
 * 
 * Model-agnostic layer ensuring the application never hard-codes against a single model.
 * Calls TeacherModel.generate(...) which routes to NVIDIA Nemotron/Llama, Google Gemini, OpenAI, or Anthropic.
 */

import { explainConceptWithAI } from './gateway';
import { ExplainConceptRequest, ExplainConceptResponse, AiProvider } from '../../types/ai';
import { TeachingDslLesson } from '../../types/teachingDsl';

export interface TeacherModelGenerateOptions {
  concept: string;
  userContext?: string;
  provider?: AiProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export class TeacherModel {
  /**
   * Main model-agnostic generation entrypoint.
   * Can be backed by NVIDIA Nemotron, Llama 3.2, Gemini 3.5, or GPT-4o.
   */
  static async generate(options: TeacherModelGenerateOptions): Promise<ExplainConceptResponse> {
    const request: ExplainConceptRequest = {
      concept: options.concept,
      userContext: options.userContext,
      config: options.provider ? {
        provider: options.provider,
        apiKey: options.apiKey,
        model: options.model,
      } : undefined,
    };

    return await explainConceptWithAI(request);
  }

  /**
   * Translates an AI kinetic timeline into Mentora Teaching DSL format.
   */
  static timelineToTeachingDsl(response: ExplainConceptResponse): TeachingDslLesson {
    const timeline = response.timeline;
    return {
      lesson_id: timeline?.id || `lesson_${Date.now()}`,
      mode: 'visual',
      objective: `Master ${timeline?.concept || 'concept'} via dynamic kinetic visualization`,
      action: 'VISUALIZE',
      timeline: (timeline?.cues || []).map((cue, idx) => ({
        t: Math.round(cue.timestampMs / 1000),
        type: 'speak',
        text: cue.narration,
        words: cue.words,
      })),
      meta: {
        concept: timeline?.concept || response.summary,
        estimatedDifficulty: 'intermediate',
        studentLevel: 'undergraduate',
      },
    };
  }
}
