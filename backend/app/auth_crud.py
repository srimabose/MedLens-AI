from datetime import datetime
from typing import Optional
from bson import ObjectId
from app.database import Database
from app.auth_models import UserCreate, OAuthUserInfo
from app.auth_utils import get_password_hash

async def create_user(user_data: UserCreate) -> dict:
    """Create a new user with email/password"""
    db = Database.get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise ValueError("User with this email already exists")
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": get_password_hash(user_data.password),
        "provider": "email",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc

async def create_oauth_user(oauth_data: OAuthUserInfo) -> dict:
    """Create or update OAuth user"""
    db = Database.get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({
        "$or": [
            {"email": oauth_data.email},
            {"provider_id": oauth_data.provider_id, "provider": oauth_data.provider}
        ]
    })
    
    if existing_user:
        # Update existing user
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "full_name": oauth_data.full_name,
                    "avatar_url": oauth_data.avatar_url,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return existing_user
    
    # Create new OAuth user
    user_doc = {
        "email": oauth_data.email,
        "full_name": oauth_data.full_name,
        "provider": oauth_data.provider,
        "provider_id": oauth_data.provider_id,
        "avatar_url": oauth_data.avatar_url,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    db = Database.get_database()
    return await db.users.find_one({"email": email})

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    db = Database.get_database()
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        return None

async def update_user_last_login(user_id: str):
    """Update user's last login timestamp"""
    db = Database.get_database()
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_login": datetime.utcnow()}}
    )