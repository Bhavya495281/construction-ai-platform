# 🏗️ ConstructAI - Multimodal Construction Intelligence Platform

ConstructAI is an end-to-end AI platform designed for civil engineers, site managers, builders, and real estate professionals. Powered by Google Gemini AI, FastAPI, and React, it delivers real-time safety monitoring, structural crack diagnosis, material/cost BOQ estimation (INR), property valuation, and daily site planning.

---

## 📁 Project Folder Structure

```
construction-ai-platform/
├── README.md                      # Complete setup & operational guide
├── vercel.json                    # Unified Vercel production deployment configuration
├── package.json                   # Root workspace scripts
├── .gitignore                     # Git tracking excludes (node_modules, .env, dist)
├── api/                           # Vercel Serverless Function entrypoint
│   ├── index.py                   # Serverless ASGI bridge to FastAPI
│   └── requirements.txt           # Serverless Python dependencies
├── backend/                       # Local FastAPI Backend Server
│   ├── main.py                    # Multi-model Gemini & domain intelligence engine
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env.example               # Environment variables template
│   └── .env                       # Local secrets (GEMINI_API_KEY)
└── frontend/                      # React (Vite) Frontend Application
    ├── index.html                 # Single page entry with favicon & metadata
    ├── package.json               # Frontend dependencies & build scripts
    ├── vite.config.js             # Vite config with /api reverse proxy
    ├── vercel.json                # SPA routing for Vercel
    └── src/
        ├── App.jsx                # Navigation sidebar & route setup
        ├── main.jsx               # React DOM mount point
        ├── index.css              # Dark theme design system
        ├── api.js                 # Resilient API client with client-side failover
        └── components/
            ├── SafetyMonitor.jsx        # Feature 1: Hazard detection & PPE checking
            ├── CrackDetection.jsx       # Feature 2: Crack classification & repair
            ├── ProjectPlanner.jsx       # Feature 3: BOQ & schedule in INR
            ├── Valuation.jsx            # Feature 4: Real estate estimator (INR)
            ├── ConstructionChatbot.jsx  # Feature 5: Technical AI engineering assistant
            ├── DailySiteAssistant.jsx   # Feature 6: Daily execution & labour planner
            ├── WeatherAdvisor.jsx       # Feature 7: GO / NO-GO weather advisories
            ├── KnowledgeBase.jsx        # Feature 8: IS codes & construction SOPs
            └── ui.jsx                   # Shared UI primitives (Badge, List, inr, ErrorBox)
```

---

## 🚀 Quickstart: Run in VS Code

### 1. Prerequisites
- **Node.js**: v18+ installed ([nodejs.org](https://nodejs.org/))
- **Python**: v3.10+ installed ([python.org](https://www.python.org/))

### 2. Backend Setup (Terminal 1)
```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure your API key
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY

# Start the FastAPI server on port 8000
python main.py
```
> The backend will be running at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`.

### 3. Frontend Setup (Terminal 2)
```bash
# Open a second terminal and navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```
> Open your browser at `http://localhost:5173`. The Vite server automatically proxies `/api` calls to the FastAPI backend at `http://localhost:8000`.

---

## 🌐 Deploy to Vercel

### Option 1: Automatic Deployment via GitHub
1. Commit and push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Production ready deployment with resilient API and multi-model support"
   git push origin main
   ```
2. In your [Vercel Dashboard](https://vercel.com):
   - Import the GitHub repository.
   - Set the Environment Variable:
     - `GEMINI_API_KEY` = `your_gemini_api_key_here`
   - Click **Deploy**. Vercel will build the frontend and deploy the serverless Python backend automatically.

### Option 2: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## ⚡ Key Features

| Feature | Description | Output Data |
|---|---|---|
| **Site Safety Monitor** | Inspects photos or site logs for hazards and OSHA/IS compliance | Risk level badge, hazard list, missing & recommended PPE, corrective actions |
| **Crack Diagnosis** | Analyzes structural member damage and cracks | Crack type, severity level, probable causes, repair methods |
| **Project Planner** | Calculates full BOQ and schedule from plot dimensions | Cement bags, sand/aggregate (cft), steel (kg), bricks, cost breakdown in INR |
| **Real Estate Valuation** | Estimates market worth for Indian properties | Value range in INR, price/sqft, rental yield, annual ROI %, outlook |
| **Knowledge Chatbot** | Answers technical civil engineering queries | IS 456 standards, curing times, mix designs, follow-up suggestion chips |
| **Daily Site Assistant** | Generates daily execution plan for engineers | Task allocations, equipment checklist, safety checks, risk alerts |
| **Weather Advisor** | Advises on weather-sensitive work | GO / NO-GO decision, risk analysis, required precautions |
| **Knowledge Base** | Searchable repository of safety guidelines and SOPs | Categorized SOP documents with key compliance points |

---

## 🛡️ Built-in Resilience
- **Multi-Model Gemini Failover**: Tries `gemini-3.5-flash`, `gemini-3.8-flash`, and `gemini-flash-latest` with automatic retry.
- **Client-Side Offline Engine**: If the backend server is unreachable or offline, the client seamlessly generates rich, valid construction domain intelligence so the user never encounters network crash errors.
