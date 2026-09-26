import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Mic, MicOff, Send, Sparkles, Check, Flame, Clock } from './Icons';

export default function VoiceBarista({ onOrderPlaced }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'aura',
      text: "Good morning! I'm Aura, your AI Barista powered by Google Gemini. Tell or speak what you're craving today, including any milk preferences, temperatures, or pastries!",
      items: [],
      upsell: "Try pairing with our freshly baked Artisanal Almond Croissant!"
    }
  ]);
  const [currentOrder, setCurrentOrder] = useState({
    items: [
      { name: "Oat Flat White", customization: "Velvety microfoam, single origin", price: 5.50, quantity: 1 }
    ],
    prepTime: 4,
    upsell: "Artisanal Croissant (Warmed with French butter)"
  });
  const [orderSent, setOrderSent] = useState(false);

  const recognitionRef = useRef(null);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendOrder(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition isn't supported in this browser. Please use Chrome or type your order below!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendOrder = async (textToSend) => {
    const prompt = textToSend || inputText;
    if (!prompt.trim()) return;

    // Add user message to thread
    const newMsgList = [...messages, { sender: 'user', text: prompt }];
    setMessages(newMsgList);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/barista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversation_history: [] }),
      });
      const data = await res.json();
      
      const auraMsg = {
        sender: 'aura',
        text: data.barista_response,
        items: data.items || [],
        upsell: data.smart_upsell_suggestion
      };
      setMessages([...newMsgList, auraMsg]);

      if (data.items && data.items.length > 0) {
        setCurrentOrder({
          items: data.items,
          prepTime: data.estimated_prep_time_minutes || 4,
          upsell: data.smart_upsell_suggestion
        });
      }
    } catch (err) {
      // Fallback
      setMessages([
        ...newMsgList,
        {
          sender: 'aura',
          text: `One moment! I've noted: "${prompt}". Would you like oat milk or whole milk with that?`,
          items: [{ name: "Custom Beverage", customization: prompt, price: 5.25, quantity: 1 }],
          upsell: "Add a Cardamom Cinnamon Bun for $4.75?"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return currentOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const confirmAndSendOrder = () => {
    setOrderSent(true);
    if (onOrderPlaced) {
      onOrderPlaced(currentOrder);
    }
    setTimeout(() => {
      setOrderSent(false);
    }, 4000);
  };

  const samplePrompts = [
    "I need an oat latte, extra hot, plus something chocolatey",
    "Ceremonial iced matcha with oat milk and honey",
    "Nitro cold brew with a warm cinnamon bun"
  ];

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      
      {/* Left Chat & Voice Interface (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-[650px] glass-panel p-5 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E08E45] to-[#F3B27A] flex items-center justify-center font-bold text-[#0F0E0D]">
                <Coffee size={20} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full ring-2 ring-[#0F0E0D]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                Aura AI Conversational Barista
                <span className="badge-amber text-[10px]">Gemini 2.5 Flash</span>
              </h2>
              <p className="text-xs text-[#A8A199]">Speaks natural coffee customizations & pairings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
                isListening 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-white/5 text-white/80 border-white/10 hover:border-[#E08E45]/40 hover:text-white'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Order'}</span>
            </button>
          </div>
        </div>

        {/* Listening Wave Banner */}
        {isListening && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#E08E45]/20 to-transparent border border-[#E08E45]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="wave-bar" style={{ animationDelay: '0ms' }} />
                <span className="wave-bar" style={{ animationDelay: '150ms' }} />
                <span className="wave-bar" style={{ animationDelay: '300ms' }} />
                <span className="wave-bar" style={{ animationDelay: '450ms' }} />
              </div>
              <span className="text-xs font-medium text-white">Listening to your voice... Speak your order naturally.</span>
            </div>
            <button onClick={toggleListening} className="text-xs text-[#E08E45] hover:underline">Done</button>
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#E08E45] text-white rounded-br-none shadow-md shadow-[#E08E45]/20'
                    : 'bg-white/5 border border-white/10 text-[#FAF5EF] rounded-bl-none'
                }`}
              >
                {m.text}

                {/* Gemini Upsell Chip */}
                {m.upsell && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-start gap-1.5 text-xs text-[#F3B27A]">
                    <Sparkles size={14} className="mt-0.5 shrink-0" />
                    <span><strong className="font-semibold text-white">Pairing Tip:</strong> {m.upsell}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#A8A199] p-2 bg-white/5 rounded-xl w-fit">
              <Sparkles size={14} className="animate-spin text-[#E08E45]" />
              <span>Aura is crafting your order with Gemini...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="pt-2 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[#A8A199] whitespace-nowrap">Try:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendOrder(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#FAF5EF]/80 whitespace-nowrap transition-all"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendOrder();
          }}
          className="pt-2 flex items-center gap-2 border-t border-white/10"
        >
          <input
            type="text"
            placeholder="Type your order (e.g., 'Decaf iced oat latte with 1 pump vanilla')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#E08E45] transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="btn-amber py-2.5 px-4"
          >
            <Send size={16} />
          </button>
        </form>

      </div>

      {/* Right Live Order Slip (5 cols) */}
      <div className="lg:col-span-5 glass-panel p-5 flex flex-col justify-between h-[650px] relative border border-white/15">
        
        <div>
          {/* Slip Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E08E45]">Ticket #408</span>
                <span className="badge-emerald text-[10px]">Live Kitchen Sync</span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif mt-0.5">Your Café Order</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#A8A199] flex items-center gap-1 justify-end">
                <Clock size={13} className="text-[#E08E45]" /> ~{currentOrder.prepTime} mins
              </span>
              <span className="text-[11px] text-[#A8A199]">Table 4 • Deep Work</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="py-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {currentOrder.items.map((it, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{it.name}</span>
                    <span className="text-xs text-[#E08E45] font-mono">x{it.quantity}</span>
                  </div>
                  {it.customization && (
                    <p className="text-xs text-[#A8A199] mt-0.5">{it.customization}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-white font-mono">
                  ${(it.price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Smart Pairing Suggestion Card */}
            {currentOrder.upsell && (
              <div className="p-3 rounded-xl bg-[#E08E45]/10 border border-[#E08E45]/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#F3B27A] flex items-center gap-1">
                    <Sparkles size={13} /> Gemini Smart Recommendation
                  </span>
                  <button 
                    onClick={() => {
                      setCurrentOrder({
                        ...currentOrder,
                        items: [
                          ...currentOrder.items,
                          { name: "Artisanal Croissant", customization: "Warmed with French butter", price: 4.50, quantity: 1 }
                        ]
                      });
                    }}
                    className="text-[11px] text-white bg-[#E08E45] hover:bg-[#C97228] px-2 py-0.5 rounded-md font-medium transition-all"
                  >
                    + Add ($4.50)
                  </button>
                </div>
                <p className="text-xs text-[#FAF5EF]/80">
                  {currentOrder.upsell}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary & Checkout Button */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-[#A8A199]">
            <span>Subtotal</span>
            <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#A8A199]">
            <span>Estimated Local Tax (8%)</span>
            <span className="font-mono text-white">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
            <span className="font-serif">Total Due</span>
            <span className="font-mono text-[#F3B27A] text-lg">${total.toFixed(2)}</span>
          </div>

          {orderSent ? (
            <div className="p-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] flex items-center justify-center gap-2 font-semibold text-sm animate-pulse">
              <Check size={18} />
              <span>Order Dispatched to Barista! Preparing now.</span>
            </div>
          ) : (
            <button
              onClick={confirmAndSendOrder}
              disabled={currentOrder.items.length === 0}
              className="w-full btn-amber justify-center py-3 text-sm mt-3"
            >
              <Coffee size={18} />
              <span>Place Order via Aura AI</span>
            </button>
          )}

          <p className="text-[11px] text-center text-[#A8A199] mt-2">
            Instant digital ticket sync with Barista Command Center
          </p>
        </div>

      </div>

    </div>
  );
}
