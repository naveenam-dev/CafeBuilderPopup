import React, { useState, useEffect } from 'react';
import { BarChart3, Sparkles, Volume2, Clock, Check, AlertCircle, Heart, RefreshCw, Send } from './Icons';

export default function StaffPulse({ activeOrders = [] }) {
  const [pulseData, setPulseData] = useState({
    room_telemetry: {
      overall_sentiment_score: 91,
      sentiment_label: "High Vibrancy & Comfort",
      ambient_noise_db: 54,
      ambient_noise_label: "Mellow Library Buzz",
      indoor_temp_f: 71,
      order_queue_depth: 3,
      avg_prep_time_min: 4.2
    },
    feedback_stream: [
      { id: "fb-1", time: "10:15 AM", table: "Table 4", rating: 5, comment: "Wi-Fi is super fast today, love the calm jazz playlist.", sentiment: "Positive", aspect: "Ambiance" },
      { id: "fb-2", time: "10:30 AM", table: "Table 1", rating: 5, comment: "Oat flat white was silky and warm! Truly specialty grade.", sentiment: "Positive", aspect: "Quality" },
      { id: "fb-3", time: "10:45 AM", table: "Table 8", rating: 3, comment: "The AC vent near window 3 is a bit chilly.", sentiment: "Neutral", aspect: "Comfort", action: "Adjust South Louver +1°F" },
    ],
    ai_ops_insights: [
      { priority: "Tip", message: "Deep Work zone is reaching 85% capacity. Suggest guiding solo laptops to Counter High-Tops.", action: "Floor Signage" },
      { priority: "Action", message: "Table 8 noted chilly AC breeze. Barista recommendation: adjust South louvers +1°F.", action: "HVAC Auto-Tune" },
      { priority: "Praise", message: "Oat flat whites received 3 consecutive 5-star quality marks this morning!", action: "Celebrate Team" }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [simTable, setSimTable] = useState('Table 5');
  const [simRating, setSimRating] = useState(5);
  const [simComment, setSimComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Live order tickets state
  const [tickets, setTickets] = useState([
    { id: "TK-408", table: "Table 4", items: ["Oat Flat White", "Artisanal Croissant"], time: "2 min ago", status: "Brewing" },
    { id: "TK-409", table: "Table 2", items: ["Ceremonial Matcha Latte"], time: "1 min ago", status: "Queued" },
    { id: "TK-410", table: "Patio 7", items: ["Nitro Cold Brew", "Chia Bowl"], time: "Just now", status: "Queued" }
  ]);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ops/pulse');
      const data = await res.json();
      if (data && data.room_telemetry) {
        setPulseData(data);
      }
    } catch (e) {
      console.log("Using cached pulse data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  const handleSimulateFeedback = async (e) => {
    e.preventDefault();
    if (!simComment.trim()) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/ops/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: simTable,
          rating: simRating,
          comment: simComment
        })
      });
      const data = await res.json();
      if (data && data.entry) {
        setPulseData(prev => ({
          ...prev,
          feedback_stream: [data.entry, ...prev.feedback_stream]
        }));
        setSimComment('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const markTicketReady = (ticketId) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: "Ready for Pickup!" } : t));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <span className="badge-emerald mb-2">Understand The Room</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-2">
            Café Ops & Sentiment Command Center
          </h2>
          <p className="text-xs sm:text-sm text-[#A8A199] mt-1">
            Real-time room sentiment radar, live customer feedback telemetry, and Gemini barista directives
          </p>
        </div>
        <button
          onClick={fetchPulse}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Ops Telemetry</span>
        </button>
      </div>

      {/* 4 Sensor Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sentiment Index */}
        <div className="glass-panel p-4 border border-[#10B981]/30 bg-gradient-to-br from-[#10B981]/10 to-transparent">
          <div className="flex items-center justify-between text-xs text-[#A8A199] mb-1">
            <span className="font-semibold uppercase tracking-wider">Room Sentiment</span>
            <Heart size={16} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono">
              {pulseData.room_telemetry.overall_sentiment_score}%
            </span>
            <span className="text-xs text-[#34D399] font-semibold">Positive</span>
          </div>
          <p className="text-[11px] text-[#FAF5EF]/70 mt-1 truncate">
            {pulseData.room_telemetry.sentiment_label}
          </p>
        </div>

        {/* Ambient Acoustics */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-[#A8A199] mb-1">
            <span className="font-semibold uppercase tracking-wider">Sound Meter</span>
            <Volume2 size={16} className="text-[#818CF8]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono">
              {pulseData.room_telemetry.ambient_noise_db}
            </span>
            <span className="text-xs text-[#A8A199]">dB</span>
          </div>
          <p className="text-[11px] text-[#FAF5EF]/70 mt-1 truncate">
            {pulseData.room_telemetry.ambient_noise_label}
          </p>
        </div>

        {/* Climate Comfort */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-[#A8A199] mb-1">
            <span className="font-semibold uppercase tracking-wider">Room Comfort</span>
            <span className="text-xs text-[#E08E45]">71°F</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono">71°</span>
            <span className="text-xs text-[#10B981] font-semibold">Optimal</span>
          </div>
          <p className="text-[11px] text-[#FAF5EF]/70 mt-1">
            Humidity 44% • AC Zone 2 Stable
          </p>
        </div>

        {/* Barista Pacing */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-[#A8A199] mb-1">
            <span className="font-semibold uppercase tracking-wider">Prep Pacing</span>
            <Clock size={16} className="text-[#E08E45]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono">
              {pulseData.room_telemetry.avg_prep_time_min}
            </span>
            <span className="text-xs text-[#A8A199]">min / ticket</span>
          </div>
          <p className="text-[11px] text-[#FAF5EF]/70 mt-1">
            {tickets.length} Active Orders in queue
          </p>
        </div>

      </div>

      {/* Gemini Proactive Directives for Staff */}
      <div className="glass-panel p-5 border border-[#E08E45]/30 bg-gradient-to-r from-[#E08E45]/10 via-transparent to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#E08E45]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Gemini Proactive Directives for Café Staff
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pulseData.ai_ops_insights.map((ins, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    ins.priority === 'Action' ? 'bg-[#F43F5E]/20 text-[#FDA4AF]' :
                    ins.priority === 'Tip' ? 'bg-[#E08E45]/20 text-[#F3B27A]' : 'bg-[#10B981]/20 text-[#34D399]'
                  }`}>
                    {ins.priority}
                  </span>
                  <span className="text-[11px] text-[#A8A199] font-medium">{ins.action}</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  {ins.message}
                </p>
              </div>
              <button className="mt-3 text-[11px] text-[#E08E45] hover:text-[#F3B27A] font-semibold text-left flex items-center gap-1">
                <Check size={12} /> Acknowledge Action
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Real-time Feedback Stream vs Live Kitchen Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Feedback Telemetry Stream & Live Test Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Customer Sentiment & Feedback Stream
            </h3>
            <span className="text-xs text-[#A8A199]">Live Gemini Telemetry</span>
          </div>

          {/* Feedback Test Input Form for Judges */}
          <form onSubmit={handleSimulateFeedback} className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#FAF5EF]">
              <span className="font-semibold text-[#E08E45]">Submit Live Guest Feedback (Test with Gemini):</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#A8A199]">Table:</span>
                <select
                  value={simTable}
                  onChange={(e) => setSimTable(e.target.value)}
                  className="bg-white/10 rounded px-1.5 py-0.5 text-xs text-white"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 4">Table 4 (Deep Work)</option>
                  <option value="Table 5">Table 5</option>
                  <option value="Patio 7">Patio 7</option>
                </select>
                <span className="text-[11px] text-[#A8A199]">Rating:</span>
                <select
                  value={simRating}
                  onChange={(e) => setSimRating(Number(e.target.value))}
                  className="bg-white/10 rounded px-1.5 py-0.5 text-xs text-white"
                >
                  <option value={5}>5 ★</option>
                  <option value={4}>4 ★</option>
                  <option value={3}>3 ★</option>
                  <option value={2}>2 ★</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={simComment}
                onChange={(e) => setSimComment(e.target.value)}
                placeholder="e.g., 'Amazing coffee, but could you turn the AC down a notch?'"
                className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#E08E45]"
              />
              <button
                type="submit"
                disabled={submittingFeedback || !simComment.trim()}
                className="btn-amber text-xs py-2 px-3 shrink-0"
              >
                {submittingFeedback ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Send</span>
              </button>
            </div>
          </form>

          {/* Feedback Stream List */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {pulseData.feedback_stream.map((fb) => (
              <div key={fb.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{fb.table}</span>
                    <span className="text-xs text-[#F3B27A]">{'★'.repeat(fb.rating)}</span>
                    <span className="text-[10px] text-[#A8A199]">{fb.time}</span>
                  </div>
                  <p className="text-xs text-[#FAF5EF]/90 leading-relaxed">
                    "{fb.comment}"
                  </p>
                  {fb.action && (
                    <div className="text-[11px] text-[#E08E45] font-medium flex items-center gap-1 mt-1">
                      <Sparkles size={12} /> Auto-Assigned Action: {fb.action}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    fb.sentiment === 'Positive' ? 'bg-[#10B981]/20 text-[#34D399]' :
                    fb.sentiment === 'Neutral' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {fb.sentiment}
                  </span>
                  <span className="block text-[10px] text-[#A8A199] mt-1">{fb.aspect || 'Feedback'}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Live Kitchen Order Tickets (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Live Barista Queue
            </h3>
            <span className="badge-amber text-xs">{tickets.length} Active</span>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {tickets.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#E08E45]">{t.id}</span>
                    <span className="text-xs font-semibold text-white">{t.table}</span>
                  </div>
                  <span className="text-[11px] text-[#A8A199]">{t.time}</span>
                </div>

                <div className="text-xs text-[#FAF5EF]/90 pl-1 border-l-2 border-[#E08E45]/50 space-y-0.5">
                  {t.items.map((it, idx) => (
                    <div key={idx} className="font-medium">• {it}</div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className={`text-[11px] font-semibold ${
                    t.status.includes('Ready') ? 'text-[#10B981]' : 'text-[#F3B27A]'
                  }`}>
                    Status: {t.status}
                  </span>
                  {!t.status.includes('Ready') && (
                    <button
                      onClick={() => markTicketReady(t.id)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-medium transition-all"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
