/**
 * Serenity Test Suite Master Runner
 * Run with: npx tsx tests/run.ts
 *
 * Orchestrates all unit test suites and prints a final pass/fail summary.
 */

import { runStorageTests } from './storage.test';
import { runAnalyticsTests } from './analytics.test';
import { runGeminiTests } from './gemini.test';

const DIVIDER = '='.repeat(40);

async function main() {
  console.log(DIVIDER);
  console.log('       SERENITY TEST SUITE MASTER       ');
  console.log(DIVIDER);

  const results: { name: string; passed: boolean }[] = [];

  // ── Storage Suite ──────────────────────────────────────────────────────
  const storagePass = runStorageTests();
  results.push({ name: 'Storage Unit Suite', passed: storagePass });

  console.log('');

  // ── Analytics Suite ────────────────────────────────────────────────────
  const analyticsPass = runAnalyticsTests();
  results.push({ name: 'Analytics Unit Suite', passed: analyticsPass });

  console.log('');

  // ── Gemini Integration Suite ───────────────────────────────────────────
  const geminiPass = await runGeminiTests();
  results.push({ name: 'Gemini Unit Suite', passed: geminiPass });

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('');
  console.log(DIVIDER);
  console.log('             TEST RESULTS               ');
  console.log(DIVIDER);

  let totalFailed = 0;
  for (const { name, passed } of results) {
    const label = passed ? 'PASS' : 'FAIL';
    const icon  = passed ? '✓' : '✗';
    console.log(`  ${icon} ${name.padEnd(26)} ${label}`);
    if (!passed) totalFailed++;
  }

  console.log(DIVIDER);

  if (totalFailed === 0) {
    console.log('✓ ALL TEST SUITES PASSED');
    process.exit(0);
  } else {
    console.error(`✗ ${totalFailed} SUITE(S) FAILED`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
