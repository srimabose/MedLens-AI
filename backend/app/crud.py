from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database import get_reports_collection, get_chat_history_collection, get_users_collection
from app.models import ReportModel, ChatMessageModel


async def create_report(
    filename: str,
    file_type: str,
    file_size: int,
    language: str,
    analysis_result: dict,
    user_id: Optional[str] = None
) -> str:
    """Create a new report in database"""
    reports = get_reports_collection()
    
    report_data = {
        "filename": filename,
        "file_type": file_type,
        "file_size": file_size,
        "language": language,
        "upload_date": datetime.utcnow(),
        "analysis_result": analysis_result,
        "user_id": user_id
    }
    
    result = await reports.insert_one(report_data)
    return str(result.inserted_id)


async def get_report(report_id: str) -> Optional[dict]:
    """Get a report by ID"""
    reports = get_reports_collection()
    
    try:
        report = await reports.find_one({"_id": ObjectId(report_id)})
        if report:
            report["_id"] = str(report["_id"])
        return report
    except Exception:
        return None


async def get_all_reports(user_id: Optional[str] = None, limit: int = 50) -> List[dict]:
    """Get all reports, optionally filtered by user_id"""
    reports = get_reports_collection()
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    cursor = reports.find(query).sort("upload_date", -1).limit(limit)
    reports_list = []
    
    async for report in cursor:
        report["_id"] = str(report["_id"])
        reports_list.append(report)
    
    return reports_list


async def delete_report(report_id: str) -> bool:
    """Delete a report and its associated data"""
    reports = get_reports_collection()
    chat_history = get_chat_history_collection()
    
    try:
        # Get the report first to check if it's a trends analysis
        report = await reports.find_one({"_id": ObjectId(report_id)})
        if not report:
            return False
        
        # If it's a trends analysis, also delete source reports if they exist
        if (report.get("analysis_result", {}).get("type") == "health_trends" and 
            "source_reports" in report.get("analysis_result", {})):
            source_report_ids = report["analysis_result"]["source_reports"]
            for source_id in source_report_ids:
                try:
                    await reports.delete_one({"_id": ObjectId(source_id)})
                    await chat_history.delete_many({"report_id": source_id})
                    print(f"🗑️ Deleted source report: {source_id}")
                except Exception as e:
                    print(f"⚠️ Failed to delete source report {source_id}: {e}")
        
        # Delete the main report
        result = await reports.delete_one({"_id": ObjectId(report_id)})
        
        # Delete associated chat messages
        await chat_history.delete_many({"report_id": report_id})
        
        return result.deleted_count > 0
    except Exception as e:
        print(f"❌ Error deleting report {report_id}: {e}")
        return False


async def save_chat_message(
    report_id: str,
    role: str,
    message: str,
    language: str = "en"
) -> str:
    """Save a chat message"""
    chat_history = get_chat_history_collection()
    
    message_data = {
        "report_id": report_id,
        "role": role,
        "message": message,
        "timestamp": datetime.utcnow(),
        "language": language
    }
    
    result = await chat_history.insert_one(message_data)
    return str(result.inserted_id)


async def get_chat_history(report_id: str) -> List[dict]:
    """Get chat history for a report"""
    chat_history = get_chat_history_collection()
    
    cursor = chat_history.find({"report_id": report_id}).sort("timestamp", 1)
    messages = []
    
    async for message in cursor:
        message["_id"] = str(message["_id"])
        messages.append(message)
    
    return messages


async def update_user_activity(user_id: str):
    """Update user's last active timestamp"""
    users = get_users_collection()
    
    await users.update_one(
        {"user_id": user_id},
        {
            "$set": {"last_active": datetime.utcnow()},
            "$setOnInsert": {"created_at": datetime.utcnow(), "preferences": {}}
        },
        upsert=True
    )
