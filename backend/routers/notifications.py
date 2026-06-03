from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from models.domain import Notification
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_notifications(student_email: str):
    notifications = await db.db["notifications"].find({"student_id": student_email}).sort("created_at", -1).to_list(100)
    for n in notifications:
        n["_id"] = str(n["_id"])
    return notifications

@router.put("/{notification_id}/read", response_model=dict)
async def mark_notification_read(notification_id: str):
    res = await db.db["notifications"].update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read/{student_email}", response_model=dict)
async def mark_all_read(student_email: str):
    await db.db["notifications"].update_many(
        {"student_id": student_email, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(notification_id: str):
    res = await db.db["notifications"].delete_one({"_id": ObjectId(notification_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}
