"""
MongoDB Atlas Authentication System
Clean implementation using the working MongoDB Atlas connection
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from bson import ObjectId
import asyncio
from app.database import Database
from app.auth_utils import get_password_hash, verify_password, create_access_token

class AtlasAuth:
    """MongoDB Atlas authentication handler"""
    
    @staticmethod
    async def create_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
        """Create a new user in MongoDB Atlas"""
        try:
            print(f"🔄 Creating user in MongoDB Atlas: {email}")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Check if user already exists
            existing_user = await users_collection.find_one({"email": email})
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
            
            # Insert user with timeout
            result = await asyncio.wait_for(
                users_collection.insert_one(user_doc), 
                timeout=30.0
            )
            
            user_doc["_id"] = result.inserted_id
            print(f"✅ User created successfully: {email}")
            
            return user_doc
            
        except asyncio.TimeoutError:
            print(f"❌ User creation timeout for: {email}")
            raise Exception("Database operation timed out. Please try again.")
        except ValueError as e:
            print(f"❌ User creation validation error: {str(e)}")
            raise e
        except Exception as e:
            print(f"❌ User creation failed: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            print(f"🔄 Authenticating user: {email}")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Find user with timeout
            user = await asyncio.wait_for(
                users_collection.find_one({"email": email}), 
                timeout=30.0
            )
            
            if not user:
                print(f"❌ User not found: {email}")
                return None
            
            # Verify password
            if not verify_password(password, user["password_hash"]):
                print(f"❌ Invalid password for user: {email}")
                return None
            
            print(f"✅ User authenticated successfully: {email}")
            return user
            
        except asyncio.TimeoutError:
            print(f"❌ Authentication timeout for: {email}")
            raise Exception("Database operation timed out. Please try again.")
        except Exception as e:
            print(f"❌ Authentication failed: {str(e)}")
            raise Exception(f"Authentication failed: {str(e)}")
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            print(f"🔄 Looking up user: {email}")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Find user with timeout
            user = await asyncio.wait_for(
                users_collection.find_one({"email": email}), 
                timeout=30.0
            )
            
            if user:
                print(f"✅ User found: {email}")
            else:
                print(f"❌ User not found: {email}")
            
            return user
            
        except asyncio.TimeoutError:
            print(f"❌ User lookup timeout for: {email}")
            raise Exception("Database operation timed out. Please try again.")
        except Exception as e:
            print(f"❌ User lookup failed: {str(e)}")
            raise Exception(f"User lookup failed: {str(e)}")
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            print(f"🔄 Looking up user by ID: {user_id}")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Convert string ID to ObjectId
            object_id = ObjectId(user_id)
            
            # Find user with timeout
            user = await asyncio.wait_for(
                users_collection.find_one({"_id": object_id}), 
                timeout=30.0
            )
            
            if user:
                print(f"✅ User found by ID: {user_id}")
            else:
                print(f"❌ User not found by ID: {user_id}")
            
            return user
            
        except asyncio.TimeoutError:
            print(f"❌ User lookup timeout for ID: {user_id}")
            raise Exception("Database operation timed out. Please try again.")
        except Exception as e:
            print(f"❌ User lookup by ID failed: {str(e)}")
            raise Exception(f"User lookup failed: {str(e)}")
    
    @staticmethod
    async def update_user(user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user information"""
        try:
            print(f"🔄 Updating user: {user_id}")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Convert string ID to ObjectId
            object_id = ObjectId(user_id)
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            # Update user with timeout
            result = await asyncio.wait_for(
                users_collection.update_one(
                    {"_id": object_id}, 
                    {"$set": update_data}
                ), 
                timeout=30.0
            )
            
            success = result.modified_count > 0
            if success:
                print(f"✅ User updated successfully: {user_id}")
            else:
                print(f"❌ User update failed: {user_id}")
            
            return success
            
        except asyncio.TimeoutError:
            print(f"❌ User update timeout for: {user_id}")
            raise Exception("Database operation timed out. Please try again.")
        except Exception as e:
            print(f"❌ User update failed: {str(e)}")
            raise Exception(f"User update failed: {str(e)}")
    
    @staticmethod
    async def test_connection() -> Dict[str, Any]:
        """Test MongoDB Atlas connection for authentication"""
        try:
            print("🔄 Testing MongoDB Atlas connection for authentication...")
            
            # Get database connection
            db = Database.get_database()
            users_collection = db.users
            
            # Test basic operations with timeout
            await asyncio.wait_for(db.command('ping'), timeout=30.0)
            user_count = await asyncio.wait_for(users_collection.count_documents({}), timeout=30.0)
            
            result = {
                "status": "success",
                "message": "MongoDB Atlas authentication ready",
                "user_count": user_count,
                "database_name": db.name
            }
            
            print(f"✅ MongoDB Atlas authentication test passed: {user_count} users")
            return result
            
        except asyncio.TimeoutError:
            print("❌ MongoDB Atlas authentication test timeout")
            return {
                "status": "error",
                "message": "Database connection timeout",
                "error_type": "TimeoutError"
            }
        except Exception as e:
            print(f"❌ MongoDB Atlas authentication test failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Authentication test failed: {str(e)}",
                "error_type": type(e).__name__
            }

# Convenience functions for easy import
async def register_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
    """Register a new user"""
    return await AtlasAuth.create_user(email, password, full_name)

async def login_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Login user"""
    return await AtlasAuth.authenticate_user(email, password)

async def get_user(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    return await AtlasAuth.get_user_by_email(email)