import requests

base = "http://127.0.0.1:8000"

print("1. Health Endpoint:")
h = requests.get(f"{base}/api/health").json()
print("   Status:", h["status"], "| Model:", h["active_model"])

print("\n2. Conversational Barista:")
b = requests.post(f"{base}/api/chat/barista", json={"prompt": "I'd like an oat flat white and a warm croissant"}).json()
print("   Response:", b.get("barista_response")[:60] + "...")
print("   Items:", [(i["name"], i["price"]) for i in b.get("items", [])])
print("   Upsell Tip:", b.get("smart_upsell_suggestion"))

print("\n3. Mood & Work Discovery:")
m = requests.post(f"{base}/api/recommend/mood", json={"mood": "Deep Focus Flow", "work_mode": "Intense Coding", "dietary": "Dairy-Free", "stay_duration": "2 hours"}).json()
print("   Headline:", m.get("headline"))
print("   Drink:", m.get("drink", {}).get("name"))
print("   Food:", m.get("food", {}).get("name"))

print("\n4. Vibe & Wait Forecaster:")
f = requests.get(f"{base}/api/forecast/live").json()
print("   Current wait:", f["current"]["current_wait_minutes"], "mins")
print("   Occupancy:", f["current"]["occupancy_rate"], "%")
print("   Best window:", f["ai_prediction"]["best_window_today"])

print("\n5. Café Connect (Table Buddy Matchmaker):")
c = requests.post(f"{base}/api/connect/match", json={
    "user_name": "Naveen",
    "user_role": "AI Architect",
    "interests": ["Google Cloud", "Gemini", "Kubernetes"],
    "work_goal": "Hackathon Prototype"
}).json()
print("   Matched with:", c["matched_profile"]["name"], f"({c['matched_profile']['role']})")
print("   Match score:", c["match_score_percent"], "%")
print("   Icebreakers count:", len(c.get("icebreakers", [])))

print("\n6. Understand The Room (Ops & Feedback):")
fb = requests.post(f"{base}/api/ops/feedback", json={
    "table": "Table 4",
    "rating": 5,
    "comment": "Silky smooth flat white and calm music!"
}).json()
print("   Feedback accepted:", fb["success"])
print("   Sentiment scored:", fb["entry"]["sentiment"])
