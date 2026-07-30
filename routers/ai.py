from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter(prefix="/ai", tags=["AI"])

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    content: str
    suggestions: List[str]

# Expanded Medical Knowledge Base (Simulated)
MEDICAL_KB = {
    "headache": {
        "analysis": "Based on your description, this sounds like a tension headache, which is common among students due to academic stress or prolonged screen time.",
        "advice": "Ensure you are staying hydrated (2-3L of water daily) and practicing the 20-20-20 rule for eye strain.",
        "treatment": "For temporary relief, you might consider over-the-counter options like Paracetamol (Acetaminophen) or Ibuprofen, following the dosage on the label.",
        "urgency": "Low"
    },
    "fever": {
        "analysis": "A fever indicates your immune system is responding to an underlying cause, likely a viral infection or flu.",
        "advice": "Monitor your temperature regularly. Rest is critical for recovery.",
        "treatment": "Paracetamol (500mg) can help reduce fever. If temperature exceeds 102°F (39°C), please visit the campus clinic immediately.",
        "urgency": "Moderate"
    },
    "cold": {
        "analysis": "Your symptoms are consistent with the common cold (rhinovirus).",
        "advice": "Steam inhalation and saline nasal sprays can help with congestion.",
        "treatment": "Antihistamines (like Cetirizine) for runny nose, or decongestants like Phenylephrine can be helpful. Lozenges can soothe a sore throat.",
        "urgency": "Low"
    },
    "stress": {
        "analysis": "Academic stress and burnout can manifest as physical symptoms like fatigue, insomnia, or muscle tension.",
        "advice": "Consider mindfulness exercises or visiting the campus counseling center.",
        "treatment": "Magnesium supplements are sometimes used for muscle relaxation, but lifestyle changes are most effective.",
        "urgency": "Low"
    },
    "acid": {
        "analysis": "This sounds like acid reflux or gastritis, possibly due to irregular meal timings or spicy food.",
        "advice": "Avoid lying down immediately after eating. Try smaller, frequent meals.",
        "treatment": "Antacids like Gaviscon or Omeprazole (if persistent) are commonly used to neutralize stomach acid.",
        "urgency": "Moderate"
    }
}

GENERAL_RESPONSES = [
    "I'm here to help. Could you tell me more about any other symptoms you're experiencing?",
    "That's noted. Have you had a chance to check your temperature or blood pressure recently?",
    "I'm analyzing your input. It would be helpful to know how long you've been feeling this way.",
    "I see. Are there any known allergies or medications you are currently taking?"
]

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    last_user_msg = request.messages[-1].content.lower()
    
    # Simple logic to find best match
    best_match = None
    for key in MEDICAL_KB:
        if key in last_user_msg:
            best_match = MEDICAL_KB[key]
            break
    
    if best_match:
        content = f"{best_match['analysis']} {best_match['advice']} {best_match['treatment']} \n\n*Disclaimer: I am an AI, not a doctor. Always consult a professional before taking medication.*"
        suggestions = ["Book Clinic Appointment", "Check Symptom History", "Emergency SOS"]
    else:
        content = random.choice(GENERAL_RESPONSES)
        suggestions = ["Check for Fever", "Headache Relief", "Stress Management"]

    return ChatResponse(
        content=content,
        suggestions=suggestions
    )

# Keeping the old endpoint for compatibility if needed
class SymptomRequest(BaseModel):
    symptoms: str

class SymptomResponse(BaseModel):
    insights: str
    recommendation: str
    disclaimer: str

@router.post("/symptom-check", response_model=SymptomResponse)
async def symptom_check(request: SymptomRequest):
    symptoms_lower = request.symptoms.lower()
    # Reuse the logic above for consistency
    found = None
    for key in MEDICAL_KB:
        if key in symptoms_lower:
            found = MEDICAL_KB[key]
            break
            
    if found:
        return SymptomResponse(
            insights=found['analysis'],
            recommendation=f"{found['advice']} {found['treatment']}",
            disclaimer="Disclaimer: This AI Assistant is for informational purposes only and is not a substitute for professional medical advice."
        )
    
    return SymptomResponse(
        insights="I couldn't identify specific symptoms.",
        recommendation="Please consult with a campus doctor.",
        disclaimer="Disclaimer: Educational information only."
    )

@router.post("/extract-id")
async def extract_id_scan(file: UploadFile = File(...)):
    # Mock AI extraction for student ID scan
    return {
        "name": "Jane Student",
        "department": "Computer Science",
        "roll_number": "CS2023001",
        "age": 21,
        "gender": "Female",
        "dob": "2002-05-14",
        "course": "B.Tech",
        "branch": "Software Engineering",
        "university_name": "UniHealth University",
        "university_register_number": "UH-99882211",
        "blood_group": "O+",
        "address": "Campus Hostel Room 402, North Wing",
        "phone": "+1-555-0199"
    }
