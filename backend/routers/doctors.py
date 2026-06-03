from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from models.domain import DoctorProfile
from models.user import UserResponse
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from core.security import get_password_hash

router = APIRouter(prefix="/doctors", tags=["doctors"])

# Schedule Pydantic Schemas
class TimeRange(BaseModel):
    start: str  # HH:MM
    end: str    # HH:MM

class DaySchedule(BaseModel):
    active: bool = False
    slots: List[TimeRange] = []

class ScheduleSettings(BaseModel):
    slot_duration: int = 15  # minutes
    max_patients_per_slot: int = 1
    max_patients_per_day: int = 10

class DoctorScheduleSchema(BaseModel):
    availability: Dict[str, DaySchedule]
    custom_dates: Dict[str, bool] = {}
    breaks: Dict[str, List[TimeRange]] = {}
    settings: ScheduleSettings = ScheduleSettings()

DEFAULT_SCHEDULE = {
    "availability": {
        "Monday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Tuesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Wednesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Thursday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Friday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Saturday": {"active": False, "slots": []},
        "Sunday": {"active": False, "slots": []}
    },
    "custom_dates": {},
    "breaks": {
        "Monday": [{"start": "13:00", "end": "15:00"}],
        "Tuesday": [{"start": "13:00", "end": "15:00"}],
        "Wednesday": [{"start": "13:00", "end": "15:00"}],
        "Thursday": [{"start": "13:00", "end": "15:00"}],
        "Friday": [{"start": "13:00", "end": "15:00"}],
        "Saturday": [],
        "Sunday": []
    },
    "settings": {
        "slot_duration": 15,
        "max_patients_per_slot": 1,
        "max_patients_per_day": 10
    }
}

@router.get("/", response_model=List[dict])
async def get_doctors():
    doctors = await db.db["users"].find({"role": "doctor"}).to_list(100)
    for doc in doctors:
        doc["_id"] = str(doc["_id"])
        if "specialization" not in doc:
            doc["specialization"] = "General Physician"
    return doctors

@router.get("/{doctor_id}", response_model=dict)
async def get_doctor(doctor_id: str):
    doctor = await db.db["users"].find_one({"_id": ObjectId(doctor_id), "role": "doctor"})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor["_id"] = str(doctor["_id"])
    return doctor

@router.get("/{doctor_id}/schedule", response_model=dict)
async def get_doctor_schedule(doctor_id: str):
    schedule = await db.db["doctor_schedules"].find_one({"doctor_id": doctor_id})
    if not schedule:
        return DEFAULT_SCHEDULE
    schedule["_id"] = str(schedule["_id"])
    return schedule

@router.put("/{doctor_id}/schedule", response_model=dict)
async def update_doctor_schedule(doctor_id: str, schedule_data: DoctorScheduleSchema):
    doc = schedule_data.dict()
    doc["doctor_id"] = doctor_id
    doc["updated_at"] = datetime.utcnow()
    
    await db.db["doctor_schedules"].update_one(
        {"doctor_id": doctor_id},
        {"$set": doc},
        upsert=True
    )
    return {"message": "Schedule updated successfully", "schedule": doc}

@router.get("/{doctor_id}/slots", response_model=List[dict])
async def get_doctor_slots(doctor_id: str, date: str):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    weekday = dt.strftime("%A")
    
    schedule = await db.db["doctor_schedules"].find_one({"doctor_id": doctor_id})
    if not schedule:
        schedule = DEFAULT_SCHEDULE
        
    availability = schedule.get("availability", {})
    custom_dates = schedule.get("custom_dates", {})
    breaks = schedule.get("breaks", {})
    settings = schedule.get("settings", {})
    
    slot_duration = settings.get("slot_duration", 15)
    max_patients_per_slot = settings.get("max_patients_per_slot", 1)
    max_patients_per_day = settings.get("max_patients_per_day", 10)
    
    # Custom dates overrides
    if date in custom_dates:
        is_available = custom_dates[date]
        if not is_available:
            return []
            
    # Weekday check
    day_avail = availability.get(weekday, {})
    if not day_avail.get("active", False):
        return []
        
    # Get active bookings for this doctor on this day
    total_appointments = await db.db["appointments"].find({
        "doctor_id": doctor_id,
        "date": date,
        "status": {"$ne": "cancelled"}
    }).to_list(100)
    
    day_fully_booked = len(total_appointments) >= max_patients_per_day
    
    slots_list = []
    
    def parse_time(t_str: str) -> int:
        h, m = map(int, t_str.split(":"))
        return h * 60 + m
        
    day_breaks = breaks.get(weekday, [])
    parsed_breaks = []
    for brk in day_breaks:
        parsed_breaks.append((parse_time(brk["start"]), parse_time(brk["end"])))
            
    booking_counts = {}
    for apt in total_appointments:
        t_slot = apt["time"]
        booking_counts[t_slot] = booking_counts.get(t_slot, 0) + 1
        
    avail_ranges = day_avail.get("slots", [])
    for slot_range in avail_ranges:
        start_min = parse_time(slot_range["start"])
        end_min = parse_time(slot_range["end"])
        
        curr = start_min
        while curr + slot_duration <= end_min:
            slot_start = curr
            slot_end = curr + slot_duration
            time_str = f"{slot_start // 60:02d}:{slot_start % 60:02d}"
            
            in_break = False
            for b_start, b_end in parsed_breaks:
                if slot_start < b_end and slot_end > b_start:
                    in_break = True
                    break
                    
            if in_break:
                slots_list.append({
                    "time": time_str,
                    "available": False,
                    "reason": "Break Time"
                })
            elif day_fully_booked:
                slots_list.append({
                    "time": time_str,
                    "available": False,
                    "reason": "Day Fully Booked"
                })
            else:
                booked_count = booking_counts.get(time_str, 0)
                if booked_count >= max_patients_per_slot:
                    slots_list.append({
                        "time": time_str,
                        "available": False,
                        "reason": "Fully Booked"
                    })
                else:
                    slots_list.append({
                        "time": time_str,
                        "available": True,
                        "reason": "Available"
                    })
            curr += slot_duration
            
    return slots_list

@router.post("/seed")
async def seed_doctors():
    hashed_pwd = get_password_hash("doctor123")
    mock_doctors = [
        {"name": "Dr. Sarah Johnson", "email": "sarah.j@unihealth.edu", "role": "doctor", "specialization": "Cardiologist", "hashed_password": hashed_pwd},
        {"name": "Dr. Michael Chen", "email": "m.chen@unihealth.edu", "role": "doctor", "specialization": "Neurologist", "hashed_password": hashed_pwd},
        {"name": "Dr. Emily Rodriguez", "email": "e.rodriguez@unihealth.edu", "role": "doctor", "specialization": "Dermatologist", "hashed_password": hashed_pwd},
        {"name": "Dr. David Smith", "email": "d.smith@unihealth.edu", "role": "doctor", "specialization": "General Physician", "hashed_password": hashed_pwd}
    ]
    
    seeded = 0
    for doc in mock_doctors:
        existing = await db.db["users"].find_one({"email": doc["email"]})
        if not existing:
            await db.db["users"].insert_one(doc)
            seeded += 1
            
    return {"message": f"Mock doctors seeded successfully. Seeded: {seeded} doctors. Password: doctor123"}
