from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.auth_utils import verify_token
from app.auth_crud import get_user_by_email
from app.simple_auth import get_simple_user_by_email

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current authenticated user"""
    if not credentials:
        return None
    
    email = verify_token(credentials.credentials)
    if not email:
        return None
    
    # Try MongoDB first, then fallback to file-based storage
    try:
        user = await get_user_by_email(email)
        if user:
            return user
    except:
        pass
    
    # Fallback to file-based storage
    user = get_simple_user_by_email(email)
    return user

async def get_current_user_required(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user (required)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = verify_token(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Try MongoDB first, then fallback to file-based storage
    user = None
    try:
        user = await get_user_by_email(email)
    except:
        pass
    
    if not user:
        # Fallback to file-based storage
        user = get_simple_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user