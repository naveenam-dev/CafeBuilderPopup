import React from 'react';
import { Coffee, Sparkles, Settings, Users, BarChart3, Clock } from './Icons';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, geminiStatus, activeModel }) {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-8 py-3 bg-[#0F0E0D]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E08E45] to-[#F3B27A] flex items-center justify-center shadow-lg shadow-[#E08E45]/20">
            <Coffee size={22} className="text-[#0F0E0D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FAF5EF]">
                Aura Café
              </span>
              <span className="badge-amber text-[10px] uppercase tracking-wider py-0.5 px-2">
                Companion
              </span>
            </div>
            <p className="text-xs text-[#A8A199] hidden sm:block">
              Intelligent Ambient Café Experience
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('order')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'order'
                ? 'bg-[#E08E45] text-white shadow-md shadow-[#E08E45]/30'
                : 'text-[#A8A199] hover:text-white hover:bg-white/5'
            }`}
          >
            <Coffee size={16} />
            <span>AI Barista</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-[#E08E45] text-white shadow-md shadow-[#E08E45]/30'
                : 'text-[#A8A199] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={16} />
            <span>Mood Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('waits')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'waits'
                ? 'bg-[#E08E45] text-white shadow-md shadow-[#E08E45]/30'
                : 'text-[#A8A199] hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={16} />
            <span>Vibe & Waits</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-[#E08E45] text-white shadow-md shadow-[#E08E45]/30'
                : 'text-[#A8A199] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            <span>Café Connect</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                : 'text-[#A8A199] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 size={16} />
            <span>Staff Pulse</span>
          </button>
        </nav>

        {/* Right Settings & Model Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onOpenSettings}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#E08E45]/50 transition-all text-xs"
            title="Click to configure Gemini API Key"
          >
            <div className={`w-2 h-2 rounded-full ${geminiStatus ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#E08E45] animate-pulse'}`} />
            <span className="font-semibold text-white/90">
              {geminiStatus ? `${activeModel || 'Gemini 3.8'} Active` : 'Configure Gemini'}
            </span>
            <Settings size={14} className="text-[#A8A199]" />
          </div>
        </div>

      </div>
    </header>
  );
}
