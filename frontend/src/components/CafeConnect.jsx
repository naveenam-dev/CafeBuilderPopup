import React, { useState } from 'react';
import { Users, Sparkles, MessageSquare, Coffee, Check, Heart } from './Icons';

export default function CafeConnect() {
  const [userName, setUserName] = useState('Alex Chen');
  const [userRole, setUserRole] = useState('Full Stack AI Developer');
  const [interests, setInterests] = useState('Google Cloud, React, Generative AI, Pour-Over Coffee');
  const [workGoal, setWorkGoal] = useState('Building a prototype for Google Cloud Builder Pop-Up');
  const [loading, setLoading] = useState(false);
  
  const [matchResult, setMatchResult] = useState({
    matched_profile: {
      name: "Sarah L.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "Cloud Architect",
      interests: ["Google Cloud", "Kubernetes", "Specialty Espresso", "Sci-Fi Books"],
      table: "Deep Work Zone - Table 4",
      status: "Coding & Open for quick tech banter",
      drink: "Flat White (Oat Milk)"
    },
    match_score_percent: 96,
    why_connect: "Both of you are deep in Google Cloud architectures and are currently building high-scale prototypes today.",
    icebreakers: [
      "Hey Sarah, noticed you're exploring Google Cloud architectures too! What's your take on the newest Vertex AI capabilities?",
      "Flat White with oat milk is top tier! Mind if I bounce a quick cloud architecture idea off you during a 5-minute break?"
    ],
    spark_idea: "A 5-minute coffee recharge to exchange insights on cloud deployments."
  });

  const [community] = useState([
    {
      id: "user-1",
      name: "Sarah L.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "Cloud Architect",
      interests: ["Google Cloud", "Kubernetes", "Specialty Espresso"],
      table: "Deep Work - Table 4",
      drink: "Flat White (Oat)",
      open: true
    },
    {
      id: "user-2",
      name: "Arjun M.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "AI UX Designer",
      interests: ["Design Systems", "Generative AI", "Matcha"],
      table: "Window High-Top - Table 2",
      drink: "Iced Matcha",
      open: true
    },
    {
      id: "user-3",
      name: "Elena R.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Tech Founder",
      interests: ["Startups", "Fintech", "Cold Brew"],
      table: "Patio - Table 7",
      drink: "Nitro Cold Brew",
      open: true
    }
  ]);

  const handleMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/connect/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName,
          user_role: userRole,
          interests: interestsArray,
          work_goal: workGoal,
          table_location: "Community Table"
        })
      });
      const data = await res.json();
      if (data && data.matched_profile) {
        setMatchResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="badge-amber mb-2">Community & Social Spark</span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Café Connect: Table Buddy & Icebreakers
        </h2>
        <p className="text-sm text-[#A8A199] mt-2">
          Transform solitary café visits into serendipitous connections. Opt-in to discover fellow creators, founders, and developers nearby with AI-sparked conversation starters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Your Profile & Matching Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Users size={18} className="text-[#E08E45]" />
            <h3 className="text-sm font-bold text-white font-serif uppercase tracking-wider">
              Your Café Profile
            </h3>
          </div>

          <form onSubmit={handleMatch} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#A8A199] uppercase tracking-wider mb-1">
                Your Name & Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
                />
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="Your Role / Field"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8A199] uppercase tracking-wider mb-1">
                What are you working on today?
              </label>
              <textarea
                rows={2}
                value={workGoal}
                onChange={(e) => setWorkGoal(e.target.value)}
                placeholder="e.g., Coding an agentic app or writing a business plan..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8A199] uppercase tracking-wider mb-1">
                Interests & Topics (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., AI, Cloud, Design, Coffee"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-amber justify-center py-2.5 text-xs sm:text-sm font-bold tracking-wide mt-2"
            >
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Finding Café Match with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Find My Table Match & Icebreakers</span>
                </>
              )}
            </button>
          </form>

          {/* Currently In-Café Roster */}
          <div className="pt-3 border-t border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A199] block mb-2">
              Patrons Currently In-Café (3 Open for Chat)
            </span>
            <div className="space-y-2">
              {community.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {p.name}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      </div>
                      <span className="text-[10px] text-[#A8A199]">{p.role} • {p.table}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#F3B27A]">
                    {p.drink}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Gemini Match & Spark Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col justify-between border border-[#E08E45]/30 relative overflow-hidden bg-gradient-to-br from-[#E08E45]/10 to-transparent">
          
          <div>
            {/* Top Match Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="badge-emerald text-xs">
                  {matchResult.match_score_percent}% Synergy Match
                </span>
                <span className="text-xs text-[#A8A199]">Calculated by Gemini</span>
              </div>
              <span className="text-xs text-[#E08E45] font-semibold flex items-center gap-1">
                <Coffee size={14} /> Shared Coffee Rhythm
              </span>
            </div>

            {/* Matched Profile Spotlight */}
            <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={matchResult.matched_profile.avatar}
                  alt={matchResult.matched_profile.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#E08E45]/60 shadow-lg shadow-[#E08E45]/20"
                />
                <div>
                  <h4 className="text-lg font-bold text-white font-serif">
                    {matchResult.matched_profile.name}
                  </h4>
                  <p className="text-xs text-[#F3B27A] font-semibold">
                    {matchResult.matched_profile.role}
                  </p>
                  <p className="text-xs text-[#A8A199] mt-0.5">
                    📍 {matchResult.matched_profile.table}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-[#A8A199] block">Favorite Drink</span>
                <span className="text-xs font-bold text-white">
                  {matchResult.matched_profile.drink}
                </span>
              </div>
            </div>

            {/* Connection Rationale */}
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8A199] block mb-1">
                Why You Should Connect
              </span>
              <p className="text-xs sm:text-sm text-white leading-relaxed p-3 rounded-xl bg-white/5 border border-white/10">
                {matchResult.why_connect}
              </p>
            </div>

            {/* Gemini Icebreakers */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E08E45] flex items-center gap-1.5">
                <Sparkles size={14} /> Natural Icebreakers Sparked by Gemini:
              </span>
              
              {matchResult.icebreakers.map((ib, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0F0E0D]/60 border border-white/10 flex items-start gap-2.5 text-xs text-[#FAF5EF]">
                  <MessageSquare size={15} className="text-[#E08E45] mt-0.5 shrink-0" />
                  <span className="leading-relaxed">"{ib}"</span>
                </div>
              ))}
            </div>

            {/* Shared Collaboration Spark Idea */}
            <div className="mt-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-start gap-2">
              <Sparkles size={16} className="text-[#10B981] mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#34D399] block">Spark Activity Suggestion:</span>
                <p className="text-xs text-white/90 mt-0.5">{matchResult.spark_idea}</p>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A8A199]">
            <span>Low-pressure, consent-first community discovery</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Check size={14} className="text-[#10B981]" /> Both Patrons Opted-In
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
