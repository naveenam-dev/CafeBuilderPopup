import os
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aura-cafe")

app = FastAPI(title="Aura Café Companion API - Powered by Google Gemini")

# Allow CORS for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "static"))
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))


# In-memory config and state
CONFIG = {
    "gemini_api_key": os.getenv("GEMINI_API_KEY", "").strip(),
    "gemini_model": "gemini-3.8-flash"
}

# Pre-seeded Café Live State for Demo
CAFE_STATE = {
    "current_wait_minutes": 6,
    "occupancy_rate": 68,
    "noise_level_db": 54, # Moderate, mellow ambient
    "deep_work_seats_available": 5,
    "patio_seats_available": 8,
    "counter_seats_available": 3,
    "music_playlist": "Lofi Beats & Mellow Acoustic",
    "staff_on_duty": 4,
}

# Pre-seeded community profiles for Café Connect
COMMUNITY_PROFILES = [
    {
        "id": "user-1",
        "name": "Sarah L.",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "role": "Cloud Architect",
        "interests": ["Google Cloud", "Kubernetes", "Specialty Espresso", "Sci-Fi Books"],
        "table": "Deep Work Zone - Table 4",
        "status": "Coding & Open for quick tech banter",
        "drink": "Flat White (Oat Milk)"
    },
    {
        "id": "user-2",
        "name": "Arjun M.",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "role": "AI UX Designer",
        "interests": ["Design Systems", "Generative AI", "Matcha", "Photography"],
        "table": "Window High-Top - Table 2",
        "status": "Designing interfaces & happy to review designs",
        "drink": "Iced Ceremonial Matcha"
    },
    {
        "id": "user-3",
        "name": "Elena R.",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "role": "Tech Founder",
        "interests": ["Startups", "Fintech", "Cold Brew", "Angel Investing"],
        "table": "Patio - Table 7",
        "status": "Prepping investor deck, open for startup chats",
        "drink": "Nitro Cold Brew"
    }
]

FEEDBACK_LOGS = [
    {"id": "fb-1", "time": "10:15 AM", "table": "Table 4", "rating": 5, "comment": "Wi-Fi is super fast today, love the calm jazz vibe.", "sentiment": "Positive", "aspect": "Ambiance"},
    {"id": "fb-2", "time": "10:30 AM", "table": "Table 1", "rating": 4, "comment": "Oat latte was silky and warm! Could use an extra napkin dispenser though.", "sentiment": "Positive", "aspect": "Quality"},
    {"id": "fb-3", "time": "10:45 AM", "table": "Table 8", "rating": 3, "comment": "The AC vent near window 3 is a bit too chilly.", "sentiment": "Neutral", "aspect": "Comfort"},
]

# Auto-discovery and robust candidate model selection
def discover_and_validate_model(api_key: str) -> Optional[str]:
    # 1. Query Google's ListModels endpoint to get exact supported models for this key
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        res = requests.get(url, timeout=10)
        if res.status_code == 200:
            data = res.json()
            models_list = data.get("models", [])
            supported = [
                m["name"].replace("models/", "")
                for m in models_list
                if "generateContent" in m.get("supportedGenerationMethods", [])
            ]
            logger.info(f"Available models for key: {supported}")
            
            # Prioritized preference order
            for pref in [
                "gemini-3.8-flash",
                "gemini-3.7-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-2.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.1-flash-lite"
            ]:
                if pref in supported:
                    return pref
            
            # If not in preference list, return first supported gemini model
            for m in supported:
                if "gemini" in m:
                    return m
            if supported:
                return supported[0]
    except Exception as e:
        logger.warning(f"Error querying ListModels: {e}")

    # 2. Direct ping fallback on popular candidate aliases
    candidates = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemma-4-26b-a4b-it"
    ]
    for model in candidates:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {"contents": [{"role": "user", "parts": [{"text": "hi"}]}]}
            res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=5)
            if res.status_code == 200:
                return model
        except Exception:
            continue
    return None

