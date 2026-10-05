import { NextRequest, NextResponse } from 'next/server';
import { estimateWordTimings } from '../../../lib/engine/compiler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = '' } = body;

    const wordCount = text.trim().split(/\s+/).length;
    const durationMs = Math.max(2500, wordCount * 380);
    const words = estimateWordTimings(text, durationMs);

    return NextResponse.json({
      success: true,
      durationMs,
      words,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
