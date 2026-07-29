from fastapi import APIRouter, Depends, HTTPException, status
from database.mongodb import db
from models.user import UserResponse
from routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

async def admin_required(current_user: dict = Depends(get_current_user)):
    # You can hardcode your email here to be the ONLY admin
    # Example: if current_user.get("email") != "your-email@example.com":
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required. Access restricted to system owner."
        )
    return current_user

@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(admin_required)):
    students_count = await db.db["users"].count_documents({"role": "student"})
    doctors_count = await db.db["users"].count_documents({"role": "doctor"})
    appointments_count = await db.db["appointments"].count_documents({})
    
    return {
        "students": students_count,
        "doctors": doctors_count,
        "appointments": appointments_count,
        "revenue": "0" # Placeholder for now
    }

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(admin_required)):
    users = await db.db["users"].find().to_list(1000)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await db.db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User role updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await db.db["users"].delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, status_data: dict, admin: dict = Depends(admin_required)):
    from bson import ObjectId
    status = status_data.get("status")
    result = await db.db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User status updated to {status}"}

@router.get("/appointments")
async def get_all_appointments(admin: dict = Depends(admin_required)):
    appointments = await db.db["appointments"].find().sort("date", -1).to_list(1000)
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
    return appointments

@router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status_data: dict, admin: dict = Depends(admin_required)):
    from bson import ObjectId
    status = status_data.get("status")
    result = await db.db["appointments"].update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": f"Appointment status updated to {status}"}

@router.post("/notify-all")
async def send_global_notification(notification: dict, admin: dict = Depends(admin_required)):
    from datetime import datetime
    title = notification.get("title")
    desc = notification.get("desc")
    
    users = await db.db["users"].find({"role": "student"}).to_list(1000)
    
    notifications = []
    for user in users:
        notifications.append({
            "student_id": user["email"],
            "category": "alert",
            "title": title,
            "desc": desc,
            "read": False,
            "created_at": datetime.utcnow()
        })
        
    if notifications:
        await db.db["notifications"].insert_many(notifications)
        
    return {"message": f"Sent global notification to {len(notifications)} users"}

