from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from models.domain import Appointment
from typing import List
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("/", response_model=dict)
async def book_appointment(appointment: Appointment):
    appointment_dict = appointment.dict(exclude={"id"})
    appointment_dict["created_at"] = datetime.utcnow()
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
    appointments = await db.db["appointments"].find({"student_id": student_email}).to_list(100)
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
        # Fetch doctor name for convenience
        doctor = await db.db["users"].find_one({"_id": ObjectId(apt["doctor_id"])})
        if doctor:
            apt["doctor_name"] = doctor["name"]
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
