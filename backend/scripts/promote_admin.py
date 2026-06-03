import asyncio
import os
import sys

# Add the parent directory to sys.path so we can import from core/database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongodb import db, connect_to_mongo, close_mongo_connection

async def promote_user(email):
    print(f"Connecting to database to promote {email}...")
    await connect_to_mongo()
    try:
        result = await db.db["users"].update_one(
            {"email": email},
            {"$set": {"role": "admin"}}
        )
        if result.modified_count:
            print(f"✅ SUCCESS: {email} is now an Admin.")
        else:
            user = await db.db["users"].find_one({"email": email})
            if user:
                print(f"ℹ️ {email} is already an Admin.")
            else:
                print(f"❌ ERROR: User with email {email} not found.")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/promote_admin.py <email>")
    else:
        asyncio.run(promote_user(sys.argv[1]))
