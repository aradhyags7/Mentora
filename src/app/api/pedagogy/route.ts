import { NextRequest, NextResponse } from 'next/server';
import { GlobalStudentModel } from '../../../lib/pedagogy/studentModel';
import { diagnoseStudentResponse, MISCONCEPTION_CATALOG } from '../../../lib/pedagogy/misconceptions';
import { PedagogicalPolicyEngine } from '../../../lib/pedagogy/pedagogicalPolicy';
import { AdaptiveLessonEngine } from '../../../lib/pedagogy/adaptiveLessonEngine';
import { MathDomainEngine } from '../../../lib/domain/mathEngine';
import { CsDomainEngine } from '../../../lib/domain/csEngine';

export async function GET() {
  try {
    const studentState = GlobalStudentModel.getState();
    return NextResponse.json({
      success: true,
      studentState,
      misconceptionsCatalog: MISCONCEPTION_CATALOG,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch student state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Evaluate Student Response & Execute Pedagogical Adaptation
    if (action === 'evaluate') {
      const { concept, question, answer } = body;
      if (!concept || !answer) {
        return NextResponse.json(
          { success: false, error: 'Concept and answer are required for evaluation.' },
          { status: 400 }
        );
      }

      // Step 1: Diagnose response & update BKT
      const evaluation = diagnoseStudentResponse(concept, question || '', answer);

      // Step 2: Query updated student state
      const studentState = GlobalStudentModel.getState();

      // Step 3: Run Pedagogical Policy Engine
      const decision = PedagogicalPolicyEngine.selectNextAction({
        studentState,
        concept,
        consecutiveSuccesses: evaluation.isCorrect ? 1 : 0,
        consecutiveFailures: evaluation.isCorrect ? 0 : 1,
        currentMode: evaluation.recommendedMode,
        lastAction: evaluation.recommendedAction,
      });

      // Step 4: Generate adaptive lesson beat using domain engine + DSL
      const adaptiveBeat = AdaptiveLessonEngine.generateNextBeat(concept, evaluation, decision);

      return NextResponse.json({
        success: true,
        evaluation,
        decision,
        adaptiveBeat,
        studentState,
      });
    }

    // 2. Deterministic Domain Computation (Math/CS)
    if (action === 'domain_calc') {
      const { domain, target, params } = body;

      if (domain === 'math') {
        const x0 = Number(params?.x0 ?? 2.0);
        const deltas = params?.deltas || [2.0, 1.0, 0.5, 0.1, 0.01, 0.001];
        const trace = MathDomainEngine.traceDerivativeLimit(x0, deltas);
        const tangent = MathDomainEngine.getTangentLineEquation(x0);
        return NextResponse.json({
          success: true,
          domain: 'math',
          exactDerivative: trace.exactDerivative,
          tangentEquation: tangent.formulaLatex,
          steps: trace.steps,
        });
      }

      if (domain === 'cs') {
        const array = params?.array || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
        const searchTarget = Number(params?.target ?? 23);
        const trace = CsDomainEngine.traceBinarySearch(array, searchTarget);
        return NextResponse.json({
          success: true,
          domain: 'cs',
          trace,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Unsupported domain for computation.' },
        { status: 400 }
      );
    }

    // 3. Reset Student Model
    if (action === 'reset') {
      const concepts = body.concepts || {
        'math.algebra': 0.88,
        'math.functions': 0.79,
        'math.limits': 0.42,
        'math.derivative': 0.25,
        'cs.array': 0.90,
        'cs.binary_search': 0.40,
      };
      // Reset state properties
      const current = GlobalStudentModel.getState();
      current.concepts = concepts;
      current.misconceptions = [];
      current.recent_errors = [];
      current.totalInteractions = 0;
      current.lastUpdated = new Date().toISOString();

      return NextResponse.json({
        success: true,
        studentState: GlobalStudentModel.getState(),
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error in pedagogy endpoint' },
      { status: 500 }
    );
  }
}
