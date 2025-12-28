
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Award, Zap, Book, TrendingUp, UserCheck, MessageSquare, Sparkles } from 'lucide-react';
import { MOCK_HISTORY_DATA, MOCK_USER_STATS, MOCK_WEAKNESS_DATA, MOCK_VOCAB_PROGRESS, getProgressSummary } from '../services/mockData';
import { SkillConstellation } from './SkillConstellation';

export const Dashboard: React.FC = () => {
  const progressReport = getProgressSummary();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learner Dashboard</h2>
          <p className="text-slate-500">Track your progress and identify areas for improvement.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="text-slate-500 text-sm">Level:</span>
              <span className="font-bold text-indigo-600">{MOCK_USER_STATS.currentLevel}</span>
           </div>
           <div className="bg-indigo-600 px-4 py-2 rounded-lg text-white shadow-md flex items-center gap-2 font-bold text-sm">
              <Sparkles size={16} /> {MOCK_USER_STATS.points.toLocaleString()} PTS
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Motivational Summary Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-white/20 rounded-full">
                <UserCheck size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{progressReport.title}</h3>
                <p className="text-indigo-100 mb-4 text-sm">{progressReport.summary}</p>
                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-indigo-100 uppercase tracking-wide">
                    <MessageSquare size={14} /> AI Coach Advice
                  </div>
                  <p className="text-white text-sm italic">"{progressReport.advice}"</p>
                  <p className="text-white font-medium mt-2 text-xs">💡 {progressReport.motivation}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Award className="text-indigo-600" size={14} />
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Reviews</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{MOCK_USER_STATS.totalAssessments}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                 <Zap className="text-orange-600" size={14} />
                 <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Streak</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{MOCK_USER_STATS.streakDays}D</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                 <Book className="text-green-600" size={14} />
                 <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Vocab</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{MOCK_USER_STATS.masteredVocabulary}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                 <TrendingUp className="text-blue-600" size={14} />
                 <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Rank</span>
              </div>
              <span className="text-xl font-bold text-indigo-600">#{MOCK_USER_STATS.rank}</span>
            </div>
          </div>

          {/* History Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-72">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-widest">Performance Curve</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 9]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Skill Constellation */}
        <div className="lg:col-span-1">
          <SkillConstellation />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vocabulary Progress */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-widest">Vocabulary Acquisition</h3>
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

        {/* Weakness Analysis */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6 text-sm uppercase tracking-widest">Error Frequency Map</h3>
          <div className="space-y-4">
            {MOCK_WEAKNESS_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-32 text-xs font-bold text-slate-500 uppercase truncate">{item.subject}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${(item.frequency / 20) * 100}%` }}
                  ></div>
                </div>
                <span className="w-12 text-xs text-slate-400 font-bold text-right">{item.frequency}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
