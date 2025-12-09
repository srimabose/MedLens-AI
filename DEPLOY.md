# Manual Deployment Guide

## Step 1: Deploy Backend (Web Service)

1. **Go to Render Dashboard**: https://render.com/dashboard
2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - **Name**: `medlens-ai-backend`
   - **Environment**: `Python`
   - **Plan**: `Free`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   ```
   GEMINI_API_KEY=AIzaSyAy_r44DMntsrmKzhtgHiLqrSqclZqTOrU
   MONGODB_URL=mongodb+srv://srimabose1309_db_user:srimabose@cluster0.sw09ffl.mongodb.net/?appName=Cluster0
   DATABASE_NAME=medlens_ai
   SECRET_KEY=medlens-ai-secret-key-for-jwt-tokens-change-in-production-2024
   ENVIRONMENT=production
   FRONTEND_URL=https://medlens-ai-frontend.onrender.com
   ```

4. **Deploy** and note your backend URL (e.g., `https://medlens-ai-backend.onrender.com`)

## Step 2: Deploy Frontend (Static Site)

1. **Create Static Site**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - **Name**: `medlens-ai-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

2. **Environment Variables**:
   ```
   VITE_API_URL=https://medlens-ai-backend.onrender.com
   ```
   (Replace with your actual backend URL from Step 1)

3. **Deploy**

## Step 3: Update CORS (if needed)

If you get CORS errors, update the backend environment variable:
```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
```

## URLs:
- **Backend API**: `https://medlens-ai-backend.onrender.com`
- **Frontend App**: `https://medlens-ai-frontend.onrender.com`

## Free Tier Notes:
- Both services sleep after 15 minutes of inactivity
- Takes ~30 seconds to wake up
- 750 hours/month total across both services