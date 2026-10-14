import { NextRequest, NextResponse } from 'next/server';
import { explainConceptWithAI } from '../../../lib/ai/gateway';
import { AiProvider } from '../../../types/ai';
import { validateAndCompileTimeline } from '../../../lib/engine/validator';
import { TeachingDslCompiler } from '../../../lib/dsl/dslCompiler';
import { extractCleanConceptTitle } from '../../../lib/utils/conceptUtils';

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

    // Extract clean concept name and archetype
    const { cleanTitle, category, archetype, socraticQuestion } = extractCleanConceptTitle(concept);

    // If offline / no API key configured, generate dynamic procedural lesson on-the-fly (Zero Fixtures)
    if (!hasKey) {
      const dslLesson = {
        lesson_id: `proc_${Date.now()}`,
        mode: 'visual' as const,
        objective: cleanTitle,
        action: 'VISUALIZE' as const,
        timeline: [
          {
            t: 0,
            type: 'speak' as const,
            text: `Let's understand the core problem intuition and bottleneck for ${cleanTitle}. A naive approach incurs severe computational overhead, but the underlying invariant unlocks an optimal strategy.`,
          },
          {
            t: 4.5,
            type: 'speak' as const,
            text: `Watch the memory board dry-run. Notice how our state updates dynamically to preserve optimal invariant boundaries.`,
          },
          {
            t: 10,
            type: 'speak' as const,
            text: `Let's trace the live algorithm implementation line-by-line while watching variables update dynamically.`,
          },
          {
            t: 15,
            type: 'ask' as const,
            question: socraticQuestion,
            expectedConcept: cleanTitle,
            hints: ['Consider how state invariants and complexity tradeoffs govern the solution.'],
          },
        ],
        meta: {
          concept: cleanTitle,
          estimatedDifficulty: 'intermediate' as const,
          studentLevel: 'undergraduate' as const,
        },
      };

      const timeline = TeachingDslCompiler.compileToTimeline(dslLesson as any);
      return NextResponse.json({
        success: true,
        timeline,
        summary: `Dynamic interactive lesson for "${cleanTitle}".`,
        socraticQuestion: {
          prompt: socraticQuestion,
          concept: cleanTitle,
          hints: ['Consider how state invariants and complexity tradeoffs govern the solution.'],
        },
        provider: 'mentora-dynamic-synthesizer',
        model: 'teaching-dsl-v1',
      });
    }

    // Call the universal AI gateway
    const result = await explainConceptWithAI({
      concept: cleanTitle,
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

    // Ensure clean title & concept on returned timeline
    if (result.timeline) {
      result.timeline.title = cleanTitle;
      result.timeline.concept = category;
      if (!result.socraticQuestion) {
        result.socraticQuestion = {
          prompt: socraticQuestion,
          concept: cleanTitle,
          hints: ['Consider how boundaries or invariants maintain optimal correctness.'],
        };
      }
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
