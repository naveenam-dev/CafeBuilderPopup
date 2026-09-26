import React, { useState, useEffect } from 'react';
import { Clock, Volume2, Users, Sparkles, RefreshCw, Check } from './Icons';

export default function WaitForecast() {
  const [data, setData] = useState({
    current: {
      current_wait_minutes: 6,
      occupancy_rate: 68,
      noise_level_db: 54,
      deep_work_seats_available: 5,
      patio_seats_available: 8,
      counter_seats_available: 3,
      music_playlist: "Lofi Beats & Mellow Acoustic"
    },
    hourly_trend: [
      { hour: "8:00 AM", busyness: 45, wait_min: 3, vibe: "Morning Calm" },
      { hour: "9:30 AM", busyness: 85, wait_min: 10, vibe: "Morning Rush" },
      { hour: "11:00 AM", busyness: 65, wait_min: 6, vibe: "Productive Buzz (Current)" },
      { hour: "1:00 PM", busyness: 75, wait_min: 8, vibe: "Lunch Lively" },
      { hour: "3:00 PM", busyness: 40, wait_min: 2, vibe: "Afternoon Zen (Best Window)" },
      { hour: "5:00 PM", busyness: 55, wait_min: 4, vibe: "Casual Social" }
    ],
    ai_prediction: {
      best_window_today: "2:30 PM - 4:15 PM (Estimated wait < 3 mins, noise 45dB)",
      rush_alert: "Peak lunch rush anticipated at 12:45 PM (+12 mins wait)",
      available_zones: {
        deep_work: { status: "Available", seats: 5, noise: "Low (48 dB)" },
        patio: { status: "Good", seats: 8, noise: "Lively (62 dB)" },
        counter: { status: "Limited", seats: 3, noise: "Barista Chat" }
      }
    }
  });

  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forecast/live');
      const json = await res.json();
      if (json && json.current) {
        setData(json);
      }
    } catch (e) {
      console.log("Using cached forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="badge-amber mb-2">Live Room Telemetry</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Vibe & Wait Time Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-[#A8A199] mt-1">
            Real-time occupancy, acoustic levels, and Gemini predictive visit timing
          </p>
        </div>
        <button
          onClick={fetchForecast}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Live Vibe</span>
        </button>
      </div>

      {/* 3 Top Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Wait Time */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A8A199] mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Estimated Order Wait</span>
            <Clock size={18} className="text-[#E08E45]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {data.current.current_wait_minutes}
            </span>
            <span className="text-sm font-medium text-[#A8A199]">minutes</span>
          </div>
          <p className="text-xs text-[#10B981] mt-2 flex items-center gap-1">
            <Check size={14} /> 4 Baristas actively pulling shots
          </p>
        </div>

        {/* Metric 2: Occupancy */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A8A199] mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Café Seating Fill</span>
            <Users size={18} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {data.current.occupancy_rate}%
            </span>
            <span className="text-sm font-medium text-[#A8A199]">Moderate Vibe</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#10B981] to-[#E08E45] h-full rounded-full transition-all"
              style={{ width: `${data.current.occupancy_rate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Noise Level */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#A8A199] mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Acoustic Sound Level</span>
            <Volume2 size={18} className="text-[#818CF8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {data.current.noise_level_db}
            </span>
            <span className="text-sm font-medium text-[#A8A199]">dB (Ambient Buzz)</span>
          </div>
          <p className="text-xs text-[#A8A199] mt-2 truncate">
            🎵 {data.current.music_playlist}
          </p>
        </div>

      </div>

      {/* Seating Zones Heatmap */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Live Seating Zones
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Deep Work Zone</span>
                <span className="badge-emerald text-[10px]">Quiet Nook</span>
              </div>
              <p className="text-xs text-[#A8A199]">
                Ergonomic chairs, noise-dampening acoustic baffles & dedicated power outlets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#10B981] font-bold">{data.current.deep_work_seats_available} open seats</span>
              <span className="text-[#A8A199]">48 dB</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Sunlit Garden Patio</span>
                <span className="badge-amber text-[10px]">Social & Fresh</span>
              </div>
              <p className="text-xs text-[#A8A199]">
                Natural sunlight, outdoor plants, pet-friendly and great for conversations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#F3B27A] font-bold">{data.current.patio_seats_available} open seats</span>
              <span className="text-[#A8A199]">62 dB</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Espresso Bar Counter</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-semibold">Fast Grab</span>
              </div>
              <p className="text-xs text-[#A8A199]">
                High-tops right by the baristas. Great for quick 20-minute standing coffee breaks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white font-bold">{data.current.counter_seats_available} open seats</span>
              <span className="text-[#A8A199]">Barista Chat</span>
            </div>
          </div>

        </div>
      </div>

      {/* Hourly Timeline & Gemini Predictive Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Busyness Curve */}
        <div className="lg:col-span-8 glass-panel p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Hourly Rush & Busyness Rhythm
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {data.hourly_trend.map((h, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  h.hour.includes("11:00")
                    ? 'bg-[#E08E45]/20 border-[#E08E45] shadow-lg shadow-[#E08E45]/15'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="text-xs font-mono font-bold text-white">{h.hour}</div>
                {/* Bar */}
                <div className="h-16 flex items-end justify-center my-2">
                  <div
                    className={`w-6 rounded-t-md transition-all ${
                      h.hour.includes("11:00") ? 'bg-[#E08E45]' : 'bg-white/20'
                    }`}
                    style={{ height: `${h.busyness}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-white">{h.busyness}% fill</div>
                <div className="text-[10px] text-[#A8A199] mt-1 truncate">{h.vibe}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini AI Predictive Visit Window */}
        <div className="lg:col-span-4 glass-panel p-5 flex flex-col justify-between border border-[#E08E45]/30 bg-gradient-to-b from-[#E08E45]/10 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#E08E45]" />
              <h4 className="text-sm font-bold text-white font-serif">Gemini Visit Optimizer</h4>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
                  Best Focus Window
                </span>
                <p className="text-xs font-medium text-white mt-1 leading-relaxed">
                  {data.ai_prediction.best_window_today}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3B27A]">
                  Upcoming Rush Warning
                </span>
                <p className="text-xs font-medium text-white mt-1 leading-relaxed">
                  {data.ai_prediction.rush_alert}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <span className="text-[11px] text-[#A8A199] block leading-tight">
              Aura's predictive engine factors in local foot traffic, past POS ordering rhythms, and live room acoustics.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
