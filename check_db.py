import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

async def check_db():
    print("Connecting to DB...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collections = await db.list_collection_names()
    print(f"Database: {DATABASE_NAME}")
    print(f"Collections found: {collections}")
    print("-" * 40)
    
    for coll_name in collections:
        count = await db[coll_name].count_documents({})
        print(f"Collection: {coll_name} ({count} documents)")
        
        # Get 2 sample documents
        cursor = db[coll_name].find().limit(2)
        docs = await cursor.to_list(length=2)
        for doc in docs:
            # Convert ObjectId to string for printing
            doc['_id'] = str(doc['_id'])
            print(f"  {doc}")
        print("-" * 40)

if __name__ == "__main__":
    asyncio.run(check_db())
