"use client";

import { useEffect, useState } from 'react';
import { getEntries, getBurnoutHistory } from '@/lib/storage';
import { calculateAnalytics } from '@/lib/analytics';
import MoodChart from '@/components/MoodChart';
import BurnoutTrend from '@/components/BurnoutTrend';

/**
 * Weekly Summary – shows a concise overview of the past 7 days:
 *   • Mood & stress trend (existing MoodChart)
 *   • Burnout score trend (new BurnoutTrend component)
 *   • Top stress‑trigger keywords extracted by Gemini
 */
export default function WeeklySummary() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [burnoutHistory, setBurnoutHistory] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    const entries = getEntries();
    setAnalytics(calculateAnalytics(entries));
    setBurnoutHistory(getBurnoutHistory());
  }, []);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="serif-display text-3xl font-bold text-white mb-4">
        Weekly Wellness Summary
      </h1>

      {/* Mood & Stress Trend */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase mb-2">
          Mood & Stress Trend (last 7 entries)
        </h2>
        <MoodChart data={analytics.moodTrend} />
      </section>

      {/* Burnout Trend */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase mb-2">
          Burnout Score Trend
        </h2>
        <BurnoutTrend data={burnoutHistory} />
      </section>

      {/* Top Stress Triggers */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase mb-2">
          Top Stress Triggers (last 7 days)
        </h2>
        <div className="flex flex-wrap gap-2 p-4 bg-white/2 border border-white/5 rounded-xl">
          {analytics.triggerWordCloud.length === 0 && (
            <p className="text-slate-500 text-xs">No triggers identified yet.</p>
          )}
          {analytics.triggerWordCloud.map((item: any, idx: number) => (
            <span
              key={idx}
              className="rounded-full bg-white/5 text-slate-300 font-medium px-2.5 py-1 text-xs"
            >
              {item.text}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
