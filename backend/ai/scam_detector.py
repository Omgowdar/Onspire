"""
Scam Detector module for GigShield.
Analyzes job postings, offers, and advertisements to assess fraudulent risk,
extract suspicious indicators, and output an actionable warning or guidance.
"""

import json
from .gemini_client import generate_json
from .prompts import SCAM_DETECTOR_SYSTEM, SCAM_DETECTOR_PROMPT_TEMPLATE

def detect_scam(job_post: str) -> str:
    """
    Analyzes a job advertisement or email offer to detect potential scams.
    
    Args:
        job_post (str): The raw text of the job description or offer.
        
    Returns:
        str: A JSON string containing the risk level, suspicious indicators, explanation, and verdict.
    """
    # 1. Validation
    if not isinstance(job_post, str) or not job_post.strip():
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: job_post must be a non-empty string."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        prompt = SCAM_DETECTOR_PROMPT_TEMPLATE.format(job_post=job_post.strip())
        
        analysis_data = generate_json(
            prompt=prompt,
            system_instruction=SCAM_DETECTOR_SYSTEM
        )
        
        response_dict = {
            "status": "success",
            "scam_risk": analysis_data.get("scam_risk", "Low"),
            "suspicious_indicators": analysis_data.get("suspicious_indicators", []),
            "explanation": analysis_data.get("explanation", ""),
            "verdict": analysis_data.get("verdict", "")
        }
        
        return json.dumps(response_dict, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running scam_detector.py test with a suspicious offer...")
    suspicious_job = (
        "URGENT: Home-based Data Entry Clerks Needed immediately!\n"
        "Earn up to $500/day working just 2 hours. No experience required. "
        "All candidates must pay a registration fee of $45 for the training software before starting. "
        "Payment is guaranteed via check. Send your banking details and copy of ID to workathome@gmail.com to apply."
    )
    print("Job posting:")
    print("-" * 40)
    print(suspicious_job)
    print("-" * 40)
    
    res = detect_scam(suspicious_job)
    print(f"Result:\n{res}")
    
    print("\nRunning scam_detector.py test with a standard offer...")
    legit_job = (
        "Local delivery courier wanted for weekend shifts at Sunshine Florists. "
        "Must have own reliable vehicle, valid driver's license, and clean driving record. "
        "Compensation is $18/hour plus tips. Apply in person at 123 Main Street or call 555-0199."
    )
    res_legit = detect_scam(legit_job)
    print(f"Result:\n{res_legit}")
    
    # Test validation error
    print("\nTesting validation with empty string...")
    res_val = detect_scam("")
    print(f"Result:\n{res_val}")
