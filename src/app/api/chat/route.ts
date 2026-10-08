import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { AiProvider } from '../../../types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message parameter is required.' },
        { status: 400 }
      );
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

    const apiKey = clientApiKey ||
      (clientProvider === 'nvidia'
        ? process.env.NVIDIA_API_KEY
        : clientProvider === 'gemini'
        ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
        : process.env.OPENAI_API_KEY);

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        text: `I'm a normal chatbot, but I don't have an API key configured. You said: "${message}"`,
        provider: 'mock-chat',
        model: 'echo',
      });
    }

    let modelInstance;
    let modelName = body.model;

    if (clientProvider === 'nvidia') {
      const nvidia = createOpenAI({
        apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
      modelName = modelName || 'meta/llama-3.1-8b-instruct';
      modelInstance = nvidia.chat(modelName);
    } else if (clientProvider === 'gemini') {
      const google = createGoogleGenerativeAI({ apiKey });
      modelName = modelName || 'gemini-1.5-flash';
      modelInstance = google(modelName);
    } else {
      const openai = createOpenAI({ apiKey });
      modelName = modelName || 'gpt-4o-mini';
      modelInstance = openai(modelName);
    }

    const { text, usage } = await generateText({
      model: modelInstance,
      system: 'You are a helpful educational AI assistant. Answer the user\'s queries clearly and concisely. Do NOT generate JSON or code blocks unless explicitly requested. Use markdown for formatting.',
      prompt: message,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      text,
      provider: clientProvider,
      model: modelName,
      tokensUsed: usage ? usage.totalTokens : undefined,
    });

  } catch (err: any) {
    console.error('API /api/chat error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
