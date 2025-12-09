#!/bin/bash

echo "🚀 MedLens AI Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "render-unified.yaml" ]; then
    echo "❌ Error: render-unified.yaml not found. Please run from project root."
    exit 1
fi

echo "📋 Deployment Options:"
echo "1. Deploy to Render FREE TIER (using render.yaml)"
echo "2. Deploy to Render FREE TIER (using render-free.yaml)"
echo "3. Build locally for testing"
echo "4. Manual Web Service setup (FREE)"

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo "🆓 Deploying to Render FREE TIER..."
        echo "📝 Instructions:"
        echo "1. Go to https://render.com/dashboard"
        echo "2. Click 'New' -> 'Blueprint'"
        echo "3. Connect your GitHub repository"
        echo "4. Render will detect 'render.yaml' automatically"
        echo "5. Set the following environment variables:"
        echo "   - GEMINI_API_KEY: AIzaSyAy_r44DMntsrmKzhtgHiLqrSqclZqTOrU"
        echo "   - MONGODB_URL: mongodb+srv://srimabose1309_db_user:srimabose@cluster0.sw09ffl.mongodb.net/?appName=Cluster0"
        echo "6. Click 'Apply' to deploy"
        echo ""
        echo "🌐 Your app will be available at: https://medlens-ai.onrender.com"
        echo "⚠️  Free tier: App sleeps after 15min inactivity, takes ~30s to wake up"
        ;;
    2)
        echo "🆓 Alternative FREE deployment with render-free.yaml..."
        echo "📝 Instructions:"
        echo "1. Go to https://render.com/dashboard"
        echo "2. Click 'New' -> 'Blueprint'"
        echo "3. Connect your GitHub repository"
        echo "4. Select 'render-free.yaml' as the blueprint file"
        echo "5. Set environment variables as above"
        echo "6. Click 'Apply' to deploy"
        ;;
    3)
        echo "🏗️ Building locally..."
        chmod +x build-unified.sh
        ./build-unified.sh
        echo "✅ Local build completed!"
        echo "🚀 To test locally:"
        echo "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
        ;;
    4)
        echo "🆓 Manual FREE Web Service setup..."
        echo "📝 Instructions:"
        echo "1. Go to https://render.com/dashboard"
        echo "2. Click 'New' -> 'Web Service' (NOT Static Site)"
        echo "3. Connect your GitHub repository"
        echo "4. Configure:"
        echo "   - Name: medlens-ai"
        echo "   - Environment: Python"
        echo "   - Plan: FREE"
        echo "   - Build Command: cd backend && pip install -r requirements.txt && cd ../frontend && npm install && npm run build && cp -r dist ../backend/"
        echo "   - Start Command: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port \$PORT"
        echo "5. Add environment variables (GEMINI_API_KEY, MONGODB_URL)"
        echo "6. Click 'Create Web Service'"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1, 2, 3, or 4."
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
echo "🐛 If you encounter issues, check the troubleshooting section in DEPLOYMENT.md"