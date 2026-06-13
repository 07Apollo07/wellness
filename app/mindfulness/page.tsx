'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, StudentProfile } from '@/lib/storage';
import BreathingExercise from '@/components/BreathingExercise';
import PomodoroTimer from '@/components/PomodoroTimer';
import { Compass, Quote, Eye, Hand, AudioLines, Flame, Soup, CheckCircle2 } from 'lucide-react';

const GROUNDING_STEPS = [
  {
    step: 5,
    title: "See 5 Things",
    description: "Look around you and name 5 distinct things you can see (e.g., your book, a pen, a clock, a light beam, the wall color). Focus on their details.",
    icon: Eye,
    colorClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
  },
  {
    step: 4,
    title: "Feel 4 Textures",
    description: "Notice 4 things you can physically feel (e.g., the texture of your study desk, your clothing fabric, the weight of a book, your feet on the floor). Feel the tactile sensation.",
    icon: Hand,
    colorClass: "border-sky-500/20 bg-sky-500/5 text-sky-400"
  },
  {
    step: 3,
    title: "Hear 3 Sounds",
    description: "Listen closely and identify 3 sounds in your environment (e.g., the ceiling fan humming, birds outside, a distant car, your own quiet breathing).",
    icon: AudioLines,
    colorClass: "border-[#b8a9d9]/20 bg-[#b8a9d9]/5 text-[#b8a9d9]"
  },
  {
    step: 2,
    title: "Smell 2 Scent-sources",
    description: "Focus on 2 things you can smell (e.g., the smell of paper, laundry detergent, tea/coffee, or general indoor air).",
    icon: Flame,
    colorClass: "border-amber-500/20 bg-amber-500/5 text-amber-400"
  },
  {
    step: 1,
    title: "Taste 1 Flavor",
    description: "Identify 1 thing you can taste (e.g., the taste of fresh water, lingering toothpaste, or just clear your throat and notice the simple state of your tongue).",
    icon: Soup,
    colorClass: "border-rose-500/20 bg-rose-500/5 text-rose-400"
  }
];

const EXAM_QUOTES: Record<string, string> = {
  NEET: "The stethoscope you dream of wearing will rest against a heart that beats just like yours. Care for your own heart today.",
  JEE: "Solving JEE questions requires a calm CPU. When your thoughts loop, step away, clear your caches, and restart with fresh momentum.",
  UPSC: "UPSC is a marathon of character, not a sprint of syllabus completion. Every day you sit down is a test of determination, not just memory. Pace yourself.",
  GATE: "Precision engineering requires careful calibration. Rest is not lost time; it is the calibration cycle your brain needs to code answers.",
  CAT: "Aptitude includes emotional maturity. A mock percentile does not evaluate your capacity to lead. Breathe, recalibrate, and try again.",
  CUET: "Your desired university is just one milestone in a long, beautiful learning journey. Believe in the effort you put in today."
};

export default function MindfulnessPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeGroundingIdx, setActiveGroundingIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.push('/');
    } else {
      setProfile(p);
      setLoaded(true);
    }
  }, [router]);

  const handleNextGrounding = () => {
    const stepNum = GROUNDING_STEPS[activeGroundingIdx].step;
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps(prev => [...prev, stepNum]);
    }
    
    if (activeGroundingIdx < GROUNDING_STEPS.length - 1) {
      setActiveGroundingIdx(prev => prev + 1);
    }
  };

  const handleResetGrounding = () => {
    setActiveGroundingIdx(0);
    setCompletedSteps([]);
  };

  if (!loaded || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
      </div>
    );
  }

  const examName = profile.examType.toUpperCase();
  const quote = EXAM_QUOTES[examName] || "You are bigger than any single exam score. Take breaks, be kind to yourself.";
  
  const currentStep = GROUNDING_STEPS[activeGroundingIdx];
  const StepIcon = currentStep.icon;
  const isLastStep = activeGroundingIdx === GROUNDING_STEPS.length - 1;

  return (
    <div className="space-y-8 page-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="serif-display text-3xl font-extrabold text-white">Mindfulness & Rest Hub</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ground yourself in the present moment to reset your study cognitive load.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Stacked Breathing & Pomodoro Timer */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1">
            <BreathingExercise />
          </div>
          <div className="flex-1">
            <PomodoroTimer />
          </div>
        </div>

        {/* Right Column: 5-4-3-2-1 Grounding Technique */}
        <div className="glass-panel p-6 flex flex-col justify-between h-full min-h-[400px]">
          <div>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7ec8a4]/10 text-[#7ec8a4]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="serif-display text-base font-bold text-white">5-4-3-2-1 Grounding Sensory Technique</h3>
                <p className="text-xs text-slate-500">De-escalate study focus loops by engaging physical senses</p>
              </div>
            </div>

            {/* Stepper indicator bar */}
            <div className="flex items-center justify-between gap-1 my-6">
              {GROUNDING_STEPS.map((s, idx) => (
                <div 
                  key={s.step} 
                  className={`flex-1 h-1 rounded transition-all ${
                    idx <= activeGroundingIdx 
                      ? completedSteps.includes(s.step) ? 'bg-[#7ec8a4]' : 'bg-[#b8a9d9]' 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Active Card Body */}
            <div className={`border rounded-2xl p-5 my-4 transition-all duration-300 ${currentStep.colorClass}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <StepIcon className="h-5 w-5" />
                  <span className="text-sm font-black uppercase tracking-wider">{currentStep.title}</span>
                </div>
                <span className="text-2xl font-black opacity-40">Step {5 - currentStep.step + 1}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                {currentStep.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {completedSteps.length > 0 && (
              <button
                onClick={handleResetGrounding}
                className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/15 bg-white/3 hover:bg-white/5 text-xs text-slate-300 font-bold transition-all cursor-pointer"
              >
                Reset Steps
              </button>
            )}
            
            {!completedSteps.includes(currentStep.step) || !isLastStep ? (
              <button
                onClick={handleNextGrounding}
                className="flex-1 py-2.5 rounded-xl bg-[#7ec8a4] text-[#0a0f1e] font-black text-xs hover:bg-[#7ec8a4]/90 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {isLastStep ? "Mark Grounding Completed" : "Check & Next Step"}
                <CheckCircle2 className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex-1 py-2.5 rounded-xl bg-[#b8a9d9]/20 border border-[#b8a9d9]/30 text-[#b8a9d9] font-black text-xs text-center">
                Grounding Session Completed!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Motivation Quote banner */}
      <div className="glass-panel p-6 border border-[#b8a9d9]/15 bg-gradient-to-r from-[#0a0f1e] via-slate-900 to-[#0a0f1e] relative overflow-hidden flex flex-col md:flex-row items-center gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8a9d9]/10 text-[#b8a9d9] shrink-0">
          <Quote className="h-6 w-6" />
        </div>
        <div className="text-center md:text-left space-y-1">
          <p className="text-xs font-bold text-[#b8a9d9] uppercase tracking-wider">Motivational Calibrator for {examName} Aspirants</p>
          <p className="serif-display text-sm italic text-slate-200 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
