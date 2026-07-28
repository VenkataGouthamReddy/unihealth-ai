import sys
sys.path.append('.')
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from core.security import get_password_hash, verify_password
from datetime import datetime
from core.config import settings

async def check():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # 1. Admin account check/creation
    admin = await db["users"].find_one({"email": "admin@unihealth.ai"})
    if not admin:
        print("Creating default admin account...")
        admin_data = {
            "name": "Admin Master",
            "full_name": "Admin Master",
            "email": "admin@unihealth.ai",
            "hashed_password": get_password_hash("admin123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(admin_data)
        print("Admin user created: admin@unihealth.ai / admin123")
    else:
        # Reset admin password to admin123 to guarantee valid login
        await db["users"].update_one(
            {"email": "admin@unihealth.ai"},
            {"$set": {
                "hashed_password": get_password_hash("admin123"),
                "role": "admin"
            }}
        )
        print("Admin user updated & password confirmed: admin@unihealth.ai / admin123")

    users = await db["users"].find({}).to_list(100)
    print(f"\nTotal users in DB: {len(users)}")
    for u in users:
        print(f" - Email: {u.get('email')}, Role: {u.get('role')}, Name: {u.get('name') or u.get('full_name')}")

    client.close()

if __name__ == "__main__":
    asyncio.run(check())
