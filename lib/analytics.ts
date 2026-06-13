import { JournalEntry } from './storage';

export interface MoodSparklinePoint {
  date: string; // MM/DD
  mood: number;
  stress: number;
}

export interface HeatmapPoint {
  dayName: string;
  dayIndex: number; // 0 = Sunday, 6 = Saturday
  avgStress: number;
  count: number;
}

export interface WordCloudItem {
  text: string;
  value: number; // weight/frequency
}

export interface AnalyticsSummary {
  moodTrend: MoodSparklinePoint[];
  stressHeatmap: HeatmapPoint[];
  burnoutRisk: 'Low' | 'Moderate' | 'High';
  burnoutScore: number;
  triggerWordCloud: WordCloudItem[];
  avgMood: number;
  avgStress: number;
  avgSleep: number;
  avgFocus: number;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Common academic/competitive exam stop words to filter out of word clouds
const EXCLUDE_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
  'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', 'should', 'now', 'really', 'feel', 'feeling', 'today', 'went', 'like', 'just', 'get', 'got',
  'about', 'went', 'was', 'very', 'but', 'very', 'stressed', 'stressing', 'stress'
]);

export function calculateAnalytics(entries: JournalEntry[]): AnalyticsSummary {
  // Safe defaults if no entries
  if (entries.length === 0) {
    return {
      moodTrend: [],
      stressHeatmap: DAYS_OF_WEEK.map((day, idx) => ({ dayName: day, dayIndex: idx, avgStress: 0, count: 0 })),
      burnoutRisk: 'Low',
      burnoutScore: 0,
      triggerWordCloud: [],
      avgMood: 0,
      avgStress: 0,
      avgSleep: 0,
      avgFocus: 0,
    };
  }

  // Calculate averages
  let totalMood = 0;
  let totalStress = 0;
  let totalSleep = 0;
  let totalFocus = 0;
  let entriesWithAnalysisCount = 0;
  let totalBurnoutScore = 0;

  entries.forEach(e => {
    totalMood += e.mood;
    totalStress += e.stressLevel;
    totalSleep += e.sleepQuality;
    totalFocus += e.focusQuality;

    if (e.analysis) {
      entriesWithAnalysisCount++;
      totalBurnoutScore += e.analysis.burnoutRiskScore;
    }
  });

  const count = entries.length;
  const avgMood = Math.round((totalMood / count) * 10) / 10;
  const avgStress = Math.round((totalStress / count) * 10) / 10;
  const avgSleep = Math.round((totalSleep / count) * 10) / 10;
  const avgFocus = Math.round((totalFocus / count) * 10) / 10;

  // 1. Mood Trend: Chronological order (max last 7 entries for cleaner display, or 30 days)
  // entries are stored newest first, so reverse a slice of the end or start
  const trendEntries = [...entries].slice(0, 7).reverse();
  const moodTrend = trendEntries.map(e => {
    const d = new Date(e.timestamp);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      mood: e.mood,
      stress: e.stressLevel,
    };
  });

  // 2. Stress Heatmap by day of week
  const heatmapMap: Record<number, { totalStress: number; count: number }> = {};
  DAYS_OF_WEEK.forEach((_, idx) => {
    heatmapMap[idx] = { totalStress: 0, count: 0 };
  });

  entries.forEach(e => {
    const d = new Date(e.timestamp);
    const day = d.getDay(); // 0-6
    heatmapMap[day].totalStress += e.stressLevel;
    heatmapMap[day].count += 1;
  });

  const stressHeatmap = DAYS_OF_WEEK.map((day, idx) => {
    const cell = heatmapMap[idx];
    return {
      dayName: day,
      dayIndex: idx,
      avgStress: cell.count > 0 ? Math.round((cell.totalStress / cell.count) * 10) / 10 : 0,
      count: cell.count,
    };
  });

  // 3. Burnout Risk calculations
  // Weighted: combines average stress level (1-10 mapped to 0-100), sleep (inverse), focus (inverse), and actual Gemini analysis
  const geminiScorePart = entriesWithAnalysisCount > 0 ? (totalBurnoutScore / entriesWithAnalysisCount) : (avgStress * 10);
  const sleepPart = (10 - avgSleep) * 10; // low sleep increases burnout
  const focusPart = (10 - avgFocus) * 10; // low focus increases burnout
  const stressPart = avgStress * 10;

  // Simple weighted score out of 100
  const burnoutScore = Math.min(
    100,
    Math.round(geminiScorePart * 0.4 + stressPart * 0.3 + sleepPart * 0.15 + focusPart * 0.15)
  );

  let burnoutRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (burnoutScore > 70) burnoutRisk = 'High';
  else if (burnoutScore > 40) burnoutRisk = 'Moderate';

  // 4. Trigger words wordcloud from analysis and text
  const wordFreq: Record<string, number> = {};

  // Add words from journal text
  entries.forEach(e => {
    // Extract individual words
    const cleanText = e.journalText.toLowerCase().replace(/[^a-zA-Z\s]/g, '');
    const words = cleanText.split(/\s+/);
    words.forEach(w => {
      if (w.length > 3 && !EXCLUDE_WORDS.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });

    // Boost word cloud weight of explicitly identified AI triggers
    if (e.analysis?.hiddenTriggers) {
      e.analysis.hiddenTriggers.forEach(trigger => {
        const cleanTrigger = trigger.toLowerCase().trim();
        if (cleanTrigger.length > 2) {
          // Give higher weight to identified AI triggers
          wordFreq[cleanTrigger] = (wordFreq[cleanTrigger] || 0) + 3;
        }
      });
    }
  });

  // Convert to list sorted by frequency
  const triggerWordCloud = Object.entries(wordFreq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15); // Top 15 triggers

  return {
    moodTrend,
    stressHeatmap,
    burnoutRisk,
    burnoutScore,
    triggerWordCloud,
    avgMood,
    avgStress,
    avgSleep,
    avgFocus,
  };
}