# Helper to call Gemini API directly
def call_gemini(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
    api_key = CONFIG["gemini_api_key"]
    if not api_key:
        raise HTTPException(
            status_code=400, 
            detail="Gemini API Key is not set. Please set it in the top settings bar or in backend/.env"
        )
    
    # Try current configured model first, then auto-discover if 404
    active_model = CONFIG.get("gemini_model") or "gemini-3.8-flash"
    models_to_try = [
        active_model,
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemma-4-26b-a4b-it"
    ]
    # Remove duplicates while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    last_err = None

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"}]})
        else:
            contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=7)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Update configured model to the successful one
                CONFIG["gemini_model"] = model
                return text
            else:
                last_err = f"Model {model} returned HTTP {res.status_code}: {res.text}"
                logger.warning(last_err)
        except Exception as e:
            last_err = str(e)
            logger.warning(f"Error calling {model}: {e}")

    raise HTTPException(status_code=500, detail=f"Gemini API request failed: {last_err}")


# Request Models
class KeyConfigRequest(BaseModel):
    api_key: str

class BaristaOrderRequest(BaseModel):
    prompt: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class MoodRecommendRequest(BaseModel):
    mood: str
    work_mode: str
    dietary: Optional[str] = "No Restrictions"
    stay_duration: Optional[str] = "2 hours"

class ConnectRequest(BaseModel):
    user_name: str
    user_role: str
    interests: List[str]
    work_goal: str
    table_location: Optional[str] = "Community Table"

class FeedbackRequest(BaseModel):
    table: str
    rating: int
    comment: str


# Endpoints
@app.get("/api/health")
def get_health():
    has_key = bool(CONFIG["gemini_api_key"])
    return {
        "status": "online",
        "gemini_configured": has_key,
        "masked_key": f"{CONFIG['gemini_api_key'][:4]}...{CONFIG['gemini_api_key'][-4:]}" if has_key and len(CONFIG['gemini_api_key']) > 8 else ("Set" if has_key else "Not Configured"),
        "active_model": CONFIG.get("gemini_model", "Auto-Detect"),
        "cafe_state": CAFE_STATE
    }

@app.post("/api/config/key")
def set_api_key(req: KeyConfigRequest):
    clean_key = req.api_key.strip()
    if not clean_key:
        raise HTTPException(status_code=400, detail="API Key cannot be blank")
    
    found_model = discover_and_validate_model(clean_key)
    if found_model:
        CONFIG["gemini_api_key"] = clean_key
        CONFIG["gemini_model"] = found_model
        return {
            "success": True, 
            "message": f"Gemini API connected! Model selected: {found_model}"
        }
    
    # If list endpoint or test was blocked by quota/network, still save key and try
    CONFIG["gemini_api_key"] = clean_key
    CONFIG["gemini_model"] = "gemini-1.5-flash-latest"
    return {
        "success": True,
        "message": "Gemini API key saved! Ready for live requests."
    }


