import os
import re
import json
import base64
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # supports text + images

app = FastAPI(title="Multimodal Construction Intelligence Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """
You are an expert AI Construction Assistant inside an intelligent platform.
Always reply with ONE valid JSON object that follows the schema given in the
user message. Do not write any text, markdown or code fences outside the JSON.
Give practical, safety-compliant, India-focused advice. All money values are in
Indian Rupees (INR) and must be returned as plain numbers (no symbols, no commas).
You assist engineers and site managers; you do not replace professional judgment.
"""

# ---------------------------------------------------------------------------
# JSON schemas. The "defaults" of every feature are BOTH the format we ask the
# AI to follow AND the safe fallback values if the AI forgets a key.
# ---------------------------------------------------------------------------
SCHEMAS = {
    "safety": {
        "name": "FEATURE 1 - AI CONSTRUCTION SITE SAFETY MONITOR",
        "rules": "Check worker position near hazards, PPE, scaffolding, "
                 "elevated work, debris, open edges and lighting. "
                 "risk_level must be one of: Low, Moderate, High, Critical.",
        "defaults": {
            "risk_level": "Unknown",
            "summary": "",
            "hazards": [],
            "missing_ppe": [],
            "recommended_ppe": [],
            "osha_standards": [],
            "corrective_actions": [],
        },
    },
    "crack": {
        "name": "FEATURE 2 - STRUCTURAL CRACK DETECTION",
        "rules": "Classify the crack (hairline, vertical, diagonal, structural) "
                 "and severity (Minor, Moderate, Severe). Give likely causes "
                 "such as settlement or load stress.",
        "defaults": {
            "crack_type": "Unknown",
            "severity": "Unknown",
            "summary": "",
            "probable_causes": [],
            "risks": [],
            "repair_methods": [],
            "preventive_measures": [],
        },
    },
    "planner": {
        "name": "FEATURE 3 - CONSTRUCTION PROJECT PLANNER",
        "rules": "Use standard thumb rules and city based rates. Materials: "
                 "cement in bags, sand and aggregate in cubic feet, steel in "
                 "kg, bricks in numbers. Costs in INR. schedule is a list of "
                 "objects with keys phase, duration and tasks (a list).",
        "defaults": {
            "summary": "",
            "materials": {
                "cement_bags": 0,
                "sand_cft": 0,
                "aggregate_cft": 0,
                "steel_kg": 0,
                "bricks": 0,
            },
            "cost": {
                "materials": 0,
                "labour": 0,
                "finishing": 0,
                "total": 0,
            },
            "schedule": [],
        },
    },
    "valuation": {
        "name": "FEATURE 4 - REAL ESTATE VALUATION",
        "rules": "Give an indicative Indian market value range, price per "
                 "square foot, monthly rent, ROI percent per year and an "
                 "appreciation outlook. All numbers in INR.",
        "defaults": {
            "estimated_value_min": 0,
            "estimated_value_max": 0,
            "price_per_sqft": 0,
            "monthly_rent": 0,
            "roi_percent": 0,
            "appreciation_outlook": "",
            "summary": "",
        },
    },
    "chatbot": {
        "name": "FEATURE 5 - CONSTRUCTION CHATBOT",
        "rules": "Answer the query concisely with actionable advice. "
                 "Put the answer in reply (plain text) and 2-3 short "
                 "follow-up ideas in action_suggestions.",
        "defaults": {
            "reply": "",
            "action_suggestions": [],
        },
    },
    "site": {
        "name": "FEATURE 6 - DAILY SITE ASSISTANT",
        "rules": "Turn the daily inputs into a short, practical action plan "
                 "for the site engineer.",
        "defaults": {
            "tasks": [],
            "materials_equipment": [],
            "safety_checks": [],
            "risk_alerts": [],
        },
    },
    "weather": {
        "name": "FEATURE 7 - WEATHER ADVISORY",
        "rules": "decision must be exactly one of: GO, PROCEED WITH CAUTION, "
                 "NO-GO.",
        "defaults": {
            "decision": "PROCEED WITH CAUTION",
            "reason": "",
            "risks": [],
            "precautions": [],
        },
    },
    "knowledge": {
        "name": "FEATURE 8 - CONSTRUCTION KNOWLEDGE ASSISTANT",
        "rules": "category is Safety, Technique or SOP. Produce a clear "
                 "explanation or a short document with key points.",
        "defaults": {
            "title": "",
            "content": "",
            "key_points": [],
        },
    },
}


def clean(value, default):
    """Force `value` to have the same type and shape as `default`."""
    if isinstance(default, dict):
        value = value if isinstance(value, dict) else {}
        return {k: clean(value.get(k), d) for k, d in default.items()}
    if isinstance(default, list):
        if value is None or value == "":
            return []
        return value if isinstance(value, list) else [value]
    if isinstance(default, (int, float)):
        try:
            return float(value)
        except (TypeError, ValueError):
            return default
    return default if value is None else str(value)


def extract_json(raw):
    """Parse JSON even if the model wrapped it in extra text."""
    try:
        return json.loads(raw)
    except Exception:
        match = re.search(r"\{.*\}", raw or "", re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return {}


async def query_ai(key: str, inputs: dict, image: Optional[UploadFile] = None):
    """One central function used by every feature."""
    schema = SCHEMAS[key]
    defaults = schema["defaults"]

    text = (
        f"ACTIVATE FEATURE: {schema['name']}\n"
        f"GUIDELINES: {schema['rules']}\n"
        f"RETURN JSON WITH EXACTLY THESE KEYS (same types):\n"
        f"{json.dumps(defaults, indent=2)}\n"
        f"INPUT DATA:\n"
    )
    for k, v in inputs.items():
        text += f"{k}: {v}\n"

    content = [{"type": "text", "text": text}]
    if image is not None:
        raw = await image.read()
        if raw:
            b64 = base64.b64encode(raw).decode("utf-8")
            mime = image.content_type or "image/jpeg"
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{b64}"},
            })

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": content},
    ]

    result, error = {}, None
    try:
        try:
            completion = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2,
            )
        except Exception:
            # Retry without JSON mode; extract_json() will still find the JSON
            completion = client.chat.completions.create(
                model=MODEL, messages=messages, temperature=0.2
            )
        result = extract_json(completion.choices[0].message.content)
    except Exception as exc:
        error = str(exc)

    data = clean(result, defaults)  # guarantees every key exists
    if error:
        data["error"] = error
    return data


# ------------------------------- ROUTES ------------------------------------
@app.get("/")
def health():
    return {"status": "ok", "service": "Construction AI backend"}


@app.post("/api/safety-monitor")
async def safety_monitor(
    text: str = Form(""),
    image: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
):
    inputs = {"text": text or "No description given"}
    if document is not None:
        inputs["document_name"] = document.filename
    return await query_ai("safety", inputs, image)


@app.post("/api/crack-detection")
async def crack_detection(
    text: str = Form(""),
    image: Optional[UploadFile] = File(None),
):
    inputs = {"text": text or "No description given"}
    return await query_ai("crack", inputs, image)


@app.post("/api/project-planner")
async def project_planner(desc: str = Form(...)):
    return await query_ai("planner", {"project_description": desc})


@app.post("/api/real-estate-valuation")
async def real_estate_valuation(
    location: str = Form(...),
    area: str = Form(...),
    property_type: str = Form("Residential"),
    building_age: str = Form("0"),
    amenities: str = Form("None"),
):
    inputs = {
        "location": location,
        "area_sqft": area,
        "property_type": property_type,
        "building_age_years": building_age,
        "amenities": amenities,
    }
    return await query_ai("valuation", inputs)


class ChatRequest(BaseModel):
    query: str


@app.post("/api/chatbot")
async def construction_chatbot(req: ChatRequest):
    res = await query_ai("chatbot", {"query": req.query})
    if not res["reply"]:
        res["reply"] = "I could not generate an answer. Please rephrase."
    if not res["action_suggestions"]:
        res["action_suggestions"] = ["Review site safety", "Check blueprints"]
    return res


class SiteAssistantRequest(BaseModel):
    activity: str
    labour_count: int = 1
    site_condition: str = "Normal"


@app.post("/api/site-assistant")
async def site_assistant(req: SiteAssistantRequest):
    return await query_ai("site", req.model_dump())


class WeatherRequest(BaseModel):
    activity: str
    weather: str


@app.post("/api/weather-advisor")
async def weather_advisor(req: WeatherRequest):
    return await query_ai("weather", req.model_dump())


@app.post("/api/knowledge")
async def knowledge(category: str = Form("Safety"), query: str = Form(...)):
    return await query_ai("knowledge", {"category": category, "query": query})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
