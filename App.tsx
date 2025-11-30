import React, { useState } from 'react';
import { PenTool, Mic, BookOpen, GraduationCap, LayoutDashboard, MessageCircle } from 'lucide-react';
import { WritingMode } from './components/WritingMode';
import { SpeakingMode } from './components/SpeakingMode';
import { Dashboard } from './components/Dashboard';
import { TutorMode } from './components/TutorMode';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>(ViewMode.DASHBOARD);

  const renderContent = () => {
    switch (activeView) {
      case ViewMode.DASHBOARD:
        return <Dashboard />;
      case ViewMode.WRITING:
        return <WritingMode />;
      case ViewMode.SPEAKING:
        return <SpeakingMode />;
      case ViewMode.TUTOR:
        return <TutorMode />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView(ViewMode.DASHBOARD)}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
                LinguaScore AI
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                 System Operational
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 overflow-x-auto">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex whitespace-nowrap">
            <button
              onClick={() => setActiveView(ViewMode.DASHBOARD)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === ViewMode.DASHBOARD
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView(ViewMode.WRITING)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === ViewMode.WRITING
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PenTool size={18} />
              Writing
            </button>
            <button
              onClick={() => setActiveView(ViewMode.SPEAKING)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === ViewMode.SPEAKING
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Mic size={18} />
              Speaking
            </button>
            <button
              onClick={() => setActiveView(ViewMode.TUTOR)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === ViewMode.TUTOR
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageCircle size={18} />
              AI Tutor
            </button>
          </div>
        </div>

        {/* Active View */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2024 LinguaScore AI. Designed for Vietnamese Learners.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Tutor Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;