/**
 * MENTORA UNIVERSAL AI GATEWAY
 * 
 * Supports NVIDIA NIM (Llama 3.2), Google Gemini (Gemini 3.5 Flash), and OpenAI (GPT-4o).
 * Uses Vercel AI SDK with automatic fallback for models requiring direct JSON parsing.
 */

import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { ExplainConceptRequest, ExplainConceptResponse, AiProvider } from '../../types/ai';
import { KineticTimelineSchema, validateAndCompileTimeline } from '../engine/validator';
import { SYSTEM_PROMPT } from './prompts/systemPrompt';
import { FEW_SHOT_PROMPT } from './prompts/fewShotExamples';

export async function explainConceptWithAI(request: ExplainConceptRequest): Promise<ExplainConceptResponse> {
  const { concept, userContext, config } = request;

  // Determine provider: prioritize NVIDIA if NVIDIA_API_KEY is present or client supplied nvapi-
  let provider: AiProvider = config?.provider || (
    (config?.apiKey?.startsWith('nvapi-') || process.env.NVIDIA_API_KEY)
      ? 'nvidia'
      : (process.env.GEMINI_API_KEY ? 'gemini' : 'openai')
  );

  // If client passed an nvapi key, ensure provider is nvidia
  if (config?.apiKey?.startsWith('nvapi-')) {
    provider = 'nvidia';
  }

  // Determine API key from request config or server env
  const apiKey = config?.apiKey || (
    provider === 'nvidia'
      ? process.env.NVIDIA_API_KEY
      : provider === 'gemini' 
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
      error: `No API key found for ${provider}. Please configure your API key in .env.local.`,
    };
  }

  try {
    let modelInstance;
    let modelName = config?.model;

    if (provider === 'nvidia') {
      const nvidia = createOpenAI({
        apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
      // Default vision instruct model for NIM
      modelName = modelName || 'meta/llama-3.2-11b-vision-instruct';
      modelInstance = nvidia.chat(modelName);
    } else if (provider === 'gemini') {
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

    let objectData;
    let tokensUsage;

    if (provider === 'nvidia') {
      // NVIDIA NIM works fastest and most reliably with raw JSON text generation
      const { text, usage } = await generateText({
        model: modelInstance,
        system: `${SYSTEM_PROMPT}\n\n${FEW_SHOT_PROMPT}\n\nIMPORTANT: Respond ONLY with valid JSON conforming strictly to the KineticTimeline specification. Do NOT include markdown code blocks or explanatory text.`,
        prompt: promptMessage,
        temperature: 0.2,
      });
      tokensUsage = usage;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON timeline found in model response.');
      }
      objectData = JSON.parse(jsonMatch[0]);
    } else {
      try {
        const { object, usage } = await generateObject({
          model: modelInstance,
          schema: KineticTimelineSchema,
          system: `${SYSTEM_PROMPT}\n\n${FEW_SHOT_PROMPT}`,
          prompt: promptMessage,
          temperature: 0.2,
        });
        objectData = object;
        tokensUsage = usage;
      } catch (objErr) {
        console.warn('generateObject unsupported by provider endpoint, executing structured JSON generation fallback.');
        const { text, usage } = await generateText({
          model: modelInstance,
          system: `${SYSTEM_PROMPT}\n\n${FEW_SHOT_PROMPT}\n\nIMPORTANT: Respond ONLY with valid JSON conforming strictly to the KineticTimeline specification. Do NOT include markdown code blocks or explanatory text.`,
          prompt: promptMessage,
          temperature: 0.2,
        });
        tokensUsage = usage;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON timeline found in model response.');
        }
        objectData = JSON.parse(jsonMatch[0]);
      }
    }

    // Compile and validate with our deterministic engine compiler
    const compiledTimeline = validateAndCompileTimeline(objectData);

    return {
      success: true,
      timeline: compiledTimeline,
      summary: `Visual explanation for ${concept} created with ${compiledTimeline.cues.length} beats.`,
      provider,
      model: modelName,
      tokensUsed: tokensUsage ? (tokensUsage as any).totalTokens : undefined,
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
