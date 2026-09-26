# Aura Café — The Ambient AI Café Companion
> **Google Cloud — Builder Pop-Up Hackathon Solution**  
> *Smarter Ordering • Better Waits • Mood Discovery • Café Connect • Room Sentiment Pulse*

---

## 🌟 Overview & Problem Statement
Cafés are places to work, meet, connect, and unwind. **Aura Café** is a full-stack dual-sided application powered by **Google Gemini** that elevates the café experience for both guests and café operations teams.

---

## 🚀 The 5 Core Pillars Built

### 1. ☕ Smarter Ordering (AI Barista)
- **Natural Voice & Conversational Ordering**: Multi-turn conversational ordering powered by **Google Gemini 3.8 Flash** with Web Speech API integration.
- **Item Breakdown & Customization Extraction**: Automatically parses milk choices (oat, almond, whole), temperatures, sweetness levels, and syrups.
- **Dynamic Digital Ticket**: Computes subtotal, taxes, live order prep time estimate, and smart upsell pairing recommendations.

### 2. ✨ Discovery Engine (Mood & Work-Mode Sommelier)
- **Scientifically Curated Pairings**: Recommends the optimal beverage + brain fuel food pairing based on current mood (*Deep Focus Flow*, *High Energy Sprint*, *Creative Spark*, *Stress Reset*) and work session intent.
- **Cognitive & Nutritional Rationale**: Factors in L-theanine vs caffeine spikes, slow-release carbs, and dietary preferences (Dairy-free, Vegan, Gluten-conscious).
- **Barista Secret Tips & Seating Nook**: Recommends the optimal in-café zone (e.g. Quiet Deep Work Nook with power outlets).

### 3. 🕒 Better Waits (Live Vibe & Wait Forecaster)
- **Real-Time Telemetry**: Live order queue wait times, café seating fill percentage, and ambient acoustic levels (dB).
- **Zone Heatmap**: Live availability for *Deep Work Zone*, *Sunlit Patio*, and *Espresso Bar Counter*.
- **Gemini Visit Optimizer**: Anticipates rush hours and forecasts the best time windows for focused work.

### 4. 👥 Café Connect (Table Buddy & Icebreaker Matchmaker)
- **Serendipitous Networking**: Patrons can opt-in to share tables and connect with fellow creators, developers, and founders.
- **Gemini Synergy Scoring**: Matches users based on skills, shared interests, and today's work goals.
- **Natural Icebreakers**: Gemini generates personalized, low-pressure conversation starters tailored to their interests and coffee orders.

### 5. 📊 Understand The Room (Staff Ops & Sentiment Pulse)
- **Live Room Sentiment Gauge**: Real-time customer satisfaction score with comfort and acoustic monitors.
- **Gemini Proactive Directives**: Actionable staff guidance (e.g. *Adjust South Louver AC +1°F*, *Direct solo laptops to Counter High-Tops*).
- **Interactive Feedback Stream**: Customers submit live ratings & feedback; Gemini analyzes sentiment and auto-assigns barista action items.
- **Live Kitchen Order Queue**: Kitchen display system with live ticket status progression (*Queued -> Brewing -> Ready*).

---

## 🛠️ Architecture & Tech Stack

```
Code/
├── backend/
│   ├── app.py                # FastAPI server with Google Gemini endpoints & static file hosting
│   ├── requirements.txt      # fastapi, uvicorn, requests, python-dotenv, pydantic
│   ├── test_endpoints.py     # Endpoint verification test suite
│   ├── .env                  # API Key configuration
│   └── .env.example
├── frontend/
│   ├── static/
│   │   └── index.html        # Complete React 18 frontend with dark-mode glassmorphism UI
│   └── src/                  # React modular component source code
└── backend_venv/             # Isolated Python virtual environment
```

- **Backend**: Python 3.14 + FastAPI + Uvicorn
- **AI Engine**: Google Gemini API (`gemini-3.8-flash`)
- **Frontend**: React 18 + Tailwind CSS + Custom SVG Icons + Web Speech API
- **Deployment / Serving**: FastAPI unified static & API mount at `http://127.0.0.1:8000`

---

## ⚡ Quick Start

### 1. Launch the Application
In your terminal, run:
```bash
backend_venv\Scripts\python.exe -m uvicorn backend.app:app --port 8000 --host 127.0.0.1 --reload
```
Open **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** in Google Chrome or any modern browser.

### 2. Configure Your Google Gemini API Key
You can configure your key in two easy ways:
1. **In the Web App**: Click the **"Configure Gemini"** badge at the top right of the navbar and enter your key. It connects and validates instantly!
2. **In `.env`**: Set `GEMINI_API_KEY=AIzaSy...` in `backend/.env`.

*(Note: The app includes intelligent demo simulation so all features can be presented seamlessly even if an API key is not yet set!)*
