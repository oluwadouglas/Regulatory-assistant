Regulatory Report Assistant

This is a simple application for processing and analyzing medical adverse event reports. The system takes free-text medical reports and extracts useful information such as drug names, adverse events, severity, and outcomes. It also provides translation support and a simple analytics dashboard.

Features

Submit a medical report in plain text and get back structured results.

Extracts:

Drug name(s)

Adverse events (e.g., nausea, headache)

Severity level

Patient outcome

Translate outcomes into French or Swahili.

Dashboard with charts showing trends and statistics.

History of past reports for easy review.

Technologies

Backend: Python, FastAPI, SQLite, spaCy (for NLP)

Frontend: React, Material UI, Recharts

Server: Uvicorn (development), can use Nginx/Gunicorn for production

Getting Started
Backend

Go into the backend folder:

cd backend


Create a virtual environment:

python -m venv venv
source venv/bin/activate   # For Windows: venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Download the spaCy English model:

python -m spacy download en_core_web_sm


Run the server:

uvicorn main:app --reload --port 5000


Open: http://localhost:5000/docs
 for API docs.

Frontend

Go into the frontend folder:

cd frontend


Install npm dependencies:

npm install


Start the frontend:

npm start


Open: http://localhost:3000

API Quick Reference

POST /process-report → analyze a medical report

GET /reports → fetch all past reports

POST /translate → translate text to French or Swahili

