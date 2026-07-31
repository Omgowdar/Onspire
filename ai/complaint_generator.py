"""
Complaint Generator module for GigShield.
Creates a professional, formal complaint letter for gig workers to send to support, clients, or platforms.
"""

import json
from .gemini_client import generate_text
from .prompts import COMPLAINT_PROMPT_TEMPLATE

def generate_complaint(issue_details) -> str:
    """
    Generates a formal complaint letter based on details about an issue.
    
    Args:
        issue_details (str or dict): The description of the issue or a structured dictionary of details.
        
    Returns:
        str: A JSON string containing the status and the formal complaint letter or error details.
    """
    # 1. Validation & Input Formatting
    if not issue_details:
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: issue_details must not be empty."
        }, indent=2)
        
    if isinstance(issue_details, dict):
        # Format key-value pairs cleanly
        lines = []
        for key, val in issue_details.items():
            # Format keys from snake_case or camelCase to title case for cleaner prompt rendering
            clean_key = str(key).replace("_", " ").title()
            lines.append(f"{clean_key}: {val}")
        details_str = "\n".join(lines)
    elif isinstance(issue_details, str):
        if not issue_details.strip():
            return json.dumps({
                "status": "error",
                "message": "Input validation failed: issue_details string must not be empty or whitespace."
            }, indent=2)
        details_str = issue_details.strip()
    else:
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: issue_details must be a string or a dictionary."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        # Format prompt
        prompt = COMPLAINT_PROMPT_TEMPLATE.format(issue_details=details_str)
        
        # Call Gemini (we use plain text generation and wrap the output locally for structural safety)
        letter_text = generate_text(prompt=prompt)
        
        return json.dumps({
            "status": "success",
            "complaint_letter": letter_text.strip()
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running complaint_generator.py test with dictionary...")
    sample_details_dict = {
        "platform_name": "QuickDash Delivery",
        "date_of_incident": "July 28, 2026",
        "order_id": "QD-9821-X",
        "issue": "Completed delivery task successfully, but earnings were withheld. Support agent says customer complained about package condition, but I have photo proof showing it was intact upon delivery.",
        "requested_outcome": "Release the withheld $24.50 payment immediately and clear my record of any complaints."
    }
    
    res_dict = generate_complaint(sample_details_dict)
    print(f"Result:\n{res_dict}")
    
    print("\nRunning complaint_generator.py test with string...")
    sample_details_str = (
        "My account on RideGo was suspended without notice. I have a 4.9 rating and "
        "have done 500 trips. The support says background check failed, but I already submitted it."
    )
    res_str = generate_complaint(sample_details_str)
    print(f"Result:\n{res_str}")
    
    # Test validation error
    print("\nTesting validation with invalid input type...")
    res_val = generate_complaint(12345)
    print(f"Result:\n{res_val}")
