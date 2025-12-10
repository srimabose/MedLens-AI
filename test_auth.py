#!/usr/bin/env python3
"""
Test script to verify MongoDB authentication is working
"""
import requests
import json

# Test the deployed backend
API_URL = "https://medlens-ai-aah4.onrender.com"

def test_health():
    """Test API health"""
    print("🔄 Testing API health...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_mongodb_register():
    """Test MongoDB registration"""
    print("\n🔄 Testing MongoDB registration...")
    
    test_user = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    response = requests.post(f"{API_URL}/mongodb-register", json=test_user)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200 and response.json().get("status") == "success"

def test_mongodb_login():
    """Test MongoDB login"""
    print("\n🔄 Testing MongoDB login...")
    
    login_data = {
        "email": "testuser@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{API_URL}/mongodb-login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200 and response.json().get("status") == "success"

def main():
    print("🧪 Testing MedLens AI Authentication System")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("❌ Health check failed!")
        return
    
    # Test registration
    if test_mongodb_register():
        print("✅ Registration successful!")
        
        # Test login
        if test_mongodb_login():
            print("✅ Login successful!")
            print("\n🎉 All tests passed! Authentication system is working.")
        else:
            print("❌ Login failed!")
    else:
        print("❌ Registration failed!")

if __name__ == "__main__":
    main()