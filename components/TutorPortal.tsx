
import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, MessageSquare, Mic, User, ShieldCheck, Save, ArrowRight } from 'lucide-react';
import { MOCK_PENDING_REVIEWS } from '../services/mockData';
import { AssessmentResult, AssessmentStatus, AssessmentType } from '../types';
import { Button } from './Button';
import { ScoreChart } from './ScoreChart';

export const TutorPortal: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<AssessmentResult[]>(MOCK_PENDING_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<AssessmentResult | null>(null);
  const [justification, setJustification] = useState('');
  const [adjustedScore, setAdjustedScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectReview = (review: AssessmentResult) => {
    setSelectedReview(review);
    setAdjustedScore(review.overallScore);
    setJustification('');
  };

  const handleVerify = () => {
    if (!selectedReview || !justification) return;
    setIsSaving(true);
    
    // Simulate API update
    setTimeout(() => {
      const updatedList = pendingReviews.filter(r => r.id !== selectedReview.id);
      setPendingReviews(updatedList);
      setSelectedReview(null);
      setIsSaving(false);
      alert("Assessment human-verified successfully.");
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <ClipboardList className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Certified Tutor Portal</h2>
          <p className="text-slate-500">Review flagged submissions and provide expert verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Queue */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            Pending Queue <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{pendingReviews.length}</span>
          </h3>
          <div className="space-y-3">
            {pendingReviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 italic">
                No pending reviews. All clear!
              </div>
            ) : (
              pendingReviews.map(review => (
                <div 
                  key={review.id}
                  onClick={() => handleSelectReview(review)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedReview?.id === review.id 
                      ? 'bg-indigo-50 border-indigo-300 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      review.type === AssessmentType.WRITING ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {review.type}
                    </span>
                    <span className="text-xs text-slate-400">Score: {review.overallScore}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{review.userInput.slice(0, 40)}...</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                       <User size={12} className="text-slate-500" />
                    </div>
                    <span className="text-xs text-slate-500">Student ID: #2940</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedReview ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Reviewing: {selectedReview.type} Submission</h3>
                <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* AI Estimates */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-500 uppercase">AI Score</span>
                      <div className="text-3xl font-bold text-indigo-900">{selectedReview.overallScore}</div>
                   </div>
                   <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-500 uppercase">AI CEFR</span>
                      <div className="text-3xl font-bold text-indigo-900">{selectedReview.cefrLevel}</div>
                   </div>
                </div>

                {/* Content */}
                <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Submission Content</h4>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic leading-relaxed">
                     {selectedReview.userInput}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skill Charts */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">AI Breakdown</h4>
                    <ScoreChart data={selectedReview.criteriaScores} />
                  </div>

                  {/* Verification Form */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Expert Override</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Adjust Overall Score (0-10)</label>
                      <input 
                        type="range" min="0" max="10" step="0.5" 
                        value={adjustedScore}
                        onChange={(e) => setAdjustedScore(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-lg font-bold text-indigo-700 mt-1">
                        <span>{adjustedScore}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Justification & Feedback</label>
                      <textarea 
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="Explain why you adjusted the score or confirm the AI's estimate..."
                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                       <Button variant="secondary" className="flex-1 !py-2 !text-xs" icon={<Mic size={14}/>}>
                         Attach Voice Note
                       </Button>
                       <Button 
                         variant="primary" 
                         className="flex-1 !py-2 !text-xs !bg-indigo-600" 
                         icon={<ShieldCheck size={14}/>}
                         onClick={handleVerify}
                         disabled={!justification || isSaving}
                         isLoading={isSaving}
                       >
                         Verify Score
                       </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-slate-400">
               <div className="p-4 bg-slate-50 rounded-full mb-4">
                 <ArrowRight size={48} className="opacity-20" />
               </div>
               <p className="font-medium">Select a submission from the queue to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
