Regulatory Report Assistant

This is a simple full-stack project that processes medical adverse event reports. The backend is built with FastAPI and uses spaCy + some rule-based logic to extract structured information from text. The frontend is built with React, where users can paste a report, process it, and view results.

What it does

Take free-text medical reports

Extract basic fields like:

Drug name

Adverse events

Severity (mild/moderate/severe)

Outcome (recovered/fatal/ongoing)

Save reports to a database (SQLite)

Fetch history of past reports

Translate outcomes into French or Swahili (basic dictionary-based)

Stack used

Backend

Python 3.8+

FastAPI

SQLAlchemy (SQLite DB)

spaCy (NLP)

Uvicorn

Frontend

React

Fetch/Axios for API calls

Optionally Material-UI/Recharts for UI + charts

How to run locally
Backend setup

Go to the backend folder:

cd backend


Create a virtual environment and activate it:

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


If no requirements.txt, just install manually:

pip install fastapi uvicorn sqlalchemy pydantic spacy


Download the spaCy English model:

python -m spacy download en_core_web_sm


Run the server:

uvicorn main:app --reload --port 8000


The API is now at http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

Frontend setup

Go to the frontend folder:

cd frontend


Install dependencies:

npm install


Start the React dev server:

npm start


The app should open on http://localhost:3000.

API routes

POST /process-report → Process a report and return structured fields

GET /reports → Get all saved reports

POST /translate → Translate outcome into French or Swahili

Folder layout
regulatory-assistant/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── reports.db
└── frontend/
    ├── src/
    │   └── App.js
    └── package.json

Deployment notes

Backend: can be deployed with Uvicorn/Gunicorn + Nginx. For DB, SQLite works locally, but for production use PostgreSQL.

Frontend: build with npm run build and host on Vercel, Netlify, or any static host.

Example request
curl -X POST http://127.0.0.1:8000/process-report \
-H "Content-Type: application/json" \
-d '{"report": "Patient experienced severe nausea after taking Drug X. Patient recovered."}'


Response:

{
  "drug": "Drug X",
  "adverse_events": ["nausea"],
  "severity": "severe",
  "outcome": "recovered"
}
