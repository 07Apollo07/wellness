import { NextRequest, NextResponse } from 'next/server';
import { getMeditationSpeech } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, stressLevel, phase } = body;

    if (!profile || !phase) {
      return NextResponse.json(
        { error: 'Missing profile or phase data in request body' },
        { status: 400 }
      );
    }

    const result = await getMeditationSpeech(profile, stressLevel || 5, phase);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in meditate API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate meditation speech' },
      { status: 500 }
    );
  }
}
