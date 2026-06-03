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
