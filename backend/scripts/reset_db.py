import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def reset_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["unihealth"]
    
    collections = await db.list_collection_names()
    print(f"Current collections: {collections}")
    
    for collection in collections:
        await db[collection].delete_many({})
        print(f"Cleared collection: {collection}")
    
    print("Database reset complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_db())
