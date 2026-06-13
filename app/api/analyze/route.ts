import { NextRequest, NextResponse } from 'next/server';
import { analyzeJournalEntry } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entry, profile } = body;

    if (!entry || !profile) {
      return NextResponse.json(
        { error: 'Missing entry or profile data in request body' },
        { status: 400 }
      );
    }

    const analysis = await analyzeJournalEntry(entry, profile);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze journal entry' },
      { status: 500 }
    );
  }
}
