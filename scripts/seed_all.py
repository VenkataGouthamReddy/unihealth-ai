import sys
sys.path.append('.')
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from core.security import get_password_hash
from core.config import settings

async def seed_all():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    # 1. Clear existing collections
    print("Clearing collections...")
    await db["users"].delete_many({})
    await db["doctor_schedules"].delete_many({})
    await db["appointments"].delete_many({})
    await db["prescriptions"].delete_many({})
    await db["notifications"].delete_many({})
    
    # 2. Seed Users
    print("Seeding users...")
    student_pwd = get_password_hash("student123")
    admin_pwd = get_password_hash("admin123")
    
    # Student
    student = {
        "full_name": "Alex Mercer",
        "name": "Alex Mercer",
        "email": "student@unihealth.edu",
        "role": "student",
        "hashed_password": student_pwd,
        "phone": "+1 555-0199",
        "department": "Bioengineering",
        "roll_number": "BE-2026-089",
        "age": 21,
        "gender": "Male",
        "created_at": datetime.utcnow()
    }
    await db["users"].insert_one(student)
    
    # Admin
    admin = {
        "full_name": "Admin Master",
        "name": "Admin Master",
        "email": "admin@unihealth.ai",
        "role": "admin",
        "hashed_password": admin_pwd,
        "created_at": datetime.utcnow()
    }
    await db["users"].insert_one(admin)
    print("Base users (Student & Admin) seeded successfully.")
    
    print("Seed completed successfully! Admin: admin@unihealth.ai / admin123 | Student: student@unihealth.edu / student123")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all())
