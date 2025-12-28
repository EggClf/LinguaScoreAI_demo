
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Sparkles, MessageSquare, Mic, 
  X, AlertCircle, CheckCircle2, History, Timer, 
  BarChart3, BookOpen, Save, RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { ChatMessage, Mistake, SessionSummary } from '../types';
import { createTutorChat } from '../services/geminiService';
import { Chat } from '@google/genai';

type TutorModeType = 'interview' | 'drill' | 'chat';

export const TutorMode: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TutorModeType>('chat');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MODE_CONFIGS = {
    chat: {
      label: 'General Practice',
      prompt: `You are a friendly English tutor. 
      IMPORTANT: If the user makes a linguistic mistake, wrap the correction in this EXACT JSON format inside tags: 
      <correction>{"original": "incorrect part", "fixed": "corrected part", "rule": "grammar rule", "category": "Grammar/Vocab/Articles/Tense"}</correction>
      Always respond in English first, then provide the tag if needed.`
    },
    interview: {
      label: 'Mock Interview',
      prompt: `You are an IELTS Examiner. Part 1. 
      IMPORTANT: If the user makes a linguistic mistake, wrap the correction in this EXACT JSON format inside tags: 
      <correction>{"original": "incorrect part", "fixed": "corrected part", "rule": "grammar rule", "category": "Grammar/Vocab/Articles/Tense"}</correction>`
    },
    drill: {
      label: 'Weakness Drill',
      prompt: `Focus on Past Tense. 
      IMPORTANT: If the user makes a linguistic mistake, wrap the correction in this EXACT JSON format inside tags: 
      <correction>{"original": "incorrect part", "fixed": "corrected part", "rule": "grammar rule", "category": "Grammar/Vocab/Articles/Tense"}</correction>`
    }
  };

  useEffect(() => {
    startSession(activeMode);
  }, [activeMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = (mode: TutorModeType) => {
    chatSessionRef.current = createTutorChat(MODE_CONFIGS[mode].prompt);
    setMessages([{
      id: 'init',
      role: 'model',
      text: mode === 'interview' 
        ? "Good morning. I am your examiner today. Could you please tell me your full name?" 
        : `Hello! I'm your AI Tutor. We are in ${MODE_CONFIGS[mode].label} mode. How can I help you?`,
      timestamp: new Date()
    }]);
    setMistakes([]);
    setSessionStartTime(new Date());
    setShowSummary(false);
  };

  const parseResponse = (text: string) => {
    const correctionRegex = /<correction>(.*?)<\/correction>/s;
    const match = text.match(correctionRegex);
    
    if (match) {
      try {
        const mistakeData = JSON.parse(match[1]);
        const newMistake: Mistake = {
          id: Date.now().toString(),
          ...mistakeData,
          timestamp: new Date()
        };
        setMistakes(prev => [newMistake, ...prev]);
        // Return cleaned text without the tag
        return text.replace(correctionRegex, '').trim();
      } catch (e) {
        console.error("Failed to parse mistake JSON", e);
      }
    }
    return text;
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const cleanText = parseResponse(result.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = () => {
    setShowSummary(true);
  };

  const calculateSummary = (): SessionSummary => {
    const duration = sessionStartTime 
      ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000) 
      : 0;
    
    const categories: Record<string, number> = {};
    mistakes.forEach(m => {
      categories[m.category] = (categories[m.category] || 0) + 1;
    });

    const common = Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      durationMinutes: Math.max(1, duration),
      messageCount: messages.length,
      vocabCount: Math.floor(messages.length * 1.5), // Estimate
      mistakeCount: mistakes.length,
      fluencyScore: Math.max(4, 9 - (mistakes.length / 3)),
      commonMistakes: common
    };
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-4">
      {/* Session Header */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <MessageSquare size={18} /> {MODE_CONFIGS[activeMode].label}
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Timer size={14} /> Live Session
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="!py-1.5 !text-xs" onClick={() => startSession(activeMode)}>
             <RefreshCw size={14} /> Restart
           </Button>
           <Button variant="danger" className="!py-1.5 !text-xs !bg-slate-800" onClick={handleEndSession}>
             End Session & Recap
           </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm ml-14 animate-pulse">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Talk to your tutor..."
                className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="!p-3 rounded-xl shadow-indigo-200 shadow-lg">
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mistakes Sidebar */}
        <div className="w-80 flex flex-col gap-4">
           <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" /> Live Mistakes
                 </h3>
                 <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-black">{mistakes.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {mistakes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                       <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                       <p className="text-xs font-bold uppercase tracking-widest">No mistakes yet!</p>
                       <p className="text-[10px] mt-1">Your real-time corrections will appear here.</p>
                    </div>
                 ) : (
                    mistakes.map((m) => (
                       <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 animate-in slide-in-from-right-2">
                          <div className="flex justify-between items-start">
                             <span className="text-[9px] font-black uppercase text-indigo-500 bg-white px-1.5 py-0.5 rounded border border-indigo-100">{m.category}</span>
                             <span className="text-[9px] text-slate-400">{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="text-xs text-red-500 font-medium italic line-through">"{m.original}"</div>
                          <div className="text-xs text-emerald-600 font-bold">✓ "{m.fixed}"</div>
                          <p className="text-[10px] text-slate-500 leading-snug pt-1 border-t border-slate-200/50">{m.rule}</p>
                       </div>
                    ))
                 )}
              </div>

              {mistakes.length > 0 && (
                <div className="p-4 bg-red-50/50 border-t border-red-100">
                   <div className="flex justify-between text-[10px] font-bold text-red-700 uppercase mb-2">
                      <span>Most Frequent Error:</span>
                      <span>{calculateSummary().commonMistakes[0]?.category || 'N/A'}</span>
                   </div>
                   <div className="w-full h-1 bg-red-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '65%' }}></div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Session Summary Overlay */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white relative">
                 <button onClick={() => setShowSummary(false)} className="absolute top-6 right-6 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X size={24} />
                 </button>
                 <div className="flex items-center gap-4 mb-2">
                    <BarChart3 size={32} className="text-indigo-200" />
                    <h2 className="text-3xl font-black italic tracking-tight">SESSION REPORT</h2>
                 </div>
                 <p className="text-indigo-100 font-medium uppercase tracking-widest text-xs">Practice Completed Successfully</p>
              </div>

              <div className="p-8 space-y-8">
                 {/* Metrics Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                       <div className="text-slate-400 text-[10px] font-black uppercase mb-1">Duration</div>
                       <div className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                          <Timer size={18} className="text-indigo-500" /> {calculateSummary().durationMinutes}m
                       </div>
                    </div>
                    <div className="text-center">
                       <div className="text-slate-400 text-[10px] font-black uppercase mb-1">Messages</div>
                       <div className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                          <MessageSquare size={18} className="text-blue-500" /> {calculateSummary().messageCount}
                       </div>
                    </div>
                    <div className="text-center">
                       <div className="text-slate-400 text-[10px] font-black uppercase mb-1">New Vocab</div>
                       <div className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                          <BookOpen size={18} className="text-emerald-500" /> {calculateSummary().vocabCount}
                       </div>
                    </div>
                    <div className="text-center">
                       <div className="text-slate-400 text-[10px] font-black uppercase mb-1">Mistakes</div>
                       <div className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
                          <AlertCircle size={18} className="text-red-500" /> {calculateSummary().mistakeCount}
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    {/* Error Breakdown */}
                    <div>
                       <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Error Breakdown</h4>
                       <div className="space-y-4">
                          {calculateSummary().commonMistakes.length > 0 ? (
                            calculateSummary().commonMistakes.map((m, i) => (
                              <div key={i} className="space-y-1">
                                 <div className="flex justify-between text-[11px] font-bold text-slate-700">
                                    <span>{m.category}</span>
                                    <span>{m.count}x</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(m.count / calculateSummary().mistakeCount) * 100}%` }}></div>
                                 </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No mistakes tracked this session. Perfect score!</p>
                          )}
                       </div>
                    </div>

                    {/* Overall Fluency */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fluency Benchmark</div>
                       <div className="relative flex items-center justify-center">
                          <div className="text-5xl font-black text-indigo-600">{calculateSummary().fluencyScore.toFixed(1)}</div>
                          <div className="absolute -top-6 -right-8 text-[10px] font-black text-indigo-400 bg-white px-2 py-1 rounded-full border border-indigo-100 shadow-sm">BAND {Math.floor(calculateSummary().fluencyScore)}</div>
                       </div>
                       <p className="text-[11px] text-slate-500 mt-6 text-center italic">"Great natural flow, keep focusing on {calculateSummary().commonMistakes[0]?.category || 'complex structures'}."</p>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6">
                    <Button className="flex-1 !py-4 shadow-xl shadow-indigo-200" onClick={() => startSession(activeMode)} icon={<Save size={20} />}>
                       Save & Continue
                    </Button>
                    <Button variant="secondary" className="!py-4" onClick={() => setShowSummary(false)}>
                       Close Report
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
