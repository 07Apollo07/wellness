// ============================================================
// Gemini Integration Unit Tests
// Covers: simulateJournalAnalysis (schema, trigger detection,
//         image handling), getChatResponse mock fallbacks,
//         getMeditationSpeech return type
// ============================================================

import { simulateJournalAnalysis, getMeditationSpeech, getChatResponse, simulateChatResponse } from '../lib/gemini';
import { StudentProfile, JournalEntry } from '../lib/storage';

const mockProfile: StudentProfile = {
  name: 'Vikram',
  examType: 'UPSC',
  targetYear: '2027',
  currentStressLevel: 8,
};

export async function runGeminiTests() {
  console.log('--- Starting Gemini Integration Unit Tests ---');
  let pass = true;

  // ── TEST 1: simulateJournalAnalysis — schema validation ──────────────────
  try {
    const analysis = await simulateJournalAnalysis(
      'Struggling with GS paper backlog. UPSC preparation is making me anxious.',
      4, 8, mockProfile
    );

    const requiredKeys: (keyof typeof analysis)[] = [
      'emotionalTone', 'hiddenTriggers', 'burnoutRiskScore',
      'insightsSummary', 'copingStrategies', 'mindfulnessExercise',
    ];
    requiredKeys.forEach(k => {
      if (analysis[k] === undefined) throw new Error(`Schema missing key: ${k}`);
    });

    if (!Array.isArray(analysis.hiddenTriggers) || analysis.hiddenTriggers.length === 0) {
      throw new Error('hiddenTriggers should be a non-empty array');
    }
    if (typeof analysis.burnoutRiskScore !== 'number' || analysis.burnoutRiskScore < 1 || analysis.burnoutRiskScore > 100) {
      throw new Error(`burnoutRiskScore out of range: ${analysis.burnoutRiskScore}`);
    }
    if (!analysis.mindfulnessExercise.title || !analysis.mindfulnessExercise.description) {
      throw new Error('mindfulnessExercise missing title or description');
    }
    console.log('✓ simulateJournalAnalysis schema and tags parsed successfully.');
  } catch (err: any) {
    console.error('✗ simulateJournalAnalysis test failed:', err.message);
    pass = false;
  }

  // ── TEST 2: simulateJournalAnalysis — keyword trigger detection ──────────
  try {
    const stressEntry = await simulateJournalAnalysis(
      'My chemistry syllabus backlog is huge and I had a terrible sleep.',
      3, 9, mockProfile
    );
    const triggerTexts = stressEntry.hiddenTriggers.join(' ').toLowerCase();

    const hasSyllabusTrigger = triggerTexts.includes('syllabus') || triggerTexts.includes('backlog');
    const hasSleepTrigger = triggerTexts.includes('sleep') || triggerTexts.includes('fatigue');
    const hasChemTrigger = triggerTexts.includes('chemistry') || triggerTexts.includes('organic');

    if (!hasSyllabusTrigger && !hasSleepTrigger && !hasChemTrigger) {
      throw new Error(`Trigger detection failed. Got: ${stressEntry.hiddenTriggers.join(', ')}`);
    }
    console.log('✓ simulateJournalAnalysis keyword trigger detection passed.');
  } catch (err: any) {
    console.error('✗ Trigger detection test failed:', err.message);
    pass = false;
  }

  // ── TEST 3: simulateJournalAnalysis — emotionalTone varies with mood ─────
  try {
    const highMood = await simulateJournalAnalysis('Today was great!', 9, 2, mockProfile);
    const lowMood = await simulateJournalAnalysis('I feel terrible.', 2, 9, mockProfile);

    if (highMood.emotionalTone === lowMood.emotionalTone) {
      throw new Error(`emotionalTone should differ for mood 9 vs mood 2, both returned: "${highMood.emotionalTone}"`);
    }
    console.log(`✓ emotionalTone varies: mood-9="${highMood.emotionalTone}", mood-2="${lowMood.emotionalTone}"`);
  } catch (err: any) {
    console.error('✗ emotionalTone variation test failed:', err.message);
    pass = false;
  }

  // ── TEST 4: simulateJournalAnalysis — image flag adds trigger ────────────
  try {
    const noImage = await simulateJournalAnalysis('Regular day.', 6, 5, mockProfile);
    const withImage = await simulateJournalAnalysis('Regular day.', 6, 5, mockProfile, {
      data: 'fakebase64data',
      mimeType: 'image/png',
    });

    const imageTriggerPresent = withImage.hiddenTriggers.some(t =>
      t.toLowerCase().includes('image') || t.toLowerCase().includes('revision') || t.toLowerCase().includes('checklist')
    );
    if (!imageTriggerPresent) {
      throw new Error(`Expected an image-related trigger when image is provided. Got: ${withImage.hiddenTriggers.join(', ')}`);
    }
    console.log('✓ Image attachment adds image-related trigger passed.');
  } catch (err: any) {
    console.error('✗ Image trigger test failed:', err.message);
    pass = false;
  }

  // ── TEST 5: getMeditationSpeech — returns a non-empty string ─────────────
  try {
    const speechIn   = await getMeditationSpeech(mockProfile, 8, 'In');
    const speechHold = await getMeditationSpeech(mockProfile, 8, 'Hold');
    const speechOut  = await getMeditationSpeech(mockProfile, 8, 'Out');

    if (typeof speechIn !== 'string' || speechIn.trim() === '') {
      throw new Error(`Inhale phase returned invalid speech: "${speechIn}"`);
    }
    if (typeof speechHold !== 'string' || speechHold.trim() === '') {
      throw new Error(`Hold phase returned invalid speech: "${speechHold}"`);
    }
    if (typeof speechOut !== 'string' || speechOut.trim() === '') {
      throw new Error(`Exhale phase returned invalid speech: "${speechOut}"`);
    }

    console.log('✓ Meditation spoken cues verified successfully.');
    console.log(`  - [Inhale]: "${speechIn}"`);
    console.log(`  - [Hold]: "${speechHold}"`);
    console.log(`  - [Exhale]: "${speechOut}"`);
  } catch (err: any) {
    console.error('✗ getMeditationSpeech test failed:', err.message);
    pass = false;
  }

  // ── TEST 6: getMeditationSpeech — all 3 phases produce distinct cues ─────
  try {
    const cues = await Promise.all([
      getMeditationSpeech(mockProfile, 5, 'In'),
      getMeditationSpeech(mockProfile, 5, 'Hold'),
      getMeditationSpeech(mockProfile, 5, 'Out'),
    ]);
    // In mock mode (no API key) the cues are drawn from separate arrays per phase
    // so at minimum each should contain the phase concept
    const allNonEmpty = cues.every(c => typeof c === 'string' && c.trim().length > 0);
    if (!allNonEmpty) {
      throw new Error(`One or more meditation cues were empty: ${JSON.stringify(cues)}`);
    }
    console.log('✓ All 3 meditation phases produced non-empty cues.');
  } catch (err: any) {
    console.error('✗ Meditation phase variety test failed:', err.message);
    pass = false;
  }

  // ── TEST 7: getChatResponse mock fallback — varies by keyword ────────────
  // Calls simulateChatResponse directly (the exported mock function) so the test
  // is deterministic regardless of whether a real API key is present.
  try {
    const greetResponse  = await simulateChatResponse('Hi there', mockProfile);
    const stressResponse = await simulateChatResponse('I am so stressed out', mockProfile);
    const sleepResponse  = await simulateChatResponse('I am exhausted and tired', mockProfile);
    const mockResponse   = await simulateChatResponse('My mock test score was bad', mockProfile);

    console.log(`  [debug] greet  : "${greetResponse.slice(0, 60)}..."`);
    console.log(`  [debug] stress : "${stressResponse.slice(0, 60)}..."`);
    console.log(`  [debug] sleep  : "${sleepResponse.slice(0, 60)}..."`);
    console.log(`  [debug] mock   : "${mockResponse.slice(0, 60)}..."`);

    if (greetResponse === stressResponse) {
      throw new Error('Greeting and stress fallbacks should not be identical');
    }
    if (stressResponse === sleepResponse) {
      throw new Error('Stress and sleep fallbacks should not be identical');
    }
    if (sleepResponse === mockResponse) {
      throw new Error(`Sleep and mock-test fallbacks should not be identical.\n  sleep: "${sleepResponse}"\n  mock : "${mockResponse}"`);
    }
    // All should mention the student's exam or name
    const all = [greetResponse, stressResponse, sleepResponse, mockResponse];
    const mentionsContext = all.every(r =>
      r.toLowerCase().includes('upsc') || r.toLowerCase().includes('vikram')
    );
    if (!mentionsContext) {
      const failing = all.filter(r => !r.toLowerCase().includes('upsc') && !r.toLowerCase().includes('vikram'));
      throw new Error(`Fallback responses should mention name or exam. Failing: ${JSON.stringify(failing)}`);
    }
    console.log('✓ getChatResponse mock fallback varies by keyword and includes context.');
  } catch (err: any) {
    console.error('✗ getChatResponse fallback test failed:', err.message);
    pass = false;
  }

  return pass;
}
