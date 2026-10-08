import { NextRequest, NextResponse } from 'next/server';
import { explainConceptWithAI } from '../../../lib/ai/gateway';
import { AiProvider } from '../../../types/ai';
import { validateAndCompileTimeline } from '../../../lib/engine/validator';
import { TeachingDslCompiler } from '../../../lib/dsl/dslCompiler';

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

    // 1. Try FastAPI Teaching Engine (Nemotron Teacher Agent -> Teaching DSL -> Compiler)
    const FASTAPI_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';
    try {
      const fastApiRes = await fetch(`${FASTAPI_URL}/api/teach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: concept,
          student_id: 'student_local',
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (fastApiRes.ok) {
        const fastApiData = await fastApiRes.json();
        if (fastApiData.success && fastApiData.dsl) {
          const timeline = TeachingDslCompiler.compileToTimeline(fastApiData.dsl);
          
          // Extract Socratic Question from DSL
          const askStep = fastApiData.dsl.timeline?.find((s: any) => s.type === 'ask');
          const socraticQuestion = askStep ? {
            prompt: askStep.question,
            concept: fastApiData.dsl.meta?.concept || fastApiData.artifact_id || concept,
            hints: askStep.hints || [],
          } : undefined;

          return NextResponse.json({
            success: true,
            timeline,
            dsl: fastApiData.dsl,
            socraticQuestion,
            summary: fastApiData.dsl.objective || `AI interactive lesson for ${concept}`,
            provider: 'mentora-fastapi-nemotron',
            model: 'nvidia/nemotron-3-super-120b-a12b',
          });
        }
      }
    } catch (fastApiErr) {
      console.warn('FastAPI teach backend unavailable or timed out, continuing to gateway:', fastApiErr);
    }

    // Read per-request API key from headers (or body)
    const clientApiKey = req.headers.get('x-api-key') || body.apiKey;
    let clientProvider = (req.headers.get('x-provider') || body.provider) as AiProvider | undefined;

    if (!clientProvider) {
      if (clientApiKey?.startsWith('nvapi-') || process.env.NVIDIA_API_KEY) {
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

    // If offline / no API key configured, generate dynamic procedural lesson on-the-fly (no static fixtures)
    if (!hasKey) {
      const dslLesson = {
        lesson_id: `proc_${Date.now()}`,
        mode: 'visual' as const,
        objective: `Explore ${concept} from first principles`,
        action: 'VISUALIZE' as const,
        timeline: [
          {
            t: 0,
            type: 'speak' as const,
            text: `Let's understand ${concept} from first principles. Here is an interactive conceptual model:`,
          },
          {
            t: 2,
            type: 'camera' as const,
            panX: 0,
            panY: 0,
            zoom: 1.05,
            durationMs: 800,
          },
          {
            t: 6,
            type: 'ask' as const,
            question: `In your own words, what core intuition makes ${concept} important?`,
            expectedConcept: concept,
            hints: ['Think about what problem this solves or how it behaves under change.'],
          },
        ],
        meta: {
          concept,
          estimatedDifficulty: 'introductory' as const,
          studentLevel: 'undergraduate' as const,
        },
      };

      const timeline = TeachingDslCompiler.compileToTimeline(dslLesson as any);
      return NextResponse.json({
        success: true,
        timeline,
        summary: `Dynamic interactive lesson for "${concept}".`,
        socraticQuestion: {
          prompt: `In your own words, what core intuition makes ${concept} important?`,
          concept,
          hints: ['Think about what problem this solves or how it behaves under change.'],
        },
        provider: 'mentora-dynamic-synthesizer',
        model: 'teaching-dsl-v1',
      });
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
