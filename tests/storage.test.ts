// Mock localStorage for Node.js environment
const store: Record<string, string> = {};

if (typeof global.window === 'undefined') {
  (global as any).window = {};
}

if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; }
  };
}

import { getProfile, saveProfile, clearProfile, getEntries, saveEntry, getJournalStreak, StudentProfile, JournalEntry } from '../lib/storage';

export function runStorageTests() {
  console.log("--- Starting Storage Unit Tests ---");
  let pass = true;

  // Clear mock store first
  localStorage.clear();

  // Test 1: Save and Get Profile
  try {
    const mockProfile: StudentProfile = {
      name: "Tanya",
      examType: "NEET",
      targetYear: "2027",
      currentStressLevel: 7
    };
    saveProfile(mockProfile);

    const loadedProfile = getProfile();
    if (!loadedProfile || loadedProfile.name !== "Tanya" || loadedProfile.examType !== "NEET") {
      throw new Error(`Profile load failed. Got: ${JSON.stringify(loadedProfile)}`);
    }
    console.log("✓ Profile Save & Get passed.");
  } catch (err: any) {
    console.error("✗ Profile test failed:", err.message);
    pass = false;
  }

  // Test 2: Save and Get Entries
  try {
    const mockEntry: JournalEntry = {
      id: "entry_1",
      timestamp: new Date().toISOString(),
      journalText: "Mock physics test backlog backlog backlog",
      mood: 6,
      stressLevel: 5,
      sleepQuality: 7,
      focusQuality: 8
    };

    saveEntry(mockEntry);
    const entries = getEntries();
    if (entries.length !== 1 || entries[0].id !== "entry_1") {
      throw new Error(`Entries save failed. Count: ${entries.length}`);
    }
    console.log("✓ Entry Save & Get passed.");
  } catch (err: any) {
    console.error("✗ Entries test failed:", err.message);
    pass = false;
  }

  // Test 3: Streak Tracker Calculations
  try {
    // Clear entries
    clearProfile();
    
    // Day 0: Today
    const today = new Date();
    const entryToday: JournalEntry = {
      id: "today",
      timestamp: today.toISOString(),
      journalText: "Logged today",
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5
    };
    saveEntry(entryToday);

    // Day 1: Yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const entryYesterday: JournalEntry = {
      id: "yesterday",
      timestamp: yesterday.toISOString(),
      journalText: "Logged yesterday",
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5
    };
    saveEntry(entryYesterday);

    const streak = getJournalStreak();
    if (streak !== 2) {
      throw new Error(`Expected streak to be 2, got ${streak}`);
    }
    console.log(`✓ Streak calculation passed (Streak: ${streak}).`);
  } catch (err: any) {
    console.error("✗ Streak test failed:", err.message);
    pass = false;
  }

  return pass;
}
