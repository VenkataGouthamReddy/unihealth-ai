import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def remove_sample_doctors():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["unihealth"]

    sample_emails = [
        "sarah.j@unihealth.edu",
        "m.chen@unihealth.edu",
        "e.rodriguez@unihealth.edu",
        "d.smith@unihealth.edu"
    ]

    print(f"Searching for sample doctors: {sample_emails}...")
    sample_docs = await db["users"].find({"email": {"$in": sample_emails}}).to_list(100)
    
    if sample_docs:
        sample_ids = [str(doc["_id"]) for doc in sample_docs]
        print(f"Found {len(sample_docs)} sample doctors: {[d.get('name') or d.get('full_name') for d in sample_docs]}")
        
        # Delete from users
        res_users = await db["users"].delete_many({"email": {"$in": sample_emails}})
        # Delete schedules
        res_sched = await db["doctor_schedules"].delete_many({"doctor_id": {"$in": sample_ids}})
        # Delete appointments
        res_apts = await db["appointments"].delete_many({"doctor_id": {"$in": sample_ids}})
        # Delete prescriptions
        res_pres = await db["prescriptions"].delete_many({"doctor_id": {"$in": sample_ids}})

        print(f"Purged {res_users.deleted_count} sample doctors.")
        print(f"Purged {res_sched.deleted_count} schedules.")
        print(f"Purged {res_apts.deleted_count} appointments.")
        print(f"Purged {res_pres.deleted_count} prescriptions.")
    else:
        print("No sample doctors found in the database.")

    client.close()

if __name__ == "__main__":
    asyncio.run(remove_sample_doctors())
