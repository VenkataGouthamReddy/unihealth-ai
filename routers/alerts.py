from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import db
from routers.auth import get_current_user
from models.domain import Alert, Notification
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.post("", response_model=dict)
async def create_alert(alert: Alert, current_user: dict = Depends(get_current_user)):
    alert_dict = alert.dict(exclude={"id"})
    res = await db.db["alerts"].insert_one(alert_dict)
    
    # Trigger notification
    notification = {
        "student_id": alert.student_id,
        "category": "alert",
        "title": "Health Alert Configured",
        "desc": f"Your reminder for '{alert.name}' has been set for {alert.date} at {alert.time}.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db.db["notifications"].insert_one(notification)
    
    return {"message": "Alert created successfully", "id": str(res.inserted_id)}

@router.get("/student/{student_email}", response_model=List[dict])
async def get_student_alerts(student_email: str, current_user: dict = Depends(get_current_user)):
    alerts = await db.db["alerts"].find({"student_id": student_email}).to_list(100)
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
    return alerts

@router.put("/{alert_id}", response_model=dict)
async def update_alert(alert_id: str, alert: Alert, current_user: dict = Depends(get_current_user)):
    alert_dict = alert.dict(exclude={"id"})
    res = await db.db["alerts"].update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": alert_dict}
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert updated successfully"}

@router.delete("/{alert_id}", response_model=dict)
async def delete_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    res = await db.db["alerts"].delete_one({"_id": ObjectId(alert_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted successfully"}