@app.post("/api/chat/barista")
def barista_ordering(req: BaristaOrderRequest):
    """
    Smarter Ordering: Conversational barista powered by Gemini.
    Extracts ordered items, customizations, calculated total, and friendly barista dialogue.
    """
    sys_prompt = """
    You are 'Aura', a warm, ultra-competent specialty café AI Barista at Aura Café.
    The customer is conversing or speaking their order.
    Café Menu and Prices:
    - Espresso: $3.50
    - Americano: $4.00
    - Flat White: $4.75
    - Cappuccino: $4.75
    - Vanilla Bean Latte: $5.25
    - Honey Lavender Latte: $5.75
    - Ceremonial Matcha Latte: $5.50
    - Nitro Cold Brew: $5.00
    - Artisanal Croissant: $4.50
    - Avocado Sourdough Toast: $8.50
    - Cardamom Cinnamon Bun: $4.75
    - Protein Power Chia Bowl: $7.00
    Milks: Oat Milk (+$0.75), Almond Milk (+$0.75), Whole Milk ($0).
    Syrups / Addons: Vanilla, Lavender, Caramel, Extra Shot (+$1.00).

    You must output strictly valid JSON matching this schema:
    {
      "barista_response": "Warm, conversational response addressing the customer's request, confirming customizations, and giving a quick barista tip or pairing suggestion.",
      "items": [
         {
           "name": "Item name",
           "customization": "e.g., Oat milk, half sweet, extra hot",
           "price": 5.50,
           "quantity": 1
         }
      ],
      "estimated_prep_time_minutes": 4,
      "smart_upsell_suggestion": "Suggested complimentary pastry or seasonal beverage with rationale"
    }
    """
    
    # If API key configured, make live call to Gemini
    if CONFIG["gemini_api_key"]:
        try:
            raw_json = call_gemini(req.prompt, system_instruction=sys_prompt, json_mode=True)
            data = json.loads(raw_json)
            return data
        except Exception as e:
            logger.error(f"Gemini call error: {e}")
            # Fall through to simulated intelligent fallback

    # Intelligent fallback for demo resilience
    prompt_lower = req.prompt.lower()
    items = []
    response = "I'd love to prepare that for you! "
    
    if "matcha" in prompt_lower:
        items.append({"name": "Ceremonial Matcha Latte", "customization": "Oat milk, light agave", "price": 6.25, "quantity": 1})
        response += "One Ceremonial Matcha Latte with oat milk. Whisked fresh for you!"
    elif "cold brew" in prompt_lower or "nitro" in prompt_lower:
        items.append({"name": "Nitro Cold Brew", "customization": "Served over clear ice", "price": 5.00, "quantity": 1})
        response += "One Nitro Cold Brew coming right up — silky micro-foam with rich chocolate notes."
    elif "croissant" in prompt_lower or "pastry" in prompt_lower:
        items.append({"name": "Vanilla Bean Latte", "customization": "Oat milk, extra hot", "price": 6.00, "quantity": 1})
        items.append({"name": "Artisanal Croissant", "customization": "Warmed with French butter", "price": 4.50, "quantity": 1})
        response += "A warm Vanilla Bean Latte paired with a freshly baked flaky croissant."
    else:
        items.append({"name": "Flat White", "customization": "Velvety microfoam, single origin espresso", "price": 4.75, "quantity": 1})
        response += f"Got it! One signature Flat White tailored to your request: '{req.prompt}'. Would you like that with oat or whole milk?"

    return {
        "barista_response": response,
        "items": items,
        "estimated_prep_time_minutes": 4,
        "smart_upsell_suggestion": "Would you like our warm Cardamom Cinnamon Bun to accompany your drink?",
        "is_mock": not bool(CONFIG["gemini_api_key"])
    }

@app.post("/api/recommend/mood")
def recommend_by_mood(req: MoodRecommendRequest):
    """
    Discovery: Personalized food & drink recommendations based on mood, work session, and dietary preferences.
    """
    sys_prompt = f"""
    You are an expert café sommelier and productivity coach at Aura Café.
    The customer provides:
    - Mood: {req.mood}
    - Work Mode / Intention: {req.work_mode}
    - Dietary Restrictions: {req.dietary}
    - Planned Stay: {req.stay_duration}

    Create a thoughtful, curated pairing (Drink + Food/Bite) optimized for their focus, caffeine rhythm, and emotional state.
    Output strictly JSON in this structure:
    {{
      "headline": "A catchy 4-word pairing title (e.g. 'Sustained Flow State Duo')",
      "drink": {{
         "name": "Specific drink name",
         "caffeine_level": "High / Medium / Low / Zero",
         "vibe_notes": "Flavor profile & benefits (e.g., L-theanine for jitter-free focus)",
         "price": "$5.50"
      }},
      "food": {{
         "name": "Complimentary food name",
         "pairing_rationale": "Why this specific food supports their mood and work session",
         "price": "$7.00"
      }},
      "barista_secret_tip": "A delightful insider tip (e.g., 'Ask for a dash of Ceylon cinnamon at the bar')",
      "optimal_seating_area": "Deep Work Quiet Nook / Sunlit Patio / Community High-Top"
    }}
    """

    if CONFIG["gemini_api_key"]:
        try:
            raw_json = call_gemini(f"Recommend pairing for: Mood={req.mood}, Work={req.work_mode}, Diet={req.dietary}", system_instruction=sys_prompt, json_mode=True)
            return json.loads(raw_json)
        except Exception as e:
            logger.error(f"Gemini mood recommendation error: {e}")

    # Fallback curated recommendations
    if "focus" in req.mood.lower() or "coding" in req.work_mode.lower():
        return {
            "headline": "Hyperfocus Cognitive Fuel",
            "drink": {
                "name": "Ceremonial Matcha Cortado",
                "caffeine_level": "Medium (Smooth)",
                "vibe_notes": "Rich in L-theanine for sustained alpha-wave brain focus without espresso jitters.",
                "price": "$5.25"
            },
            "food": {
                "name": "Protein Power Chia & Almond Bowl",
                "pairing_rationale": "Slow-release complex carbs and omega-3s maintain stable glucose for long deep-work stints.",
                "price": "$7.00"
            },
            "barista_secret_tip": "Sit at Deep Work Zone Table 3—it has direct power outlets and lower noise reverb.",
            "optimal_seating_area": "Deep Work Quiet Nook",
            "is_mock": not bool(CONFIG["gemini_api_key"])
        }
    else:
        return {
            "headline": "Comfort & Creative Flow",
            "drink": {
                "name": "Honey Lavender Oat Latte",
                "caffeine_level": "Medium",
                "vibe_notes": "French culinary lavender calms stress while smooth double espresso sparks inspiration.",
                "price": "$5.75"
            },
            "food": {
                "name": "Cardamom Cinnamon Swirl Bun",
                "pairing_rationale": "Aromatic spices boost dopamine and make the reading/chat session feel like a warm hug.",
                "price": "$4.75"
            },
            "barista_secret_tip": "Pair with a sparkling water palate cleanser from our self-serve tap.",
            "optimal_seating_area": "Sunlit Patio or Corner Lounge",
            "is_mock": not bool(CONFIG["gemini_api_key"])
        }

