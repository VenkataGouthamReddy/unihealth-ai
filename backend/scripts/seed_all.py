import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_all():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["unihealth"]
    
    # 1. Clear existing collections
    print("Clearing collections...")
    await db["users"].delete_many({})
    await db["doctor_schedules"].delete_many({})
    await db["appointments"].delete_many({})
    await db["prescriptions"].delete_many({})
    await db["notifications"].delete_many({})
    
    # 2. Seed Users
    print("Seeding users...")
    hashed_pwd = pwd_context.hash("doctor123")
    student_pwd = pwd_context.hash("student123")
    admin_pwd = pwd_context.hash("admin123")
    
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
    
    # Doctors
    docs_data = [
        {"name": "Dr. Sarah Johnson", "full_name": "Dr. Sarah Johnson", "email": "sarah.j@unihealth.edu", "role": "doctor", "specialization": "Cardiologist", "experience_years": 12, "consultation_fee": 75.0, "hashed_password": hashed_pwd},
        {"name": "Dr. Michael Chen", "full_name": "Dr. Michael Chen", "email": "m.chen@unihealth.edu", "role": "doctor", "specialization": "Neurologist", "experience_years": 8, "consultation_fee": 90.0, "hashed_password": hashed_pwd},
        {"name": "Dr. Emily Rodriguez", "full_name": "Dr. Emily Rodriguez", "email": "e.rodriguez@unihealth.edu", "role": "doctor", "specialization": "Dermatologist", "experience_years": 15, "consultation_fee": 80.0, "hashed_password": hashed_pwd},
        {"name": "Dr. David Smith", "full_name": "Dr. David Smith", "email": "d.smith@unihealth.edu", "role": "doctor", "specialization": "General Physician", "experience_years": 10, "consultation_fee": 50.0, "hashed_password": hashed_pwd}
    ]
    
    doctor_ids = {}
    for doc in docs_data:
        doc["created_at"] = datetime.utcnow()
        res = await db["users"].insert_one(doc)
        doctor_ids[doc["email"]] = str(res.inserted_id)
        
    print(f"Users seeded. Doctor emails mapped: {list(doctor_ids.keys())}")
    
    # 3. Seed Doctor Schedules
    print("Seeding doctor schedules...")
    default_avail = {
        "Monday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Tuesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Wednesday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Thursday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Friday": {"active": True, "slots": [{"start": "09:00", "end": "13:00"}, {"start": "15:00", "end": "18:00"}]},
        "Saturday": {"active": False, "slots": []},
        "Sunday": {"active": False, "slots": []}
    }
    
    default_breaks = {
        "Monday": [{"start": "13:00", "end": "15:00"}],
        "Tuesday": [{"start": "13:00", "end": "15:00"}],
        "Wednesday": [{"start": "13:00", "end": "15:00"}],
        "Thursday": [{"start": "13:00", "end": "15:00"}],
        "Friday": [{"start": "13:00", "end": "15:00"}],
        "Saturday": [],
        "Sunday": []
    }
    
    for email, doc_id in doctor_ids.items():
        schedule = {
            "doctor_id": doc_id,
            "availability": default_avail,
            "custom_dates": {},
            "breaks": default_breaks,
            "settings": {
                "slot_duration": 15,
                "max_patients_per_slot": 1,
                "max_patients_per_day": 10
            },
            "updated_at": datetime.utcnow()
        }
        await db["doctor_schedules"].insert_one(schedule)
        
    print("Doctor schedules seeded.")
    
    # 4. Seed a Sample Upcoming Appointment
    print("Seeding a sample appointment...")
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    apt = {
        "student_id": "student@unihealth.edu",
        "doctor_id": doctor_ids["d.smith@unihealth.edu"],
        "date": tomorrow,
        "time": "10:30",
        "status": "scheduled",
        "symptoms": "Mild fever, cough, and throat irritation for 2 days.",
        "created_at": datetime.utcnow()
    }
    res_apt = await db["appointments"].insert_one(apt)
    apt_id = str(res_apt.inserted_id)
    
    # Trigger notification
    notif = {
        "student_id": "student@unihealth.edu",
        "category": "appointment",
        "title": "Visit Scheduled",
        "desc": f"Your medical consultation is confirmed with Dr. David Smith for {tomorrow} at 10:30.",
        "read": False,
        "created_at": datetime.utcnow()
    }
    await db["notifications"].insert_one(notif)
    
    # 5. Seed a Past Prescription
    print("Seeding a historical prescription...")
    past_date = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")
    
    # Create past completed appointment
    past_apt = {
        "student_id": "student@unihealth.edu",
        "doctor_id": doctor_ids["d.smith@unihealth.edu"],
        "date": past_date,
        "time": "15:15",
        "status": "completed",
        "symptoms": "Seasonal allergies and sneezing.",
        "created_at": datetime.utcnow() - timedelta(days=5)
    }
    res_past_apt = await db["appointments"].insert_one(past_apt)
    past_apt_id = str(res_past_apt.inserted_id)
    
    prescription = {
        "appointment_id": past_apt_id,
        "doctor_id": doctor_ids["d.smith@unihealth.edu"],
        "student_id": "student@unihealth.edu",
        "medicines": [
            {"name": "Cetirizine 10mg", "dosage": "1 tablet", "frequency": "once daily before bed", "duration": "10 days"},
            {"name": "Fluticasone Nasal Spray", "dosage": "2 sprays per nostril", "frequency": "once daily in the morning", "duration": "14 days"}
        ],
        "notes": "Avoid outdoor pollen exposure. Use air purifier in dorm room.",
        "created_at": datetime.utcnow() - timedelta(days=5)
    }
    await db["prescriptions"].insert_one(prescription)
    
    notif_pres = {
        "student_id": "student@unihealth.edu",
        "category": "prescription",
        "title": "Prescription Issued",
        "desc": "Dr. David Smith has uploaded a new prescription to your Medical Vault.",
        "read": True,
        "created_at": datetime.utcnow() - timedelta(days=5)
    }
    await db["notifications"].insert_one(notif_pres)
    
    print("Seed complete successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all())
