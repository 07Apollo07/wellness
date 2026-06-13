'use client';

import { Activity } from 'lucide-react';

interface BurnoutMeterProps {
  score: number; // 0 to 100
  risk: 'Low' | 'Moderate' | 'High';
}

export default function BurnoutMeter({ score, risk }: BurnoutMeterProps) {
  // Map risk to styling
  const config = {
    Low: {
      color: '#7ec8a4', // sage green
      bg: 'rgba(126, 200, 164, 0.1)',
      textColor: 'text-[#7ec8a4]',
      glow: 'shadow-[#7ec8a4]/20',
      description: 'Healthy rhythm. Your mind is absorbing concepts efficiently. Maintain this pace with regular mini-breaks.',
    },
    Moderate: {
      color: '#f5a623', // amber
      bg: 'rgba(245, 166, 35, 0.1)',
      textColor: 'text-[#f5a623]',
      glow: 'shadow-[#f5a623]/20',
      description: 'Warning zone. Backlog pressure or study overload is accumulating. Consider a 10-minute quiet walk and sleep on time.',
    },
    High: {
      color: '#ef4444', // red
      bg: 'rgba(239, 68, 68, 0.1)',
      textColor: 'text-red-400',
      glow: 'shadow-red-500/20',
      description: 'Critical warning! Cognitive fatigue is severe. Stop solving questions for 3 hours, talk to someone, and sleep 8 hours tonight.',
    },
  }[risk];

  // Radial track math
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 relative flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Burnout Meter</h3>
            <p className={`text-sm font-bold ${config.textColor}`}>{risk} Risk Level</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      <div className="flex items-center justify-center py-4 relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Foreground circle with glowing properties */}
          <circle
            stroke={config.color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-white leading-none">{score}%</p>
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1">Stress</p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border border-white/5 p-3.5 bg-white/2`}>
        <p className="text-xs text-slate-300 leading-relaxed">
          {config.description}
        </p>
      </div>
    </div>
  );
}
