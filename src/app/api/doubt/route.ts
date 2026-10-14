import { NextRequest, NextResponse } from 'next/server';
import { 
  InterruptSnapshot, 
  DoubtResolutionResponse, 
  KineticTimeline,
  InvestigationNodePrimitive,
  CausalConnectorPrimitive,
  RoughCalloutPrimitive
} from '../../../types/kinetic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      timeline, 
      snapshot, 
      studentDoubt, 
      apiKey, 
      provider 
    }: {
      timeline: KineticTimeline;
      snapshot: InterruptSnapshot;
      studentDoubt: string;
      apiKey?: string;
      provider?: string;
    } = body;

    if (!studentDoubt || typeof studentDoubt !== 'string' || studentDoubt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student doubt is required.' },
        { status: 400 }
      );
    }

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: 'Interrupt snapshot is required.' },
        { status: 400 }
      );
    }

    const clientApiKey = req.headers.get('x-api-key') || apiKey;
    const hasKey = clientApiKey || 
      process.env.NVIDIA_API_KEY || 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
      process.env.OPENAI_API_KEY;

    // Procedural Fallback & Contextual Clarification (Online & Offline zero-failure)
    const doubtLower = studentDoubt.toLowerCase();
    const conceptLower = (snapshot.conceptTitle || '').toLowerCase();

    let teacherVoiceResponse = `Great question! You asked: "${studentDoubt}". Let's clarify this directly on the board. `;
    if (conceptLower.includes('binary') || conceptLower.includes('search')) {
      teacherVoiceResponse += `Notice that because our array is strictly sorted, every element to the left of our midpoint is strictly smaller. Therefore, when our target is larger than arr[mid], the entire left partition cannot contain the target. We safely eliminate it without checking!`;
    } else if (conceptLower.includes('sum') || conceptLower.includes('hash')) {
      teacherVoiceResponse += `Because we store each previous number in our hash map, when we arrive at the current number x, we can look up whether (target - x) already appeared in O(1) instantaneous time, avoiding an O(n²) nested loop!`;
    } else if (conceptLower.includes('tree') || conceptLower.includes('dfs')) {
      teacherVoiceResponse += `In depth-first search, each recursive call creates an isolated stack frame preserving its local variables. When a branch finishes or hits a leaf, the stack unwinds back to the parent frame!`;
    } else if (conceptLower.includes('deriv') || conceptLower.includes('calculus')) {
      teacherVoiceResponse += `As the secant interval Δx shrinks towards zero, we are not evaluating 0 / 0. Instead, we are finding the limiting slope that the secant lines approach, which gives us the instantaneous tangent!`;
    } else {
      teacherVoiceResponse += `At this point in our deduction, our state invariant guarantees that we make progress without re-checking eliminated cases.`;
    }

    const clarificationNodeId = `node_clarify_${Date.now()}`;
    const targetX = snapshot.cameraStateAtInterrupt?.panX ? -snapshot.cameraStateAtInterrupt.panX + 60 : 40;
    const targetY = snapshot.cameraStateAtInterrupt?.panY ? -snapshot.cameraStateAtInterrupt.panY + 120 : 120;

    const clarificationNode: InvestigationNodePrimitive = {
      id: clarificationNodeId,
      type: 'investigation_node',
      title: 'Doubt Clarification',
      categoryBadge: 'STUDENT DOUBT RESOLUTION',
      subtitle: studentDoubt.length > 50 ? `${studentDoubt.slice(0, 47)}...` : studentDoubt,
      metricLabel: 'Frozen At',
      metricValue: `t = ${snapshot.interruptedAtTime.toFixed(1)}s`,
      accentColor: '#F59E0B',
      position: { x: targetX, y: targetY },
      width: 300,
    };

    const connector: CausalConnectorPrimitive = {
      id: `conn_clarify_${Date.now()}`,
      type: 'causal_connector',
      fromEntityId: snapshot.visiblePrimitiveIds[0] || undefined,
      toEntityId: clarificationNodeId,
      fromPoint: { x: targetX - 120, y: targetY - 80 },
      toPoint: { x: targetX, y: targetY },
      label: 'Clarifies: ' + studentDoubt.slice(0, 20),
      color: '#F59E0B',
      curveOffset: 25,
    };

    const callout: RoughCalloutPrimitive = {
      id: `callout_clarify_${Date.now()}`,
      type: 'callout',
      shape: 'box',
      color: '#F59E0B',
      label: 'Focus Point',
      fromPoint: { x: targetX - 20, y: targetY - 20 },
      toPoint: { x: targetX + 160, y: targetY + 60 },
    };

    const resolution: DoubtResolutionResponse = {
      strategy: 'CLARIFY_AND_RESUME',
      teacherVoiceResponse,
      clarificationTitle: 'Resolution: ' + studentDoubt.slice(0, 30),
      newPrimitives: [clarificationNode, connector],
      newActions: [
        {
          type: 'callout:show',
          callout,
          durationMs: 4000,
        },
      ],
      cameraTarget: {
        panX: -targetX,
        panY: -targetY,
        zoom: 1.25,
        focusEntityIds: [clarificationNodeId],
      },
    };

    return NextResponse.json({
      success: true,
      resolution,
    });
  } catch (err: any) {
    console.error('API /api/doubt error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to resolve doubt.' },
      { status: 500 }
    );
  }
}
