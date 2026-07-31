"""
Burnout Detector module for GigShield.
Analyzes worker workload hours, sleep duration, and self-reported stress level
to assess burnout risk and recommend wellness strategies.
"""

import json
from .gemini_client import generate_json
from .prompts import BURNOUT_SYSTEM, BURNOUT_PROMPT_TEMPLATE

def burnout_analysis(hours_worked, sleep_hours, stress_level) -> str:
    """
    Analyzes stress, sleep, and work hours to determine burnout risk.
    
    Args:
        hours_worked (float or int): Weekly hours worked.
        sleep_hours (float or int): Average daily sleep hours.
        stress_level (int): Self-reported stress level from 1 (lowest) to 10 (highest).
        
    Returns:
        str: A JSON string containing status, burnout risk level, analyses, and suggestions.
    """
    # 1. Validation
    # Validate hours_worked
    try:
        if isinstance(hours_worked, bool):
            raise TypeError
        hours_worked_val = float(hours_worked)
    except (ValueError, TypeError):
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: hours_worked must be a number."
        }, indent=2)
        
    if hours_worked_val < 0 or hours_worked_val > 168:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: hours_worked ({hours_worked}) must be between 0 and 168."
        }, indent=2)
        
    # Validate sleep_hours
    try:
        if isinstance(sleep_hours, bool):
            raise TypeError
        sleep_hours_val = float(sleep_hours)
    except (ValueError, TypeError):
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: sleep_hours must be a number."
        }, indent=2)
        
    if sleep_hours_val < 0 or sleep_hours_val > 24:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: sleep_hours ({sleep_hours}) must be between 0 and 24."
        }, indent=2)
        
    # Validate stress_level
    try:
        if isinstance(stress_level, bool):
            raise TypeError
        stress_float = float(stress_level)
        if not stress_float.is_integer():
            raise ValueError
        stress_level_val = int(stress_float)
    except (ValueError, TypeError):
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: stress_level must be an integer."
        }, indent=2)
        
    if stress_level_val < 1 or stress_level_val > 10:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: stress_level ({stress_level}) must be an integer between 1 and 10."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        prompt = BURNOUT_PROMPT_TEMPLATE.format(
            hours_worked=hours_worked_val,
            sleep_hours=sleep_hours_val,
            stress_level=stress_level_val
        )
        
        analysis_data = generate_json(
            prompt=prompt,
            system_instruction=BURNOUT_SYSTEM
        )
        
        response_dict = {
            "status": "success",
            "burnout_risk": analysis_data.get("burnout_risk", "Moderate"),
            "workload_analysis": analysis_data.get("workload_analysis", ""),
            "sleep_analysis": analysis_data.get("sleep_analysis", ""),
            "health_suggestions": analysis_data.get("health_suggestions", [])
        }
        
        return json.dumps(response_dict, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running burnout_detector.py test with high-risk metrics...")
    res_high = burnout_analysis(hours_worked=65, sleep_hours=4.5, stress_level=9)
    print(f"Result:\n{res_high}")
    
    print("\nRunning burnout_detector.py test with healthy metrics...")
    res_low = burnout_analysis(hours_worked=35, sleep_hours=7.5, stress_level=3)
    print(f"Result:\n{res_low}")
    
    # Test validation error
    print("\nTesting validation with invalid stress level (11)...")
    res_val = burnout_analysis(hours_worked=40, sleep_hours=8, stress_level=11)
    print(f"Result:\n{res_val}")
