from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
import ssl
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
            
            print(f"🔄 Connecting to MongoDB Atlas for centralized user database...")
            
            # Try multiple connection approaches
            connection_attempts = [
                {
                    "name": "Standard MongoDB Atlas",
                    "url": mongodb_url,
                    "options": {
                        "serverSelectionTimeoutMS": 5000,
                        "connectTimeoutMS": 5000,
                        "socketTimeoutMS": 5000,
                        "maxPoolSize": 10,
                        "minPoolSize": 1
                    }
                },
                {
                    "name": "With explicit TLS",
                    "url": mongodb_url.replace("ssl=true", "tls=true"),
                    "options": {
                        "tls": True,
                        "serverSelectionTimeoutMS": 5000,
                        "connectTimeoutMS": 5000,
                        "socketTimeoutMS": 5000,
                        "maxPoolSize": 5,
                        "minPoolSize": 1
                    }
                },
                {
                    "name": "Relaxed SSL",
                    "url": mongodb_url,
                    "options": {
                        "tls": True,
                        "tlsAllowInvalidCertificates": True,
                        "tlsAllowInvalidHostnames": True,
                        "serverSelectionTimeoutMS": 5000,
                        "connectTimeoutMS": 5000,
                        "socketTimeoutMS": 5000,
                        "maxPoolSize": 5,
                        "minPoolSize": 1
                    }
                }
            ]
            
            for attempt in connection_attempts:
                try:
                    print(f"🔄 Trying {attempt['name']}...")
                    cls.client = AsyncIOMotorClient(attempt["url"], **attempt["options"])
                    print(f"✅ MongoDB client created with {attempt['name']}")
                    break
                except Exception as e:
                    print(f"❌ {attempt['name']} failed: {str(e)[:100]}...")
                    continue
            
            if cls.client is None:
                raise Exception("All MongoDB connection attempts failed")
                
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
    
    @classmethod
    async def test_connection(cls):
        """Test database connection with timeout"""
        try:
            client = cls.get_client()
            
            # Test connection with shorter timeout
            import asyncio
            await asyncio.wait_for(client.admin.command('ping'), timeout=10.0)
            
            # Test database access
            db = cls.get_database()
            collections = await asyncio.wait_for(db.list_collection_names(), timeout=10.0)
            
            return {
                "status": "success",
                "message": "Database connection successful",
                "collections_count": len(collections),
                "collections": collections[:5]  # Show first 5 collections
            }
        except asyncio.TimeoutError:
            return {
                "status": "error", 
                "message": "Database connection timeout (10 seconds)",
                "error_type": "TimeoutError"
            }
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Database connection failed: {str(e)[:200]}...",
                "error_type": type(e).__name__
            }

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
