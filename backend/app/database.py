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
            
            # Force MongoDB connection - no fallbacks for centralized database
            print(f"🔄 Connecting to MongoDB Atlas for centralized user database...")
            
            # Use the most compatible connection method for Render
            cls.client = AsyncIOMotorClient(
                mongodb_url,
                # Disable SSL verification for Render compatibility
                tls=True,
                tlsAllowInvalidCertificates=True,
                tlsAllowInvalidHostnames=True,
                # Increase timeouts for Render's network
                serverSelectionTimeoutMS=60000,
                connectTimeoutMS=60000,
                socketTimeoutMS=60000,
                # Connection pool settings
                maxPoolSize=10,
                minPoolSize=1,
                # Write concern
                retryWrites=True,
                w='majority'
            )
            
            print(f"✅ MongoDB client created, will test on first use")
                
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
        """Test database connection"""
        try:
            client = cls.get_client()
            # Test connection by pinging the database
            await client.admin.command('ping')
            
            # Test database access
            db = cls.get_database()
            collections = await db.list_collection_names()
            
            return {
                "status": "success",
                "message": "Database connection successful",
                "collections_count": len(collections),
                "collections": collections[:5]  # Show first 5 collections
            }
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Database connection failed: {str(e)}",
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
