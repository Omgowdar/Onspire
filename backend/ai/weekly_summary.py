"""
Weekly Summary module for GigShield.
Analyzes work logs (hours, earnings) to compute totals, averages,
and provides productivity insights and actionable suggestions.
"""

import json
from .gemini_client import generate_json
from .prompts import WEEKLY_SUMMARY_SYSTEM, WEEKLY_SUMMARY_PROMPT_TEMPLATE

def generate_weekly_summary(worker_data) -> str:
    """
    Generates a weekly performance summary based on hours and earnings logs.
    
    Args:
        worker_data (list or dict): Log of daily work activities.
          Example list format: [{'day': 'Monday', 'hours': 8, 'earnings': 150}, ...]
          Example dict format: {'days': [{'day': 'Monday', 'hours': 8, 'earnings': 150}, ...]}
          
    Returns:
        str: A JSON string containing totals, average hourly rate, insights, and suggestions.
    """
    # 1. Normalize input to list of logs
    logs = []
    if isinstance(worker_data, dict):
        for key in ["days", "logs", "entries", "data"]:
            if key in worker_data and isinstance(worker_data[key], list):
                logs = worker_data[key]
                break
        if not logs:
            return json.dumps({
                "status": "error",
                "message": "Input validation failed: worker_data dictionary must contain a list under keys: 'days', 'logs', 'entries', or 'data'."
            }, indent=2)
    elif isinstance(worker_data, list):
        logs = worker_data
    else:
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: worker_data must be a list or a dictionary."
        }, indent=2)
        
    if not logs:
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: worker_data contains no log entries."
        }, indent=2)
        
    # 2. Validate entries
    validated_logs = []
    for idx, entry in enumerate(logs):
        if not isinstance(entry, dict):
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} is not a dictionary."
            }, indent=2)
            
        hours = entry.get("hours")
        earnings = entry.get("earnings")
        
        # Validate hours
        if hours is None:
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} is missing 'hours'."
            }, indent=2)
        try:
            hours = float(hours)
        except (ValueError, TypeError):
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} has invalid 'hours'. Must be a number."
            }, indent=2)
            
        if hours < 0 or hours > 168:
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} has invalid 'hours' ({hours}). Must be between 0 and 168."
            }, indent=2)
            
        # Validate earnings
        if earnings is None:
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} is missing 'earnings'."
            }, indent=2)
        try:
            earnings = float(earnings)
        except (ValueError, TypeError):
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} has invalid 'earnings'. Must be a number."
            }, indent=2)
            
        if earnings < 0:
            return json.dumps({
                "status": "error",
                "message": f"Input validation failed: Log entry at index {idx} has negative 'earnings' ({earnings})."
            }, indent=2)
            
        day_label = entry.get("day", entry.get("date", f"Day {idx + 1}"))
        validated_logs.append({
            "day": day_label,
            "hours": hours,
            "earnings": earnings
        })
        
    # 3. Call API & Handle Errors
    try:
        worker_data_str = json.dumps(validated_logs, indent=2)
        prompt = WEEKLY_SUMMARY_PROMPT_TEMPLATE.format(worker_data_str=worker_data_str)
        
        analysis_data = generate_json(
            prompt=prompt,
            system_instruction=WEEKLY_SUMMARY_SYSTEM
        )
        
        # Calculate local fallback values just in case
        local_total_hours = sum(item["hours"] for item in validated_logs)
        local_total_earnings = sum(item["earnings"] for item in validated_logs)
        local_avg_hourly = (local_total_earnings / local_total_hours) if local_total_hours > 0 else 0.0
        
        response_dict = {
            "status": "success",
            "total_work_hours": analysis_data.get("total_work_hours", local_total_hours),
            "estimated_earnings": analysis_data.get("estimated_earnings", local_total_earnings),
            "average_hourly_income": analysis_data.get("average_hourly_income", local_avg_hourly),
            "productivity_insights": analysis_data.get("productivity_insights", []),
            "suggestions": analysis_data.get("suggestions", [])
        }
        
        return json.dumps(response_dict, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running weekly_summary.py test...")
    sample_data = [
        {"day": "Monday", "hours": 7.5, "earnings": 140.00},
        {"day": "Tuesday", "hours": 8.0, "earnings": 165.50},
        {"day": "Wednesday", "hours": 4.0, "earnings": 75.00},
        {"day": "Thursday", "hours": 9.5, "earnings": 210.00},
        {"day": "Friday", "hours": 8.0, "earnings": 150.00},
        {"day": "Saturday", "hours": 5.0, "earnings": 110.00},
        {"day": "Sunday", "hours": 0.0, "earnings": 0.00}
    ]
    
    res = generate_weekly_summary(sample_data)
    print(f"Result:\n{res}")
    
    # Test validation error
    print("\nTesting validation with negative hours...")
    invalid_data = [{"day": "Monday", "hours": -5, "earnings": 100}]
    res_val = generate_weekly_summary(invalid_data)
    print(f"Result:\n{res_val}")
