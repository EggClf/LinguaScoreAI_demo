
import React from 'react';
import { Lock, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { MOCK_SKILL_TREE } from '../services/mockData';
import { SkillNode } from '../types';

export const SkillConstellation: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[400px]">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={18} /> Skill Constellation
          </h3>
          <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Progress: 42%</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative">
          {MOCK_SKILL_TREE.map((node, i) => (
            <div key={node.id} className="relative group">
              <div className={`
                aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300
                ${node.status === 'mastered' ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100' : 
                  node.status === 'available' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50' : 
                  'bg-slate-900 border-slate-800/50 text-slate-600 grayscale'}
                border-2 shadow-lg
              `}>
                <div className="mb-2">
                  {node.status === 'mastered' ? <CheckCircle2 size={24} className="text-indigo-400" /> : 
                   node.status === 'available' ? <Star size={24} className="text-yellow-500" /> : 
                   <Lock size={24} />}
                </div>
                <span className="text-xs font-bold leading-tight">{node.label}</span>
                <span className="text-[10px] mt-1 opacity-60">{node.points} XP</span>
              </div>
              
              {/* Connector lines simulation (visual only for this prototype) */}
              {i % 2 === 0 && i < MOCK_SKILL_TREE.length - 1 && (
                <div className="absolute top-1/2 -right-3 w-6 h-px bg-slate-800 hidden md:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Master 3 more to unlock "Complex Syntaxes"</span>
        <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Expand Map →</button>
      </div>
    </div>
  );
};
