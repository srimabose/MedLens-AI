from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        if cls.client is None:
            mongodb_url = os.getenv("MONGODB_URL")
            if not mongodb_url:
                raise ValueError("MONGODB_URL not found in environment variables")
            cls.client = AsyncIOMotorClient(mongodb_url)
        return cls.client
    
    @classmethod
    def get_database(cls):
        client = cls.get_client()
        db_name = os.getenv("DATABASE_NAME", "medlens_ai")
        return client[db_name]
    
    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            cls.client = None

# Get database instance
def get_db():
    return Database.get_database()

# Collections
def get_reports_collection():
    db = get_db()
    return db.reports

def get_users_collection():
    db = get_db()
    return db.users

def get_chat_history_collection():
    db = get_db()
    return db.chat_history
