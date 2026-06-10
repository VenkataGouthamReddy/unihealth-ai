import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["unihealth"]
    
    admin_data = {
        "full_name": "Admin Master",
        "email": "admin@unihealth.ai",
        "hashed_password": pwd_context.hash("admin123"),
        "role": "admin",
        "created_at": "2026-05-09T08:30:00Z"
    }
    
    # Check if admin exists
    existing = await db["users"].find_one({"email": admin_data["email"]})
    if not existing:
        await db["users"].insert_one(admin_data)
        print("Admin user created: admin@unihealth.ai / admin123")
    else:
        print("Admin user already exists.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
