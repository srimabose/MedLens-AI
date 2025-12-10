from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from app.config import settings
from app.schemas import ChatRequest, AnalysisResponse, ChatResponse, TranslateRequest
from app.gemini_client import GeminiClient
from app.database import Database
from app import crud
from app.auth_routes import router as auth_router
from app.auth_dependencies import get_current_user

load_dotenv()

app = FastAPI(
    title="MedLens AI API", 
    version="1.0.0",
    description="AI-powered medical report analyzer and health assistant",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

# Backend API only - Frontend will be deployed separately

gemini_client = GeminiClient(api_key=settings.GEMINI_API_KEY)


@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup"""
    print("🔄 Connecting to MongoDB...")
    try:
        Database.get_client()
        print("✅ MongoDB connected successfully!")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    await Database.close()
    print("🔌 MongoDB connection closed")


@app.get("/")
def root():
    return {"message": "MedLens AI API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-12-09",
        "database": "connected",
        "cors_origins": settings.CORS_ORIGINS
    }


@app.post("/test-register")
async def test_register(data: dict):
    """Test endpoint to debug registration issues"""
    try:
        print(f"🔍 Test registration data received: {data}")
        
        # Test bcrypt import and hashing
        from app.auth_utils import get_password_hash, verify_password
        test_password = "testpassword123"
        hashed = get_password_hash(test_password)
        verified = verify_password(test_password, hashed)
        
        # Test database connection
        from app.database import Database
        db_test = await Database.test_connection()
        
        return {
            "status": "success", 
            "received_data": data,
            "bcrypt_test": {
                "hash_created": bool(hashed),
                "verification": verified
            },
            "database_test": db_test,
            "message": "All systems working" if db_test["status"] == "success" else "Database connection failed"
        }
    except Exception as e:
        print(f"❌ Test registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}


@app.post("/simple-register")
async def simple_register(data: dict):
    """Simplified registration endpoint for debugging"""
    try:
        email = data.get("email")
        password = data.get("password") 
        full_name = data.get("full_name")
        
        print(f"🔄 Simple registration for: {email}")
        
        # Import required modules
        from app.database import Database
        from app.auth_utils import get_password_hash, create_access_token
        from datetime import datetime, timedelta
        
        # Get database
        db = Database.get_database()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            return {"status": "error", "message": "User already exists"}
        
        # Hash password
        password_hash = get_password_hash(password)
        
        # Create user document
        user_doc = {
            "email": email,
            "full_name": full_name,
            "password_hash": password_hash,
            "provider": "email",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Create token
        access_token = create_access_token(
            data={"sub": email}, 
            expires_delta=timedelta(minutes=30)
        )
        
        print(f"✅ User created successfully: {email}")
        
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user_doc["_id"]),
                "email": email,
                "full_name": full_name,
                "provider": "email",
                "is_active": True
            }
        }
        
    except Exception as e:
        print(f"❌ Simple registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "details": traceback.format_exc()}


@app.post("/mongodb-register")
async def mongodb_register(data: dict):
    """MongoDB-only registration (centralized database)"""
    try:
        email = data.get("email")
        password = data.get("password") 
        full_name = data.get("full_name")
        
        print(f"🔄 MongoDB registration for: {email}")
        
        # Import MongoDB auth
        from app.mongodb_auth import create_mongodb_user
        from app.auth_utils import create_access_token
        from datetime import timedelta
        
        # Create user in MongoDB Atlas (centralized)
        user = await create_mongodb_user(email, password, full_name)
        
        # Create token
        access_token = create_access_token(
            data={"sub": email}, 
            expires_delta=timedelta(minutes=1440)  # 24 hours
        )
        
        print(f"✅ MongoDB user created successfully: {email}")
        
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": email,
                "full_name": full_name,
                "provider": "email",
                "is_active": True
            },
            "message": "Account created in centralized database"
        }
        
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        print(f"❌ MongoDB registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "details": traceback.format_exc()}


@app.post("/mongodb-login")
async def mongodb_login(data: dict):
    """MongoDB-only login (centralized database)"""
    try:
        email = data.get("email")
        password = data.get("password")
        
        print(f"🔄 MongoDB login for: {email}")
        
        # Import MongoDB auth
        from app.mongodb_auth import authenticate_mongodb_user
        from app.auth_utils import create_access_token
        from datetime import timedelta
        
        # Authenticate user from MongoDB Atlas
        user = await authenticate_mongodb_user(email, password)
        if not user:
            return {"status": "error", "message": "Invalid email or password"}
        
        # Create token
        access_token = create_access_token(
            data={"sub": email}, 
            expires_delta=timedelta(minutes=1440)  # 24 hours
        )
        
        print(f"✅ MongoDB login successful: {email}")
        
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": email,
                "full_name": user["full_name"],
                "provider": "email",
                "is_active": True
            },
            "message": "Login successful from centralized database"
        }
        
    except Exception as e:
        print(f"❌ MongoDB login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e), "details": traceback.format_exc()}


@app.post("/analyze-report")
async def analyze_report(
    file: UploadFile = File(...),
    language: str = Form("en"),
    current_user: dict = Depends(get_current_user)
):
    """Analyze uploaded medical report and save to database"""
    try:
        content = await file.read()
        file_type = file.content_type
        file_size = len(content)
        
        print(f"Analyzing file: {file.filename}, type: {file_type}, size: {file_size} bytes, language: {language}")
        
        # Analyze with Gemini
        result = await gemini_client.analyze_medical_report(content, file_type, language)
        
        # Save to database
        report_id = await crud.create_report(
            filename=file.filename,
            file_type=file_type,
            file_size=file_size,
            language=language,
            analysis_result=result,
            user_id=str(current_user["_id"]) if current_user else None
        )
        
        print(f"✅ Report saved to database with ID: {report_id} for user: {current_user['email'] if current_user else 'anonymous'}")
        
        # Return result with report ID
        return {
            **result,
            "report_id": report_id
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error analyzing report: {error_msg}")
        
        # Handle rate limit errors
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="API rate limit exceeded. Please wait a moment and try again. The free tier has a limit of 20 requests per day."
            )
        
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/analyze-report-no-auth")
async def analyze_report_no_auth(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    """Analyze uploaded medical report without authentication (for testing)"""
    try:
        content = await file.read()
        file_type = file.content_type
        file_size = len(content)
        
        print(f"Analyzing file (no auth): {file.filename}, type: {file_type}, size: {file_size} bytes, language: {language}")
        
        # Analyze with Gemini
        result = await gemini_client.analyze_medical_report(content, file_type, language)
        
        print(f"✅ Analysis completed successfully")
        
        # Return result without saving to database
        return result
    except Exception as e:
        error_msg = str(e)
        print(f"Error analyzing report (no auth): {error_msg}")
        
        # Handle rate limit errors
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="API rate limit exceeded. Please wait a moment and try again. The free tier has a limit of 20 requests per day."
            )
        
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Interactive chat about medical report"""
    try:
        response = await gemini_client.chat_about_report(
            request.message, 
            request.context
        )
        
        # Save chat message to database if report_id is provided
        if hasattr(request, 'report_id') and request.report_id:
            await crud.save_chat_message(
                report_id=request.report_id,
                role="user",
                message=request.message
            )
            await crud.save_chat_message(
                report_id=request.report_id,
                role="ai",
                message=response
            )
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translate-report")
async def translate_report(request: TranslateRequest):
    """Translate analysis results to another language"""
    try:
        translated = await gemini_client.translate_analysis(
            request.result,
            request.target_language
        )
        return translated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports")
async def get_reports(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get user's reports"""
    try:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        user_id = str(current_user["_id"])
        reports = await crud.get_all_reports(user_id=user_id, limit=limit)
        return {"reports": reports, "count": len(reports)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Get reports error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get a specific report by ID"""
    try:
        report = await crud.get_report(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/reports/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a report and its associated data"""
    try:
        # Check if user is authenticated
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Verify the report belongs to the user
        report = await crud.get_report(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Check if report belongs to user (allow deletion if no user_id set for backward compatibility)
        if report.get("user_id") and report.get("user_id") != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized to delete this report")
        
        success = await crud.delete_report(report_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        
        print(f"🗑️ Report deleted: {report_id} by user {current_user.get('email', 'unknown')}")
        return {"message": "Report deleted successfully", "report_id": report_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Delete report error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/{report_id}/chat-history")
async def get_chat_history(report_id: str):
    """Get chat history for a specific report"""
    try:
        messages = await crud.get_chat_history(report_id)
        return {"messages": messages, "count": len(messages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





@app.post("/check-medication-interactions")
async def check_medication_interactions(request: dict):
    """Check for interactions between medications"""
    try:
        medications = request.get("medications", [])
        if len(medications) < 2:
            raise HTTPException(status_code=400, detail="At least 2 medications required")
        
        result = await gemini_client.check_medication_interactions(medications)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-diet-plan")
async def generate_diet_plan(request: dict):
    """Generate personalized diet plan"""
    try:
        result = await gemini_client.generate_diet_plan(
            conditions=request.get("conditions", []),
            diet_type=request.get("dietType", "balanced"),
            cuisine=request.get("cuisine", "indian"),
            language=request.get("language", "en")
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-health-trends")
async def analyze_health_trends(
    files: List[UploadFile] = File(...),
    language: str = Form("en"),
    current_user: dict = Depends(get_current_user)
):
    """Analyze health trends across multiple reports and save to database"""
    try:
        if len(files) < 2:
            raise HTTPException(status_code=400, detail="At least 2 reports required")
        
        reports_data = []
        saved_report_ids = []
        
        # Process and save each individual report
        for file in files:
            content = await file.read()
            file_type = file.content_type
            file_size = len(content)
            
            # Analyze each report
            analysis = await gemini_client.analyze_medical_report(content, file_type, language)
            
            # Save individual report to database
            report_id = await crud.create_report(
                filename=file.filename,
                file_type=file_type,
                file_size=file_size,
                language=language,
                analysis_result=analysis,
                user_id=str(current_user["_id"]) if current_user else None
            )
            
            saved_report_ids.append(report_id)
            reports_data.append({
                "filename": file.filename,
                "analysis": analysis,
                "report_id": report_id
            })
        
        # Analyze trends across all reports
        trends = await gemini_client.analyze_health_trends(reports_data, language)
        
        # Save trends analysis as a special report
        trends_filename = f"Health Trends Analysis - {len(files)} Reports"
        trends_report_id = await crud.create_report(
            filename=trends_filename,
            file_type="application/trends-analysis",
            file_size=0,  # No actual file
            language=language,
            analysis_result={
                "type": "health_trends",
                "trends_data": trends,
                "source_reports": saved_report_ids,
                "report_count": len(files)
            },
            user_id=str(current_user["_id"]) if current_user else None
        )
        
        # Add metadata to trends response
        trends["trends_report_id"] = trends_report_id
        trends["source_report_ids"] = saved_report_ids
        
        print(f"✅ Health trends analysis completed. Trends ID: {trends_report_id}, Source reports: {saved_report_ids}")
        
        return trends
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        # Handle rate limit errors
        if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="API rate limit exceeded. Please wait a moment and try again. The free tier has a limit of 20 requests per day."
            )
        print(f"❌ Health trends analysis error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/check-symptoms")
async def check_symptoms(request: dict):
    """Check symptoms and correlate with report data"""
    try:
        symptoms = request.get("symptoms", "")
        report_id = request.get("reportId")
        language = request.get("language", "en")
        
        if not symptoms:
            raise HTTPException(status_code=400, detail="Symptoms required")
        
        # Get report data if report_id provided
        report_data = None
        if report_id:
            report = await crud.get_report(report_id)
            if report:
                report_data = report.get("analysis_result")
        
        result = await gemini_client.check_symptoms(symptoms, report_data, language)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
