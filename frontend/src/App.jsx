import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VoiceBarista from './components/VoiceBarista';
import MoodRecommender from './components/MoodRecommender';
import WaitForecast from './components/WaitForecast';
import CafeConnect from './components/CafeConnect';
import StaffPulse from './components/StaffPulse';
import ApiKeyModal from './components/ApiKeyModal';
import { Sparkles, Coffee } from './components/Icons';

export default function App() {
  const [activeTab, setActiveTab] = useState('order');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState(false);
  const [activeModel, setActiveModel] = useState('Gemini 3.8 Flash');
  const [placedOrders, setPlacedOrders] = useState([]);

  // Check health and Gemini key status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setGeminiStatus(data.gemini_configured);
        if (data.active_model) {
          const friendly = data.active_model.includes('3.8') ? 'Gemini 3.8 Flash' : data.active_model;
          setActiveModel(friendly);
        }
      } catch (e) {
        setGeminiStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleOrderPlaced = (order) => {
    setPlacedOrders((prev) => [order, ...prev]);
  };

  const handleSelectPairing = (pairing) => {
    // Switch to order tab
    setActiveTab('order');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0E0D] text-[#FAF5EF] selection:bg-[#E08E45]/30 selection:text-[#F3B27A]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        geminiStatus={geminiStatus}
        activeModel={activeModel}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {activeTab === 'order' && (
          <VoiceBarista onOrderPlaced={handleOrderPlaced} />
        )}

        {activeTab === 'discover' && (
          <MoodRecommender onSelectPairing={handleSelectPairing} />
        )}

        {activeTab === 'waits' && (
          <WaitForecast />
        )}

        {activeTab === 'connect' && (
          <CafeConnect />
        )}

        {activeTab === 'staff' && (
          <StaffPulse activeOrders={placedOrders} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-5 px-4 sm:px-8 bg-[#0F0E0D]/90 text-center text-xs text-[#A8A199]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white">Aura Café</span>
            <span>— The AI Café Companion</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#E08E45] font-semibold">
            <Sparkles size={13} />
            <span>Google Cloud Builder Pop-Up • Powered by Google Gemini</span>
          </div>
          <div className="text-[11px] text-[#A8A199]">
            Smarter Ordering • Better Waits • Mood Discovery • Café Connect • Room Pulse
          </div>
        </div>
      </footer>

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentStatus={geminiStatus}
        onSaveKey={(status) => setGeminiStatus(status)}
      />

    </div>
  );
}
