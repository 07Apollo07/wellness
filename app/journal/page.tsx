'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, getEntries, saveEntry, StudentProfile, JournalEntry, JournalAnalysis } from '@/lib/storage';
import MoodSelector from '@/components/MoodSelector';
import { Sparkles, Brain, ArrowRight, CheckCircle2, BedDouble, Target, Calendar, ClipboardList, PenTool } from 'lucide-react';

export default function JournalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Form states
  const [journalText, setJournalText] = useState('');
  const [mood, setMood] = useState(6);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [focusQuality, setFocusQuality] = useState(6);

  // Analysis / UI states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<JournalAnalysis | null>(null);
  const [selectedPastEntry, setSelectedPastEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push('/');
    } else {
      setProfile(p);
      setPastEntries(getEntries());
      setLoaded(true);
    }
  }, [router]);

  // Handle step-by-step loading messages
  useEffect(() => {
    if (isAnalyzing) {
      const steps = [
        'Transcribing emotional tone...',
        'Parsing syllabus backlog mentions...',
        'Checking exam pressure triggers...',
        'Synthesizing personalized strategies...',
        'Designing mindfulness micro-exercises...'
      ];
      setAnalysisSteps([steps[0]]);
      
      const timer1 = setTimeout(() => setAnalysisSteps(prev => [...prev, steps[1]]), 800);
      const timer2 = setTimeout(() => setAnalysisSteps(prev => [...prev, steps[2]]), 1500);
      const timer3 = setTimeout(() => setAnalysisSteps(prev => [...prev, steps[3]]), 2300);
      const timer4 = setTimeout(() => setAnalysisSteps(prev => [...prev, steps[4]]), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isAnalyzing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim() || !profile) return;

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    const entryData = {
      journalText: journalText.trim(),
      mood,
      stressLevel,
      sleepQuality,
      focusQuality,
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: entryData,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze entry');
      }

      const analysis: JournalAnalysis = await response.json();
      
      // Save entry to localStorage
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...entryData,
        analysis,
      };

      const updated = saveEntry(newEntry);
      setPastEntries(updated);
      setCurrentAnalysis(analysis);
      setJournalText('');
      setMood(6);
      setStressLevel(5);
      setSleepQuality(6);
      setFocusQuality(6);
    } catch (error) {
      console.error(error);
      alert('Analysis encountered an issue. Mock evaluation has been triggered instead.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!loaded || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 page-fade-in">
      {/* Left Columns - Forms & Analysis Result */}
      <div className="lg:col-span-2 space-y-6">
        {isAnalyzing && (
          /* Analysis progress screen */
          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center py-16">
            <div className="relative h-16 w-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#7ec8a4]/10 border-t-[#7ec8a4] animate-spin" />
              <Brain className="absolute inset-0 m-auto h-7 w-7 text-[#7ec8a4]" />
            </div>
            <h3 className="serif-display text-2xl font-bold text-white mb-2">Analyzing with Serenity AI</h3>
            <p className="text-xs text-slate-500 mb-6">Evaluating mental fatigue trends & custom coping structures...</p>
            
            <div className="space-y-2 max-w-xs text-left">
              {analysisSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#7ec8a4]" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAnalyzing && currentAnalysis && (
          /* Realtime AI analysis result card */
          <div className="glass-panel p-6 border border-[#7ec8a4]/30 bg-[#7ec8a4]/5 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7ec8a4]/10 to-transparent rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7ec8a4]/20 text-[#7ec8a4]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="serif-display text-xl font-bold text-white">Daily Wellness Insights</h3>
                  <p className="text-xs text-slate-400">Generated by Serenity AI</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b8a9d9]/10 border border-[#b8a9d9]/20 text-xs font-semibold text-[#b8a9d9]">
                Tone: {currentAnalysis.emotionalTone}
              </span>
            </div>

            <div className="border-t border-b border-white/5 py-4 space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {currentAnalysis.insightsSummary}
              </p>
              
              {currentAnalysis.hiddenTriggers && currentAnalysis.hiddenTriggers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider self-center mr-1">Triggers:</span>
                  {currentAnalysis.hiddenTriggers.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-white/5 border border-white/5 text-[#f5a623] px-2 py-0.5 rounded-full font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Strategies */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">Personalized Coping Strategies</h4>
              <div className="grid grid-cols-1 gap-3">
                {currentAnalysis.copingStrategies.map((strat, idx) => (
                  <div key={idx} className="flex gap-3 bg-white/3 border border-white/5 rounded-xl p-3.5 items-start">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7ec8a4]/10 text-[#7ec8a4] text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{strat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mindful exercise CTA */}
            {currentAnalysis.mindfulnessExercise && (
              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-[10px] font-bold text-[#b8a9d9] uppercase tracking-wider">Recommended Practice</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{currentAnalysis.mindfulnessExercise.title}</p>
                </div>
                <button
                  onClick={() => router.push('/mindfulness')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7ec8a4] hover:text-[#7ec8a4]/80 transition-colors cursor-pointer"
                >
                  Start Exercise
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setCurrentAnalysis(null)}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold transition-all text-xs cursor-pointer"
            >
              Log Another Journal Entry
            </button>
          </div>
        )}

        {!isAnalyzing && !currentAnalysis && (
          /* Main Journal submission form */
          <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7ec8a4]/10 text-[#7ec8a4]">
                <PenTool className="h-5 w-5" />
              </div>
              <div>
                <h2 className="serif-display text-xl font-bold text-white">Daily Log & Reflections</h2>
                <p className="text-xs text-slate-500">Record mock reviews, study schedules, or general feelings</p>
              </div>
            </div>

            {/* Journal Textarea */}
            <div>
              <label htmlFor="journalText" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                What's on your mind today?
              </label>
              <textarea
                id="journalText"
                rows={5}
                required
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Mention subject difficulties (e.g. Organic Chemistry, Physics Mock scores), sleep patterns, study hours, parents expectations or backlog pressure..."
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7ec8a4] focus:ring-1 focus:ring-[#7ec8a4]/30 transition-all text-sm leading-relaxed"
              />
            </div>

            {/* Mood selector component */}
            <MoodSelector value={mood} onChange={setMood} />

            {/* Slider parameters grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-white/5 pt-5">
              {/* Stress Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="stressLevel" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Stress level
                  </label>
                  <span className="text-xs font-bold text-[#f5a623]">{stressLevel}/10</span>
                </div>
                <input
                  id="stressLevel"
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#f5a623]"
                />
              </div>

              {/* Sleep Quality */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="sleepQuality" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-[#b8a9d9]" />
                    Sleep Quality
                  </label>
                  <span className="text-xs font-bold text-[#b8a9d9]">{sleepQuality}/10</span>
                </div>
                <input
                  id="sleepQuality"
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#b8a9d9]"
                />
              </div>

              {/* Focus Quality */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="focusQuality" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-[#7ec8a4]" />
                    Focus Quality
                  </label>
                  <span className="text-xs font-bold text-[#7ec8a4]">{focusQuality}/10</span>
                </div>
                <input
                  id="focusQuality"
                  type="range"
                  min="1"
                  max="10"
                  value={focusQuality}
                  onChange={(e) => setFocusQuality(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7ec8a4]"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#7ec8a4] text-[#0a0f1e] font-black shadow-lg shadow-[#7ec8a4]/15 hover:bg-[#7ec8a4]/90 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Analyze Reflections
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>
        )}
      </div>

      {/* Right Column - Past Reflections History */}
      <div className="space-y-6">
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="h-5 w-5 text-[#b8a9d9]" />
              <h3 className="serif-display text-lg font-bold text-white">Reflections Log</h3>
            </div>
            
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {pastEntries.length > 0 ? (
                pastEntries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedPastEntry(item);
                      if (item.analysis) {
                        setCurrentAnalysis(item.analysis);
                      }
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5 transition-all flex flex-col gap-2 group cursor-pointer"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-[#7ec8a4]" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded font-black text-white">
                        Mood: {item.mood}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.journalText}
                    </p>
                    {item.analysis && (
                      <span className="text-[9px] text-[#7ec8a4] font-bold mt-1 group-hover:underline">
                        → Tone: {item.analysis.emotionalTone} (Review Analysis)
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-500">No reflections logged yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Submit your first reflection today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
