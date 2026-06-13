'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { MoodSparklinePoint } from '@/lib/analytics';
import { Activity } from 'lucide-react';

interface MoodChartProps {
  data: MoodSparklinePoint[];
}

export default function MoodChart({ data }: MoodChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-panel p-6 flex flex-col justify-center items-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7ec8a4]"></div>
        <p className="text-xs text-slate-500 mt-4">Loading wellness trend...</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    name: item.date,
    Mood: item.mood,
    Stress: item.stress,
  }));

  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7ec8a4]/10 text-[#7ec8a4]">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mood & Stress Trends</h3>
            <p className="text-xs text-slate-500">Correlation over your last 7 entries</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full mt-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                domain={[1, 10]}
                ticks={[2, 4, 6, 8, 10]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#10162a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#b8a9d9' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
              />
              <Line
                type="monotone"
                dataKey="Mood"
                stroke="#7ec8a4"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: '#0a0f1e' }}
                activeDot={{ r: 6 }}
                name="Mood Level"
              />
              <Line
                type="monotone"
                dataKey="Stress"
                stroke="#f5a623"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1, fill: '#0a0f1e' }}
                activeDot={{ r: 6 }}
                name="Stress Level"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-white/5 rounded-xl bg-white/2 p-6">
            <p className="text-sm text-slate-400">Not enough data to map trends.</p>
            <p className="text-xs text-slate-600 mt-1">Start journaling to see interactive charts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
