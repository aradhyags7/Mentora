import { NextRequest, NextResponse } from 'next/server';
import { GlobalStudentModel } from '../../../lib/pedagogy/studentModel';
import { diagnoseStudentResponse } from '../../../lib/pedagogy/misconceptions';
import { PedagogicalPolicyEngine } from '../../../lib/pedagogy/pedagogicalPolicy';
import { AdaptiveLessonEngine } from '../../../lib/pedagogy/adaptiveLessonEngine';
import { TeachingDslCompiler } from '../../../lib/dsl/dslCompiler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, question, answer, student_id } = body;

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json(
        { success: false, error: 'Answer is required for evaluation.' },
        { status: 400 }
      );
    }

    const FASTAPI_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

    // 1. Try FastAPI Python Backend (Corbett-Anderson BKT + Nemotron Teacher Agent)
    try {
      const fastApiRes = await fetch(`${FASTAPI_URL}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: concept || 'math.derivative',
          question: question || '',
          answer,
          student_id: student_id || 'student_local',
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        if (data.success && data.evaluation) {
          const compiledTimeline = TeachingDslCompiler.compileToTimeline(data.next_dsl);
          const nextAskStep = data.next_dsl.timeline?.find((s: any) => s.type === 'ask');

          return NextResponse.json({
            success: true,
            provider: 'mentora-fastapi-nemotron',
            evaluation: {
              isCorrect: data.evaluation.is_correct,
              score: data.evaluation.score,
              reasoning: data.evaluation.reasoning,
              detectedMisconceptions: (data.evaluation.detected_misconceptions || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                explanation: m.explanation,
                remediationGuidance: m.remediation_guidance,
                concept: m.concept || concept || 'math.derivative',
                pattern: m.pattern || '',
                severity: m.severity || 'medium',
                remediationAction: m.remediation_action || 'remediate',
              })),
              concept: data.evaluation.concept,
              masteryBefore: data.evaluation.mastery_before,
              masteryAfter: data.evaluation.mastery_after,
              recommendedAction: data.evaluation.recommended_action?.toLowerCase() || 'remediate',
              recommendedMode: data.evaluation.recommended_mode || 'demonstration',
            },
            adaptiveBeat: {
              messageContent: data.next_dsl.objective || 'Adaptive Pedagogical Follow-up',
              timeline: compiledTimeline,
              nextQuestion: nextAskStep ? {
                prompt: nextAskStep.question,
                concept: data.next_dsl.meta?.concept || concept || 'math.derivative',
                hints: nextAskStep.hints || [],
              } : undefined,
            },
            studentState: data.student_state,
          });
        }
      }
    } catch (apiErr) {
      console.warn('FastAPI evaluate backend unavailable or timed out, executing local engine:', apiErr);
    }

    // 2. Deterministic local pedagogical engine fallback
    const targetConcept = concept || 'math.derivative';
    const evaluation = diagnoseStudentResponse(targetConcept, question || '', answer);
    const currentStudentState = GlobalStudentModel.getState();
    const decision = PedagogicalPolicyEngine.selectNextAction({
      studentState: currentStudentState,
      concept: targetConcept,
      consecutiveSuccesses: evaluation.isCorrect ? 1 : 0,
      consecutiveFailures: evaluation.isCorrect ? 0 : 1,
      currentMode: evaluation.recommendedMode,
      lastAction: evaluation.recommendedAction,
    });
    const adaptiveBeat = AdaptiveLessonEngine.generateNextBeat(targetConcept, evaluation, decision);

    return NextResponse.json({
      success: true,
      provider: 'mentora-local-engine',
      evaluation,
      decision,
      adaptiveBeat,
      studentState: GlobalStudentModel.getState(),
    });
  } catch (err: any) {
    console.error('API /api/evaluate error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal evaluation error' },
      { status: 500 }
    );
  }
}
