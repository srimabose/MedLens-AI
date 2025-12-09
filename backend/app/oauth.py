import httpx
from typing import Optional
from fastapi import HTTPException
from app.config import settings
from app.auth_models import OAuthUserInfo

class GoogleOAuth:
    @staticmethod
    async def get_user_info(access_token: str) -> OAuthUserInfo:
        """Get user info from Google OAuth"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid Google token")
            
            data = response.json()
            return OAuthUserInfo(
                email=data["email"],
                full_name=data["name"],
                provider="google",
                provider_id=data["id"],
                avatar_url=data.get("picture")
            )

    @staticmethod
    async def exchange_code_for_token(code: str) -> str:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": f"{settings.FRONTEND_URL}/auth/google/callback"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
            data = response.json()
            return data["access_token"]

class FacebookOAuth:
    @staticmethod
    async def get_user_info(access_token: str) -> OAuthUserInfo:
        """Get user info from Facebook OAuth"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={access_token}"
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid Facebook token")
            
            data = response.json()
            return OAuthUserInfo(
                email=data.get("email", ""),
                full_name=data["name"],
                provider="facebook",
                provider_id=data["id"],
                avatar_url=data.get("picture", {}).get("data", {}).get("url")
            )

    @staticmethod
    async def exchange_code_for_token(code: str) -> str:
        """Exchange authorization code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://graph.facebook.com/v18.0/oauth/access_token",
                data={
                    "client_id": settings.FACEBOOK_CLIENT_ID,
                    "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": f"{settings.FRONTEND_URL}/auth/facebook/callback"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
            data = response.json()
            return data["access_token"]