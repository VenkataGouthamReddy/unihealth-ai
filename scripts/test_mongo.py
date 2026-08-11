import asyncio
import time
from motor.motor_asyncio import AsyncIOMotorClient

async def test_mongo():
    print("Testing MongoDB...")
    start = time.time()
    try:
        c = AsyncIOMotorClient('mongodb+srv://gouthamgogireddy_db_user:xWkpynwPizeATAOk@cluster0.rnchgmj.mongodb.net/?appName=Cluster0', serverSelectionTimeoutMS=5000)
        res = await c.admin.command('ping')
        print(f"MongoDB Ping Success: {res} in {time.time() - start:.2f}s")
    except Exception as e:
        print(f"MongoDB Failed: {e} in {time.time() - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_mongo())
