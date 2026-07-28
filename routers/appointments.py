from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from models.domain import Appointment
from typing import List
from datetime import datetime, date as date_type
from bson import ObjectId

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("", response_model=dict)
async def book_appointment(appointment: Appointment):
    appointment_dict = appointment.dict(exclude={"id"})
    appointment_dict["created_at"] = datetime.utcnow()
    
    # Lookup and store doctor_name at booking time so it persists in DB
    try:
        doctor = await db.db["users"].find_one({"_id": ObjectId(appointment.doctor_id)})
        if doctor:
            appointment_dict["doctor_name"] = doctor.get("name") or doctor.get("full_name") or "Campus Specialist"
        else:
            appointment_dict["doctor_name"] = "Campus Specialist"
    except Exception:
        appointment_dict["doctor_name"] = "Campus Specialist"
    
    new_apt = await db.db["appointments"].insert_one(appointment_dict)
    
    # Trigger notification
    notification = {
        "student_id": appointment.student_id,
        "category": "appointment",
        "title": "Visit Scheduled",
        "desc": f"Your medical consultation is confirmed for {appointment.date} at {appointment.time}.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.db["notifications"].insert_one(notification)
    
    return {"message": "Appointment booked successfully", "id": str(new_apt.inserted_id)}

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_appointments(student_email: str):
    today = date_type.today()
    appointments = await db.db["appointments"].find({"student_id": student_email}).to_list(100)
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
        
        # If doctor_name not stored, fallback to DB lookup
        if not apt.get("doctor_name"):
            try:
                doctor = await db.db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
                if doctor:
                    apt["doctor_name"] = doctor.get("name") or doctor.get("full_name") or "Campus Specialist"
                else:
                    apt["doctor_name"] = "Campus Specialist"
            except Exception:
                apt["doctor_name"] = "Campus Specialist"
        
        # Auto-detect expired appointments: scheduled status but date has passed
        if apt.get("status") == "scheduled":
            try:
                apt_date = datetime.strptime(apt["date"], "%Y-%m-%d").date()
                if apt_date < today:
                    apt["status"] = "expired"
                    # Also update in DB asynchronously
                    await db.db["appointments"].update_one(
                        {"_id": ObjectId(apt["_id"])},
                        {"$set": {"status": "expired"}}
                    )
            except Exception:
                pass
    
    # Sort: upcoming first, then by date descending
    def sort_key(a):
        order = {"scheduled": 0, "expired": 1, "completed": 2, "cancelled": 3}
        return (order.get(a.get("status", "cancelled"), 4), a.get("date", ""))
    
    appointments.sort(key=sort_key)
    return appointments

@router.get("/doctor/{doctor_id}", response_model=List[dict])
async def get_doctor_appointments(doctor_id: str):
    appointments = await db.db["appointments"].find({"doctor_id": doctor_id}).to_list(100)
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
    return appointments

@router.put("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str):
    # Fetch appointment to get student_id and details
    apt = await db.db["appointments"].find_one({"_id": ObjectId(appointment_id)})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    res = await db.db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    if res.modified_count > 0:
        # Trigger notification
        notification = {
            "student_id": apt["student_id"],
            "category": "appointment",
            "title": "Visit Cancelled",
            "desc": f"Your appointment for {apt['date']} at {apt['time']} has been cancelled.",
            "read": False,
            "created_at": datetime.utcnow()
        }
        await db.db["notifications"].insert_one(notification)
        
    return {"message": "Appointment cancelled successfully"}

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str):
    res = await db.db["appointments"].delete_one({"_id": ObjectId(appointment_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}
