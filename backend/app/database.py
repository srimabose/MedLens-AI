from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
import ssl
import certifi
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
            print(f"🔗 Using URL: {mongodb_url}")
            
            # Try multiple SSL/TLS approaches to fix Windows SSL issues
            connection_methods = [
                {
                    "name": "Method 1: Disable SSL verification (dev only)",
                    "config": {
                        "tls": True,
                        "tlsAllowInvalidCertificates": True,
                        "tlsAllowInvalidHostnames": True,
                        "tlsInsecure": True,
                        "serverSelectionTimeoutMS": 30000,
                        "connectTimeoutMS": 30000,
                        "socketTimeoutMS": 30000
                    }
                },
                {
                    "name": "Method 2: Custom SSL context with no verification",
                    "config": {
                        "ssl_context": ssl._create_unverified_context(),
                        "serverSelectionTimeoutMS": 30000,
                        "connectTimeoutMS": 30000,
                        "socketTimeoutMS": 30000
                    }
                },
                {
                    "name": "Method 3: Default with certifi CA bundle",
                    "config": {
                        "tlsCAFile": certifi.where(),
                        "serverSelectionTimeoutMS": 30000,
                        "connectTimeoutMS": 30000,
                        "socketTimeoutMS": 30000
                    }
                },
                {
                    "name": "Method 4: Explicit TLS with system certs",
                    "config": {
                        "tls": True,
                        "tlsAllowInvalidHostnames": False,
                        "tlsAllowInvalidCertificates": False,
                        "serverSelectionTimeoutMS": 30000,
                        "connectTimeoutMS": 30000,
                        "socketTimeoutMS": 30000
                    }
                },
                {
                    "name": "Method 5: Minimal configuration",
                    "config": {
                        "serverSelectionTimeoutMS": 30000,
                        "connectTimeoutMS": 30000,
                        "socketTimeoutMS": 30000
                    }
                }
            ]
            
            for method in connection_methods:
                try:
                    print(f"🔄 Trying {method['name']}...")
                    cls.client = AsyncIOMotorClient(mongodb_url, **method['config'])
                    print(f"✅ MongoDB client created with {method['name']}")
                    break
                except Exception as e:
                    print(f"❌ {method['name']} failed: {str(e)[:150]}...")
                    cls.client = None
                    continue
            
            if cls.client is None:
                print("❌ All connection methods failed, using basic client as fallback")
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
    
    @classmethod
    async def test_connection(cls):
        """Test database connection with longer timeout"""
        try:
            client = cls.get_client()
            
            # Test connection with longer timeout for Windows
            import asyncio
            print("🔄 Testing MongoDB ping...")
            await asyncio.wait_for(client.admin.command('ping'), timeout=30.0)
            print("✅ MongoDB ping successful")
            
            # Test database access
            db = cls.get_database()
            print("🔄 Testing database access...")
            collections = await asyncio.wait_for(db.list_collection_names(), timeout=30.0)
            print(f"✅ Database access successful, found {len(collections)} collections")
            
            return {
                "status": "success",
                "message": "Database connection successful",
                "collections_count": len(collections),
                "collections": collections[:5]  # Show first 5 collections
            }
        except asyncio.TimeoutError:
            return {
                "status": "error", 
                "message": "Database connection timeout (30 seconds)",
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
