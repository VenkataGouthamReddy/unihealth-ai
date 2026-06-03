from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class StudentProfile(BaseModel):
    user_id: str
    major: Optional[str] = None
    year: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: List[str] = []

class DoctorProfile(BaseModel):
    user_id: str
    specialization: str
    experience_years: int
    availability: dict = {} # e.g., {"Monday": ["09:00", "10:00"]}
    consultation_fee: float = 0.0

class Appointment(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    student_id: str
    doctor_id: str
    date: str # YYYY-MM-DD
    time: str # HH:MM
    status: str = "scheduled" # scheduled, completed, cancelled
    symptoms: str = ""
    created_at: datetime = datetime.utcnow()

class Prescription(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    appointment_id: str
    doctor_id: str
    student_id: str
    medicines: List[dict] # [{"name": "Aspirin", "dosage": "1 tablet", "frequency": "twice a day"}]
    notes: str = ""
    created_at: datetime = datetime.utcnow()

class Alert(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    student_id: str
    name: str
    date: str
    time: str
    type: str # Medicine, Meditation, Hydration, Exercise
    repeat: str # None, Daily, Weekly, Monthly
    active: bool = True
    created_at: datetime = datetime.utcnow()

class Notification(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    student_id: str
    category: str # appointment, medicine, alert, message, prescription
    title: str
    desc: str
    read: bool = False
    created_at: datetime = datetime.utcnow()
