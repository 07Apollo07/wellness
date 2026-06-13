// Storage helpers using localStorage
// Client-safe check since Next.js uses server rendering
// NOTE: Checked lazily inside each helper so test environments that
// set global.window after module load still work correctly.

export interface StudentProfile {
  name: string;
  examType: string; // NEET, JEE, UPSC, GATE, CAT, CUET, etc.
  targetYear: string;
  currentStressLevel: number; // 1-10
}

export interface JournalAnalysis {
  emotionalTone: string;
  hiddenTriggers: string[];
  burnoutRiskScore: number; // 1-100
  insightsSummary: string;
  copingStrategies: string[];
  mindfulnessExercise: {
    title: string;
    description: string;
    type: string; // e.g., 'breathing', 'grounding', 'sensory'
  };
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  journalText: string;
  mood: number; // 1-10
  stressLevel: number; // 1-10
  sleepQuality: number; // 1-10
  focusQuality: number; // 1-10
  analysis?: JournalAnalysis;
  image?: { data: string; mimeType: string };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: { data: string; mimeType: string };
}

const KEYS = {
  PROFILE: 'serenity_profile',
  ENTRIES: 'serenity_entries',
  CHAT: 'serenity_chat_history',
  BURNOUT_HISTORY: 'serenity_burnout_history',
};

// Safe wrapper around localStorage access
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage read access blocked for key "${key}":`, e);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage write access blocked for key "${key}":`, e);
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage delete access blocked for key "${key}":`, e);
  }
}

export function getProfile(): StudentProfile | null {
  const data = safeGetItem(KEYS.PROFILE);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse profile JSON:", e);
    return null;
  }
}

export function saveProfile(profile: StudentProfile): void {
  try {
    safeSetItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

export function clearProfile(): void {
  safeRemoveItem(KEYS.PROFILE);
  safeRemoveItem(KEYS.ENTRIES);
  safeRemoveItem(KEYS.CHAT);
}

/**
 * Simple encryption placeholder – base64 encode the JSON string.
 * In a real app you would use a proper crypto library and a user‑provided passphrase.
 */
/**
 * Encode a UTF‑8 string to Base64 safely (handles emojis and other non‑Latin1 chars).
 * Uses the browser's TextEncoder/TextDecoder which are widely supported.
 */
function encrypt(data: string): string {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    let binary = '';
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch (e) {
    console.error('Encryption failed:', e);
    return '';
  }
}

/**
 * Decode a Base64 string that was produced by the `encrypt` function above.
 * Returns an empty string on failure.
 */
function decrypt(data: string): string {
  try {
    const binary = atob(data);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (e) {
    console.warn('Failed to decode imported data:', e);
    return '';
  }
}

/** Export the current profile, journal entries and chat history as an encrypted JSON string.
 *  Returns the string so the caller can trigger a download.
 */
export function exportData(): string {
  const payload = {
    profile: getProfile(),
    entries: getEntries(),
    chat: getChatHistory(),
  };
  const json = JSON.stringify(payload);
  return encrypt(json);
}

/** Import encrypted JSON (produced by `exportData`).
 *  Overwrites the current local storage with the imported data.
 */
export function importData(encrypted: string): void {
  const decoded = decrypt(encrypted);
  if (!decoded) return;
  try {
    const data = JSON.parse(decoded);
    if (data.profile) safeSetItem(KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.entries) safeSetItem(KEYS.ENTRIES, JSON.stringify(data.entries));
    if (data.chat) safeSetItem(KEYS.CHAT, JSON.stringify(data.chat));
  } catch (e) {
    console.error('Failed to import data:', e);
  }
}

export function getEntries(): JournalEntry[] {
  const data = safeGetItem(KEYS.ENTRIES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse journal entries JSON:", e);
    return [];
  }
}

export function saveEntry(entry: JournalEntry): JournalEntry[] {
  const entries = getEntries();
  entries.unshift(entry); // Add to the top (newest first)
  try {
    safeSetItem(KEYS.ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save entries:", e);
  }
  // If the entry includes analysis with a burnout risk score, persist it for trend tracking.
  if (entry.analysis && typeof entry.analysis.burnoutRiskScore === 'number') {
    addBurnoutScore(entry.analysis.burnoutRiskScore);
  }
  return entries;
}

export function getChatHistory(): ChatMessage[] {
  const data = safeGetItem(KEYS.CHAT);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse chat history JSON:", e);
    return [];
  }
}

export function saveChatMessage(message: ChatMessage): ChatMessage[] {
  const history = getChatHistory();
  history.push(message);
  try {
    safeSetItem(KEYS.CHAT, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
  return history;
}

export function clearChatHistory(): void {
  safeRemoveItem(KEYS.CHAT);
}

/** Retrieve stored burnout score history (array of {date, score}). */
export function getBurnoutHistory(): { date: string; score: number }[] {
  const data = safeGetItem(KEYS.BURNOUT_HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse burnout history JSON:', e);
    return [];
  }
}

/** Append a new burnout score for today to the history. */
export function addBurnoutScore(score: number): void {
  const history = getBurnoutHistory();
  const today = new Date();
  const date = `${today.getMonth() + 1}/${today.getDate()}`;
  const newEntry = { date, score };
  const updated = [newEntry, ...history].slice(0, 30); // keep recent 30
  try {
    safeSetItem(KEYS.BURNOUT_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store burnout history:', e);
  }
}

// Calculate journaling streak
export function getJournalStreak(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  try {
    // Extract unique sorted dates (YYYY-MM-DD format)
    const dates = entries
      .map(entry => entry.timestamp.split('T')[0])
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Newest first

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If the user hasn't journaled today or yesterday, streak is broken (0)
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const currentEntryDate = new Date(dates[i]);
      const diffTime = Math.abs(expectedDate.getTime() - currentEntryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        expectedDate = currentEntryDate; // Shift expected date back
      } else {
        break;
      }
    }

    return streak;
  } catch (e) {
    console.error("Error calculating streak:", e);
    return 0;
  }
}
