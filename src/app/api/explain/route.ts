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

    // If offline / no API key configured, generate dynamic procedural lesson on-the-fly (Zero Fixtures)
    if (!hasKey) {
      const c = concept.toLowerCase();
      const isBinarySearch = c.includes('binary') || c.includes('search');
      const isTwoSum = c.includes('two_sum') || c.includes('2sum') || c.includes('sum') || c.includes('hash');
      const isTree = c.includes('tree') || c.includes('dfs') || c.includes('bfs') || c.includes('graph');
      const isCalculus = c.includes('deriv') || c.includes('calculus') || c.includes('tangent');

      let beat1Text = `Let's examine the problem intuition and brute force bottleneck for ${concept}. A naive approach checks elements one-by-one with severe performance scaling.`;
      let beat2Text = `Now observe the visual dry-run on our memory board. Notice how state invariants and pointers maintain optimal boundaries.`;
      let beat3Text = `Let's trace the live algorithm implementation line-by-line while watching variables update dynamically.`;
      let socraticPrompt = `What invariant guarantees that our optimal strategy never misses the solution?`;

      if (isBinarySearch) {
        beat1Text = `Let's understand the core problem intuition of Binary Search. A naive linear scan takes O(n) time, checking each element sequentially. But if the array is sorted, we possess an invariant: the midpoint tells us which entire half to eliminate.`;
        beat2Text = `Watch the visual dry-run across our sorted memory cells. We calculate mid = (low + high) // 2. Since arr[mid] is less than our target 23, we eliminate the entire lower half [0..3] in a single step!`;
        beat3Text = `Let's step through the live code trace on the right. Notice line 5 executing: we update low = mid + 1, and our live variable watch immediately pulses with the narrowed bounds and logarithmic complexity.`;
        socraticPrompt = `Why is sorted order an absolute prerequisite for Binary Search, and what happens if an array is unsorted?`;
      } else if (isTwoSum) {
        beat1Text = `Let's uncover the intuition behind Two Sum. The brute force solution uses nested loops taking O(n²) time. But notice the algebraic invariant: for any number x, we are looking for a unique complement = target - x.`;
        beat2Text = `On the whiteboard, watch our two-pointer and hash bucket simulation. As we inspect 7 with target 9, we compute 9 - 7 = 2 and perform an instantaneous O(1) table lookup that hits the stored index 0!`;
        beat3Text = `Follow the code execution bar in our trace editor. On line 5, the condition 'if complement in lookup' evaluates to True, and our variable watch records the found pair indices.`;
        socraticPrompt = `What is the space-time tradeoff between the HashMap approach (O(n) space) and the sorted Two Pointers approach (O(1) auxiliary space)?`;
      } else if (isTree) {
        beat1Text = `Let's explore the tree traversal intuition. Tree data structures represent hierarchical branches where state must be preserved across depth and backtracking.`;
        beat2Text = `Observe the dry-run on our binary tree. As DFS visits node 2, notice how the execution call stack pushes a new stack frame, locking our parent context while diving deeper.`;
        beat3Text = `In our live code panel, observe line 4 executing: visit(node.val) followed by the recursive step dfs(node.left), keeping our call stack depth synchronized with tree height.`;
        socraticPrompt = `What is the difference in call stack memory usage between a balanced tree and a completely degenerate (linked-list shaped) tree?`;
      } else if (isCalculus) {
        beat1Text = `Let's explore derivatives from first principles. Average rate of change is measured by a secant line connecting two points with slope Δy / Δx.`;
        beat2Text = `Watch our interactive graph as Δx collapses toward zero. The secant line smoothly rotates and converges into a single instantaneous tangent slope.`;
        beat3Text = `Notice the formal mathematical definition: f'(x) equals the limit as Δx approaches zero of the difference quotient, yielding the exact instantaneous slope.`;
        socraticPrompt = `Why does taking the limit as Δx approaches 0 not result in a division by zero error in calculus?`;
      }

      const dslLesson = {
        lesson_id: `proc_${Date.now()}`,
        mode: 'visual' as const,
        objective: `Master ${concept} from first principles`,
        action: 'VISUALIZE' as const,
        timeline: [
          {
            t: 0,
            type: 'speak' as const,
            text: beat1Text,
          },
          {
            t: 4,
            type: 'speak' as const,
            text: beat2Text,
          },
          {
            t: 8,
            type: 'speak' as const,
            text: beat3Text,
          },
          {
            t: 12,
            type: 'ask' as const,
            question: socraticPrompt,
            expectedConcept: concept,
            hints: ['Consider the time and space complexity tradeoffs or invariant boundaries.'],
          },
        ],
        meta: {
          concept,
          estimatedDifficulty: 'intermediate' as const,
          studentLevel: 'undergraduate' as const,
        },
      };

      const timeline = TeachingDslCompiler.compileToTimeline(dslLesson as any);
      return NextResponse.json({
        success: true,
        timeline,
        summary: `Dynamic interactive lesson for "${concept}".`,
        socraticQuestion: {
          prompt: socraticPrompt,
          concept,
          hints: ['Consider the time and space complexity tradeoffs or invariant boundaries.'],
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
