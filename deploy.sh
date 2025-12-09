#!/bin/bash

echo "🚀 MedLens AI Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "render-unified.yaml" ]; then
    echo "❌ Error: render-unified.yaml not found. Please run from project root."
    exit 1
fi

echo "📋 Deployment Options:"
echo "1. Deploy to Render (using render-unified.yaml)"
echo "2. Build locally for testing"
echo "3. Deploy using original render.yaml (separate services)"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔄 Deploying to Render with unified configuration..."
        echo "📝 Instructions:"
        echo "1. Go to https://render.com/dashboard"
        echo "2. Click 'New' -> 'Blueprint'"
        echo "3. Connect your GitHub repository"
        echo "4. Select 'render-unified.yaml' as the blueprint file"
        echo "5. Set the following environment variables:"
        echo "   - GEMINI_API_KEY: Your Gemini API key"
        echo "   - MONGODB_URL: Your MongoDB Atlas connection string"
        echo "   - GOOGLE_CLIENT_ID: (optional) Your Google OAuth client ID"
        echo "   - GOOGLE_CLIENT_SECRET: (optional) Your Google OAuth client secret"
        echo "   - FACEBOOK_CLIENT_ID: (optional) Your Facebook OAuth client ID"
        echo "   - FACEBOOK_CLIENT_SECRET: (optional) Your Facebook OAuth client secret"
        echo "6. Click 'Apply' to deploy"
        echo ""
        echo "🌐 Your app will be available at: https://medlens-ai.onrender.com"
        ;;
    2)
        echo "🏗️ Building locally..."
        chmod +x build-unified.sh
        ./build-unified.sh
        echo "✅ Local build completed!"
        echo "🚀 To test locally:"
        echo "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
        ;;
    3)
        echo "🔄 Using separate services deployment..."
        echo "📝 Instructions:"
        echo "1. Go to https://render.com/dashboard"
        echo "2. Click 'New' -> 'Blueprint'"
        echo "3. Connect your GitHub repository"
        echo "4. Select 'render.yaml' as the blueprint file"
        echo "5. Set environment variables for both services"
        echo "6. Click 'Apply' to deploy"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
echo "🐛 If you encounter issues, check the troubleshooting section in DEPLOYMENT.md"