/**
 * Offline Test Harness
 * Validates the core schemas, analysis logic, and mock response generators
 * to ensure project code quality and testability parameter compliance.
 */

const { simulateJournalAnalysis } = require('../lib/gemini');
const { calculateAnalytics } = require('../lib/analytics');

async function runTests() {
  console.log("=== STARTING WELLNESS ASPIRANT TEST HARNESS ===");
  let failures = 0;

  // Test 1: Analytics Processing Verification
  console.log("\n[TEST 1] Verifying calculateAnalytics logic...");
  const mockEntries = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      journalText: "Tired and struggling with organic chemistry mock test. Sleep backlog is huge.",
      mood: 4,
      stressLevel: 8,
      sleepQuality: 3,
      focusQuality: 4,
      analysis: {
        emotionalTone: "Overwhelmed",
        hiddenTriggers: ["Organic Chemistry", "Sleep backlog"],
        burnoutRiskScore: 75,
        insightsSummary: "Test insights",
        copingStrategies: ["Rest"],
        mindfulnessExercise: { title: "Breathing", description: "Breathe", type: "breathing" }
      }
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      journalText: "Solved physics numerical sheets, focus is average.",
      mood: 6,
      stressLevel: 5,
      sleepQuality: 6,
      focusQuality: 6,
    }
  ];

  try {
    const results = calculateAnalytics(mockEntries);
    
    // Assert averages
    const expectedAvgMood = (4 + 6) / 2;
    if (results.avgMood !== expectedAvgMood) {
      throw new Error(`Expected average mood ${expectedAvgMood}, got ${results.avgMood}`);
    }
    console.log(`✓ Average Mood verified successfully: ${results.avgMood}`);

    // Assert wordcloud tags
    const triggerWords = results.triggerWordCloud.map(w => w.text);
    if (!triggerWords.includes('organic') && !triggerWords.includes('chemistry')) {
      throw new Error(`Expected trigger words to include 'organic' or 'chemistry', got: ${triggerWords.join(', ')}`);
    }
    console.log("✓ Trigger word cloud extraction verified.");

    // Assert heatmap day averages
    if (results.stressHeatmap.length !== 7) {
      throw new Error(`Expected 7 days in stress heatmap, got ${results.stressHeatmap.length}`);
    }
    console.log("✓ Stress Heatmap length verified.");

  } catch (e) {
    console.error("✗ TEST 1 FAILED:", e.message);
    failures++;
  }

  // Test 2: Gemini Simulation Integrity
  console.log("\n[TEST 2] Verifying simulateJournalAnalysis output structure...");
  try {
    const mockProfile = {
      name: "Abhinav",
      examType: "JEE",
      targetYear: "2027",
      currentStressLevel: 6
    };

    const simulatedResult = await simulateJournalAnalysis(
      "Struggling with math calculus limit questions.",
      5,
      7,
      mockProfile
    );

    // Validate keys
    const expectedKeys = ["emotionalTone", "hiddenTriggers", "burnoutRiskScore", "insightsSummary", "copingStrategies", "mindfulnessExercise"];
    expectedKeys.forEach(k => {
      if (!(k in simulatedResult)) {
        throw new Error(`Missing key in simulated result object: ${k}`);
      }
    });
    console.log("✓ Key schema verified successfully.");

    // Validate triggers insertion
    if (!simulatedResult.hiddenTriggers.some(t => t.toLowerCase().includes('numerical') || t.toLowerCase().includes('calculus') || t.toLowerCase().includes('backlog'))) {
      console.warn("⚠ Note: Triggers didn't match math rules exactly, got: " + JSON.stringify(simulatedResult.hiddenTriggers));
    } else {
      console.log("✓ Math/Numerical solving triggers correctly parsed from prompt: " + JSON.stringify(simulatedResult.hiddenTriggers));
    }

  } catch (e) {
    console.error("✗ TEST 2 FAILED:", e.message);
    failures++;
  }

  console.log("\n=== TEST HARNESS RESULTS ===");
  if (failures === 0) {
    console.log("✓ ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error(`✗ ${failures} TESTS FAILED. CHECK IMPORTS AND LOGIC.`);
  }
}

// Execute tests if run directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
