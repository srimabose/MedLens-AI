"""
MongoDB-only authentication system for centralized user database
All users stored in MongoDB Atlas - no local fallbacks
"""
from datetime import datetime
from typing import Optional, Dict, Any
from app.database import Database
from app.auth_utils import get_password_hash, verify_password

async def create_mongodb_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
    """Create user in MongoDB Atlas (centralized database)"""
    try:
        print(f"🔄 Creating user in MongoDB Atlas: {email}")
        
        # Get database connection
        db = Database.get_database()
        
        # Test connection first
        await db.command('ping')
        print(f"✅ MongoDB connection verified")
        
        # Check if user already exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user document
        user_doc = {
            "email": email,
            "full_name": full_name,
            "password_hash": get_password_hash(password),
            "provider": "email",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user into MongoDB
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        print(f"✅ User created in MongoDB Atlas: {email}")
        return user_doc
        
    except Exception as e:
        print(f"❌ MongoDB user creation failed: {str(e)}")
        raise Exception(f"Failed to create user in centralized database: {str(e)}")

async def authenticate_mongodb_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user from MongoDB Atlas (centralized database)"""
    try:
        print(f"🔄 Authenticating user from MongoDB Atlas: {email}")
        
        # Get database connection
        db = Database.get_database()
        
        # Test connection first
        await db.command('ping')
        
        # Find user by email
        user = await db.users.find_one({"email": email})
        if not user:
            print(f"❌ User not found in MongoDB: {email}")
            return None
        
        # Verify password
        if not verify_password(password, user["password_hash"]):
            print(f"❌ Invalid password for user: {email}")
            return None
        
        print(f"✅ User authenticated from MongoDB Atlas: {email}")
        return user
        
    except Exception as e:
        print(f"❌ MongoDB authentication failed: {str(e)}")
        raise Exception(f"Failed to authenticate with centralized database: {str(e)}")

async def get_mongodb_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user from MongoDB Atlas (centralized database)"""
    try:
        print(f"🔄 Looking up user in MongoDB Atlas: {email}")
        
        # Get database connection
        db = Database.get_database()
        
        # Test connection first
        await db.command('ping')
        
        # Find user by email
        user = await db.users.find_one({"email": email})
        
        if user:
            print(f"✅ User found in MongoDB Atlas: {email}")
        else:
            print(f"❌ User not found in MongoDB Atlas: {email}")
            
        return user
        
    except Exception as e:
        print(f"❌ MongoDB user lookup failed: {str(e)}")
        raise Exception(f"Failed to lookup user in centralized database: {str(e)}")

async def test_mongodb_connection() -> Dict[str, Any]:
    """Test MongoDB Atlas connection"""
    try:
        print(f"🔄 Testing MongoDB Atlas connection...")
        
        # Get database connection
        db = Database.get_database()
        
        # Test connection
        await db.command('ping')
        
        # Get collection info
        collections = await db.list_collection_names()
        user_count = await db.users.count_documents({})
        
        result = {
            "status": "success",
            "message": "MongoDB Atlas connection successful",
            "collections": collections,
            "user_count": user_count,
            "database_name": db.name
        }
        
        print(f"✅ MongoDB Atlas connection test passed: {user_count} users in database")
        return result
        
    except Exception as e:
        print(f"❌ MongoDB Atlas connection test failed: {str(e)}")
        return {
            "status": "error",
            "message": f"MongoDB Atlas connection failed: {str(e)}",
            "error_type": type(e).__name__
        }