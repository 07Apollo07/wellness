// ============================================================
// Analytics Unit Tests
// Covers: empty state, averages, wordcloud, burnout,
//         heatmap grouping, sparkline, stress classification
// ============================================================

import { calculateAnalytics } from '../lib/analytics';
import { JournalEntry } from '../lib/storage';

// Helpers
function makeEntry(overrides: Partial<JournalEntry> & { id: string }): JournalEntry {
  return {
    timestamp: new Date().toISOString(),
    journalText: '',
    mood: 5,
    stressLevel: 5,
    sleepQuality: 5,
    focusQuality: 5,
    ...overrides,
  };
}

export function runAnalyticsTests() {
  console.log('--- Starting Analytics Unit Tests ---');
  let pass = true;

  // ── TEST 1: Empty state ──────────────────────────────────────────────────
  try {
    const r = calculateAnalytics([]);
    if (r.avgMood !== 0) throw new Error(`avgMood should be 0 on empty input, got ${r.avgMood}`);
    if (r.avgStress !== 0) throw new Error(`avgStress should be 0 on empty input, got ${r.avgStress}`);
    if (r.stressHeatmap.length !== 7) throw new Error(`Heatmap should always have 7 days, got ${r.stressHeatmap.length}`);
    if (r.triggerWordCloud.length !== 0) throw new Error('triggerWordCloud should be empty for empty input');
    if (r.burnoutScore !== 0) throw new Error(`burnoutScore should be 0 on empty input, got ${r.burnoutScore}`);
    console.log('✓ Empty state handling passed.');
  } catch (err: any) {
    console.error('✗ Empty state test failed:', err.message);
    pass = false;
  }

  // ── TEST 2: Average calculations ─────────────────────────────────────────
  try {
    const entries: JournalEntry[] = [
      makeEntry({ id: '1', mood: 4, stressLevel: 8, sleepQuality: 4, focusQuality: 5 }),
      makeEntry({ id: '2', mood: 8, stressLevel: 4, sleepQuality: 8, focusQuality: 7 }),
    ];
    const r = calculateAnalytics(entries);

    if (r.avgMood !== 6) throw new Error(`Expected avgMood 6, got ${r.avgMood}`);
    if (r.avgStress !== 6) throw new Error(`Expected avgStress 6, got ${r.avgStress}`);
    if (r.avgSleep !== 6) throw new Error(`Expected avgSleep 6, got ${r.avgSleep}`);
    if (r.avgFocus !== 6) throw new Error(`Expected avgFocus 6, got ${r.avgFocus}`);
    console.log('✓ Averages calculation verified successfully.');
  } catch (err: any) {
    console.error('✗ Averages test failed:', err.message);
    pass = false;
  }

  // ── TEST 3: Stopword filtering & trigger wordcloud ───────────────────────
  try {
    const entries: JournalEntry[] = [
      makeEntry({
        id: '1',
        journalText: 'Backlog of chemistry syllabus is giving me heavy anxiety and stress.',
        analysis: {
          emotionalTone: 'Stressed',
          hiddenTriggers: ['chemistry backlog'],
          burnoutRiskScore: 70,
          insightsSummary: 'Insights',
          copingStrategies: [],
          mindfulnessExercise: { title: 'Relax', description: 'Breathe', type: 'breathing' },
        },
      }),
    ];
    const r = calculateAnalytics(entries);
    const tags = r.triggerWordCloud.map(t => t.text);

    if (!tags.includes('chemistry') && !tags.includes('backlog')) {
      throw new Error(`Expected 'chemistry' or 'backlog' in wordcloud, got: ${tags.join(', ')}`);
    }
    if (tags.includes('and') || tags.includes('me') || tags.includes('is') || tags.includes('of')) {
      throw new Error(`Stop words leaked into wordcloud: ${tags.join(', ')}`);
    }
    console.log('✓ Stopword filtering & tag weight additions verified.');
  } catch (err: any) {
    console.error('✗ Wordcloud test failed:', err.message);
    pass = false;
  }

  // ── TEST 4: Burnout score bounds ──────────────────────────────────────────
  try {
    const highStressEntries: JournalEntry[] = [
      makeEntry({ id: '1', mood: 2, stressLevel: 9, sleepQuality: 3, focusQuality: 3 }),
      makeEntry({ id: '2', mood: 3, stressLevel: 10, sleepQuality: 2, focusQuality: 2 }),
    ];
    const r = calculateAnalytics(highStressEntries);
    if (r.burnoutScore < 0 || r.burnoutScore > 100) {
      throw new Error(`burnoutScore out of range: ${r.burnoutScore}`);
    }
    console.log(`✓ Burnout score calculated correctly: ${r.burnoutScore}% (${r.burnoutRisk} Risk).`);
  } catch (err: any) {
    console.error('✗ Burnout score test failed:', err.message);
    pass = false;
  }

  // ── TEST 5: burnoutRisk classification labels ─────────────────────────────
  try {
    const lowStressEntries: JournalEntry[] = [
      makeEntry({ id: '1', mood: 9, stressLevel: 1, sleepQuality: 9, focusQuality: 9 }),
    ];
    const highStressEntries: JournalEntry[] = [
      makeEntry({ id: '1', mood: 1, stressLevel: 10, sleepQuality: 1, focusQuality: 1 }),
    ];
    const rLow  = calculateAnalytics(lowStressEntries);
    const rHigh = calculateAnalytics(highStressEntries);

    const validRisks = ['Low', 'Moderate', 'High'];
    if (!validRisks.includes(rLow.burnoutRisk)) {
      throw new Error(`Invalid burnoutRisk label for low stress: "${rLow.burnoutRisk}"`);
    }
    if (!validRisks.includes(rHigh.burnoutRisk)) {
      throw new Error(`Invalid burnoutRisk label for high stress: "${rHigh.burnoutRisk}"`);
    }
    if (rLow.burnoutScore >= rHigh.burnoutScore) {
      throw new Error(`Low stress score (${rLow.burnoutScore}) should be < high stress score (${rHigh.burnoutScore})`);
    }
    console.log(`✓ Burnout risk labels valid. Low="${rLow.burnoutRisk}", High="${rHigh.burnoutRisk}"`);
  } catch (err: any) {
    console.error('✗ burnoutRisk label test failed:', err.message);
    pass = false;
  }

  // ── TEST 6: Stress heatmap always returns 7 days ─────────────────────────
  try {
    const entries: JournalEntry[] = [
      makeEntry({ id: '1', stressLevel: 7 }),
      makeEntry({ id: '2', stressLevel: 3 }),
    ];
    const r = calculateAnalytics(entries);
    if (r.stressHeatmap.length !== 7) {
      throw new Error(`Expected 7-day heatmap, got ${r.stressHeatmap.length} days`);
    }
    r.stressHeatmap.forEach((point, i) => {
      if (typeof point.dayName !== 'string' || point.dayName.trim() === '') {
        throw new Error(`Heatmap[${i}].dayName is invalid: "${point.dayName}"`);
      }
      if (point.avgStress < 0 || point.avgStress > 10) {
        throw new Error(`Heatmap[${i}].avgStress out of range: ${point.avgStress}`);
      }
    });
    console.log('✓ Stress heatmap 7-day structure verified.');
  } catch (err: any) {
    console.error('✗ Heatmap structure test failed:', err.message);
    pass = false;
  }

  // ── TEST 7: sparkline produces date-labelled points ──────────────────────
  try {
    const d1 = new Date();
    const d2 = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const entries: JournalEntry[] = [
      makeEntry({ id: '1', timestamp: d1.toISOString(), mood: 7, stressLevel: 4 }),
      makeEntry({ id: '2', timestamp: d2.toISOString(), mood: 3, stressLevel: 8 }),
    ];
    const r = calculateAnalytics(entries);

    if (!Array.isArray(r.moodTrend) || r.moodTrend.length === 0) {
      throw new Error(`moodTrend should be a non-empty array, got: ${JSON.stringify(r.moodTrend)}`);
    }
    r.moodTrend.forEach((pt, i) => {
      if (!pt.date) throw new Error(`moodTrend[${i}].date is missing`);
      if (typeof pt.mood !== 'number') throw new Error(`moodTrend[${i}].mood is not a number`);
      if (typeof pt.stress !== 'number') throw new Error(`moodTrend[${i}].stress is not a number`);
    });
    console.log(`✓ moodTrend produces ${r.moodTrend.length} date-labelled points.`);
  } catch (err: any) {
    console.error('✗ sparkline test failed:', err.message);
    pass = false;
  }

  // ── TEST 8: Wordcloud weights — repeated words rank higher ────────────────
  try {
    const entries: JournalEntry[] = [
      makeEntry({ id: '1', journalText: 'backlog backlog backlog chemistry' }),
      makeEntry({ id: '2', journalText: 'backlog chemistry mock test' }),
    ];
    const r = calculateAnalytics(entries);
    const backlogEntry = r.triggerWordCloud.find(t => t.text === 'backlog');
    const mockEntry    = r.triggerWordCloud.find(t => t.text === 'mock');

    if (!backlogEntry) throw new Error('"backlog" should appear in wordcloud');
    if (mockEntry && backlogEntry.value <= mockEntry.value) {
      throw new Error(`"backlog" (${backlogEntry.value}) should rank higher than "mock" (${mockEntry?.value})`);
    }
    console.log(`✓ Repeated words rank higher in wordcloud: "backlog" weight = ${backlogEntry.value}`);
  } catch (err: any) {
    console.error('✗ Wordcloud weight test failed:', err.message);
    pass = false;
  }

  return pass;
}