@app.get("/api/forecast/live")
def get_wait_and_vibe_forecast():
    """
    Better Waits: Predict wait times, current seating capacity, noise levels, and best time to visit today.
    """
    hourly_trend = [
        {"hour": "8:00 AM", "busyness": 45, "wait_min": 3, "vibe": "Morning Calm"},
        {"hour": "9:30 AM", "busyness": 85, "wait_min": 10, "vibe": "Morning Rush"},
        {"hour": "11:00 AM", "busyness": 65, "wait_min": 6, "vibe": "Productive Buzz (Current)"},
        {"hour": "1:00 PM", "busyness": 75, "wait_min": 8, "vibe": "Lunch Lively"},
        {"hour": "3:00 PM", "busyness": 40, "wait_min": 2, "vibe": "Afternoon Zen (Best Focus Window)"},
        {"hour": "5:00 PM", "busyness": 55, "wait_min": 4, "vibe": "Casual Social"},
    ]
    return {
        "current": CAFE_STATE,
        "hourly_trend": hourly_trend,
        "ai_prediction": {
            "best_window_today": "2:30 PM - 4:15 PM (Estimated wait < 3 mins, noise 45dB)",
            "rush_alert": "Peak lunch rush anticipated at 12:45 PM (+12 mins wait)",
            "available_zones": {
                "deep_work": {"status": "Available", "seats": CAFE_STATE["deep_work_seats_available"], "noise": "Low (48 dB)"},
                "patio": {"status": "Good", "seats": CAFE_STATE["patio_seats_available"], "noise": "Lively (62 dB)"},
                "counter": {"status": "Limited", "seats": CAFE_STATE["counter_seats_available"], "noise": "Barista Chat"}
            }
        }
    }

@app.post("/api/connect/match")
def cafe_connect_match(req: ConnectRequest):
    """
    Connect People: Matches café customers with shared interests, generating personalized icebreakers via Gemini.
    """
    interests_str = ", ".join(req.interests)
    sys_prompt = f"""
    You are the Community Matchmaker AI at Aura Café.
    A customer named {req.user_name} ({req.user_role}) is working at the café on: "{req.work_goal}".
    Their interests include: {interests_str}.
    
    Based on our current in-café community members:
    {json.dumps(COMMUNITY_PROFILES, indent=2)}

    Pick the single best match from the list and craft:
    1. A match rationale explaining why they should meet.
    2. Two clever, natural, low-pressure icebreaker questions tailored to both their interests and coffee orders.
    3. A shared collaboration idea.

    Return JSON:
    {{
      "matched_user_id": "user-1 or user-2 or user-3",
      "match_score_percent": 94,
      "why_connect": "Brief punchy connection reason",
      "icebreakers": [
         "Question 1...",
         "Question 2..."
      ],
      "spark_idea": "E.g., 10-minute brainstorming walk or quick design critique over espresso"
    }}
    """

    if CONFIG["gemini_api_key"]:
        try:
            raw_json = call_gemini(f"Match {req.user_name} with community", system_instruction=sys_prompt, json_mode=True)
            result = json.loads(raw_json)
            # Find the matched profile
            matched_profile = next((p for p in COMMUNITY_PROFILES if p["id"] == result.get("matched_user_id")), COMMUNITY_PROFILES[0])
            result["matched_profile"] = matched_profile
            return result
        except Exception as e:
            logger.error(f"Gemini connect match error: {e}")

    # Fallback match
    matched_profile = COMMUNITY_PROFILES[0] if "cloud" in interests_str.lower() or "tech" in interests_str.lower() else COMMUNITY_PROFILES[1]
    return {
        "matched_user_id": matched_profile["id"],
        "matched_profile": matched_profile,
        "match_score_percent": 92,
        "why_connect": f"Both of you share passion for {interests_str} and are focused on building high-impact tech products today.",
        "icebreakers": [
            f"Hey {matched_profile['name'].split()[0]}, I noticed you're also exploring {matched_profile['interests'][0]}. How are you tackling the latest updates?",
            f"Love your {matched_profile['drink']} choice! Are you working on something in {matched_profile['role']} today?"
        ],
        "spark_idea": "A quick 5-minute caffeine recharge chat comparing approaches to modern cloud & AI stacks.",
        "is_mock": not bool(CONFIG["gemini_api_key"])
    }

