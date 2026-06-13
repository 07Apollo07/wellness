'use client';

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
  colorClass: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 2, emoji: '😢', label: 'Overwhelmed', colorClass: 'border-rose-500/30 text-rose-400 bg-rose-500/5' },
  { value: 4, emoji: '😕', label: 'Stressed', colorClass: 'border-orange-500/30 text-orange-400 bg-orange-500/5' },
  { value: 6, emoji: '😐', label: 'Neutral', colorClass: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
  { value: 8, emoji: '🙂', label: 'Focused', colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
  { value: 10, emoji: '🌟', label: 'Inspired', colorClass: 'border-teal-500/30 text-teal-400 bg-teal-500/5' },
];

interface MoodSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-300 mb-3">
        How is your mood right now?
      </label>
      <div className="grid grid-cols-5 gap-2.5 sm:gap-4">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-[#7ec8a4] bg-[#7ec8a4]/10 shadow-[0_0_15px_rgba(126,200,164,0.15)] scale-105'
                  : 'border-white/5 bg-white/3 hover:border-white/20 hover:scale-102'
              }`}
            >
              <span className="text-3xl sm:text-4xl transition-transform hover:scale-115">
                {option.emoji}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-slate-300 mt-2">
                {option.label}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">
                Level {option.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
