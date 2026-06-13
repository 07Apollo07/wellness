import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, profile, recentEntries, image } = body;

    if (!message || !profile) {
      return NextResponse.json(
        { error: 'Missing message or profile data in request body' },
        { status: 400 }
      );
    }

    const responseText = await getChatResponse(message, history || [], profile, recentEntries || [], image);

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate chat response' },
      { status: 500 }
    );
  }
}
