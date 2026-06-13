// ============================================================
// Storage Unit Tests
// Covers: profile CRUD, entry ordering, streak logic,
//         chat history CRUD, and edge-case isolation
// ============================================================

// Each test function creates its own isolated in-memory store
// so no test pollutes another's state.
function makeStore() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

// Patch window + localStorage so the storage module's IS_CLIENT check passes
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {};
}

// We'll swap the global localStorage before each test group
function patchLocalStorage(store: ReturnType<typeof makeStore>) {
  (global as any).localStorage = store;
}

import {
  getProfile, saveProfile, clearProfile,
  getEntries, saveEntry,
  getChatHistory, saveChatMessage, clearChatHistory,
  getJournalStreak,
  StudentProfile, JournalEntry, ChatMessage
} from '../lib/storage';

export function runStorageTests() {
  console.log('--- Starting Storage Unit Tests ---');
  let pass = true;

  // ── TEST 1: Save and Get Profile ─────────────────────────────────────────
  try {
    patchLocalStorage(makeStore());

    const mockProfile: StudentProfile = {
      name: 'Tanya',
      examType: 'NEET',
      targetYear: '2027',
      currentStressLevel: 7,
    };
    saveProfile(mockProfile);
    const loaded = getProfile();
    if (!loaded || loaded.name !== 'Tanya' || loaded.examType !== 'NEET') {
      throw new Error(`Profile load failed. Got: ${JSON.stringify(loaded)}`);
    }
    console.log('✓ Profile Save & Get passed.');
  } catch (err: any) {
    console.error('✗ Profile test failed:', err.message);
    pass = false;
  }

  // ── TEST 2: Save and Get Journal Entries ──────────────────────────────────
  try {
    patchLocalStorage(makeStore()); // fresh store

    const entry: JournalEntry = {
      id: 'entry_1',
      timestamp: new Date().toISOString(),
      journalText: 'Mock physics test backlog',
      mood: 6, stressLevel: 5, sleepQuality: 7, focusQuality: 8,
    };
    saveEntry(entry);
    const entries = getEntries();
    if (entries.length !== 1 || entries[0].id !== 'entry_1') {
      throw new Error(`Entries save failed. Count: ${entries.length}`);
    }
    console.log('✓ Entry Save & Get passed.');
  } catch (err: any) {
    console.error('✗ Entries test failed:', err.message);
    pass = false;
  }

  // ── TEST 3: Journal Streak Calculation (today + yesterday = 2) ───────────
  try {
    patchLocalStorage(makeStore()); // fresh store, no leftover profile

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    saveEntry({
      id: 'today',
      timestamp: today.toISOString(),
      journalText: 'Logged today',
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5,
    });
    saveEntry({
      id: 'yesterday',
      timestamp: yesterday.toISOString(),
      journalText: 'Logged yesterday',
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5,
    });

    const streak = getJournalStreak();
    if (streak !== 2) {
      throw new Error(`Expected streak to be 2, got ${streak}`);
    }
    console.log(`✓ Streak calculation passed (Streak: ${streak}).`);
  } catch (err: any) {
    console.error('✗ Streak test failed:', err.message);
    pass = false;
  }

  // ── TEST 4: Streak = 0 when last entry is 2+ days old ───────────────────
  try {
    patchLocalStorage(makeStore());

    const old = new Date();
    old.setDate(old.getDate() - 3);
    saveEntry({
      id: 'stale',
      timestamp: old.toISOString(),
      journalText: 'Old entry',
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5,
    });
    const streak = getJournalStreak();
    if (streak !== 0) {
      throw new Error(`Expected streak 0 for stale data, got ${streak}`);
    }
    console.log('✓ Streak = 0 for stale entry passed.');
  } catch (err: any) {
    console.error('✗ Stale streak test failed:', err.message);
    pass = false;
  }

  // ── TEST 5: Streak = 0 on empty store ────────────────────────────────────
  try {
    patchLocalStorage(makeStore());
    const streak = getJournalStreak();
    if (streak !== 0) {
      throw new Error(`Expected streak 0 on empty store, got ${streak}`);
    }
    console.log('✓ Streak = 0 on empty store passed.');
  } catch (err: any) {
    console.error('✗ Empty streak test failed:', err.message);
    pass = false;
  }

  // ── TEST 6: saveEntry preserves newest-first ordering ────────────────────
  try {
    patchLocalStorage(makeStore());

    const older: JournalEntry = {
      id: 'older',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      journalText: 'Earlier',
      mood: 4, stressLevel: 4, sleepQuality: 4, focusQuality: 4,
    };
    const newer: JournalEntry = {
      id: 'newer',
      timestamp: new Date().toISOString(),
      journalText: 'Later',
      mood: 8, stressLevel: 2, sleepQuality: 8, focusQuality: 8,
    };

    saveEntry(older);
    saveEntry(newer);
    const entries = getEntries();

    if (entries[0].id !== 'newer') {
      throw new Error(`Expected newest entry first, got id="${entries[0].id}"`);
    }
    console.log('✓ Newest-first ordering passed.');
  } catch (err: any) {
    console.error('✗ Entry ordering test failed:', err.message);
    pass = false;
  }

  // ── TEST 7: clearProfile wipes profile AND entries ───────────────────────
  try {
    patchLocalStorage(makeStore());

    saveProfile({ name: 'X', examType: 'CAT', targetYear: '2026', currentStressLevel: 3 });
    saveEntry({
      id: 'e1', timestamp: new Date().toISOString(), journalText: 'test',
      mood: 5, stressLevel: 5, sleepQuality: 5, focusQuality: 5,
    });
    clearProfile();

    const profileAfter = getProfile();
    const entriesAfter = getEntries();

    if (profileAfter !== null) throw new Error('Profile should be null after clearProfile');
    if (entriesAfter.length !== 0) throw new Error(`Entries should be empty after clearProfile, got ${entriesAfter.length}`);
    console.log('✓ clearProfile wipes profile and entries passed.');
  } catch (err: any) {
    console.error('✗ clearProfile test failed:', err.message);
    pass = false;
  }

  // ── TEST 8: Chat history save and retrieve ───────────────────────────────
  try {
    patchLocalStorage(makeStore());

    const msg: ChatMessage = {
      id: 'msg_1',
      role: 'user',
      content: 'Hello Serenity',
      timestamp: new Date().toISOString(),
    };
    saveChatMessage(msg);
    const history = getChatHistory();

    if (history.length !== 1 || history[0].id !== 'msg_1') {
      throw new Error(`Chat history save failed. Got: ${JSON.stringify(history)}`);
    }
    console.log('✓ Chat history Save & Get passed.');
  } catch (err: any) {
    console.error('✗ Chat history test failed:', err.message);
    pass = false;
  }

  // ── TEST 9: clearChatHistory empties the log ─────────────────────────────
  try {
    patchLocalStorage(makeStore());

    saveChatMessage({
      id: 'm1', role: 'user', content: 'hi', timestamp: new Date().toISOString(),
    });
    clearChatHistory();
    const history = getChatHistory();
    if (history.length !== 0) {
      throw new Error(`Expected 0 messages after clear, got ${history.length}`);
    }
    console.log('✓ clearChatHistory passed.');
  } catch (err: any) {
    console.error('✗ clearChatHistory test failed:', err.message);
    pass = false;
  }

  return pass;
}
