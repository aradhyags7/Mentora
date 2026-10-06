/**
 * MENTORA UNIVERSAL AI GATEWAY
 * 
 * Uses Vercel AI SDK (generateObject) with strict Zod validation.
 * Isolated interface: can be lifted to FastAPI or microservices with zero client churn.
 * Accepts API keys per-request (never logs or permanently stores keys).
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { ExplainConceptRequest, ExplainConceptResponse, AiProvider } from '../../types/ai';
import { KineticTimelineSchema, validateAndCompileTimeline } from '../engine/validator';
import { SYSTEM_PROMPT } from './prompts/systemPrompt';
import { FEW_SHOT_PROMPT } from './prompts/fewShotExamples';

export async function explainConceptWithAI(request: ExplainConceptRequest): Promise<ExplainConceptResponse> {
  const { concept, userContext, config } = request;

  // Determine provider: default to 'gemini' if not specified
  const provider: AiProvider = config?.provider || 'gemini';

  // Determine API key from request config or server env
  const apiKey = config?.apiKey || (
    provider === 'gemini' 
      ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      : process.env.OPENAI_API_KEY
  );

  if (!apiKey) {
    return {
      success: false,
      timeline: null as unknown as any,
      summary: '',
      provider,
      model: 'none',
      error: `No API key found for ${provider}. Please enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key in settings or set it in .env.local.`,
    };
  }

  try {
    let modelInstance;
    let modelName = config?.model;

    if (provider === 'gemini') {
      const google = createGoogleGenerativeAI({ apiKey });
      modelName = modelName || 'gemini-3.5-flash';
      modelInstance = google(modelName);
    } else {
      const openai = createOpenAI({ apiKey });
      modelName = modelName || 'gpt-4o-mini';
      modelInstance = openai(modelName);
    }

    const promptMessage = `
Explain this educational concept using an animated kinetic scene:
Topic: "${concept}"
${userContext ? `User Context/Questions: "${userContext}"` : ''}

Generate a complete kinetic timeline with initial entities and sequentially ordered cues with spoken narration and animated actions.
`.trim();

    const { object, usage } = await generateObject({
      model: modelInstance,
      schema: KineticTimelineSchema,
      system: `${SYSTEM_PROMPT}\n\n${FEW_SHOT_PROMPT}`,
      prompt: promptMessage,
      temperature: 0.2,
    });

    // Compile and validate with our deterministic engine compiler
    const compiledTimeline = validateAndCompileTimeline(object);

    return {
      success: true,
      timeline: compiledTimeline,
      summary: `Visual explanation for ${concept} created with ${compiledTimeline.cues.length} beats.`,
      provider,
      model: modelName,
      tokensUsed: usage ? (usage as any).totalTokens : undefined,
    };
  } catch (err: any) {
    console.error('AI Gateway Error:', err);
    return {
      success: false,
      timeline: null as unknown as any,
      summary: '',
      provider,
      model: config?.model || 'unknown',
      error: err?.message || 'Failed to generate visual explanation from AI model.',
    };
  }
}
