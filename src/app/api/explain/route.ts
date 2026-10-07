import { NextRequest, NextResponse } from 'next/server';
import { explainConceptWithAI } from '../../../lib/ai/gateway';
import { AiProvider } from '../../../types/ai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateAndCompileTimeline } from '../../../lib/engine/validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, userContext } = body;

    if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Concept parameter is required.' },
        { status: 400 }
      );
    }

    // Read per-request API key from headers (or body)
    const clientApiKey = req.headers.get('x-api-key') || body.apiKey;
    let clientProvider = (req.headers.get('x-provider') || body.provider) as AiProvider | undefined;

    if (!clientProvider) {
      if ((clientApiKey?.startsWith('nvapi-') /* auto-detect nvidia */) || process.env.NVIDIA_API_KEY) {
        clientProvider = 'nvidia';
      } else if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        clientProvider = 'gemini';
      } else {
        clientProvider = 'openai';
      }
    }

    // Check if we have an API key or server environment key
    const hasKey = clientApiKey || 
      process.env.NVIDIA_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
      process.env.OPENAI_API_KEY;

    // If offline / no API key configured and concept is asking for binary search or demo, return golden fixture
    if (!hasKey) {
      const lower = concept.toLowerCase();
      if (lower.includes('binary') || lower.includes('search') || lower.includes('demo') || lower.includes('test')) {
        const fixturePath = resolve(process.cwd(), 'fixtures/binary-search.timeline.json');
        const rawJson = JSON.parse(readFileSync(fixturePath, 'utf-8'));
        const timeline = validateAndCompileTimeline(rawJson);
        return NextResponse.json({
          success: true,
          timeline,
          summary: 'Loaded golden reference timeline for Binary Search.',
          provider: 'offline-fixture',
          model: 'hand-authored-reference',
        });
      }
    }

    // Call the universal AI gateway
    const result = await explainConceptWithAI({
      concept,
      userContext,
      config: {
        provider: clientProvider,
        apiKey: clientApiKey,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API /api/explain error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
