'use client';

import { useState, useEffect } from 'react';
import { StudentProfile } from '@/lib/storage';
import { Calendar, Hourglass, Trophy } from 'lucide-react';

interface ExamCountdownProps {
  profile: StudentProfile;
}

// Map of Indian competitive exams to typical month/day of the year
const EXAM_DATES: Record<string, { month: number; day: number; quote: string }> = {
  NEET: { month: 4, day: 3, quote: "Saving lives starts with saving your energy today. Take a deep breath." }, // May 3rd (approx)
  JEE: { month: 3, day: 5, quote: "Complex equations are solved one step at a time. Keep your focus steady." },  // April 5th (approx)
  UPSC: { month: 4, day: 24, quote: "Character is forged in consistency. Trust your slow, steady progress." }, // May 24th (approx)
  GATE: { month: 1, day: 7, quote: "Engineering is about precision. Rest is a crucial part of the equation." },  // Feb 7th (approx)
  CAT: { month: 10, day: 28, quote: "Aptitude includes emotional balance. Don't stress the mock percentage." }, // Nov 28th (approx)
  CUET: { month: 4, day: 15, quote: "The door to your desired future is unlocked with persistence. You've got this." }, // May 15th (approx)
};

export default function ExamCountdown({ profile }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const year = parseInt(profile.targetYear) || new Date().getFullYear();
      const examName = profile.examType.toUpperCase();
      const details = EXAM_DATES[examName] || { month: 5, day: 1, quote: "Prepare with peace." };
      
      const examDate = new Date(year, details.month, details.day, 9, 0, 0); // 9:00 AM on exam date
      const now = new Date();
      
      let diff = examDate.getTime() - now.getTime();
      
      // If the exam date has passed for this year, roll over to next year
      if (diff < 0) {
        examDate.setFullYear(examDate.getFullYear() + 1);
        diff = examDate.getTime() - now.getTime();
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft({ days, hours, mins });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [profile]);

  const examName = profile.examType.toUpperCase();
  const quote = EXAM_DATES[examName]?.quote || "Consistency beats intensity. Take breaks.";

  if (!timeLeft) return null;

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f5a623]/10 to-transparent rounded-full filter blur-xl pointer-events-none" />

      <div className="flex items-center gap-3.5 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5a623]/10 text-[#f5a623]">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Exam Countdown</h3>
          <p className="serif-display text-lg font-bold text-slate-100">{examName} {profile.targetYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center">
          <p className="text-3xl font-extrabold text-white tracking-tight">{timeLeft.days}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Days</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center">
          <p className="text-3xl font-extrabold text-[#7ec8a4] tracking-tight">{timeLeft.hours}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Hours</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-center">
          <p className="text-3xl font-extrabold text-[#b8a9d9] tracking-tight">{timeLeft.mins}</p>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Minutes</p>
        </div>
      </div>

      <div className="flex items-start gap-3 mt-4 border-t border-white/5 pt-4">
        <Trophy className="h-5 w-5 text-[#f5a623] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs italic text-slate-300 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