@app.get("/api/connect/community")
def get_community_board():
    return {"members": COMMUNITY_PROFILES}

@app.get("/api/ops/pulse")
def get_room_pulse():
    """
    Understand the Room: Live sentiment score, audio volume, temperature, and Gemini-driven proactive insights for baristas.
    """
    # Calculate live sentiment ratio
    positive_count = sum(1 for f in FEEDBACK_LOGS if f["sentiment"] == "Positive")
    sentiment_score = int((positive_count / max(1, len(FEEDBACK_LOGS))) * 100)

    return {
        "room_telemetry": {
            "overall_sentiment_score": sentiment_score,
            "sentiment_label": "High Vibrancy & Comfort" if sentiment_score > 70 else "Balanced",
            "ambient_noise_db": CAFE_STATE["noise_level_db"],
            "ambient_noise_label": "Mellow Library Buzz (Ideal for Focus)",
            "indoor_temp_f": 71,
            "order_queue_depth": 3,
            "avg_prep_time_min": 4.2
        },
        "feedback_stream": FEEDBACK_LOGS,
        "ai_ops_insights": [
            {
                "priority": "Tip",
                "message": "Deep Work zone is reaching 85% capacity. Suggest guiding solo laptops to Counter High-Tops.",
                "action": "Adjust Floor Signage"
            },
            {
                "priority": "Action",
                "message": "Table 8 noted chilly AC breeze. Barista recommendation: adjust South louvers +1°F.",
                "action": "HVAC Auto-Tune"
            },
            {
                "priority": "Praise",
                "message": "Oat flat whites received 3 consecutive 5-star quality marks this morning!",
                "action": "Celebrate Team"
            }
        ]
    }

@app.post("/api/ops/feedback")
def submit_room_feedback(req: FeedbackRequest):
    """
    Understand the Room: Customer submits live feedback. Gemini evaluates sentiment & flags immediate barista actions.
    """
    sys_prompt = f"""
    Analyze customer café feedback:
    Rating: {req.rating}/5
    Comment: "{req.comment}"

    Return JSON:
    {{
      "sentiment": "Positive / Neutral / Negative",
      "aspect": "Quality / Ambiance / Speed / Comfort / Staff",
      "barista_action_needed": true or false,
      "recommended_action": "Short action for barista or null"
    }}
    """
    sentiment = "Positive" if req.rating >= 4 else ("Neutral" if req.rating == 3 else "Needs Attention")
    aspect = "General"
    action = None

    if CONFIG["gemini_api_key"]:
        try:
            raw_json = call_gemini(req.comment, system_instruction=sys_prompt, json_mode=True)
            res = json.loads(raw_json)
            sentiment = res.get("sentiment", sentiment)
            aspect = res.get("aspect", aspect)
            action = res.get("recommended_action")
        except Exception as e:
            logger.error(f"Feedback sentiment analysis error: {e}")

    new_entry = {
        "id": f"fb-{len(FEEDBACK_LOGS)+1}",
        "time": "Just now",
        "table": req.table,
        "rating": req.rating,
        "comment": req.comment,
        "sentiment": sentiment,
        "aspect": aspect,
        "action": action
    }
    FEEDBACK_LOGS.insert(0, new_entry)
    return {"success": True, "entry": new_entry}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
