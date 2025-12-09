#!/bin/bash

# MedLens AI Deployment Script
echo "🚀 Starting MedLens AI deployment..."

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY is not set"
    exit 1
fi

if [ -z "$MONGODB_URL" ]; then
    echo "❌ MONGODB_URL is not set"
    exit 1
fi

# Backend deployment
echo "📦 Building backend..."
cd backend
pip install -r requirements.txt

# Frontend deployment
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo "✅ MedLens AI deployment completed successfully!"
echo "🌐 Backend: Ready to serve on port 8000"
echo "🎨 Frontend: Built and ready for static hosting"