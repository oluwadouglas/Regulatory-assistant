from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
import spacy
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import requests
import json
from typing import List as TypingList

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# FastAPI app
app = FastAPI(title="Regulatory Report Assistant")

# Allow frontend to access backend - allowing all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schemas
class ReportInput(BaseModel):
    report: str = Field(..., min_length=10, description="The medical report text to process")

class TranslationInput(BaseModel):
    text: str = Field(..., min_length=1, description="Text to translate")
    target_lang: str = Field(..., pattern="^(fr|sw)$", description="Target language code (fr for French, sw for Swahili)")

# Database setup
engine = create_engine("sqlite:///backend/reports.db")
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    drug = Column(String(255))
    adverse_events = Column(Text)  # Store as JSON string
    severity = Column(String(50))
    outcome = Column(String(100))
    created_at = Column(String(50), default=datetime.utcnow().isoformat())
    original_report = Column(Text)

Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Translation function (using LibreTranslate as an example)
def translate_text(text: str, target_lang: str) -> str:
    try:
        # This is a simple example using LibreTranslate's public API
        # In production, you'd want to use a proper translation service with an API key
        if target_lang == "fr":
            # Simple French translation mapping
            translations = {
                "recovered": "rétabli",
                "ongoing": "en cours",
                "fatal": "mortel",
                "mild": "léger",
                "moderate": "modéré",
                "severe": "sévère"
            }
        elif target_lang == "sw":
            # Simple Swahili translation mapping
            translations = {
                "recovered": "amepona",
                "ongoing": "inaendelea",
                "fatal": "kuwa na kifo",
                "mild": "epesi",
                "moderate": "wastani",
                "severe": "kali"
            }
        else:
            return text
            
        return translations.get(text.lower(), text)
    except Exception as e:
        print(f"Translation error: {e}")
        return text

# Helper: process report
def process_report(text: str) -> Dict[str, Any]:
    if not text or not isinstance(text, str):
        raise ValueError("Invalid input text")
        
    doc = nlp(text)
    drug = None
    adverse_events = set()
    severity = None
    outcome = None

    # Rule-based extraction
    for ent in doc.ents:
        if ent.label_ in ["DRUG", "PRODUCT"] and not drug:  # Take first mentioned drug
            drug = ent.text
        if ent.label_ in ["DISEASE", "SYMPTOM"]:
            adverse_events.add(ent.text.lower())

    # Additional patterns and keywords
    text_lower = text.lower()
    
    # Check for common adverse events
    for event in ["nausea", "headache", "dizziness", "rash", "fever", "vomiting", "diarrhea"]:
        if event in text_lower:
            adverse_events.add(event)

    # Determine severity
    if any(word in text_lower for word in ["severe", "intense", "extreme"]):
        severity = "severe"
    elif any(word in text_lower for word in ["moderate", "medium"]):
        severity = "moderate"
    elif any(word in text_lower for word in ["mild", "slight", "minor"]):
        severity = "mild"

    # Determine outcome
    if any(word in text_lower for word in ["recover", "improve", "better", "recovered", "recovery"]):
        outcome = "recovered"
    elif any(word in text_lower for word in ["fatal", "death", "died", "deceased", "passed away", "dead"]):
        outcome = "fatal"
    elif any(word in text_lower for word in ["ongoing", "continuing", "persist", "still ongoing", "not resolved", "symptoms are still ongoing", "symptoms persist", "unresolved"]):
        outcome = "ongoing"

    return {
        "drug": drug or "Not specified",
        "adverse_events": list(adverse_events) if adverse_events else ["None reported"],
        "severity": severity or "Not specified",
        "outcome": outcome or "Unknown"
    }

@app.post("/process-report", response_model=dict, responses={
    200: {"description": "Successfully processed report"},
    400: {"description": "Invalid input"},
    500: {"description": "Internal server error"}
})
def process_report_endpoint(input: ReportInput, db: Session = Depends(get_db)):
    try:
        result = process_report(input.report)
        
        # Save to database
        db_report = Report(
            drug=result["drug"],
            adverse_events=json.dumps(result["adverse_events"]),  # Store as JSON string
            severity=result["severity"],
            outcome=result["outcome"],
            original_report=input.report
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Return the processed result
        return {
            "id": db_report.id,
            "drug": result["drug"],
            "adverse_events": result["adverse_events"],
            "severity": result["severity"],
            "outcome": result["outcome"],
            "created_at": db_report.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports", response_model=List[dict], responses={
    200: {"description": "List of all processed reports"}
})
def get_reports(db: Session = Depends(get_db)):
    try:
        reports = db.query(Report).order_by(Report.id.desc()).all()
        return [
            {
                "id": report.id,
                "drug": report.drug,
                "adverse_events": json.loads(report.adverse_events) if report.adverse_events else [],
                "severity": report.severity,
                "outcome": report.outcome,
                "created_at": report.created_at,
                "original_report": report.original_report[:100] + "..." if report.original_report else ""
            }
            for report in reports
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate", response_model=dict, responses={
    200: {"description": "Translated text"},
    400: {"description": "Invalid input"},
    500: {"description": "Translation error"}
})
def translate_text_endpoint(input: TranslationInput):
    try:
        translated = translate_text(input.text, input.target_lang)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# Root endpoint with API documentation
@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Regulatory Report Assistant API",
        "endpoints": {
            "POST /process-report": "Process a medical report",
            "GET /reports": "Get all processed reports",
            "POST /translate": "Translate text (supports 'fr' and 'sw')"
        },
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
