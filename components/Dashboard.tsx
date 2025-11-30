import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Award, Zap, Book, TrendingUp } from 'lucide-react';
import { MOCK_HISTORY_DATA, MOCK_USER_STATS, MOCK_WEAKNESS_DATA, MOCK_VOCAB_PROGRESS } from '../services/mockData';

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learner Dashboard</h2>
          <p className="text-slate-500">Track your progress and identify areas for improvement.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
           <span className="text-slate-500 text-sm">Current Level:</span>
           <span className="font-bold text-indigo-600">{MOCK_USER_STATS.currentLevel}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg"><Award className="text-indigo-600" size={20} /></div>
            <span className="text-slate-500 text-sm font-medium">Total Reviews</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{MOCK_USER_STATS.totalAssessments}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-orange-50 rounded-lg"><Zap className="text-orange-600" size={20} /></div>
             <span className="text-slate-500 text-sm font-medium">Day Streak</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{MOCK_USER_STATS.streakDays}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-green-50 rounded-lg"><Book className="text-green-600" size={20} /></div>
             <span className="text-slate-500 text-sm font-medium">Vocab Mastered</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{MOCK_USER_STATS.masteredVocabulary}</span>
          <span className="text-xs text-slate-400 mt-1">+{MOCK_USER_STATS.learningVocabulary} learning</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="text-blue-600" size={20} /></div>
             <span className="text-slate-500 text-sm font-medium">Improvement</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 text-green-600">+1.5 Band</span>
          <span className="text-xs text-slate-400 mt-1">Last 30 days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Band Score History */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-semibold text-slate-800 mb-4">Band Score History</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_HISTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 9]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vocabulary Progress */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-semibold text-slate-800 mb-4">Vocabulary Acquisition</h3>
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={MOCK_VOCAB_PROGRESS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} />
              <RechartsTooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="learned" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weakness Analysis */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-6">Error Frequency & Weakness Analysis</h3>
        <div className="space-y-4">
          {MOCK_WEAKNESS_DATA.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-48 text-sm font-medium text-slate-600 truncate">{item.subject}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${(item.frequency / 20) * 100}%` }}
                ></div>
              </div>
              <span className="w-12 text-sm text-slate-500 text-right">{item.frequency}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};