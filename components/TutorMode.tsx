import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, MessageSquare, Mic } from 'lucide-react';
import { Button } from './Button';
import { ChatMessage } from '../types';
import { createTutorChat } from '../services/geminiService';
import { Chat } from '@google/genai';

type TutorModeType = 'interview' | 'drill' | 'chat';

export const TutorMode: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TutorModeType>('chat');
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MODE_CONFIGS = {
    chat: {
      label: 'General Practice',
      prompt: "You are a friendly and encouraging English tutor for a Vietnamese learner. Engage in casual conversation, correct mistakes gently, and suggest better vocabulary."
    },
    interview: {
      label: 'Mock Interview',
      prompt: "You are a professional IELTS Speaking Examiner. Conduct a mock interview (Part 1). Ask one question at a time. Wait for the user's response. Assess their answer briefly then move to the next question. Maintain a formal but polite tone."
    },
    drill: {
      label: 'Weakness Drill',
      prompt: "The user struggles with 'Th' sounds and Past Tense verbs. Focus the conversation on topics that require using past tense (e.g., 'What did you do yesterday?'). Correct every grammar mistake related to tense immediately."
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
        : `Hello! I'm your AI Tutor. We are in ${MODE_CONFIGS[mode].label} mode. How can I help you today?`,
      timestamp: new Date()
    }]);
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
      const responseText = result.text;
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar Controls */}
      <div className="w-64 flex-shrink-0 hidden md:flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            Practice Mode
          </h3>
          <div className="space-y-2">
            {(Object.keys(MODE_CONFIGS) as TutorModeType[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeMode === mode 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {MODE_CONFIGS[mode].label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-indigo-900 p-4 rounded-xl shadow-sm text-white mt-auto">
          <h4 className="font-semibold mb-2 text-sm">Pro Tip</h4>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Try the "Weakness Drill" to focus specifically on your past tense errors detected in previous essays.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Chat Header (Mobile only selector) */}
        <div className="md:hidden p-4 border-b border-slate-200">
           <select 
             value={activeMode} 
             onChange={(e) => setActiveMode(e.target.value as TutorModeType)}
             className="w-full p-2 border border-slate-300 rounded-lg text-sm"
           >
             {(Object.keys(MODE_CONFIGS) as TutorModeType[]).map((m) => (
               <option key={m} value={m}>{MODE_CONFIGS[m].label}</option>
             ))}
           </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm ml-12">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50" title="Voice Input (Coming Soon)">
               <Mic size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="!px-3 !py-2"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};