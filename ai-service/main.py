from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from typing import Optional

app = FastAPI(title="EMS AI Microservice", version="1.0")

class EmployeeData(BaseModel):
    department: str
    position: str
    years_at_company: float
    satisfaction_score: float
    average_monthly_hours: float
    last_evaluation: float
    salary_level: str

class ChatMessage(BaseModel):
    message: str

class ResumeText(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "AI Microservice is running"}

@app.post("/api/v1/predict-attrition")
def predict_attrition(data: EmployeeData):
    """
    Mock Scikit-Learn Attrition Prediction.
    In a real scenario, we would load a trained joblib model here.
    """
    try:
        # Mock logic based on typical attrition factors
        risk_score = 0.0
        
        if data.satisfaction_score < 0.5:
            risk_score += 0.4
        if data.average_monthly_hours > 250:
            risk_score += 0.3
        if data.salary_level == 'LOW':
            risk_score += 0.15
        if data.years_at_company > 3 and data.last_evaluation < 0.6:
            risk_score += 0.15

        risk_score = min(risk_score, 1.0)
        
        will_leave = risk_score > 0.6
        
        return {
            "attrition_risk_score": risk_score,
            "prediction": "High Risk" if will_leave else "Low Risk",
            "key_factors": [
                "Low satisfaction" if data.satisfaction_score < 0.5 else "",
                "Overworked" if data.average_monthly_hours > 250 else ""
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/chat")
def hr_chatbot(chat: ChatMessage):
    """
    Mock HR Chatbot endpoint using simple rule-based NLP.
    """
    msg = chat.message.lower()
    response = "I am the HR assistant. How can I help you today?"
    
    if "leave" in msg or "vacation" in msg:
        response = "You can apply for leave through the Leave Management module. Make sure to check your available balance first."
    elif "payroll" in msg or "salary" in msg:
        response = "Payslips are automatically generated on the last day of the month. You can download them from the Payroll dashboard."
    elif "attendance" in msg or "hours" in msg:
        response = "Make sure to check in daily. If you miss a check-in, contact your HR admin to adjust your hours."
        
    return {"reply": response}

@app.post("/api/v1/parse-resume")
def parse_resume(resume: ResumeText):
    """
    Mock Resume parsing using basic NLP rules.
    """
    text = resume.text.lower()
    
    skills_found = []
    if "python" in text: skills_found.append("Python")
    if "react" in text: skills_found.append("React")
    if "node" in text: skills_found.append("Node.js")
    if "docker" in text: skills_found.append("Docker")
        
    return {
        "parsed_data": {
            "years_of_experience_estimation": text.count("years") * 2,
            "skills": skills_found,
            "education": "Degree Found" if "university" in text or "bachelor" in text else "Not Specified"
        }
    }
