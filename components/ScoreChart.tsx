import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { CriteriaScore } from '../types';

interface ScoreChartProps {
  data: CriteriaScore[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
  // Normalize data for chart
  const chartData = data.map(item => ({
    subject: item.criteria,
    A: item.score,
    fullMark: item.maxScore,
  }));

  return (
    <div className="w-full h-64 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Skill Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="#4f46e5"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};