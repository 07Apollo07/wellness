'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, getEntries, getJournalStreak, clearProfile, StudentProfile, JournalEntry } from '@/lib/storage';
import { calculateAnalytics } from '@/lib/analytics';
import ExamCountdown from '@/components/ExamCountdown';
import BurnoutMeter from '@/components/BurnoutMeter';
import MoodChart from '@/components/MoodChart';
import { Flame, BrainCircuit, Calendar, RefreshCw, PenTool, Smile, BedDouble, Target } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push('/');
    } else {
      setProfile(p);
      const userEntries = getEntries();
      setEntries(userEntries);
      setStreak(getJournalStreak());
      setLoaded(true);
    }
  }, [router]);

  // Caching expensive analytics processing loops
  const analytics = useMemo(() => {
    return calculateAnalytics(entries);
  }, [entries]);

  const handleResetProfile = () => {
    if (confirm('Are you sure you want to reset your profile? This will clear all local wellness logs and history.')) {
      clearProfile();
      window.dispatchEvent(new Event('profileUpdated'));
      router.push('/');
    }
  };

  if (!loaded || !profile || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  // Get color intensity for heatmap cell based on average stress score (1-10)
  const getHeatmapColor = (avgStress: number) => {
    if (avgStress === 0) return 'bg-white/5 text-slate-500';
    if (avgStress <= 3) return 'bg-[#7ec8a4]/30 border border-[#7ec8a4]/40 text-[#7ec8a4]';
    if (avgStress <= 6) return 'bg-[#f5a623]/30 border border-[#f5a623]/40 text-[#f5a623]';
    return 'bg-rose-500/30 border border-rose-500/40 text-rose-300';
  };

  return (
    <div className="space-y-6 md:space-y-8 page-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="serif-display text-3xl md:text-4xl font-extrabold text-white">
            Welcome back, <span className="text-[#7ec8a4]">{profile.name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Let's evaluate your emotional pace for the <span className="text-white font-medium">{profile.examType}</span> marathon.
          </p>
        </div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7ec8a4] text-[#0a0f1e] font-bold shadow-md shadow-[#7ec8a4]/10 hover:bg-[#7ec8a4]/90 transition-all text-sm cursor-pointer"
        >
          <PenTool className="h-4 w-4" />
          Log Today's Entry
        </Link>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exam Countdown Card */}
        <ExamCountdown profile={profile} />

        {/* Streak card */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#b8a9d9]/10 to-transparent rounded-full filter blur-xl pointer-events-none" />
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#b8a9d9]/10 text-[#b8a9d9]">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Journaling Streak</h3>
              <p className="text-xs text-slate-500">Log entries consecutively</p>
            </div>
          </div>

          <div className="my-2">
            <span className="text-5xl font-black text-white tracking-tight">{streak}</span>
            <span className="text-sm font-semibold text-[#b8a9d9] ml-2">Days</span>
          </div>

          <p className="text-xs text-slate-400 border-t border-white/5 pt-4 leading-relaxed">
            {streak > 0 
              ? "Awesome commitment! Keep up the daily check-ins to monitor deep cognitive patterns."
              : "Consistency forms habits. Make a simple 1-sentence entry today to start a new streak."}
          </p>
        </div>

        {/* Average Stats Grid Card */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Average Logged Stats</h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
              <Smile className="h-4.5 w-4.5 mx-auto text-[#7ec8a4]" />
              <p className="text-lg font-bold text-white mt-1.5">{analytics.avgMood || '-'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Mood</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
              <BedDouble className="h-4.5 w-4.5 mx-auto text-[#b8a9d9]" />
              <p className="text-lg font-bold text-white mt-1.5">{analytics.avgSleep || '-'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Sleep</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
              <Target className="h-4.5 w-4.5 mx-auto text-[#f5a623]" />
              <p className="text-lg font-bold text-white mt-1.5">{analytics.avgFocus || '-'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Focus</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 text-center">Calculated over all saved journal records</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Trend chart */}
        <div className="lg:col-span-2">
          <MoodChart data={analytics.moodTrend} />
        </div>

        {/* Burnout Risk score meter */}
        <div>
          <BurnoutMeter score={analytics.burnoutScore} risk={analytics.burnoutRisk} />
        </div>
      </div>

      {/* Advanced Analysis Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wordcloud/Trigger Cloud list */}
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#b8a9d9]/10 text-[#b8a9d9]">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Stress Trigger Cloud</h3>
                <p className="text-xs text-slate-500">Uncovered factors contributing to mental fatigue</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-wrap items-center justify-center gap-2.5 p-4 my-2 border border-dashed border-white/5 rounded-xl bg-white/2">
            {analytics.triggerWordCloud.length > 0 ? (
              analytics.triggerWordCloud.map((item, idx) => {
                // Determine text size by weight
                let sizeClass = 'text-xs px-2.5 py-1';
                if (item.value >= 7) sizeClass = 'text-lg px-4 py-2 border border-[#7ec8a4]/30 font-black text-[#7ec8a4]';
                else if (item.value >= 4) sizeClass = 'text-sm px-3 py-1.5 border border-[#b8a9d9]/20 font-bold text-[#b8a9d9]';
                
                return (
                  <span
                    key={idx}
                    className={`rounded-full bg-white/5 text-slate-300 font-medium transition-all hover:bg-white/10 ${sizeClass}`}
                  >
                    {item.text}
                  </span>
                );
              })
            ) : (
              <div className="text-center">
                <p className="text-xs text-slate-500">No triggers identified yet.</p>
                <p className="text-[10px] text-slate-600 mt-1">Submit journal entries analyzing mock results or study backlogs.</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">Trigger sizes reflect relative frequency and AI analysis weight</p>
        </div>

        {/* Heatmap Section */}
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5a623]/10 text-[#f5a623]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Weekly Stress Heatmap</h3>
                <p className="text-xs text-slate-500">Stress averages grouped by day of the week</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2.5 py-6 px-2 text-center">
            {analytics.stressHeatmap.map((cell) => (
              <div key={cell.dayName} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cell.dayName}</span>
                <div 
                  className={`w-full max-w-[50px] aspect-square rounded-lg flex items-center justify-center transition-all ${getHeatmapColor(cell.avgStress)}`}
                  title={`${cell.dayName}: Avg Stress ${cell.avgStress}/10 (${cell.count} entries)`}
                >
                  <span className="text-xs font-black">
                    {cell.avgStress > 0 ? Math.round(cell.avgStress) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 text-[10px] text-slate-500 mt-2">
            <div className="flex items-center gap-1">
              <div className="h-3.5 w-3.5 rounded bg-[#7ec8a4]/20 border border-[#7ec8a4]/30" />
              <span>Low Stress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3.5 w-3.5 rounded bg-[#f5a623]/20 border border-[#f5a623]/30" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3.5 w-3.5 rounded bg-rose-500/20 border border-rose-500/30" />
              <span>High Stress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete / Reset profile Section */}
      <div className="flex justify-center pt-8 border-t border-white/5">
        <button
          onClick={handleResetProfile}
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Profile & Clear Data
        </button>
      </div>
    </div>
  );
}
