from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from routers.auth import get_current_user
from models.domain import MedicalReport
from typing import List
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("", response_model=dict)
async def upload_report(report: MedicalReport, current_user: dict = Depends(get_current_user)):
    report_dict = report.dict(exclude={"id"})
    report_dict["uploaded_at"] = datetime.utcnow()
    
    new_report = await db.db["reports"].insert_one(report_dict)
    
    # Notification to student
    doctor = await db.db["users"].find_one({"_id": ObjectId(report.doctor_id)})
    doctor_name = (doctor.get("name") or doctor.get("full_name")) if doctor else "Campus Doctor"
    
    notification = {
        "student_id": report.student_id,
        "category": "prescription", # Using prescription category icon for simplicity
        "title": "New Medical Report",
        "desc": f"Dr. {doctor_name} has uploaded a new {report.report_type} report.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.db["notifications"].insert_one(notification)
    
    return {"message": "Report uploaded successfully", "id": str(new_report.inserted_id)}

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_reports(student_email: str, current_user: dict = Depends(get_current_user)):
    reports = await db.db["reports"].find({"student_id": student_email}).sort("uploaded_at", -1).to_list(100)
    for rep in reports:
        rep["_id"] = str(rep["_id"])
        
        try:
            doc = await db.db["users"].find_one({"_id": ObjectId(rep["doctor_id"])})
            if doc:
                rep["doctor_name"] = doc.get("name") or doc.get("full_name") or "Campus Specialist"
            else:
                rep["doctor_name"] = "Campus Specialist"
        except:
            rep["doctor_name"] = "Campus Specialist"
            
    return reports

@router.delete("/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    res = await db.db["reports"].delete_one({"_id": ObjectId(report_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}
