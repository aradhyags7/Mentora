import { NextRequest, NextResponse } from 'next/server';
import { TeachingArtifactSpec } from '@/types/artifacts';

interface ChatRequestBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { message, history = [], apiKey } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // ---------------------------------------------------------
    // 1. Dynamic Pedagogical Analysis & Artifact Extraction
    // ---------------------------------------------------------
    let replyText = "";
    let artifactSpec: TeachingArtifactSpec | undefined = undefined;

    // A. Calculus & Derivatives & Tangent Slopes
    if (
      lower.includes('derivative') || 
      lower.includes('tangent') || 
      lower.includes('secant') || 
      lower.includes('slope') || 
      lower.includes('calculus') || 
      lower.includes('limit') || 
      lower.includes('f(x)') ||
      lower.includes('dy/dx')
    ) {
      // Dynamic function detection
      let func = 'x^2';
      if (lower.includes('x^3') || lower.includes('cubic')) func = 'x^3';
      else if (lower.includes('sin')) func = 'sin(x)';
      else if (lower.includes('cos')) func = 'cos(x)';
      else if (lower.includes('sqrt') || lower.includes('root')) func = 'sqrt(x)';

      // Point detection
      let point = 1.0;
      const pointMatch = lower.match(/(?:at|point|x\s*=\s*)([0-3](?:\.\d+)?)/);
      if (pointMatch && pointMatch[1]) {
        point = parseFloat(pointMatch[1]);
      }

      replyText = `Let's understand why the derivative represents the instantaneous slope of ${func === 'x^2' ? 'f(x) = x²' : func}. Instead of memorizing power rules, look at what happens geometrically: we start with two points P and Q separated by Δx. As we slide Δx down toward zero, the secant line rotates until it matches the exact tangent line at x = ${point}.`;

      artifactSpec = {
        id: `art_deriv_${Date.now()}`,
        type: 'interactive_visualization',
        domain: 'mathematics',
        topic: 'derivative_limit',
        title: `Instantaneous Tangent Derivation: f(x) = ${func}`,
        component: 'derivative_graph',
        props: {
          initialFunction: func,
          initialPoint: point,
          initialDeltaX: 1.2
        }
      };
    }

    // B. Binary Search & Logarithmic Search Space Halving
    else if (
      lower.includes('binary search') || 
      lower.includes('log n') || 
      lower.includes('o(log') || 
      lower.includes('divide and conquer') || 
      (lower.includes('search') && lower.includes('array'))
    ) {
      // Target number extraction
      let target = 72;
      const targetMatch = lower.match(/(?:target|find|search for|value)\s*[:=]?\s*(\d+)/);
      if (targetMatch && targetMatch[1]) {
        target = parseInt(targetMatch[1]);
      }

      // 16 sorted elements
      const array = [2, 5, 8, 12, 16, 23, 38, 45, 56, 63, 72, 81, 89, 94, 99, 105];
      // Ensure target is in array if default
      if (!array.includes(target)) {
        target = 72;
      }

      replyText = `Because the array is already sorted, inspecting the middle element lets us immediately determine which half our target lies in. Each comparison cuts the search space exactly in half ($N \\to N/2 \\to N/4 \\dots$). For 16 items, we reach an answer in at most $\\log_2(16) = 4$ comparisons. Watch the search space shrink below:`;

      artifactSpec = {
        id: `art_bs_${Date.now()}`,
        type: 'interactive_visualization',
        domain: 'computer_science',
        topic: 'binary_search',
        title: 'Binary Search: Interval Halving',
        component: 'binary_search',
        props: {
          initialArray: array,
          initialTarget: target
        }
      };
    }

    // C. CPU Instruction Cycle / Pipeline / Computer Architecture
    else if (
      lower.includes('cpu') || 
      lower.includes('instruction') || 
      lower.includes('alu') || 
      lower.includes('pipeline') || 
      lower.includes('von neumann') || 
      lower.includes('registers')
    ) {
      replyText = `A CPU executes computer programs through a continuous hardware clock cycle: Fetching the instruction from RAM, Decoding what operation to perform, Executing the math through the Arithmetic Logic Unit (ALU), and Writing the result back into Registers. Watch the data move through each block below:`;

      artifactSpec = {
        id: `art_cpu_${Date.now()}`,
        type: 'simulation',
        domain: 'engineering',
        topic: 'cpu_architecture',
        title: 'CPU Instruction Execution Pipeline',
        component: 'cpu_pipeline',
        props: {
          initialInstruction: 'ADD R1, R2'
        }
      };
    }

    // D. Physics Projectile Motion & Kinematics
    else if (
      lower.includes('projectile') || 
      lower.includes('trajectory') || 
      lower.includes('kinematics') || 
      lower.includes('launch angle') || 
      (lower.includes('gravity') && lower.includes('motion'))
    ) {
      let angle = 45;
      const angleMatch = lower.match(/(\d+)\s*(?:deg|degree|°)/);
      if (angleMatch && angleMatch[1]) {
        angle = Math.min(85, Math.max(15, parseInt(angleMatch[1])));
      }

      replyText = `In a vacuum, horizontal velocity ($v_x = v_0 \\cos\\theta$) stays constant throughout flight because no horizontal force exists. Meanwhile, gravity continuously pulls downward on vertical velocity ($v_y = v_0 \\sin\\theta - gt$). Flight range is maximized at $\\theta = 45^\\circ$ because that angle perfectly balances vertical airtime with horizontal velocity. Test different angles below:`;

      artifactSpec = {
        id: `art_proj_${Date.now()}`,
        type: 'simulation',
        domain: 'physics',
        topic: 'projectile_kinematics',
        title: '2D Kinematics Trajectory Simulation',
        component: 'projectile_kinematics',
        props: {
          initialAngle: angle,
          initialVelocity: 24
        }
      };
    }

    // E. General Pedagogical Dialogue (No Artifact required)
    else {
      replyText = `That's an intriguing topic. In Mentora, my goal is to build deep conceptual clarity rather than giving quick trivia answers. Could you tell me what specific intuition or problem in ${message.replace(/[?.!]/g, '')} you would like to explore first?`;
    }

    return NextResponse.json({
      text: replyText,
      artifact: artifactSpec
    });

  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
