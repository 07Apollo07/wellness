'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Award } from 'lucide-react';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished!
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (!isRest) {
      // Completed focus session
      setCompletedSessions(prev => prev + 1);
      
      // Save details to temp localStorage for auto-journaling prefill
      try {
        const todayStr = new Date().toLocaleDateString();
        const existingLogs = localStorage.getItem('serenity_temp_pomodoro_logs') || '';
        const newLog = `\n- Completed a 25-minute Pomodoro study session at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        localStorage.setItem('serenity_temp_pomodoro_logs', existingLogs + newLog);
      } catch (e) {
        console.warn("Failed to write temp Pomodoro log:", e);
      }
      
      // Play system alert sound if possible
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 520;
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (err) {}

      alert("Great job! Focus session completed. Logging this to your daily reflection draft.");
      
      // Switch to rest
      setIsRest(true);
      setMinutes(5);
      setSeconds(0);
    } else {
      // Completed rest session
      alert("Rest over! Ready to focus again?");
      setIsRest(false);
      setMinutes(25);
      setSeconds(0);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsRest(false);
    setMinutes(25);
    setSeconds(0);
  };

  // Radial progress calculations
  const totalDuration = isRest ? 300 : 1500; // 5 min or 25 min in seconds
  const currentSecondsLeft = minutes * 60 + seconds;
  const progressPercent = ((totalDuration - currentSecondsLeft) / totalDuration) * 100;
  
  const radius = 60;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient(circle, rgba(245, 166, 35, 0.02) 0%, transparent 60%) pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-[#f5a623]" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {isRest ? 'Rest Interval' : 'Study Pomodoro'}
        </h3>
      </div>

      <div className="relative h-44 w-44 flex items-center justify-center my-4">
        <svg height={radius * 2.8} width={radius * 2.8} className="absolute transform -rotate-90">
          <circle
            stroke="rgba(255, 255, 255, 0.03)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius * 1.3}
            cx={radius * 1.4}
            cy={radius * 1.4}
          />
          <circle
            stroke={isRest ? '#b8a9d9' : '#f5a623'}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference * 1.3 + ' ' + circumference * 1.3}
            style={{ strokeDashoffset: strokeDashoffset * 1.3 }}
            strokeLinecap="round"
            r={normalizedRadius * 1.3}
            cx={radius * 1.4}
            cy={radius * 1.4}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">
            {isRest ? 'Break' : 'Focus'}
          </p>
        </div>
      </div>

      {/* Stats and buttons */}
      <div className="flex items-center gap-1.5 text-xs text-[#7ec8a4] mt-2 mb-6">
        <Award className="h-4 w-4" />
        <span>Sessions Completed today: <b>{completedSessions}</b></span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Reset Pomodoro"
          aria-label="Reset study timer"
        >
          <RotateCcw className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={toggleTimer}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
            isActive 
              ? 'bg-[#b8a9d9] text-[#0a0f1e] shadow-[#b8a9d9]/25 hover:bg-[#b8a9d9]/90'
              : 'bg-[#f5a623] text-[#0a0f1e] shadow-[#f5a623]/25 hover:bg-[#f5a623]/90'
          }`}
          aria-label={isActive ? 'Pause study timer' : 'Start study timer'}
        >
          {isActive ? <Pause className="h-5.5 w-5.5" /> : <Play className="h-5.5 w-5.5 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
