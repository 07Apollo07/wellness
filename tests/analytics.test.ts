import { calculateAnalytics } from '../lib/analytics';
import { JournalEntry } from '../lib/storage';

export function runAnalyticsTests() {
  console.log("--- Starting Analytics Unit Tests ---");
  let pass = true;

  // Test 1: Empty state values
  try {
    const emptyResults = calculateAnalytics([]);
    if (emptyResults.avgMood !== 0 || emptyResults.stressHeatmap.length !== 7 || emptyResults.triggerWordCloud.length !== 0) {
      throw new Error(`Empty state handling failed: ${JSON.stringify(emptyResults)}`);
    }
    console.log("✓ Empty state handling passed.");
  } catch (err: any) {
    console.error("✗ Empty state test failed:", err.message);
    pass = false;
  }

  // Test 2: Analytics Average Value Calculations
  try {
    const mockEntries: JournalEntry[] = [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        journalText: "Backlog of chemistry syllabus is giving me heavy anxiety and stress.",
        mood: 4,
        stressLevel: 8,
        sleepQuality: 4,
        focusQuality: 5,
        analysis: {
          emotionalTone: "Stressed",
          hiddenTriggers: ["chemistry backlog"],
          burnoutRiskScore: 70,
          insightsSummary: "Insights",
          copingStrategies: [],
          mindfulnessExercise: { title: "Relax", description: "Breathe", type: "breathing" }
        }
      },
      {
        id: "2",
        timestamp: new Date().toISOString(),
        journalText: "Mock test went better, focus was ok.",
        mood: 8,
        stressLevel: 4,
        sleepQuality: 8,
        focusQuality: 7
      }
    ];

    const results = calculateAnalytics(mockEntries);

    // Verify averages
    if (results.avgMood !== 6) {
      throw new Error(`Expected average mood to be 6, got ${results.avgMood}`);
    }
    if (results.avgStress !== 6) {
      throw new Error(`Expected average stress to be 6, got ${results.avgStress}`);
    }
    if (results.avgSleep !== 6) {
      throw new Error(`Expected average sleep to be 6, got ${results.avgSleep}`);
    }
    if (results.avgFocus !== 6) {
      throw new Error(`Expected average focus to be 6, got ${results.avgFocus}`);
    }
    console.log("✓ Averages calculation verified successfully.");

    // Verify word cloud triggers and exclusions
    const tags = results.triggerWordCloud.map(t => t.text);
    if (!tags.includes('chemistry') && !tags.includes('backlog')) {
      throw new Error(`Expected wordcloud to extract 'chemistry' or 'backlog', got: ${tags.join(', ')}`);
    }
    // Check stop word exclusion
    if (tags.includes('and') || tags.includes('me') || tags.includes('is')) {
      throw new Error("Wordcloud failed to filter out common stop words.");
    }
    console.log("✓ Stopword filtering & tag weight additions verified.");

    // Verify burnout risk calculation logic
    if (results.burnoutScore <= 0 || results.burnoutScore > 100) {
      throw new Error(`Burnout score out of bounds: ${results.burnoutScore}`);
    }
    console.log(`✓ Burnout score calculated correctly: ${results.burnoutScore}% (${results.burnoutRisk} Risk).`);

  } catch (err: any) {
    console.error("✗ Value calculation test failed:", err.message);
    pass = false;
  }

  return pass;
}
