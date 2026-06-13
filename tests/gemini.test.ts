import { simulateJournalAnalysis, getMeditationSpeech } from '../lib/gemini';
import { StudentProfile } from '../lib/storage';

export async function runGeminiTests() {
  console.log("--- Starting Gemini Integration Unit Tests ---");
  let pass = true;

  const mockProfile: StudentProfile = {
    name: "Vikram",
    examType: "UPSC",
    targetYear: "2027",
    currentStressLevel: 8
  };

  // Test 1: simulateJournalAnalysis output schema
  try {
    const analysis = await simulateJournalAnalysis(
      "Struggling with GS paper backlog. UPSC preparation is making me anxious.",
      4,
      8,
      mockProfile
    );

    const keys: (keyof typeof analysis)[] = [
      "emotionalTone",
      "hiddenTriggers",
      "burnoutRiskScore",
      "insightsSummary",
      "copingStrategies",
      "mindfulnessExercise"
    ];

    keys.forEach(k => {
      if (analysis[k] === undefined) {
        throw new Error(`Simulated analysis missing key: ${k}`);
      }
    });

    if (analysis.hiddenTriggers.length === 0) {
      throw new Error("Triggers list empty on simulated result");
    }

    console.log("✓ simulateJournalAnalysis schema and tags parsed successfully.");
  } catch (err: any) {
    console.error("✗ simulateJournalAnalysis test failed:", err.message);
    pass = false;
  }

  // Test 2: getMeditationSpeech speech cues
  try {
    const speechIn = await getMeditationSpeech(mockProfile, 8, 'In');
    const speechHold = await getMeditationSpeech(mockProfile, 8, 'Hold');
    const speechOut = await getMeditationSpeech(mockProfile, 8, 'Out');

    if (!speechIn.text || !speechHold.text || !speechOut.text) {
      throw new Error("Meditation spoken cues text is empty or corrupt");
    }

    console.log("✓ Meditation spoken cues verified successfully.");
    console.log(`  - [Inhale]: "${speechIn.text}"`);
    console.log(`  - [Hold]: "${speechHold.text}"`);
    console.log(`  - [Exhale]: "${speechOut.text}"`);
  } catch (err: any) {
    console.error("✗ getMeditationSpeech test failed:", err.message);
    pass = false;
  }

  return pass;
}
