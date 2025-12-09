"""
Simple file-based authentication system for testing without MongoDB
"""
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.auth_utils import get_password_hash, verify_password, create_access_token

# Simple file-based user storage
USERS_FILE = "users.json"

def load_users() -> Dict[str, Any]:
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_users(users: Dict[str, Any]):
    """Save users to JSON file"""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving users: {e}")

def create_simple_user(email: str, password: str, full_name: str) -> Dict[str, Any]:
    """Create a new user with simple file storage"""
    users = load_users()
    
    # Check if user exists
    if email in users:
        raise ValueError("User with this email already exists")
    
    # Create user
    user_data = {
        "email": email,
        "full_name": full_name,
        "password_hash": get_password_hash(password),
        "provider": "email",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "id": f"user_{len(users) + 1}"
    }
    
    users[email] = user_data
    save_users(users)
    
    return user_data

def authenticate_simple_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with simple file storage"""
    users = load_users()
    
    if email not in users:
        return None
    
    user = users[email]
    if not verify_password(password, user["password_hash"]):
        return None
    
    return user

def get_simple_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email from simple storage"""
    users = load_users()
    return users.get(email)