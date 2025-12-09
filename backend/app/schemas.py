from pydantic import BaseModel
from typing import List, Optional, Any


class LabValue(BaseModel):
    name: str
    value: str
    range: str
    status: str


class Medication(BaseModel):
    name: str
    dose: str
    frequency: str


class RiskFlag(BaseModel):
    category: str
    level: str
    message: str


class AnalysisResponse(BaseModel):
    lab_values: List[LabValue] = []
    diagnoses: List[str] = []
    medications: List[Medication] = []
    instructions: List[str] = []
    risk_flags: List[RiskFlag] = []
    explanation: str
    diet_recommendations: List[str] = []
    lifestyle_recommendations: List[str] = []
    followup_tests: List[str] = []
    general_recommendations: List[str] = []
    questions_for_doctor: List[str] = []


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None
    report_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


class TranslateRequest(BaseModel):
    result: dict
    target_language: str
