import React, { useState } from 'react';
import { Sparkles, Coffee, Flame, Heart, Check, Clock, Zap } from './Icons';

export default function MoodRecommender({ onSelectPairing }) {
  const [selectedMood, setSelectedMood] = useState('Deep Focus Flow');
  const [selectedMode, setSelectedMode] = useState('Intense Coding & Building');
  const [dietary, setDietary] = useState('No Restrictions');
  const [stayDuration, setStayDuration] = useState('2-3 hours');
  const [loading, setLoading] = useState(false);
  const [pairing, setPairing] = useState({
    headline: "Hyperfocus Cognitive Fuel",
    drink: {
      name: "Ceremonial Matcha Cortado",
      caffeine_level: "Medium (Smooth)",
      vibe_notes: "Rich in L-theanine for sustained alpha-wave brain focus without espresso jitters.",
      price: "$5.25"
    },
    food: {
      name: "Protein Power Chia & Almond Bowl",
      pairing_rationale: "Slow-release complex carbs and omega-3s maintain stable glucose for long deep-work stints.",
      price: "$7.00"
    },
    barista_secret_tip: "Sit at Deep Work Zone Table 3—it has direct power outlets and lower noise reverb.",
    optimal_seating_area: "Deep Work Quiet Nook"
  });

  const moods = [
    { label: "Deep Focus Flow", icon: "🧠", desc: "Clean concentration, zero jitters" },
    { label: "High Energy Sprint", icon: "⚡", desc: "Maximum wakefulness & speed" },
    { label: "Creative Spark", icon: "🎨", desc: "Aromatic inspiration & lightness" },
    { label: "Stress Reset / Unwind", icon: "🌿", desc: "Calming herbal adaptogens" },
    { label: "Social Chat & Coffee", icon: "👥", desc: "Indulgent, shareable, cozy" },
  ];

  const workModes = [
    "Intense Coding & Building",
    "Writing, Reading & Journaling",
    "Virtual / In-Person Meeting",
    "Quick 30-min Coffee Break"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          work_mode: selectedMode,
          dietary: dietary,
          stay_duration: stayDuration
        })
      });
      const data = await res.json();
      if (data && data.headline) {
        setPairing(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="badge-amber mb-2">Discovery Engine</span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Mood & Work-Mode Menu Sommelier
        </h2>
        <p className="text-sm text-[#A8A199] mt-2">
          Tell Gemini how you want to feel and what you’re working on. Our AI crafts the scientifically optimal food & beverage pairing for your session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-5">
          
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#FAF5EF]/70 mb-2">
              1. What's your vibe or goal?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {moods.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMood === m.label
                      ? 'bg-[#E08E45]/20 border-[#E08E45] text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-[#A8A199] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-lg mb-0.5">{m.icon}</div>
                  <div className="text-xs font-bold text-white">{m.label}</div>
                  <div className="text-[10px] text-[#A8A199] truncate">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#FAF5EF]/70 mb-2">
              2. What kind of session is this?
            </label>
            <div className="space-y-1.5">
              {workModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMode(mode)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    selectedMode === mode
                      ? 'bg-[#E08E45]/15 border-[#E08E45] text-white'
                      : 'bg-white/5 border-white/10 text-[#A8A199] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#FAF5EF]/70 mb-1">
                Dietary
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
              >
                <option value="No Restrictions">No Restrictions</option>
                <option value="Dairy-Free / Oat Milk">Dairy-Free</option>
                <option value="Vegan">100% Plant-Based</option>
                <option value="Gluten-Conscious">Gluten-Conscious</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#FAF5EF]/70 mb-1">
                Planned Stay
              </label>
              <select
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
              >
                <option value="30-45 mins">Quick visit (~30m)</option>
                <option value="1-2 hours">Medium sprint (1-2h)</option>
                <option value="3+ hours">Deep work day (3h+)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full btn-amber justify-center py-3 text-xs sm:text-sm font-bold tracking-wide"
          >
            {loading ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                <span>Pairing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Get AI Sommelier Pairing</span>
              </>
            )}
          </button>

        </div>

        {/* Right Recommended Pairing Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col justify-between border border-white/15 relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E08E45]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="badge-emerald text-xs font-semibold">Gemini Curated Pairing</span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
                  {pairing.headline}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#A8A199]">Tailored for</span>
                <p className="text-xs font-bold text-[#E08E45]">{selectedMood}</p>
              </div>
            </div>

            {/* Drink & Food Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
              
              {/* Drink */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E08E45]/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#E08E45] font-bold">The Drink</span>
                  <span className="text-xs font-bold text-white font-mono">{pairing.drink.price}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{pairing.drink.name}</h4>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] bg-white/10 text-[#F3B27A] font-semibold mb-2">
                  Caffeine: {pairing.drink.caffeine_level}
                </div>
                <p className="text-xs text-[#A8A199] leading-relaxed">
                  {pairing.drink.vibe_notes}
                </p>
              </div>

              {/* Food */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#E08E45]/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#10B981] font-bold">The Pairing Bite</span>
                  <span className="text-xs font-bold text-white font-mono">{pairing.food.price}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{pairing.food.name}</h4>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#10B981]/15 text-[#34D399] font-semibold mb-2">
                  Energy Stabilizer
                </div>
                <p className="text-xs text-[#A8A199] leading-relaxed">
                  {pairing.food.pairing_rationale}
                </p>
              </div>

            </div>

            {/* Secret Barista Tip */}
            <div className="p-3.5 rounded-xl bg-[#E08E45]/10 border border-[#E08E45]/20 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-[#E08E45] mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Aura Barista Tip:</span>
                  <p className="text-xs text-[#FAF5EF]/90 mt-0.5">{pairing.barista_secret_tip}</p>
                </div>
              </div>
            </div>

            {/* Seating suggestion */}
            <div className="flex items-center gap-2 text-xs text-[#A8A199]">
              <span className="font-semibold text-white">Recommended Spot:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
                📍 {pairing.optimal_seating_area}
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#A8A199]">Ready to brew?</span>
            <button
              onClick={() => {
                if (onSelectPairing) {
                  onSelectPairing(pairing);
                }
              }}
              className="btn-amber text-xs py-2.5 px-4"
            >
              <Coffee size={16} />
              <span>Add Pairing to AI Barista Slip</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
