'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'In' | 'Hold' | 'Out'>('In');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 minutes standard session
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 4-7-8 Breathing Cycle parameters
  const CYCLE_DURATIONS = {
    In: 4,
    Hold: 7,
    Out: 8
  };

  useEffect(() => {
    if (isActive && totalSeconds > 0) {
      // General session countdown
      totalTimerRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          if (prev <= 1) {
            handleReset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Phase countdown
      timerRef.current = setInterval(() => {
        setPhaseSeconds(prev => {
          if (prev <= 1) {
            // Move to next phase
            setPhase(currPhase => {
              if (currPhase === 'In') {
                setPhaseSeconds(CYCLE_DURATIONS.Hold);
                return 'Hold';
              } else if (currPhase === 'Hold') {
                setPhaseSeconds(CYCLE_DURATIONS.Out);
                return 'Out';
              } else {
                setPhaseSeconds(CYCLE_DURATIONS.In);
                return 'In';
              }
            });
            return 0; // Temp placeholder replaced by next phase duration
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [isActive, totalSeconds]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('In');
    setPhaseSeconds(4);
    setTotalSeconds(300);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Determine scaling class depending on phase
  let scaleClass = 'scale-90 bg-[#7ec8a4]/20 shadow-[#7ec8a4]/10';
  let instruction = 'Prepare yourself';
  let subText = 'Inhale through nose';

  if (isActive) {
    if (phase === 'In') {
      scaleClass = 'scale-115 bg-[#7ec8a4]/40 shadow-[#7ec8a4]/30 duration-[4000ms]';
      instruction = 'Breathe In';
      subText = 'Fill your lungs slowly';
    } else if (phase === 'Hold') {
      scaleClass = 'scale-115 bg-[#b8a9d9]/40 shadow-[#b8a9d9]/30 duration-[7000ms]';
      instruction = 'Hold Breath';
      subText = 'Maintain quiet focus';
    } else if (phase === 'Out') {
      scaleClass = 'scale-85 bg-amber-500/30 shadow-amber-500/20 duration-[8000ms]';
      instruction = 'Exhale Slowly';
      subText = 'Release all tension';
    }
  }

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
      {/* Wave decor backgrounds */}
      <div className="absolute inset-0 bg-radial-gradient(circle, rgba(126,200,164,0.02) 0%, transparent 60%) pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <Wind className="h-5 w-5 text-[#7ec8a4]" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Serenity Breathing</h3>
      </div>

      <p className="text-2xl font-extrabold text-white tracking-tight tabular-nums mb-6">
        {formatTime(totalSeconds)}
      </p>

      {/* Main Breathing Circle */}
      <div className="relative h-60 w-60 flex items-center justify-center my-6">
        {/* Outer pulse boundary */}
        <div className={`absolute inset-0 rounded-full border border-white/5 transition-all duration-[1000ms] ${isActive ? 'scale-120 opacity-30 animate-ping' : 'scale-100 opacity-0'}`} />
        
        {/* Breathing Orb */}
        <div className={`h-48 w-48 rounded-full flex flex-col items-center justify-center transition-all ease-in-out border border-white/10 shadow-2xl ${scaleClass}`}>
          <p className="text-xl font-black text-white uppercase tracking-wider transition-all duration-300">
            {isActive ? instruction : 'Serenity'}
          </p>
          {isActive && (
            <p className="text-3xl font-black text-white mt-1 tabular-nums animate-pulse">
              {phaseSeconds}s
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-[#b8a9d9] font-medium h-4 mt-2 mb-8">
        {isActive ? subText : 'Click Start to begin the 4-7-8 focus session'}
      </p>

      {/* Control buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Reset session"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={handleStartPause}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
            isActive 
              ? 'bg-[#b8a9d9] text-[#0a0f1e] shadow-[#b8a9d9]/20 hover:bg-[#b8a9d9]/90'
              : 'bg-[#7ec8a4] text-[#0a0f1e] shadow-[#7ec8a4]/20 hover:bg-[#7ec8a4]/90'
          }`}
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
