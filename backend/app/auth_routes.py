from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from app.auth_models import UserCreate, UserLogin, Token, UserResponse
from app.auth_crud import create_user, create_oauth_user, get_user_by_email, update_user_last_login
from app.auth_utils import verify_password, create_access_token, create_user_response, ACCESS_TOKEN_EXPIRE_MINUTES
from app.auth_dependencies import get_current_user_required
from app.oauth import GoogleOAuth, FacebookOAuth
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user with email and password"""
    print(f"🔄 Registration attempt for: {user_data.email}")
    try:
        user = await create_user(user_data)
        print(f"✅ User created successfully: {user['email']}")
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        user_response = create_user_response(user)
        print(f"✅ Token created for user: {user['email']}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
    except ValueError as e:
        print(f"❌ Registration failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Unexpected registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login with email and password"""
    user = await get_user_by_email(user_data.email)
    
    if not user or not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    await update_user_last_login(str(user["_id"]))
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    user_response = create_user_response(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user_required)):
    """Get current user information"""
    return create_user_response(current_user)

@router.get("/google")
async def google_login():
    """Redirect to Google OAuth"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.FRONTEND_URL}/auth/google/callback&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    return {"auth_url": google_auth_url}

@router.post("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    try:
        # Exchange code for access token
        access_token = await GoogleOAuth.exchange_code_for_token(code)
        
        # Get user info
        oauth_user = await GoogleOAuth.get_user_info(access_token)
        
        # Create or update user
        user = await create_oauth_user(oauth_user)
        
        # Update last login
        await update_user_last_login(str(user["_id"]))
        
        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        user_response = create_user_response(user)
        
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": user_response
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/facebook")
async def facebook_login():
    """Redirect to Facebook OAuth"""
    facebook_auth_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth?"
        f"client_id={settings.FACEBOOK_CLIENT_ID}&"
        f"redirect_uri={settings.FRONTEND_URL}/auth/facebook/callback&"
        f"scope=email&"
        f"response_type=code"
    )
    return {"auth_url": facebook_auth_url}

@router.post("/facebook/callback")
async def facebook_callback(code: str):
    """Handle Facebook OAuth callback"""
    try:
        # Exchange code for access token
        access_token = await FacebookOAuth.exchange_code_for_token(code)
        
        # Get user info
        oauth_user = await FacebookOAuth.get_user_info(access_token)
        
        # Create or update user
        user = await create_oauth_user(oauth_user)
        
        # Update last login
        await update_user_last_login(str(user["_id"]))
        
        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        user_response = create_user_response(user)
        
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": user_response
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout():
    """Logout user (client should remove token)"""
    return {"message": "Successfully logged out"}