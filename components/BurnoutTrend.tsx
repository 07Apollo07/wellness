import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * Props for the burnout trend chart.
 * `data` should be an array ordered chronologically (oldest → newest).
 * Each item contains a `date` string (MM/DD) and a `score` (0‑100).
 */
interface BurnoutTrendProps {
  data: { date: string; score: number }[];
}

export default function BurnoutTrend({ data }: BurnoutTrendProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm">
        No burnout data available yet.
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Burnout Score Trend (last 7 days)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} tickCount={5} stroke="#64748b" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#10162a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
            labelStyle={{ fontWeight: 'bold', color: '#b8a9d9' }}
          />
          <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
