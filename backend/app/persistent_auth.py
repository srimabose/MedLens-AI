"""
Persistent authentication system that works on Render
Uses MongoDB when available, falls back to simple storage
"""
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.auth_utils import get_password_hash, verify_password, create_access_token

# Try to use MongoDB first, fallback to simple storage
async def create_persistent_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
    """Create user with persistent storage (MongoDB preferred, file fallback)"""
    
    # Try MongoDB first
    try:
        from app.database import Database
        from app.auth_crud import create_user
        from app.auth_models import UserCreate
        
        # Test if database is available
        db = Database.get_database()
        await db.command('ping')  # Test connection
        
        # Use MongoDB
        user_data = UserCreate(
            email=email,
            password=password,
            full_name=full_name
        )
        user = await create_user(user_data)
        print(f"✅ User created in MongoDB: {email}")
        return user
        
    except Exception as e:
        print(f"⚠️ MongoDB unavailable, using file storage: {e}")
        
        # Fallback to file storage
        from app.simple_auth import create_simple_user
        user = create_simple_user(email, password, full_name)
        print(f"✅ User created in file storage: {email}")
        return user

async def authenticate_persistent_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user from persistent storage"""
    
    # Try MongoDB first
    try:
        from app.database import Database
        from app.auth_crud import get_user_by_email
        
        # Test if database is available
        db = Database.get_database()
        await db.command('ping')  # Test connection
        
        # Use MongoDB
        user = await get_user_by_email(email)
        if user and verify_password(password, user["password_hash"]):
            print(f"✅ User authenticated from MongoDB: {email}")
            return user
            
    except Exception as e:
        print(f"⚠️ MongoDB unavailable, checking file storage: {e}")
    
    # Fallback to file storage
    try:
        from app.simple_auth import authenticate_simple_user
        user = authenticate_simple_user(email, password)
        if user:
            print(f"✅ User authenticated from file storage: {email}")
            return user
    except Exception as e:
        print(f"❌ File storage authentication failed: {e}")
    
    return None

async def get_persistent_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user from persistent storage"""
    
    # Try MongoDB first
    try:
        from app.database import Database
        from app.auth_crud import get_user_by_email
        
        # Test if database is available
        db = Database.get_database()
        await db.command('ping')  # Test connection
        
        user = await get_user_by_email(email)
        if user:
            return user
            
    except Exception as e:
        print(f"⚠️ MongoDB unavailable for user lookup: {e}")
    
    # Fallback to file storage
    try:
        from app.simple_auth import get_simple_user_by_email
        return get_simple_user_by_email(email)
    except Exception as e:
        print(f"❌ File storage lookup failed: {e}")
        return None