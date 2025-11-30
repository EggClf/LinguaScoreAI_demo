import React, { useState } from 'react';
import { PenTool, CheckCircle, RefreshCcw, ArrowRight, Flag } from 'lucide-react';
import { Button } from './Button';
import { ScoreChart } from './ScoreChart';
import { assessWriting } from '../services/geminiService';
import { AssessmentResult, DifficultyLevel, WritingCorrection } from '../types';

export const WritingMode: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.INTERMEDIATE);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await assessWriting(text, level);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze text. Please check your API Key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PenTool className="text-indigo-600" /> Writing Assessment
          </h2>
          <p className="text-slate-500">Get RSA-based scores for grammar, vocabulary, coherence, and task achievement.</p>
        </div>
        <select 
          value={level}
          onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
          className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {Object.values(DifficultyLevel).map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your essay or paragraph here (e.g., 'Discuss the advantages and disadvantages of online learning...')"
              className="w-full h-80 p-4 rounded-lg resize-none outline-none focus:bg-slate-50 transition-colors text-slate-700"
              disabled={isAnalyzing || !!result}
            />
          </div>
          
          {!result ? (
            <div className="flex justify-end">
              <Button 
                onClick={handleAnalyze} 
                isLoading={isAnalyzing} 
                disabled={text.length < 10}
                icon={<ArrowRight size={18} />}
              >
                Analyze Writing
              </Button>
            </div>
          ) : (
             <Button variant="secondary" onClick={handleReset} icon={<RefreshCcw size={18} />}>
               Start New Assessment
             </Button>
          )}
        </div>

        {/* Results Section */}
        {result ? (
          <div className="space-y-6 animate-fade-in">
            {/* Flagging Alert */}
            {result.flagForReview && (
               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
                 <Flag className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                 <div>
                   <h3 className="text-orange-800 font-semibold text-sm">Review Recommended</h3>
                   <p className="text-orange-700 text-sm mt-1">The AI is uncertain about this evaluation (e.g., text too short). Consider flagging for human tutor review.</p>
                   <button className="mt-2 text-xs font-semibold text-orange-800 underline hover:text-orange-900">
                     Flag for Human Review
                   </button>
                 </div>
               </div>
             )}

            {/* Overall Score & CEFR */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl p-6 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-indigo-200 font-medium mb-1">Overall Band Score</p>
                <div className="flex items-baseline gap-3">
                  <div className="text-5xl font-bold">{result.overallScore}</div>
                  <div className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">{result.cefrLevel || 'N/A'}</div>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                 <CheckCircle size={32} className="text-white" />
              </div>
            </div>

            <ScoreChart data={result.criteriaScores} />

            {/* Detailed Corrections */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between">
                <span>AI Feedback & Corrections</span>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <p className="text-slate-600 italic">"{result.generalFeedback}"</p>
                
                {result.corrections?.map((item: WritingCorrection, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-red-600 line-through text-sm mb-1">{item.original}</p>
                    <p className="text-green-700 font-medium flex items-center gap-2">
                       {item.correction}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improved Version */}
            {result.improvedVersion && (
               <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <h4 className="text-indigo-900 font-semibold mb-2">Native Speaker Version</h4>
                  <p className="text-indigo-800 text-sm leading-relaxed">{result.improvedVersion}</p>
               </div>
            )}
          </div>
        ) : (
          /* Empty State / Placeholder */
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-200">
             <PenTool size={48} className="mb-4 opacity-50" />
             <p>Your results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};