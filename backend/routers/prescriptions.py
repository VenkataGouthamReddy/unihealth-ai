from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from models.domain import Prescription, Notification
from typing import List
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

class PrescriptionCreateSchema(Prescription):
    pass

@router.post("/", response_model=dict)
async def create_prescription(prescription: PrescriptionCreateSchema):
    prescription_dict = prescription.dict(exclude={"id"})
    prescription_dict["created_at"] = datetime.utcnow()
    
    # Save prescription
    new_pres = await db.db["prescriptions"].insert_one(prescription_dict)
    pres_id = str(new_pres.inserted_id)
    
    # Fetch doctor details for notifications
    doctor = await db.db["users"].find_one({"_id": ObjectId(prescription.doctor_id)})
    doctor_name = doctor["name"] if doctor else "Campus Doctor"
    
    # Trigger notification to student
    notification = {
        "student_id": prescription.student_id,
        "category": "prescription",
        "title": "Prescription Issued",
        "desc": f"Dr. {doctor_name} has uploaded a new prescription to your Medical Vault.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.db["notifications"].insert_one(notification)
    
    # Mark the corresponding appointment as completed
    if prescription.appointment_id:
        try:
            await db.db["appointments"].update_one(
                {"_id": ObjectId(prescription.appointment_id)},
                {"$set": {"status": "completed"}}
            )
        except Exception as e:
            print("Failed to auto-complete appointment:", e)
            
    return {"message": "Prescription created successfully", "id": pres_id}

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_prescriptions(student_email: str):
    prescriptions = await db.db["prescriptions"].find({"student_id": student_email}).sort("created_at", -1).to_list(100)
    for pres in prescriptions:
        pres["_id"] = str(pres["_id"])
        
        # Fetch doctor details
        try:
            doc = await db.db["users"].find_one({"_id": ObjectId(pres["doctor_id"])})
            if doc:
                pres["doctor_name"] = doc.get("name", "Campus Specialist")
                pres["doctor_specialization"] = doc.get("specialization", "Specialist")
            else:
                pres["doctor_name"] = "Campus Specialist"
                pres["doctor_specialization"] = "Specialist"
        except:
            pres["doctor_name"] = "Campus Specialist"
            pres["doctor_specialization"] = "Specialist"
            
    return prescriptions

@router.get("/doctor/{doctor_id}", response_model=List[dict])
async def get_doctor_prescriptions(doctor_id: str):
    prescriptions = await db.db["prescriptions"].find({"doctor_id": doctor_id}).sort("created_at", -1).to_list(100)
    for pres in prescriptions:
        pres["_id"] = str(pres["_id"])
        
        # Fetch student details
        student = await db.db["users"].find_one({"email": pres["student_id"]})
        if student:
            pres["student_name"] = student.get("name", pres["student_id"])
        else:
            pres["student_name"] = pres["student_id"]
            
    return prescriptions

@router.get("/{prescription_id}", response_model=dict)
async def get_prescription(prescription_id: str):
    pres = await db.db["prescriptions"].find_one({"_id": ObjectId(prescription_id)})
    if not pres:
        raise HTTPException(status_code=404, detail="Prescription not found")
    pres["_id"] = str(pres["_id"])
    return pres

@router.put("/{prescription_id}", response_model=dict)
async def update_prescription(prescription_id: str, prescription: PrescriptionCreateSchema):
    update_data = prescription.dict(exclude={"id"})
    update_data["updated_at"] = datetime.utcnow()
    
    res = await db.db["prescriptions"].update_one(
        {"_id": ObjectId(prescription_id)},
        {"$set": update_data}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"message": "Prescription updated successfully"}

@router.delete("/{prescription_id}", response_model=dict)
async def delete_prescription(prescription_id: str):
    res = await db.db["prescriptions"].delete_one({"_id": ObjectId(prescription_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"message": "Prescription deleted successfully"}
