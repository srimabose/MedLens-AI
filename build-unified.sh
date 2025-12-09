#!/bin/bash

echo "🔄 Starting unified build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🏗️ Building frontend..."
npm run build

# Move frontend build to backend directory for serving
echo "📁 Moving frontend build to backend..."
cp -r dist ../backend/

echo "✅ Unified build completed!"