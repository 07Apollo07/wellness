'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, saveProfile, StudentProfile } from '@/lib/storage';
import { Brain, ArrowRight, Sparkles, BookOpen, AlertCircle, Compass } from 'lucide-react';

const EXAM_OPTIONS = ['NEET', 'JEE', 'UPSC', 'GATE', 'CAT', 'CUET'];

export default function Onboarding() {
  const router = useRouter();
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [examType, setExamType] = useState('JEE');
  const [customExam, setCustomExam] = useState('');
  const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());
  const [stressLevel, setStressLevel] = useState(5);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Onboarding component mounted on client.");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const p = getProfile();
      console.log("Onboarding profile loaded:", p);
      if (p) {
        console.log("Redirecting to dashboard...");
        router.push('/dashboard');
      } else {
        setProfileLoaded(true);
      }
    } catch (err) {
      console.error("Error reading profile in page.tsx:", err);
      setProfileLoaded(true);
    }
  }, [mounted, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalExamType = examType === 'Other' ? (customExam.trim() || 'Custom') : examType;

    const newProfile: StudentProfile = {
      name: name.trim(),
      examType: finalExamType,
      targetYear,
      currentStressLevel: stressLevel,
    };

    saveProfile(newProfile);

    // Dispatch event to notify layout/nav of update
    window.dispatchEvent(new Event('profileUpdated'));
    router.push('/dashboard');
  };

  if (!profileLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] page-fade-in">
      {!showForm ? (
        /* Landing View */
        <div className="text-center max-w-3xl px-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7ec8a4]/20 bg-[#7ec8a4]/5 text-xs text-[#7ec8a4] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>GenAI Student Companion for Academic Rigor</span>
          </div>

          <h1 className="serif-display text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight max-w-2xl">
            Navigate your exams with <span className="text-[#7ec8a4]">peace</span>.
          </h1>
          
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mt-6 leading-relaxed">
            Serenity uses the Google Gemini API to analyze daily study logs, detect backlogs stress triggers, and provide customized mindfulness coaching.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-12 text-left">
            <div className="glass-panel p-5">
              <BookOpen className="h-6 w-6 text-[#7ec8a4] mb-3" />
              <h3 className="text-sm font-semibold text-white">Daily Journal Analysis</h3>
              <p className="text-xs text-slate-400 mt-1.5">Uncover stress triggers across mock test reviews and syllabus backlogs.</p>
            </div>
            <div className="glass-panel p-5">
              <Compass className="h-6 w-6 text-[#b8a9d9] mb-3" />
              <h3 className="text-sm font-semibold text-white">Adaptive Mindfulness</h3>
              <p className="text-xs text-slate-400 mt-1.5">Personalized breathing and sensory exercises automatically matching your mood.</p>
            </div>
            <div className="glass-panel p-5">
              <Brain className="h-6 w-6 text-[#f5a623] mb-3" />
              <h3 className="text-sm font-semibold text-white">Serenity Companion Chat</h3>
              <p className="text-xs text-slate-400 mt-1.5">An empathetic AI chat companion loaded with your specific exam and stress profile.</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="mt-10 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#7ec8a4] text-[#0a0f1e] font-bold shadow-lg shadow-[#7ec8a4]/25 hover:bg-[#7ec8a4]/90 hover:scale-102 transition-all cursor-pointer"
          >
            Start Your Wellness Journey
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : (
        /* Onboarding Form View */
        <div className="w-full max-w-md glass-panel p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7ec8a4]/10 text-[#7ec8a4] mb-4">
              <Brain className="h-6 w-6" />
            </div>
            <h2 className="serif-display text-2xl font-bold text-white">Create Your Profile</h2>
            <p className="text-xs text-slate-400 mt-1">Help Serenity tailor insights to your study schedule.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name input */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                First Name / Nickname
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rohan, Priya"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7ec8a4] focus:ring-1 focus:ring-[#7ec8a4]/30 transition-all text-sm"
              />
            </div>

            {/* Exam selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target Competitive Exam
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXAM_OPTIONS.map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => {
                      setExamType(exam);
                      setCustomExam('');
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      examType === exam
                        ? 'border-[#7ec8a4] bg-[#7ec8a4]/10 text-white font-bold'
                        : 'border-white/5 bg-white/3 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setExamType('Other')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    examType === 'Other'
                      ? 'border-[#7ec8a4] bg-[#7ec8a4]/10 text-white font-bold'
                      : 'border-white/5 bg-white/3 text-slate-300 hover:border-white/20'
                  }`}
                >
                  Other
                </button>
              </div>

              {examType === 'Other' && (
                <input
                  type="text"
                  required
                  value={customExam}
                  onChange={(e) => setCustomExam(e.target.value)}
                  placeholder="Enter exam name (e.g., CLAT, SAT)"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7ec8a4] focus:ring-1 focus:ring-[#7ec8a4]/30 transition-all text-sm mt-2.5"
                />
              )}
            </div>

            {/* Target year */}
            <div>
              <label htmlFor="targetYear" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target Exam Year
              </label>
              <select
                id="targetYear"
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1326] text-white focus:outline-none focus:border-[#7ec8a4] focus:ring-1 focus:ring-[#7ec8a4]/30 transition-all text-sm"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                <option value={new Date().getFullYear() + 2}>{new Date().getFullYear() + 2}</option>
                <option value={new Date().getFullYear() + 3}>{new Date().getFullYear() + 3}</option>
              </select>
            </div>

            {/* Current Stress Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="stressLevel" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Stress Level
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#f5a623]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Manageable</span>
                <span>Highly Overwhelmed</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#7ec8a4] text-[#0a0f1e] font-bold shadow-lg shadow-[#7ec8a4]/20 hover:bg-[#7ec8a4]/90 transition-all text-sm mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Enter Serenity Portal
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
