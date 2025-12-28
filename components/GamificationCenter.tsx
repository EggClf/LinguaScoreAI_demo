
import React, { useState } from 'react';
import { Trophy, Medal, MapPin, Target, Flame, Crown, Star, ChevronRight } from 'lucide-react';
import { MOCK_LEADERBOARD, MOCK_ACHIEVEMENTS, MOCK_USER_STATS } from '../services/mockData';

export const GamificationCenter: React.FC = () => {
  const [tab, setTab] = useState<'leaderboard' | 'achievements'>('leaderboard');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-100 p-1">
             <img src={MOCK_USER_STATS.rank <= 3 ? "https://ui-avatars.com/api/?name=Me&background=fcd34d&color=92400e" : "https://ui-avatars.com/api/?name=Me"} className="rounded-full w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white">
            LVL {Math.floor(MOCK_USER_STATS.experience / 100)}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-900">Guardian of Grammar</h2>
          <p className="text-slate-500 text-sm">You are ranked <span className="text-indigo-600 font-bold">#{MOCK_USER_STATS.rank}</span> in Vietnam</p>
          <div className="mt-4 w-full md:w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
             <div 
                className="h-full bg-indigo-600 transition-all duration-1000" 
                style={{ width: `${(MOCK_USER_STATS.experience % 100)}%` }}
             ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{MOCK_USER_STATS.experience % 100} / 100 XP to next level</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 flex flex-col items-center">
              <span className="text-xs text-indigo-400 font-bold uppercase">Points</span>
              <span className="text-xl font-black text-indigo-700">{MOCK_USER_STATS.points.toLocaleString()}</span>
           </div>
           <div className="bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 flex flex-col items-center">
              <span className="text-xs text-orange-400 font-bold uppercase">Streak</span>
              <span className="text-xl font-black text-orange-700">{MOCK_USER_STATS.streakDays} Days</span>
           </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit mx-auto">
        <button 
          onClick={() => setTab('leaderboard')}
          className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'leaderboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Leaderboards
        </button>
        <button 
          onClick={() => setTab('achievements')}
          className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'achievements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Achievements
        </button>
      </div>

      {tab === 'leaderboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Main Global Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> Vietnam Top Learners</h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Updates every 24h</span>
            </div>
            <div className="divide-y divide-slate-100">
               {MOCK_LEADERBOARD.map((entry) => (
                 <div key={entry.rank} className={`flex items-center gap-4 px-6 py-4 ${entry.isCurrentUser ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    <div className="w-8 text-center font-black text-slate-400">
                       {entry.rank === 1 ? <Crown className="text-yellow-500 mx-auto" size={20} /> : 
                        entry.rank === 2 ? <Medal className="text-slate-400 mx-auto" size={20} /> : 
                        entry.rank === 3 ? <Medal className="text-orange-400 mx-auto" size={20} /> : 
                        entry.rank}
                    </div>
                    <img src={entry.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-800 flex items-center gap-2">
                         {entry.name}
                         {entry.isCurrentUser && <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase">You</span>}
                       </h4>
                       <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium italic"><MapPin size={10} /> {entry.city}</span>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-black text-slate-900">{entry.points.toLocaleString()}</div>
                       <div className="text-[10px] text-slate-400 uppercase font-bold">Points</div>
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-4 bg-indigo-600 text-center">
               <button className="text-white text-xs font-bold hover:underline">View Full Global Rankings →</button>
            </div>
          </div>

          {/* Local / Anonymous ranking */}
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                <h4 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18} /> Saigon Rankings</h4>
                <p className="text-xs text-indigo-100 mb-6">You are <span className="font-bold text-white">#42</span> out of 1,200 active learners in Saigon this week.</p>
                <div className="space-y-3">
                   {[
                     { name: "L. Nguyen", points: "4,500" },
                     { name: "H. Tran", points: "4,100" },
                     { name: "T. Pham", points: "3,950" }
                   ].map((local, i) => (
                     <div key={i} className="flex justify-between items-center bg-white/10 p-2 rounded-lg text-xs font-medium">
                        <span>{local.name}</span>
                        <span className="font-bold">{local.points}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Weekly Challenge</h4>
                <p className="text-xs text-slate-500 mb-4">Complete 5 speaking assessments to unlock the "Orator" title.</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div className="h-full bg-orange-500" style={{ width: '60%' }}></div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                   <span>3/5 Assessments</span>
                   <span className="text-orange-600">2 DAYS LEFT</span>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
           {MOCK_ACHIEVEMENTS.map((ach) => (
             <div 
               key={ach.id} 
               className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${
                 ach.unlocked 
                   ? 'bg-white border-indigo-100 shadow-md ring-4 ring-indigo-50 shadow-indigo-100/20' 
                   : 'bg-slate-50 border-slate-200 grayscale opacity-75'
               }`}
             >
               <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="text-4xl">{ach.icon}</div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    ach.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    ach.rarity === 'Epic' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    ach.rarity === 'Rare' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {ach.rarity}
                  </span>
               </div>
               <div className="relative z-10">
                 <h4 className="font-bold text-slate-800">{ach.title}</h4>
                 <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                 
                 <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${ach.unlocked ? 'bg-indigo-600' : 'bg-slate-400'}`}
                         style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                       ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{ach.progress}/{ach.maxProgress}</span>
                 </div>
               </div>
               
               {ach.unlocked && (
                 <div className="absolute top-0 right-0 p-2">
                    <Crown className="text-yellow-400" size={16} />
                 </div>
               )}
               <div className="absolute -bottom-4 -right-4 opacity-[0.03] scale-[4]">
                  <Trophy size={48} />
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
