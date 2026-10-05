/**
 * MENTORA AI GATEWAY TYPES
 * 
 * Clean, decoupled interface for LLM synthesis.
 * Supports OpenAI and Google Gemini with per-request API keys.
 * Can be migrated to FastAPI without changing client contracts.
 */

import { KineticTimeline } from './kinetic';

export type AiProvider = 'gemini' | 'openai';

export interface AiGatewayConfig {
  provider: AiProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface ExplainConceptRequest {
  concept: string;
  userContext?: string;
  targetDurationSec?: number;
  config?: AiGatewayConfig;
}

export interface ExplainConceptResponse {
  success: boolean;
  timeline: KineticTimeline;
  summary: string;
  provider: AiProvider;
  model: string;
  tokensUsed?: number;
  error?: string;
}
